import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import AdminLayout from "./layouts/AdminLayout";
import RootLayout from "./layouts/RootLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminEventFormPage from "./pages/admin/AdminEventFormPage";
import AdminEventsPage from "./pages/admin/AdminEventsPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import EventsPage from "./pages/EventsPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import RecommendationsPage from "./pages/RecommendationsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:id" element={<EventDetailsPage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<ProtectedAdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="events/create" element={<AdminEventFormPage />} />
          <Route path="events/:id/edit" element={<AdminEventFormPage />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
