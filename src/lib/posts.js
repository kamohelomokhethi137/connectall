import { apiFetch } from "./api";

export const fetchFeed = (page = 1) => apiFetch(`/api/posts/feed?page=${page}&per_page=10`);

export const getPost = (postUuid) => apiFetch(`/api/posts/${postUuid}`);

export const createPost = (body, mediaFiles) => {
  const fd = new FormData();
  if (body) fd.append("body", body);
  for (const file of mediaFiles) {
    fd.append("media", file);
  }
  return apiFetch("/api/posts", { method: "POST", body: fd });
};

export const deletePost = (postUuid) =>
  apiFetch(`/api/posts/${postUuid}`, { method: "DELETE" });

export const toggleLike = (postUuid) =>
  apiFetch(`/api/posts/${postUuid}/like`, { method: "POST" });

export const fetchComments = (postUuid) =>
  apiFetch(`/api/posts/${postUuid}/comments`);

export const addComment = (postUuid, body) =>
  apiFetch(`/api/posts/${postUuid}/comments`, { method: "POST", body: { body } });

export const deleteComment = (postUuid, commentId) =>
  apiFetch(`/api/posts/${postUuid}/comments/${commentId}`, { method: "DELETE" });
