import { AdminRepository } from "./repositories/admin.repository";
import { EventRepository } from "./repositories/event.repository";
import { AdminEventService } from "./services/admin-event.service";
import { AuthService } from "./services/auth.service";
import { DashboardService } from "./services/dashboard.service";
import { EventService } from "./services/event.service";
import { RecommendationService } from "./services/recommendation.service";

const eventRepository = new EventRepository();
const adminRepository = new AdminRepository();

export const eventService = new EventService(eventRepository);
export const recommendationService = new RecommendationService(eventRepository);
export const adminEventService = new AdminEventService(eventRepository);
export const authService = new AuthService(adminRepository);
export const dashboardService = new DashboardService(eventRepository);
export { adminRepository };
