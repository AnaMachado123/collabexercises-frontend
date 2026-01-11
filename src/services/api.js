const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export async function apiRequest(endpoint, options = {}) {
  const { method = "GET", body, headers: customHeaders = {} } = options;

  const token = localStorage.getItem("token");

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...customHeaders,
  };

  const isFormData = body instanceof FormData;

  if (body && !isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body:
      body && !isFormData && typeof body !== "string"
        ? JSON.stringify(body)
        : body,
  });

  const text = await response.text();

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong");
  }

  return data;
}
