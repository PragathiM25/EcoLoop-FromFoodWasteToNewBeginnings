import { useMemo, useState } from "react";
import { Check, Clock3, Heart, MapPin, Search, ShieldCheck, Truck } from "lucide-react";
import { useApp } from "../context/AppContext";
import Modal from "../components/Modal";

const labelFor = {
  pending: "Waiting", accepted: "Accepted", pickup_scheduled: "Pickup Today",
  picked_up: "Picked Up", delivered: "Delivered", completed: "Completed",
  rejected: "Not accepted", cancelled: "Cancelled",
};

function dateText(value) {
  if (!value) return "Time not set";
  return new Date(value).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function availableQuantity(listing, requests) {
  const reserved = requests.filter((request) => request.listingId === listing.id && !["rejected", "cancelled"].includes(request.status)).reduce((sum, request) => sum + Number(request.status === "completed" ? request.receivedQuantity ?? request.quantity : request.quantity || 0), 0);
  return Math.max(0, Number(listing.quantity) - reserved);
}

export default function RecipientDashboard() {
  const { listings = [], requests = [], recipients = [], deliveryPartners = [], submitFoodRequest, updateFoodRequest, confirmFoodReceipt, markRecipientPickup, reportFoodIssue } = useApp();
  const recipient = recipients[0];
  const [section, setSection] = useState("home");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ quantity: "", people: "", time: "", method: "self_pickup", partnerId: "" });
  const [error, setError] = useState("");
  const [received, setReceived] = useState(null);
  const [actualQuantity, setActualQuantity] = useState("");
  const [problem, setProblem] = useState(null);
  const [problemText, setProblemText] = useState("");
  const [message, setMessage] = useState("");

  const mine = useMemo(() => requests.filter((request) => request.recipientId === recipient?.id), [requests, recipient]);
  const offers = listings.filter((listing) => listing.category === "edible" && listing.safetyVerified && ["available", "accepted"].includes(listing.status) && availableQuantity(listing, requests) > 0 && (!listing.collectionDeadline || new Date(listing.collectionDeadline).getTime() > Date.now()) && (!search || `${listing.title} ${listing.location} ${listing.supplier}`.toLowerCase().includes(search.toLowerCase())));
  const needsReceipt = mine.filter((request) => ["delivered", "picked_up"].includes(request.status));

  function openRequest(listing) {
    setSelected(listing);
    setForm({ quantity: "", people: "", time: listing.readyAt ? new Date(listing.readyAt).toISOString().slice(0, 16) : "", method: "self_pickup", partnerId: "" });
    setError("");
  }

  function sendRequest(event) {
    event.preventDefault();
    if (!recipient) return setError("No organization account is available.");
    if (!Number(form.quantity) || Number(form.quantity) < 1) return setError("Enter how much food you need.");
    if (!Number(form.people) || Number(form.people) < 1) return setError("Enter how many people will eat.");
    if (!form.time) return setError("Choose when you can collect the food.");
    if (form.method === "partner_delivery" && !form.partnerId) return setError("Choose a delivery partner.");
    const partner = deliveryPartners.find((item) => item.id === form.partnerId);
    const result = submitFoodRequest({
      listingId: selected.id, recipientId: recipient.id, recipientName: recipient.name,
      quantity: Number(form.quantity), peopleServed: Number(form.people),
      collectionTime: new Date(form.time).toISOString(), fulfillmentMethod: form.method,
      deliveryPartnerId: partner?.id || "", deliveryPartnerName: partner?.name || "",
    });
    if (!result?.ok) return setError(result?.error || "Could not send the request. Please try again.");
    setSelected(null);
    showMessage("Request sent. The supplier will reply here.");
  }

  function showMessage(text) {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 4000);
  }

  function requestReceipt(event) {
    event.preventDefault();
    if (!Number.isFinite(Number(actualQuantity)) || Number(actualQuantity) < 0 || Number(actualQuantity) > Number(received.quantity)) return;
    confirmFoodReceipt(received.id, Number(actualQuantity));
    setReceived(null);
    showMessage("Food received. Thank you for confirming.");
  }

  function sendProblem(event) {
    event.preventDefault();
    if (!problemText.trim()) return;
    reportFoodIssue(problem.id, { type: "delivery problem", details: problemText.trim() });
    setProblem(null);
    setProblemText("");
    showMessage("Your report was sent.");
  }

  return <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
    <header className="mb-6"><p className="text-sm font-semibold text-forest-700">Food Recipient</p><h1 className="mt-1 text-2xl font-bold text-forest-900">Welcome, {recipient?.name || "community partner"}</h1><p className="mt-2 text-base text-forest-600">Find food for the people you serve.</p></header>
    {message && <p role="status" className="mb-4 rounded-lg bg-green-50 p-4 text-base font-semibold text-green-900">{message}</p>}
    {section === "home" ? <>
      <div className="grid gap-3 sm:grid-cols-3"><ActionButton icon={Search} label="Find Food" onClick={() => setSection("food")} /><ActionButton icon={Heart} label="My Requests" onClick={() => setSection("requests")} /><ActionButton icon={Check} label="Confirm Food Received" onClick={() => setSection("confirm")} /></div>
      <section className="mt-8 rounded-xl border border-beige-200 bg-white p-5"><h2 className="text-lg font-bold text-forest-900">Your food requests</h2>{mine.length ? <div className="mt-3 space-y-3">{mine.slice(0, 4).map((request) => <RequestRow key={request.id} request={request} listing={listings.find((listing) => listing.id === request.listingId)} />)}</div> : <p className="mt-3 text-base text-forest-600">You have not requested food yet.</p>}</section>
    </> : <>
      <button onClick={() => setSection("home")} className="mb-5 min-h-12 text-base font-semibold text-forest-700 underline">Back to home</button>
      {section === "food" && <section><h2 className="mb-2 text-xl font-bold text-forest-900">Find Food</h2><p className="mb-4 text-base text-forest-600">Only food checked as safe is shown here.</p><label className="mb-4 block"><span className="sr-only">Search food or address</span><span className="relative block"><Search size={18} className="absolute left-3 top-3 text-forest-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search food or pickup place" className="input-field min-h-12 pl-10 text-base" /></span></label>{offers.length ? <div className="space-y-3">{offers.map((listing) => <article key={listing.id} className="rounded-xl border border-beige-200 bg-white p-5"><h3 className="text-lg font-bold text-forest-900">{listing.title}</h3><p className="mt-2 text-base text-forest-700">{availableQuantity(listing, requests)} {listing.unit} available</p><p className="mt-2 flex items-center gap-2 text-base text-forest-700"><MapPin size={18} />{listing.location}</p><p className="mt-2 flex items-center gap-2 text-base text-forest-700"><Clock3 size={18} />Collect by {dateText(listing.collectionDeadline)}</p><p className="mt-2 flex items-center gap-2 text-sm font-semibold text-green-800"><ShieldCheck size={18} />Food safety checked</p>{listing.allergens && <p className="mt-2 rounded-lg bg-orange-50 p-3 text-sm text-orange-900">Allergens: {listing.allergens}</p>}<button onClick={() => openRequest(listing)} className="mt-4 min-h-12 w-full rounded-lg bg-green-700 px-5 text-base font-bold text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200">Request Food</button></article>)}</div> : <p className="rounded-xl bg-beige-50 p-5 text-base text-forest-700">No food offers are available right now.</p>}</section>}
      {section === "requests" && <section><h2 className="mb-4 text-xl font-bold text-forest-900">My Requests</h2>{mine.length ? <div className="space-y-3">{mine.map((request) => <article key={request.id} className="rounded-xl border border-beige-200 bg-white p-4"><RequestRow request={request} listing={listings.find((listing) => listing.id === request.listingId)} /><div className="mt-3 flex flex-wrap gap-2">{request.status === "pending" && <button onClick={() => updateFoodRequest(request.id, { status: "cancelled" })} className="min-h-12 rounded-lg border border-red-300 px-4 text-base font-semibold text-red-800">Cancel request</button>}{["accepted", "pickup_scheduled"].includes(request.status) && request.fulfillmentMethod === "self_pickup" && <button onClick={() => { markRecipientPickup(request.id); showMessage("Pickup confirmed. Please confirm receipt when you have checked the food."); }} className="min-h-12 rounded-lg bg-orange-500 px-4 text-base font-bold text-white">Confirm Pickup</button>}{["completed"].includes(request.status) && !request.issueReport && <button onClick={() => setProblem(request)} className="min-h-12 rounded-lg border border-orange-300 px-4 text-base font-semibold text-orange-900">Report a problem</button>}</div>{request.issueReport && <p className="mt-3 rounded-lg bg-orange-50 p-3 text-sm text-orange-900">Problem reported: {request.issueReport.details}</p>}</article>)}</div> : <p className="rounded-xl bg-beige-50 p-5 text-base text-forest-700">Your requests will appear here.</p>}</section>}
      {section === "confirm" && <section><h2 className="mb-2 text-xl font-bold text-forest-900">Confirm Food Received</h2><p className="mb-4 text-base text-forest-600">Check the food and quantity before confirming. This marks the request as completed.</p>{needsReceipt.length ? <div className="space-y-3">{needsReceipt.map((request) => <article key={request.id} className="rounded-xl border border-orange-200 bg-white p-4"><RequestRow request={request} listing={listings.find((listing) => listing.id === request.listingId)} /><button onClick={() => { setReceived(request); setActualQuantity(String(request.quantity)); }} className="mt-4 min-h-12 w-full rounded-lg bg-green-700 px-5 text-base font-bold text-white">Confirm Food Received</button></article>)}</div> : <p className="rounded-xl bg-beige-50 p-5 text-base text-forest-700">No food is waiting for receipt confirmation.</p>}</section>}
    </>}

    <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Request Food">
      {selected && <form onSubmit={sendRequest} className="space-y-4"><p className="text-base text-forest-700">{selected.title} · {availableQuantity(selected, requests)} {selected.unit} available</p><label className="block"><span className="label-text text-base">Quantity needed</span><input required type="number" min="1" max={availableQuantity(selected, requests)} value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} className="input-field min-h-12 text-base" /></label><label className="block"><span className="label-text text-base">People to serve</span><input required type="number" min="1" value={form.people} onChange={(event) => setForm({ ...form, people: event.target.value })} className="input-field min-h-12 text-base" /></label><label className="block"><span className="label-text text-base">When can you collect it?</span><input required type="datetime-local" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} className="input-field min-h-12 text-base" /></label><label className="block"><span className="label-text text-base">How will you collect it?</span><select value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })} className="input-field min-h-12 text-base"><option value="self_pickup">We will collect it</option><option value="partner_delivery">A delivery partner will bring it</option></select></label>{form.method === "partner_delivery" && <label className="block"><span className="label-text text-base">Delivery partner</span><select required value={form.partnerId} onChange={(event) => setForm({ ...form, partnerId: event.target.value })} className="input-field min-h-12 text-base"><option value="">Choose a partner</option>{deliveryPartners.filter((partner) => partner.available !== false).map((partner) => <option key={partner.id} value={partner.id}>{partner.name}</option>)}</select></label>}{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-base font-semibold text-red-800">{error}</p>}<button className="min-h-12 w-full rounded-lg bg-green-700 px-5 text-base font-bold text-white" type="submit">Send Request</button></form>}
    </Modal>

    <Modal isOpen={!!received} onClose={() => setReceived(null)} title="Confirm Food Received">
      {received && <form onSubmit={requestReceipt} className="space-y-4"><p className="text-base text-forest-700">How much did you actually receive?</p><label className="block"><span className="label-text text-base">Quantity received ({listings.find((listing) => listing.id === received.listingId)?.unit})</span><input required type="number" min="0" max={received.quantity} value={actualQuantity} onChange={(event) => setActualQuantity(event.target.value)} className="input-field min-h-12 text-base" /></label><button type="submit" className="min-h-12 w-full rounded-lg bg-green-700 px-5 text-base font-bold text-white">Confirm and Complete</button></form>}
    </Modal>

    <Modal isOpen={!!problem} onClose={() => setProblem(null)} title="Report a problem">
      {problem && <form onSubmit={sendProblem} className="space-y-4"><p className="text-base text-forest-700">Tell the supplier what was wrong with the food.</p><textarea required rows="4" value={problemText} onChange={(event) => setProblemText(event.target.value)} className="input-field text-base" placeholder="Food was damaged, incorrect, or unsafe..." /><button type="submit" className="min-h-12 w-full rounded-lg bg-orange-600 px-5 text-base font-bold text-white">Send Report</button></form>}
    </Modal>
  </main>;
}

function ActionButton({ icon: Icon, label, onClick }) {
  return <button onClick={onClick} className="flex min-h-28 items-center gap-4 rounded-xl border border-forest-200 bg-white p-5 text-left text-lg font-bold text-forest-900 shadow-sm hover:bg-mint-50 focus:outline-none focus:ring-4 focus:ring-mint-200"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-mint-100 text-forest-700"><Icon size={28} aria-hidden="true" /></span>{label}</button>;
}

function RequestRow({ request, listing }) {
  const status = labelFor[request.status] || "Waiting";
  const color = request.status === "completed" ? "bg-green-100 text-green-900" : ["rejected", "cancelled"].includes(request.status) ? "bg-red-100 text-red-900" : "bg-orange-100 text-orange-900";
  return <div><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-base font-bold text-forest-900">{listing?.title || "Food offer"}</h3><span className={`rounded-full px-3 py-1 text-sm font-bold ${color}`}>{status}</span></div><p className="mt-2 text-base text-forest-700">{request.quantity} {listing?.unit || "units"} · for {request.peopleServed} people</p><p className="mt-2 flex items-center gap-2 text-sm text-forest-600"><MapPin size={16} />{listing?.location || "Pickup address not set"}</p><p className="mt-1 flex items-center gap-2 text-sm text-forest-600"><Clock3 size={16} />{dateText(request.collectionTime)}</p>{request.fulfillmentMethod === "partner_delivery" && <p className="mt-1 flex items-center gap-2 text-sm text-forest-600"><Truck size={16} />{request.deliveryPartnerName || "Delivery partner"}</p>}</div>;
}
