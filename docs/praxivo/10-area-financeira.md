# Praxivo - Área Financeira + Stripe

## Visão Geral

Página com métricas financeiras, gestão de assinaturas e integração completa com Stripe para pagamentos.

---

## Rota
`/financeiro`

---

## Layout

```
┌──────────┬───────────────────────────────────┐
│          │  Área Financeira                   │
│ Sidebar  ├───────────────────────────────────┤
│          │  [Período]                        │
│          │                                   │
│          │  Cards de Métricas                │
│          │  ┌────┐ ┌────┐ ┌────┐ ┌────┐     │
│          │  └────┘ └────┘ └────┘ └────┘     │
│          │                                   │
│          │  Tabs: Métricas | Assinatura |    │
│          │        Faturas | Métodos Pgto     │
│          │                                   │
│          │  ┌─────────────────────────────┐  │
│          │  │ Conteúdo da Aba Ativa       │  │
│          │  └─────────────────────────────┘  │
└──────────┴───────────────────────────────────┘
```

---

## Header da Página

| Elemento | Posição | Detalhes |
|----------|---------|----------|
| Título | Esquerda | "Área Financeira" (H2) |
| Status Stripe | Direita | Badge "Conectado" / "Desconectado" |
| Botão "Exportar" | Direita | Secondary com ícone download |

---

## Abas de Navegação

| Aba | Ícone | Descrição |
|-----|-------|-----------|
| Métricas | BarChart3 | Métricas de economia e impacto |
| Assinatura | CreditCard | Gestão do plano e cobrança |
| Faturas | FileText | Histórico de pagamentos |

---

## Aba 1: Métricas

### Cards de Métricas Principais

| Card | Valor | Subtexto | Cor | Ícone | Gráfico |
|------|-------|----------|-----|-------|---------|
| Economia Estimada | R$ 12.450 | +18% vs mês anterior | Verde | TrendingUp | Mini line chart |
| Valor Preservado | R$ 45.230 | Medicamentos não descartados | Azul | Shield | Mini bar chart |
| Desperdício Evitado | 89% | Taxa de aproveitamento | Verde | CheckCircle | Mini donut |
| Custo Médio/Descarte | R$ 94.41 | -12% vs mês anterior | Amarelo | DollarSign | Mini line chart |

### Gráficos

#### 1. Evolução Mensal da Economia (Area Chart)
- **Dados:** Economia mensal acumulada
- **Eixo X:** Meses (últimos 12)
- **Eixo Y:** Valor em R$

#### 2. Produtos Aproveitados vs Descartados (Stacked Bar)
- **Barras:** Verde (aproveitados) + Vermelho (descartados)

#### 3. Economia por Categoria (Horizontal Bar)
- **Dados:** Economia gerada por categoria

#### 4. Projeção de Economia (Line Chart)
- **Dados:** Projeção para próximos 6 meses

### Tabela de Análise por Medicamento

| Coluna | Descrição |
|--------|-----------|
| Medicamento | Nome |
| Categoria | Badge colorido |
| Unidades Monitoradas | Quantidade |
| Taxa de Aproveitamento | Percentual |
| Economia Gerada | Valor R$ |
| Status | Ótimo/Bom/Regular/Crítico |
| Destino Final | Uso/Doação/Descarte/Lixo |

---

## Aba 2: Assinatura

### Plano Atual

```
┌─────────────────────────────────────────────────┐
│  📦 Plano Atual                                │
│                                                 │
│  Plano Pro                                     │
│  R$ 79,90/mês                                  │
│  Limite: 250 medicamentos                     │
│                                                 │
│  Próxima cobrança: 15/08/2024                  │
│                                                 │
│  [Mudar de Plano]  [Cancelar Assinatura]        │
└─────────────────────────────────────────────────┘
```

### Planos Disponíveis

| Plano | Preço | Medicamentos | Recursos |
|-------|-------|--------------|----------|
| **Starter** | R$ 29,90/mês | Até 50 | Alertas básicos, Dashboard |
| **Pro** | R$ 79,90/mês | Até 250 | Relatórios, Histórico, API |
| **Enterprise** | R$ 199,90/mês | Ilimitado | Tudo + Suporte prioritário |

### Card de Cada Plano

```
┌─────────────────────────────────────┐
│  Plano Pro                 [Atual]  │
│                                     │
│  R$ 79,90 / mês                    │
│                                     │
│  ✓ Até 250 medicamentos           │
│  ✓ Alertas avançados               │
│  ✓ Relatórios completos            │
│  ✓ Histórico de 12 meses           │
│  ✓ Suporte por email               │
│                                     │
│  [Plano Atual] / [Escolher Plano]  │
└─────────────────────────────────────┘
```

### Ações

| Botão | Variante | Ação |
|-------|----------|------|
| Mudar de Plano | Secondary | Abre modal de seleção de novo plano |
| Cancelar Assinatura | Ghost (Danger) | Abre modal de confirmação |

---

## Aba 3: Faturas

### Tabela de Faturas

| Coluna | Descrição |
|--------|-----------|
| Data | Data de emissão |
| Descrição | "Plano Pro - Mensal" |
| Valor | R$ 79,90 |
| Status | Pago (verde) / Pendente (amarelo) / Atrasado (vermelho) |
| Método | Ícone + últimos 4 dígitos |
| Ações | Download PDF |

### Status de Fatura

| Status | Cor | Badge |
|--------|-----|-------|
| Pago | Verde | ✓ Pago |
| Pendente | Amarelo | ⏳ Pendente |
| Atrasado | Vermelho | ⚠️ Atrasado |
| Reembolsado | Cinza | ↩️ Reembolsado |

### Ações por Fatura

| Botão | Ação |
|-------|------|
| Download PDF | Baixa comprovante |
| Ver Detalhes | Abre modal com detalhes |
| Pagar (se pendente) | Redireciona para checkout |

---

---

## Integração Stripe

### Configuração

| Configuração | Valor |
|--------------|-------|
| Stripe Public Key | `pk_live_...` (configurável) |
| Stripe Secret Key | Armazenada no backend (nunca no frontend) |
| Webhook URL | `/api/webhooks/stripe` |
| Modo | Produção |

### Webhooks Configurados

| Evento | Ação |
|--------|------|
| `invoice.paid` | Atualiza status da fatura para "Pago" |
| `invoice.payment_failed` | Marca fatura como "Atrasado", envia notificação |
| `customer.subscription.created` | Cria registro de assinatura |
| `customer.subscription.updated` | Atualiza plano do usuário |
| `customer.subscription.deleted` | Cancela acesso ao plano |
| `payment_method.attached` | Salva método de pagamento |
| `payment_method.detached` | Remove método de pagamento |

### Fluxo de Checkout

```
Usuário clica "Escolher Plano"
    │
    ▼
Modal: Selecionar Plano
    │
    ▼
Redireciona para Stripe Checkout
    │
    ▼
Stripe processa pagamento
    │
    ▼
Webhook confirma pagamento
    │
    ▼
Usuário retorna ao Praxivo (plano ativo)
```

### Fluxo de Assinatura

```
Usuário está no Plano Starter
    │
    ▼
Clica "Fazer Upgrade" → Plano Pro
    │
    ▼
Stripe Checkout: cobrança proporcional
    │
    ▼
Webhook: subscription.updated
    │
    ▼
Acesso ao Plano Pro imediatamente
```

### Fluxo de Cancelamento

```
Usuário clica "Cancelar Assinatura"
    │
    ▼
Modal de confirmação
    │
    ▼
Stripe: subscription.cancel(at_period_end=true)
    │
    ▼
Acesso mantido até fim do período
    │
    ▼
Webhook: subscription.deleted
    │
    ▼
Acesso reduzido para plano gratuito/starter
```

---

## Portal do Cliente Stripe

### Acesso

| Botão | Ação |
|-------|------|
| "Gerenciar Assinatura" | Abre Stripe Customer Portal |

### Funcionalidades do Portal

| Funcionalidade | Descrição |
|----------------|-----------|
| Atualizar cartão | Usuário atualiza método de pagamento |
| Ver histórico | Faturas anteriores |
| Baixar comprovantes | Download de invoices |
| Cancelar assinatura | Com confirmação |

---

## Segurança

| Medida | Implementação |
|--------|---------------|
| Tokenização | Cartões nunca passam pelo backend |
| PCI Compliance | Via Stripe Elements |
| 3D Secure | Quando aplicável |
| Webhook Verification | Signature validation |
| Idempotency Keys | Prevenir cobranças duplicadas |

---

## Estados de Erro

| Erro | Mensagem | Ação |
|------|----------|------|
| Cartão recusado | "Pagamento não autorizado. Verifique os dados." | Mantém modal aberto |
| Webhook falhou | "Erro ao processar pagamento. Tente novamente." | Retry automático |
| Assinatura expirada | "Sua assinatura expirou. Atualize o pagamento." | Botão "Atualizar" |
| Stripe offline | "Serviço temporariamente indisponível." | Retry após 30s |

---

## Notificações Financeiras

| Evento | Canal | Mensagem |
|--------|-------|----------|
| Pagamento confirmado | Email + In-app | "Pagamento de R$ 79,90 confirmado!" |
| Pagamento falhou | Email + Push | "Houve um problema com seu pagamento" |
| Fatura pendente | In-app | "Você tem uma fatura pendente" |
| Assinatura renovada | Email | "Sua assinatura foi renovada com sucesso" |
| Cartão próximo do vencimento | In-app | "Seu cartão vence em breve" |

---

## Resumo de Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| Métricas de economia | Valor economizado com controle |
| Gestão de assinatura | Planos, upgrade, downgrade, cancelamento |
| Faturas | Histórico de pagamentos com download |
| Checkout | Stripe Checkout para novos pagamentos |
| Customer Portal | Portal gerenciamento do Stripe |
| Webhooks | Eventos de pagamento processados |
| Notificações | Alertas de pagamento e faturas |
