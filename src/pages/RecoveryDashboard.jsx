import { useState } from "react";
import { Check, Clock3, MapPin, Recycle, Settings2 } from "lucide-react";
import { useApp } from "../context/AppContext";

const WASTE_TYPES = [
  ["food_scraps", "Food scraps"], ["produce", "Fruit and vegetable scraps"],
  ["coffee", "Coffee grounds"], ["other", "Other organic waste"],
];

function timeText(value) {
  return value ? new Date(value).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Time not set";
}

export default function RecoveryDashboard() {
  const { listings = [], recoveryPartners = [], deliveryPartners = [], acceptListing, updateListing, updateWasteStatus, confirmWasteReceipt, updateRecoveryProfile } = useApp();
  const partner = recoveryPartners[0];
  const [section, setSection] = useState("home");
  const [notice, setNotice] = useState("");
  const [types, setTypes] = useState(partner?.acceptedWasteTypes || WASTE_TYPES.map(([key]) => key));
  const [capacity, setCapacity] = useState(String(partner?.capacityKg ?? partner?.capacity ?? ""));
  const accepted = listings.filter((listing) => listing.category === "organic_waste" && listing.acceptedBy === partner?.id && !["completed", "processed"].includes(listing.status));
  const activeWeight = accepted.filter((listing) => !["received"].includes(listing.status)).reduce((sum, listing) => sum + (listing.unit === "kg" ? Number(listing.quantity || 0) : 0), 0);
  const roomLeft = Math.max(0, Number(capacity || 0) - activeWeight);
  const available = listings.filter((listing) => listing.category === "organic_waste" && listing.status === "available" && types.includes(listing.foodType || "other") && (!listing.collectionDeadline || new Date(listing.collectionDeadline).getTime() > Date.now()) && (listing.unit !== "kg" || Number(listing.quantity) <= roomLeft));
  const complete = listings.filter((listing) => listing.category === "organic_waste" && listing.acceptedBy === partner?.id && ["completed", "processed"].includes(listing.status));

  function toast(text) {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 4000);
  }

  function saveSettings(event) {
    event.preventDefault();
    updateRecoveryProfile(partner.id, { acceptedWasteTypes: types, capacityKg: Number(capacity), capacity: Number(capacity) });
    toast("Settings saved.");
  }

  function acceptCollection(listing) {
    acceptListing(listing.id, partner.id, partner.name);
    toast("Collection accepted. You can now arrange pickup.");
  }

  return <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
    <header className="mb-6"><p className="text-sm font-semibold text-forest-700">Organic Waste Recovery Partner</p><h1 className="mt-1 text-2xl font-bold text-forest-900">Welcome, {partner?.name || "recovery partner"}</h1><p className="mt-2 text-base text-forest-600">Collect organic waste for composting or biogas.</p></header>
    {notice && <p role="status" className="mb-4 rounded-lg bg-green-50 p-4 text-base font-semibold text-green-900">{notice}</p>}
    {section === "home" ? <>
      <div className="grid gap-3 sm:grid-cols-3"><ActionButton icon={Recycle} label="Find Organic Waste" onClick={() => setSection("find")} /><ActionButton icon={Clock3} label="My Collections" onClick={() => setSection("collections")} /><ActionButton icon={Check} label="Confirm Waste Received" onClick={() => setSection("confirm")} /></div>
      <section className="mt-8 rounded-xl border border-beige-200 bg-white p-5"><h2 className="text-lg font-bold text-forest-900">Collections waiting</h2>{accepted.length ? <div className="mt-3 space-y-3">{accepted.slice(0, 3).map((listing) => <WasteRow key={listing.id} listing={listing} />)}</div> : <p className="mt-3 text-base text-forest-600">No collections waiting.</p>}<button onClick={() => setSection("settings")} className="mt-5 inline-flex min-h-12 items-center gap-2 text-base font-semibold text-forest-700 underline"><Settings2 size={18} />Set waste types and capacity</button></section>
    </> : <>
      <button onClick={() => setSection("home")} className="mb-5 min-h-12 text-base font-semibold text-forest-700 underline">Back to home</button>
      {section === "find" && <section><h2 className="mb-3 text-xl font-bold text-forest-900">Find Organic Waste</h2><p className="mb-4 text-base text-forest-600">Only organic waste is shown here. Food for people is kept separate.</p>{available.length ? <div className="space-y-3">{available.map((listing) => <article key={listing.id} className="rounded-xl border border-beige-200 bg-white p-5"><h3 className="text-lg font-bold text-forest-900">{listing.title}</h3><p className="mt-2 text-base text-forest-700">{listing.foodType || "Organic waste"} · {listing.quantity} {listing.unit}</p><p className="mt-2 flex items-center gap-2 text-base text-forest-700"><MapPin size={18} />{listing.location}</p><p className="mt-2 flex items-center gap-2 text-base text-forest-700"><Clock3 size={18} />Ready {timeText(listing.readyAt)} · collect by {timeText(listing.collectionDeadline)}</p><button onClick={() => acceptCollection(listing)} className="mt-4 min-h-12 w-full rounded-lg bg-green-700 px-5 text-base font-bold text-white">Accept Collection</button></article>)}</div> : <Empty text="No matching organic waste is available right now." />}</section>}
      {section === "collections" && <section><h2 className="mb-3 text-xl font-bold text-forest-900">My Collections</h2>{accepted.length ? <div className="space-y-3">{accepted.map((listing) => <article key={listing.id} className="rounded-xl border border-beige-200 bg-white p-5"><WasteRow listing={listing} />{listing.status === "accepted" && !listing.deliveryId && <div className="mt-4 grid gap-2 sm:grid-cols-2"><button onClick={() => updateWasteStatus(listing.id, "picked_up")} className="min-h-12 rounded-lg bg-orange-500 px-4 text-base font-bold text-white">Confirm Pickup</button>{deliveryPartners[0] && <button onClick={() => updateListing(listing.id, { fulfillmentMethod: "partner_delivery", deliveryId: deliveryPartners[0].id, deliveryPartnerName: deliveryPartners[0].name })} className="min-h-12 rounded-lg border border-forest-300 px-4 text-base font-bold text-forest-800">Request delivery pickup</button>}</div>}{listing.status === "accepted" && listing.deliveryId && <p className="mt-4 rounded-lg bg-orange-50 p-3 text-base font-semibold text-orange-900">Waiting for {listing.deliveryPartnerName || "the driver"} to accept the job.</p>}{listing.status === "picked_up" && <button onClick={() => setSection("confirm")} className="mt-4 min-h-12 w-full rounded-lg bg-green-700 px-4 text-base font-bold text-white">Confirm Waste Received</button>}{listing.status === "received" && <button onClick={() => setSection("confirm")} className="mt-4 min-h-12 w-full rounded-lg bg-green-700 px-4 text-base font-bold text-white">Confirm Waste Received</button>}</article>)}</div> : <Empty text="Collections you accept will appear here." />}<h3 className="mb-2 mt-8 text-lg font-bold text-forest-900">Completed collections</h3>{complete.length ? complete.map((listing) => <article key={listing.id} className="mb-3 rounded-xl border border-green-200 bg-green-50 p-4"><WasteRow listing={listing} /><p className="mt-2 text-sm font-bold text-green-900">Completed after you confirmed receipt</p></article>) : <p className="text-base text-forest-600">No completed collections yet.</p>}</section>}
      {section === "confirm" && <section><h2 className="mb-2 text-xl font-bold text-forest-900">Confirm Waste Received</h2><p className="mb-4 text-base text-forest-600">Check the waste and amount before marking it received.</p>{accepted.filter((listing) => ["picked_up", "received"].includes(listing.status)).length ? accepted.filter((listing) => ["picked_up", "received"].includes(listing.status)).map((listing) => <article key={listing.id} className="mb-3 rounded-xl border border-beige-200 bg-white p-5"><WasteRow listing={listing} /><p className="mt-3 text-sm text-forest-600">Amount received: {listing.quantity} {listing.unit}</p><button onClick={() => { confirmWasteReceipt(listing.id, listing.quantity); toast("Waste receipt confirmed. Collection completed."); }} className="mt-4 min-h-12 w-full rounded-lg bg-green-700 px-5 text-base font-bold text-white">Confirm Waste Received</button></article>) : <Empty text="No waste is waiting for receipt confirmation." />}</section>}
      {section === "settings" && <section><h2 className="mb-2 text-xl font-bold text-forest-900">Collection Settings</h2><p className="mb-4 text-base text-forest-600">Choose the waste you can take and your total capacity.</p><form onSubmit={saveSettings} className="space-y-5 rounded-xl border border-beige-200 bg-white p-5"><fieldset><legend className="mb-2 text-base font-bold text-forest-900">Waste types you accept</legend><div className="space-y-2">{WASTE_TYPES.map(([key, label]) => <label key={key} className="flex min-h-12 items-center gap-3 text-base text-forest-800"><input type="checkbox" checked={types.includes(key)} onChange={(event) => setTypes(event.target.checked ? [...types, key] : types.filter((type) => type !== key))} className="h-5 w-5 accent-green-700" />{label}</label>)}</div></fieldset><label className="block"><span className="mb-2 block text-base font-bold text-forest-900">Collection capacity (kg)</span><input required type="number" min="1" value={capacity} onChange={(event) => setCapacity(event.target.value)} className="input-field min-h-12 text-base" /></label><button type="submit" className="min-h-12 w-full rounded-lg bg-green-700 px-5 text-base font-bold text-white">Save Settings</button></form></section>}
    </>}
  </main>;
}

function ActionButton({ icon: Icon, label, onClick }) {
  return <button onClick={onClick} className="flex min-h-28 items-center gap-4 rounded-xl border border-forest-200 bg-white p-5 text-left text-lg font-bold text-forest-900 shadow-sm hover:bg-mint-50 focus:outline-none focus:ring-4 focus:ring-mint-200"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-mint-100 text-forest-700"><Icon size={28} aria-hidden="true" /></span>{label}</button>;
}

function WasteRow({ listing }) {
  const status = listing.status === "completed" || listing.status === "processed" ? "Completed" : listing.status === "picked_up" ? "Picked Up" : listing.status === "received" ? "Waiting for confirmation" : listing.status === "accepted" ? "Accepted" : "Waiting";
  const color = status === "Completed" ? "bg-green-100 text-green-900" : status === "Waiting" || status === "Accepted" ? "bg-orange-100 text-orange-900" : "bg-green-50 text-green-800";
  return <div><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-bold text-forest-900">{listing.title}</h3><span className={`rounded-full px-3 py-1 text-sm font-bold ${color}`}>{status}</span></div><p className="mt-2 text-base text-forest-700">{listing.foodType || "Organic waste"} · {listing.quantity} {listing.unit}</p><p className="mt-2 flex items-center gap-2 text-base text-forest-700"><MapPin size={18} />{listing.location}</p><p className="mt-2 flex items-center gap-2 text-base text-forest-700"><Clock3 size={18} />Pickup {timeText(listing.readyAt || listing.collectionDeadline)}</p>{listing.sortingInfo && <p className="mt-2 rounded-lg bg-beige-50 p-3 text-sm text-forest-700">Sorting: {listing.sortingInfo}</p>}</div>;
}

function Empty({ text }) {
  return <p className="rounded-xl bg-beige-50 p-5 text-base text-forest-700">{text}</p>;
}
