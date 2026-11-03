const API_BASE_URL = "http://127.0.0.1:3000/api";

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const text = await response.text();
const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
        const errorMessage =
            data.error?.message ||
            data.message ||
            "Something went wrong.";

        throw new Error(errorMessage);
    }

    return data;
}