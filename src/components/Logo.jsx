import { Leaf, Recycle, Apple, Truck } from "lucide-react";

export default function Logo({ size = "md", showText = true }) {
  const iconSize = size === "lg" ? 40 : size === "sm" ? 24 : 32;
  const textSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="rounded-xl bg-gradient-to-br from-forest-500 to-mint-500 p-1.5 shadow-sm">
          <Leaf size={iconSize} className="text-white" strokeWidth={2.5} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-display font-bold text-forest-800 ${textSize}`}>
            EcoLoop
          </span>
          {size !== "sm" && (
            <span className="text-xs text-forest-500 font-medium mt-0.5">
              Food Waste to New Beginnings
            </span>
          )}
        </div>
      )}
    </div>
  );
}
