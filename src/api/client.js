import { createMockApi } from "./mockApi.js";

export function createHttpApi(baseUrl, fetcher = fetch) {
  const request = async (path, options = {}) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetcher(`${baseUrl.replace(/\/$/, "")}${path}`, {
        ...options,
        headers: { "Content-Type": "application/json", ...options.headers },
        signal: controller.signal,
      });
      const body = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          body?.message ||
            `Request failed (${response.status}). Please try again.`,
        );
      if (body === null)
        throw new Error("The server returned an empty response.");
      return body;
    } catch (error) {
      if (error.name === "AbortError")
        throw new Error("The connection timed out. Please try again.");
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  };
  const post = (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body) });
  const path = (id) => `/locations/${encodeURIComponent(id)}`;
  return {
    getLocations: (query = "") =>
      request(`/locations?q=${encodeURIComponent(query)}`),
    getLocation: (id) => request(path(id)),
    getProfile: () => request("/me"),
    getCatalog: () => request("/catalog"),
    getAchievements: () => request("/me/achievements"),
    addReview: (id, body) => post(`${path(id)}/reviews`, body),
    addReport: (id, body) => post(`${path(id)}/reports`, body),
    voteReport: (id, reportId, stillRelevant) =>
      post(`${path(id)}/reports/${encodeURIComponent(reportId)}/votes`, {
        stillRelevant,
      }),
  };
}
const env = import.meta.env || {};
export const isMock = env.VITE_API_MODE !== "http";
let storage;
try {
  storage = globalThis.localStorage;
} catch {
  /* Storage can be disabled. */
}
export const api = isMock
  ? createMockApi({
      storage,
      reviewPoints: Number(env.VITE_REVIEW_POINTS ?? 25),
    })
  : createHttpApi(env.VITE_API_BASE_URL || "http://localhost:3000/api");
