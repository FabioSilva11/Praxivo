# Praxivo - Arquitetura do Sistema

## Visão Geral

Documentação da arquitetura técnica do Praxivo, incluindo multi-tenancy, isolamento de dados, limites de planos e tratamento de falhas de pagamento. O backend é construído sobre **Supabase** (Postgres, Auth, Storage e Realtime).

---

## Princípios Arquiteturais

| Princípio | Descrição |
|-----------|-----------|
| **Multi-tenancy** | Cada usuário vê apenas seus próprios dados |
| **Isolamento** | Dados completamente separados entre contas |
| **Segurança** | Nunca expor dados de um usuário para outro |
| **Escalabilidade** | Arquitetura preparada para crescimento |
| **Confiabilidade** | Sistema disponível mesmo com falhas parciais |

---

## Modelo de Multi-Tenancy

### Estrutura de Dados

```
┌─────────────────────────────────────────────────┐
│                  USUÁRIO                        │
│  id: usr_123                                   │
│  email: joao@email.com                         │
│  plan: pro                                     │
│  medicationLimit: 250                          │
│  subscriptionStatus: active                    │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │           MEDICAMENTOS                  │   │
│  │  id: med_001                            │   │
│  │  userId: usr_123  ← referência ao dono  │   │
│  │  nome: Paracetamol                      │   │
│  │  ...                                    │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │           HISTÓRICO                     │   │
│  │  id: hist_001                           │   │
│  │  userId: usr_123  ← referência ao dono  │   │
│  │  ...                                    │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │           NOTIFICAÇÕES                  │   │
│  │  id: notif_001                          │   │
│  │  userId: usr_123  ← referência ao dono  │   │
│  │  ...                                    │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Regra Fundamental

**TODA query ao banco DEVE filtrar por `userId`:**

```sql
-- CORRETO: sempre filtra por userId
SELECT * FROM medications WHERE user_id = 'usr_123';

-- INCORRETO: retorna todos os medicamentos
SELECT * FROM medications;
```

### Interceptor de Dados

> Com Supabase, o **RLS já impede** que uma query retorne dados de outro usuário mesmo que o `userId` não seja passado explicitamente — é a defesa primária. O middleware abaixo é uma camada **adicional** de defesa em profundidade (fail-safe caso alguma query use a `service_role` key, que ignora RLS).

Todas as rotas da API passam por um middleware que:

1. Extrai `userId` do token JWT (emitido pelo Supabase Auth)
2. Injeta `userId` em todas as queries
3. Valida que o usuário está autenticado
4. Verifica se o usuário tem acesso ao recurso

```typescript
// Middleware de isolamento (camada extra além do RLS)
app.use('/api/*', (req, res, next) => {
  const userId = req.user.id;
  
  // Injeta userId em todas as queries
  req.dbQuery = req.dbQuery.where('user_id', userId);
  
  next();
});
```

---

## Isolamento por Recurso

### Medicamentos

| Operação | Validação |
|----------|-----------|
| Criar | Verificar limite do plano |
| Ler | `WHERE user_id = ?` |
| Atualizar | `WHERE user_id = ? AND id = ?` |
| Excluir | `WHERE user_id = ? AND id = ?` |
| Transferir | Verificar que destino pertence ao usuário |

### Alertas

| Operação | Validação |
|----------|-----------|
| Listar | `WHERE user_id = ?` |
| Marcar lido | `WHERE user_id = ? AND id = ?` |
| Excluir | `WHERE user_id = ? AND id = ?` |

### Relatórios

| Operação | Validação |
|----------|-----------|
| Gerar | `WHERE user_id = ?` em todas as tabelas |
| Exportar | Verificar que dados pertencem ao usuário |

### Histórico

| Operação | Validação |
|----------|-----------|
| Listar | `WHERE user_id = ?` |
| Criar registro | Incluir `user_id` automaticamente |

### Configurações

| Operação | Validação |
|----------|-----------|
| Ler perfil | `WHERE id = ?` (próprio usuário) |
| Atualizar perfil | `WHERE id = ?` (próprio usuário) |
| Excluir conta | Verificar propriedade |

---

## Estrutura de Planos

### Definição dos Planos

| Campo | Starter | Pro | Enterprise |
|-------|---------|-----|------------|
| Preço | R$ 29,90/mês | R$ 79,90/mês | R$ 199,90/mês |
| Limite Medicamentos | 50 | 250 | Ilimitado |

> **Nota:** Todas as funcionalidades estão disponíveis em todos os planos. A única diferença é o limite de medicamentos cadastrados.

### Verificação de Limite

```typescript
async function checkMedicationLimit(userId: string): Promise<boolean> {
  const user = await getUser(userId);
  const plan = await getPlan(user.plan);
  
  if (plan.medicationLimit === -1) {
    return true; // Ilimitado
  }
  
  const currentCount = await countMedications(userId);
  return currentCount < plan.medicationLimit;
}
```

### Bloqueio de Cadastro

Quando atinge o limite:

```typescript
async function createMedication(userId: string, data: MedicationData) {
  const canCreate = await checkMedicationLimit(userId);
  
  if (!canCreate) {
    throw new LimitReachedError({
      message: 'Limite de medicamentos atingido',
      currentPlan: user.plan,
      limit: plan.medicationLimit,
      currentCount: await countMedications(userId)
    });
  }
  
  return await db.medications.create({
    ...data,
    user_id: userId
  });
}
```

---

## Tratamento de Falha de Pagamento

### Fluxo Completo

```
Cobrança recorrente enviada
    │
    ▼
Stripe tenta cobrar
    │
    ├──→ Sucesso → Webhook: invoice.paid
    │                Status: active
    │                Acesso: total
    │
    └──→ Falha → Webhook: invoice.payment_failed
                 │
                 ▼
         Sistema processa:
         │
         ├── 1ª tentativa falhou
         │   Status: past_due
         │   Acesso: parcial (visualização)
         │   Notificação: email + push
         │
         ├── 2ª tentativa falhou (após 3 dias)
         │   Status: past_due
         │   Acesso: parcial (visualização)
         │   Notificação: email urgente
         │
         ├── 3ª tentativa falhou (após 7 dias)
         │   Status: unpaid
         │   Acesso: mínimo (bloqueado)
         │   Notificação: email + alerta no sistema
         │
         └── Após 14 dias sem pagamento
             Status: unpaid
             Acesso: bloqueado
             Ação: envia lembrete final
```

### Restrições Detalhadas

#### Status `active` (Pagamento em Dia)

| Acesso | Descrição |
|--------|-----------|
| Dashboard | Completa |
| Medicamentos | CRUD completo |
| Alertas | Completo |
| Relatórios | Completo |
| Histórico | Completo |
| Configurações | Completo |
| Notificações | Completo |

#### Status `past_due` (1-7 dias de atraso)

| Acesso | Restrição |
|--------|-----------|
| Dashboard | Visualização apenas |
| Medicamentos | Apenas visualizar (sem criar/editar/excluir) |
| Alertas | Visualização apenas |
| Relatórios | Básicos apenas |
| Histórico | Visualização apenas |
| Configurações | Apenas perfil e método de pagamento |
| Notificações | Completo |

**Banner exibido:**
> ⚠️ Seu pagamento está pendente. Atualize seu método de pagamento para continuar usando o sistema.
> [Atualizar Pagamento]

#### Status `unpaid` (após 7 dias)

| Acesso | Restrição |
|--------|-----------|
| Dashboard | ❌ Bloqueado |
| Medicamentos | ❌ Bloqueado |
| Alertas | ❌ Bloqueado |
| Relatórios | ❌ Bloqueado |
| Histórico | Apenas últimos 7 dias |
| Configurações | Apenas método de pagamento |
| Notificações | Apenas sobre pagamento |

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

#### Status `canceled` (cancelado pelo usuário)

| Acesso | Restrição |
|--------|-----------|
| Dashboard | ❌ Bloqueado |
| Medicamentos | ❌ Bloqueado |
| Alertas | ❌ Bloqueado |
| Relatórios | ❌ Bloqueado |
| Histórico | Apenas últimos 30 dias |
| Configurações | Apenas método de pagamento + reativar |
| Notificações | Apenas sobre reativação |

**Mensagem:**
> Sua assinatura foi cancelada. Para acessar o sistema novamente, escolha um plano.
> [Escolher Plano]

---

## Proteção de Dados

### Dados NUNCA Deletados

Quando pagamento falha ou assinatura é cancelada:

| Dado | Ação |
|------|------|
| Medicamentos | Mantidos no banco (não visíveis) |
| Histórico | Mantido (não visível) |
| Configurações | Mantidas (não visíveis) |
| Alertas | Mantidos (não visíveis) |
| Faturas | Mantidas (visíveis para pagamento) |

**Razão:** Quando usuário reativa pagamento, seus dados retornam automaticamente.

### Reactivação

Quando pagamento é confirmado após falha:

```typescript
async function reactivateAccess(userId: string) {
  // 1. Atualizar status da assinatura
  await updateUser(userId, { subscriptionStatus: 'active' });
  
  // 2. Dados já estão no banco, apenas tornar visíveis
  // Não há necessidade de restaurar nada
  
  // 3. Reativar alertas
  await reactivateAlerts(userId);
  
  // 4. Enviar notificação de reativação
  await sendNotification(userId, {
    type: 'account_reactivated',
    message: 'Sua conta foi reativada com sucesso!'
  });
}
```

---

## Segurança de Dados

### Validação em Todas as Camadas

```
Frontend
    │
    ├── Validação de UI (formulários)
    │
    ▼
API Gateway
    │
    ├── Validação de autenticação (JWT emitido pelo Supabase Auth)
    ├── Validação de autorização (permissões)
    │
    ▼
Service Layer
    │
    ├── Validação de negócio (limites, regras)
    ├── Injeção automática de userId
    │
    ▼
Database
    │
    ├── Foreign keys com userId
    ├── Índices em userId
    ├── Row Level Security (RLS) ← defesa primária, aplicada pelo Postgres/Supabase
    │
    ▼
Resposta
    │
    ├── Filtragem de dados sensíveis
    └── Validação de que dados pertencem ao usuário
```

### Row Level Security (RLS)

O RLS é aplicado no Postgres do **Supabase**, usando `auth.uid()` — a função nativa que retorna o ID do usuário autenticado a partir do JWT da requisição. Isso faz do RLS a **linha de defesa primária** contra vazamento de dados entre contas, não apenas uma camada extra.

```sql
-- Habilitar RLS em todas as tabelas com dado de usuário
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura, criação, atualização e exclusão
CREATE POLICY user_isolation_select ON medications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY user_isolation_insert ON medications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY user_isolation_update ON medications
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY user_isolation_delete ON medications
  FOR DELETE USING (user_id = auth.uid());

-- Mesma política replicada para alerts, history e notifications
```

> As mesmas quatro políticas (SELECT/INSERT/UPDATE/DELETE) devem ser criadas para `alerts`, `history` e `notifications` — omitidas acima só por brevidade.

### Validação de Propriedade

```typescript
async function validateOwnership(userId: string, resourceType: string, resourceId: string) {
  const resource = await db[resourceType].findFirst({
    where: {
      id: resourceId,
      user_id: userId
    }
  });
  
  if (!resource) {
    throw new NotFoundError('Recurso não encontrado');
  }
  
  return resource;
}
```

---

## Estrutura de Pastas (Sugerida)

```
src/
├── app/                    # Rotas (App Router)
│   ├── (auth)/            # Rotas de autenticação
│   ├── (dashboard)/       # Rotas do dashboard
│   │   ├── medicamentos/
│   │   ├── alertas/
│   │   ├── relatorios/
│   │   ├── historico/
│   │   ├── financeiro/
│   │   ├── configuracoes/
│   │   └── notificacoes/
│   └── api/               # API routes
│       ├── medications/
│       ├── alerts/
│       ├── reports/
│       ├── stripe/
│       └── webhooks/
├── components/            # Componentes React
│   ├── ui/               # Componentes base (Button, Input, etc.)
│   ├── dashboard/        # Componentes do dashboard
│   ├── medications/      # Componentes de medicamentos
│   └── layout/           # Sidebar, Header, etc.
├── lib/                   # Utilitários
│   ├── supabase/
│   │   ├── client.ts     # Cliente Supabase (browser)
│   │   ├── server.ts     # Cliente Supabase (server components/route handlers)
│   │   └── middleware.ts # Refresh de sessão do Supabase Auth
│   └── stripe.ts         # Configuração Stripe
├── hooks/                 # Custom hooks
│   └── useRealtimeSubscription.ts  # Hook para subscriptions do Supabase Realtime
├── types/                 # TypeScript types
│   └── database.types.ts # Tipos gerados a partir do schema do Supabase
└── middleware/            # Middleware de aplicação (camada extra além do RLS)
    ├── isolation.ts      # Validação adicional de isolamento
    └── rateLimit.ts      # Rate limiting
```

---

## Fluxo de Requisição

```
1. Usuário faz ação no frontend
    │
    ▼
2. Frontend envia requisição com JWT
    │
    ▼
3. Middleware valida JWT
    │
    ├── Token inválido → 401 Unauthorized
    │
    ▼
4. Middleware extrai userId
    │
    ▼
5. Middleware verifica assinatura ativa
    │
    ├── Assinatura inativa → 403 Forbidden (com status de bloqueio)
    │
    ▼
6. Middleware verifica limite de plano
    │
    ├── Limite atingido → 403 Forbidden (com mensagem de upgrade)
    │
    ▼
7. Service processa com userId
    │
    ├── Query: WHERE user_id = ?
    │
    ▼
8. Retorna apenas dados do usuário
    │
    ▼
9. Frontend exibe dados
```

---

## Monitoramento e Logs

### Logs de Segurança

| Evento | Severidade | Descrição |
|--------|------------|-----------|
| Acesso negado | HIGH | Tentativa de acessar dado de outro usuário |
| Token inválido | MEDIUM | Tentativa de autenticação com token inválido |
| Limite atingido | LOW | Conta tentou exceder limite do plano |
| Pagamento falhou | MEDIUM | Cobrança recorrente falhou |
| Conta bloqueada | HIGH | Acesso bloqueado por inadimplência |

### Métricas de Isolamento

| Métrica | Descrição |
|---------|-----------|
| Tentativas de acesso indevido | Queries sem filtro userId (bloqueadas) |
| Tokens expirados | Autenticação com token expirado |
| Limites atingidos | Contas que atingiram limite do plano |
| Pagamentos pendentes | Assinaturas com pagamento atrasado |

---

## Backup e Recuperação

### Estratégia de Backup

| Tipo | Frequência | Retenção |
|------|------------|----------|
| Full | Diário | 30 dias |
| Incremental | A cada 6 horas | 7 dias |
| Transacional | Contínuo | 7 dias |

### Recuperação

| Cenário | Tempo de Recuperação |
|---------|---------------------|
| Dados corrompidos | < 1 hora |
| Falha de servidor | < 15 minutos |
| Desastre completo | < 4 horas |

---

## Resumo dos Conceitos

| Conceito | Implementação |
|----------|---------------|
| Backend-as-a-Service | Supabase (Postgres + Auth + Storage + Realtime) |
| Multi-tenancy | RLS no Postgres (`auth.uid()`) + filtro por userId nas queries |
| Isolamento | RLS (defesa primária) + middleware (defesa extra) + validação de propriedade |
| Limites de plano | Verificação antes de cada operação |
| Falha de pagamento | Restrição progressiva (não exclusão) |
| Reactivação | Dados mantidos, acesso restaurado |
| Segurança | Supabase Auth (JWT) + RLS + validação em todas as camadas |
