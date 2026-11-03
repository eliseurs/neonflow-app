import { PlaceholderPage } from "@/shared/ui/PlaceholderPage";

export function BookingsPage() {
  return (
    <PlaceholderPage
      eyebrow="CICLO DE LOCAÇÃO"
      title="Reservas"
      description="Preparação, confirmação, entrega, devolução e encerramento. O período fica bloqueado desde a criação da reserva, sem prazo (RN-02.1)."
      pending={[
        "Requisitos do condutor, caução e contrato (PEN-03, PEN-05)",
        "Cancelamento, multa e estorno (PEN-06)",
        "Bloqueio atômico de disponibilidade na API (PEN-24)",
      ]}
    />
  );
}
