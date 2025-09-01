// REST API base URL
// In dev: VITE_API_URL=http://localhost:3000
// In prod: leave empty, falls back to /api (reverse proxy via Nginx)
export const BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Optional override for socket (rarely needed)
const SOCKET_OVERRIDE = import.meta.env.VITE_SOCKET_URL || "";

/**
 * Resolve Socket.IO endpoint:
 * - If SOCKET_OVERRIDE set → use that
 * - If running on Vite dev (5173) → http://localhost:3000
 * - Else → same-origin (works behind Nginx/ALB in AWS)
 */
export function pickSocketUrl() {
  if (SOCKET_OVERRIDE) return SOCKET_OVERRIDE;

  const isDev =
    typeof window !== "undefined" &&
    window.location.hostname === "localhost" &&
    String(window.location.port) === "5173";

  if (isDev) return "http://localhost:3000";

  return ""; // same-origin
}
export const APP_NAME = import.meta.env.VITE_APP_NAME || "CodeMate"; 
