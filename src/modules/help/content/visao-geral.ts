import type { HelpArticle } from "../model/help.types";

export const visaoGeral: HelpArticle = {
  slug: "visao-geral",
  title: "Visão geral",
  summary: "A primeira tela depois do login: o que precisa de atenção agora, a situação da frota, o movimento do dia e os números do mês. Cada número leva à tela de detalhe.",
  routes: ["/central"],
  roles: ["admin", "central"],
  updated: "2026-11-11",
  sections: [
    {
      title: "Precisa de atenção",
      text: "O topo da tela lista o que pede ação. Clique em cada item para abrir a tela certa.",
      items: [
        "Devolução atrasada: cliente e horário previsto. Conta como atraso depois do horário combinado mais 1 hora de tolerância.",
        "Transfers sem motorista: corridas de hoje em diante que ainda aguardam alguém aceitar.",
        "Pré-reservas aguardando pagamento: sem pagamento em 24 horas, são canceladas sozinhas.",
        "Carros aguardando o checklist de devolução: não saem para nova locação até o checklist ser aprovado.",
        "Sem nada disso, aparece \"Tudo em dia\".",
      ],
    },
    {
      title: "Frota agora",
      items: [
        "Carros alugados: reservas em locação neste momento.",
        "Atrasados na devolução: fica em vermelho quando há algum.",
        "Disponíveis: carros livres agora, \"de X carros ativos\" (ativos = fora de manutenção). Carro com reserva futura aparece como reservado, não como disponível.",
        "Em manutenção: \"de X carros na frota\".",
      ],
    },
    {
      title: "Hoje",
      items: [
        "Retiradas e devoluções do dia, contadas pelo dia de Gramado, qualquer que seja o fuso do computador.",
        "Transfers de hoje (sem os cancelados).",
        "Pré-reservas aguardando pagamento.",
      ],
    },
    {
      title: "Mês",
      items: [
        "Faturamento por retirada: reservas com retirada no mês, de confirmadas em diante, somando diárias, atraso e km.",
        "Pago no mês: reservas cujo pagamento foi marcado no mês, pelo valor das diárias.",
        "Ocupação hoje: carros em locação ÷ frota cadastrada.",
        "A pagar a parceiros: soma dos repasses, comissões e pagamentos de motorista pendentes, e quantos ainda estão sem percentual definido.",
      ],
    },
    {
      title: "Agenda",
      items: ["Próximas retiradas: confirmadas e pré-reservas ainda por vir.", "Carros na rua: com os atrasados primeiro."],
    },
  ],
  faq: [
    { q: "O carro foi devolvido, mas ainda aparece como atrasado.", a: "A reserva precisa avançar para Devolvida, com a hora real da devolução. Enquanto está em locação, o sistema considera o carro na rua." },
    { q: "Por que \"Disponíveis\" mostra menos carros do que a frota ativa?", a: "Carros alugados, com reserva futura ou aguardando checklist não contam como disponíveis." },
  ],
  rules: ["RN-02.11", "RN-02.19", "RN-01.3", "RN-01.6"],
};
