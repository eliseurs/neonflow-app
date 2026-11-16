import type { HelpArticle } from "../model/help.types";

export const auditoria: HelpArticle = {
  slug: "auditoria",
  title: "Auditoria",
  summary: "A trilha de quem fez o quê no painel: cada alteração, cada entrada e cada acesso negado, com o papel da pessoa naquele momento.",
  routes: ["/auditoria"],
  roles: ["admin"],
  updated: "2026-11-16",
  sections: [
    {
      title: "O que entra",
      items: [
        "Toda alteração feita por alguém logado: criar, alterar, apagar, avançar etapa, marcar pagamento e afins.",
        "Cada entrada no painel (login com sucesso).",
        "Cada tentativa de abrir algo que o perfil não permite, marcada como Negado.",
        "Consultas (abrir uma lista ou uma tela) não entram.",
        "Não guarda o conteúdo enviado nem dados pessoais: só quem, papel, o que foi chamado, o resultado e a hora.",
      ],
    },
    {
      title: "Consultar",
      steps: [
        "Em Administração, abra Auditoria. Aparecem os 100 registros mais recentes.",
        "Escolha um usuário para ver só o que ele fez.",
        "Marque Só acessos negados para ver quem tentou abrir o que não podia.",
      ],
    },
  ],
  faq: [
    { q: "Dá para apagar ou corrigir um registro?", a: "Não. A trilha só recebe registros novos; o banco recusa alterar ou apagar." },
    { q: "Aparece Negado para alguém da central. É problema?", a: "Em geral é um link para uma tela de outro perfil. Se a pessoa precisa daquela tela, revise o papel dela em Usuários." },
  ],
  rules: ["RN-05.9", "RN-05.10"],
};
