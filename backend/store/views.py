# store/views.py
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from rest_framework import generics, filters, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.conf import settings
from django.contrib.auth.hashers import check_password
from django.middleware.csrf import get_token
from django.db import models
from django.db.models import Q
from .models import Product, Purchase, Wishlist, Cart, Order, ShippingDestination, Category, Brand
from .serializers import (
    ProductSerializer,
    PurchaseSerializer,
    OrderSerializer,
    ShippingDestinationSerializer,
    UserLoginSerializer,
    UserRegisterSerializer,
)
from .utils_delivery import haversine_km, estimate_eta_minutes, update_status_from_elapsed
from django.utils import timezone
from datetime import datetime, timedelta
import uuid
import json
import jwt

# ============================================================
# JWT HELPER FUNCTIONS
# ============================================================

def generate_jwt_token(user):
    """Generate JWT token for user"""
    payload = {
        'id': user.id,
        'email': user.email,
        'username': user.username,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')


def decode_jwt_token(token):
    """Decode JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def get_user_from_token(request):
    """Helper to get user from JWT token in request"""
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        payload = decode_jwt_token(token)
        if payload:
            try:
                return User.objects.get(id=payload['id'])
            except User.DoesNotExist:
                return None
    return None


# ============================================================
# JWT AUTHENTICATION MIDDLEWARE
# ============================================================

class JWTAuthenticationMiddleware:
    """Middleware to authenticate users using JWT token"""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            payload = decode_jwt_token(token)
            if payload:
                try:
                    user = User.objects.get(id=payload['id'])
                    request.user = user
                    request._jwt_authenticated = True
                except User.DoesNotExist:
                    pass
        return self.get_response(request)


# ============================================================
# AUTH VIEWS - UPDATED WITH JWT
# ============================================================

@csrf_exempt
@require_http_methods(["POST"])
def register_view(request):
    """Register a new user - returns token for auto-login"""
    try:
        data = json.loads(request.body)
        
        # Check if user exists
        email = data.get('email')
        if User.objects.filter(email=email).exists():
            return JsonResponse({'email': ['A user with this email already exists.']}, status=400)
        
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        
        if password != confirm_password:
            return JsonResponse({'non_field_errors': ['Passwords do not match.']}, status=400)
        
        if len(password) < 6:
            return JsonResponse({'password': ['Password must be at least 6 characters.']}, status=400)
        
        # Split name
        name = data.get('name', '')
        name_parts = name.split()
        first_name = name_parts[0] if name_parts else ''
        last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
        
        # Create user
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        
        # Generate JWT token
        token = generate_jwt_token(user)
        
        return JsonResponse({
            'detail': 'User registered successfully.',
            'token': token,
            'email': user.email,
            'name': user.first_name or user.username,
            'id': user.id,
            'username': user.username,
        }, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    """Login user - returns JWT token"""
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return JsonResponse({'detail': 'Email and password are required.'}, status=400)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({'detail': 'Invalid credentials.'}, status=401)
        
        # Check password
        if not check_password(password, user.password):
            return JsonResponse({'detail': 'Invalid credentials.'}, status=401)
        
        # Login the user for session
        login(request, user)
        
        # Generate JWT token
        token = generate_jwt_token(user)
        
        return JsonResponse({
            'detail': 'Login successful.',
            'token': token,
            'email': user.email,
            'name': user.first_name or user.username,
            'id': user.id,
            'username': user.username,
        }, status=200)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_csrf_token_view(request):
    """Get CSRF token - for frontend"""
    return JsonResponse({'csrfToken': get_token(request)})


@csrf_exempt
@require_http_methods(["POST"])
def logout_view(request):
    """Logout user"""
    return JsonResponse({'detail': 'Logged out successfully.'}, status=200)


@csrf_exempt
@require_http_methods(["GET"])
def get_current_user_view(request):
    """Get current authenticated user"""
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'No token provided or invalid'}, status=401)
    
    return JsonResponse({
        'id': user.id,
        'email': user.email,
        'name': user.first_name or user.username,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
    })


# ============================================================
# PRODUCT VIEWS - UPDATED TO USE CORRECT FIELDS
# ============================================================

class ProductListCreateAPIView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "slug", "description"]
    ordering_fields = ["price", "name", "id", "rating"]


class ProductRetrieveAPIView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


# ============================================================
# CATEGORY VIEWS
# ============================================================

@csrf_exempt
@require_http_methods(["GET"])
def get_categories_view(request):
    """Get all categories"""
    try:
        # Try to get from database first
        try:
            categories = Category.objects.all().order_by('name')
            data = []
            for cat in categories:
                data.append({
                    'id': cat.id,
                    'name': cat.name,
                    'slug': cat.slug,
                    'parent_id': cat.parent_id,
                    'level': cat.level,
                    'children': [],
                })
            return JsonResponse(data, safe=False)
        except:
            # Fallback to default categories
            default_categories = [
                {'id': 1, 'name': 'Electronics', 'slug': 'electronics', 'parent_id': None, 'level': 1, 'children': []},
                {'id': 2, 'name': 'Fashion', 'slug': 'fashion', 'parent_id': None, 'level': 1, 'children': []},
                {'id': 3, 'name': 'Home & Kitchen', 'slug': 'home-kitchen', 'parent_id': None, 'level': 1, 'children': []},
                {'id': 4, 'name': 'Books', 'slug': 'books', 'parent_id': None, 'level': 1, 'children': []},
                {'id': 5, 'name': 'Accessories', 'slug': 'accessories', 'parent_id': None, 'level': 1, 'children': []},
                {'id': 6, 'name': 'Sports', 'slug': 'sports', 'parent_id': None, 'level': 1, 'children': []},
            ]
            return JsonResponse(default_categories, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_category_detail_view(request, slug):
    """Get category by slug"""
    try:
        category = Category.objects.get(slug=slug)
        data = {
            'id': category.id,
            'name': category.name,
            'slug': category.slug,
            'parent_id': category.parent_id,
            'level': category.level,
        }
        return JsonResponse(data)
    except Category.DoesNotExist:
        return JsonResponse({'error': 'Category not found'}, status=404)


# ============================================================
# BRAND VIEWS
# ============================================================

@csrf_exempt
@require_http_methods(["GET"])
def get_brands_view(request):
    """Get all brands"""
    try:
        # Try to get from database first
        try:
            brands = Brand.objects.all().order_by('name')
            data = []
            for brand in brands:
                data.append({
                    'id': brand.id,
                    'name': brand.name,
                    'slug': brand.slug,
                    'logo': brand.logo if hasattr(brand, 'logo') else None,
                })
            return JsonResponse(data, safe=False)
        except:
            # Fallback to default brands
            default_brands = [
                {'id': 1, 'name': 'Nike', 'slug': 'nike'},
                {'id': 2, 'name': 'Adidas', 'slug': 'adidas'},
                {'id': 3, 'name': 'Apple', 'slug': 'apple'},
                {'id': 4, 'name': 'Samsung', 'slug': 'samsung'},
                {'id': 5, 'name': 'Sony', 'slug': 'sony'},
                {'id': 6, 'name': 'Puma', 'slug': 'puma'},
                {'id': 7, 'name': "Levi's", 'slug': 'levis'},
                {'id': 8, 'name': 'Zara', 'slug': 'zara'},
                {'id': 9, 'name': 'H&M', 'slug': 'hm'},
                {'id': 10, 'name': 'Rolex', 'slug': 'rolex'},
            ]
            return JsonResponse(default_brands, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_brand_detail_view(request, slug):
    """Get brand by slug"""
    try:
        brand = Brand.objects.get(slug=slug)
        data = {
            'id': brand.id,
            'name': brand.name,
            'slug': brand.slug,
            'logo': brand.logo if hasattr(brand, 'logo') else None,
        }
        return JsonResponse(data)
    except Brand.DoesNotExist:
        return JsonResponse({'error': 'Brand not found'}, status=404)


# ============================================================
# PURCHASE/ORDER VIEWS
# ============================================================

class PurchaseListCreateAPIView(generics.ListCreateAPIView):
    queryset = Purchase.objects.all().order_by("-purchased_at")
    serializer_class = PurchaseSerializer


@csrf_exempt
@require_http_methods(["POST"])
def create_order_view(request):
    """Create a delivery order from frontend-provided coordinates."""
    try:
        data = json.loads(request.body)
        product_id = data.get("product_id") or data.get("product")
        email = data.get("email")
        quantity = int(data.get("quantity") or 1)
        user_id = data.get("user_id")

        delivery_lat = data.get("delivery_lat")
        delivery_lng = data.get("delivery_lng")
        source_lat = data.get("source_lat")
        source_lng = data.get("source_lng")

        if product_id is None or not email:
            return JsonResponse({"detail": "product and email are required"}, status=400)

        # Get product
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return JsonResponse({"detail": "Product not found"}, status=404)

        # Get user if provided
        user = None
        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                pass

        # Compute distance/eta if coords provided
        distance_km = None
        eta_minutes = None
        if delivery_lat is not None and delivery_lng is not None and source_lat is not None and source_lng is not None:
            distance_km = haversine_km(float(source_lat), float(source_lng), float(delivery_lat), float(delivery_lng))
            eta_minutes = estimate_eta_minutes(distance_km)

        purchased_at = timezone.now()
        delivery_status = "Preparing"
        order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"

        # Create purchase
        purchase = Purchase.objects.create(
            product_id=product_id,
            user=user,
            email=email,
            quantity=quantity,
            order_id=order_id,
            customer_name=data.get("customer_name") or data.get("name"),
            phone=data.get("phone"),
            source_address=data.get("source_address"),
            destination_address=data.get("destination_address") or data.get("address"),
            delivery_lat=delivery_lat,
            delivery_lng=delivery_lng,
            source_lat=source_lat,
            source_lng=source_lng,
            distance_km=distance_km,
            eta_minutes=eta_minutes,
            delivery_status=delivery_status,
            status_updated_at=purchased_at,
            payment_method=data.get("payment_method", "razorpay"),
        )

        # Also create an Order record if Order model exists
        try:
            Order.objects.create(
                order_id=order_id,
                user=user,
                product=product,
                product_name=product.name,
                product_price=product.price,
                product_img=product.img,
                product_brand=product.name,  # Using name as brand since we don't have brand field
                quantity=quantity,
                total_amount=product.price * quantity,
                status='pending',
                payment_method=data.get("payment_method", "razorpay"),
                shipping_name=data.get("customer_name") or data.get("name", ""),
                shipping_email=email,
                shipping_phone=data.get("phone", ""),
                shipping_address=data.get("destination_address") or data.get("address", ""),
                shipping_zip=data.get("zip") or data.get("zip_code", ""),
                shipping_lat=delivery_lat,
                shipping_lng=delivery_lng,
            )
        except Exception as e:
            # Order model might not exist or have different fields
            pass

        # Clear cart if user is logged in
        if user:
            Cart.objects.filter(user=user).delete()

        serializer = PurchaseSerializer(purchase)
        return JsonResponse({
            **serializer.data,
            'order_id': order_id,
            'message': 'Order created successfully'
        }, status=201)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


class PurchaseByEmailAPIView(generics.ListAPIView):
    serializer_class = PurchaseSerializer

    def get_queryset(self):
        email = self.request.query_params.get("email")
        qs = Purchase.objects.all().order_by("-purchased_at")
        if email:
            qs = qs.filter(email=email)
        return qs

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        for item in response.data:
            purchased_at = item.get("purchased_at")
            eta_minutes = item.get("eta_minutes")
            if purchased_at:
                purchased_dt = datetime.fromisoformat(purchased_at.replace("Z", "+00:00"))
                status_val = update_status_from_elapsed(purchased_dt, eta_minutes)
                item["delivery_status"] = status_val
                if status_val == Purchase.STATUS_DELIVERED:
                    item.setdefault("delivered_at", purchased_at)
        return response


# ============================================================
# WISHLIST VIEWS
# ============================================================

@csrf_exempt
@require_http_methods(["GET"])
def get_wishlist_view(request):
    """Get user's wishlist from database"""
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'User not authenticated'}, status=401)
    
    request.user = user
    wishlist_items = Wishlist.objects.filter(user=user).select_related('product')
    data = []
    for item in wishlist_items:
        data.append({
            'id': item.product.id,
            'name': item.product.name,
            'slug': item.product.slug,
            'brand_id': item.product.brand_id,
            'category_id': item.product.category_id,
            'price': float(item.product.price),
            'img': item.product.img,
            'description': item.product.description,
        })
    return JsonResponse({'wishlist': data})


@csrf_exempt
@require_http_methods(["POST"])
def toggle_wishlist_view(request):
    """Add or remove from wishlist - stored in database"""
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'User not authenticated. Please login first.'}, status=401)
    
    request.user = user
    
    try:
        data = json.loads(request.body)
        product_id = data.get('product_id')
        
        if not product_id:
            return JsonResponse({'error': 'product_id is required'}, status=400)
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return JsonResponse({'error': 'Product not found'}, status=404)
        
        wishlist_item = Wishlist.objects.filter(user=user, product=product)
        
        if wishlist_item.exists():
            wishlist_item.delete()
            return JsonResponse({
                'status': 'removed', 
                'message': 'Removed from wishlist',
                'wishlist': list(Wishlist.objects.filter(user=user).values_list('product_id', flat=True))
            })
        else:
            Wishlist.objects.create(user=user, product=product)
            return JsonResponse({
                'status': 'added', 
                'message': 'Added to wishlist',
                'wishlist': list(Wishlist.objects.filter(user=user).values_list('product_id', flat=True))
            })
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


# ============================================================
# CART VIEWS
# ============================================================

@csrf_exempt
@require_http_methods(["GET"])
def get_cart_view(request):
    """Get user's cart from database"""
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'User not authenticated'}, status=401)
    
    request.user = user
    cart_items = Cart.objects.filter(user=user).select_related('product')
    data = []
    for item in cart_items:
        data.append({
            'product_id': item.product.id,
            'name': item.product.name,
            'brand_id': item.product.brand_id,
            'category_id': item.product.category_id,
            'price': float(item.product.price),
            'img': item.product.img,
            'description': item.product.description,
            'quantity': item.quantity,
            'subtotal': float(item.product.price * item.quantity),
        })
    return JsonResponse({'cart': data})


@csrf_exempt
@require_http_methods(["POST"])
def add_to_cart_view(request):
    """Add item to cart - stored in database"""
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'User not authenticated'}, status=401)
    
    request.user = user
    
    try:
        data = json.loads(request.body)
        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)
        
        if not product_id:
            return JsonResponse({'error': 'product_id is required'}, status=400)
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return JsonResponse({'error': 'Product not found'}, status=404)
        
        cart_item, created = Cart.objects.get_or_create(
            user=user,
            product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        # Get updated cart
        cart_items = Cart.objects.filter(user=user)
        cart_data = []
        for item in cart_items:
            cart_data.append({
                'product_id': item.product.id,
                'quantity': item.quantity,
            })
        
        return JsonResponse({
            'status': 'success', 
            'message': 'Added to cart',
            'cart': cart_data
        })
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def remove_from_cart_view(request):
    """Remove item from cart - stored in database"""
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'User not authenticated'}, status=401)
    
    request.user = user
    
    try:
        data = json.loads(request.body)
        product_id = data.get('product_id')
        
        if not product_id:
            return JsonResponse({'error': 'product_id is required'}, status=400)
        
        Cart.objects.filter(user=user, product_id=product_id).delete()
        
        # Get updated cart
        cart_items = Cart.objects.filter(user=user)
        cart_data = []
        for item in cart_items:
            cart_data.append({
                'product_id': item.product.id,
                'quantity': item.quantity,
            })
        
        return JsonResponse({
            'status': 'success', 
            'message': 'Removed from cart',
            'cart': cart_data
        })
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def update_cart_quantity_view(request):
    """Update cart item quantity - stored in database"""
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'User not authenticated'}, status=401)
    
    request.user = user
    
    try:
        data = json.loads(request.body)
        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)
        
        if not product_id:
            return JsonResponse({'error': 'product_id is required'}, status=400)
        
        try:
            cart_item = Cart.objects.get(user=user, product_id=product_id)
            if quantity <= 0:
                cart_item.delete()
                status_msg = 'removed'
            else:
                cart_item.quantity = quantity
                cart_item.save()
                status_msg = 'updated'
            
            # Get updated cart
            cart_items = Cart.objects.filter(user=user)
            cart_data = []
            for item in cart_items:
                cart_data.append({
                    'product_id': item.product.id,
                    'quantity': item.quantity,
                })
            
            return JsonResponse({
                'status': status_msg, 
                'quantity': quantity,
                'cart': cart_data
            })
        except Cart.DoesNotExist:
            return JsonResponse({'error': 'Item not in cart'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


# ============================================================
# SHIPPING DESTINATION VIEWS
# ============================================================

@csrf_exempt
@require_http_methods(["GET"])
def get_shipping_destinations_view(request):
    """Get user's saved shipping addresses"""
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'User not authenticated'}, status=401)
    
    request.user = user
    destinations = ShippingDestination.objects.filter(user=user)
    data = []
    for dest in destinations:
        data.append({
            'id': dest.id,
            'name': dest.name,
            'email': dest.email,
            'phone': dest.phone,
            'address': dest.address,
            'zip_code': dest.zip_code,
            'lat': float(dest.lat) if dest.lat else None,
            'lng': float(dest.lng) if dest.lng else None,
            'is_default': dest.is_default,
            'created_at': dest.created_at,
        })
    return JsonResponse({'destinations': data})


@csrf_exempt
@require_http_methods(["POST"])
def add_shipping_destination_view(request):
    """Add a new shipping address"""
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'User not authenticated'}, status=401)
    
    request.user = user
    
    try:
        data = json.loads(request.body)
        
        # If this is set as default, unset other defaults
        if data.get('is_default', False):
            ShippingDestination.objects.filter(user=user, is_default=True).update(is_default=False)
        
        destination = ShippingDestination.objects.create(
            user=user,
            name=data.get('name', ''),
            email=data.get('email', ''),
            phone=data.get('phone', ''),
            address=data.get('address', ''),
            zip_code=data.get('zip_code', ''),
            lat=data.get('lat'),
            lng=data.get('lng'),
            is_default=data.get('is_default', False),
        )
        
        return JsonResponse({
            'id': destination.id,
            'name': destination.name,
            'email': destination.email,
            'phone': destination.phone,
            'address': destination.address,
            'zip_code': destination.zip_code,
            'lat': float(destination.lat) if destination.lat else None,
            'lng': float(destination.lng) if destination.lng else None,
            'is_default': destination.is_default,
            'created_at': destination.created_at,
        }, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def delete_shipping_destination_view(request):
    """Delete a shipping address"""
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'User not authenticated'}, status=401)
    
    request.user = user
    
    try:
        data = json.loads(request.body)
        destination_id = data.get('destination_id')
        
        if not destination_id:
            return JsonResponse({'error': 'destination_id is required'}, status=400)
        
        destination = get_object_or_404(ShippingDestination, id=destination_id, user=user)
        destination.delete()
        
        return JsonResponse({'message': 'Destination deleted successfully'})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ============================================================
# PRODUCT SEARCH WITH FILTERS
# ============================================================

@csrf_exempt
@require_http_methods(["GET"])
def search_products_view(request):
    """Search products with filters"""
    try:
        query = request.GET.get('q', '')
        category = request.GET.get('category')
        brand = request.GET.get('brand')
        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        sort = request.GET.get('sort', '-id')
        
        products = Product.objects.all()
        
        if query:
            products = products.filter(
                Q(name__icontains=query) |
                Q(slug__icontains=query) |
                Q(description__icontains=query)
            )
        
        if category:
            try:
                cat = Category.objects.get(slug=category)
                products = products.filter(category_id=cat.id)
            except Category.DoesNotExist:
                pass
        
        if brand:
            try:
                br = Brand.objects.get(slug=brand)
                products = products.filter(brand_id=br.id)
            except Brand.DoesNotExist:
                pass
        
        if min_price:
            products = products.filter(price__gte=float(min_price))
        
        if max_price:
            products = products.filter(price__lte=float(max_price))
        
        # Apply sorting
        if sort == 'price_asc':
            products = products.order_by('price')
        elif sort == 'price_desc':
            products = products.order_by('-price')
        elif sort == 'name':
            products = products.order_by('name')
        elif sort == 'rating':
            products = products.order_by('-rating')
        else:
            products = products.order_by('-id')
        
        serializer = ProductSerializer(products, many=True)
        return JsonResponse({
            'results': serializer.data,
            'count': products.count()
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ============================================================
# SIMPLE PRODUCT VIEW FOR TESTING
# ============================================================

@csrf_exempt
@require_http_methods(["GET"])
def get_products_simple(request):
    """Simple view to test products - bypasses serializer"""
    try:
        products = Product.objects.all()
        data = []
        for p in products:
            data.append({
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'brand_id': p.brand_id,
                'category_id': p.category_id,
                'price': float(p.price),
                'discount_price': float(p.discount_price) if p.discount_price else None,
                'img': p.img,
                'images': p.images,
                'description': p.description,
                'short_description': p.short_description,
                'sizes': p.sizes,
                'colors': p.colors,
                'rating': float(p.rating) if p.rating else 0,
                'reviews_count': p.reviews_count,
                'in_stock': p.in_stock,
                'is_featured': p.is_featured,
                'is_new': p.is_new,
                'is_best_seller': p.is_best_seller,
            })
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)