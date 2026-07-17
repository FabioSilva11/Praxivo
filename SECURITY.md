# Política de Segurança — Praxivo

> **Nota:** este documento consolida, num único lugar, tudo que já está descrito de forma espalhada em `03-autenticacao.md`, `09-configuracoes.md`, `10-area-financeira.md`, `13-integracao-stripe.md` e `14-arquitetura.md`. Ele serve como referência única de segurança do projeto — os arquivos de especificação continuam sendo a fonte de detalhe de cada tela, mas as *regras* de segurança vivem aqui.
>
> Este é um documento de **especificação**. O projeto ainda está em fase de planejamento (ver "Status do Projeto" no README) — nada aqui foi implementado ou auditado em produção ainda.

---

## 1. Autenticação

| Medida | Implementação |
|--------|----------------|
| Método de login | Email + senha (sem login social/OAuth) |
| Hash de senha | bcrypt, salt rounds: 12 |
| Senha mínima aceita | 6 caracteres (ver nota abaixo) |
| Tokens de sessão | JWT — access token expira em 7 dias, refresh token em 30 dias |
| Verificação de email | Obrigatória antes de acessar o dashboard; token expira em 24h |
| Recuperação de senha | Link único por email, de uso único |
| Rate limiting de login | Máximo 5 tentativas em 15 minutos por conta/IP |
| CSRF | Token CSRF em todos os formulários |
| HTTPS | Obrigatório em produção (sem exceções) |

> ⚠️ **Ponto de atenção aberto:** a senha mínima aceita é de 6 caracteres, mas o próprio indicador de força da UI (`03-autenticacao.md`) classifica "6+ caracteres" como força **Média**, não **Forte**. Ou seja, o sistema permite cadastro com uma senha que ele mesmo não considera forte. Recomenda-se decidir, antes da implementação, se o mínimo aceito deve subir (ex: 8 caracteres) ou se isso é aceitável para o produto.

### Autenticação de Dois Fatores (2FA)
- Opcional, ativável em Configurações › Segurança
- Baseado em app autenticador (TOTP — compatível com Google Authenticator, Authy, etc.)
- 8 códigos de backup de uso único, gerados na ativação

### Sessões
- Usuário pode ver todas as sessões ativas (dispositivo, IP, localização, último acesso)
- Pode encerrar sessões individualmente ou todas de uma vez (exceto a atual)

---

## 2. Isolamento de Dados (Multi-Tenancy)

Princípio central do sistema: **um usuário nunca pode ver ou modificar dados de outro usuário.**

| Camada | Como o isolamento é garantido |
|--------|-------------------------------|
| Banco de dados | Row Level Security (RLS) habilitada em todas as tabelas com dado de usuário (`medications`, `alerts`, `history`, etc.) |
| Query | **Toda** query passa por `WHERE user_id = ?` — nunca há um `SELECT * FROM medications` sem filtro |
| Middleware da API | Extrai `userId` do JWT e injeta automaticamente em todas as queries antes de chegar ao service layer |
| Validação de propriedade | Antes de ler/atualizar/excluir um recurso, o backend confirma que `resource.user_id === userId` da sessão — se não bater, retorna "não encontrado" (nunca "acesso negado", para não vazar a existência do recurso) |

Fluxo de validação em camadas (Frontend → API Gateway → Service Layer → Database → Resposta):
1. Frontend valida formato (UX, não é segurança de verdade)
2. API Gateway valida JWT e autorização
3. Service Layer aplica regras de negócio + injeta `userId`
4. Database aplica RLS como última linha de defesa
5. Resposta é filtrada antes de sair (nunca retornar campos internos como hash de senha)

> Ver `14-arquitetura.md` para os exemplos de SQL e middleware.

---

## 3. Pagamentos (Stripe)

O Stripe é a **única integração externa** do produto, usada exclusivamente para processamento de pagamentos — não há login social nem integrações com Slack, Google Workspace, Microsoft 365 ou qualquer outra ferramenta de terceiros.

| Medida | Implementação |
|--------|----------------|
| Dados de cartão | Nunca tocam o backend do Praxivo — processados inteiramente pelo Stripe (Stripe Elements / Checkout) |
| PCI DSS | Compliance delegado ao Stripe via Stripe Elements |
| 3D Secure | Ativado automaticamente quando exigido pelo emissor do cartão |
| Verificação de webhook | Toda requisição em `/api/webhooks/stripe` valida a assinatura (`stripe-signature`) contra `STRIPE_WEBHOOK_SECRET` antes de processar qualquer evento |
| Idempotência | Idempotency keys usadas para evitar cobranças duplicadas em caso de retry |
| Segredos | `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` só existem no backend, nunca expostos ao frontend (só a `STRIPE_PUBLIC_KEY` é pública) |

### Escopo dos webhooks
Os webhooks do Stripe são usados **apenas** para eventos de status de pagamento/assinatura — não existe um sistema de webhooks genérico configurável pelo usuário:

- `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`
- `customer.subscription.created/updated/deleted`
- `payment_method.attached/detached`

Ver `13-integracao-stripe.md` para o detalhe de cada evento e o tratamento de erro correspondente.

---

## 4. Proteção de Dados em Inadimplência

Quando um pagamento falha ou uma assinatura é cancelada, os dados do usuário **nunca são deletados** — apenas ficam ocultos até a reativação:

| Dado | Comportamento |
|------|----------------|
| Medicamentos, Histórico, Alertas, Configurações | Mantidos no banco, apenas não visíveis enquanto o acesso estiver restrito |
| Faturas | Sempre visíveis (necessárias para o usuário resolver o pagamento) |

Isso evita perda de dados por atraso de pagamento e permite reativação instantânea assim que o pagamento é regularizado (ver os fluxos de `active` → `past_due` → `unpaid` → `canceled` em `13-integracao-stripe.md` e `14-arquitetura.md`).

---

## 5. Infraestrutura e Rede

| Medida | Implementação |
|--------|----------------|
| HTTPS | Obrigatório em toda a aplicação, sem exceção |
| Rate limiting | Aplicado em todas as rotas de API, não só login |
| Backup | Full diário (retenção 30 dias) + incremental a cada 6h (retenção 7 dias) + transacional contínuo (retenção 7 dias) |
| Recuperação | Meta de < 1h para dados corrompidos, < 15min para falha de servidor, < 4h para desastre completo |

---

## 6. Logs e Monitoramento de Segurança

| Evento | Severidade |
|--------|------------|
| Tentativa de acessar dado de outro usuário | **Alta** |
| Token JWT inválido/expirado | Média |
| Limite de plano atingido | Baixa |
| Falha de pagamento recorrente | Média |
| Conta bloqueada por inadimplência | Alta |

Essas métricas alimentam o monitoramento de tentativas de violação de isolamento (queries sem `userId`, tokens expirados, etc.) — ver "Monitoramento e Logs" em `14-arquitetura.md`.

---

## 7. O que ainda não está definido

Como o projeto está em fase de especificação, os seguintes pontos de segurança **ainda não têm uma decisão documentada** e precisam ser resolvidos antes da implementação:

- [ ] Banco de dados e hospedagem (README ainda marca como "A definir") — isso afeta diretamente como RLS será implementado na prática
- [ ] Política de rotação de segredos (`STRIPE_SECRET_KEY`, `JWT_SECRET`, etc.)
- [ ] Processo formal de resposta a incidentes de segurança
- [ ] Se o mínimo de senha deve subir de 6 para 8+ caracteres (ver nota na seção 1)
- [ ] Política de retenção de logs de segurança (por quanto tempo ficam armazenados)

---

## Como reportar uma vulnerabilidade

Este repositório contém apenas documentação de especificação — não há código-fonte ou ambiente em produção ainda. Se você encontrar uma inconsistência ou risco de segurança **na especificação** (por exemplo, uma regra que abre brecha de isolamento de dados), abra uma issue no repositório ou entre em contato via [FabioSilva11](https://github.com/FabioSilva11).

Quando o código-fonte existir, esta seção deve ser atualizada com um canal de contato dedicado (ex: email de segurança) e um processo de disclosure responsável.
