import type { HelpArticle } from "../model/help.types";
import { contratos } from "./contratos";
import { reservas } from "./reservas";
import { transfer } from "./transfer";

/** Ordem em que aparecem na Central de ajuda. */
export const ARTICLES: HelpArticle[] = [reservas, transfer, contratos];

export function articlesFor(role: string | undefined): HelpArticle[] {
  return ARTICLES.filter((a) => role !== undefined && a.roles.includes(role as HelpArticle["roles"][number]));
}

/** Artigo da tela atual (rota exata ou detalhe, ex.: /reservas/123 → reservas). */
export function articleForPath(path: string, role: string | undefined): HelpArticle | undefined {
  return articlesFor(role).find((a) => a.routes.some((r) => path === r || path.startsWith(`${r}/`)));
}
