# Praxivo - Relatórios

## Visão Geral

Página moderna para visualizar e gerar relatórios detalhados sobre o estoque de medicamentos.

---

## Rota
`/relatorios`

---

## Layout

```
┌──────────┬───────────────────────────────────┐
│          │  Relatórios                        │
│ Sidebar  ├───────────────────────────────────┤
│          │  [Período] [Tipo] [Exportar]      │
│          │                                   │
│          │  Cards de Resumo                   │
│          │  ┌────┐ ┌────┐ ┌────┐ ┌────┐     │
│          │  └────┘ └────┘ └────┘ └────┘     │
│          │                                   │
│          │  Gráficos                          │
│          │  ┌──────────┐ ┌──────────┐       │
│          │  │          │ │          │       │
│          │  └──────────┘ └──────────┘       │
│          │                                   │
│          │  Tabela Detalhada                  │
│          │  ┌─────────────────────────────┐  │
│          │  │                             │  │
│          │  └─────────────────────────────┘  │
└──────────┴───────────────────────────────────┘
```

---

## Header da Página

| Elemento | Posição | Detalhes |
|----------|---------|----------|
| Título | Esquerda | "Relatórios" (H2) |
| Botão "Exportar PDF" | Direita | Secondary com ícone de download |
| Botão "Exportar CSV" | Direita | Ghost com ícone de download |

**Nota:** Exportação é placeholder - mostra toast "Em breve disponível"

---

## Filtros

### Período

| Opção | Descrição |
|-------|-----------|
| Hoje | Dados do dia atual |
| Últimos 7 dias | Última semana |
| Últimos 30 dias | Último mês |
| Últimos 90 dias | Último trimestre |
| Último ano | Último ano completo |
| Personalizado | Range de datas (De/Até) |

**Padrão:** Últimos 30 dias

### Tipo de Relatório

| Tipo | Descrição |
|------|-----------|
| Geral | Visão completa de todos os dados |
| Vencidos | Apenas medicamentos vencidos |
| Doados | Medicamentos marcados para doação |
| Transferidos | Medicamentos transferidos entre locais |
| Descartados | Medicamentos descartados adequadamente |
| Lixo | Medicamentos descartados no lixo |
| Economia | Foco em economia gerada |
| Por Categoria | Análise por categoria de medicamento |
| Por Status | Análise por status do medicamento |

---

## Cards de Resumo

### Cards de Resumo

| Card | Métrica | Cor | Ícone |
|------|---------|-----|-------|
| Total Cadastrados | 1.247 | Azul | Pill |
| Total Vencidos | 89 | Vermelho | AlertTriangle |
| Total Doados | 23 | Azul Claro | Heart |
| Total Transferidos | 45 | Roxo | ArrowRightLeft |
| Total Descartados | 34 | Laranja | Trash2 |
| Total Lixo | 12 | Cinza | Trash |
| Economia Estimada | R$ 12.450 | Verde | TrendingUp |

### Estilo dos Cards
- Fundo: Branco (light) / Cinza 800 (dark)
- Valor: H2, Bold
- Label: Small, Cinza 500
- Padding: 24px
- Border-radius: 12px

---

## Gráficos

### 1. Medicamentos por Status (Donut Chart)

- **Posição:** Esquerda (50%)
- **Dados:**
  - Válidos: 1.024 (verde)
  - Vencendo: 124 (amarelo)
  - Vencidos: 89 (vermelho)
  - Descartados: 34 (laranja)
- **Centro:** Total formatado
- **Legenda:** Abaixo do gráfico

### 2. Evolução Mensal (Line Chart)

- **Posição:** Direita (50%)
- **Dados:** Cadastros vs Descartes por mês
- **Linhas:**
  - Azul: Medicamentos cadastrados
  - Vermelho: Medicamentos descartados
- **Eixo X:** Meses
- **Eixo Y:** Quantidade
- **Grid:** Cinza claro, tracejado

### 3. Economia por Mês (Bar Chart)

- **Posição:** Full-width
- **Dados:** Economia estimada por mês
- **Barras:** Verde (economia positiva)
- **Eixo X:** Meses
- **Eixo Y:** Valor em R$
- **Tooltip:** Mostra valor exato ao hover

### 4. Distribuição por Categoria (Horizontal Bar)

- **Posição:** Full-width
- **Dados:** Quantidade de medicamentos por categoria
- **Barras:** Azul
- **Ordenação:** Maior para menor

---

## Tabela Detalhada

### Colunas

| Coluna | Ordenável |
|--------|-----------|
| Medicamento | Sim |
| Categoria | Sim |
| Lote | Não |
| Quantidade | Sim |
| Data Fabricação | Sim |
| Data Validade | Sim |
| Status | Sim |
| Local | Sim |
| Economia Estimada | Sim |

### Status na Tabela

| Status | Cor | Descrição |
|--------|-----|-----------|
| Válido | Verde | Dentro do prazo |
| Vencendo | Amarelo | Menos de 30 dias |
| Vencido | Vermelho | Prazo expirado |
| Doação | Azul Claro | Marcado para doação |
| Transferido | Roxo | Transferido entre locais |
| Descartado | Laranja | Descartado adequadamente |
| Lixo | Cinza Escuro | Descartado no lixo |
| Expirado | Vermelho Claro | Vencido e aguardando ação |

### Paginação
- Itens por página: 10 / 25 / 50
- Navegação: Anterior / Próximo

---

## Cards de Métricas Adicionais

### Métricas de Desperdício

| Métrica | Valor | Descrição |
|---------|-------|-----------|
| Taxa de Desperdício | 7.1% | (Descartados / Total) × 100 |
| Taxa de Aproveitamento | 92.9% | 100% - Taxa de Desperdício |
| Média de Vida Útil | 14.2 meses | Tempo médio entre cadastro e vencimento |
| Alertas Efetivos | 89% | Alertas que resultaram em ação |

### Métricas Financeiras

| Métrica | Valor | Descrição |
|---------|-------|-----------|
| Valor Total em Estoque | R$ 45.230 | Soma dos valores estimados |
| Valor Desperdiçado | R$ 3.210 | Valor dos descartados |
| Economia Potencial | R$ 8.900 | Economia se alertas foram acionados |

---

## Empty State

### Quando não há dados no período
- Ilustração de gráfico vazio
- Título: "Nenhum dado para este período"
- Descrição: "Selecione outro período ou cadastre medicamentos para gerar relatórios."
- Botão: "Selecionar outro período"

---

## Comportamentos

### Geração de Relatório
1. Usuário seleciona filtros
2. Dados são carregados automaticamente (debounce 500ms)
3. Skeleton loading enquanto carrega
4. Gráficos e tabela atualizam

### Exportação (Placeholder)
- **PDF:** Toast "Exportação em PDF em breve disponível"
- **CSV:** Toast "Exportação em CSV em breve disponível"
- **Excel:** Botão desabilitado com tooltip "Em breve"

### Compartilhamento
- Botão "Compartilhar" (placeholder)
- Gera link temporário (futuro)

---

## Resumo de Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| Filtro por período | Hoje, 7 dias, 30 dias, 90 dias, ano, personalizado |
| Filtro por tipo | Geral, vencidos, descartados, economia, por categoria |
| Cards de resumo | Métricas principais em cards |
| Gráficos | Donut, line, bar, horizontal bar |
| Tabela detalhada | Lista completa com ordenação |
| Métricas de desperdício | Taxas e médias |
| Métricas financeiras | Valores estimados |
| Exportação (placeholder) | PDF e CSV preparados |
| Compartilhamento (placeholder) | Link temporário preparado |
