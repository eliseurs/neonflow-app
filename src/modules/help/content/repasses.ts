import type { HelpArticle } from "../model/help.types";

export const repasses: HelpArticle = {
  slug: "repasses",
  title: "Repasses e comissões",
  summary: "O que o Neon Flow deve aos parceiros: repasse ao dono do carro, comissão de quem indicou e pagamento do motorista. O sistema gera e calcula; o pagamento é feito por Pix e marcado aqui.",
  routes: ["/repasses"],
  roles: ["admin", "central"],
  updated: "2026-11-11",
  sections: [
    {
      title: "Quando cada um aparece",
      items: [
        "Repasse ao proprietário: quando uma reserva de carro de parceiro é encerrada. Base: diárias + atraso + km excedente (sem caução).",
        "Comissão de indicador: quando a reserva indicada é encerrada (base: diárias) ou o transfer indicado é concluído (base: preço da corrida, sem a espera).",
        "Motorista: quando o transfer é concluído. Valor: o que ele aceitou + a espera extra inteira.",
      ],
    },
    {
      title: "Pagar e registrar",
      steps: [
        "Em Repasses, escolha o tipo (Repasses, Comissões de indicadores, Motoristas) e A pagar.",
        "O topo mostra o total por parceiro. Faça o Pix fora do sistema.",
        "Clique em Marcar como pago, confira o valor e confirme em Sim, marcar como pago.",
        "O item vai para Pagos, com a data e quem marcou.",
      ],
    },
    {
      title: "Percentual a definir",
      text: "Se o parceiro estava sem percentual quando a reserva foi encerrada, o item aparece como Percentual a definir.",
      steps: [
        "Defina o percentual no cadastro do parceiro, em Parceiros.",
        "Volte a Repasses e clique em Marcar como pago: a confirmação mostra o percentual atual do parceiro e o valor calculado, que ficam gravados no pagamento.",
      ],
      items: ["Enquanto o parceiro não tiver percentual, a confirmação avisa e não deixa marcar."],
    },
  ],
  faq: [
    { q: "Encerrei a reserva e não apareceu repasse.", a: "O carro precisa estar ligado a um parceiro em Frota (Parceiro proprietário). Carro próprio não gera repasse." },
    { q: "Marquei como pago por engano.", a: "O painel não desfaz o registro de pagamento. Combine o acerto com o parceiro; o registro fica com a data e quem marcou." },
  ],
  rules: ["RN-03.12", "RN-03.13", "RN-03.14", "RN-07.6"],
};
