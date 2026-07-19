import { apiFetch } from "./api";

export const fetchWallet = () => apiFetch("/api/wallet");
export const depositFunds = (amount, methodId) =>
  apiFetch("/api/wallet/deposit", { method: "POST", body: { amount, method_id: methodId } });
export const withdrawFunds = (amount, methodId, account) =>
  apiFetch("/api/wallet/withdraw", { method: "POST", body: { amount, method_id: methodId, account } });
export const transferFunds = (recipient, amount) =>
  apiFetch("/api/wallet/transfer", { method: "POST", body: { recipient, amount } });
