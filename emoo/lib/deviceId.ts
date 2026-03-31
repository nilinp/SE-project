/**
 * Generates a UUID v4 with a fallback for non-secure contexts (e.g., accessed via IP address).
 * crypto.randomUUID() is only available in HTTPS or localhost.
 */
function generateUUID(): string {
  // Try native crypto.randomUUID first (HTTPS / localhost)
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // Fallback: use crypto.getRandomValues if available
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => {
      const n = parseInt(c, 10);
      return (n ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (n / 4)))).toString(16);
    });
  }

  // Last resort: Math.random based UUID (not cryptographically secure)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Gets or creates a persistent device ID stored in localStorage.
 * Safe to use in all browser environments.
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = generateUUID();
    localStorage.setItem("device_id", id);
  }
  return id;
}
