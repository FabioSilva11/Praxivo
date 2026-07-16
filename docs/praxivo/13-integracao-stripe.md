# Praxivo - Integração Stripe

## Visão Geral

Documentação técnica da integração com Stripe para pagamentos, assinaturas e gestão financeira. Ambiente de produção.

---

## Configuração

### Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `STRIPE_PUBLIC_KEY` | Chave pública (frontend) | `pk_live_...` |
| `STRIPE_SECRET_KEY` | Chave secreta (backend) | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Secret para verificação de webhooks | `whsec_...` |
| `STRIPE_PRICE_STARTER` | ID do preço do plano Starter | `price_...` |
| `STRIPE_PRICE_PRO` | ID do preço do plano Pro | `price_...` |
| `STRIPE_PRICE_ENTERPRISE` | ID do preço do plano Enterprise | `price_...` |

---

## Planos e Preços

### Configuração no Stripe Dashboard

| Plano | Preço | Limite Medicamentos | Intervalo | ID Price |
|-------|-------|---------------------|-----------|----------|
| Starter | R$ 29,90 | 50 medicamentos | Mensal | `price_starter_monthly` |
| Pro | R$ 79,90 | 250 medicamentos | Mensal | `price_pro_monthly` |
| Enterprise | R$ 199,90 | Ilimitado | Mensal | `price_enterprise_monthly` |

### Products no Stripe

| Product | Description | Metadata |
|---------|-------------|----------|
| Praxivo Starter | Plano básico para pessoas físicas | `plan:starter`, `medications:50` |
| Praxivo Pro | Plano profissional para empresas pequenas | `plan:pro`, `medications:250` |
| Praxivo Enterprise | Plano empresarial completo | `plan:enterprise`, `medications:unlimited` |

### Limites por Plano

| Recurso | Starter | Pro | Enterprise |
|---------|---------|-----|------------|
| Medicamentos cadastrados | 50 | 250 | Ilimitado |
| Alertas básicos | ✓ | ✓ | ✓ |
| Dashboard | Básica | Completa | Completa |
| Relatórios | Básicos | Completos | Completos + Custom |
| Histórico | 30 dias | 12 meses | Ilimitado |
| Suporte | Email | Email + Chat | Prioritário |
| API | ✗ | ✓ | ✓ |
| Exportação | PDF | PDF + CSV | PDF + CSV + Excel |

---

## Endpoints (Backend)

### Criar Sessão de Checkout

```
POST /api/stripe/checkout
```

**Body:**
```json
{
  "priceId": "price_pro_monthly",
  "userId": "usr_123"
}
```

**Response:**
```json
{
  "sessionId": "cs_live_...",
  "url": "https://checkout.stripe.com/..."
}
```

**Lógica:**
1. Verificar se já tem assinatura ativa
2. Verificar se já tem Customer no Stripe
3. Criar Customer se não existir
4. Criar Checkout Session com `mode: "subscription"`
5. Retornar URL do checkout

### Criar Sessão do Customer Portal

```
POST /api/stripe/portal
```

**Body:**
```json
{
  "userId": "usr_123"
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

### Obter Status da Assinatura

```
GET /api/stripe/subscription/:userId
```

**Response:**
```json
{
  "status": "active",
  "plan": "pro",
  "medicationLimit": 250,
  "currentPeriodEnd": "2024-08-15T00:00:00Z",
  "cancelAtPeriodEnd": false,
  "paymentMethod": {
    "brand": "visa",
    "last4": "4242"
  }
}
```

### Listar Faturas

```
GET /api/stripe/invoices/:userId
```

**Response:**
```json
{
  "invoices": [
    {
      "id": "in_...",
      "date": "2024-07-15",
      "amount": 7990,
      "currency": "brl",
      "status": "paid",
      "invoiceUrl": "https://invoice.stripe.com/...",
      "pdfUrl": "https://invoice.stripe.com/..."
    }
  ]
}
```

### Adicionar Método de Pagamento

```
POST /api/stripe/payment-method
```

**Body:**
```json
{
  "userId": "usr_123",
  "paymentMethodId": "pm_..."
}
```

### Definir Método Padrão

```
PUT /api/stripe/payment-method/default
```

**Body:**
```json
{
  "userId": "usr_123",
  "paymentMethodId": "pm_..."
}
```

### Remover Método de Pagamento

```
DELETE /api/stripe/payment-method/:paymentMethodId
```

### Trocar de Plano

```
POST /api/stripe/subscription/change-plan
```

**Body:**
```json
{
  "userId": "usr_123",
  "newPriceId": "price_pro_monthly",
  "proration": "always_invoice"
}
```

**Lógica:**
1. Buscar assinatura atual
2. Verificar se novo plano tem menos medicamentos que o atual
3. Se sim, bloquear downgrade se houver mais medicamentos que o limite
4. Calcular prorrateamento
5. Criar invoice com valor proporcional
6. Atualizar assinatura para novo preço
7. Atualizar limite de medicamentos no banco

### Cancelar Assinatura

```
POST /api/stripe/subscription/cancel
```

**Body:**
```json
{
  "userId": "usr_123",
  "atPeriodEnd": true
}
```

**Lógica:**
1. `atPeriodEnd: true` → mantém acesso até fim do período
2. `atPeriodEnd: false` → cancela imediatamente (reembolso proporcional)

---

## Webhooks

### Endpoint

```
POST /api/webhooks/stripe
```

### Eventos Processados

| Evento | Ação |
|--------|------|
| `checkout.session.completed` | Ativar assinatura |
| `invoice.paid` | Atualizar status da fatura para "Pago" |
| `invoice.payment_failed` | Marcar fatura como "Atrasado", restringir acesso |
| `customer.subscription.created` | Criar registro no banco |
| `customer.subscription.updated` | Atualizar plano/acesso |
| `customer.subscription.deleted` | Restringir acesso ao plano mínimo |
| `payment_method.attached` | Salvar método de pagamento |
| `payment_method.detached` | Remover método de pagamento |

### Verificação de Assinatura

```typescript
const event = stripe.webhooks.constructEvent(
  req.body,
  req.headers['stripe-signature'],
  STRIPE_WEBHOOK_SECRET
);
```

### Tratamento de Erros

| Cenário | Ação |
|---------|------|
| Assinatura inválida | Retornar 400 |
| Evento duplicado | Ignorar (idempotência) |
| Erro de processamento | Retornar 500, retry automático |

---

## Fluxos de Usuário

### 1. Novo Usuário - Primeira Assinatura

```
1. Usuário cria conta (plano Starter)
2. Acessa "/financeiro" → Aba "Assinatura"
3. Clica "Escolher Plano" → Plano Pro
4. Modal: resumo do plano + preço
5. Redireciona para Stripe Checkout
6. Preenche dados de pagamento
7. Stripe processa pagamento
8. Webhook: checkout.session.completed
9. Usuário retorna ao Praxivo
10. Plano Pro ativado (limite: 250 medicamentos)
```

### 2. Upgrade de Plano

```
1. Usuário no Plano Starter (limite: 50)
2. Clica "Fazer Upgrade" → Plano Pro
3. Modal: confirma upgrade + prorrateamento
4. Redireciona para Stripe Checkout
5. Stripe cobra diferença proporcional
6. Webhook: subscription.updated
7. Acesso ao Plano Pro imediatamente (limite: 250)
```

### 3. Downgrade de Plano

```
1. Conta no Plano Pro (limite: 250)
2. Clica "Fazer Downgrade" → Plano Starter
3. Sistema verifica: tem mais de 50 medicamentos?
4. Se SIM: bloqueia downgrade, exibe aviso
5. Se NÃO: modal de confirmação
6. Acesso mantido até fim do período
7. Webhook: subscription.updated (no fim do período)
8. Acesso reduzido para Plano Starter (limite: 50)
```

### 4. Cancelamento

```
1. Clica "Cancelar Assinatura"
2. Sistema verifica: pode cancelar?
3. Modal: motivo do cancelamento (opcional)
4. Confirma cancelamento
5. Stripe: cancel at period end
6. Acesso mantido até fim do período
7. Webhook: subscription.deleted
8. Acesso reduzido para plano mais básico
```

### 5. Falha de Pagamento

```
1. Cartão recusado na cobrança recorrente
2. Stripe envia evento: invoice.payment_failed
3. Webhook processa:
   - Marca fatura como "Atrasado"
   - Envia notificação push + email de alerta
   - Restringe acesso (ver seção "Restrições")
4. Usuário vê banner de erro no dashboard
5. Botão "Atualizar Pagamento" → Customer Portal
6. Após 3 tentativas sem sucesso:
   - Acesso dramaticamente reduzido
   - Apenas visualização permitida
```

---

## Restrições por Status de Pagamento

### Status de Assinatura

| Status | Descrição | Acesso |
|--------|-----------|--------|
| `active` | Pagamento em dia | Total |
| `past_due` | Pagamento atrasado (1-7 dias) | Parcial |
| `unpaid` | Não pago (após 7 dias) | Mínimo |
| `canceled` | Cancelado | Mínimo |

### Restrições por Status

#### `active` - Pagamento em Dia
| Funcionalidade | Acesso |
|----------------|--------|
| Dashboard | ✓ Completa |
| Medicamentos | ✓ CRUD completo |
| Alertas | ✓ Completo |
| Relatórios | ✓ Completo |
| Histórico | ✓ Completo |
| Configurações | ✓ Completo |
| Notificações | ✓ Completo |

#### `past_due` - Pagamento Atrasado (1-7 dias)

| Funcionalidade | Acesso |
|----------------|--------|
| Dashboard | ✓ Visualização apenas |
| Medicamentos | ⚠️ Visualizar apenas (sem criar/editar/excluir) |
| Alertas | ✓ Visualização apenas |
| Relatórios | ⚠️ Básicos apenas |
| Histórico | ✓ Visualização apenas |
| Configurações | ⚠️ Perfil apenas |
| Notificações | ✓ |

**Aviso exibido:**
> ⚠️ Seu pagamento está pendente. Atualize seu método de pagamento para continuar usando o sistema.

#### `unpaid` - Não Pago (após 7 dias)

| Funcionalidade | Acesso |
|----------------|--------|
| Dashboard | ❌ Bloqueado |
| Medicamentos | ❌ Bloqueado |
| Alertas | ❌ Bloqueado |
| Relatórios | ❌ Bloqueado |
| Histórico | ⚠️ Visualização apenas (últimos 7 dias) |
| Configurações | ⚠️ Apenas "Métodos de Pagamento" |
| Notificações | ⚠️ Apenas sobre pagamento |

**Aviso exibido:**
> 🔴 Sua assinatura está inativa. Para acessar o sistema, atualize seu pagamento.

**Tela de bloqueio:**
```
┌─────────────────────────────────────────────────┐
│                                                 │
│           🔴 Assinatura Inativa                 │
│                                                 │
│     Para continuar usando o Praxivo,           │
│     atualize seu método de pagamento.           │
│                                                 │
│     [Atualizar Pagamento]                       │
│                                                 │
│     Precisa de ajuda? Entre em contato          │
│     com nosso suporte.                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### `canceled` - Cancelado

| Funcionalidade | Acesso |
|----------------|--------|
| Dashboard | ❌ Bloqueado |
| Medicamentos | ❌ Bloqueado |
| Alertas | ❌ Bloqueado |
| Relatórios | ❌ Bloqueado |
| Histórico | ⚠️ Visualização apenas (últimos 30 dias) |
| Configurações | ⚠️ Apenas "Métodos de Pagamento" + "Reativar" |
| Notificações | ⚠️ Apenas sobre reativação |

**Aviso exibido:**
> Sua assinatura foi cancelada. Para acessar o sistema novamente, escolha um plano.

---

## Limites de Medicamentos

### Verificação de Limite

**Antes de cadastrar medicamento:**
1. Buscar plano atual da conta
2. Contar medicamentos ativos (não descartados/excluídos)
3. Comparar com limite do plano
4. Se atingiu limite: bloquear cadastro

**Mensagem de limite atingido:**
> Você atingiu o limite de [50/250] medicamentos do seu plano [Starter/Pro]. Faça upgrade para cadastrar mais.

**Botões:**
| Botão | Variante | Ação |
|-------|----------|------|
| Fazer Upgrade | Primary | Abre modal de seleção de plano |
| Ver Planos | Secondary | Navega para página de planos |

### Verificação em Lote

**Ao importar medicamentos:**
1. Verificar quantos medicamentos serão importados
2. Verificar quantos já existem
3. Se total > limite: bloquear importação
4. Mostrar: "Você pode importar apenas X medicamentos. Faça upgrade para importar mais."

### Downgrade com Mais Medicamentos

**Ao fazer downgrade:**
1. Sistema verifica: tem mais medicamentos que o novo limite?
2. Se SIM: bloquear downgrade
3. Mensagem: "Você tem [X] medicamentos, mas o plano [novo] permite apenas [Y]. Exclua ou descarte medicamentos antes de fazer downgrade."

---

## Segurança

| Medida | Implementação |
|--------|---------------|
| Tokenização | Cartões processados pelo Stripe, nunca pelo backend |
| PCI DSS | Compliance via Stripe Elements |
| 3D Secure | Ativado automaticamente quando necessário |
| Webhook Verification | Signature validation com `stripe-signature` |
| Idempotency Keys | Prevenir cobranças duplicadas |
| HTTPS | Obrigatório para todos os endpoints |
| Rate Limiting | Proteção contra abuso |
| Multi-tenancy | Dados isolados por usuário |

---

## Monitoramento

### Métricas

| Métrica | Descrição |
|---------|-----------|
| Taxa de conversão | % de checkouts completados |
| Churn rate | % de cancelamentos por mês |
| MRR | Monthly Recurring Revenue |
| ARR | Annual Recurring Revenue |
| Ticket médio | Receita média por cliente |
| LTV | Lifetime Value do cliente |
| Inadimplência | % de pagamentos falhos |

### Logs

| Evento | Log |
|--------|-----|
| Checkout iniciado | `checkout_started`, `userId`, `priceId` |
| Checkout completado | `checkout_completed`, `userId`, `amount` |
| Pagamento falhou | `payment_failed`, `userId`, `reason` |
| Assinatura cancelada | `subscription_cancelled`, `userId`, `reason` |
| Limite atingido | `limit_reached`, `userId`, `plan`, `currentCount` |
| Downgrade bloqueado | `downgrade_blocked`, `userId`, `currentCount`, `newLimit` |
