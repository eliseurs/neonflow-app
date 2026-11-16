import type { HelpArticle } from "../model/help.types";
import { auditoria } from "./auditoria";
import { clientesParceiros } from "./clientes-parceiros";
import { contratos } from "./contratos";
import { frota } from "./frota";
import { minhaConta } from "./minha-conta";
import { novidades } from "./novidades";
import { pedidos } from "./pedidos";
import { repasses } from "./repasses";
import { reservas } from "./reservas";
import { transfer } from "./transfer";
import { usuarios } from "./usuarios";
import { visaoGeral } from "./visao-geral";

/** Ordem em que aparecem na Central de ajuda (a ordem do menu, com Novidades por último). */
export const ARTICLES: HelpArticle[] = [visaoGeral, reservas, transfer, frota, pedidos, clientesParceiros, repasses, contratos, usuarios, auditoria, minhaConta, novidades];

export function articlesFor(role: string | undefined): HelpArticle[] {
  return ARTICLES.filter((a) => role !== undefined && a.roles.includes(role as HelpArticle["roles"][number]));
}

/** Artigo da tela atual (rota exata ou detalhe, ex.: /reservas/123 → reservas). */
export function articleForPath(path: string, role: string | undefined): HelpArticle | undefined {
  return articlesFor(role).find((a) => a.routes.some((r) => path === r || path.startsWith(`${r}/`)));
}
