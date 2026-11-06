# Specs — Changelog de Alterações

---

## [2026-11-06] — Clientes

- `/clientes` (`src/modules/customers`): busca por nome, WhatsApp ou e-mail, contagem de reservas e transfers, idioma; "Novo cliente".
- `/clientes/:id`: contato com botão WhatsApp, observações, histórico com links para a reserva e o transfer, editar; para o admin, "Anonimizar cliente" com confirmação.
- `CustomerPicker` no campo "Cliente" da nova reserva e do novo transfer: busca no cadastro ou cadastra na hora com nome e WhatsApp; sem cadastro, segue só com o nome. Os detalhes da reserva e do transfer levam à ficha do cliente.
- Testes: `CustomersPage`, `CustomerDetailPage`, seleção e cadastro na nova reserva. `AppRoutes.test` passa a simular os indicadores (antes tentava a rede).

---

## [2026-11-06] — Despacho do transfer revisto

- Detalhe do transfer em "aguardando motorista": painel "Motorista" (`DriverPanel`) com o valor para o motorista (só aumenta) e a lista de motoristas e proprietários ativos. Cada um tem o botão WhatsApp, que abre a conversa individual com uma mensagem pessoal e registra o chamado, e o botão "Aceitou", que pede o carro da corrida (sugere o carro dele se for dono de um só) e confirma pelo valor.
- Aviso de corrida no mesmo dia, rótulo de motorista ou proprietário, "Sem WhatsApp no cadastro" e link para Parceiros quando não há ninguém.
- Sai a oferta com prazo e a mensagem para grupo. O histórico mostra valores em reais.

---

## [2026-11-06] — Transfer

- `/transfers` (`src/modules/transfers`): lista em aberto (o próximo primeiro), concluídos e cancelados; "Novo transfer" com cliente, data e hora, origem, destino, voo, passageiros, preço combinado e "Indicado por".
- `/transfers/:id`: abrir ou reabrir a oferta (valor e prazo; não diminui), copiar a mensagem para o WhatsApp dos motoristas (sem o nome do cliente), registrar quem aceitou, "Motorista desistiu", marcar o pagamento, iniciar, concluir com a espera extra e cancelar com a multa calculada (zero se o voo foi cancelado). Histórico das ações.
- Repasses: nova aba "Motoristas" (valor fixo: oferta + espera); itens de transfer levam ao transfer.
- Menu: "Transfer". Testes: `TransfersPage`, `TransferDetailPage`, `transfer.types`, aba de motoristas.

---

## [2026-11-06] — Indicadores na tela inicial

- Tela inicial: "Faturamento de <mês>" com as retiradas no mês (diárias, atraso e km) e o pago no mês lado a lado (q97), e "Ocupação hoje" com o percentual e "x de y carros em locação" (q98), de `GET /api/dashboard`.
- A reserva traz `paid_at`; alterar conferências, avançar ou cancelar atualiza os indicadores e os repasses.
- Testes: indicadores e erro na `DashboardPage`, `monthLabel`.

---

## [2026-11-06] — Repasses e comissões

- `/repasses` (`src/modules/payouts`), admin e central: abas "Repasses aos proprietários" e "Comissões de indicadores", situação "A pagar" ou "Pagos". A pagar mostra o total por parceiro; cada item tem cliente (link para a reserva), carro, percentual, base e valor. "Marcar como pago" pede confirmação; pagos mostram data e quem marcou. Sem percentual: "Percentual a definir".
- Cadastro do parceiro: o repasse mostra a participação administrativa do Neon Flow (100% − repasse) e a base; a comissão diz que sai da parte do Neon Flow.
- Testes: `PayoutsPage`, `totalsByPartner`.

---

## [2026-11-06] — Atraso por minuto e km controlado

- Devolução: a prévia e o detalhe mostram o atraso em minutos ("1 h 05 min", "1 dia 6 h 00 min") e o valor pela diária ÷ 1440 (`lateMinutes`, `lateCents`, `formatMinutes`), espelhando a API (`extra_minutes`). A prévia do km excedente usa só as diárias contratadas (q90).
- Km controlado: o veículo aceita limite de km sem valor do excedente ("200 km/dia · excedente a definir"); a nova reserva oferece o plano limitado e avisa que o valor é definido pela central; na devolução o excedente aparece em km com "valor a definir pela central". Valor sem limite é recusado.
- Landing: a tolerância diz que cada minuto de atraso é cobrado proporcionalmente à diária (PT e EN).

---

## [2026-11-06] — Parceiros e indicação

- `/parceiros` (`src/modules/partners`), admin e central: lista com filtro por tipo, papéis, código, contato e percentuais; cadastro e edição (papéis múltiplos, dados básicos, comissão, repasse ao proprietário e percentual do motorista, ativo). Ao cadastrar, abre o link e o QR de indicação.
- Link `/?ref=CÓDIGO` com botão de copiar e QR em PNG para baixar. Nova dependência `qrcode` (MIT, aprovada em 06/11/2026), gerada no navegador, sem serviço externo.
- Veículo: "Parceiro proprietário" (preenche o nome do proprietário). Nova reserva: "Indicado por"; o detalhe mostra quem indicou.
- Landing: `captureReferral` guarda o código da URL na sessão; a mensagem do WhatsApp leva "Indicação: CÓDIGO" (PT) ou "Referral: CODE" (EN).
- Testes: `PartnersPage`, `partners.types`, vínculos em frota e reservas, indicação na landing.

---

## [2026-11-06] — Usuários e troca de senha no painel

- `/usuarios` (`src/modules/users`), só para admin: lista com papel, ativo/desativado e "você"; criar (nome, e-mail, senha inicial de 10+ caracteres, papel), editar (nome, papel, ativo; e-mail fixo) e redefinir a senha de outro usuário. O admin não consegue tirar o próprio papel nem se desativar.
- Menu: "Usuários" aparece só para admin; "Trocar senha" para todos (sidebar e ícone no celular), com senha atual, nova e confirmação.
- Testes: `UsersPage`, `ChangePasswordForm` e menu por papel.

---

## [2026-11-06] — Caução e plano de km no painel

- Veículo: campos "Caução (R$)", "Limite de km por dia" e "Km excedente (R$)", opcionais (limite e valor juntos). O cartão mostra caução e quilometragem (`kmPlanLabel`).
- Nova reserva: com veículo limitado, escolha entre "Limitado · N km/dia" e "Km livre", com a franquia do período e o valor do km excedente; mostra a caução do veículo. Envia `km_plan`.
- Detalhe: campo "Quilometragem (odômetro)" na entrega e na devolução (obrigatório no plano limitado), prévia do km excedente, plano, franquia, odômetro e caução no resumo, e "Total com extras" (reserva + atraso + km). O aviso de atraso segue a hora informada.
- Lista: "+ R$ X de km". `booking.types`: `excessKm`, `extrasCents`, `KmPlan`.

---

## [2026-11-06] — Hora real e atraso no painel

- Detalhe da reserva: ao avançar para "em locação" e para "devolvida", campo "Hora real da entrega/devolução" (padrão: agora em Gramado). Na devolução, prévia do atraso ("1 diária extra · R$ 100,00") antes de confirmar. Avisos de devolução atrasada e de carro ainda em locação em outra reserva.
- Resumo: hora real da entrega e da devolução, atraso e "Total com o atraso" (reserva + atraso).
- Lista e central marcam a devolução atrasada; a lista mostra "+ R$ X de atraso".
- `booking.types`: `lateDays`, `isOverdue`, `LATE_TOLERANCE_MS`. `format`: `operationNowInput`, `operationInstant` (valida o formato antes de converter: `Date.parse` aceitava `":00-03:00"`).
- Testes passam em America/Sao_Paulo e UTC.

---

## [2026-11-06] — Reserva com horário no painel

- Nova reserva: campos de data e hora (datetime-local, passos de 15 min), padrão amanhã às 10h por 1 diária, aviso "horário de Gramado; 25 horas contam 2 diárias" e prévia "N diárias de 24 h". Envia `start_at`/`end_at`; a disponibilidade também.
- Listas, detalhe, frota e central mostram data e hora sempre no horário de Gramado (`formatDateTime`, `operationDay`, `OPERATION_TZ`), qualquer que seja o fuso do navegador. "Retiradas hoje" e "Devoluções hoje" usam o dia de Gramado; "Próximas retiradas" vai até a devolução combinada.
- `booking.types`: `rentalDays` (blocos de 24 horas, RN-02.24). Testes passam em America/Sao_Paulo e em UTC (o fuso do CI); o painel inicial usa relógio fixo.

---

## [2026-11-06] — Checklist de devolução e estado do veículo no painel

- Frota: o selo do cartão mostra o estado calculado pela API (Livre, Reservado, Em locação, Aguardando checklist, Manutenção) e, quando há, a próxima reserva com link. Botão "Checklist de devolução" abre o `ChecklistManager` (`src/modules/checklist`): renomear, ligar e desligar, subir e descer e adicionar itens.
- Reserva em "devolvida": a lista vira "Checklist de devolução" com "Ocorrências conferidas" e os itens ativos, e só avança com tudo marcado (RN-01.6). Reserva confirmada cujo carro aguarda o checklist de outra mostra o aviso e não deixa entregar.
- `booking.types`: `stageChecks` e `pendingChecks` aceitam o checklist. `fleet.types`: `VehicleStatus`, `NextBooking`, `VEHICLE_STATUS`, `vehicleStatus`.
- Testes: `ChecklistManager`, estado e próxima reserva na frota, checklist na reserva devolvida e entrega bloqueada.

---

## [2026-11-06] — CI no GitHub Actions

- `.github/workflows/ci.yml`: em todo PR e push no `main`, roda `npm ci`, TypeScript (`typecheck`), ESLint, Vitest, build de produção e os testes do protótipo congelado (`prototipo/`, Node 22).
- O mesmo que `make check` mais o build. A API tem workflow equivalente com PostgreSQL (`neonflow-api`). PEN-31 e PEN-32 resolvidas.

---

## [2026-11-05] — Próximo passo indicado no cartão do topo

- Ao escolher Aluguel ou Transfer no cartão "Passo 1 de 2", aparece "✓ {serviço} escolhido. Agora toque em “Continuar abaixo”." (região `aria-live`) e o botão "Continuar abaixo" vira dourado, pulsa com halo três vezes (`animate-nudge`) e a seta desce em loop (`animate-arrow-down`). Cada nova escolha reinicia o pulso. `prefers-reduced-motion` desliga as animações.
- Texto novo `hero.picked` (PT/EN). Teste da landing cobre o antes e o depois.

---

## [2026-11-05] — Estilo LuxuryBus e logo novo

- Logo trocado pelo de `nepo/resources/logo.jpg`: símbolo (anel, estrada e seta) redesenhado em SVG e "neon flow" em Poppins 500. Atualizados `public/brand/*`, `favicon.svg` e `apple-touch-icon.png`; `Wordmark` com tamanhos `sm`, `md`, `lg`. Fonte Poppins (só peso 500) no `index.html`.
- Landing refeita no padrão de luxurybus.ch/transfer-privato: cabeçalho que vira cápsula ao rolar, menu lateral com links em cascata, hero centralizado com cartão "Passo 1 de 2" e seletor de serviço, faixa de garantias, cartões numerados (01 / 02) com chips e checklist, frota com palco iluminado (sem foto, PEN-65) e "Pedir este carro" que preenche o formulário, condições em cartões, área e passos, formulário com progresso e seletor em segmento, chamada final, rodapé com cartão de contato e "voltar ao topo", WhatsApp flutuante verde.
- Tudo com textos já aprovados; sem preço. Novos textos PT/EN em `landing.content.ts` (trust, final, footer, menu).
- Sistema: `.text-gold-grad`/`Accent`, `.btn-gold` com reflexo, `Reveal`/`useReveal`, `ease-silk` e animações (`rise`, `ambient-glow`, `slow-float`, `drawer-in`) no Tailwind; `buttonClass` separado de `Button`. O painel herda o logo, o botão e os acentos.
- `whatsapp.ts`: `formatPhone` para exibir o número.
- WhatsApp da central definido: `VITE_WHATSAPP_NUMBER=5551997192854` no Railway (PEN-66). O `Dockerfile` passa a repassar a variável ao build.
- Testes: landing (cartão do hero, frota preenchendo o formulário, menu com Esc e travamento da rolagem, cabeçalho ao rolar), `useReveal` e `formatPhone`.

---

## [2026-11-05] — Painel da central no visual da landing

- Tema único: `noir`, `bone`, `gold` e Fraunces + Inter também no painel. Saíram os tokens `ink`/`mint` e as fontes DM Sans e Manrope (`tailwind.config.ts`, `index.css`, `index.html`).
- `src/shared/ui`: `Brand` (Wordmark, antes só na landing), `Heading` (Overline, SectionHeading movidos da landing, e `PageHeader`), `Button`, `Field`, `Panel` (EmptyState, ErrorNote, Loading), `Badge`, `Dialog`. `PlaceholderPage` removido. `src/shared/lib/format.ts`: reais ↔ centavos e datas sem fuso.
- Layout: sidebar com logo, navegação em pílulas e usuário; no celular, barra fixa com abas. Login redesenhado com link de volta ao site.
- Central (`/central`): retiradas e devoluções de hoje, pré-reservas aguardando pagamento, veículos em manutenção, próximas retiradas e carros na rua. O dia é a unidade, sem horário (PEN-29); indicadores definitivos seguem em PEN-11.
- Frota (`/frota`): cartões por veículo (categoria, placa, diária, proprietário, lugares, câmbio, manutenção); cadastro e edição em painel lateral. A diária é digitada pela central, sem valor sugerido (RN-01.5); placa validada como na API.
- Reservas (`/reservas`): filtro por etapa (padrão: ativas); nova pré-reserva escolhe o período, consulta `GET /availability`, mostra diárias × diária e cria em `POST /bookings`. Cliente só com nome (PEN-48).
- Detalhe (`/reservas/:id`): etapas, conferências da etapa atual (`PATCH /checks`), avanço só com todas marcadas, cancelamento em dois passos em preparação e confirmada, prazo de pagamento e histórico (`/events`).
- Testes: `FleetPage`, `BookingsPage`, `BookingDetailPage`, `DashboardPage`, `booking.types`, `format` e rotas; fixtures fictícias em `src/test/`.

---

## [2026-11-05] — Landing pública

- `src/modules/landing/`: `LandingPage` em `/` (pública), PT/EN pelo idioma do navegador com botão de troca, linha visual LuxuryBus (fundo `noir`, dourado do logo, Fraunces 300 + Inter) e logo caminho B.
- Seções: hero com aluguel e transfer no mesmo peso (ADR-0011), serviços, frota (Economy: VW Jetta; Premium: Mercedes-Benz C180), condições do aluguel (RN-02.12/13/18/19/20/21, RN-06) e do transfer (RN-02.9/10/16), área atendida (PEN-58), como reservar (RN-02.8, RN-02.14), contato e rodapé com link para a área da central.
- Sem preço (PEN-02: diárias configuráveis, sem valor aprovado), sem fotos e sem hotéis parceiros (PEN-65). Habilitação estrangeira aparece como "consulte a central" (PEN-50).
- Contato: o formulário monta a mensagem e abre o WhatsApp (`wa.me`); nada é gravado (PEN-48). Número em `VITE_WHATSAPP_NUMBER`; vazio desativa o envio e o botão flutuante (PEN-66).
- Rotas: a central saiu de `/` para `/central`; o login sem rota pedida leva para lá; rota desconhecida volta para a landing.
- `tailwind.config.ts`: cores `noir`, `bone`, `gold` e fontes `serif` (Fraunces) e `inter`. `index.html`: fontes e título.
- Testes: `LandingPage.test.tsx`, `whatsapp.test.ts` e rotas atualizadas.

---

## [2026-11-05] — Logo do Neon Flow (caminho B)

- Logo escolhido: serra e estrada num círculo, dourado sobre preto (PEN-64, canvas "Logo Neon Flow" no Claude Design).
- `public/favicon.svg`: troca o "N" verde-água pelo símbolo simplificado (sem a estrada, legível em 16 px) sobre quadrado preto.
- `public/apple-touch-icon.png` (180 px, gerado de `brand/neonflow-icone-app.svg` com `rsvg-convert`) e `<link rel="apple-touch-icon">` no `index.html`.
- `public/brand/`: `neonflow-simbolo.svg` (dourado #C9A86A, fundo escuro), `neonflow-simbolo-fundo-claro.svg` (#7A5C26) e `neonflow-icone-app.svg`.
- O nome "NEON FLOW" não está nos SVGs: SVG usado como imagem não carrega a Fraunces. Na landing, montar o nome em HTML com a fonte (Fraunces 300, `letter-spacing: 0.16em`) até existir uma versão com o texto em contornos.
- O `theme-color` e as cores do painel (#101b25, verde-água) não mudaram.

---

## [2026-11-03] — Railway na arquitetura de dois repositórios

- `neonflow-app` (este repo, raiz) passou a publicar o **frontend React**: https://neonflow-app-production.up.railway.app. Variável `VITE_API_BASE_URL` aponta para a API.
- Protótipo movido para o serviço novo `neonflow-prototipo` (upload de `prototipo/`): https://neonflow-prototipo-production.up.railway.app. A URL antiga da demo agora serve o frontend.
- API (`neonflow-api`) e `Postgres` criados no mesmo projeto Railway (`neonflow`).


## [2026-11-03] — Frontend React e separação em dois repositórios

Este repositório (`eliseurs/neonflow-app`) passa a ser o **frontend**; o backend foi para `eliseurs/neonflow-api` (pasta irmã `../neonflow-api`). Padrão do cognia-app/finder-app (ADR-0009) e formato `.claude/` (ADR-0010).

- **Scaffold**: Vite 5 + React 18 + TS + Tailwind 3 + Zustand 5 + React Query 5 + axios + React Router 6 + sonner.
- **Auth**: `LoginPage`, `auth.service` (`/auth/login`, `/auth/me`), `auth.store` (persistido, checa expiração), `ProtectedRoute`, interceptor JWT que limpa a sessão em 401.
- **Layout**: sidebar com Central, Frota e Reservas (placeholders que apontam as pendências).
- **Testes**: 17 testes Vitest (store, interceptors, rotas, login, logout).
- **Deploy**: Dockerfile (Node 22 → Caddy 2), `Caddyfile` com SPA fallback e headers de segurança, `railway.json` (Dockerfile, `watchPatterns`).
- **Protótipo**: movido para `prototipo/` com `dist/`, `server.mjs`, testes e `.openai/`; `README.md` reúne o as-built.
- **Docs**: wiki removida; regras de negócio, ADRs e pendências agora no repo da API. Aqui ficam `docs/deploy-railway.md` e `docs/qualidade/`.

## [2026-11-03] — Demo no Railway

Protótipo publicado em https://neonflow-app-production.up.railway.app (projeto Railway `nexus-os`), com `server.mjs` sem dependências. Basic Auth ativado e depois removido a pedido do time: acesso público.

## [2026-11-03] — Importação do protótipo

Código do commit `fdf114ef` trazido do Drive com hashes conferidos contra o manifesto de 09/10/2026, mais os 12 testes de auditoria.
