import type { HelpArticle } from "../model/help.types";

export const transfer: HelpArticle = {
  slug: "transfer",
  title: "Transfer",
  summary: "Corrida com motorista: a central registra o pedido, chama os motoristas pelo WhatsApp, marca quem aceitou e acompanha até a conclusão, que gera o pagamento do motorista.",
  routes: ["/transfers"],
  roles: ["admin", "central"],
  updated: "2026-11-11",
  flow: [
    { label: "Aguardando motorista", detail: "Registrado; a central define o valor e chama os motoristas." },
    { label: "Com motorista", detail: "Alguém aceitou; o carro da corrida está definido." },
    { label: "Em andamento", detail: "Corrida iniciada." },
    { label: "Concluído", detail: "Gera o pagamento do motorista e a comissão do indicador." },
  ],
  flowExits: [{ label: "Cancelado", detail: "Antes de iniciar. Multa de 50% dentro das 24 horas, salvo voo cancelado." }],
  sections: [
    {
      title: "1. Registrar o transfer",
      steps: [
        "Em Transfer, clique em Novo transfer.",
        "Informe cliente, data e hora (horário de Gramado), origem, destino e passageiros (1 a 60).",
        "No aeroporto, informe o número do voo: a central acompanha o pouso, e até 60 minutos de espera estão inclusos.",
        "Informe o preço combinado com o cliente (o transfer é sob consulta) e, se houver, quem indicou.",
        "Clique em Registrar transfer.",
      ],
    },
    {
      title: "2. Chamar e marcar o motorista",
      steps: [
        "No transfer, informe o Valor para o motorista e clique em Salvar valor.",
        "Na lista aparecem motoristas e proprietários ativos, com as corridas que já têm no mesmo dia. O botão WhatsApp abre a conversa com a mensagem pronta e registra o chamado no histórico.",
        "Quando alguém topar, clique em Aceitou ao lado do nome, escolha o carro da corrida (o motorista nem sempre é o dono) e confirme.",
      ],
      items: [
        "Se ninguém aceitar, aumente o valor. Ele pode subir, nunca descer, e cada aumento fica no histórico. O acréscimo é decisão da central.",
        "Um segundo aceite na mesma corrida é recusado.",
        "Se o motorista desistir depois de aceitar, clique em Motorista desistiu: a corrida volta para Aguardando motorista, sem penalidade.",
      ],
    },
    {
      title: "3. Pagamento do cliente",
      steps: ["Quando o cliente pagar, marque Cliente pagou. Sem isso, a corrida não pode ser concluída."],
    },
    {
      title: "4. Iniciar e concluir",
      steps: [
        "Na hora da corrida, clique em Iniciar corrida.",
        "Ao terminar, informe a Espera extra (R$), se o cliente passou dos 60 minutos inclusos no aeroporto, e clique em Concluir corrida.",
      ],
      items: [
        "A conclusão gera, na aba Repasses, o pagamento do motorista (valor aceito + espera extra inteira) e a comissão de quem indicou, sobre o preço da corrida (sem a espera).",
      ],
    },
    {
      title: "Cancelar",
      steps: [
        "Clique em Cancelar transfer.",
        "Se a companhia aérea cancelou o voo, marque a opção correspondente.",
        "Clique em Confirmar cancelamento.",
      ],
      items: [
        "Só antes de iniciar (Aguardando motorista ou Com motorista).",
        "Grátis até 24 horas antes do horário. Dentro das 24 horas, a multa é de 50% do preço. Com voo cancelado pela companhia, não há multa.",
      ],
    },
  ],
  faq: [
    { q: "Não consigo concluir a corrida.", a: "Marque Cliente pagou antes. O botão Concluir corrida só libera com o pagamento registrado." },
    { q: "Posso diminuir o valor oferecido ao motorista?", a: "Não. O valor só aumenta, para não desfazer o que já foi oferecido a quem foi chamado." },
    { q: "O motorista não aparece na lista.", a: "Ele precisa estar cadastrado e ativo em Parceiros como motorista ou proprietário. Sem WhatsApp no cadastro, o botão de chamar não aparece." },
  ],
  rules: ["RN-02.9", "RN-02.10", "RN-02.16", "RN-02.17", "RN-02.22", "RN-02.27", "RN-02.30", "RN-02.31", "RN-03.14"],
};
