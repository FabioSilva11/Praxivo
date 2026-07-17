# Praxivo - Dashboard

## Visão Geral

A Dashboard é a página principal pós-login. Deve fornecer uma visão completa e instantânea do estado do estoque de medicamentos.

---

## Layout

### Estrutura

```
┌──────────┬───────────────────────────────────┐
│          │  [Pesquisa]    [🔔] [🌙] [Avatar] │
│ Sidebar  ├───────────────────────────────────┤
│          │                                   │
│          │  Cards Resumo                     │
│          │  ┌────┐ ┌────┐ ┌────┐ ┌────┐     │
│          │  │    │ │    │ │    │ │    │     │
│          │  └────┘ └────┘ └────┘ └────┘     │
│          │                                   │
│          │  Gráficos Principais              │
│          │  ┌──────────┐ ┌──────────┐       │
│          │  │          │ │          │       │
│          │  └──────────┘ └──────────┘       │
│          │                                   │
│          │  Calendário + Lista + Atividades  │
│          │  ┌──────────┐ ┌──────┐ ┌──────┐ │
│          │  │          │ │      │ │      │ │
│          │  │          │ │      │ │      │ │
│          │  └──────────┘ └──────┘ └──────┘ │
└──────────┴───────────────────────────────────┘
```

---

## Sidebar (Esquerda - Recolhível)

### Itens de Navegação

| Ícone | Label | Rota | Badge |
|-------|-------|------|-------|
| LayoutDashboard | Dashboard | `/dashboard` | — |
| Pill | Medicamentos | `/medicamentos` | Contagem total |
| Bell | Alertas | `/alertas` | Número de alertas ativos |
| BarChart3 | Relatórios | `/relatorios` | — |
| Clock | Histórico | `/historico` | — |
| DollarSign | Financeiro | `/financeiro` | — |
| Settings | Configurações | `/configuracoes` | — |

> **Nota:** `/notificacoes` (ver `11-notificacoes.md`) não é um item da sidebar por padrão — é acessada pelo ícone de sino no header ("Ver todas as notificações"). Ainda assim, é uma rota válida da aplicação (ver "Resumo das Rotas" abaixo).

### Comportamento
- **Expandida (desktop):** Ícone + Label, largura 240px
- **Recolhida (desktop):** Apenas ícones, largura 64px
- **Toggle:** Botão de hambúrguer no topo da sidebar
- **Mobile:** Drawer lateral com overlay, abre/fecha com swipe
- **Hover (recolhida):** Tooltip com nome da página
- **Ativa:** Fundo Azul Claro (light) / fundo azul translúcido (dark), texto Azul

---

## Header (Topo)

### Elementos

| Posição | Elemento | Funcionalidade |
|---------|----------|----------------|
| Esquerda | Botão toggle sidebar | Recolhe/expande sidebar |
| Centro-esquerda | Pesquisa global | Busca medicamentos, ações |
| Direita | Ícone de notificações | Abre dropdown de notificações, badge com contador |
| Direita | Toggle tema | Alterna dark/light mode (ícone lua/sol) |
| Direita | Avatar do usuário | Abre dropdown do perfil |

### Pesquisa Global

- **Placeholder:** "Pesquisar medicamentos, categorias..."
- **Comportamento:** Abre modal de busca ou dropdown com resultados
- **Atalho:** `Ctrl+K` ou `Cmd+K`
- **Resultados:** Lista agrupada por tipo (Medicamentos, Categorias, Ações)
- **Estilo:** Modal centralizado, estilo Raycast/Linear

---

## Cards Resumo (Topo)

### 4 Cards Principais

| Card | Valor | Subtexto | Cor | Ícone | Gráfico |
|------|-------|----------|-----|-------|---------|
| Medicamentos Cadastrados | 1.247 | +12 este mês | Azul | Pill | Mini line chart (últimos 6 meses) |
| Próximos do Vencimento | 34 | Próximos 30 dias | Amarelo | Clock | Mini bar chart (próximos 7 dias) |
| Vencidos | 8 | Requer ação | Vermelho | AlertTriangle | Mini line chart (últimos 6 meses) |
| Economia Estimada | R$ 4.850 | vs. mês anterior | Verde | TrendingUp | Mini line chart (últimos 6 meses) |

> **Nota sobre os valores:** os números acima são apenas ilustrativos e representam um **snapshot do estado atual** (ex.: "Vencidos" = vencidos agora mesmo). Já os totais equivalentes em `07-relatorios.md` e `10-area-financeira.md` representam o **acumulado do período filtrado** (padrão: últimos 30 dias), por isso os valores de exemplo não coincidem entre as páginas — isso é esperado, não um erro de digitação.

### Estilo dos Cards

- Fundo: Branco (light) / Cinza 800 (dark)
- Padding: 24px
- Border-radius: 12px
- Borda: 1px sutil
- Layout interno: Valor grande (H2), Subtexto (Small), Gráfico mini (direita)
- Hover: elevação leve
- Animação: fade-in staggered (100ms entre cada)

---

## Gráficos Principais

### 1. Medicamentos por Categoria (Pizza/Donut)

- **Posição:** Esquerda (largura 50%)
- **Tipo:** Donut chart
- **Dados:** Distribuição de medicamentos por categoria
- **Legenda:** Abaixo ou à direita do gráfico
- **Categorias exemplo:**
  - Analgésicos (32%)
  - Antibióticos (18%)
  - Anti-inflamatórios (15%)
  - Vitamínicos (14%)
  - Outros (21%)
- **Cores:** Paleta do design system, uma cor por categoria
- **Interatividade:** Hover mostra detalhes, clique filtra tabela

### 2. Validade por Mês (Barras)

- **Posição:** Direita (largura 50%)
- **Tipo:** Bar chart
- **Dados:** Quantidade de medicamentos vencendo por mês
- **Eixo X:** Meses (próximos 6 meses)
- **Eixo Y:** Quantidade
- **Cores das barras:**
  - Verde: mais de 30 dias
  - Amarelo: 15-30 dias
  - Vermelho: menos de 15 dias
- **Interatividade:** Hover mostra tooltip com detalhes

### Estilo dos Gráficos
- Biblioteca sugerida: **Recharts** ou **Tremor**
- Fundo do container: Branco/Cinza 800
- Padding: 24px
- Border-radius: 12px
- Título do card: H4, Cinza 700
- Sem bordas nas barras (flat design)
- Grid lines: Cinza 200, tracejadas

---

## Seção Inferior (3 Colunas)

### 1. Calendário de Vencimentos

- **Posição:** Esquerda (largura ~40%)
- **Tipo:** Calendário mensal
- **Dados:** Dias com vencimentos marcados
- **Animação dos dias:**
  - Vermelho: dia com vencidos
  - Amarelo: dia com vencendo (30 dias)
  - Verde: dia sem problemas
- **Interatividade:** Clique no dia mostra lista de medicamentos daquele dia
- **Navegação:** Setas para mês anterior/próximo
- **Estilo:** Grid 7 colunas (Dom-Sab), minimalista

### 2. Lista dos Próximos Vencimentos

- **Posição:** Centro (largura ~30%)
- **Tipo:** Lista scrollável
- **Máximo visível:** 5-6 itens
- **Cada item mostra:**
  - Nome do medicamento
  - Data de vencimento
  - Badge de prioridade (verde/amarelo/vermelho)
  - Quantidade
- **Ordenação:** Por proximidade de vencimento (mais próximo primeiro)
- **Link:** "Ver todos" → redireciona para `/alertas`
- **Animação:** Fade-in dos itens

### 3. Atividades Recentes

- **Posição:** Direita (largura ~30%)
- **Tipo:** Timeline/lista cronológica
- **Máximo visível:** 5-6 itens
- **Cada atividade mostra:**
  - Ícone do tipo de ação (adicionar, editar, excluir, descartar)
  - Descrição da ação
  - Timestamp relativo ("há 2 horas", "ontem")
- **Tipos de atividade:**
  - Medicamento cadastrado (azul)
  - Medicamento editado (cinza)
  - Medicamento excluído (vermelho claro)
  - Medicamento descartado (laranja)
  - Medicamento doado (azul claro)
  - Medicamento transferido (roxo)
  - Alerta enviado (amarelo)
- **Link:** "Ver histórico completo" → `/historico`

---

## Comportamentos Gerais

### Carregamento Inicial
- **Skeleton loading:** Todos os cards e gráficos mostram skeleton animations
- **Sequência:** Cards → Gráficos → Seção inferior
- **Duração esperada:** < 2 segundos

### Dados Vazios (Zero State)
- Quando não há medicamentos cadastrados:
  - Mensagem amigável: "Comece cadastrando seu primeiro medicamento"
  - Botão CTA: "Cadastrar Medicamento"
  - Ilustração contextual

### Atualização
- Dados atualizam automaticamente via **Supabase Realtime** (subscriptions em `medications` e `alerts`, sem polling)
- Animação de transição nos valores ao atualizar
- Toast sutil quando há novos alertas

### Filtros Globais
- Período: Últimos 7 dias / 30 dias / 90 dias / Personalizado
- Local de armazenamento: Todos / Filtrar por local
- Categoria: Todas / Filtrar por categoria

---

## Resumo das Rotas

| Rota | Descrição |
|------|-----------|
| `/dashboard` | Esta página (principal) |
| `/medicamentos` | CRUD de medicamentos |
| `/alertas` | Central de alertas |
| `/relatorios` | Geração de relatórios |
| `/historico` | Log de ações |
| `/financeiro` | Métricas financeiras |
| `/configuracoes` | Configurações do usuário |
| `/notificacoes` | Central de notificações (acesso via sino no header) |
