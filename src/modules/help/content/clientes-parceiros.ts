import type { HelpArticle } from "../model/help.types";

export const clientesParceiros: HelpArticle = {
  slug: "clientes-parceiros",
  title: "Clientes e parceiros",
  summary: "Clientes: contato, idioma e histórico de pedidos. Parceiros: proprietários de carros, motoristas e indicadores, com o link e o QR de indicação e os percentuais de cada um.",
  routes: ["/clientes", "/parceiros"],
  roles: ["admin", "central"],
  updated: "2026-11-16",
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
        "O cliente também pode criar uma conta no site (Cliente sem conta? Cadastre-se, na tela de entrar). Ao confirmar o e-mail, a conta se liga ao cadastro que tiver o mesmo e-mail; se houver dois cadastros com o mesmo e-mail, ou nenhum, nasce um cadastro novo.",
      ],
    },
    {
      title: "Anonimizar um cliente (LGPD)",
      steps: ["Só o admin: na ficha do cliente, clique em Anonimizar cliente e confirme."],
      items: [
        "Apaga nome e contatos do cadastro e o nome gravado nos pedidos. Datas e valores ficam, como registro financeiro.",
        "Se o cliente tinha conta no site, ela é apagada e deixa de entrar.",
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
      title: "Dar acesso ao parceiro",
      steps: [
        "Confira se o parceiro está ativo e tem e-mail no cadastro.",
        "Na lista de Parceiros, clique em Convidar ao lado dele.",
        "O parceiro recebe no e-mail um link para criar a senha, que vale por 7 dias. Depois ele entra com esse e-mail.",
      ],
      items: [
        "Convidar fica apagado para parceiro desativado ou sem e-mail.",
        "Cada parceiro tem uma só conta: convidar quem já tem acesso mostra o aviso. Se o e-mail já é usado por outra conta, troque o e-mail do parceiro.",
        "Desativar o parceiro tira o acesso dele na hora.",
        "Por enquanto o parceiro vê só os dados da conta; o que é dele (carros, corridas, indicações e repasses) vem em seguida.",
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
    { q: "O parceiro diz que o convite não chegou.", a: "Peça para olhar o spam e confira o e-mail no cadastro. Se precisar, clique em Convidar de novo: um link novo é enviado." },
    { q: "O WhatsApp já existe em outro cadastro.", a: "Cada número tem um só cliente. Busque pelo número e use o cadastro existente." },
    { q: "Mudei o percentual do parceiro. Os repasses antigos mudam?", a: "Não. O percentual é copiado no encerramento. Só os que ficaram \"a definir\" usam o percentual atual na hora de marcar como pago." },
  ],
  rules: ["RN-04.7", "RN-04.8", "RN-07.1", "RN-07.2", "RN-07.3", "RN-07.4", "RN-07.5", "RN-07.6", "RN-03.12", "RN-03.13", "RN-05.12", "RN-05.13"],
};
