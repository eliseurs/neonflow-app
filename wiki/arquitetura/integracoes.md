---
id: ARQ-INTEGRACOES
title: Integrações propostas
type: page
status: rascunho
owner: engenharia
updated: 2026-11-03
sources: [Dossiê G]
related: [PEN-38, PEN-39]
---

# Integrações propostas

**Nenhuma integração existe.** São contratos propostos para comparar com os donos existentes no Nexus (PEN-35). O vocabulário de estados deve ser mapeado ao que já existe, sem criar um enum universal novo.

| Gatilho e direção | Dados mínimos | Autorização e retorno | Proteção |
| --- | --- | --- | --- |
| Intenção de aluguel/transfer: Shell → Neon Flow | Identidade ou sessão, CTX, datas, local, necessidade, origem | Central assume após aceite. Resultado volta como estado/evidência | ID de solicitação + correlação, deduplicar reenvio |
| Indicação: hotel/comércio → Shell → Neon Flow | Origem, necessidade, contato permitido | Cliente autoriza contato. Indicador vê só o resultado permitido | Origem ≠ comissão ([RN-0008](../negocio/regras/RN-0008-origem-nao-gera-comissao-automatica.md)) |
| Serviço atualizado: Neon Flow → Nexus/Shell | Reserva, versão, estado, bloqueio, data, responsável | Papel autorizado registra. Shell mostra ao titular | Evento idempotente, versão/conflito, confirmação de consumo |
| Interesse imobiliário: Neon Flow → Nexus → Neo360 | Interesse explícito, região, prazo, contato autorizado | Cliente aprova a finalidade | Sem CNH, caução ou conversa ([RN-0009](../negocio/regras/RN-0009-dados-minimos-entre-verticais.md)) |
| Chegada: NeoPath → Shell/Nexus → Neon Flow | Destino, período, passageiros, preferências | Central assume. Retorna disponibilidade | Sem documentação migratória |
| Roteiro turístico → Neon Flow | Trecho, horário, passageiros, bagagem | Confirmação do cliente e oferta real | Atualizar roteiro não duplica reserva |
| Venda de veículo: Neon Flow → Nexus → NeoAuto | Ativo, intenção de venda, condições | Proprietário decide | Veículo alugado não vira oferta. Sem dados do locatário |

Estados de retorno propostos: recebido, aceito, em atendimento, concluído, recusado e pausado, sempre com motivo e evidência.
