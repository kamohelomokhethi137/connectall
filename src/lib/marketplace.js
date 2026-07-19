import { apiFetch } from "./api";

// Public - no auth required, matches Flask's marketplace_home / product_detail
export const fetchProducts = () => apiFetch("/api/marketplace/products");
export const fetchProduct = (id) => apiFetch(`/api/marketplace/products/${id}`);

// Require an authenticated session server-side. The backend must check
// current_user (session), never trust a user id from the request body -
// the product id in the URL is the only client-supplied identifier that
// matters, and it only selects WHICH product, never WHICH user acted.
export const toggleLike = (id) =>
  apiFetch(`/api/marketplace/products/${id}/like`, { method: "POST" });

export const postComment = (id, text) =>
  apiFetch(`/api/marketplace/products/${id}/comments`, {
    method: "POST",
    body: { text },
  });
