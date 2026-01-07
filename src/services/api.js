const API_URL = "http://localhost:3000/api";

export async function apiRequest(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    headers: customHeaders = {},
    auth = false,
  } = options;

  // 🔐 token só se auth === true
  const token = auth ? localStorage.getItem("token") : null;

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...customHeaders,
  };

  const isFormData = body instanceof FormData;

  // ⚠️ só define Content-Type se NÃO for FormData
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

  // 🧠 backend pode devolver JSON ou texto
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
