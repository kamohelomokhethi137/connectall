import { apiFetch } from "./api";

export const fetchProfile = () => apiFetch("/api/profile");
export const updateProfile = (patch) => apiFetch("/api/profile", { method: "PATCH", body: patch });

export const uploadAvatar = (file) => {
  const form = new FormData();
  form.append("avatar", file);
  return apiFetch("/api/profile/avatar", { method: "POST", body: form });
};

export const fetchSettings = () => apiFetch("/api/profile/settings");
export const updateSettings = (settings) =>
  apiFetch("/api/profile/settings", { method: "POST", body: settings });

export const changePassword = (currentPassword, newPassword) =>
  apiFetch("/api/profile/change-password", {
    method: "POST",
    body: { current_password: currentPassword, new_password: newPassword },
  });
