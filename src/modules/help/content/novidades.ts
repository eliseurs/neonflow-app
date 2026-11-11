import type { HelpArticle } from "../model/help.types";

/** O que mudou para quem usa o painel, do mais recente para o mais antigo. Cada PR que muda um fluxo acrescenta uma linha. */
export const novidades: HelpArticle = {
  slug: "novidades",
  title: "Novidades",
  summary: "O que mudou no painel, em poucas palavras, do mais recente para o mais antigo.",
  routes: [],
  roles: ["admin", "central", "legal_reviewer"],
  updated: "2026-11-11",
  sections: [
    {
      title: "11/11/2026",
      items: [
        "Central de ajuda: artigos de todos os fluxos e o link \"Ajuda desta tela\" no topo de cada tela.",
        "Repasses: itens com \"Percentual a definir\" agora podem ser marcados como pagos; a confirmação mostra o valor com o percentual atual do parceiro.",
        "O site passou a abrir em www.neonflow.com.br (o endereço sem www redireciona).",
      ],
    },
    {
      title: "10/11/2026",
      items: [
        "Menu organizado por assunto (Operação, Relacionamento, Financeiro, Documentos, Administração). \"Central\" passou a se chamar Visão geral.",
        "Visão geral nova: o que precisa de atenção, devoluções atrasadas em destaque, frota agora, o dia e o mês, incluindo quanto falta pagar a parceiros.",
        "Contratos: baixar o texto em .md, editar no próprio sistema (vira versão nova) e os botões de andamento até a publicação.",
        "Logo novo em todo o sistema e no site.",
        "Quando a Ordem de Locação (contrato 04) for publicada, o link de aceite das reservas passa a mostrá-la com os dados da reserva.",
      ],
    },
    {
      title: "08/11/2026",
      items: ["Contratos: os seis documentos em versões, com upload, revisão jurídica e aprovação pelo texto exato."],
    },
  ],
  rules: [],
};
