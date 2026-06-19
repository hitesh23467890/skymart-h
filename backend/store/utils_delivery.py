import math
from datetime import datetime
from typing import Optional


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance between two points (km)."""
    r = 6371.0

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)

    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


def estimate_eta_minutes(distance_km: float) -> int:
    """Simple ETA model.

    Uses a conservative average speed that can be tuned later.
    """
    # Conservative average speed: 20 km/h
    speed_km_per_hour = 20.0
    minutes = (distance_km / speed_km_per_hour) * 60.0
    # Add a handling buffer: 10 minutes
    minutes += 10.0
    return max(15, int(round(minutes)))


def update_status_from_elapsed(purchased_at: datetime, eta_minutes: Optional[int]) -> str:
    """Derive status from elapsed time."""
    if not eta_minutes or eta_minutes <= 0:
        return "Preparing"

    elapsed_min = (datetime.utcnow() - purchased_at.replace(tzinfo=None)).total_seconds() / 60.0
    t = elapsed_min / eta_minutes

    if t < 0.25:
        return "Preparing"
    if t < 0.60:
        return "Shipped"
    if t < 0.95:
        return "Out for Delivery"
    return "Delivered"

