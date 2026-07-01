# TODO - Delivery distance/ETA + live status (backend API integration)

## Plan (approved)

1. Backend schema updates: extend `Purchase` model with delivery/source coordinates + status + ETA fields.
2. Backend API updates: add an endpoint to create an order including coordinates and compute distance + ETA.
3. Backend serializers/views: include new fields and allow the frontend to fetch orders by user.
4. Frontend checkout integration: when payment completes, call backend API to create the order (send delivery/source lat/lng, addresses, etc.).
5. Frontend tracking UI: show live status + countdown on Dashboard orders/cards, based on backend ETA and status progression.
6. Optional map: reuse existing `MapPreview` with polyline between warehouse/source and delivery coords.
7. Testing: run backend/frontend, verify endpoint works and live status is returned.
8. Frontend integration: replace localStorage-only purchases with backend order creation + dashboard fetch.
