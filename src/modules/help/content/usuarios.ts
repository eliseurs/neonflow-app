import type { HelpArticle } from "../model/help.types";

export const usuarios: HelpArticle = {
  slug: "usuarios",
  title: "Usuários e acesso",
  summary: "Quem entra no painel e o que cada papel vê. Não há cadastro aberto: o admin cria os usuários; cada pessoa troca a própria senha.",
  routes: ["/usuarios"],
  roles: ["admin", "central", "legal_reviewer"],
  updated: "2026-11-16",
  sections: [
    {
      title: "Papéis",
      items: [
        "Administração: tudo, inclusive Contratos, Termos, Usuários e Auditoria.",
        "Central: operação (Visão geral, Reservas, Transfer, Frota, Clientes, Parceiros, Repasses).",
        "Jurídico: só Contratos, para revisar e aprovar as versões. Tem um painel próprio, mais enxuto: as telas ficam numa barra no topo, sem a operação.",
        "Quem abre um link de uma tela que o seu papel não permite vê o aviso Tela restrita e o botão para voltar ao início.",
        "O menu mostra a cada papel só o que ele pode abrir. No computador, os grupos abrem e fecham no título. Ao entrar numa tela de um grupo fechado, ele abre sozinho; fechado com a tela atual dentro, o título fica dourado. No celular, as telas principais ficam na barra de baixo e o restante em Menu.",
      ],
    },
    {
      title: "Criar e gerenciar (admin)",
      steps: [
        "Em Usuários, clique em Novo usuário: nome, e-mail (é o login e não muda), papel (Administração, Central ou Jurídico; abaixo do campo aparece o que cada um abre) e senha inicial (10 caracteres ou mais).",
        "Passe a senha à pessoa por um canal seguro.",
        "Para mudar nome, papel ou desativar, use Editar. Vale na hora: quem foi desativado sai na próxima ação, e o papel novo vale sem a pessoa entrar de novo.",
        "Esqueceu a senha? Use Redefinir senha e passe a nova pela via segura.",
      ],
      items: ["O admin não pode desativar a si mesmo nem tirar o próprio papel de admin."],
    },
    {
      title: "Trocar a própria senha",
      steps: ["No computador, clique em Senha no rodapé do menu. No celular, toque em Menu (barra de baixo) e depois em Senha.", "Informe a senha atual e a nova duas vezes."],
    },
  ],
  faq: [
    { q: "Desativei alguém e a pessoa ainda estava com o painel aberto.", a: "A próxima ação dela já é recusada e o painel volta para o login." },
    { q: "Como sei quem alterou alguma coisa?", a: "Em Auditoria (só administração) ficam todas as alterações, entradas no painel e acessos negados." },
  ],
  rules: ["RN-05.2", "RN-05.3", "RN-05.4", "RN-05.7", "RN-05.8", "RN-05.10"],
};
