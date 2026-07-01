# store/management/commands/reset_streak.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from store.models import UserStreak, PurchaseHistory

class Command(BaseCommand):
    help = 'Reset streak data for a user'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username to reset streak for')
        parser.add_argument('--all', action='store_true', help='Reset all users streak data')

    def handle(self, *args, **options):
        if options['all']:
            self.stdout.write("⚠️ Resetting ALL streak data...")
            confirm = input("Are you sure? Type 'yes' to confirm: ")
            if confirm.lower() != 'yes':
                self.stdout.write("❌ Cancelled.")
                return
            
            streak_count = UserStreak.objects.count()
            purchase_count = PurchaseHistory.objects.count()
            
            UserStreak.objects.all().delete()
            PurchaseHistory.objects.all().delete()
            
            self.stdout.write(self.style.SUCCESS(f"""
✅ Reset complete!
  - Streak data: {streak_count} records deleted
  - Purchase history: {purchase_count} records deleted
"""))
            return
        
        username = options['username']
        
        try:
            user = User.objects.get(username=username)
            streak_deleted, _ = UserStreak.objects.filter(user=user).delete()
            purchases_deleted, _ = PurchaseHistory.objects.filter(user=user).delete()
            
            self.stdout.write(self.style.SUCCESS(f"""
✅ Reset complete for {username}:
  - Streak data: {streak_deleted} records deleted
  - Purchase history: {purchases_deleted} records deleted
"""))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"❌ User '{username}' not found!"))
            self.stdout.write("\n📋 Available users:")
            for u in User.objects.all()[:10]:
                self.stdout.write(f"  - {u.username}")