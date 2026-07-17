# Política de Segurança — Praxivo

> **Nota:** este documento consolida, num único lugar, tudo que já está descrito de forma espalhada em `03-autenticacao.md`, `09-configuracoes.md`, `10-area-financeira.md`, `13-integracao-stripe.md` e `14-arquitetura.md`. Ele serve como referência única de segurança do projeto — os arquivos de especificação continuam sendo a fonte de detalhe de cada tela, mas as *regras* de segurança vivem aqui.
>
> Este é um documento de **especificação**. O projeto ainda está em fase de planejamento (ver "Status do Projeto" no README) — nada aqui foi implementado ou auditado em produção ainda.

---

## 1. Autenticação

Implementada via **Supabase Auth** — não é um sistema de JWT/bcrypt construído do zero.

| Medida | Implementação |
|--------|----------------|
| Método de login | Email + senha via Supabase Auth (sem login social/OAuth) |
| Hash de senha | Gerenciado internamente pelo Supabase Auth (bcrypt) |
| Senha mínima aceita | 8 caracteres |
| Tokens de sessão | JWT (access + refresh) emitidos e renovados pelo Supabase Auth |
| Verificação de email | Fluxo nativo do Supabase Auth; obrigatória antes de acessar o dashboard; link expira em 24h |
| Recuperação de senha | Fluxo nativo do Supabase Auth (`resetPasswordForEmail`), link único de uso único |
| Rate limiting de login | Limites nativos do Supabase Auth + regra adicional da aplicação (5 tentativas em 15 minutos por conta) |
| CSRF | Client SDK do Supabase usa Bearer token, reduzindo a superfície de CSRF tradicional |
| HTTPS | Obrigatório em produção (sem exceções) |

O indicador de força de senha (Média/Forte) reforça boas práticas acima do mínimo, mas o mínimo aceito em si já é 8 caracteres — não existe mais a inconsistência de aceitar como válida uma senha que o próprio indicador classificaria como fraca.

### Autenticação de Dois Fatores (2FA)
- Opcional, ativável em Configurações › Segurança
- TOTP nativo do Supabase Auth (`auth.mfa`), compatível com Google Authenticator, Authy, etc.
- 8 códigos de backup de uso único, gerados na ativação

### Sessões
- Usuário pode ver todas as sessões ativas (dispositivo, IP, localização, último acesso)
- Pode encerrar sessões individualmente ou todas de uma vez (exceto a atual)

---

## 2. Isolamento de Dados (Multi-Tenancy)

Princípio central do sistema: **um usuário nunca pode ver ou modificar dados de outro usuário.**

| Camada | Como o isolamento é garantido |
|--------|-------------------------------|
| Banco de dados (único mecanismo) | Row Level Security (RLS) do Postgres, habilitada em todas as tabelas com dado de usuário (`medications`, `alerts`, `history`, `notifications`) — políticas usam `auth.uid()`, a função nativa do Supabase que identifica o usuário autenticado |
| Query | **Toda** query é automaticamente filtrada por `user_id = auth.uid()` via política de RLS — não há `WHERE` manual escrito pela aplicação, nem `SELECT * FROM medications` sem filtro possível |
| "Não encontrado" vs "Acesso negado" | Como o RLS filtra as linhas antes de chegarem à aplicação, tentar acessar um recurso de outro usuário simplesmente não retorna nenhuma linha — a resposta natural já é "não encontrado", sem precisar de uma função de validação de propriedade escrita à mão |

> **Não existe middleware de aplicação customizado para isolamento.** A única exceção que exige atenção manual é o uso da `service_role` key do Supabase (que ignora RLS) — ela deve ser evitada em rotas normais e, se usada em alguma rotina administrativa pontual, precisa reaplicar o filtro por `user_id` manualmente nesse caso específico.

Fluxo de validação em camadas (Frontend → Supabase Auth → Database → Resposta):
1. Frontend valida formato (UX, não é segurança de verdade)
2. Supabase Auth valida o JWT e resolve `auth.uid()`
3. Aplicação verifica apenas regras de negócio que o RLS não cobre (limite de plano, status de assinatura — ver `14-arquitetura.md`)
4. Database aplica RLS como único mecanismo de isolamento
5. Resposta já vem filtrada — nunca contém dado de outro usuário nem campos internos como hash de senha

> Ver `14-arquitetura.md` para os exemplos de SQL das políticas de RLS.

---

## 3. Storage e Realtime (Supabase)

### Storage
| Medida | Implementação |
|--------|----------------|
| Buckets | Privados por padrão (foto de perfil, logo da empresa) — nunca públicos |
| Controle de acesso | Políticas de RLS no Storage, análogas às do banco: um usuário só acessa arquivos no seu próprio "diretório" (`{user_id}/...`) |
| Formatos/tamanho | Validados no frontend e reforçados por política no bucket (ex: só imagem, máx 2MB para avatar / 1MB para logo) |
| URLs de acesso | Assinadas e temporárias (signed URLs), não links públicos permanentes |

### Realtime
| Medida | Implementação |
|--------|----------------|
| Escopo das subscriptions | Dashboard (`medications`, `alerts`) e Notificações (`notifications`) |
| Autorização | Subscriptions do Supabase Realtime respeitam as mesmas políticas de RLS das tabelas — um usuário não recebe eventos de dados de outra conta |
| Uso | Atualização ao vivo de cards do dashboard e badge de notificações, sem polling |

---

## 4. Pagamentos (Stripe)

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

## 5. Proteção de Dados em Inadimplência

Quando um pagamento falha ou uma assinatura é cancelada, os dados do usuário **nunca são deletados** — apenas ficam ocultos até a reativação:

| Dado | Comportamento |
|------|----------------|
| Medicamentos, Histórico, Alertas, Configurações | Mantidos no banco, apenas não visíveis enquanto o acesso estiver restrito |
| Faturas | Sempre visíveis (necessárias para o usuário resolver o pagamento) |

Isso evita perda de dados por atraso de pagamento e permite reativação instantânea assim que o pagamento é regularizado (ver os fluxos de `active` → `past_due` → `unpaid` → `canceled` em `13-integracao-stripe.md` e `14-arquitetura.md`).

---

## 6. Infraestrutura e Rede

| Medida | Implementação |
|--------|----------------|
| HTTPS | Obrigatório em toda a aplicação, sem exceção |
| Rate limiting | Aplicado em todas as rotas de API, não só login |
| Backup | Gerenciado pelo Supabase (Postgres) — full diário (retenção 30 dias) + incremental a cada 6h (retenção 7 dias) + transacional contínuo (retenção 7 dias), conforme plano contratado |
| Recuperação | Meta de < 1h para dados corrompidos, < 15min para falha de servidor, < 4h para desastre completo |

---

## 7. Logs e Monitoramento de Segurança

| Evento | Severidade |
|--------|------------|
| Tentativa de acessar dado de outro usuário | **Alta** |
| Token JWT inválido/expirado | Média |
| Limite de plano atingido | Baixa |
| Falha de pagamento recorrente | Média |
| Conta bloqueada por inadimplência | Alta |

Essas métricas alimentam o monitoramento de tentativas de violação de isolamento (queries sem `userId`, tokens expirados, etc.) — ver "Monitoramento e Logs" em `14-arquitetura.md`.

---

## 8. O que ainda não está definido

Como o projeto está em fase de especificação, os seguintes pontos de segurança **ainda não têm uma decisão documentada** e precisam ser resolvidos antes da implementação:

- [ ] Hospedagem do frontend/API (README ainda marca como "A definir" — o banco/auth/storage já ficam definidos no Supabase)
- [ ] Política de rotação de segredos (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
- [ ] Processo formal de resposta a incidentes de segurança
- [ ] Política de retenção de logs de segurança (por quanto tempo ficam armazenados)

---

## Como reportar uma vulnerabilidade

Este repositório contém apenas documentação de especificação — não há código-fonte ou ambiente em produção ainda. Se você encontrar uma inconsistência ou risco de segurança **na especificação** (por exemplo, uma regra que abre brecha de isolamento de dados), abra uma issue no repositório ou entre em contato via [FabioSilva11](https://github.com/FabioSilva11).

Quando o código-fonte existir, esta seção deve ser atualizada com um canal de contato dedicado (ex: email de segurança) e um processo de disclosure responsável.
