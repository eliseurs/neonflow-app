import type { HelpArticle } from "../model/help.types";

export const pedidos: HelpArticle = {
  slug: "pedidos",
  title: "Pedidos do site",
  summary: "Pedidos de aluguel e transfer feitos pelos clientes com conta. A central confirma, pede ajuste ou recusa; nada fica bloqueado até confirmar.",
  routes: ["/pedidos"],
  roles: ["admin", "central"],
  updated: "2026-11-16",
  flow: [
    { label: "Aguardando a central", detail: "O cliente pediu pelo site. O carro ainda não está bloqueado." },
    { label: "Ajuste pedido", detail: "A central escreveu o que mudar; o cliente altera e reenvia, e o pedido volta para Aguardando." },
    { label: "Confirmado", detail: "Nasceu a reserva (carro bloqueado, 24 horas para pagar) ou o transfer com o preço." },
  ],
  flowExits: [
    { label: "Recusado", detail: "A central explicou o motivo ao cliente." },
    { label: "Cancelado", detail: "O próprio cliente desistiu antes da resposta." },
  ],
  sections: [
    {
      title: "Responder um pedido",
      steps: [
        "Em Pedidos do site, a lista abre nos pedidos Aguardando. Clique no pedido.",
        "Confira o cliente, o período ou o trajeto, o valor estimado (no aluguel) e as observações.",
        "Confirmar: no aluguel, a reserva nasce em preparação, com o carro bloqueado e 24 horas para pagar; siga pela tela da reserva (Abrir a reserva). No transfer, informe o preço; o transfer nasce aguardando motorista.",
        "Pedir ajuste: escreva o que o cliente precisa mudar (outra data, outro carro). Ele altera e reenvia o mesmo pedido.",
        "Recusar: escreva o motivo.",
        "O cliente recebe cada resposta por e-mail e vê em Minha conta. Para avisar também no WhatsApp, clique em Avisar no WhatsApp: a conversa abre com a mensagem pronta.",
      ],
      items: [
        "Pedido não bloqueia o carro: dois clientes podem pedir o mesmo carro no mesmo período. Ao confirmar um, o outro não confirma mais; peça ajuste ou recuse.",
        "Se a diária, a caução ou o km do carro mudaram depois do pedido, o sistema não confirma: peça ajuste para o cliente ver o valor novo.",
        "Pedido para um período em que o carro já está reservado é recusado na hora, no site.",
        "O código de indicação que o cliente trouxe pelo link já vem ligado ao pedido e passa para a reserva ou o transfer.",
      ],
    },
  ],
  faq: [
    { q: "O cliente diz que não recebeu o e-mail.", a: "Use Avisar no WhatsApp. A resposta também aparece em Minha conta, no site." },
    { q: "Posso mudar o pedido por conta própria?", a: "Não pelo pedido: peça ajuste ao cliente, ou confirme e altere depois na reserva ou no transfer." },
  ],
  rules: ["RN-02.33", "RN-02.34", "RN-02.35", "RN-02.36", "RN-02.37"],
};
