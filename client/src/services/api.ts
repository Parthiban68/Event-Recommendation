import axios from "axios";
import type {
  AdminEvent,
  AdminEventPayload,
  AdminSession,
  ApiErrorResponse,
  ApiSuccess,
  CandidateProfile,
  DashboardStats,
  EventFilters,
  EventItem,
  EventStatus,
  LoginResponse,
  PaginationMeta,
  RecommendationResponse,
} from "../types";

const CSRF_COOKIE_NAME =
  import.meta.env.VITE_CSRF_COOKIE_NAME || "eventmatch_csrf";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 20_000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

api.interceptors.request.use((config) => {
  const method = (config.method ?? "get").toLowerCase();
  const isMutating = ["post", "put", "patch", "delete"].includes(method);
  const isAdminRequest = (config.url ?? "").startsWith("/admin");

  if (isMutating && isAdminRequest) {
    const csrfToken = readCookie(CSRF_COOKIE_NAME);
    if (csrfToken) {
      config.headers.set("X-CSRF-Token", csrfToken);
    }
  }

  return config;
});

export interface EventQueryParams extends EventFilters {
  page?: number;
  limit?: number;
}

function removeEmpty<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      ([, entry]) => entry !== undefined && entry !== "",
    ),
  ) as T;
}

export interface EventsResult {
  events: EventItem[];
  meta: PaginationMeta;
}

export async function fetchEvents(
  params: EventQueryParams,
  signal?: AbortSignal,
): Promise<EventsResult> {
  const response = await api.get<ApiSuccess<EventItem[], PaginationMeta>>(
    "/events",
    { params: removeEmpty(params), signal },
  );

  return {
    events: response.data.data,
    meta:
      response.data.meta ?? {
        page: 1,
        limit: response.data.data.length,
        total: response.data.data.length,
        totalPages: 1,
      },
  };
}

export async function fetchEvent(
  id: string,
  signal?: AbortSignal,
): Promise<EventItem> {
  const response = await api.get<ApiSuccess<EventItem>>(`/events/${id}`, {
    signal,
  });
  return response.data.data;
}

export interface RecommendationRequest extends CandidateProfile {
  filters?: EventFilters;
}

export async function fetchRecommendations(
  payload: RecommendationRequest,
  signal?: AbortSignal,
): Promise<RecommendationResponse> {
  const response = await api.post<ApiSuccess<RecommendationResponse>>(
    "/recommendations",
    payload,
    { signal },
  );
  return response.data.data;
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await api.post<ApiSuccess<LoginResponse>>(
    "/admin/auth/login",
    { email, password },
  );
  return response.data.data;
}

export async function fetchAdminSession(): Promise<AdminSession> {
  const response = await api.get<ApiSuccess<AdminSession>>(
    "/admin/auth/session",
  );
  return response.data.data;
}

export async function logoutAdmin(): Promise<void> {
  await api.post("/admin/auth/logout");
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<ApiSuccess<DashboardStats>>(
    "/admin/dashboard/stats",
  );
  return response.data.data;
}

export async function fetchRecentAdminEvents(): Promise<AdminEvent[]> {
  const response = await api.get<ApiSuccess<AdminEvent[]>>(
    "/admin/dashboard/recent-events",
  );
  return response.data.data;
}

export interface AdminEventQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: EventStatus;
  category?: string;
}

export interface AdminEventsResult {
  events: AdminEvent[];
  meta: PaginationMeta;
}

export async function fetchAdminEvents(
  params: AdminEventQueryParams,
): Promise<AdminEventsResult> {
  const response = await api.get<
    ApiSuccess<AdminEvent[], PaginationMeta>
  >("/admin/events", { params: removeEmpty(params) });

  return {
    events: response.data.data,
    meta:
      response.data.meta ?? {
        page: 1,
        limit: response.data.data.length,
        total: response.data.data.length,
        totalPages: 1,
      },
  };
}

export async function fetchAdminEvent(id: string): Promise<AdminEvent> {
  const response = await api.get<ApiSuccess<AdminEvent>>(`/admin/events/${id}`);
  return response.data.data;
}

export async function createAdminEvent(
  payload: AdminEventPayload,
): Promise<AdminEvent> {
  const response = await api.post<ApiSuccess<AdminEvent>>(
    "/admin/events",
    payload,
  );
  return response.data.data;
}

export async function updateAdminEvent(
  id: string,
  payload: AdminEventPayload,
): Promise<AdminEvent> {
  const response = await api.put<ApiSuccess<AdminEvent>>(
    `/admin/events/${id}`,
    payload,
  );
  return response.data.data;
}

export async function updateAdminEventStatus(
  id: string,
  status: EventStatus,
): Promise<AdminEvent> {
  const response = await api.patch<ApiSuccess<AdminEvent>>(
    `/admin/events/${id}/status`,
    { status },
  );
  return response.data.data;
}

export async function deleteAdminEvent(id: string): Promise<void> {
  await api.delete(`/admin/events/${id}`);
}

export function isCanceledError(error: unknown): boolean {
  return (
    axios.isCancel(error) ||
    (axios.isAxiosError(error) && error.code === "ERR_CANCELED")
  );
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (!error.response) {
      return "Unable to reach the API. Make sure the backend is running on port 4000.";
    }

    const details = error.response.data?.error?.details;
    if (details && details.length > 0) {
      return details
        .map((detail) => `${detail.path}: ${detail.message}`)
        .join(". ");
    }

    return (
      error.response.data?.error?.message ??
      "The request could not be completed. Please try again."
    );
  }

  return "Something went wrong. Please try again.";
}
