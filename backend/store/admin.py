from django.contrib import admin
from .models import Product, Purchase

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "brand", "category", "price")
    search_fields = ("name", "brand", "category")


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "product",
        "customer_name",
        "email",
        "quantity",
        "purchased_at",
    )
    list_filter = ("purchased_at",)
    search_fields = ("email", "customer_name", "product__name")
