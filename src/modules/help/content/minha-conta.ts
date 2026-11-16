import type { HelpArticle } from "../model/help.types";

export const minhaConta: HelpArticle = {
  slug: "minha-conta",
  title: "Sua conta no Neon Flow",
  summary: "Como parceiros e clientes criam o acesso, entram e cuidam da senha; o que o parceiro acompanha na própria área; e como o cliente pede aluguel ou transfer pelo site.",
  routes: ["/minha-conta"],
  roles: ["parceiro", "cliente"],
  updated: "2026-11-16",
  sections: [
    {
      title: "Parceiro: acesso por convite",
      steps: [
        "A central do Neon Flow envia o convite para o seu e-mail cadastrado.",
        "Abra o link do e-mail em até 7 dias e crie a sua senha (10 caracteres ou mais).",
        "Entre com esse e-mail e a senha nova.",
      ],
      items: ["Link vencido ou já usado: peça um novo convite à central."],
    },
    {
      title: "Parceiro: o que aparece em Minha conta",
      items: [
        "Proprietário: Meus carros e Reservas dos meus carros, com o período, a situação, as diárias, o atraso, o km excedente e o seu repasse. Os dados do cliente não aparecem.",
        "Motorista: Corridas disponíveis, com as corridas que aguardam motorista e o valor; quem clicar em Aceitar primeiro leva. Se você também tem carro, pode escolher qual vai na corrida. Depois ela aparece em Minhas corridas, com horário, trajeto, voo, passageiros, o nome do cliente e o que você recebe. O telefone do cliente fica com a central.",
        "Motorista: para desistir de uma corrida que aceitou, antes de ela começar, clique em Desistir da corrida e confirme. Sem penalidade; ela volta para as corridas disponíveis.",
        "Todos: Minhas indicações, com o serviço, a data, a situação e a comissão, e o seu link e QR de indicação para compartilhar.",
        "Os valores mostram quanto você recebe, sobre qual base e com qual percentual, e se já foi pago. O repasse e a comissão aparecem quando o serviço termina; \"percentual a definir\" quer dizer que a central ainda vai combinar com você.",
        "Para mudar algo (dados, carro, percentual), fale com a central: a área é só para consulta.",
      ],
    },
    {
      title: "Cliente: criar a conta",
      steps: [
        "Na tela de entrar, clique em Cliente sem conta? Cadastre-se.",
        "Informe nome, e-mail e senha (10 caracteres ou mais) e clique em Criar conta.",
        "Abra o link que chega no e-mail em até 24 horas. Só depois disso a conta entra.",
      ],
      items: [
        "Se você já reservou com a central usando o mesmo e-mail, a conta passa a mostrar o seu histórico.",
        "O e-mail não chegou? Veja a caixa de spam ou cadastre de novo com o mesmo e-mail para receber outro link.",
      ],
    },
    {
      title: "Cliente: pedir aluguel ou transfer",
      steps: [
        "Em Minha conta, clique em Novo pedido (ou, no site, em Pedir pela minha conta).",
        "Aluguel: escolha a retirada e a devolução. Aparecem os carros livres com o valor estimado, a caução e a quilometragem; escolha um.",
        "Transfer: informe origem, destino, data e horário, passageiros e o voo, se houver. O valor do transfer vem na resposta da central.",
        "Informe o seu WhatsApp e clique em Enviar pedido.",
      ],
      items: [
        "O carro só fica reservado quando a central confirma. Depois da confirmação, o pagamento precisa ser feito em até 24 horas.",
        "A resposta chega no e-mail e aparece em Meus pedidos. Se a central pedir um ajuste, abra o pedido, clique em Alterar e reenviar, mude o que foi pedido e reenvie.",
        "Enquanto a central não confirmar nem recusar, você pode cancelar o pedido.",
      ],
    },
    {
      title: "Senha",
      steps: [
        "Para trocar, clique em Senha no topo da tela, informe a senha atual e a nova duas vezes.",
        "Esqueceu? Na tela de entrar, clique em Esqueci a senha, informe o e-mail e abra o link que chega em até 1 hora.",
      ],
    },
  ],
  faq: [
    { q: "O que aparece em Minha conta?", a: "Os dados da conta; para o cliente, os pedidos com a situação e o histórico; para o parceiro, os carros, as corridas, as indicações e o que ele recebe." },
  ],
  rules: ["RN-02.30", "RN-02.31", "RN-02.33", "RN-02.36", "RN-02.37", "RN-07.8", "RN-07.9", "RN-07.10", "RN-07.11", "RN-05.6", "RN-05.11", "RN-05.12", "RN-05.13", "RN-05.14"],
};
