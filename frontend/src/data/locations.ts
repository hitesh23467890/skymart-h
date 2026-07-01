export const brandLocations: Record<
  string,
  { lat: number; lng: number; label: string }
> = {
  "Nordic Studio": {
    lat: 59.3293,
    lng: 18.0686,
    label: "Stockholm Warehouse, Sweden",
  },
  "Atelier Craft": {
    lat: 48.8566,
    lng: 2.3522,
    label: "Paris Atelier, France",
  },
  "Apex Precision": {
    lat: 37.7749,
    lng: -122.4194,
    label: "San Francisco Hub, USA",
  },
  "Vogue Arc": {
    lat: 19.07598,
    lng: 72.87766,
    label: "Mumbai Distribution, India",
  },
};

export const defaultWarehouse = {
  lat: 28.6139,
  lng: 77.209,
  label: "Delhi Central Warehouse",
};
