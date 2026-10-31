export type EventStatus = "DRAFT" | "PUBLISHED";

export interface EventItem {
  id: string;
  title: string;
  seedKey: string | null;
  summary: string;
  description: string;
  category: string;
  requiredSkills: string[];
  interests: string[];
  bannerUrl: string | null;
  eventDate: string;
  startTime: string;
  endTime: string | null;
  timezone: string;
  location: string;
  isOnline: boolean;
  registrationUrl: string;
  status: EventStatus;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminEvent extends Omit<EventItem, "eventDate"> {
  eventDate: string | null;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

export interface AdminSession {
  authenticated: boolean;
  admin: AdminUser;
  csrfToken: string;
}

export interface LoginResponse {
  authenticated: boolean;
  admin: AdminUser;
  csrfToken: string;
}

export interface DashboardStats {
  total: number;
  published: number;
  draft: number;
  upcoming: number;
  past: number;
}

export interface AdminEventPayload {
  title: string;
  summary?: string;
  description?: string;
  category?: string;
  requiredSkills?: string[];
  interests?: string[];
  bannerUrl?: string | null;
  eventDate?: string | null;
  startTime?: string;
  endTime?: string | null;
  timezone?: string;
  location?: string;
  isOnline?: boolean;
  registrationUrl?: string;
  status?: EventStatus;
}

export interface ScoreBreakdown {
  skill: number;
  interest: number;
  date: number;
  total: number;
  percentage: number;
}

export interface Recommendation extends EventItem {
  score: ScoreBreakdown;
  matchedSkills: string[];
  matchedInterests: string[];
  daysUntil: number;
  explanation: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RecommendationMeta {
  total: number;
  generatedAt: string;
  candidate: {
    skills: string[];
    interests: string[];
  };
  weights: {
    skill: number;
    interest: number;
    date: number;
  };
}

export interface CandidateProfile {
  skills: string[];
  interests: string[];
}

export interface EventFilters {
  search?: string;
  category?: string;
  technology?: string;
  dateFrom?: string;
  dateTo?: string;
  isOnline?: boolean;
}

export type EventFormat = "all" | "online" | "in-person";

export interface FilterState {
  search: string;
  category: string;
  technology: string;
  format: EventFormat;
  dateFrom: string;
  dateTo: string;
}

export interface ApiSuccess<T, M = unknown> {
  success: true;
  data: T;
  meta?: M;
}

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  meta: RecommendationMeta;
}
