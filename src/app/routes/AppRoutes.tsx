import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { RequirePermission } from "./RequirePermission";
import { AuditPage } from "@/modules/audit/pages/AuditPage";
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
import { HelpArticlePage } from "@/modules/help/pages/HelpArticlePage";
import { HelpPage } from "@/modules/help/pages/HelpPage";
import { AcceptInvitePage } from "@/modules/account/pages/AcceptInvitePage";
import { ConfirmEmailPage } from "@/modules/account/pages/ConfirmEmailPage";
import { ForgotPasswordPage } from "@/modules/account/pages/ForgotPasswordPage";
import { MyAccountPage } from "@/modules/account/pages/MyAccountPage";
import { ResetPasswordPage } from "@/modules/account/pages/ResetPasswordPage";
import { SignupPage } from "@/modules/account/pages/SignupPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      {/* Página pública do cliente: o código do link é a autorização. */}
      <Route path="/termos/:token" element={<PublicTermsPage />} />
      <Route path="/carros/:id" element={<CarPage />} />
      {/* Conta de cliente e de parceiro, sem login: os links dos e-mails da API abrem estas páginas. */}
      <Route path="/conta/cadastro" element={<SignupPage />} />
      <Route path="/conta/confirmar/:token" element={<ConfirmEmailPage />} />
      <Route path="/conta/esqueci-senha" element={<ForgotPasswordPage />} />
      <Route path="/conta/nova-senha/:token" element={<ResetPasswordPage />} />
      <Route path="/conta/convite/:token" element={<AcceptInvitePage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Cada grupo exige a permissão da API que protege as mesmas rotas (RN-05.10). */}
          <Route element={<RequirePermission permission="operacao" />}>
            <Route path="/central" element={<DashboardPage />} />
            <Route path="/frota" element={<FleetPage />} />
            <Route path="/frota/:id" element={<VehicleDetailPage />} />
            <Route path="/reservas" element={<BookingsPage />} />
            <Route path="/reservas/:id" element={<BookingDetailPage />} />
            <Route path="/parceiros" element={<PartnersPage />} />
            <Route path="/repasses" element={<PayoutsPage />} />
            <Route path="/transfers" element={<TransfersPage />} />
            <Route path="/transfers/:id" element={<TransferDetailPage />} />
            <Route path="/clientes" element={<CustomersPage />} />
            <Route path="/clientes/:id" element={<CustomerDetailPage />} />
          </Route>
          <Route element={<RequirePermission permission="contratos" />}>
            <Route path="/contratos" element={<ContractsPage />} />
            <Route path="/contratos/versoes/:id" element={<ContractVersionPage />} />
          </Route>
          <Route element={<RequirePermission permission="termos.publicar" />}>
            <Route path="/termos" element={<TermsAdminPage />} />
          </Route>
          <Route element={<RequirePermission permission="usuarios" />}>
            <Route path="/usuarios" element={<UsersPage />} />
          </Route>
          <Route element={<RequirePermission permission="auditoria" />}>
            <Route path="/auditoria" element={<AuditPage />} />
          </Route>
          <Route element={<RequirePermission permission={["area.parceiro", "area.cliente"]} />}>
            <Route path="/minha-conta" element={<MyAccountPage />} />
          </Route>
          <Route path="/ajuda" element={<HelpPage />} />
          <Route path="/ajuda/:slug" element={<HelpArticlePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
