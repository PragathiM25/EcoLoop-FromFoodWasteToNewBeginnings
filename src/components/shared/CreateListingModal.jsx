import { useEffect, useState } from "react";
import Modal from "../Modal";
import { useApp } from "../../context/AppContext";
import { FOOD_CATEGORIES } from "../../data/seedData";
import { AlertTriangle, Shield } from "lucide-react";

export default function CreateListingModal({ isOpen, onClose, onCreated, initialCategory = FOOD_CATEGORIES.EDIBLE }) {
  const { addListing, suppliers } = useApp();
  const [form, setForm] = useState({
    title: "",
    category: initialCategory,
    description: "",
    quantity: "",
    unit: "meals",
    supplier: suppliers[0]?.name || "",
    supplierId: suppliers[0]?.id || "",
    supplierContact: suppliers[0]?.contact || "",
    location: "",
    safetyVerified: false,
    storageConditions: "",
    preparationTime: "",
    readyAt: "",
    allergens: "",
    foodType: "",
    sortingInfo: "",
    collectionDeadline: "",
    photo: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) setForm((prev) => ({ ...prev, category: initialCategory, unit: initialCategory === FOOD_CATEGORIES.ORGANIC_WASTE ? "kg" : prev.unit }));
  }, [isOpen, initialCategory]);

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.quantity || form.quantity <= 0) e.quantity = "Quantity must be greater than 0";
    if (!form.location.trim()) e.location = "Location is required";
    if (form.category === FOOD_CATEGORIES.EDIBLE) {
      if (!form.safetyVerified) e.safetyVerified = "Food safety verification is required for edible food";
      if (!form.readyAt) e.readyAt = "Ready-for-pickup time is required for edible food";
    }
    if (form.category === FOOD_CATEGORIES.ORGANIC_WASTE) {
      if (!form.readyAt) e.readyAt = "Ready-for-pickup time is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    // Find supplier details
    const supplierData = suppliers.find((s) => s.id === form.supplierId) || suppliers[0];

    addListing({
      title: form.title,
      category: form.category,
      description: form.description || form.title,
      quantity: parseInt(form.quantity),
      unit: form.unit,
      supplier: supplierData?.name || form.supplier,
      supplierId: supplierData?.id || "S001",
      supplierContact: supplierData?.contact || "",
      location: form.location,
      safetyVerified: form.category === FOOD_CATEGORIES.EDIBLE ? form.safetyVerified : true,
      storageConditions: form.storageConditions,
      preparationTime: form.preparationTime,
      readyAt: form.readyAt ? new Date(form.readyAt).toISOString() : null,
      allergens: form.allergens,
      foodType: form.foodType,
      sortingInfo: form.sortingInfo,
      photo: form.photo,
      collectionDeadline: form.collectionDeadline ? new Date(form.collectionDeadline).toISOString() : form.readyAt ? new Date(form.readyAt).toISOString() : null,
    });

    // Reset form
    setForm({
      title: "",
      category: FOOD_CATEGORIES.EDIBLE,
      description: "",
      quantity: "",
      unit: "meals",
      supplier: suppliers[0]?.name || "",
      supplierId: suppliers[0]?.id || "",
      supplierContact: suppliers[0]?.contact || "",
      location: "",
      safetyVerified: false,
      storageConditions: "",
      preparationTime: "",
      readyAt: "",
      allergens: "",
      foodType: "",
      sortingInfo: "",
      collectionDeadline: "",
      photo: "",
    });
    setErrors({});
    onCreated?.(form.category === FOOD_CATEGORIES.EDIBLE ? "Food offer added." : "Organic waste added.");
    onClose();
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  const isEdible = form.category === FOOD_CATEGORIES.EDIBLE;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdible ? "Give Surplus Food" : "Give Organic Waste"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label-text">{isEdible ? "Food name" : "Waste type"} *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder={isEdible ? "For example, vegetable lunch boxes" : "For example, fruit and vegetable scraps"}
            className="input-field"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-text">Quantity {isEdible ? "(meals or kg)" : "(kg)"} *</label>
            <input
              type="number"
              value={form.quantity}
              onChange={(e) => updateField("quantity", e.target.value)}
              placeholder="0"
              min="1"
              className="input-field"
            />
            {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
          </div>
          {isEdible && <div>
            <label className="label-text">Unit *</label>
            <select
              value={form.unit}
              onChange={(e) => updateField("unit", e.target.value)}
              className="input-field"
            >
              {isEdible ? <>
                <option value="meals">Meals</option>
                <option value="servings">Servings</option>
                <option value="items">Items</option>
                <option value="platters">Platters</option>
                <option value="loaves">Loaves</option>
                <option value="containers">Containers</option>
                <option value="kg">Kilograms (kg)</option>
              </> : <option value="kg">Kilograms (kg)</option>}
            </select>
            {errors.unit && <p className="text-xs text-red-500 mt-1">{errors.unit}</p>}
          </div>}
        </div>

        <div>
          <label className="label-text">Pickup address *</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => updateField("location", e.target.value)}
            placeholder="Street, building, or pickup entrance"
            className="input-field"
          />
          {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
        </div>

        {isEdible && (
          <div className="space-y-3 rounded-xl border border-mint-200 bg-mint-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-forest-800"><Shield size={18} />Food safety check required</p>
            <p className="text-sm text-forest-700">Only offer food that has been stored and handled safely. You are responsible for following local food safety rules.</p>
            <div>
              <label className="flex min-h-12 items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.safetyVerified}
                  onChange={(e) => updateField("safetyVerified", e.target.checked)}
                  className="w-4 h-4 rounded accent-forest-600"
                />
                <span className="text-sm font-medium text-forest-700">
                  I confirm this food is safe to offer *
                </span>
              </label>
              {errors.safetyVerified && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertTriangle size={12} /> {errors.safetyVerified}
                </p>
              )}
            </div>

          </div>
        )}

        <div>
          <label className="label-text">Pickup time *</label>
          <input
            type="datetime-local"
            value={form.readyAt}
            onChange={(e) => updateField("readyAt", e.target.value)}
            className="input-field"
          />
          {errors.readyAt && <p className="text-sm text-red-700 mt-1">{errors.readyAt}</p>}
        </div>

        <details className="rounded-lg border border-beige-200 p-4">
          <summary className="cursor-pointer text-base font-semibold text-forest-800">More details (optional)</summary>
          <div className="mt-4 space-y-4">
            <label className="block"><span className="label-text">Extra information</span><textarea rows={2} value={form.description} onChange={(e) => updateField("description", e.target.value)} className="input-field resize-y" /></label>
            <label className="block"><span className="label-text">Collection deadline</span><input type="datetime-local" value={form.collectionDeadline} onChange={(e) => updateField("collectionDeadline", e.target.value)} className="input-field" /></label>
            <label className="block"><span className="label-text">Storage or sorting information</span><textarea rows={2} value={isEdible ? form.storageConditions : form.sortingInfo} onChange={(e) => updateField(isEdible ? "storageConditions" : "sortingInfo", e.target.value)} className="input-field resize-y" /></label>
            {isEdible && <>
              <label className="block"><span className="label-text">Preparation date and time</span><input type="datetime-local" value={form.preparationTime} onChange={(e) => updateField("preparationTime", e.target.value)} className="input-field" /></label>
              <label className="block"><span className="label-text">Allergens, if known</span><input type="text" value={form.allergens} onChange={(e) => updateField("allergens", e.target.value)} className="input-field" /></label>
              <label className="block"><span className="label-text">Optional food photo</span><input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 2 * 1024 * 1024) { setErrors((prev) => ({ ...prev, photo: "Choose an image smaller than 2 MB." })); return; } const reader = new FileReader(); reader.onload = () => updateField("photo", reader.result); reader.readAsDataURL(file); }} className="input-field" />{errors.photo && <p className="text-sm text-red-700 mt-1">{errors.photo}</p>}</label>
            </>}
          </div>
        </details>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary min-h-12 flex-1">Cancel</button>
          <button type="submit" className="btn-primary min-h-12 flex-1">{isEdible ? "Give Surplus Food" : "Give Organic Waste"}</button>
        </div>
      </form>
    </Modal>
  );
}
