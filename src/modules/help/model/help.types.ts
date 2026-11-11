/**
 * Central de ajuda: um artigo por fluxo do painel. O conteúdo fica no código e muda no mesmo PR que muda
 * o fluxo (ver .claude/rules.md, "Ajuda"). `help.test.ts` falha se uma aba do menu ficar sem artigo.
 */
export type HelpRole = "admin" | "central" | "legal_reviewer";

export interface HelpSection {
  title: string;
  /** Texto corrido antes da lista. */
  text?: string;
  /** Passo a passo numerado. */
  steps?: string[];
  /** Lista sem ordem (o que o sistema bloqueia, observações). */
  items?: string[];
}

export interface HelpArticle {
  slug: string;
  title: string;
  /** Uma frase: para que serve o fluxo. */
  summary: string;
  /** Rotas do painel que este artigo explica (o "?" da tela aponta para cá). */
  routes: string[];
  roles: HelpRole[];
  /** AAAA-MM-DD da última revisão do conteúdo. */
  updated: string;
  /** Etapas em ordem, para o diagrama. */
  flow?: { label: string; detail: string }[];
  /** Saídas fora da ordem (ex.: cancelada). */
  flowExits?: { label: string; detail: string }[];
  sections: HelpSection[];
  faq?: { q: string; a: string }[];
  /** Regras de negócio de origem (neonflow-api/.claude/business-rules). */
  rules: string[];
}
