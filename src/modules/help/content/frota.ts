import type { HelpArticle } from "../model/help.types";

export const frota: HelpArticle = {
  slug: "frota",
  title: "Frota",
  summary: "Cadastro dos carros com diária, caução, quilometragem e mínimo de diárias; fotos para o site; ficha com manutenções e desempenho; e o checklist de devolução.",
  routes: ["/frota"],
  roles: ["admin", "central"],
  updated: "2026-11-11",
  flow: [
    { label: "Livre", detail: "Pode ser reservado." },
    { label: "Reservado", detail: "Tem reserva futura; a frota mostra a próxima." },
    { label: "Em locação", detail: "Está com o cliente." },
    { label: "Aguardando checklist", detail: "Voltou; só sai de novo com o checklist aprovado." },
  ],
  flowExits: [{ label: "Manutenção", detail: "Prevalece sobre os outros: não aceita reservas e some do site." }],
  sections: [
    {
      title: "1. Cadastrar ou editar um carro",
      steps: [
        "Em Frota, clique em Novo veículo (ou em Editar, no cartão do carro).",
        "Informe placa (ABC1234 ou ABC1D23), modelo, categoria (Economy ou Premium), câmbio, lugares e a diária em reais.",
        "Proprietário: o nome do dono. Se o dono for parceiro, escolha também o Parceiro proprietário; é isso que gera o repasse a ele no encerramento.",
        "Opcionais: caução (pré-autorização no cartão), limite de km por dia e valor do km excedente (o valor exige o limite), e mínimo de diárias (em branco = 1).",
        "Ficha do carro, que aparece no site: ano, cor, combustível, portas, itens e descrição.",
        "Para tirar o carro de circulação, marque Em manutenção (não aceita reservas).",
      ],
      items: [
        "Diária, caução e km são copiados para a reserva no momento em que ela é criada. Mudar o carro depois não altera reservas existentes.",
        "Com mínimo de diárias, o carro não aparece na nova reserva para períodos menores e o site mostra \"Mínimo de X diárias\".",
      ],
    },
    {
      title: "2. Fotos",
      steps: ["No cartão do carro, clique em Fotos e envie uma ou várias (JPEG, PNG ou WebP, até 10 MB cada).", "A primeira é a capa. Para trocar, use \"Usar como capa\" na foto."],
      items: ["O site mostra a capa na frota e todas as fotos na página do carro. Carro em manutenção não aparece no site.", "O site não mostra preço: a central informa a diária no pedido."],
    },
    {
      title: "3. Ficha do carro",
      text: "Clique em Ficha no cartão do carro para ver:",
      items: [
        "Desempenho dos últimos 12 meses: reservas, dias alugados, ocupação, receita, km rodados, custo de manutenção e resultado.",
        "Manutenções: clique em Registrar manutenção (data, tipo, o que foi feito, custo, km e oficina).",
        "As reservas do carro e as fotos.",
        "Na lista da frota, o comparativo mostra os carros lado a lado.",
      ],
    },
    {
      title: "4. Checklist de devolução",
      text: "Na tela da Frota fica a lista de itens conferidos em toda devolução (combustível, estética, óleo, pneus, documentos e outros).",
      steps: ["Escreva o nome em Novo item e clique em Adicionar. Para renomear, edite o nome e clique em Salvar; para deixar de usar, desmarque o item.", "Os itens ativos aparecem como conferências da reserva na etapa Devolvida. Desativar um item não apaga as conferências já feitas."],
      items: ["O carro só sai para nova locação depois que a reserva anterior passa de Devolvida, com o checklist aprovado. Pode sair no mesmo dia."],
    },
  ],
  faq: [
    { q: "Mudei a diária e a reserva antiga continuou com o valor velho.", a: "É de propósito: a reserva guarda a diária do dia em que foi criada." },
    { q: "O carro não aparece no site.", a: "Está em manutenção, ou ainda não tem fotos (nesse caso o site usa imagem ilustrativa)." },
  ],
  rules: ["RN-01.1", "RN-01.2", "RN-01.3", "RN-01.4", "RN-01.6", "RN-01.7", "RN-01.8", "RN-01.9", "RN-01.10", "RN-02.18", "RN-02.32", "RN-06.4"],
};
