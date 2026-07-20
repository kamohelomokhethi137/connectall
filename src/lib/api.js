// Central fetch wrapper. Every mutating request (POST/PUT/PATCH/DELETE)
// must carry the CSRF token Flask-WTF expects, and every request must
// send credentials so the Flask session cookie is included.
//
// Security notes for whoever wires this to the real backend:
// - CSRF: the token below must match the value Flask's csrf_token()
//   generates for the current session. Expose it via a small JSON
//   endpoint (e.g. GET /api/csrf-token) and never guess it client-side.
// - IDOR: this client only ever asks for "my" resources implicitly
//   (the backend must derive "whose data" from the session, never trust
//   an id the client passes for authorization decisions). If an endpoint
//   like GET /api/users/:id/wallet exists, the server must still check
//   that the session user IS that id (or is an admin), not just that
//   the id exists.

// The Flask backend runs on a different origin/port than this React app
// (5000 vs Vite's 5173 in dev), so every request needs an absolute URL -
// a relative "/api/..." path would resolve against THIS app's origin,
// not Flask's, and silently 404.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Flask returns media paths like "/static/img/x.png" - also relative to
// the Flask origin, not this app's. Use this wherever an <img src> comes
// from the API.
export function resolveMediaUrl(path) {
  if (!path) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path}`;
}

export async function apiFetch(path, { method = "GET", body, headers = {} } = {}) {
  // FormData (file uploads) must NOT get a JSON Content-Type - the browser
  // needs to set its own multipart boundary, so we skip our default header
  // and let fetch build it from the FormData instance.
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const finalHeaders = isFormData ? { ...headers } : { "Content-Type": "application/json", ...headers };

  const token = localStorage.getItem("connectall_token");
  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // some endpoints may return no body (e.g. 204)
  }

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("connectall_token");
    }
    const message = data?.error || data?.message || "Something went wrong. Try again.";
    throw new Error(message);
  }

  if (data && data.token) {
    localStorage.setItem("connectall_token", data.token);
  }

  return data;
}
