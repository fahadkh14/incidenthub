import React from "react";

export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-xl border border-surface-700 bg-surface-900/60 backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
