import { apiFetch } from "./api";

export const fetchBio = () => apiFetch("/api/bio");
export const updateBio = (fields) => apiFetch("/api/bio", { method: "PATCH", body: fields });
export const addBioLink = (title, url, icon) =>
  apiFetch("/api/bio/links", { method: "POST", body: { title, url, icon } });
export const deleteBioLink = (id) => apiFetch(`/api/bio/links/${id}`, { method: "DELETE" });
