import Modal from "../Modal";

export default function ListingDetailModal({ listing, isOpen, onClose, children }) {
  if (!listing) return null;

  function formatDate(date) {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    });
  }

  const detailRows = [
    { label: "Category", value: listing.category === "edible" ? "Edible Surplus Food" : "Organic Waste" },
    { label: "Quantity", value: `${listing.quantity} ${listing.unit}` },
    { label: "Supplier", value: listing.supplier },
    { label: "Location", value: listing.location },
    { label: "Storage Conditions", value: listing.storageConditions || "N/A" },
    { label: "Preparation Time", value: listing.preparationTime || "N/A" },
    { label: "Ready for Pickup", value: formatDate(listing.readyAt) },
    { label: "Allergens", value: listing.allergens || "Not provided" },
    { label: "Sorting Information", value: listing.sortingInfo || "N/A" },
    { label: "Collection Deadline", value: formatDate(listing.collectionDeadline) },
    { label: "Status", value: listing.status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) },
    { label: "Accepted By", value: listing.acceptedByName || "Not yet accepted" },
    { label: "Created", value: formatDate(listing.createdAt) },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={listing.title} size="lg">
      <div className="space-y-4">
        <p className="text-sm text-forest-600">{listing.description}</p>

        {listing.photo && <img src={listing.photo} alt={`${listing.title} listing`} className="max-h-64 w-full rounded-lg object-cover" />}

        {/* Safety verification */}
        {listing.category === "edible" && (
          <div className={`rounded-xl p-3 ${listing.safetyVerified ? "bg-forest-50 border border-forest-200" : "bg-red-50 border border-red-200"}`}>
            <p className={`text-sm font-semibold ${listing.safetyVerified ? "text-forest-700" : "text-red-600"}`}>
              {listing.safetyVerified ? "✓ Food Safety Verified" : "✗ Food Safety Not Verified"}
            </p>
            {listing.safetyVerified && listing.storageConditions && (
              <p className="text-xs text-forest-500 mt-1">
                Storage: {listing.storageConditions}
              </p>
            )}
          </div>
        )}

        {/* Detail table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {detailRows.map((row, i) => (
            <div key={i} className="bg-beige-50 rounded-lg px-3 py-2">
              <p className="text-xs text-forest-400 font-medium">{row.label}</p>
              <p className="text-sm text-forest-800 font-semibold mt-0.5 capitalize">{row.value}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        {(listing.pickupScheduledAt || listing.pickedUpAt || listing.deliveredAt || listing.completedAt) && (
          <div className="bg-forest-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-forest-700 mb-3">Timeline</h4>
            <div className="space-y-2">
              {listing.pickupScheduledAt && (
                <p className="text-xs text-forest-600">Pickup Scheduled: {formatDate(listing.pickupScheduledAt)}</p>
              )}
              {listing.pickedUpAt && (
                <p className="text-xs text-forest-600">Picked Up: {formatDate(listing.pickedUpAt)}</p>
              )}
              {listing.deliveredAt && (
                <p className="text-xs text-forest-600">Delivered: {formatDate(listing.deliveredAt)}</p>
              )}
              {listing.completedAt && (
                <p className="text-xs text-forest-600">Completed: {formatDate(listing.completedAt)}</p>
              )}
            </div>
          </div>
        )}

        {/* Action slot for parent */}
        {children}
      </div>
    </Modal>
  );
}
