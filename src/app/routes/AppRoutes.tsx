import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "@/modules/auth/pages/LoginPage";
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";
import { FleetPage } from "@/modules/fleet/pages/FleetPage";
import { BookingsPage } from "@/modules/bookings/pages/BookingsPage";
import { BookingDetailPage } from "@/modules/bookings/pages/BookingDetailPage";
import { LandingPage } from "@/modules/landing/pages/LandingPage";
import { UsersPage } from "@/modules/users/pages/UsersPage";
import { PartnersPage } from "@/modules/partners/pages/PartnersPage";
import { PayoutsPage } from "@/modules/payouts/pages/PayoutsPage";
import { CustomerDetailPage } from "@/modules/customers/pages/CustomerDetailPage";
import { CustomersPage } from "@/modules/customers/pages/CustomersPage";
import { TransferDetailPage } from "@/modules/transfers/pages/TransferDetailPage";
import { TransfersPage } from "@/modules/transfers/pages/TransfersPage";

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
                    <Route path="/reservas/:id" element={<BookingDetailPage />} />
                    <Route path="/usuarios" element={<UsersPage />} />
                    <Route path="/parceiros" element={<PartnersPage />} />
                    <Route path="/repasses" element={<PayoutsPage />} />
                    <Route path="/transfers" element={<TransfersPage />} />
          <Route path="/clientes" element={<CustomersPage />} />
          <Route path="/clientes/:id" element={<CustomerDetailPage />} />
          <Route path="/transfers/:id" element={<TransferDetailPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
