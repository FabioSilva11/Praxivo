# Praxivo - Notificações

## Visão Geral

Central de notificações do sistema, acessível de qualquer página.

---

## Acesso

### Localizações
1. **Ícone de sino no header** → Abre dropdown (acesso rápido)
2. **Link "Ver todas as notificações" no dropdown** → Navega para `/notificacoes`

> ⚠️ **Nota:** A página `/notificacoes` não possui item próprio na sidebar. O acesso é feito exclusivamente pelo sino no header.

---

## 1. Dropdown de Notificações (Header)

### Elementos

```
┌─────────────────────────────────────┐
│ Notificações            [Marcar lidas] │
├─────────────────────────────────────┤
│ 🔴 Paracetamol vence hoje!          │
│    Há 5 minutos                     │
├─────────────────────────────────────┤
│ 🟡 Amoxicilina vence em 7 dias      │
│    Há 1 hora                        │
├─────────────────────────────────────┤
│ 🔵 Relatório semanal disponível     │
│    Há 3 horas                       │
├─────────────────────────────────────┤
│ [Ver todas as notificações]         │
└─────────────────────────────────────┘
```

### Comportamento
- **Badge no sino:** Número de não lidas (max "9+")
- **Click no sino:** Abre dropdown
- **Click fora:** Fecha dropdown
- **Máximo visível:** 5 notificações
- **Link inferior:** "Ver todas as notificações" → `/notificacoes`

### Estilo do Dropdown
- Largura: 380px
- Altura máxima: 400px (scroll)
- Fundo: Branco (light) / Cinza 800 (dark)
- Shadow:-xl
- Border-radius: 12px
- Animação: scale-in

### Cada Notificação no Dropdown

| Elemento | Detalhes |
|----------|----------|
| Ícone | Cor baseada no tipo |
| Título | Negrito se não lida |
| Timestamp | Relativo ("há 5 minutos") |
| Indicador | Ponto azul se não lida |

### Ações

| Ação | Comportamento |
|------|---------------|
| Click | Marca como lida + navega para detalhe |
| Hover | Fundo muda levemente |
| Botão X | Dispensa notificação |

---

## 2. Página de Notificações

### Rota
`/notificacoes`

### Layout

```
┌──────────┬───────────────────────────────────┐
│          │  Notificações                      │
│ Sidebar  ├───────────────────────────────────┤
│          │  [Filtros] [Marcar todas lidas]   │
│          │                                   │
│          │  Tabs: Todas | Não Lidas | Lidas  │
│          │                                   │
│          │  ┌─────────────────────────────┐  │
│          │  │ Lista de Notificações       │  │
│          │  │                             │  │
│          │  └─────────────────────────────┘  │
│          │                                   │
│          │  [Paginação]                      │
└──────────┴───────────────────────────────────┘
```

### Header

| Elemento | Posição | Detalhes |
|----------|---------|----------|
| Título | Esquerda | "Notificações" (H2) |
| Contador | Direita | "X não lidas" |
| Botão "Marcar todas como lidas" | Direita | Secondary |

### Tabs

| Tab | Descrição |
|-----|-----------|
| Todas | Lista completa |
| Não Lidas | Apenas não lidas |
| Lidas | Apenas lidas |

### Filtros Adicionais

| Filtro | Opções |
|--------|--------|
| Tipo | Medicamento vencendo, Vencido, Alteração, Doação, Transferência, Descarte, Lixo, Sistema |
| Período | Hoje, 7 dias, 30 dias, Todos |

---

## Tipos de Notificação

### 1. Medicamento Vencendo

| Prioridade | Critério | Cor |
|------------|----------|-----|
| Crítico | Vencido ou vence hoje | Vermelho |
| Alta | Vence em 1-3 dias | Vermelho claro |
| Média | Vence em 4-7 dias | Laranja |
| Baixa | Vence em 8-30 dias | Amarelo |

**Título exemplo:**
- "⚠️ Paracetamol 500mg vence em 3 dias"
- "⚠️ Amoxicilina 250mg vence amanhã!"

**Descrição exemplo:**
- "O medicamento Paracetamol 500mg (Lote: PAR-2026-001) vence em 03/08/2026. Localização: Farmácia Principal."

**Ações:**
| Botão | Ação |
|-------|------|
| Ver Detalhes | Navega para o medicamento |
| Doar | Abre modal de doação (apenas se válido) |
| Antecipar Uso | Abre modal de uso prioritário |
| Transferir | Abre modal de transferência |
| Descartar | Abre modal de descarte |

### 2. Medicamento Vencido

**Título:** "🔴 Amoxicilina 500mg está vencido!"

**Descrição:** "O medicamento Amoxicilina 500mg (Lote: AMX-2026-003) venceu em 15/07/2026. Tomar providências."

**⚠️ Regra:** Medicamentos vencidos NÃO podem ser doados. Apenas opções de descarte estão disponíveis.

**Ações:**
| Botão | Ação |
|-------|------|
| Ver Detalhes | Navega para o medicamento |
| Descartar | Abre modal de descarte |
| Marcar como Lixo | Abre modal de descarte inadequado |

### 3. Alterações

**Título:** "📋 Medicamento atualizado"

**Descrição:** "Paracetamol 500mg foi editado. Quantidade alterada de 10 para 25."

**Ações:**
| Botão | Ação |
|-------|------|
| Ver Alteração | Navega para histórico |

### 4. Doação

**Título:** "💚 Medicamento marcado para doação"

**Descrição:** "Paracetamol 500mg foi marcado para doação para a instituição Hospital São Lucas."

**Ações:**
| Botão | Ação |
|-------|------|
| Ver Detalhes | Navega para o medicamento |
| Confirmar Doação | Marca como doado |

### 5. Transferência

**Título:** "🔄 Medicamento transferido"

**Descrição:** "Ibuprofeno 600mg foi transferido de Farmácia para Almoxarifado."

**Ações:**
| Botão | Ação |
|-------|------|
| Ver Detalhes | Navega para o medicamento |

### 6. Descarte

**Título:** "🗑️ Medicamento descartado"

**Descrição:** "Amoxicilina 500mg foi descartado adequadamente. Motivo: vencido."

**Ações:**
| Botão | Ação |
|-------|------|
| Ver Registro | Navega para histórico |

### 7. Lixo

**Título:** "⚠️ Medicamento descartado no lixo"

**Descrição:** "Dipirona 500mg foi marcada como descartada no lixo. Isso pode indicar descarte inadequado."

**Ações:**
| Botão | Ação |
|-------|------|
| Ver Detalhes | Navega para o medicamento |
| Reverter | Volta para status anterior |

### 8. Sistema

**Título:** "🔧 Atualização do sistema"

**Descrição:** "O Praxivo foi atualizado para a versão 2.1.0. Veja as novidades."

**Ações:**
| Botão | Ação |
|-------|------|
| Ver Novidades | Abre changelog |

---

## Card de Notificação (Página Completa)

### Estrutura

```
┌─────────────────────────────────────────────────┐
│ [Ícone]  Título da Notificação      [●] [🗑️]   │
│          Descrição detalhada da notificação.    │
│          Aqui pode ter mais texto se necessário. │
│                                                 │
│          📅 15/07/2026 às 14:30                 │
│                                                 │
│          [Ver Detalhes]  [Descartar]            │
└─────────────────────────────────────────────────┘
```

### Elementos

| Elemento | Detalhes |
|----------|----------|
| Ícone | Tipo da notificação |
| Título | H4, negrito se não lida |
| Descrição | Body, Cinza 500 |
| Timestamp | Small, Cinza 400 |
| Indicador | Ponto azul se não lida |
| Botões de ação | Contextuais |

### Estados

| Estado | Estilo |
|--------|--------|
| Não lida | Fundo levemente azulado, título negrito, ponto azul |
| Lida | Fundo normal, título regular |
| Hover | Fundo muda levemente |
| Expandido | Mostra descrição completa e ações |

---

## Comportamentos

### Marcar como Lida
- **Individual:** Click na notificação
- **Em lote:** Selecionar + botão "Marcar como lidas"
- **Todas:** Botão "Marcar todas como lidas"

### Deletar
- **Individual:** Botão de lixeira → confirmação
- **Em lote:** Selecionar + botão "Excluir selecionadas"
- **Todas:** Botão "Limpar todas" → confirmação

### Paginação
- **Infinite scroll** ou **botão "Carregar mais"**
- **Itens por página:** 20

### Não Lidas
- Badge no header atualiza em tempo real
- Toast sutil quando nova notificação chega
- Sound notification (opcional, configurável)

---

## Empty State

### Todas as notificações lidas
- Ícone de sino com check
- Título: "Tudo atualizado!"
- Descrição: "Não há notificações não lidas no momento."

### Nenhuma notificação
- Ícone de sino silenciado
- Título: "Nenhuma notificação"
- Descrição: "Quando houver alertas ou atualizações, elas aparecerão aqui."

---

## Resumo de Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| Dropdown | Acesso rápido pelo header |
| Página dedicada | Visualização completa |
| Filtros | Por tipo, período, status |
| Marcar como lida | Individual, em lote, todas |
| Deletar | Individual, em lote |
| Tipos | Vencendo, vencido, alteração, sistema |
| Paginação | Infinite scroll ou botão |
| Badge | Contador em tempo real |
