import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fullSeedData } from "../data/seedData";

const STORAGE_KEY = "ecoloop_data_v1";
const CURRENT_ROLE_KEY = "ecoloop_current_role";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [data, setData] = useState(() => loadData());
  const [currentRole, setCurrentRole] = useState(() => {
    const saved = localStorage.getItem(CURRENT_ROLE_KEY);
    return saved || null;
  });

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          listings: parsed.listings || [],
          requests: parsed.requests || [],
          recipients: parsed.recipients || [],
          suppliers: parsed.suppliers || [],
              recoveryPartners: parsed.recoveryPartners || [], // Added recovery partner settings
          deliveryPartners: parsed.deliveryPartners || [],
          notifications: parsed.notifications || [],
        };
      }
    } catch (e) {
      console.error("Failed to load EcoLoop data:", e);
    }
    return JSON.parse(JSON.stringify(fullSeedData));
  }

  // Persist to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Persist current role
  useEffect(() => {
    if (currentRole) {
      localStorage.setItem(CURRENT_ROLE_KEY, currentRole);
    } else {
      localStorage.removeItem(CURRENT_ROLE_KEY);
    }
  }, [currentRole]);

  // Cross-tab sync via storage event
  useEffect(() => {
    function handleStorageChange(e) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setData(JSON.parse(e.newValue));
        } catch (err) {
          console.error("Failed to sync data across tabs:", err);
        }
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const selectRole = useCallback((role) => {
    setCurrentRole(role);
  }, []);

  const logout = useCallback(() => {
    setCurrentRole(null);
  }, []);

  const resetDemoData = useCallback(() => {
    const fresh = JSON.parse(JSON.stringify(fullSeedData));
    setData(fresh);
  }, []);

  // --- Listing CRUD ---
  const addListing = useCallback((listing) => {
    const newListing = {
      ...listing,
      id: `L${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      status: "available",
      acceptedBy: null,
      acceptedByName: null,
      deliveryId: null,
      pickupScheduledAt: null,
      pickedUpAt: null,
      deliveredAt: null,
      completedAt: null,
    };
    setData((prev) => ({
      ...prev,
      listings: [newListing, ...prev.listings],
      notifications: [
        {
          id: `N${Date.now()}`,
          title: "New listing available",
          message: `${newListing.title} is now available.`,
          type: "info",
          timestamp: new Date().toISOString(),
          read: false,
          forRole: newListing.category === "edible" ? "recipient" : "recovery",
        },
        ...prev.notifications,
      ],
    }));
    return newListing;
  }, []);

  const submitFoodRequest = useCallback((request) => {
    const listing = data.listings.find((item) => item.id === request.listingId);
    if (!listing || listing.category !== "edible" || !listing.safetyVerified || !["available", "accepted"].includes(listing.status)) {
      return { ok: false, error: "This verified food offer is no longer available." };
    }
    const reserved = (data.requests || []).reduce((total, item) => (
      item.listingId === listing.id && !["rejected", "cancelled"].includes(item.status)
        ? total + Number(item.status === "completed" ? item.receivedQuantity ?? item.quantity : item.quantity || 0)
        : total
    ), 0);
    const remaining = Number(listing.quantity) - reserved;
    const quantity = Number(request.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > remaining) {
      return { ok: false, error: `Only ${Math.max(0, remaining)} ${listing.unit} remain available.` };
    }

    const createdAt = new Date().toISOString();
    const newRequest = {
      ...request,
      id: `Q${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`,
      quantity,
      status: "pending",
      createdAt,
      updatedAt: createdAt,
    };
    setData((prev) => {
      const currentListing = prev.listings.find((item) => item.id === listing.id);
      const currentReserved = (prev.requests || []).reduce((total, item) => (
        item.listingId === listing.id && !["rejected", "cancelled"].includes(item.status)
          ? total + Number(item.status === "completed" ? item.receivedQuantity ?? item.quantity : item.quantity || 0)
          : total
      ), 0);
      if (!currentListing || Number(currentListing.quantity) - currentReserved < quantity) return prev;
      return {
        ...prev,
        requests: [newRequest, ...(prev.requests || [])],
        notifications: [
          { id: `N${Date.now()}`, title: "Food request received", message: `${newRequest.recipientName} requested ${quantity} ${listing.unit} of ${listing.title}.`, type: "info", timestamp: createdAt, read: false, forRole: "supplier" },
          ...prev.notifications,
        ],
      };
    });
    return { ok: true, request: newRequest };
  }, [data.listings, data.requests]);

  const updateFoodRequest = useCallback((requestId, updates) => {
    const timestamp = new Date().toISOString();
    setData((prev) => {
      const request = (prev.requests || []).find((item) => item.id === requestId);
      if (!request) return prev;
      const updatedRequest = { ...request, ...updates, updatedAt: timestamp };
      const requests = prev.requests.map((item) => item.id === requestId ? updatedRequest : item);
      const listing = prev.listings.find((item) => item.id === request.listingId);
      let listings = prev.listings;
      if (listing && updates.status === "accepted") {
        listings = prev.listings.map((item) => item.id === listing.id
          ? { ...item, status: "accepted", acceptedBy: request.recipientId, acceptedByName: request.recipientName, fulfillmentMethod: request.fulfillmentMethod, deliveryId: request.deliveryPartnerId || null, deliveryPartnerName: request.deliveryPartnerName || "", pickupScheduledAt: request.collectionTime || null }
          : item);
      }
      if (listing && ["cancelled", "rejected"].includes(updates.status)) {
        const hasActive = requests.some((item) => item.listingId === listing.id && !["rejected", "cancelled", "completed"].includes(item.status));
        const hasPending = requests.some((item) => item.listingId === listing.id && item.status === "pending");
        if (!hasActive && !hasPending) {
          listings = listings.map((item) => item.id === listing.id ? { ...item, status: "available", acceptedBy: null, acceptedByName: null, deliveryId: null } : item);
        }
      }
      return {
        ...prev,
        requests,
        listings,
        notifications: updates.status ? [
          { id: `N${Date.now()}`, title: `Food request ${updates.status}`, message: `${listing?.title || "Food request"}: ${request.recipientName}'s request is ${updates.status}.`, type: updates.status === "rejected" ? "warning" : "success", timestamp, read: false, forRole: "recipient" },
          ...prev.notifications,
        ] : prev.notifications,
      };
    });
  }, []);

  const confirmFoodReceipt = useCallback((requestId, receivedQuantity) => {
    const timestamp = new Date().toISOString();
    setData((prev) => {
      const request = (prev.requests || []).find((item) => item.id === requestId);
      if (!request || !["delivered", "picked_up", "pickup_scheduled", "accepted"].includes(request.status)) return prev;
      const actual = Number(receivedQuantity);
      if (!Number.isFinite(actual) || actual < 0 || actual > Number(request.quantity)) return prev;
      const requests = prev.requests.map((item) => item.id === requestId
        ? { ...item, status: "completed", receivedQuantity: actual, receivedAt: timestamp, updatedAt: timestamp }
        : item);
      const listing = prev.listings.find((item) => item.id === request.listingId);
      const remainingActive = requests.some((item) => item.listingId === request.listingId && !["rejected", "cancelled", "completed"].includes(item.status));
      const reservedOrReceived = requests.filter((item) => item.listingId === request.listingId && !["rejected", "cancelled"].includes(item.status))
        .reduce((sum, item) => sum + Number(item.status === "completed" ? item.receivedQuantity ?? item.quantity : item.quantity || 0), 0);
      const listingUpdates = listing && !remainingActive
        ? reservedOrReceived >= Number(listing.quantity)
          ? { status: "completed", completedAt: timestamp }
          : { status: "available", acceptedBy: null, acceptedByName: null, deliveryId: null }
        : {};
      return {
        ...prev,
        requests,
        listings: prev.listings.map((item) => item.id === request.listingId ? { ...item, ...listingUpdates } : item),
        notifications: [
          { id: `N${Date.now()}`, title: "Food receipt confirmed", message: `${request.recipientName} confirmed ${actual} ${listing?.unit || "units"} received.`, type: "success", timestamp, read: false, forRole: "supplier" },
          ...prev.notifications,
        ],
      };
    });
  }, []);

  const reportFoodIssue = useCallback((requestId, issue) => {
    const timestamp = new Date().toISOString();
    setData((prev) => {
      const request = (prev.requests || []).find((item) => item.id === requestId);
      if (!request) return prev;
      const requests = prev.requests.map((item) => item.id === requestId
        ? { ...item, issueReport: { ...issue, reportedAt: timestamp }, updatedAt: timestamp }
        : item);
      return {
        ...prev,
        requests,
        notifications: [
          { id: `N${Date.now()}`, title: "Delivery issue reported", message: `${request.recipientName} reported ${issue.type} for ${prev.listings.find((item) => item.id === request.listingId)?.title || "a food delivery"}.`, type: "warning", timestamp, read: false, forRole: "supplier" },
          ...prev.notifications,
        ],
      };
    });
  }, []);

  const updateRecipientProfile = useCallback((recipientId, updates) => {
    setData((prev) => ({
      ...prev,
      recipients: prev.recipients.map((recipient) => recipient.id === recipientId
        ? { ...recipient, ...updates }
        : recipient),
    }));
  }, []);

  const updateSupplierProfile = useCallback((supplierId, updates) => {
    setData((prev) => ({
      ...prev,
      suppliers: prev.suppliers.map((supplier) => supplier.id === supplierId
        ? { ...supplier, ...updates }
        : supplier),
      listings: prev.listings.map((listing) => listing.supplierId === supplierId
        ? {
            ...listing,
            supplier: updates.name ?? listing.supplier,
            supplierContact: updates.contact ?? listing.supplierContact,
            location: updates.location ?? listing.location,
          }
        : listing),
    }));
  }, []);

  const updateRecoveryProfile = useCallback((partnerId, updates) => {
    setData((prev) => ({
      ...prev,
      recoveryPartners: prev.recoveryPartners.map((partner) => partner.id === partnerId
        ? { ...partner, ...updates }
        : partner),
    }));
  }, []);

  const confirmWasteReceipt = useCallback((listingId, quantityReceived) => {
    const timestamp = new Date().toISOString();
    setData((prev) => {
      const listing = prev.listings.find((item) => item.id === listingId);
      if (!listing || listing.category !== "organic_waste" || !["accepted", "pickup_scheduled", "picked_up", "received"].includes(listing.status)) return prev;
      const received = Number(quantityReceived);
      if (!Number.isFinite(received) || received < 0 || received > Number(listing.quantity)) return prev;
      return {
        ...prev,
        listings: prev.listings.map((item) => item.id === listingId
          ? { ...item, status: "completed", receivedQuantity: received, receivedAt: timestamp, completedAt: timestamp }
          : item),
        notifications: [
          { id: `N${Date.now()}`, title: "Waste collection completed", message: `${listing.title}: recovery partner confirmed ${received} ${listing.unit} received.`, type: "success", timestamp, read: false, forRole: "supplier" },
          ...prev.notifications,
        ],
      };
    });
  }, []);

  const markRecipientPickup = useCallback((requestId) => {
    const timestamp = new Date().toISOString();
    setData((prev) => {
      const request = (prev.requests || []).find((item) => item.id === requestId);
      if (!request || request.fulfillmentMethod !== "self_pickup" || !["accepted", "pickup_scheduled"].includes(request.status)) return prev;
      return {
        ...prev,
        requests: prev.requests.map((item) => item.id === requestId ? { ...item, status: "picked_up", pickedUpAt: timestamp, updatedAt: timestamp } : item),
        listings: prev.listings.map((item) => item.id === request.listingId ? { ...item, status: "picked_up", pickedUpAt: timestamp } : item),
      };
    });
  }, []);

  const updateListing = useCallback((id, updates) => {
    setData((prev) => ({
      ...prev,
      listings: prev.listings.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  }, []);

  const deleteListing = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      listings: prev.listings.filter((l) => l.id !== id),
    }));
  }, []);

  // --- Accept listing (by recipient or recovery partner) ---
  const acceptListing = useCallback((id, accepterId, accepterName) => {
    setData((prev) => ({
      ...prev,
      listings: prev.listings.map((l) => {
        if (l.id !== id) return l;
        const newStatus = "accepted";
        return {
          ...l,
          status: newStatus,
          acceptedBy: accepterId,
          acceptedByName: accepterName,
        };
      }),
      notifications: [
        {
          id: `N${Date.now()}`,
          title: "Listing accepted",
          message: `${accepterName} accepted listing '${prev.listings.find((l) => l.id === id)?.title}'.`,
          type: "success",
          timestamp: new Date().toISOString(),
          read: false,
          forRole: "supplier",
        },
        ...prev.notifications,
      ],
    }));
  }, []);

  // --- Schedule pickup ---
  const schedulePickup = useCallback((id, deliveryId, deliveryName) => {
    const timestamp = new Date().toISOString();
    setData((prev) => ({
      ...prev,
      listings: prev.listings.map((l) =>
        l.id === id
          ? { ...l, status: "pickup_scheduled", deliveryId, deliveryPartnerName: deliveryName, pickupScheduledAt: timestamp }
          : l
      ),
      requests: (prev.requests || []).map((request) => request.listingId === id && ["accepted", "pickup_scheduled"].includes(request.status)
        ? { ...request, status: "pickup_scheduled", deliveryPartnerId: deliveryId, deliveryPartnerName: deliveryName, updatedAt: timestamp }
        : request),
      notifications: [
        {
          id: `N${Date.now()}`,
          title: "Pickup scheduled",
          message: `Pickup scheduled for '${prev.listings.find((l) => l.id === id)?.title}'.`,
          type: "warning",
          timestamp: new Date().toISOString(),
          read: false,
          forRole: "delivery",
        },
        ...prev.notifications,
      ],
    }));
  }, []);

  // --- Mark as picked up ---
  const markPickedUp = useCallback((id) => {
    const timestamp = new Date().toISOString();
    setData((prev) => ({
      ...prev,
      listings: prev.listings.map((l) =>
        l.id === id ? { ...l, status: "picked_up", pickedUpAt: timestamp } : l
      ),
      requests: (prev.requests || []).map((request) => request.listingId === id && ["accepted", "pickup_scheduled"].includes(request.status)
        ? { ...request, status: "picked_up", pickedUpAt: timestamp, updatedAt: timestamp }
        : request),
      notifications: [
        {
          id: `N${Date.now()}`,
          title: "Item picked up",
          message: `'${prev.listings.find((l) => l.id === id)?.title}' has been picked up.`,
          type: "info",
          timestamp: new Date().toISOString(),
          read: false,
          forRole: "supplier",
        },
        ...prev.notifications,
      ],
    }));
  }, []);

  // --- Mark as delivered ---
  const markDelivered = useCallback((id) => {
    setData((prev) => {
      const listing = prev.listings.find((l) => l.id === id);
      const newStatus = listing?.category === "organic_waste" ? "received" : "delivered";
      const timestamp = new Date().toISOString();
      return {
        ...prev,
        listings: prev.listings.map((l) =>
          l.id === id ? { ...l, status: newStatus, deliveredAt: timestamp } : l
        ),
        requests: (prev.requests || []).map((request) => request.listingId === id && ["accepted", "pickup_scheduled", "picked_up"].includes(request.status)
          ? { ...request, status: "delivered", deliveredAt: timestamp, updatedAt: timestamp }
          : request),
        notifications: [
          {
            id: `N${Date.now()}`,
            title: "Item delivered",
            message: `'${listing?.title}' has been delivered.`,
            type: "success",
            timestamp: new Date().toISOString(),
            read: false,
            forRole: listing?.category === "organic_waste" ? "recovery" : "recipient",
          },
          ...prev.notifications,
        ],
      };
    });
  }, []);

  // --- Mark as completed (edible) ---
  const markCompleted = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      listings: prev.listings.map((l) =>
        l.id === id ? { ...l, status: "completed", completedAt: new Date().toISOString() } : l
      ),
      notifications: [
        {
          id: `N${Date.now()}`,
          title: "Listing completed",
          message: `'${prev.listings.find((l) => l.id === id)?.title}' is completed.`,
          type: "success",
          timestamp: new Date().toISOString(),
          read: false,
          forRole: "supplier",
        },
        ...prev.notifications,
      ],
    }));
  }, []);

  // --- Update waste processing status ---
  const updateWasteStatus = useCallback((id, newStatus) => {
    const timestamp = new Date().toISOString();
    setData((prev) => ({
      ...prev,
      listings: prev.listings.map((l) => (l.id === id ? { ...l, status: newStatus, ...(newStatus === "picked_up" ? { pickedUpAt: timestamp } : {}) } : l)),
      notifications: [
        {
          id: `N${Date.now()}`,
          title: "Waste processing update",
          message: `'${prev.listings.find((l) => l.id === id)?.title}' status changed to ${newStatus}.`,
          type: "info",
          timestamp: new Date().toISOString(),
          read: false,
          forRole: "supplier",
        },
        ...prev.notifications,
      ],
    }));
  }, []);

  // --- Notifications ---
  const markNotificationRead = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback((role) => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.forRole === role ? { ...n, read: true } : n
      ),
    }));
  }, []);

  const addNotification = useCallback((notification) => {
    setData((prev) => ({
      ...prev,
      notifications: [
        {
          id: `N${Date.now()}`,
          timestamp: new Date().toISOString(),
          read: false,
          ...notification,
        },
        ...prev.notifications,
      ],
    }));
  }, []);

  const value = {
    ...data,
    currentRole,
    selectRole,
    logout,
    resetDemoData,
    addListing,
    submitFoodRequest,
    updateFoodRequest,
    confirmFoodReceipt,
    reportFoodIssue,
    updateRecipientProfile,
    updateSupplierProfile,
    updateRecoveryProfile,
    confirmWasteReceipt,
    markRecipientPickup,
    updateListing,
    deleteListing,
    acceptListing,
    schedulePickup,
    markPickedUp,
    markDelivered,
    markCompleted,
    updateWasteStatus,
    markNotificationRead,
    markAllNotificationsRead,
    addNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
