import { profileFor } from "@/app/layout/profiles";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { MyRequests } from "@/modules/requests/components/MyRequests";
import { PageHeader } from "@/shared/ui/Heading";
import { Panel } from "@/shared/ui/Panel";

const NEXT: Record<string, string> = {
  parceiro: "Em breve você acompanha aqui o que é seu: carros, corridas, indicações e repasses.",
};

/** Início de parceiros e clientes: o cliente vê e faz os pedidos aqui; a área do parceiro ainda vem. Trocar a senha e sair ficam no topo. */
export function MyAccountPage() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  return (
    <section className="space-y-8">
      <PageHeader overline={profileFor(user.role).label} title="Minha" accent="conta." />
      <Panel className="space-y-2 p-6">
        <p className="font-serif text-2xl font-light">{user.name}</p>
        <p className="text-sm text-bone/60">{user.email}</p>
      </Panel>
      {NEXT[user.role] && <p className="text-sm text-bone/70">{NEXT[user.role]}</p>}
      {user.role === "cliente" && <MyRequests />}
    </section>
  );
}
