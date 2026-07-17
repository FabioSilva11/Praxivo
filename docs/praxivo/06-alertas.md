# Praxivo - Alertas

## Visão Geral

Página exclusiva para visualizar e gerenciar medicamentos com base no status de validade.

---

## Rota
`/alertas`

---

## Layout

```
┌──────────┬───────────────────────────────────┐
│          │  Alertas                           │
│ Sidebar  ├───────────────────────────────────┤
│          │  [Filtros] [Ordenar]              │
│          │                                   │
│          │  Tabs: Todos | Vencidos | 30 dias │
│          │              | 15 dias | 7 dias    │
│          │                                   │
│          │  ┌─────────────────────────────┐  │
│          │  │ Lista de Alertas            │  │
│          │  │                             │  │
│          │  └─────────────────────────────┘  │
│          │                                   │
└──────────┴───────────────────────────────────┘
```

---

## Header da Página

| Elemento | Posição | Detalhes |
|----------|---------|----------|
| Título | Esquerda | "Alertas" (H2) |
| Contador | Direita | Badge com total de alertas ativos |
| Botão "Gerenciar" | Direita | Secondary - ações em lote |

---

## Tabs de Filtro

As tabs usam o **mesmo critério de Prioridade** definido na seção "Prioridade dos Alertas" abaixo — não há dois sistemas de classificação, apenas um, reaproveitado no filtro e no badge do card.

| Tab | Badge | Filtro Aplicado |
|-----|-------|-----------------|
| Todos | Contagem total | Sem filtro |
| Crítico | Contagem (vermelho) | Vencido ou vence hoje |
| Alta | Contagem (vermelho claro) | Vence em 1-3 dias |
| Média | Contagem (laranja) | Vence em 4-7 dias |
| Baixa | Contagem (amarelo) | Vence em 8-30 dias |

### Comportamento
- Tab ativa: fundo Azul, texto Branco
- Tabs inativas: fundo transparente, texto Cinza
- Badge: fundo baseado na cor da prioridade (ver tabela "Prioridade dos Alertas")
- Clique na tab filtra a lista

> **Nota sobre os marcos de 30/15/7/1 dia:** esses marcos (citados no README e em `09-configuracoes.md`) continuam existindo, mas servem a um propósito diferente — são os **gatilhos de disparo** de notificação (quando o sistema envia um push/email), não os filtros desta página. Um medicamento pode, por exemplo, disparar uma notificação ao atingir o marco de "15 dias" e, ao mesmo tempo, aparecer nesta página na tab "Baixa" (8-30 dias) até que sua prioridade mude.

---

## Barra de Ferramentas

### Pesquisa
- **Placeholder:** "Pesquisar alertas..."
- **Busca por:** Nome do medicamento, lote, fabricante

### Filtros Adicionais

| Filtro | Opções |
|--------|--------|
| Prioridade | Alta, Média, Baixa |
| Local de Armazenamento | Lista dinâmica |
| Categoria | Lista dinâmica |
| Data de Alerta | Range (De/Até) |

### Ordenação
- Data de vencimento (mais próximo primeiro - padrão)
- Nome do medicamento
- Prioridade (Alta → Baixa)
- Quantidade

---

## Cards de Alerta

### Estrutura de Cada Card

```
┌─────────────────────────────────────────────────┐
│ [Ícone Status]  Nome do Medicamento    [Badge]  │
│                 Lote: XXXX | Qtd: XX           │
│                                                 │
│ 📅 Vence em: XX/XX/XXXX  (X dias)              │
│ 📍 Local: Farmácia Principal                    │
│ 🏭 Fabricante: Nome da Empresa                  │
│                                                 │
│ [Descartar] [Ver Detalhes]                       │
└─────────────────────────────────────────────────┘
```

### Elementos do Card

| Elemento | Detalhes |
|----------|----------|
| Ícone de Status | Vermelho (vencido), Amarelo (vencendo) |
| Nome | H4, Cinza 900 |
| Badge de Prioridade | "Crítico", "Alta", "Média" |
| Lote | Small, Cinza 500 |
| Quantidade | Small, Cinza 500 |
| Data de Validade | Body, cor baseada no status |
| Dias restantes | Badge: "Vencido", "X dias", "Vence hoje" |
| Local | Small, Cinza 500 |
| Fabricante | Small, Cinza 500 |

### Botões de Ação por Card

| Botão | Variante | Ação |
|-------|----------|------|
| Ver Detalhes | Secondary | Navega para detalhes do medicamento |
| Doar | Success (outline) | Abre modal de doação (apenas se válido) |
| Antecipar Uso | Warning (outline) | Abre modal para uso prioritário |
| Transferir | Ghost | Abre modal de transferência |
| Descartar | Danger (outline) | Abre modal de confirmação de descarte |
| Marcar como Lixo | Danger (ghost) | Abre modal de descarte inadequado |

**⚠️ Regra:** Botão "Doar" só aparece para medicamentos com validade vigente. Medicamentos vencidos/expirados não podem ser doados.

### Animação
- Cards aparecem com fade-in staggered
- Hover: elevação leve
- Card vencido: borda vermelha sutil à esquerda
- Card vencendo: borda amarela sutil à esquerda

---

## Prioridade dos Alertas

| Prioridade | Critério | Cor | Badge |
|------------|----------|-----|-------|
| Crítico | Vencido ou vence hoje | Vermelho | Vermelho |
| Alta | Vence em 1-3 dias | Vermelho claro | Vermelho claro |
| Média | Vence em 4-7 dias | Laranja | Laranja |
| Baixa | Vence em 8-30 dias | Amarelo | Amarelo |

---

## Modal: Confirmar Descarte

### Elementos

| Elemento | Detalhes |
|----------|----------|
| Título | "Descartar medicamento?" |
| Nome | "Você está descartando: [Nome do Medicamento]" |
| Motivo | Textarea obrigatório: "Informe o motivo do descarte" |
| Botões | "Cancelar" (Ghost) | "Confirmar Descarte" (Danger) |

### Após Confirmação
- Toast de sucesso
- Card removido da lista com animação
- Atividade registrada no histórico
- Contadores atualizados

---

## Empty State

### Quando não há alertas
- Ícone de check grande (verde)
- Título: "Nenhum alerta no momento!"
- Descrição: "Todos os seus medicamentos estão dentro do prazo de validade."
- Corpo: verde sutil no fundo

### Quando filtro não retorna resultados
- Título: "Nenhum alerta encontrado"
- Descrição: "Tente ajustar os filtros ou pesquisar por outro termo."
- Botão: "Limpar filtros"

---

## Notificação de Alertas

### Push Notification (quando aplicável)
- **Vencido:** "⚠️ [Nome] está vencido desde [data]"
- **Vence hoje:** "🔔 [Nome] vence hoje!"
- **Vence em X dias:** "📋 [Nome] vence em X dias"

### Email (quando configurado)
- Resumo diária de alertas pendentes
- Alertas críticos enviados imediatamente

---

## Resumo de Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| Visualização | Lista de cards com informações detalhadas |
| Filtro por tempo | Tabs para diferentes prazos de vencimento |
| Filtro avançado | Por prioridade, local, categoria |
| Pesquisa | Busca por nome, lote, fabricante |
| Descarte | Marca medicamento como descartado |
| Notificações | Push e email para alertas críticos |
| Empty state | Mensagem quando não há alertas |
