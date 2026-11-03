import { PlaceholderPage } from "@/shared/ui/PlaceholderPage";

export function FleetPage() {
  return (
    <PlaceholderPage
      eyebrow="FROTA"
      title="Veículos"
      description="Cadastro de veículos próprios e de parceiros, tarifa diária e manutenção (RN-01)."
      pending={[
        "Inventariar a frota real ofertável (PEN-01)",
        "Definir tarifas e condições (PEN-02) — cadastradas pela central, nunca fixas no código",
      ]}
    />
  );
}
