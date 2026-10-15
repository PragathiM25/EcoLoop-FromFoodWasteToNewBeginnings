import { STATUS_LABELS, STATUS_COLORS } from "../data/seedData";

export default function StatusBadge({ status, size = "sm" }) {
  const label = STATUS_LABELS[status] || status;
  const colors = STATUS_COLORS[status] || { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" };
  const sizeClass = size === "lg" ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-xs";

  return (
    <span className={`badge ${colors.bg} ${colors.text} ${sizeClass}`}>
      <span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>
      {label}
    </span>
  );
}
