import type { HelpArticle } from "../model/help.types";

export const contratos: HelpArticle = {
  slug: "contratos",
  title: "Contratos e termos",
  summary: "Os seis contratos do Neon Flow em versões com hash: cada mudança de texto é uma versão nova, revisada e aprovada pelo hash exato antes de ser liberada e publicada.",
  routes: ["/contratos", "/termos"],
  roles: ["admin", "legal_reviewer"],
  updated: "2026-11-11",
  flow: [
    { label: "Minuta", detail: "Versão nova, ainda não enviada." },
    { label: "Em revisão", detail: "Enviada para a revisão jurídica." },
    { label: "Aprovado", detail: "A revisora aprovou este texto exato (hash)." },
    { label: "Liberado", detail: "O admin liberou depois das validações." },
    { label: "Publicado", detail: "Vale para os clientes." },
  ],
  flowExits: [{ label: "Ajustes solicitados", detail: "A correção vira uma versão nova, que recomeça como minuta." }],
  sections: [
    {
      title: "Os seis documentos",
      items: [
        "01 Termos Gerais de Uso e Intermediação",
        "02 Termo de Parceria do Prestador (módulos A a E)",
        "03 Programa de Indicações (com o Módulo B)",
        "04 Ordem de Locação de Veículo sem Motorista",
        "05 Ordem de Serviço de Transfer",
        "06 Ordem de Serviço de Passeio Turístico",
      ],
    },
    {
      title: "1. Subir ou atualizar o texto",
      steps: [
        "Na lista de Contratos, envie um arquivo .md ou .txt no contrato certo, com um rótulo opcional (ex.: v0.5). Ou:",
        "Clique em Abrir · baixar · editar, depois em Editar texto. Altere e clique em Salvar como nova versão.",
        "Para trabalhar fora do sistema, use Baixar .md, edite e suba o arquivo de volta.",
      ],
      items: [
        "Toda mudança vira uma versão nova, com hash novo. A versão anterior e o histórico dela nunca são alterados nem apagados.",
        "Só o admin cria versões.",
      ],
    },
    {
      title: "2. Revisar e aprovar",
      steps: [
        "Admin: em Andamento, clique em Enviar para revisão.",
        "Revisão: leia a íntegra. Para corrigir, escreva a justificativa e clique em Pedir ajustes. Para aprovar, marque \"Li a íntegra da versão… e aprovo este texto exato\" e clique em Aprovar esta versão.",
        "Uma aprovação pode ser revogada com justificativa (Revogar aprovação), até a publicação.",
      ],
      items: [
        "A aprovação vale para o hash exato da versão. Qualquer mudança no texto exige nova versão e nova revisão.",
        "Enquanto a advogada não tem conta, o admin também pode aprovar. Cada decisão registra o papel de quem decidiu, então dá para separar depois.",
      ],
    },
    {
      title: "3. Liberar e publicar",
      steps: ["Admin: com a versão aprovada, clique em Liberar e, depois das validações fiscal, regulatória, de seguro e de pagamento, em Publicar."],
      items: [
        "Aprovar não publica. A publicação é sempre uma decisão separada do admin.",
        "Antes de publicar, preencha os campos [A DEFINIR] da minuta (razão social, CNPJ, seguradora, política de cancelamento, percentuais). O sistema publica o texto como está.",
      ],
    },
    {
      title: "O que a publicação muda",
      items: [
        "Ordem 04 publicada: o link de aceite das reservas passa a mostrar a Ordem de Locação e um quadro com os dados da reserva. O cliente marca a caixa e digita o nome, e o aceite guarda a versão, o hash do texto e do quadro.",
        "Sem Ordem 04 publicada, o link mostra os Termos do aluguel (aba Termos). Cada texto publicado lá vira uma versão, e o aceite registra qual o cliente leu.",
        "Se o texto publicado ou os dados da reserva mudarem depois que o cliente abriu o link, o aceite é recusado e ele precisa recarregar a página.",
      ],
    },
  ],
  faq: [
    { q: "Corrigi um erro de digitação. Preciso aprovar de novo?", a: "Sim. Toda mudança gera versão nova com hash novo, e a aprovação anterior vale só para o texto antigo." },
    { q: "Publiquei a Ordem 04. As reservas antigas mudam?", a: "Não. Aceites já registrados continuam com a versão que o cliente aceitou. Links novos e páginas recarregadas passam a mostrar a Ordem." },
    { q: "Onde vejo quem aprovou?", a: "No Histórico da versão: data, situação, nome e papel de quem decidiu, e a justificativa." },
  ],
  rules: ["RN-08.1", "RN-08.2", "RN-08.3", "RN-08.4", "RN-08.5", "RN-08.6", "RN-08.7", "RN-08.10", "RN-02.3"],
};
