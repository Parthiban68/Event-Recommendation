import { Loader2 } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedAdminRoute() {
  const { admin, status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Checking your session...
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
}
