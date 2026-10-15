import { useState } from "react";
import { Check, Clock3, MapPin, Package, Truck } from "lucide-react";
import { useApp } from "../context/AppContext";

function showTime(value) {
  return value ? new Date(value).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Time not set";
}

export default function DeliveryDashboard() {
  const { listings = [], deliveryPartners = [], schedulePickup, markPickedUp, markDelivered } = useApp();
  const partner = deliveryPartners[0];
  const [section, setSection] = useState("home");
  const [notice, setNotice] = useState("");
  const eligible = listings.filter((listing) => {
    if (!["accepted", "pickup_scheduled", "picked_up", "delivered", "received", "completed"].includes(listing.status)) return false;
    if (listing.category === "edible" && (!listing.safetyVerified || listing.fulfillmentMethod !== "partner_delivery")) return false;
    if (listing.category === "organic_waste" && !listing.deliveryId) return false;
    return !listing.deliveryId || listing.deliveryId === partner?.id;
  });
  const availableJobs = eligible.filter((listing) => listing.status === "accepted");
  const activeJobs = eligible.filter((listing) => ["pickup_scheduled", "picked_up", "delivered", "received"].includes(listing.status));
  const completedJobs = eligible.filter((listing) => listing.status === "completed");

  function inform(text) {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 4000);
  }

  function heading(status) {
    if (status === "pickup_scheduled") return "Pickup Today";
    if (status === "picked_up") return "Picked Up";
    if (status === "delivered" || status === "received") return "Waiting for receiver";
    if (status === "completed") return "Completed";
    return "Waiting";
  }

  return <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
    <header className="mb-6"><p className="text-sm font-semibold text-forest-700">Delivery Partner</p><h1 className="mt-1 text-2xl font-bold text-forest-900">Welcome, {partner?.name || "delivery partner"}</h1><p className="mt-2 text-base text-forest-600">Your delivery list is shared with EcoLoop.</p></header>
    {notice && <p role="status" className="mb-4 rounded-lg bg-green-50 p-4 text-base font-semibold text-green-900">{notice}</p>}
    {section === "home" ? <>
      <div className="grid gap-3 sm:grid-cols-3"><ActionButton icon={SearchIcon} label="Find Deliveries" onClick={() => setSection("find")} /><ActionButton icon={Truck} label="My Pickups" onClick={() => setSection("pickups")} /><ActionButton icon={Check} label="My Completed Deliveries" onClick={() => setSection("completed")} /></div>
      <section className="mt-8 rounded-xl border border-beige-200 bg-white p-5"><h2 className="text-lg font-bold text-forest-900">Next pickup</h2>{activeJobs.length ? <DeliveryCard listing={activeJobs[0]} onAction={(listing) => advance(listing)} heading={heading} /> : <p className="mt-3 text-base text-forest-600">No pickups are assigned to you right now.</p>}</section>
    </> : <>
      <button onClick={() => setSection("home")} className="mb-5 min-h-12 text-base font-semibold text-forest-700 underline">Back to home</button>
      {section === "find" && <section><h2 className="mb-2 text-xl font-bold text-forest-900">Find Deliveries</h2><p className="mb-4 text-base text-forest-600">Food and organic waste jobs are clearly marked and kept separate.</p>{availableJobs.length ? <div className="space-y-3">{availableJobs.map((listing) => <DeliveryCard key={listing.id} listing={listing} onAction={(item) => { schedulePickup(item.id, partner.id, partner.name); inform("Job accepted. Pickup time is set."); }} action="Accept Job" heading={heading} />)}</div> : <Empty text="No deliveries need a driver right now." />}</section>}
      {section === "pickups" && <section><h2 className="mb-3 text-xl font-bold text-forest-900">My Pickups</h2>{activeJobs.length ? <div className="space-y-3">{activeJobs.map((listing) => <DeliveryCard key={listing.id} listing={listing} onAction={(item) => advance(item)} heading={heading} />)}</div> : <Empty text="Jobs you accept will appear here." />}</section>}
      {section === "completed" && <section><h2 className="mb-2 text-xl font-bold text-forest-900">My Completed Deliveries</h2><p className="mb-4 text-base text-forest-600">A delivery appears here only after the receiver confirms they got it.</p>{completedJobs.length ? <div className="space-y-3">{completedJobs.map((listing) => <DeliveryCard key={listing.id} listing={listing} heading={heading} />)}</div> : <Empty text="No deliveries have been confirmed by a receiver yet." />}</section>}
    </>}
  </main>;

  function advance(listing) {
    if (listing.status === "pickup_scheduled") {
      markPickedUp(listing.id);
      inform("Pickup confirmed. Take the goods to the receiver.");
    } else if (listing.status === "picked_up") {
      markDelivered(listing.id);
      inform("Delivery reported. Waiting for the receiver to confirm receipt.");
    }
  }
}

function SearchIcon() {
  return <Package size={28} aria-hidden="true" />;
}

function ActionButton({ icon: Icon, label, onClick }) {
  return <button onClick={onClick} className="flex min-h-28 items-center gap-4 rounded-xl border border-forest-200 bg-white p-5 text-left text-lg font-bold text-forest-900 shadow-sm hover:bg-mint-50 focus:outline-none focus:ring-4 focus:ring-mint-200"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-mint-100 text-forest-700"><Icon size={28} aria-hidden="true" /></span>{label}</button>;
}

function DeliveryCard({ listing, onAction, action, heading }) {
  const waste = listing.category === "organic_waste";
  const actionText = action || (listing.status === "pickup_scheduled" ? "Confirm Pickup" : listing.status === "picked_up" ? "Confirm Delivery" : "");
  const canAct = Boolean(onAction && actionText);
  return <article className="rounded-xl border border-beige-200 bg-white p-5">
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-bold text-forest-900">{waste ? "Organic waste" : "Food"}</h3><span className={`rounded-full px-3 py-1 text-sm font-bold ${listing.status === "completed" ? "bg-green-100 text-green-900" : ["accepted", "pickup_scheduled"].includes(listing.status) ? "bg-orange-100 text-orange-900" : "bg-green-50 text-green-800"}`}>{heading(listing.status)}</span></div>
    <p className="mt-3 flex items-center gap-2 text-base text-forest-800"><Package size={18} />{listing.title} · {listing.quantity} {listing.unit}</p>
    <p className="mt-3 flex items-start gap-2 text-base text-forest-700"><MapPin size={18} className="mt-0.5 shrink-0" /><span>Collect from: <strong>{listing.supplier}</strong><br />{listing.location}</span></p>
    <p className="mt-2 flex items-start gap-2 text-base text-forest-700"><MapPin size={18} className="mt-0.5 shrink-0" /><span>Deliver to: <strong>{listing.acceptedByName || "Receiving partner"}</strong></span></p>
    <p className="mt-2 flex items-center gap-2 text-base text-forest-700"><Clock3 size={18} />Collect at: {showTime(listing.pickupScheduledAt || listing.readyAt || listing.collectionDeadline)}</p>
    {canAct && <button onClick={() => onAction(listing)} className="mt-4 min-h-12 w-full rounded-lg bg-green-700 px-5 text-base font-bold text-white">{actionText}</button>}
    {!canAct && ["delivered", "received"].includes(listing.status) && <p className="mt-4 rounded-lg bg-orange-50 p-3 text-base font-semibold text-orange-900">Waiting for the receiver to confirm. Do not mark this job complete.</p>}
  </article>;
}

function Empty({ text }) {
  return <p className="rounded-xl bg-beige-50 p-5 text-base text-forest-700">{text}</p>;
}
