import React from "react";

// type: "success" | "error"
const InlineToast = ({ open, type = "success", text }) => {
  if (!open) return null;
  const isSuccess = type === "success";
  const cls = isSuccess
    ? "bg-green-50 text-green-700 border-green-200"
    : "bg-red-50 text-red-700 border-red-200";

  return (
    <div className="container mx-auto px-4">
      <div
        className={`mt-3 rounded-xl border shadow-sm px-4 py-2 flex items-center gap-2 ${cls}`}
      >
        <span className="text-lg leading-none">{isSuccess ? "✅" : "⚠️"}</span>
        <span className="text-sm">{text}</span>
      </div>
    </div>
  );
};

export default InlineToast;
