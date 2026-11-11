import type { HelpArticle } from "../model/help.types";

export const clientesParceiros: HelpArticle = {
  slug: "clientes-parceiros",
  title: "Clientes e parceiros",
  summary: "Clientes: contato, idioma e histórico de pedidos. Parceiros: proprietários de carros, motoristas e indicadores, com o link e o QR de indicação e os percentuais de cada um.",
  routes: ["/clientes", "/parceiros"],
  roles: ["admin", "central"],
  updated: "2026-11-11",
  sections: [
    {
      title: "Clientes",
      steps: [
        "Em Clientes, clique em Novo cliente, ou cadastre direto na nova reserva e no novo transfer.",
        "Informe nome, WhatsApp com DDI e DDD (um cadastro por número), e-mail, idioma (português ou inglês) e observações.",
        "Para achar alguém, busque pelo nome, WhatsApp ou e-mail.",
        "Na ficha do cliente aparecem todas as reservas e transfers dele.",
      ],
      items: [
        "Documentos, data de nascimento e endereço ainda não são guardados: esperam a definição de retenção (LGPD).",
        "A reserva e o transfer guardam o nome do cliente no dia do pedido.",
      ],
    },
    {
      title: "Anonimizar um cliente (LGPD)",
      steps: ["Só o admin: na ficha do cliente, clique em Anonimizar cliente e confirme."],
      items: [
        "Apaga nome e contatos do cadastro e o nome gravado nos pedidos. Datas e valores ficam, como registro financeiro.",
        "Não se desfaz. Use apenas a pedido do próprio titular.",
      ],
    },
    {
      title: "Parceiros",
      steps: [
        "Em Parceiros, clique em Novo parceiro.",
        "Marque os tipos: proprietário (dono de carro), motorista e/ou indicador. Um parceiro pode ter mais de um. Todo parceiro pode indicar.",
        "Informe contato e os percentuais (0 a 100, até duas casas): Comissão de indicação, Repasse ao proprietário e Percentual do motorista. Em branco = a definir.",
        "Ao cadastrar, o sistema gera um código de indicação único, que não muda.",
      ],
      items: [
        "Comissão de indicação: sobre as diárias da reserva (ou sobre o preço do transfer), saindo da parte do Neon Flow.",
        "Repasse ao proprietário: sobre diárias + atraso + km excedente do carro dele. A caução nunca entra.",
        "Para o carro gerar repasse, ligue o carro ao parceiro em Frota (campo Parceiro proprietário).",
      ],
    },
    {
      title: "Indicação por link e QR",
      steps: [
        "Na lista de Parceiros, clique em Indicação ao lado do parceiro e use Copiar link ou Baixar QR (PNG) para imprimir.",
        "Quem chega pelo link tem o código guardado na visita, e a mensagem do WhatsApp sai com \"Indicação: CÓDIGO\".",
        "Ao criar a reserva ou o transfer, escolha o parceiro em Indicado por.",
      ],
      items: ["Registrar quem indicou não paga nada sozinho: a comissão nasce no encerramento da reserva ou na conclusão do transfer."],
    },
  ],
  faq: [
    { q: "O WhatsApp já existe em outro cadastro.", a: "Cada número tem um só cliente. Busque pelo número e use o cadastro existente." },
    { q: "Mudei o percentual do parceiro. Os repasses antigos mudam?", a: "Não. O percentual é copiado no encerramento. Só os que ficaram \"a definir\" usam o percentual atual na hora de marcar como pago." },
  ],
  rules: ["RN-04.7", "RN-04.8", "RN-07.1", "RN-07.2", "RN-07.3", "RN-07.4", "RN-07.5", "RN-07.6", "RN-03.12", "RN-03.13"],
};
