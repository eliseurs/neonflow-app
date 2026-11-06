// Textos da landing. Cada regra citada vem de ../neonflow-api/.claude/business-rules/ ou de um ADR.
// Valores (diária, caução, franquia, km, hora extra) são configuráveis pela operação (RN-01.5) e não aparecem aqui.

export type Lang = "pt" | "en";

export type ServiceKind = "aluguel" | "aluguel-motorista" | "transfer";

interface Card {
  counter: string;
  chips: string[];
  overline: string;
  title: string;
  titleAccent: string;
  items: string[];
  cta: string;
  service: ServiceKind;
}

export interface LandingContent {
  nav: {
    rental: string; transfer: string; fleet: string; conditions: string; contact: string; book: string; switchTo: string;
    menu: string; close: string; home: string; language: string; staff: string; support: string; supportText: string;
  };
  hero: {
    overline: string; title: string; titleAccent: string; lead: string; rentalCta: string; transferCta: string;
    step: string; stepHint: string; cardTitle: string; cardLead: string; choose: string; continue: string;
    /** "{service}" vira o serviço escolhido. */
    picked: string;
  };
  trust: { title: string; text: string }[];
  services: { overline: string; title: string; titleAccent: string; lead: string; rental: Card; transfer: Card };
  fleet: {
    overline: string; title: string; titleAccent: string; note: string; cta: string;
    cars: { category: string; model: string; chips: string[] }[];
  };
  conditions: {
    overline: string;
    title: string;
    titleAccent: string;
    rental: { title: string; items: string[] };
    transfer: { title: string; items: string[] };
  };
  area: { overline: string; title: string; titleAccent: string; places: string[]; onDemand: string };
  steps: { overline: string; title: string; titleAccent: string; items: { title: string; text: string }[] };
  contact: {
    overline: string;
    title: string;
    titleAccent: string;
    lead: string;
    service: string;
    services: Record<ServiceKind, string>;
    name: string;
    start: string;
    end: string;
    route: string;
    notes: string;
    submit: string;
    unavailable: string;
    message: { greeting: string; service: string; name: string; start: string; end: string; route: string; notes: string };
  };
  final: { title: string; titleAccent: string; lead: string; cta: string; back: string };
  footer: { region: string; staff: string; rights: string; about: string; pills: string[]; explore: string; contact: string; top: string; whatsapp: string };
  whatsapp: string;
}

export const content: Record<Lang, LandingContent> = {
  pt: {
    nav: {
      rental: "Aluguel", transfer: "Transfer", fleet: "Frota", conditions: "Condições", contact: "Contato", book: "Reservar", switchTo: "EN",
      menu: "Abrir menu", close: "Fechar menu", home: "Início", language: "Idioma", staff: "Área da central",
      support: "Atendimento", supportText: "Direto com a central, pelo WhatsApp.",
    },
    hero: {
      overline: "Serviço · Aluguel e transfer",
      title: "Aluguel e transfer",
      titleAccent: "na Serra Gaúcha.",
      lead: "Carros com ou sem motorista e transfer privado desde os aeroportos de Porto Alegre e Caxias do Sul. Reserva direta com a central.",
      rentalCta: "Alugar um carro",
      transferCta: "Reservar transfer",
      step: "Passo 1 de 2",
      stepHint: "Peça agora",
      cardTitle: "Comece seu pedido",
      cardLead: "Escolha o serviço para seguir com datas e trajeto.",
      choose: "Escolha o serviço",
      continue: "Continuar abaixo",
      picked: "{service} escolhido. Agora toque em “Continuar abaixo”.",
    },
    trust: [
      { title: "Voo acompanhado", text: "Pelo número informado na reserva" },
      { title: "Seguro incluso", text: "Na diária do aluguel sem motorista" },
      { title: "60 min de espera", text: "Inclusos no aeroporto" },
      { title: "Cancelamento grátis", text: "Até 48 h antes da retirada" },
    ],
    services: {
      overline: "Serviços",
      title: "Chegar e circular",
      titleAccent: "com o mesmo cuidado.",
      lead: "Dois serviços, uma central: o carro para a viagem e o transfer desde o aeroporto.",
      rental: {
        counter: "01 / 02",
        chips: ["Economy e Premium", "Mínimo de 1 diária"],
        overline: "01 — Aluguel",
        title: "Aluguel",
        titleAccent: "com ou sem motorista.",
        items: [
          "Sem motorista: seguro incluso na diária",
          "Com motorista: sob consulta",
          "Mínimo de 1 diária",
          "Categorias Economy e Premium",
        ],
        cta: "Pedir aluguel",
        service: "aluguel",
      },
      transfer: {
        counter: "02 / 02",
        chips: ["POA e CXJ", "Voo acompanhado"],
        overline: "02 — Transfer",
        title: "Transfer privado",
        titleAccent: "do aeroporto ao destino.",
        items: [
          "Aeroportos de Porto Alegre (POA) e Caxias do Sul (CXJ)",
          "Voo acompanhado pelo número informado na reserva",
          "60 minutos de espera inclusos no aeroporto",
          "Valor sob consulta, conforme o trajeto",
        ],
        cta: "Pedir transfer",
        service: "transfer",
      },
    },
    fleet: {
      overline: "A frota",
      title: "Duas categorias,",
      titleAccent: "um padrão.",
      note: "O valor da diária é informado pela central na reserva.",
      cta: "Pedir este carro",
      cars: [
        { category: "Economy", model: "Volkswagen Jetta", chips: ["Com ou sem motorista", "Seguro incluso"] },
        { category: "Premium", model: "Mercedes-Benz C180", chips: ["Com ou sem motorista", "Seguro incluso"] },
      ],
    },
    conditions: {
      overline: "Condições",
      title: "Tudo claro",
      titleAccent: "antes de reservar.",
      rental: {
        title: "Aluguel sem motorista",
        items: [
          "Condutor com 21 anos ou mais e habilitação há pelo menos 1 ano.",
          "Seguro incluso na diária. Em caso de dano, paga-se só a franquia.",
          "Caução por pré-autorização no cartão de crédito, liberada quando o carro volta em ordem.",
          "Retire com o tanque cheio e devolva com o tanque cheio. Se faltar, a diferença é cobrada.",
          "Limite de quilômetros por dia, informado na reserva.",
          "Tolerância de 1 hora na devolução. Depois disso, cobra-se uma diária extra.",
          "Para estender o aluguel, fale com a central: se o carro estiver livre, paga-se a diferença; se não, oferecemos outro da mesma categoria.",
          "Cancelamento grátis até 48 horas antes da retirada. Depois disso, cobra-se 1 diária e o restante é estornado.",
          "Multas de trânsito do período ficam com o condutor principal.",
          "Habilitação estrangeira: consulte a central antes de reservar.",
        ],
      },
      transfer: {
        title: "Transfer",
        items: [
          "A central acompanha o voo em tempo real.",
          "Até 60 minutos de espera no aeroporto estão inclusos. Depois disso, a espera é cobrada por hora.",
          "Cancelamento grátis até 24 horas antes do serviço. Dentro das 24 horas, cobra-se 50% do valor.",
          "Voo cancelado pela companhia aérea: sem cobrança.",
          "Atrasos causados por trânsito, acidente, clima ou greve não são de responsabilidade da empresa.",
        ],
      },
    },
    area: {
      overline: "Onde atendemos",
      title: "Da capital",
      titleAccent: "à Serra.",
      places: ["Porto Alegre — aeroporto e cidade", "Caxias do Sul (CXJ)", "Gramado", "Canela", "Nova Petrópolis", "Bento Gonçalves"],
      onDemand: "Outras cidades sob consulta.",
    },
    steps: {
      overline: "Como reservar",
      title: "Três passos,",
      titleAccent: "com a central.",
      items: [
        { title: "Peça", text: "Pelo WhatsApp ou pelo formulário abaixo, com o serviço, as datas e o trajeto." },
        { title: "Confirme", text: "A central confere a disponibilidade e informa o valor." },
        { title: "Pague", text: "Valor integral por Pix ou link de pagamento. A pré-reserva fica guardada por 24 horas." },
      ],
    },
    contact: {
      overline: "Contato",
      title: "Fale com",
      titleAccent: "a central.",
      lead: "O formulário monta a mensagem e abre o WhatsApp da central. Nada fica gravado neste site.",
      service: "Serviço",
      services: { aluguel: "Aluguel sem motorista", "aluguel-motorista": "Aluguel com motorista", transfer: "Transfer" },
      name: "Nome",
      start: "Data de início",
      end: "Data de término",
      route: "Trajeto ou local de retirada",
      notes: "Observações (voo, passageiros, malas)",
      submit: "Enviar pelo WhatsApp",
      unavailable: "O WhatsApp da central ainda está sendo configurado.",
      message: {
        greeting: "Olá! Quero fazer um pedido ao Neon Flow.",
        service: "Serviço",
        name: "Nome",
        start: "Início",
        end: "Término",
        route: "Trajeto/local",
        notes: "Observações",
      },
    },
    final: {
      title: "Pronto para viajar",
      titleAccent: "com conforto?",
      lead: "A central confere a disponibilidade e responde pelo WhatsApp.",
      cta: "Fazer meu pedido",
      back: "Voltar ao início",
    },
    footer: {
      region: "Gramado · Serra Gaúcha",
      staff: "Área da central",
      rights: "Todos os direitos reservados.",
      about: "Aluguel de carros com ou sem motorista e transfer privado na Serra Gaúcha.",
      pills: ["Seguro incluso", "Voo acompanhado", "Reserva direta"],
      explore: "Explorar",
      contact: "Contato",
      top: "Voltar ao topo",
      whatsapp: "WhatsApp da central",
    },
    whatsapp: "Falar no WhatsApp",
  },
  en: {
    nav: {
      rental: "Car rental", transfer: "Transfer", fleet: "Fleet", conditions: "Conditions", contact: "Contact", book: "Book", switchTo: "PT",
      menu: "Open menu", close: "Close menu", home: "Home", language: "Language", staff: "Staff area",
      support: "Support", supportText: "Straight to our team, on WhatsApp.",
    },
    hero: {
      overline: "Service · Rental and transfer",
      title: "Car rental and transfers",
      titleAccent: "in the Serra Gaúcha.",
      lead: "Cars with or without a driver and private transfers from Porto Alegre and Caxias do Sul airports. Book directly with our team.",
      rentalCta: "Rent a car",
      transferCta: "Book a transfer",
      step: "Step 1 of 2",
      stepHint: "Request now",
      cardTitle: "Start your request",
      cardLead: "Choose the service to continue with dates and route.",
      choose: "Choose the service",
      continue: "Continue below",
      picked: "{service} selected. Now tap “Continue below”.",
    },
    trust: [
      { title: "Flight tracked", text: "Using the number in your booking" },
      { title: "Insurance included", text: "In the self-drive daily rate" },
      { title: "60 min waiting", text: "Included at the airport" },
      { title: "Free cancellation", text: "Up to 48 h before pick-up" },
    ],
    services: {
      overline: "Services",
      title: "Arrive and get around",
      titleAccent: "with the same care.",
      lead: "Two services, one team: the car for your trip and the transfer from the airport.",
      rental: {
        counter: "01 / 02",
        chips: ["Economy and Premium", "Minimum of 1 day"],
        overline: "01 — Rental",
        title: "Car rental",
        titleAccent: "with or without a driver.",
        items: [
          "Self-drive: insurance included in the daily rate",
          "With a driver: on request",
          "Minimum of 1 day",
          "Economy and Premium categories",
        ],
        cta: "Request a car",
        service: "aluguel",
      },
      transfer: {
        counter: "02 / 02",
        chips: ["POA and CXJ", "Flight tracked"],
        overline: "02 — Transfer",
        title: "Private transfer",
        titleAccent: "from the airport to your door.",
        items: [
          "Porto Alegre (POA) and Caxias do Sul (CXJ) airports",
          "Flight tracked using the number in your booking",
          "60 minutes of airport waiting time included",
          "Price on request, based on the route",
        ],
        cta: "Request a transfer",
        service: "transfer",
      },
    },
    fleet: {
      overline: "The fleet",
      title: "Two categories,",
      titleAccent: "one standard.",
      note: "Our team quotes the daily rate when you book.",
      cta: "Request this car",
      cars: [
        { category: "Economy", model: "Volkswagen Jetta", chips: ["With or without a driver", "Insurance included"] },
        { category: "Premium", model: "Mercedes-Benz C180", chips: ["With or without a driver", "Insurance included"] },
      ],
    },
    conditions: {
      overline: "Conditions",
      title: "Everything clear",
      titleAccent: "before you book.",
      rental: {
        title: "Self-drive rental",
        items: [
          "Drivers must be 21 or older and have held a licence for at least 1 year.",
          "Insurance included in the daily rate. In case of damage, you only pay the deductible.",
          "Security deposit as a pre-authorisation on your credit card, released when the car comes back in order.",
          "Full-to-full fuel policy. Any missing fuel is charged.",
          "Daily mileage limit, stated in your booking.",
          "1-hour grace period on return. After that, one extra day is charged.",
          "To extend your rental, contact our team: if the car is free, you pay the difference; if not, we offer another car in the same category.",
          "Free cancellation up to 48 hours before pick-up. After that, 1 day is charged and the rest is refunded.",
          "Traffic fines during the rental are the main driver's responsibility.",
          "Foreign driving licences: please contact us before booking.",
        ],
      },
      transfer: {
        title: "Transfer",
        items: [
          "We track your flight in real time.",
          "Up to 60 minutes of airport waiting time are included. After that, waiting is charged by the hour.",
          "Free cancellation up to 24 hours before the service. Within 24 hours, 50% of the price is charged.",
          "Flight cancelled by the airline: no charge.",
          "Delays caused by traffic, accidents, weather or strikes are not the company's responsibility.",
        ],
      },
    },
    area: {
      overline: "Where we operate",
      title: "From the capital",
      titleAccent: "to the mountains.",
      places: ["Porto Alegre — airport and city", "Caxias do Sul (CXJ)", "Gramado", "Canela", "Nova Petrópolis", "Bento Gonçalves"],
      onDemand: "Other cities on request.",
    },
    steps: {
      overline: "How to book",
      title: "Three steps,",
      titleAccent: "with our team.",
      items: [
        { title: "Request", text: "On WhatsApp or using the form below, with the service, dates and route." },
        { title: "Confirm", text: "Our team checks availability and quotes the price." },
        { title: "Pay", text: "Full amount by Pix or payment link. Your pre-booking is held for 24 hours." },
      ],
    },
    contact: {
      overline: "Contact",
      title: "Talk to",
      titleAccent: "our team.",
      lead: "The form writes the message and opens our WhatsApp. Nothing is stored on this website.",
      service: "Service",
      services: { aluguel: "Self-drive rental", "aluguel-motorista": "Rental with a driver", transfer: "Transfer" },
      name: "Name",
      start: "Start date",
      end: "End date",
      route: "Route or pick-up location",
      notes: "Notes (flight, passengers, luggage)",
      submit: "Send on WhatsApp",
      unavailable: "Our WhatsApp line is still being set up.",
      message: {
        greeting: "Hello! I would like to make a request to Neon Flow.",
        service: "Service",
        name: "Name",
        start: "Start",
        end: "End",
        route: "Route/location",
        notes: "Notes",
      },
    },
    final: {
      title: "Ready to travel",
      titleAccent: "in comfort?",
      lead: "Our team checks availability and replies on WhatsApp.",
      cta: "Make my request",
      back: "Back to the top",
    },
    footer: {
      region: "Gramado · Serra Gaúcha",
      staff: "Staff area",
      rights: "All rights reserved.",
      about: "Car rental with or without a driver and private transfers in the Serra Gaúcha.",
      pills: ["Insurance included", "Flight tracked", "Direct booking"],
      explore: "Explore",
      contact: "Contact",
      top: "Back to top",
      whatsapp: "Our WhatsApp",
    },
    whatsapp: "Chat on WhatsApp",
  },
};
