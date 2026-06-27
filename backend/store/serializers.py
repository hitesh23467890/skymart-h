# store/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Product, Purchase, Wishlist, Cart, Order, ShippingDestination


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model - matches your store_products table"""
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 
            'brand_id', 'category_id',
            'price', 'discount_price', 'img', 'images',
            'description', 'short_description', 'sizes', 'colors',
            'rating', 'reviews_count', 'in_stock', 'is_featured',
            'is_new', 'is_best_seller', 'created_at', 'updated_at'
        ]


class PurchaseSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', read_only=True, max_digits=10, decimal_places=2)
    product_img = serializers.CharField(source='product.img', read_only=True)
    
    class Meta:
        model = Purchase
        fields = [
            "id", "order_id", "product", 
            "product_name", "product_price", "product_img",
            "email", "customer_name", "phone", "quantity",
            "source_address", "destination_address", "purchased_at",
            "delivery_lat", "delivery_lng", "source_lat", "source_lng",
            "distance_km", "eta_minutes", "delivery_status", 
            "status_updated_at", "delivered_at", "payment_method",
        ]
        read_only_fields = ["purchased_at", "order_id"]


class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'product', 'added_at']
        read_only_fields = ['user', 'added_at']


class CartSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'user', 'product', 'quantity', 'added_at', 'subtotal']
        read_only_fields = ['user', 'added_at']
    
    def get_subtotal(self, obj):
        return obj.product.price * obj.quantity


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['order_id', 'user', 'order_date']


class ShippingDestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingDestination
        fields = ['id', 'name', 'email', 'phone', 'address', 'zip_code', 'lat', 'lng', 'is_default', 'created_at']
        read_only_fields = ['user', 'created_at']


class UserRegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"non_field_errors": ["Passwords do not match."]})
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["email"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data["name"],
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)