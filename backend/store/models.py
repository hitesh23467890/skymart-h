from django.db import models


class Product(models.Model):
    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=255)
    category = models.CharField(max_length=120)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    img = models.URLField(max_length=1024)
    description = models.TextField()

    def __str__(self):
        return self.name


class Purchase(models.Model):
    STATUS_PREPARING = "Preparing"
    STATUS_SHIPPED = "Shipped"
    STATUS_OUT_FOR_DELIVERY = "Out for Delivery"
    STATUS_DELIVERED = "Delivered"

    STATUS_CHOICES = [
        (STATUS_PREPARING, STATUS_PREPARING),
        (STATUS_SHIPPED, STATUS_SHIPPED),
        (STATUS_OUT_FOR_DELIVERY, STATUS_OUT_FOR_DELIVERY),
        (STATUS_DELIVERED, STATUS_DELIVERED),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="purchases")
    email = models.EmailField()
    quantity = models.PositiveIntegerField(default=1)
    customer_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    source_address = models.TextField(blank=True, null=True)
    destination_address = models.TextField(blank=True, null=True)

    # Delivery coordinates
    delivery_lat = models.FloatField(null=True, blank=True)
    delivery_lng = models.FloatField(null=True, blank=True)
    source_lat = models.FloatField(null=True, blank=True)
    source_lng = models.FloatField(null=True, blank=True)

    # Distance / ETA
    distance_km = models.FloatField(null=True, blank=True)
    eta_minutes = models.IntegerField(null=True, blank=True)

    # Live status timeline
    delivery_status = models.CharField(max_length=32, choices=STATUS_CHOICES, default=STATUS_PREPARING)
    status_updated_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    purchased_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.customer_name:
            return f"{self.customer_name} - {self.product.name}"
        return f"{self.email} - {self.product.name}"

