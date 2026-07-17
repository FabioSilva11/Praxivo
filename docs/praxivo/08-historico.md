# Praxivo - Histórico

## Visão Geral

Página para registrar e visualizar todas as ações realizadas no sistema, com filtros e ordenação por data.

---

## Rota
`/historico`

---

## Layout

```
┌──────────┬───────────────────────────────────┐
│          │  Histórico de Atividades           │
│ Sidebar  ├───────────────────────────────────┤
│          │  [Pesquisar] [Filtrar] [Data]     │
│          │                                   │
│          │  ┌─────────────────────────────┐  │
│          │  │ Timeline de Atividades      │  │
│          │  │                             │  │
│          │  │                             │  │
│          │  └─────────────────────────────┘  │
│          │                                   │
│          │  [Paginação]                      │
└──────────┴───────────────────────────────────┘
```

---

## Header da Página

| Elemento | Posição | Detalhes |
|----------|---------|----------|
| Título | Esquerda | "Histórico de Atividades" (H2) |
| Botão "Limpar Histórico" | Direita | Ghost (disponível para o dono da conta) |

---

## Barra de Ferramentas

### Pesquisa
- **Placeholder:** "Pesquisar atividades..."
- **Busca por:** Descrição, nome do medicamento, usuário

### Filtros

| Filtro | Tipo | Opções |
|--------|------|--------|
| Tipo de Ação | Multi-select | Cadastrar, Editar, Excluir, Descartar, Lixo, Doação, Transferência, Antecipar Uso, Baixa, Visualizar, Alerta Enviado |
| Medicamento | Search + Select | Busca por medicamento |
| Data | Range | De / Até |

### Ordenação
- Data (mais recente primeiro - padrão)
- Data (mais antigo primeiro)
- Tipo de ação
- Medicamento

---

## Timeline de Atividades

### Estrutura

```
┌─────────────────────────────────────────────────┐
│ 🟢  Medicamento cadastrado                      │
│     "Paracetamol 500mg foi cadastrado no        │
│      sistema com validade até 12/2025"          │
│     📅 15/07/2026 às 14:30                      │
├─────────────────────────────────────────────────┤
│ 🔵  Medicamento editado                         │
│     "Ibuprofeno 600mg - quantidade atualizada   │
│      de 10 para 25 unidades"                    │
│     📅 15/07/2026 às 10:15                      │
├─────────────────────────────────────────────────┤
│ 🔴  Medicamento descartado                      │
│     "Amoxicilina 500mg descartado - motivo:     │
│      vencido há 30 dias"                        │
│     📅 14/07/2026 às 16:45                      │
└─────────────────────────────────────────────────┘
```

> **Nota:** cada conta do Praxivo é individual (um usuário por conta — ver "Multi-Tenancy" no README), por isso o item da timeline não precisa exibir nome de usuário distinto por ação. O campo "Usuário" na visão expandida (abaixo) apenas confirma que a ação foi feita pelo dono da conta autenticada.

### Cada Item da Timeline

| Elemento | Detalhes |
|----------|----------|
| Indicador | Círculo colorido (ícone da ação) |
| Título | Ação realizada em negrito |
| Descrição | Detalhes da ação em texto normal |
| Data/Hora | Timestamp relativo e absoluto |

### Cores por Tipo de Ação

| Ação | Cor do Indicador | Ícone |
|------|-----------------|-------|
| Cadastrar | Verde | Plus |
| Editar | Azul | Pencil |
| Excluir | Vermelho | Trash2 |
| Descartar | Laranja | XCircle |
| Lixo | Cinza Escuro | Trash |
| Doação | Azul Claro | Heart |
| Transferência | Roxo | ArrowRightLeft |
| Antecipar Uso | Amarelo | Clock |
| Baixa | Cinza | FileMinus |
| Visualizar | Cinza | Eye |
| Alerta Enviado | Amarelo | Bell |

### Timestamp
- **Relativo:** "há 5 minutos", "ontem", "há 3 dias"
- **Absoluto:** "15/07/2026 às 14:30"
- **Hover:** Mostra data/hora exata completa

---

## Detalhes da Atividade (Expand)

### Ao clicar em um item da timeline:

| Campo | Valor |
|-------|-------|
| ID da Atividade | #ACT-001234 |
| Ação | Cadastrar |
| Medicamento | Paracetamol 500mg |
| Usuário | Dono da conta autenticada |
| Data/Hora | 15/07/2026 14:30:22 |
| IP | 192.168.1.100 |
| Detalhes | Dados antes/depois (para edições) |

### Para Edições - Comparação

| Campo | Antes | Depois |
|-------|-------|--------|
| Quantidade | 10 | 25 |
| Local | Farmácia | Almoxarifado |

---

## Paginação

- **Itens por página:** 20 / 50 / 100
- **Infinite scroll:** Alternativa ao clicar "Carregar mais"
- **Info:** "Mostrando 1-20 de 1.247 atividades"

---

## Exportação (Placeholder)

- Botão "Exportar CSV" → Toast "Em breve disponível"
- Botão "Exportar PDF" → Toast "Em breve disponível"

---

## Empty State

### Quando não há atividades
- Ícone de relógio grande
- Título: "Nenhuma atividade registrada"
- Descrição: "As ações realizadas no sistema aparecerão aqui."
- Fundo neutro

### Quando filtro não retorna resultados
- Título: "Nenhuma atividade encontrada"
- Descrição: "Tente ajustar os filtros ou pesquisar por outro termo."
- Botão: "Limpar filtros"

---

## Resumo de Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| Timeline visual | Lista cronológica com indicadores |
| Filtros | Por ação, medicamento, data |
| Pesquisa | Busca em descrições |
| Detalhes expandíveis | Informações completas da ação |
| Comparação | Antes/Depois para edições |
| Paginação | Controle de itens por página |
| Exportação (placeholder) | CSV e PDF preparados |
| Timestamp | Relativo e absoluto |
