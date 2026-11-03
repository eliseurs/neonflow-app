import { useAuthStore } from "@/modules/auth/store/auth.store";
import { PlaceholderPage } from "@/shared/ui/PlaceholderPage";

export function DashboardPage() {
  const name = useAuthStore((s) => s.user?.name);
  return (
    <PlaceholderPage
      eyebrow="CENTRAL DE MOBILIDADE"
      title={name ? `Olá, ${name.split(" ")[0]}` : "Central"}
      description="Retiradas, devoluções, disponibilidade e pendências do dia aparecerão aqui quando frota e reservas estiverem implementadas."
      pending={[
        "Implementar frota e reservas na API (plano-reserva-persistente)",
        "Definir os indicadores da central (PEN-11)",
      ]}
    />
  );
}
