// src/components/InlineToast.jsx
import React from "react";

// type: "success" | "error"
const InlineToast = ({ open, type = "success", text }) => {
  if (!open) return null;

  return (
    <div className="container mx-auto px-4">
      <div
        className={[
          "alert mt-3 shadow-sm rounded-xl",
          type === "success" ? "alert-success" : "alert-error",
        ].join(" ")}
      >
        <span className="text-sm sm:text-base">{text}</span>
      </div>
    </div>
  );
};

export default InlineToast;
