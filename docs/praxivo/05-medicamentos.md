# Praxivo - Cadastro de Medicamentos

## Visão Geral

Página completa para gerenciar medicamentos com operações CRUD (Criar, Ler, Atualizar, Excluir) e funcionalidades auxiliares como doação, transferência, antecipação de uso e baixa.

---

## Rota
`/medicamentos`

---

## Layout

```
┌──────────┬───────────────────────────────────┐
│          │  Medicamentos          [+ Adicionar]│
│ Sidebar  ├───────────────────────────────────┤
│          │  [Pesquisar...] [Filtrar] [Ordenar]│
│          │                                   │
│          │  ┌─────────────────────────────┐  │
│          │  │ Tabela de Medicamentos      │  │
│          │  │                             │  │
│          │  │                             │  │
│          │  │                             │  │
│          │  └─────────────────────────────┘  │
│          │                                   │
│          │  [Paginação]          Mostrando X │
└──────────┴───────────────────────────────────┘
```

---

## Header da Página

| Elemento | Posição | Detalhes |
|----------|---------|----------|
| Título | Esquerda | "Medicamentos" (H2) |
| Contador | Centro | "X de Y medicamentos" (mostra limite do plano) |
| Botão "Adicionar" | Direita | Primary, ícone de + |

### Botão Adicionar Medicamento

- **Ícone:** Plus
- **Variante:** Primary
- **Ação:** Abre modal de cadastro (não redireciona)
- **Desabilitado:** Quando atingiu limite do plano

### Contador de Limite

- **Formato:** "X de Y medicamentos"
- **Exemplo:** "47 de 50 medicamentos" (Starter)
- **Cor:** Verde (< 80%), Amarelo (80-99%), Vermelho (100%)
- **Ao atingir limite:** Botão "Adicionar" desabilitado + aviso

### Alerta de Limite Atingido

Quando usuário atinge 80% do limite:
> ⚠️ Você está usando 40 de 50 medicamentos do seu plano Starter.

Quando usuário atinge 100% do limite:
> 🔴 Limite atingido! Você atingiu o limite de 50 medicamentos do seu plano Starter. Faça upgrade para cadastrar mais.
> [Fazer Upgrade]

---

## Barra de Ferramentas

### Pesquisa

- **Placeholder:** "Pesquisar por nome, categoria, lote..."
- **Ícone:** Lupa à esquerda
- **Comportamento:** Filtra em tempo real (debounce 300ms)
- **Limpar:** Botão X aparece quando há texto

### Filtros

**Botão "Filtrar"** abre dropdown com filtros:

| Filtro | Tipo | Opções |
|--------|------|--------|
| Categoria | Multi-select | Analgésicos, Antibióticos, Anti-inflamatórios, Vitamínicos, Cardiovasculares, Dermatológicos, Gastrointestinais, Outros |
| Status de Validade | Multi-select | Válido, Vencendo (30 dias), Vencido |
| Status do Medicamento | Multi-select | Ativo, Doação, Transferido, Descartado, Expirado, Lixo |
| Fabricante | Multi-select | Lista dinâmica |
| Local de Armazenamento | Multi-select | Farmácia, Almoxarifado, Geladeira, Sala 1, Sala 2 |
| Data de Validade | Range | De / Até |
| Lote | Input | Busca por lote específico |

**Botão "Limpar Filtros"** aparece quando há filtros ativos.

### Ordenação

**Botão "Ordenar"** abre dropdown:

| Opção | Direção |
|-------|---------|
| Nome | A-Z / Z-A |
| Data de Validade | Mais próximo / Mais distante |
| Data de Cadastro | Mais recente / Mais antigo |
| Quantidade | Maior / Menor |
| Categoria | A-Z / Z-A |
| Status | Ativos primeiro / Inativos primeiro |

---

## Tabela de Medicamentos

### Colunas

| Coluna | Largura | Ordenável | Detalhes |
|--------|---------|-----------|----------|
| Checkbox | 40px | Não | Seleção múltipla |
| Nome | 20% | Sim | Nome do medicamento |
| Categoria | 12% | Sim | Badge colorido |
| Lote | 10% | Sim | Código do lote |
| Quantidade | 10% | Sim | Número + unidade |
| Validade | 15% | Sim | Data formatada + badge de status |
| Local | 12% | Sim | Local de armazenamento |
| Status | 8% | Sim | Badge de status geral |
| Ações | 13% | Não | Botões de ação |

### Status de Validade

| Status | Cor do Badge | Critério |
|--------|-------------|----------|
| Válido | Verde | Mais de 30 dias para vencer |
| Vencendo | Amarelo | Entre 1 e 30 dias para vencer |
| Vencido | Vermelho | Data de validade passou |

### Status Geral do Medicamento

| Status | Cor do Badge | Descrição |
|--------|-------------|-----------|
| Ativo | Verde | Medicamento disponível para uso |
| Doação | Azul | Marcado para doação |
| Transferido | Roxo | Transferido para outro local |
| Descartado | Laranja | Descartado adequadamente (segundo normas) |
| Lixo | Cinza | Jogado no lixo (descarte inadequado) |
| Expirado | Vermelho | Vencido e aguardando ação (descarte ou doação) |

### Diferença: Vencido vs Expirado

| Status | Quando se Aplica |
|--------|------------------|
| **Vencido** | Indicador de validade na tabela (coluna "Validade") - data já passou |
| **Expirado** | Status geral do medicamento - vencido e ainda não foi descartado/doado |

**Fluxo:** Medicamento fica "Vencido" (na coluna de validade) → Usuário toma ação → Medicamento fica "Expirado" (status geral) → Após descarte/doação → Status muda para "Descartado"/"Doação"

### Linha da Tabela

- **Hover:** Fundo muda levemente
- **Selecionada:** Fundo Azul Claro sutil
- **Vencido:** Badge vermelho + ícone de alerta
- **Vencendo:** Badge amarelo
- **Linha com opacity reduzida:** Medicamentos descartados/lixo

---

## Ações por Medicamento

### Dropdown de Ações (por linha)

| Ação | Ícone | Cor | Confirmação | Descrição |
|------|-------|-----|-------------|-----------|
| Visualizar | Eye | Cinza | Não | Abre detalhes completos |
| Editar | Pencil | Azul | Não | Abre modal de edição |
| Duplicar | Copy | Verde | Não | Cria cópia com dados preenchidos |
| Transferir | ArrowRightLeft | Roxo | Sim | Transfere para outro local |
| Marcar para Doação | Heart | Azul | Sim | Marca como disponível para doação |
| Antecipar Uso | Clock | Amarelo | Sim | Move para uso imediato |
| Marcar como Lixo | Trash | Vermelho | Sim | Marca como descartado no lixo |
| Descartar | XCircle | Laranja | Sim | Descarte adequado com registro |
| Baixa | FileMinus | Cinza | Sim | Baixa do estoque |
| Excluir | X | Vermelho | Sim | Remove permanentemente |

---

## Detalhes de Cada Ação

### 1. Visualizar

**Modal/Detalhes completos:**

| Campo | Valor |
|-------|-------|
| Nome | Nome do medicamento |
| Categoria | Badge colorido |
| Fabricante | Nome do fabricante |
| Lote | Código do lote |
| Quantidade | Número + unidade |
| Data de Fabricação | Data formatada |
| Data de Validade | Data formatada + dias restantes |
| Local de Armazenamento | Local atual |
| Status | Badge de status |
| Observações | Texto completo |
| Criado em | Data/hora de cadastro |
| Última atualização | Data/hora da última edição |
| Histórico | Timeline de ações realizadas |

**Botões de ação rápida no detalhe:**
| Botão | Variante | Ação |
|-------|----------|------|
| Editar | Secondary | Abre modal de edição |
| Transferir | Ghost | Abre modal de transferência |
| Voltar | Ghost | Fecha detalhe |

---

### 2. Editar

**Modal "Editar Medicamento":**

Mesmos campos do cadastro, preenchidos com dados atuais.

**Campos editáveis:**
- Todos os campos do formulário original

**Campos somente leitura:**
- Data de cadastro
- Última atualização

---

### 3. Duplicar

**Funcionalidade:**
- Abre modal de cadastro com todos os campos preenchidos
- Lote gerado automaticamente (suffix "-CÓPIA" ou novo lote)
- Usuário deve revisar e salvar

**Uso comum:** Cadastrar medicamento similar rapidamente

---

### 4. Transferir

**Modal "Transferir Medicamento":**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Medicamento | Text (readonly) | — | Nome do medicamento |
| Local Atual | Text (readonly) | — | Local de origem |
| Novo Local | Select | Sim | Destino da transferência |
| Quantidade | Number | Sim | Qtd a transferir (máx: disponível) |
| Motivo | Textarea | Sim | Justificativa da transferência |

**Locais de destino:**
- Farmácia
- Almoxarifado
- Geladeira
- Sala 1
- Sala 2
- Outro (input adicional)

**Após confirmação:**
- Quantidade movida entre locais
- Registro no histórico
- Notificação (se configurado)

---

### 5. Marcar para Doação

**Modal "Marcar para Doação":**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Medicamento | Text (readonly) | — | Nome do medicamento |
| Quantidade | Number | Sim | Qtd para doação (máx: disponível) |
| Instituição Destino | Text | Sim | Nome da instituição/ong |
| Contato | Text | Não | Telefone/email do contato |
| Motivo | Textarea | Sim | Justificativa |

**⚠️ IMPORTANTE:**
> Medicamentos VENCIDOS ou EXPIRADOS **NÃO PODEM** ser doados. Apenas medicamentos com validade vigente podem ser doados.

**Verificações automáticas:**
- Se medicamento está vencido → bloqueia ação com mensagem de erro
- Se medicamento está expirado → bloqueia ação com mensagem de erro
- Apenas medicamentos "Ativo" podem ser doados

**Mensagem de erro ao tentar doar vencido:**
> "Medicamentos vencidos ou expirados não podem ser doados. Utilize a opção 'Descartar' para medicamentos fora do prazo de validade."

**Após confirmação:**
- Status muda para "Doação"
- Badge azul na tabela
- Registro no histórico
- Lembrete para Follow-up (opcional)

---

### 6. Antecipar Uso

**Modal "Antecipar Uso":**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Medicamento | Text (readonly) | — | Nome do medicamento |
| Dias para Antecipar | Number | Sim | Quantos dias antecipar (máx: 30) |
| Motivo | Textarea | Sim | Justificativa |

**Funcionalidade:**
- Move o medicamento para "uso prioritário"
- Envia alerta para uso imediato
- Pode reduzir a data de lembrete automático

**Após confirmação:**
- Badge "Uso Prioritário" (amarelo)
- Notificação push para equipe
- Registro no histórico

---

### 7. Marcar como Lixo

**Modal "Marcar como Lixo":**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Medicamento | Text (readonly) | — | Nome do medicamento |
| Quantidade | Number | Sim | Qtd descartada |
| Motivo | Select | Sim | Vencido, Danificado, Contaminado, Outro |
| Observação | Textarea | Condicional | Obrigatório se "Outro" |
| Responsável | Text | Sim | Quem realizou o descarte |

**⚠️ Aviso importante:**
> "Esta ação registra descarte inadequado (lixo comum). Para descarte adequado, use a opção 'Descartar' que registra descarte according a normas sanitárias."

**Após confirmação:**
- Status muda para "Lixo"
- Badge cinza na tabela
- Alerta no relatório de desperdício
- Registro detalhado no histórico

---

### 8. Descartar (Descarte Adequado)

**Modal "Descartar Medicamento":**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Medicamento | Text (readonly) | — | Nome do medicamento |
| Quantidade | Number | Sim | Qtd a descartar |
| Motivo | Select | Sim | Vencido, Recall, Defeito, Outro |
| Observação | Textarea | Condicional | Detalhes adicionais |
| Responsável | Text | Sim | Nome do responsável |
| Destino | Select | Sim | Coleta especial, Farmácia, Hospital |
| Data Descarte | Date | Sim | Data do descarte (padrão: hoje) |

**Diferença para "Lixo":**
- Descarte adequado segue normas ANVISA
- Registro completo para auditoria
- Pode gerar crédito fiscal (futuro)

**Após confirmação:**
- Status muda para "Descartado"
- Badge laranja na tabela
- Relatório de descarte atualizado
- Registro detalhado no histórico

---

### 9. Baixa

**Modal "Baixa de Medicamento":**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Medicamento | Text (readonly) | — | Nome do medicamento |
| Quantidade | Number | Sim | Qtd a dar baixa (máx: disponível) |
| Motivo | Select | Sim | Uso, Perda, Vencimento, Outro |
| Observação | Textarea | Condicional | Detalhes |
| Responsável | Text | Sim | Quem realizou |

**Funcionalidade:**
- Reduz estoque sem alterar status do medicamento
- Para uso normal (paciente, venda, etc.)
- Registro de movimentação

**Após confirmação:**
- Quantidade atualizada
- Se quantidade = 0, status muda automaticamente
- Registro no histórico

---

### 10. Excluir

**Modal "Excluir Medicamento":**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Confirmação | Text | Sim | Digite "EXCLUIR" para confirmar |

**⚠️ Aviso:**
> "Esta ação é irreversível. O medicamento será removido permanentemente do sistema."

**Verificações pré-exclusão:**
- Medicamento não pode ter histórico de doação pendente
- Medicamento não pode estar em processo de recall
- Se houver dependentes, mostrar aviso

**Após confirmação:**
- Remove todos os dados
- Não pode ser desfeito
- Registro no log de sistema (não no histórico do medicamento)

---

## Ações em Lote (Seleção Múltipla)

### Quando há itens selecionados:

Barra de ações aparece acima da tabela:

| Botão | Ação |
|-------|------|
| "X selecionados" | Contador de itens |
| Editar em lote | Abre modal de edição em lote |
| Transferir selecionados | Abre modal de transferência em lote |
| Doar selecionados | Abre modal de doação em lote |
| Descartar selecionados | Abre modal de descarte em lote |
| Marcar como lixo | Abre modal de lixo em lote |
| Exportar | Exporta seleção (placeholder) |
| Limpar seleção | Desmarca todos |

### Edição em Lote

**Campos editáveis em lote:**
- Local de Armazenamento (todos mudam para o mesmo)
- Categoria (todos mudam para a mesma)
- Observações (adiciona a todas)

---

## Status do Medicamento - Fluxo

```
┌─────────┐
│  Ativo   │
└────┬────┘
     │
     ├──→ Doação (marcado para doar) [apenas se válido]
     │         └──→ Ativo (se não doado)
     │
     ├──→ Transferido (mudou de local)
     │         └──→ Ativo (no novo local)
     │
     ├──→ Antecipar Uso (prioridade)
     │         └──→ Ativo (quando usado)
     │
     ├──→ Descartado (descarte adequado)
     │         └──→ (terminal)
     │
     ├──→ Lixo (descarte inadequado)
     │         └──→ (terminal)
     │
     └──→ Expirado (vencido)
               ├──→ Descartar (única opção)
               └──→ Lixo (única opção)
               ⚠️ NÃO pode ser doado
```

---

## Modal: Adicionar/Editar Medicamento

### Título
- **Adicionar:** "Novo Medicamento"
- **Editar:** "Editar Medicamento"

### Campos do Formulário

| Campo | Tipo | Obrigatório | Validações | Largura |
|-------|------|-------------|------------|---------|
| Nome | Input text | Sim | Mínimo 2 caracteres | Full |
| Categoria | Select | Sim | Deve selecionar uma opção | 50% |
| Fabricante | Input text | Sim | Mínimo 2 caracteres | 50% |
| Lote | Input text | Sim | Alfanumérico, único | 50% |
| Quantidade | Input number | Sim | Maior que 0 | 30% |
| Tipo Quantidade | Select | Sim | Individual, Caixa, Frasco, Lote, Bloco | 35% |
| Unidade | Select | Sim | Comprimido, Cápsula, Frasco, ml, mg, Gotas, Pomada, Creme, Sache, Outro | 35% |
| Data de Fabricação | Input date | Sim | Não pode ser futura | 50% |
| Data de Validade | Input date | Sim | Deve ser futura, posterior à fabricação | 50% |
| Local de Armazenamento | Select | Sim | Farmácia, Almoxarifado, Geladeira, Sala 1, Sala 2, Outro | 50% |
| Lote de Fornecimento | Input text | Não | Código do lote do fornecedor | 50% |
| Nº de Registro ANVISA | Input text | Não | Registro sanitário | 50% |
| Prescrição Médica | Toggle | Não | Se requer prescrição | 50% |
| Temperatura Armazenamento | Select | Não | Ambiente (15-30°C), Refrigerado (2-8°C), Congelado (-20°C) | 50% |
| Observações | Textarea | Não | Máximo 500 caracteres | Full |

### Detalhes dos Campos de Quantidade

#### Campo "Quantidade"
- **Tipo:** Number input
- **Placeholder:** "Ex: 5"
- **Validação:** Maior que 0

#### Campo "Tipo Quantidade"
Define como o medicamento é embalado/unidades:

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| **Individual** | Unidades soltas | 5 comprimidos soltos |
| **Caixa** | Caixa com múltiplas unidades | 3 caixas com 10 comprimidos cada |
| **Frasco** | Frasco com líquido/sólido | 2 frascos de 100ml |
| **Lote** | Conjunto de medicamentos | 1 lote com 50 unidades |
| **Bloco** | Bloco de medicamentos | 10 blocos de 5 comprimidos |

#### Campo "Unidade"
Define a unidade de medida de cada item:

| Unidade | Descrição |
|---------|-----------|
| Comprimido | Unidades sólidas |
| Cápsula | Cápsulas |
| Frasco | Frascos com líquido |
| ml | Mililitros |
| mg | Miligramas |
| Gotas | Gotas |
| Pomada | Pomadas |
| Creme | Cremes |
| Sache | Sachês |
| Outro | Outra unidade |

#### Exemplos de Cadastro

| Exemplo | Quantidade | Tipo | Unidade |
|---------|------------|------|---------|
| Dipirona 500mg | 5 | Caixa | Comprimido |
| Amoxicilina 250mg | 10 | Individual | Cápsula |
| Vitamina C | 2 | Frasco | ml |
| Paracetamol gotas | 3 | Lote | Gotas |
| Ibuprofeno | 20 | Bloco | Comprimido |
| Pomada anti-inflamatória | 1 | Individual | Pomada |

#### Visualização na Tabela

A coluna "Quantidade" mostra:

| Formato | Exemplo |
|---------|---------|
| Individual | 5 comprimidos |
| Caixa | 3 caixas (30 comprimidos) |
| Frasco | 2 frascos (200ml) |
| Lote | 1 lote (50 unidades) |
| Bloco | 10 blocos (50 comprimidos) |

### Botões do Modal

| Botão | Variante | Ação |
|-------|----------|------|
| Cancelar | Ghost | Fecha modal sem salvar |
| Salvar | Primary | Valida e salva, fecha modal |

### Validações

| Regra | Mensagem |
|-------|----------|
| Nome vazio | "Nome é obrigatório" |
| Nome < 2 caracteres | "Nome deve ter no mínimo 2 caracteres" |
| Categoria não selecionada | "Selecione uma categoria" |
| Data validade < data fabricação | "Data de validade deve ser posterior à fabricação" |
| Data validade no passado | "Data de validade não pode estar no passado" |
| Quantidade <= 0 | "Quantidade deve ser maior que 0" |
| Lote duplicado | "Já existe medicamento com este lote" |
| Unidade não selecionada | "Selecione a unidade de medida" |

### Estados do Modal
- **Idle:** Formulário vazio (adicionar) ou preenchido (editar)
- **Validating:** Erros aparecem nos campos
- **Submitting:** Botão "Salvando..." com spinner
- **Success:** Toast de sucesso + fecha modal + atualiza tabela
- **Error:** Toast de erro + mantém modal aberto

---

## Paginação

- **Itens por página:** 10 / 25 / 50 (seletor)
- **Navegação:** Anterior / 1 2 3 ... 10 / Próximo
- **Info:** "Mostrando 1-10 de 147 medicamentos"
- **Posição:** Inferior direita da tabela

---

## Empty State

### Quando não há medicamentos:
- Ilustração centralizada
- Título: "Nenhum medicamento cadastrado"
- Descrição: "Comece adicionando seu primeiro medicamento para monitorar sua validade."
- Botão: "Adicionar Medicamento" (Primary)

### Quando busca não retorna resultados:
- Ilustração de busca
- Título: "Nenhum resultado encontrado"
- Descrição: "Tente usar outros termos de pesquisa ou ajuste os filtros."
- Botão: "Limpar filtros" (Secondary)

---

## Resumo de Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| Criar | Modal com formulário completo |
| Ler | Tabela com paginação e busca |
| Atualizar | Modal de edição com dados preenchidos |
| Duplicar | Cria cópia com dados preenchidos |
| Transferir | Move medicamento entre locais |
| Marcar para Doação | Marca como disponível para doação |
| Antecipar Uso | Move para uso prioritário |
| Marcar como Lixo | Registra descarte inadequado |
| Descartar | Descarte adequado com registro |
| Baixa | Reduz estoque (uso normal) |
| Excluir | Remove permanentemente |
| Pesquisar | Busca em tempo real por múltiplos campos |
| Filtrar | Filtros por categoria, status, fabricante, local, data |
| Ordenar | Por qualquer coluna, ascendente/descendente |
| Seleção múltipla | Ações em lote |
| Exportar | Exportação de dados (preparado) |
