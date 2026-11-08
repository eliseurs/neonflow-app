import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "@/modules/auth/pages/LoginPage";
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";
import { FleetPage } from "@/modules/fleet/pages/FleetPage";
import { VehicleDetailPage } from "@/modules/fleet/pages/VehicleDetailPage";
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
import { PublicTermsPage } from "@/modules/terms/pages/PublicTermsPage";
import { CarPage } from "@/modules/landing/pages/CarPage";
import { TermsAdminPage } from "@/modules/terms/pages/TermsAdminPage";
import { ContractsPage } from "@/modules/contracts/pages/ContractsPage";
import { ContractVersionPage } from "@/modules/contracts/pages/ContractVersionPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
      {/* Página pública do cliente: o código do link é a autorização. */}
      <Route path="/termos/:token" element={<PublicTermsPage />} />
      <Route path="/carros/:id" element={<CarPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/central" element={<DashboardPage />} />
                    <Route path="/frota" element={<FleetPage />} />
          <Route path="/frota/:id" element={<VehicleDetailPage />} />
          <Route path="/reservas" element={<BookingsPage />} />
                    <Route path="/reservas/:id" element={<BookingDetailPage />} />
                    <Route path="/usuarios" element={<UsersPage />} />
                    <Route path="/parceiros" element={<PartnersPage />} />
                    <Route path="/repasses" element={<PayoutsPage />} />
                    <Route path="/transfers" element={<TransfersPage />} />
                    <Route path="/clientes" element={<CustomersPage />} />
          <Route path="/termos" element={<TermsAdminPage />} />
          <Route path="/contratos" element={<ContractsPage />} />
          <Route path="/contratos/versoes/:id" element={<ContractVersionPage />} />
          <Route path="/clientes/:id" element={<CustomerDetailPage />} />
          <Route path="/transfers/:id" element={<TransferDetailPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
