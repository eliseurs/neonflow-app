import type { HelpArticle } from "../model/help.types";

export const minhaConta: HelpArticle = {
  slug: "minha-conta",
  title: "Sua conta no Neon Flow",
  summary: "Como parceiros e clientes criam o acesso, entram, trocam a senha e recuperam a senha esquecida.",
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
      title: "Senha",
      steps: [
        "Para trocar, clique em Senha no topo da tela, informe a senha atual e a nova duas vezes.",
        "Esqueceu? Na tela de entrar, clique em Esqueci a senha, informe o e-mail e abra o link que chega em até 1 hora.",
      ],
    },
  ],
  faq: [
    { q: "O que aparece em Minha conta?", a: "Por enquanto, os dados da sua conta. As suas reservas, corridas, indicações e repasses vão aparecer aqui em breve." },
  ],
  rules: ["RN-05.6", "RN-05.11", "RN-05.12", "RN-05.13", "RN-05.14"],
};
