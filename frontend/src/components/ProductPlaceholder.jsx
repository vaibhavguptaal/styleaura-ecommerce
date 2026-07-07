import React from "react";

const CLASSES = ["ph-1", "ph-2", "ph-3", "ph-4", "ph-5"];

function hashIndex(str, mod) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % mod;
}

export function ProductPlaceholder({ label = "", subLabel = "", className = "" }) {
  const cls = CLASSES[hashIndex(label + subLabel, CLASSES.length)];
  const initials = (label || "SA")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className={`w-full h-full absolute inset-0 flex flex-col items-center justify-center p-6 text-center ${cls} ${className}`}>
      <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" />
      <span className="font-heading text-6xl md:text-7xl text-smoke/40 leading-none tracking-tight">
        {initials || "SA"}
      </span>
      {subLabel ? (
        <span className="mt-3 text-[10px] uppercase tracking-[0.24em] text-smoke/70">
          {subLabel}
        </span>
      ) : null}
    </div>
  );
}
