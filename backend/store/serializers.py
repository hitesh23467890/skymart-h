from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Product, Purchase


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "brand", "category", "price", "img", "description"]


class PurchaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purchase
        fields = [
            "id",
            "product",
            "email",
            "customer_name",
            "phone",
            "quantity",
            "source_address",
            "destination_address",
            "purchased_at",
            # delivery coords + computed ETA
            "delivery_lat",
            "delivery_lng",
            "source_lat",
            "source_lng",
            "distance_km",
            "eta_minutes",
            # live status
            "delivery_status",
            "status_updated_at",
            "delivered_at",
        ]
        read_only_fields = ["purchased_at"]



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
