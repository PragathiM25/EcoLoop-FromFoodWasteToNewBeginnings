import { useState } from "react";
import { Apple, Recycle, Truck, MapPin, Clock3 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { FOOD_CATEGORIES } from "../data/seedData";
import StatusBadge from "../components/StatusBadge";
import CreateListingModal from "../components/shared/CreateListingModal";

const statusText = {
  available: "Waiting",
  accepted: "Accepted",
  pickup_scheduled: "Pickup Today",
  picked_up: "Picked Up",
  delivered: "Waiting for receiver",
  received: "Received",
  completed: "Completed",
  processing: "Received",
  processed: "Completed",
};

export default function SupplierDashboard() {
  const { listings, suppliers = [], requests = [], updateFoodRequest, markDelivered } = useApp();
  const [section, setSection] = useState("home");
  const [formCategory, setFormCategory] = useState(FOOD_CATEGORIES.EDIBLE);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");
  const supplier = suppliers[0];
  const myListings = listings.filter((listing) => !supplier || listing.supplierId === supplier.id);
  const waiting = myListings.filter((listing) => ["accepted", "pickup_scheduled", "picked_up", "delivered", "received"].includes(listing.status));
  const latest = [...myListings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  const myRequests = requests.filter((request) => myListings.some((listing) => listing.id === request.listingId));

  function add(category) {
    setFormCategory(category);
    setShowForm(true);
  }

  function statusLabel(status) {
    return statusText[status] || "Waiting";
  }

  return <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
    <header className="mb-6">
      <p className="text-sm font-semibold text-forest-700">Food Supplier</p>
      <h1 className="mt-1 text-2xl font-bold text-forest-900">Hello{supplier?.name ? `, ${supplier.name}` : ""}</h1>
      <p className="mt-2 text-base text-forest-600">What would you like to do today?</p>
    </header>

    {notice && <p role="status" className="mb-4 rounded-lg bg-mint-50 p-4 text-base font-medium text-forest-800">{notice}</p>}

    {section === "home" ? <>
      <div className="grid gap-3 sm:grid-cols-3">
        <ActionButton icon={Apple} label="Give Surplus Food" onClick={() => add(FOOD_CATEGORIES.EDIBLE)} />
        <ActionButton icon={Recycle} label="Give Organic Waste" onClick={() => add(FOOD_CATEGORIES.ORGANIC_WASTE)} />
        <ActionButton icon={Truck} label="Track My Collection" onClick={() => setSection("tracking")} />
      </div>
      <section className="mt-8 rounded-xl border border-beige-200 bg-white p-5">
        <h2 className="text-lg font-bold text-forest-900">Food waiting for pickup</h2>
        <p className="mt-1 text-base text-forest-600">{waiting.length} collection{waiting.length === 1 ? "" : "s"} in progress</p>
        {waiting.length ? <div className="mt-4 space-y-3">{waiting.slice(0, 3).map((listing) => <ListingRow key={listing.id} listing={listing} statusLabel={statusLabel} />)}</div> : <p className="mt-4 rounded-lg bg-beige-50 p-4 text-base text-forest-600">Nothing is waiting for pickup.</p>}
      </section>
      <section className="mt-4 rounded-xl border border-beige-200 bg-white p-5">
        <h2 className="text-lg font-bold text-forest-900">Latest collection status</h2>
        {latest ? <div className="mt-3"><ListingRow listing={latest} statusLabel={statusLabel} /></div> : <p className="mt-3 text-base text-forest-600">Your new food and waste offers will show here.</p>}
      </section>
    </> : <>
      <button onClick={() => setSection("home")} className="mb-5 min-h-12 text-base font-semibold text-forest-700 underline">Back to home</button>
      <h2 className="mb-4 text-xl font-bold text-forest-900">My collections</h2>
      {myRequests.filter((request) => request.status === "pending").map((request) => <article key={request.id} className="mb-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
        <p className="text-base font-bold text-forest-900">Food request from {request.recipientName}</p>
        <p className="mt-1 text-base text-forest-700">{request.quantity} {myListings.find((listing) => listing.id === request.listingId)?.unit} · serving {request.peopleServed} people</p>
        <div className="mt-3 flex gap-3"><button onClick={() => updateFoodRequest(request.id, { status: "rejected" })} className="min-h-12 rounded-lg border border-red-300 px-4 text-base font-semibold text-red-700">Decline</button><button onClick={() => updateFoodRequest(request.id, { status: "accepted" })} className="min-h-12 rounded-lg bg-green-700 px-5 text-base font-semibold text-white">Accept request</button></div>
      </article>)}
      {myListings.length ? <div className="space-y-3">{myListings.map((listing) => <article key={listing.id} className="rounded-xl border border-beige-200 bg-white p-4">
        <ListingRow listing={listing} statusLabel={statusLabel} />
        {listing.category === "edible" && listing.fulfillmentMethod === "supplier_delivery" && ["accepted", "pickup_scheduled", "picked_up"].includes(listing.status) && <button onClick={() => markDelivered(listing.id)} className="mt-4 min-h-12 w-full rounded-lg bg-green-700 px-4 text-base font-bold text-white">Confirm Delivery</button>}
      </article>)}</div> : <p className="rounded-xl bg-beige-50 p-5 text-base text-forest-600">No collections yet.</p>}
    </>}

    <CreateListingModal isOpen={showForm} onClose={() => setShowForm(false)} initialCategory={formCategory} onCreated={(message) => { setNotice(message); window.setTimeout(() => setNotice(""), 4000); }} />
  </main>;
}

function ActionButton({ icon: Icon, label, onClick }) {
  return <button onClick={onClick} className="flex min-h-28 items-center gap-4 rounded-xl border border-forest-200 bg-white p-5 text-left text-lg font-bold text-forest-900 shadow-sm hover:bg-mint-50 focus:outline-none focus:ring-4 focus:ring-mint-200"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-mint-100 text-forest-700"><Icon size={28} aria-hidden="true" /></span>{label}</button>;
}

function ListingRow({ listing, statusLabel }) {
  const isWaste = listing.category === "organic_waste";
  return <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2"><h3 className="text-base font-bold text-forest-900">{listing.title}</h3><span className={`rounded-full px-3 py-1 text-sm font-semibold ${["completed", "processed"].includes(listing.status) ? "bg-green-100 text-green-800" : ["rejected"].includes(listing.status) ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-900"}`}>{statusLabel(listing.status)}</span></div>
      <p className="mt-1 text-base text-forest-700">{listing.quantity} {listing.unit} · {isWaste ? "Organic waste" : "Food"}</p>
      <p className="mt-1 flex items-center gap-2 text-sm text-forest-600"><MapPin size={16} />{listing.location}</p>
      {listing.readyAt && <p className="mt-1 flex items-center gap-2 text-sm text-forest-600"><Clock3 size={16} />Pickup {new Date(listing.readyAt).toLocaleString()}</p>}
      {!isWaste && !listing.safetyVerified && <p className="mt-2 text-sm font-semibold text-red-700">Not offered: food safety check is incomplete.</p>}
    </div>
    <StatusBadge status={listing.status} />
  </div>;
}
