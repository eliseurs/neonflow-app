# Neon Flow — Base funcional recuperada v1.1

Data: 27/09/2026. Projeto: Nexus OS. Fundador: Eliseu Nepomuceno.

## 1. Resultado e alcance da pesquisa

Neon Flow é a operação/vertical de aluguel de veículos e mobilidade do Nexus OS. O foco inicial solicitado é aluguel de veículos, preservando transfer, motoristas parceiros e turismo como partes do domínio já discutido. A base existe em conversas anteriores, referências arquiteturais e registros de reconciliação; não foi encontrada nesta pesquisa evidência suficiente de um aplicativo Neon Flow completo, integrado e operacional.

Esta é uma consolidação para construir o ambiente visual persistente. Não é um laudo de implementação, nem uma alteração dos arquivos canônicos do Orquestrador.

Cobertura: duas consultas ao histórico pessoal; buscas no Drive por NeoFlow, Neonflow, Arquitetura_Nexus_OS, transfer, frota e aluguel; leitura dirigida de sete arquivos do Drive; busca textual nos 25 anexos locais, com extração dos DOCX e PDFs. Buscas do Drive foram limitadas a até 100 resultados por termo: a pesquisa não representa leitura integral de todo o Drive nem exportação completa de todas as conversas. Nenhum código de produção ou banco operacional foi auditado.

Legenda utilizada:
- **Decisão recuperada:** fala/requisito do usuário recuperado pelo histórico; ainda não prova implementação.
- **Registro documental:** texto lido diretamente nos anexos ou Drive; pode ser uma afirmação histórica ou derivada.
- **Proposta recuperada:** sugestão anterior de IA, sem aprovação específica comprovada nesta pesquisa.
- **Síntese proposta:** organização feita nesta rodada para orientar o protótipo.
- **Pendente:** falta definição atual ou evidência.

## 2. Identidade e limites

O nome correto é **Neon Flow**, confirmado expressamente pelo fundador em 27/09/2026. A grafia “Neo Flow” na mensagem anterior resultou da transcrição de áudio; não foi uma decisão de renomeação. A versão 1 desta base interpretou isso incorretamente. Neonflow/NeonFlow são variantes de escrita; NeoFlow permanece como termo de busca e referência histórica quando presente nas fontes.

A R79, de 29/08/2026, registra NeoFlow → RENAMED_TO → Neonflow, explicitamente como uma única vertical. Ela mantém separada a questão do namespace técnico `neoflow` do item 7. Os diagramas TSX e a Lista Mestre do Drive ainda exibem uma colisão de nomes; a Arquitetura Reconciliada de 24/09 distingue a renomeação da vertical da pendência técnica. Portanto, não se deve criar duas verticais nem assumir que renomear uma tela autoriza renomear namespaces, tabelas ou permissões.

| Fronteira | Responsabilidade |
|---|---|
| Neon Flow | Aluguel, reservas, frota, transfer, logística e atendimento de mobilidade |
| NeoAuto | Compra, venda, intermediação e liquidez de veículos |
| Nexus OS | Identidade, contexto, eventos, memória, governança e capacidades compartilhadas |
| Neo360 | Operação imobiliária; conexão contextual futura quando pertinente |
| NeoSerra | Contexto geográfico/ecossistêmico, não uma nova vertical criada por esta base |
| Rede de indicações | Integração com origem e parceiros; não fundir automaticamente NeoReferral ao Neon Flow |

Referências antigas a NeoRent, NeoGuide, NeoStay, Wallet e tablets são propostas históricas de expansão. Não são novos módulos aprovados automaticamente nem prova de produtos construídos.

## 3. O que foi recuperado do histórico

| Data da referência | Conteúdo | Classificação |
|---|---|---|
| 21/09/2025 | Começar por aluguel para turistas e moradores; depois transfer, passeios e motoristas parceiros | Preferência recuperada |
| 08/10/2025 | NepoCenter Transfer com aluguel de veículos próprios e de parceiros, controle de alugados/liberados, check-in e contrato virtual | Decisão recuperada; antecedente do domínio, sem migração técnica comprovada |
| 09/10/2025 | Requisitos de locação, CNH, contrato/assinatura, condutor na entrada e saída, caução, check-in/out e multas | Requisito aceito no histórico recuperado |
| 09/10/2025 | QR por hotel/pessoa, rastreamento de origem e comissão após pagamento e conclusão | Diretriz recuperada |
| 15/05/2026 | Aluguel, transfer, frota e experiência do turista; separação de NeoReferral e NeoAuto | Restrição recuperada |
| 18/05/2026 | Ator, Ativo, Evento, Contexto e Fluxo aplicados à mobilidade | Definição recuperada |
| 23/05/2026 | Perfis para central, cliente, motorista e captador; hotéis, postos, restaurantes e comércio como indicadores | Requisito recuperado |
| 28/05/2026 | NeoFlow como operação de aluguel/transfer, logística, atendimento, clientes e reservas | Definição recuperada |
| 17/08/2026 | Prioridade de reunir o material e estruturar a vertical de aluguel | Diretriz recuperada |
| 27/08/2026 | Bios para motoristas, aproximadamente R$400, 5–10 templates e objetivo de cerca de 150 cadastros | Proposta comercial histórica do usuário; não preço vigente |
| 29/08/2026 | R78/R79: vertical documentada/futura; naming consolidado, namespace separado | Registro documental |
| 23–27/09/2026 | Reunir a vertical em biblioteca/resumo próprio e ambiente visual persistente | Diretriz atual |

As datas desta tabela seguem as referências recuperadas, não os indicadores relativos de tempo apresentados pelo mecanismo de memória.

## 4. Módulos e telas do ambiente

A organização abaixo é uma **síntese proposta** a partir dos requisitos recuperados. O primeiro ambiente deve permitir navegar e simular os fluxos, mantendo clara a diferença entre demonstração e operação real.

| Área | O que o usuário precisa fazer | Base |
|---|---|---|
| Central operacional | Ver retiradas, devoluções, reservas pendentes, disponibilidade e ocorrências do dia | Painel central recuperado; composição desta rodada |
| Frota | Consultar veículo, proprietário/parceiro, documentos, situação e histórico | Frota própria/parceiros e gestão recuperadas |
| Agenda e reservas | Escolher período, verificar disponibilidade, registrar cliente e acompanhar confirmação | Planejamento recuperado |
| Locação | Acompanhar requisitos, condutor, contrato, caução, retirada e devolução | Requisitos históricos aceitos |
| Clientes | Consultar contatos, documentos, preferências e histórico de atendimento | Planejamento de CRM/memória recuperado |
| Financeiro | Acompanhar cobranças, pagamentos, cauções, repasses e comissões | Planejamento recuperado; cálculos ainda pendentes |
| Transfer | Registrar origem, destino, horário e acompanhar motorista e execução | Planejamento recuperado |
| Motoristas e parceiros | Cadastro, disponibilidade, solicitações e serviços atribuídos | Requisito recuperado |
| Indicações | Identificar origem, QR e resultado da indicação | Diretriz recuperada |
| Base da vertical | Abrir fontes, requisitos, decisões, propostas, pendências e versões | Pedido atual de preservação |

### Perfis

- **Gestor/central:** coordena a operação e trata exceções.
- **Cliente/locatário:** solicita, acompanha reserva e documentos, retirada e devolução.
- **Motorista/parceiro:** acompanha solicitações e execução dos serviços pertinentes.
- **Captador/indicador:** registra origem e acompanha o resultado das próprias indicações.
- **Proprietário/locadora parceira:** vínculo de frota recuperado; permissões e necessidade de interface própria ainda pendentes.

O histórico pede os quatro primeiros perfis. A matriz detalhada de acesso é trabalho de especificação posterior, não algo já implementado.

## 5. Fluxos principais

### Aluguel

Solicitação → período/local de retirada e devolução → disponibilidade → proposta → validação de requisitos e condutor → contrato/caução/pagamento → confirmação e bloqueio do período → check-out/entrega → locação em andamento → check-in/devolução → conferência e pendências → encerramento/liberação.

Essa sequência é uma síntese operacional; a ordem exata entre assinatura, pagamento, caução e confirmação precisa ser definida com a operação. Não pressupõe provedor conectado.

Requisitos recuperados: CNH; contrato e assinatura; identificação do condutor; caução; check-in/out; multas. Propostas recuperadas: reserva por período, bloqueio contra sobreposição, disponibilidade e liberação após cancelamento. Fotos, combustível, quilometragem e manutenção devem ser detalhados na especificação do checklist antes do uso real.

### Transfer

Solicitação → origem/destino/data/horário → proposta → confirmação → atribuição a motorista → atendimento → conclusão → conciliação de pagamento e repasse.

A IA pode apoiar interpretação e sugestão. Critérios de seleção, aceite, substituição, atraso, cancelamento e escala para a central permanecem a especificar. SLA histórico não deve virar promessa ativa sem validação.

### Indicação

Hotel/pessoa/parceiro → QR ou origem identificada → solicitação de aluguel/transfer → contratação → pagamento e conclusão → apuração da comissão → repasse registrado.

O histórico estabelece rastreamento e condicionamento à conclusão/pagamento. Percentuais, base de cálculo e regras de estorno não estão congelados por esta base.

## 6. Modelo do domínio ligado ao Nexus OS

| Primitiva | Aplicação no Neon Flow |
|---|---|
| Ator | Cliente, condutor, motorista, gestor, proprietário, locadora e indicador |
| Ativo | Carro, van e documentos associados |
| Evento | Solicitação, confirmação, entrega, devolução, pagamento, ocorrência e manutenção |
| Contexto | Viagem, período, destino, temporada, necessidade e histórico do cliente |
| Fluxo | Locação, transfer, atendimento, cobrança e repasse |

Esta é uma aplicação conceitual das cinco primitivas, não um schema de banco aprovado. No desenho do sistema, reaproveitar serviços do Nexus para identidade, comunicação, contexto, agenda, documentos e auditoria; manter disponibilidade, reservas e operação de veículos no domínio especializado.

O documento de Runtime recuperado propõe: evento → política/contexto → capacidade → provider/adapter → execução → resultado → evento/evidência. PALMO observa e audita. Isso é arquitetura-alvo documental, sem comprovar que tais integrações já funcionam no Neon Flow.

## 7. Números e propostas comerciais preservados

| Referência | Como deve ser tratada |
|---|---|
| 35 motoristas contatados | Memória resumida disponível; não reconfirmado em fonte primária nesta rodada |
| 30 ativos, uma corrida/dia e R$1.500/dia | Meta/cenário histórico; não resultado atual nem projeção validada |
| SLA de 60 segundos | Parâmetro histórico a validar |
| 20% em lead do app / 15% em lead do motorista | Regra presente na memória resumida; base de cálculo e vigência não reconfirmadas |
| Cerca de 150 cadastrados e bio de aproximadamente R$400 | Proposta histórica recuperada de 27/08/2026; não cadastro ou receita realizados |
| Aluguel de R$400 e ganho estimado de R$120–130 | Exemplo histórico de 08/10/2025; não tarifa padrão |
| Bônus de R$300 e referência a 20% do lucro | Modelo antigo de indicação NepoCenter; não incorporar automaticamente à política atual |

Nenhum destes números deve aparecer no protótipo como dado ao vivo. Estimativas anteriores de custo de desenvolvimento e percentual de reaproveitamento também não constituem orçamento técnico validado.

## 8. Pendências que precisam ficar visíveis

1. Frota e parceiros atuais: quais veículos realmente existem e podem ser ofertados.
2. Tarifas, períodos mínimos, limites de uso, combustível, atrasos e extensão da locação.
3. Requisitos do condutor, caução, cobertura, responsabilidade, multas e ocorrências.
4. Política de reserva: bloqueio provisório, prazo para pagamento, cancelamento e liberação.
5. Contrato e provedor de assinatura; integração financeira; tratamento de reembolsos.
6. Distribuição de transfer, disponibilidade/aceite do motorista e exceções.
7. Percentuais e base de cálculo de comissões e repasses.
8. Identidade técnica da vertical e separação do namespace antigo.
9. Evidência de qualquer código/protótipo prévio ainda não localizado.
10. Critérios para sair da demonstração e operar com clientes reais.

Essas lacunas não impedem a construção de um protótipo visual navegável. Elas impedem apresentá-lo como operação validada.

## 9. Briefing para o site/aplicativo persistente

**Nome de apresentação:** Neon Flow.

**Objetivo:** mostrar como a vertical funcionará e preservar sua base funcional no mesmo ambiente que evolui a cada rodada.

**Tela inicial proposta:** central de aluguel, com agenda de retiradas/devoluções, disponibilidade de frota e reservas. Dados de demonstração identificados explicitamente.

**Navegação:** Visão geral; Frota; Reservas; Locação; Clientes; Transfer; Parceiros; Financeiro; Base da vertical. Transfer e demais áreas preservam a abrangência recuperada, enquanto aluguel ocupa o primeiro fluxo.

**Interações do primeiro protótipo:** selecionar veículo; consultar agenda; simular solicitação/reserva; abrir ficha; percorrer etapas de entrega/devolução; alternar perfis demonstrativos; abrir fonte e pendência de cada módulo. Persistência de simulação, caso implementada, deve ser identificada e separada de dados operacionais.

**Mapa funcional:** permitir selecionar um módulo e ver objetivo, atores, entradas, saídas, dependências, origem do requisito e estado de evidência. O mapa é parte de uma interface navegável, não substituto de todo o aplicativo.

**Base permanente:** visão mestre; requisitos; fontes e histórico; decisões e pendências; protótipos e evidências; registro de versões. Toda alteração posterior deve atualizar a mesma base e conservar decisões anteriores como histórico.

**Critério de aceite da demonstração:** fluxos navegáveis em celular e desktop; ausência de números apresentados como reais; fontes acessíveis; nomes coerentes; reserva simulada refletida na agenda; nenhuma promessa de integração inexistente.

## 10. Fontes documentais consultadas

### Drive — leitura dirigida realizada

1. [06_ARQUITETURA_RECONCILIADA__PARTE_3_de_3.md](https://drive.google.com/file/d/1PM21sZy15R4ddUtwcN2Vu6q2o4XFJa-8/view?usp=drivesdk) — 24/09/2026; vertical, naming, namespace e nível de realidade.
2. [05_FOUNDER_INTENT_BASELINE__PARTE_2_de_2.md](https://drive.google.com/file/d/1lP6T_giudSPSbvgCt46dY0UKuGlMO8yt/view?usp=drivesdk) — 24/09/2026; divergências entre fontes e decisões abertas.
3. [LOTE_01_ITENS_001_020.md](https://drive.google.com/file/d/1Dnyf6idA1DPjrq6Z5a7YIsd1aMAZXNqe/view?usp=drivesdk) — rastreabilidade do item 7; acesso técnico não equivale à vertical operacional.
4. [parecer-genealogia-colisao.md](https://drive.google.com/file/d/1y-nSMd4e7zwva0kRasBY-VniCi7myXs6/view?usp=drivesdk) — R79 e preservação da história.
5. [NEXUS_OS_DNA_PRINCIPIOS_VERTICAIS_LISTA_MESTRE](https://docs.google.com/document/d/1APoUH2ntDeCxZcq0ucfaOD5cUwW-dVVijfFhiqAJ5FA/edit?usp=drivesdk) — fonte derivada com colisão ainda descrita; divergência preservada.
6. [parecer-portfolio-ideias.md](https://drive.google.com/file/d/13KL5WfWN4flT44kjXho-y-z3wZw-_qOI/view?usp=drivesdk) — distinção entre identidade de vertical e candidatura de novas ideias.
7. [REC_R102_946446.html](https://drive.google.com/file/d/1jjuyssvm4dpnPhpfje799_TVOO7U7xBy/view?usp=drivesdk) — verificação de ocorrências de frota: liquidação e eletrificação são oportunidades NeoAuto/cross-vertical, não especificação de locação Neon Flow.

### Anexos locais — principais referências relevantes

- `NEXUS OS Diagrama Unificado v1 02.tsx` e `v1 01(1).tsx`: Fleet Manager planejado, rota proposta `/flow`, situação histórica congelada. Percentuais no diagrama não foram aceitos como progresso medido.
- `nexus-orquestrador-reconciliacao 22.html`: texto direto das R78 e R79, com nomenclatura e pendência técnica distintas.
- `NEXUS_OS_ORQUESTRADOR_COMPLETO.md`: dossiês históricos R03/R52 e referências de portfólio; nome de arquivo “completo” não garante atualidade.
- `NEXUS_Pitch_Cliente_Living_Profile_v1(1).html`: mobilidade regional, transfer, turismo e memória de preferências; marcado como futuro.
- `NEXUS_OS_RUNTIME_EXECUCAO_E_INDEPENDENCIA_N8N_v1(1).docx`: arquitetura-alvo de capacidades e execução.
- `NEXUS_Arqueologia_Profunda_Conexoes_v1(1).docx`: referências de orquestradores por vertical.

### Histórico de conversas

Os requisitos operacionais detalhados vieram majoritariamente da recuperação de conversas nas datas da seção 3. São referências de memória, não transcrições completas anexadas nem prova de código. `Arquitetura_Nexus_OS_Completa.docx`, `Documento_Recuperacao_Projeto_NeoNoctual_NexusOS.docx` e `nexus_replit_snapshot.md` foram mencionados na recuperação contextual, mas não foram lidos diretamente nesta rodada; não são tratados como fontes diretamente verificadas.

## 11. Estado ao encerrar esta rodada

Pesquisa interna e base funcional v1 consolidadas. Arquivos canônicos preservados. Nenhuma implantação de site, integração financeira, mudança de namespace ou operação real foi realizada nesta rodada. Próxima entrega prevista pelo objetivo do usuário: transformar esta base no ambiente visual persistente Neon Flow, começando pela locação.


## 12. Revisão dirigida ao nome correto — 27/09/2026

Pedido do fundador: revisar a busca sob **Neon Flow**, pois “Neo Flow” veio de transcrição incorreta do áudio. Correção de apresentação aplicada nesta versão; as fontes históricas não foram alteradas.

Buscas adicionais no Drive: Neon Flow, NeonFlow, Neon, NEON_FLOW, cartao_executivo e cartão. Revisão dos 25 anexos com padrão Neon + separador opcional + Flow. Nova consulta contextual e pesquisa pelo cartão executivo nos arquivos disponíveis. Resultados de busca não equivalem a leitura de todos os arquivos retornados.

### Achados adicionais

1. **Fonte citada ainda não localizada:** `NEON_FLOW_cartao_executivo.pdf`. O [CATALOGO_RESPOSTA_03_FALTAM_NO_ORQUESTRADOR.md](https://drive.google.com/file/d/1hDSxPtUVWot6bgn8MLeMlGZyjaBHUTco/view?usp=drivesdk), bloco D, afirma que o cartão contém detalhamento não incorporado. Isso é uma referência ao PDF, não leitura de seu conteúdo.
2. **Correção da referência do catálogo:** o [CATALOGO_CANDIDATOS.md](https://drive.google.com/file/d/1775W8z7fByx4DjJ3eJ3h2WzsO4K2x1L0/view?usp=drivesdk), CAT-D1, marca o PDF como faltante e corrige a associação: itens 7 e 108, não item 75 (Nexus Council). Não incorporar a referência errada ao aplicativo.
3. **Locação explicitamente documentada:** `NEXUS-OS-PROMPT-RECUPERACAO.pdf` e sua variante nomeiam Neonflow como “locação e gestão de frota de veículos”. A palavra “ativas” presente no prompt é uma declaração documental, não prova de software em produção.
4. **Isolamento contextual proposto:** `NEXUS OS Recovery Seguranca.pdf`, de maio de 2026, exemplifica `neonflow:locacao`. É proposta documental de segurança; não confirma namespace implantado e não substitui automaticamente o `neoflow` citado no item 7.
5. **Representação visual existente:** [nexus-os-shell-v2.html](https://drive.google.com/file/d/13T1baR5LLFpLWbWIQSQBap1B_Wj4KknN/view?usp=drivesdk) contém cartão Neonflow no Shell geral, ainda com anotação de colisão. É representação de portfólio, não aplicativo dedicado de locação.
6. **Memória complementar:** registros de outubro de 2025 associam NeonFlow a aluguel como operação imediata e atendimento inteligente por WhatsApp. Catálogo, contrato digital, quilometragem, manutenção/seguro e caixa aparecem como propostas de MVP. Não há nova comprovação de implantação.
7. **Contaminação semântica histórica:** a recuperação também encontrou respostas antigas de IA que usavam NeonFlow para automações/n8n. Elas não devem redefinir o negócio: o fundador esclarece aluguel, transfer e frota. Classificar como uso divergente histórico, sem fundir responsabilidades.

### Resultado da revisão

A base funcional de aluguel/transfer continua válida; o nome foi corrigido. A nova leitura acrescenta uma pendência documental concreta (cartão executivo), uma referência de isolamento contextual e uma representação no Shell. O cartão executivo não foi recuperado nesta rodada; seu conteúdo não foi inventado. Não foi encontrada nova prova de aplicativo operacional completo.
