import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "@/modules/auth/pages/LoginPage";
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";
import { FleetPage } from "@/modules/fleet/pages/FleetPage";
import { BookingsPage } from "@/modules/bookings/pages/BookingsPage";
import { LandingPage } from "@/modules/landing/pages/LandingPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/central" element={<DashboardPage />} />
          <Route path="/frota" element={<FleetPage />} />
          <Route path="/reservas" element={<BookingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
