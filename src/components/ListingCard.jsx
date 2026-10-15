import { Calendar, MapPin, User, Clock, Package, AlertTriangle, Shield, Truck } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { CATEGORY_LABELS } from "../data/seedData";

export default function ListingCard({ listing, onAction, actionLabel, actionIcon: ActionIcon, showSupplier = true, compact = false }) {
  const isEdible = listing.category === "edible";
  const isWaste = listing.category === "organic_waste";

  function formatDate(date) {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    });
  }

  function isExpired() {
    if (!listing.collectionDeadline) return false;
    return new Date(listing.collectionDeadline).getTime() < Date.now();
  }

  const expired = isExpired();

  return (
    <div className={`card p-5 card-hover flex flex-col gap-3 ${expired && listing.status === "available" ? "opacity-75" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`badge ${isEdible ? "bg-mint-100 text-mint-700" : "bg-beige-100 text-beige-700"}`}>
              {isEdible ? "Edible" : "Organic Waste"}
            </span>
            <StatusBadge status={listing.status} />
          </div>
          <h3 className="text-base font-semibold text-forest-800 font-display truncate">{listing.title}</h3>
        </div>
      </div>

      {/* Description */}
      {!compact && (
        <p className="text-sm text-forest-500 line-clamp-2">{listing.description}</p>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-forest-600">
          <Package size={14} className="text-forest-400" />
          <span className="font-medium">{listing.quantity} {listing.unit}</span>
        </div>
        {showSupplier && (
          <div className="flex items-center gap-1.5 text-forest-600 col-span-2">
            <User size={14} className="text-forest-400" />
            <span className="font-medium truncate">{listing.supplier}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-forest-600 col-span-2">
          <MapPin size={14} className="text-forest-400" />
          <span className="truncate">{listing.location}</span>
        </div>
        {listing.collectionDeadline && (
          <div className={`flex items-center gap-1.5 col-span-2 ${expired ? "text-red-500" : "text-forest-600"}`}>
            <Clock size={14} className={expired ? "text-red-400" : "text-forest-400"} />
            <span className="font-medium">
              {expired ? "Expired: " : "Collect by: "}{formatDate(listing.collectionDeadline)}
            </span>
          </div>
        )}
      </div>

      {/* Safety verification badge for edible */}
      {isEdible && (
        <div className="flex items-center gap-2 text-xs">
          {listing.safetyVerified ? (
            <span className="badge bg-forest-100 text-forest-700">
              <Shield size={12} />
              Safety Verified
            </span>
          ) : (
            <span className="badge bg-red-100 text-red-600">
              <AlertTriangle size={12} />
              Not Verified — Pending Safety Check
            </span>
          )}
          {listing.storageConditions && (
            <span className="text-xs text-forest-500 truncate">{listing.storageConditions}</span>
          )}
        </div>
      )}

      {/* Accepted by */}
      {listing.acceptedByName && (
        <div className="flex items-center gap-1.5 text-xs text-forest-600 bg-forest-50 rounded-lg px-3 py-1.5">
          <User size={14} className="text-forest-400" />
          <span>Accepted by <strong>{listing.acceptedByName}</strong></span>
        </div>
      )}

      {/* Action button */}
      {onAction && actionLabel && (
        <button
          onClick={() => onAction(listing)}
          className="btn-primary mt-1 w-full"
        >
          {ActionIcon && <ActionIcon size={16} />}
          {actionLabel}
        </button>
      )}
    </div>
  );
}
