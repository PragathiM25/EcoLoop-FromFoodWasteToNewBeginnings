import { Link, useNavigate } from "react-router-dom";
import { Home, LogOut } from "lucide-react";
import { useApp } from "../context/AppContext";
import { ROLE_LABELS } from "../data/seedData";
import Logo from "./Logo";

export default function Navbar() {
  const { currentRole, logout } = useApp();
  const navigate = useNavigate();

  function goHome() {
    logout();
    navigate("/");
  }

  return <header className="border-b border-beige-200 bg-white">
    <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
      <Link to={currentRole ? `/dashboard/${currentRole}` : "/"} aria-label="EcoLoop home"><Logo size="sm" showText /></Link>
      {currentRole && <div className="flex items-center gap-2"><span className="hidden text-sm font-semibold text-forest-700 sm:inline">{ROLE_LABELS[currentRole]}</span><button onClick={goHome} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-forest-800 hover:bg-mint-50 focus:outline-none focus:ring-4 focus:ring-mint-200" aria-label="Log out and go home"><LogOut size={18} /><span>Log out</span></button></div>}
      {!currentRole && <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-forest-800 hover:bg-mint-50"><Home size={18} />Home</Link>}
    </div>
  </header>;
}
