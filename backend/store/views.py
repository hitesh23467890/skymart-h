from django.contrib.auth import authenticate
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, filters, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Product, Purchase
from .serializers import (
    ProductSerializer,
    PurchaseSerializer,
    UserLoginSerializer,
    UserRegisterSerializer,
)
from .utils_delivery import haversine_km, estimate_eta_minutes, update_status_from_elapsed

from django.utils import timezone
from datetime import datetime



class ProductListCreateAPIView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "brand", "category", "description"]
    ordering_fields = ["price", "name", "category"]


class ProductRetrieveAPIView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class PurchaseListCreateAPIView(generics.ListCreateAPIView):
    queryset = Purchase.objects.all().order_by("-purchased_at")
    serializer_class = PurchaseSerializer


class PurchaseCreateOrderAPIView(APIView):
    """Create a delivery order from frontend-provided coordinates.

    Expected JSON body:
    - product: int
    - email: string
    - quantity: int (optional)
    - customer_name: string (optional)
    - phone: string (optional)
    - source_address: string (optional)
    - destination_address: string (optional)
    - source_lat, source_lng: number
    - delivery_lat, delivery_lng: number
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        product_id = request.data.get("product")
        email = request.data.get("email")
        quantity = int(request.data.get("quantity") or 1)

        delivery_lat = request.data.get("delivery_lat")
        delivery_lng = request.data.get("delivery_lng")
        source_lat = request.data.get("source_lat")
        source_lng = request.data.get("source_lng")

        if product_id is None or not email:
            return Response({"detail": "product and email are required"}, status=status.HTTP_400_BAD_REQUEST)

        # compute distance/eta if coords provided
        distance_km = None
        eta_minutes = None
        if delivery_lat is not None and delivery_lng is not None and source_lat is not None and source_lng is not None:
            distance_km = haversine_km(float(source_lat), float(source_lng), float(delivery_lat), float(delivery_lng))
            eta_minutes = estimate_eta_minutes(distance_km)

        purchased_at = timezone.now()
        delivery_status = "Preparing"

        purchase = Purchase.objects.create(
            product_id=product_id,
            email=email,
            quantity=quantity,
            customer_name=request.data.get("customer_name"),
            phone=request.data.get("phone"),
            source_address=request.data.get("source_address"),
            destination_address=request.data.get("destination_address"),
            delivery_lat=delivery_lat,
            delivery_lng=delivery_lng,
            source_lat=source_lat,
            source_lng=source_lng,
            distance_km=distance_km,
            eta_minutes=eta_minutes,
            delivery_status=delivery_status,
            status_updated_at=purchased_at,
        )

        return Response(PurchaseSerializer(purchase).data, status=status.HTTP_201_CREATED)


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
        # Derive status based on elapsed time (no separate background worker)
        for item in response.data:
            purchased_at = item.get("purchased_at")
            eta_minutes = item.get("eta_minutes")
            if purchased_at:
                # purchased_at string from DRF: ISO8601
                purchased_dt = datetime.fromisoformat(purchased_at.replace("Z", "+00:00"))
                status = update_status_from_elapsed(purchased_dt, eta_minutes)
                item["delivery_status"] = status
                if status == Purchase.STATUS_DELIVERED:
                    item.setdefault("delivered_at", purchased_at)
        return response



@method_decorator(csrf_exempt, name="dispatch")
class RegisterAPIView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "User registered successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name="dispatch")
class LoginAPIView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        user = authenticate(username=email, password=password)
        if user is None:
            return Response({"detail": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

        return Response(
            {
                "detail": "Login successful.",
                "email": user.email,
                "name": user.first_name,
            },
            status=status.HTTP_200_OK,
        )
