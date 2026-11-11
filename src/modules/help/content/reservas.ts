import type { HelpArticle } from "../model/help.types";

export const reservas: HelpArticle = {
  slug: "reservas",
  title: "Reservas (aluguel sem motorista)",
  summary: "Do pedido do cliente ao encerramento: a reserva bloqueia o carro desde a criação e passa por 5 etapas; cada avanço pede as conferências da etapa.",
  routes: ["/reservas"],
  roles: ["admin", "central"],
  updated: "2026-11-11",
  flow: [
    { label: "Preparação", detail: "Pré-reserva: carro bloqueado, 24 h para pagar." },
    { label: "Confirmada", detail: "CNH, aceite, caução e pagamento conferidos." },
    { label: "Em locação", detail: "Carro entregue ao cliente." },
    { label: "Devolvida", detail: "Carro voltou; falta conferir ocorrências e checklist." },
    { label: "Encerrada", detail: "Gera comissão e repasse aos parceiros." },
  ],
  flowExits: [{ label: "Cancelada", detail: "Só em Preparação ou Confirmada. O período volta a ficar livre." }],
  sections: [
    {
      title: "1. Criar a pré-reserva",
      steps: [
        "Em Reservas, clique em Nova reserva.",
        "Informe a retirada e a devolução (data e hora, sempre no horário de Gramado). O sistema mostra só os carros livres no período.",
        "Escolha o carro, o local de retirada, o plano de quilometragem (km livre ou limitado, quando o carro tem limite cadastrado) e o cliente.",
        "Se a mensagem do cliente trouxe \"Indicação: CÓDIGO\", escolha o parceiro em Indicado por.",
        "Clique em Criar pré-reserva. O período fica bloqueado na hora.",
      ],
      items: [
        "Valor = diárias × diária do carro no momento da reserva. Mudar a tarifa do carro depois não altera reservas já criadas.",
        "A diária conta blocos de 24 horas a partir da hora da retirada, não dias do calendário.",
        "Um carro some da lista quando está em manutenção, ocupado no período ou quando o período é menor que o mínimo de diárias dele.",
      ],
    },
    {
      title: "2. Confirmar (Preparação → Confirmada)",
      text: "Marque as quatro conferências na reserva e clique em Avançar para confirmada:",
      steps: [
        "CNH conferida.",
        "Aceite dos termos: em Termos do aluguel, clique em Gerar link de aceite e depois em Enviar no WhatsApp. Quando o cliente aceita pelo link, a conferência é marcada sozinha. O link vale 7 dias.",
        "Caução pré-autorizada (valor do carro, no cartão).",
        "Pagamento integral confirmado (Pix ou link de pagamento, conferido pela central).",
      ],
      items: ["Sem pagamento em 24 horas, a pré-reserva é cancelada automaticamente e o carro volta a ficar livre. A data limite aparece na reserva."],
    },
    {
      title: "3. Entregar (Confirmada → Em locação)",
      steps: [
        "Marque Veículo entregue ao cliente.",
        "Informe a hora real da entrega e o odômetro (obrigatório no plano de km limitado).",
        "Registre as fotos da entrega e clique em Avançar para em locação.",
      ],
      items: [
        "A entrega fica travada se o carro ainda aguarda o checklist de devolução da reserva anterior ou se continua em locação em outra reserva.",
      ],
    },
    {
      title: "4. Receber a devolução (Em locação → Devolvida)",
      steps: [
        "Marque Veículo devolvido.",
        "Informe a hora real da devolução e o odômetro.",
        "Registre as fotos da devolução e avance.",
      ],
      items: [
        "Atraso: até 1 hora depois do combinado não cobra. Passou disso, cobra por minuto desde o horário combinado (diária ÷ 1440).",
        "Km excedente: no plano limitado, o sistema mede o que passou da franquia. O valor só é calculado quando o carro tem o preço do km cadastrado.",
        "Combustível, danos e a forma de cobrar os extras (caução, Pix ou link) são decididos pela central em cada caso.",
      ],
    },
    {
      title: "5. Encerrar (Devolvida → Encerrada)",
      steps: ["Marque Ocorrências conferidas e os itens do checklist de devolução.", "Clique em Avançar para encerrada."],
      items: [
        "Ao encerrar, o sistema gera a comissão do indicador e o repasse ao proprietário do carro (aba Repasses).",
        "Enquanto a reserva está em Devolvida, o carro aparece como aguardando checklist e não pode sair em outra locação.",
      ],
    },
    {
      title: "Cancelar",
      steps: ["Na reserva, clique em Cancelar reserva e depois em Confirmar cancelamento."],
      items: [
        "Só é possível em Preparação ou Confirmada. O período volta a ficar livre.",
        "O sistema não calcula multa nem estorno. Regra aprovada: grátis até 48 horas antes da retirada; depois, cobra-se 1 diária e o restante é estornado pela central.",
      ],
    },
  ],
  faq: [
    {
      q: "O botão de avançar está desabilitado. Por quê?",
      a: "Falta alguma conferência da etapa, ou o carro ainda aguarda o checklist da devolução anterior, ou está em outra locação. A tela mostra o motivo acima do botão.",
    },
    {
      q: "O cliente diz que aceitou os termos, mas a conferência não marcou.",
      a: "Recarregue a reserva: o painel Termos do aluguel mostra quem aceitou, quando e qual versão. Se não aparecer, gere um novo link; o anterior pode ter vencido (7 dias).",
    },
    {
      q: "O carro que o cliente quer não aparece na nova reserva.",
      a: "Ele está em manutenção, já tem reserva no período, ou o período é menor que o mínimo de diárias do carro (veja na Frota).",
    },
  ],
  rules: ["RN-02.1", "RN-02.3", "RN-02.4", "RN-02.5", "RN-02.6", "RN-02.11", "RN-02.18", "RN-02.19", "RN-02.21", "RN-02.24", "RN-02.29", "RN-02.32", "RN-01.6", "RN-03.12", "RN-03.13"],
};
