import { apiFetch, API_BASE_URL } from "./api";

export const fetchFiles = () => apiFetch("/api/files");

export const sendFile = (file, recipient, message) => {
  const form = new FormData();
  form.append("file", file);
  form.append("recipient", recipient);
  if (message) form.append("message", message);
  return apiFetch("/api/files", { method: "POST", body: form });
};

export const deleteFile = (id) => apiFetch(`/api/files/${id}`, { method: "DELETE" });

// Downloads still go through the existing Flask HTML route (a file
// stream, not JSON) - the session cookie carries auth, same as any other
// Flask-served asset.
export const downloadUrl = (path) => `${API_BASE_URL}${path}`;
