# store/management/commands/demo_streak.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import uuid
from store.models import UserStreak, PurchaseHistory, Product

class Command(BaseCommand):
    help = 'Create demo streak data for a user'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username to create streak for')
        parser.add_argument('--days', type=int, default=7, help='Number of days for streak (default: 7)')

    def handle(self, *args, **options):
        username = options['username']
        days = options['days']
        
        self.stdout.write(f"\n{'='*60}")
        self.stdout.write(f"🚀 Creating demo streak for: {username}")
        self.stdout.write(f"{'='*60}\n")
        
        try:
            user = User.objects.get(username=username)
            self.stdout.write(self.style.SUCCESS(f"✅ Found user: {user.username} (ID: {user.id})"))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"❌ User '{username}' not found!"))
            self.stdout.write("\n📋 Available users:")
            for u in User.objects.all()[:10]:
                self.stdout.write(f"  - {u.username}")
            return

        # Get a product
        product = Product.objects.first()
        if not product:
            self.stdout.write(self.style.ERROR("❌ No products found! Please add a product first."))
            return
        
        self.stdout.write(self.style.SUCCESS(f"✅ Using product: {product.name} (ID: {product.id})"))

        # Get or create streak
        streak, created = UserStreak.objects.get_or_create(user=user)
        self.stdout.write(f"📊 Streak created: {created}")

        # Clear existing purchase history for this user
        deleted_count, _ = PurchaseHistory.objects.filter(user=user).delete()
        self.stdout.write(f"🧹 Cleared {deleted_count} existing purchase records")

        # Create purchases for the last 'days' days
        self.stdout.write(f"\n📅 Creating {days} days of purchases...")
        for i in range(days):
            date = timezone.now() - timedelta(days=days-1-i)
            
            purchase = PurchaseHistory.objects.create(
                user=user,
                product=product,
                product_name=f"Day {i+1} - {product.name}",
                product_price=product.price,
                quantity=1,
                total_amount=product.price,
                order_id=f"ORD-DEMO-{uuid.uuid4().hex[:8].upper()}",
                purchase_date=date
            )
            
            # Update streak
            streak.current_streak = i + 1
            streak.last_purchase_date = date
            if i == 0:
                streak.streak_start_date = date
            streak.save()
            
            self.stdout.write(f"  ✅ Day {i+1}: Streak = {streak.current_streak} (Date: {date.date()})")

        # Complete the streak with rewards if 7+ days
        if days >= 7:
            streak.current_streak = days
            streak.coupon_unlocked = True
            streak.skycoins_balance = 500
            streak.total_skycoins_earned = 500
            streak.coupon_code = f"SKY50-DEMO-{uuid.uuid4().hex[:4].upper()}"
            streak.coupon_unlock_date = timezone.now()
            streak.max_streak = days
            streak.save()
            
            self.stdout.write(self.style.SUCCESS(f"""
{'='*60}
✅ DEMO STREAK COMPLETE!

📊 Results:
  User: {user.username}
  Email: {user.email}
  Streak: {streak.current_streak}/{days} days ✅
  SkyCoins: {streak.skycoins_balance} 🪙
  Coupon Code: {streak.coupon_code} 🎟️
  Coupon Unlocked: {streak.coupon_unlocked}
  Total Purchases: {streak.total_purchases}
  Purchase History: {PurchaseHistory.objects.filter(user=user).count()} items

🚀 Now go to your app, refresh, and check the SkyCoins dashboard!
{'='*60}
"""))
        else:
            self.stdout.write(self.style.WARNING(f"""
{'='*60}
⚠️ Streak at {streak.current_streak}/{days} days
Need 7 days to unlock rewards!
{'='*60}
"""))