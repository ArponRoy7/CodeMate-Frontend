// src/components/PresenceDot.jsx
export default function PresenceDot({ online, size = "sm" }) {
  const sizeMap = {
    xs: "w-2 h-2",
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <span
      className={[
        "inline-block rounded-full ring-2 ring-base-100",
        sizeMap[size] || sizeMap.sm,
        online ? "bg-green-500 animate-pulse" : "bg-gray-400",
      ].join(" ")}
      title={online ? "Online" : "Offline"}
    />
  );
}
