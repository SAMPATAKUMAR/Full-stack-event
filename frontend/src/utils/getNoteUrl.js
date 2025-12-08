// src/utils/getNoteUrl.js
export function getNoteUrl(note) {
  if (!note) return "#";

  // If note has external URL, use it
  if (note.url && note.url.trim() !== "") return note.url;

  // If there's no filePath, return safe fallback
  if (!note.filePath || note.filePath.trim() === "") return "#";

  // Ensure we use only the filename (prevents 'uploads/uploads/...' problems)
  const filename = note.filePath.split(/[/\\]/).pop();

  // Prefer VITE_API_URL if present (e.g. "http://localhost:5000/api")
  // Remove any trailing "/api" so we can append "/uploads/<filename>"
  let backendBase = "";
  try {
    const env = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || "";
    if (env) {
      backendBase = env.replace(/\/+$/, "").replace(/\/api$/i, "");
    } else if (typeof window !== "undefined" && window.location) {
      // assume backend on port 5000; change if different
      backendBase = window.location.origin;
      // If frontend dev server origin (e.g. :5173) is not backend, prefer explicit localhost:5000
      if (backendBase.includes(":5173") || backendBase.includes(":3000")) {
        backendBase = "http://localhost:5000";
      }
    } else {
      backendBase = "http://localhost:5000";
    }
  } catch (e) {
    backendBase = "http://localhost:5000";
  }

  return `${backendBase.replace(/\/+$/, "")}/uploads/${filename}`;
}

export default getNoteUrl;
