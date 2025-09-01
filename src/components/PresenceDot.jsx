// src/components/PresenceDot.jsx
export default function PresenceDot({ online }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ml-2 ${
        online ? "bg-green-500" : "bg-gray-400"
      }`}
      title={online ? "Online" : "Offline"}
    />
  );
}
