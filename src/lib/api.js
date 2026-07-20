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

let csrfTokenPromise = null;

// Concurrent callers must all await the SAME fetch, not each race their own.
// If two mutating requests fire before the first /api/csrf-token call
// resolves, each would otherwise see no cached value yet and fire its own
// GET - and since a fresh page load has no session cookie yet, Flask hands
// each of those parallel requests a DIFFERENT new session. Whichever
// Set-Cookie response the browser receives last is the one it actually
// keeps, but whichever fetch happened to resolve first is what got cached
// as "the" token - if those don't match, the token belongs to session A
// while the browser is holding session B's cookie, and Flask correctly
// rejects it ("the CSRF session token is missing"), because session B
// never had a token generated against it at all.
function getCsrfToken() {
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetch(`${API_BASE_URL}/api/csrf-token`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Could not load security token");
        return res.json();
      })
      .then((data) => data.csrf_token)
      .catch((err) => {
        csrfTokenPromise = null; // allow a retry on the next call instead of caching a permanent failure
        throw err;
      });
  }
  return csrfTokenPromise;
}

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function apiFetch(path, { method = "GET", body, headers = {} } = {}) {
  // FormData (file uploads) must NOT get a JSON Content-Type - the browser
  // needs to set its own multipart boundary, so we skip our default header
  // and let fetch build it from the FormData instance.
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const finalHeaders = isFormData ? { ...headers } : { "Content-Type": "application/json", ...headers };

  if (MUTATING.has(method.toUpperCase())) {
    finalHeaders["X-CSRFToken"] = await getCsrfToken();
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    credentials: "include", // send the Flask session cookie
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // some endpoints may return no body (e.g. 204)
  }

  if (!res.ok) {
    const message = data?.error || data?.message || "Something went wrong. Try again.";
    throw new Error(message);
  }

  return data;
}
