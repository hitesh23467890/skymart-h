from django.urls import path
from .views import (
    LoginAPIView,
    ProductListCreateAPIView,
    ProductRetrieveAPIView,
    PurchaseListCreateAPIView,
    RegisterAPIView,
    PurchaseCreateOrderAPIView,
    PurchaseByEmailAPIView,
)

urlpatterns = [
    path("auth/register/", RegisterAPIView.as_view(), name="auth-register"),
    path("auth/login/", LoginAPIView.as_view(), name="auth-login"),
    path("products/", ProductListCreateAPIView.as_view(), name="product-list-create"),
    path("products/<int:pk>/", ProductRetrieveAPIView.as_view(), name="product-detail"),
    path("purchases/", PurchaseListCreateAPIView.as_view(), name="purchase-list-create"),

    # Delivery tracking APIs
    path("orders/create/", PurchaseCreateOrderAPIView.as_view(), name="orders-create"),
    path("orders/by-email/", PurchaseByEmailAPIView.as_view(), name="orders-by-email"),
]

