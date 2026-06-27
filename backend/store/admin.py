# store/admin.py
from django.contrib import admin
from .models import Product, Purchase, Wishlist, Cart, Order, ShippingDestination, Category, Brand


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug", "brand_id", "category_id", "price", "in_stock", "is_featured", "is_new", "is_best_seller")
    list_filter = ("in_stock", "is_featured", "is_new", "is_best_seller", "category_id", "brand_id")
    search_fields = ("name", "slug", "description")
    list_editable = ("price", "in_stock", "is_featured", "is_new", "is_best_seller")
    readonly_fields = ("created_at", "updated_at")
    list_per_page = 25


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order_id",
        "product",
        "customer_name",
        "email",
        "quantity",
        "delivery_status",
        "purchased_at",
    )
    list_filter = ("delivery_status", "purchased_at", "payment_method")
    search_fields = ("email", "customer_name", "order_id", "product__name", "phone")
    readonly_fields = ("purchased_at", "order_id")
    list_per_page = 25


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "order_id", "user", "product_name", "status", "total_amount", "order_date")
    list_filter = ("status", "payment_method", "order_date")
    search_fields = ("order_id", "user__username", "user__email", "product_name", "shipping_name")
    readonly_fields = ("order_date",)
    list_per_page = 25


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "product", "added_at")
    list_filter = ("added_at",)
    search_fields = ("user__username", "user__email", "product__name")
    list_per_page = 25


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "product", "quantity", "added_at")
    list_filter = ("added_at",)
    search_fields = ("user__username", "user__email", "product__name")
    list_per_page = 25


@admin.register(ShippingDestination)
class ShippingDestinationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "name", "email", "phone", "is_default", "created_at")
    list_filter = ("is_default", "created_at")
    search_fields = ("user__username", "user__email", "name", "email", "phone")
    list_per_page = 25


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug", "parent_id", "level")
    list_filter = ("level",)
    search_fields = ("name", "slug")
    list_per_page = 25


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug")
    search_fields = ("name", "slug")
    list_per_page = 25