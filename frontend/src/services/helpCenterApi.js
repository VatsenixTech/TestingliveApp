import API_BASE_URL from "../config/api";

const BASE_URL = API_BASE_URL.replace(/\/$/, "");
const HELP_API = `${BASE_URL}/api/help`;

async function request(endpoint, options = {}) {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    credentials: "include",
  };

  if (options.body !== undefined) {
    config.body = options.body;
  }

  const response = await fetch(`${HELP_API}${endpoint}`, config);

  const data = await response.json().catch(() => ({
    success: false,
    message: "Backend returned invalid JSON response",
  }));

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Request failed: ${response.status}`
    );
  }

  return data;
}

export const getHelpCategories = () => request("/categories");

export const getPopularArticles = () => request("/articles/popular");

export const searchHelpArticles = (query = "") =>
  request(`/articles/search?q=${encodeURIComponent(query)}`);

export const getCategoryArticles = (slug) =>
  request(`/articles/category/${encodeURIComponent(slug || "")}`);

export const getHelpArticle = (slug) =>
  request(`/articles/${encodeURIComponent(slug || "")}`);

export const submitArticleFeedback = (articleId, helpful) =>
  request(`/articles/${encodeURIComponent(articleId || "")}/feedback`, {
    method: "POST",
    body: JSON.stringify({ helpful }),
  });

export const getHelpGuides = () => request("/guides");

export const getSystemStatus = () => request("/status");

export const sendHelpChatMessage = (question, conversation = []) =>
  request("/chat", {
    method: "POST",
    body: JSON.stringify({
      question,
      conversation,
    }),
  });

export const createSupportTicket = (ticketData) =>
  request("/tickets", {
    method: "POST",
    body: JSON.stringify(ticketData),
  });

export const getMySupportTickets = (userId) =>
  request(`/tickets/me?userId=${encodeURIComponent(userId || "")}`);