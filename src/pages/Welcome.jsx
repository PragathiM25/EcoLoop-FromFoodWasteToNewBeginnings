import { useNavigate } from "react-router-dom";
import { Apple, Heart, Recycle, Truck } from "lucide-react";
import { useApp } from "../context/AppContext";
import Logo from "../components/Logo";

const ROLES = [
  { id: "supplier", label: "Food Supplier", help: "Restaurant or shop", icon: Apple },
  { id: "recipient", label: "Food Recipient", help: "Community kitchen, shelter, or NGO", icon: Heart },
  { id: "recovery", label: "Organic Waste Partner", help: "Compost or biogas facility", icon: Recycle },
  { id: "delivery", label: "Delivery Partner", help: "Driver or volunteer", icon: Truck },
];

export default function Welcome() {
  const { selectRole } = useApp();
  const navigate = useNavigate();

  function enter(role) {
    selectRole(role);
    navigate(`/dashboard/${role}`);
  }

  return <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
    <div className="mb-8"><Logo size="sm" showText /><h1 className="mt-7 text-3xl font-bold text-forest-900">Welcome to EcoLoop</h1><p className="mt-2 text-lg text-forest-700">Choose your role to continue.</p></div>
    <div className="space-y-3">{ROLES.map(({ id, label, help, icon: Icon }) => <button key={id} onClick={() => enter(id)} className="flex min-h-24 w-full items-center gap-4 rounded-xl border border-forest-200 bg-white p-5 text-left shadow-sm transition-colors hover:bg-mint-50 focus:outline-none focus:ring-4 focus:ring-mint-200"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-mint-100 text-forest-700"><Icon size={28} aria-hidden="true" /></span><span><span className="block text-lg font-bold text-forest-900">{label}</span><span className="mt-1 block text-base text-forest-600">{help}</span></span></button>)}</div>
  </main>;
}
