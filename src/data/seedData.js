export const FOOD_CATEGORIES = { EDIBLE: "edible", ORGANIC_WASTE: "organic_waste" };

export const CATEGORY_LABELS = {
  edible: "Edible Surplus Food",
  organic_waste: "Organic Waste",
};

export const ROLE_LABELS = {
  supplier: "Food Supplier",
  recipient: "Food Recipient",
  recovery: "Recovery Partner",
  delivery: "Delivery Partner",
};

export const STATUS_LABELS = {
  available: "Waiting",
  accepted: "Accepted",
  pickup_scheduled: "Pickup Today",
  picked_up: "Picked Up",
  delivered: "Waiting for receiver",
  received: "Waiting for confirmation",
  completed: "Completed",
  rejected: "Not accepted",
  cancelled: "Cancelled",
  processing: "Being processed",
  processed: "Completed",
};

export const STATUS_COLORS = {
  available: { bg: "bg-orange-100", text: "text-orange-900", dot: "bg-orange-600" },
  accepted: { bg: "bg-orange-100", text: "text-orange-900", dot: "bg-orange-600" },
  pickup_scheduled: { bg: "bg-orange-100", text: "text-orange-900", dot: "bg-orange-600" },
  picked_up: { bg: "bg-green-100", text: "text-green-900", dot: "bg-green-700" },
  delivered: { bg: "bg-orange-100", text: "text-orange-900", dot: "bg-orange-600" },
  received: { bg: "bg-orange-100", text: "text-orange-900", dot: "bg-orange-600" },
  completed: { bg: "bg-green-100", text: "text-green-900", dot: "bg-green-700" },
  rejected: { bg: "bg-red-100", text: "text-red-900", dot: "bg-red-700" },
  cancelled: { bg: "bg-gray-100", text: "text-gray-800", dot: "bg-gray-600" },
  processing: { bg: "bg-orange-100", text: "text-orange-900", dot: "bg-orange-600" },
  processed: { bg: "bg-green-100", text: "text-green-900", dot: "bg-green-700" },
};

export const WASTE_STATUSES = ["available", "received", "processing", "processed"];

const daysAgo = (days, hour = 12) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

export const seedDeliveryPartners = [
  { id: "D001", name: "GreenRoute Couriers", vehicle: "Refrigerated van", available: true, capacity: 250 },
  { id: "D002", name: "Community Food Runners", vehicle: "Cargo van", available: true, capacity: 120 },
];

export const fullSeedData = {
  suppliers: [
    { id: "S001", name: "Harvest Table Hotel", contact: "+1 555 0101", location: "Downtown Market District", latitude: 40.7128, longitude: -74.006 },
    { id: "S002", name: "Northside Bakehouse", contact: "+1 555 0102", location: "Northside, Cedar Avenue", latitude: 40.728, longitude: -73.994 },
    { id: "S003", name: "Campus Commons Kitchen", contact: "+1 555 0103", location: "University Campus", latitude: 40.729, longitude: -73.997 },
  ],
  recipients: [
    { id: "R001", name: "Open Door Community Kitchen", type: "Community Kitchen", contact: "+1 555 0201", location: "Lower East Side", peopleServed: 180, latitude: 40.718, longitude: -73.99 },
    { id: "R002", name: "Harbor House Shelter", type: "Shelter", contact: "+1 555 0202", location: "East Village", peopleServed: 90, latitude: 40.726, longitude: -73.981 },
    { id: "R003", name: "Bright Futures Orphanage", type: "Orphanage", contact: "+1 555 0203", location: "Midtown", peopleServed: 65, latitude: 40.754, longitude: -73.984 },
  ],
  recoveryPartners: [
    { id: "W001", name: "City Soil Cooperative", type: "Composting", location: "Brooklyn", capacity: 800, capacityKg: 800, acceptedWasteTypes: ["food_scraps", "produce", "coffee", "other"], available: true },
    { id: "W002", name: "Renew Organics", type: "Anaerobic digestion", location: "Queens", capacity: 1200, capacityKg: 1200, acceptedWasteTypes: ["food_scraps", "produce", "other"], available: true },
  ],
  deliveryPartners: seedDeliveryPartners,
  notifications: [],
  requests: [],
  listings: [
    { id: "L100001", title: "Seasonal vegetable lunch boxes", description: "Freshly prepared vegetarian lunch boxes from today's service.", category: "edible", quantity: 80, unit: "meals", supplier: "Harvest Table Hotel", supplierId: "S001", supplierContact: "+1 555 0101", location: "Downtown Market District", latitude: 40.7128, longitude: -74.006, safetyVerified: true, storageConditions: "Hot-held above 60°C; insulated containers", preparationTime: daysAgo(0, 10), readyAt: daysAgo(0, 13), collectionDeadline: daysAgo(-1, 16), allergens: "Wheat, soy", status: "available", createdAt: daysAgo(0, 9) },
    { id: "L100002", title: "Assorted day-old pastries", description: "Wrapped breads and pastries baked this morning.", category: "edible", quantity: 42, unit: "items", supplier: "Northside Bakehouse", supplierId: "S002", supplierContact: "+1 555 0102", location: "Northside, Cedar Avenue", latitude: 40.728, longitude: -73.994, safetyVerified: true, storageConditions: "Sealed at room temperature", preparationTime: daysAgo(0, 8), readyAt: daysAgo(0, 14), collectionDeadline: daysAgo(-1, 18), allergens: "Wheat, milk, eggs", status: "available", createdAt: daysAgo(0, 8) },
    { id: "L100003", title: "Prepared pasta trays", description: "Vegetarian pasta trays from the campus lunch service.", category: "edible", quantity: 55, unit: "meals", supplier: "Campus Commons Kitchen", supplierId: "S003", supplierContact: "+1 555 0103", location: "University Campus", latitude: 40.729, longitude: -73.997, safetyVerified: true, storageConditions: "Refrigerated at 4°C", preparationTime: daysAgo(0, 11), readyAt: daysAgo(0, 15), collectionDeadline: daysAgo(-1, 17), allergens: "Wheat, dairy", status: "available", createdAt: daysAgo(0, 11) },
    { id: "L100004", title: "Mixed salad greens", description: "Washed salad greens and cut vegetables, kept chilled.", category: "edible", quantity: 18, unit: "kg", supplier: "Harvest Table Hotel", supplierId: "S001", supplierContact: "+1 555 0101", location: "Downtown Market District", latitude: 40.7128, longitude: -74.006, safetyVerified: true, storageConditions: "Refrigerated at 3°C", preparationTime: daysAgo(0, 9), readyAt: daysAgo(0, 12), collectionDeadline: daysAgo(-1, 14), allergens: "May contain sesame", status: "available", createdAt: daysAgo(1, 9) },
    { id: "L100005", title: "Bread and sandwich packs", description: "Unserved wrapped sandwich packs, labelled by filling.", category: "edible", quantity: 36, unit: "meals", supplier: "Campus Commons Kitchen", supplierId: "S003", supplierContact: "+1 555 0103", location: "University Campus", latitude: 40.729, longitude: -73.997, safetyVerified: true, storageConditions: "Chilled at 4°C", preparationTime: daysAgo(0, 10), readyAt: daysAgo(0, 13), collectionDeadline: daysAgo(-1, 15), allergens: "Wheat, milk", status: "available", createdAt: daysAgo(2, 10) },
    { id: "L100006", title: "Unverified soup batch", description: "Held pending supplier safety verification.", category: "edible", quantity: 24, unit: "meals", supplier: "Harvest Table Hotel", supplierId: "S001", supplierContact: "+1 555 0101", location: "Downtown Market District", safetyVerified: false, storageConditions: "Refrigerated", preparationTime: daysAgo(0, 11), readyAt: daysAgo(0, 13), collectionDeadline: daysAgo(-1, 15), status: "available", createdAt: daysAgo(0, 11) },
    { id: "L100007", title: "Vegetable peelings", description: "Clean vegetable preparation scraps, separated at source.", category: "organic_waste", quantity: 26, unit: "kg", supplier: "Campus Commons Kitchen", supplierId: "S003", supplierContact: "+1 555 0103", location: "University Campus", sortingInfo: "Source-separated; no packaging", storageConditions: "Lidded food-grade bins", collectionDeadline: daysAgo(-1, 18), status: "available", createdAt: daysAgo(0, 9) },
    { id: "L100008", title: "Coffee grounds and fruit scraps", description: "Sorted organic material from breakfast service.", category: "organic_waste", quantity: 14, unit: "kg", supplier: "Harvest Table Hotel", supplierId: "S001", supplierContact: "+1 555 0101", location: "Downtown Market District", sortingInfo: "Compostable material only", storageConditions: "Covered containers", collectionDeadline: daysAgo(-1, 16), status: "available", createdAt: daysAgo(1, 8) },
  ],
};
