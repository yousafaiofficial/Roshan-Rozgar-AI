"use client";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
let csrfToken = "";

async function loadCsrfToken() {
  const response = await fetch(`${API}/api/auth/csrf`, {
    credentials: "include",
    cache: "no-store",
  });
  if (response.status === 401) return;
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string" ? data.detail : "Request failed",
    );
  }
  csrfToken = data.csrf_token;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const method = (init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    if (!csrfToken) await loadCsrfToken();
    if (csrfToken) headers.set("X-CSRF-Token", csrfToken);
  }
  return fetch(`${API}${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
}

export async function apiCall(
  path: string,
  method = "GET",
  body?: unknown,
) {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const response = await apiFetch(path, {
    method,
    headers: body && !isFormData ? { "Content-Type": "application/json" } : {},
    body: body
      ? isFormData
        ? body
        : JSON.stringify(body)
      : undefined,
  });
  const data = await response.json().catch(() => ({ detail: "Request failed" }));
  if (typeof data.csrf_token === "string") csrfToken = data.csrf_token;
  if (path === "/api/auth/logout" || path === "/api/auth/logout-all") {
    csrfToken = "";
  }
  if (!response.ok) {
    const detail = Array.isArray(data.detail)
      ? data.detail
          .map((item: { msg?: string }) => item.msg)
          .filter(Boolean)
          .join(" ")
      : data.detail;
    throw new Error(typeof detail === "string" ? detail : "Request failed");
  }
  return data;
}
