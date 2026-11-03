import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/modules/auth/store/auth.store";

export function ProtectedRoute() {
  const location = useLocation();
  const authenticated = useAuthStore((s) => s.isAuthenticated());

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
