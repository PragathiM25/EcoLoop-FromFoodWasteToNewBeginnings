import { TrendingUp, Package, Clock, CheckCircle } from "lucide-react";

export default function StatCard({ icon: Icon, label, value, sublabel, color = "forest" }) {
  const colorMap = {
    forest: { bg: "bg-forest-50", icon: "text-forest-600", border: "border-forest-200" },
    mint: { bg: "bg-mint-50", icon: "text-mint-600", border: "border-mint-200" },
    beige: { bg: "bg-beige-50", icon: "text-beige-600", border: "border-beige-200" },
    blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-200" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-200" },
    red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-200" },
  };
  const c = colorMap[color] || colorMap.forest;

  return (
    <div className={`card p-5 ${c.border}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-forest-500">{label}</p>
          <p className="text-2xl font-bold text-forest-900 mt-1">{value}</p>
          {sublabel && <p className="text-xs text-forest-400 mt-1">{sublabel}</p>}
        </div>
        <div className={`rounded-xl ${c.bg} p-2.5`}>
          <Icon size={22} className={c.icon} />
        </div>
      </div>
    </div>
  );
}
