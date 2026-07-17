# Praxivo - Configurações

## Visão Geral

Página de configurações do usuário e do sistema, organizada em abas.

---

## Rota
`/configuracoes`

---

## Layout

```
┌──────────┬───────────────────────────────────┐
│          │  Configurações                     │
│ Sidebar  ├───────────────────────────────────┤
│          │  [Tabs]                           │
│          │  Perfil | Empresa | Idioma | Tema  │
│          │  Notificações | Segurança |        │
│          │  Pagamentos                       │
│          │                                   │
│          │  ┌─────────────────────────────┐  │
│          │  │ Conteúdo da Aba Ativa       │  │
│          │  │                             │  │
│          │  └─────────────────────────────┘  │
│          │                                   │
│          │                    [Salvar]       │
└──────────┴───────────────────────────────────┘
```

---

## Abas de Navegação

| Aba | Ícone | Descrição |
|-----|-------|-----------|
| Perfil | User | Dados pessoais do usuário |
| Empresa | Building2 | Dados da organização |
| Idioma | Globe | Idioma do sistema |
| Tema | Palette | Aparência visual |
| Notificações | Bell | Preferências de notificação |
| Segurança | Shield | Senha e segurança |
| Pagamentos | CreditCard | Métodos de pagamento e faturas |

### Estilo das Abas
- **Desktop:** Abas horizontais no topo
- **Mobile:** Abas em scroll horizontal
- **Ativa:** Borda inferior azul, texto azul
- **Inativa:** Texto cinza, hover cinza claro

---

## Aba 1: Perfil

### Seção: Foto de Perfil

| Elemento | Detalhes |
|----------|----------|
| Avatar | Imagem circular, 96x96px |
| Botão "Alterar Foto" | Upload de imagem |
| Botão "Remover" | Remove foto, usa avatar com iniciais |
| Formatos aceitos | JPG, PNG, WebP |
| Tamanho máximo | 2MB |

### Seção: Informações Pessoais

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Nome completo | Input text | Sim | Mínimo 2 caracteres |
| Email | Input email | Sim (readonly) | Formato válido |
| Telefone | Input tel | Não | Formato brasileiro |
| Cargo | Input text | Não | — |
| Empresa | Input text | Não (preenchido se configurado) | — |

### Seção: Biografia

| Campo | Tipo | Detalhes |
|-------|------|----------|
| Bio | Textarea | Máximo 200 caracteres, contador de caracteres |

### Botões
| Botão | Variante | Ação |
|-------|----------|------|
| Salvar Alterações | Primary | Salva dados do perfil |
| Cancelar | Ghost | Reseta formulário |

---

## Aba 2: Empresa

### Seção: Dados da Empresa

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Nome da Empresa | Input text | Sim | Mínimo 2 caracteres |
| CNPJ | Input text | Sim | Formato XX.XXX.XXX/XXXX-XX |
| Razão Social | Input text | Não | — |
| Inscrição Estadual | Input text | Não | — |
| telefone | Input tel | Não | — |
| Email Corporativo | Input email | Não | — |

### Seção: Endereço

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| CEP | Input text | Sim |
| Rua | Input text (auto-fill) | Sim |
| Número | Input text | Sim |
| Complemento | Input text | Não |
| Bairro | Input text (auto-fill) | Sim |
| Cidade | Input text (auto-fill) | Sim |
| Estado | Select (UF) | Sim |

### Seção: Logotipo

| Elemento | Detalhes |
|----------|----------|
| Logo | Retangular, max 200x80px |
| Botão "Alterar Logo" | Upload |
| Botão "Remover" | Remove logo |
| Formatos | JPG, PNG, SVG |
| Tamanho máximo | 1MB |

### Botões
| Botão | Variante | Ação |
|-------|----------|------|
| Salvar | Primary | Salva dados da empresa |
| Cancelar | Ghost | Reseta formulário |

---

## Aba 3: Idioma

### Opções

| Idioma | Código | Seleção |
|--------|--------|---------|
| Português (Brasil) | pt-BR | Radio/Select |
| English (US) | en-US | Radio/Select |
| Español | es-ES | Radio/Select |

### Preview
- Ao mudar idioma, mostra preview de como ficará
- Botão "Aplicar" confirma a mudança
- Mensagem: "Alguns textos podem ser atualizados após o reload"

---

## Aba 4: Tema

### Opções

| Tema | Descrição | Preview |
|------|-----------|---------|
| Claro | Fundo branco, texto escuro | Mini preview do card |
| Escuro | Fundo escuro, texto claro | Mini preview do card |
| Sistema | Respeita configuração do SO | — |

### Seletor Visual
- 3 cards grandes mostrando preview de cada tema
- Card selecionado com borda azul
- Animação de transição ao selecionar

### Extras

| Opção | Tipo | Detalhes |
|-------|------|----------|
| Cor de destaque | Color picker | Altera cor principal (azul padrão) |
| Tamanho da fonte | Slider | Pequeno / Médio / Grande |
| Animações reduzidas | Toggle | Respeita `prefers-reduced-motion` |

---

## Aba 5: Notificações

### Seção: Canais de Notificação

| Canal | Toggle | Descrição |
|-------|--------|-----------|
| Email | Ativado | Receber notificações por email |
| Push (navegador) | Ativado | Notificações push no navegador |
| In-app | Ativado | Notificações dentro do sistema |

### Seção: Tipos de Notificação

| Tipo | Email | Push | In-app |
|------|-------|------|--------|
| Medicamento vencendo (30 dias) | Ativado | Ativado | Ativado |
| Medicamento vencendo (15 dias) | Ativado | Ativado | Ativado |
| Medicamento vencendo (7 dias) | Ativado | Ativado | Ativado |
| Medicamento vencido | Ativado | Ativado | Ativado |
| Medicamento descartado | Desativado | Desativado | Ativado |
| Relatório semanal | Ativado | Desativado | Desativado |
| Atualizações do sistema | Desativado | Desativado | Ativado |

### Seção: Horário de Não Perturbe

| Campo | Tipo | Detalhes |
|-------|------|----------|
| Ativar DND | Toggle | — |
| Início | Time picker | Padrão: 22:00 |
| Fim | Time picker | Padrão: 07:00 |

---

## Aba 6: Segurança

### Seção: Alterar Senha

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Senha Atual | Input password | Sim |
| Nova Senha | Input password | Sim |
| Confirmar Nova Senha | Input password | Sim |

**Indicador de força:** Fraca / Média / Forte (mesmo do cadastro)

**Botão:** "Atualizar Senha"

### Seção: Autenticação de Dois Fatores (2FA)

| Elemento | Detalhes |
|----------|----------|
| Status | "Desativado" / "Ativado" |
| Botão | "Ativar 2FA" / "Desativar 2FA" |
| Método | App autenticador (Google Authenticator, Authy) |
| QR Code | Exibido ao ativar |
| Código de backup | Gerado ao ativar (8 códigos de uso único) |

### Seção: Sessões Ativas

| Coluna | Detalhes |
|--------|----------|
| Dispositivo | Nome do dispositivo/navegador |
| IP | Endereço IP |
| Localização | Cidade, País |
| Último acesso | Data/hora |
| Ação | "Encerrar sessão" |

**Botão:** "Encerrar todas as outras sessões"

### Seção: Exclusão de Conta

| Elemento | Detalhes |
|----------|----------|
| Aviso | "Esta ação é irreversível" |
| Botão | "Excluir minha conta" (Danger) |
| Confirmação | Modal com digitação de "EXCLUIR" para confirmar |

---

## Aba 7: Pagamentos

> **Nota:** Esta aba mostra informações resumidas da assinatura. Para métricas financeiras detalhadas, gráficos e faturas completas, acesse a página **Financeiro** (`/financeiro`).

### Seção: Plano Atual

```
┌─────────────────────────────────────────────────┐
│  📦 Plano Atual                                │
│                                                 │
│  Plano Pro                                     │
│  R$ 79,90/mês                                  │
│  Limite: 250 medicamentos                     │
│                                                 │
│  Próxima cobrança: 15/08/2026                  │
│                                                 │
│  [Mudar de Plano]  [Cancelar Assinatura]        │
└─────────────────────────────────────────────────┘
```

### Seção: Histórico de Pagamentos

| Data | Descrição | Valor | Status |
|------|-----------|-------|--------|
| 15/07/2026 | Plano Pro - Mensal | R$ 79,90 | Pago ✓ |
| 15/06/2026 | Plano Pro - Mensal | R$ 79,90 | Pago ✓ |
| 15/05/2026 | Plano Pro - Mensal | R$ 79,90 | Pago ✓ |

### Ações Disponíveis

| Botão | Variante | Ação |
|-------|----------|------|
| Mudar de Plano | Secondary | Abre modal de seleção de plano |
| Cancelar Assinatura | Ghost (Danger) | Abre modal de confirmação |

### Modal: Mudar de Plano

```
┌─────────────────────────────────────────────────┐
│  Mudar de Plano                                │
│                                                 │
│  Plano Atual: Pro (R$ 79,90/mês)              │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Starter      R$ 29,90/mês             │   │
│  │  Limite: 50 medicamentos               │   │
│  │  [Selecionar]                           │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Pro (Atual)  R$ 79,90/mês             │   │
│  │  Limite: 250 medicamentos             │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Enterprise   R$ 199,90/mês            │   │
│  │  Limite: Ilimitado                     │   │
│  │  [Selecionar]                           │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Cancelar]                    [Confirmar]      │
└─────────────────────────────────────────────────┘
```

**Regras de downgrade:**
- Se usuário tem mais medicamentos que o novo limite, downgrade é bloqueado
- Mensagem: "Você tem X medicamentos, mas o novo plano permite apenas Y"

### Modal: Cancelar Assinatura

```
┌─────────────────────────────────────────────────┐
│  Cancelar Assinatura                           │
│                                                 │
│  Tem certeza que deseja cancelar?              │
│                                                 │
│  • Seu acesso será mantido até o fim           │
│    do período já pago                          │
│  • Seus dados serão preservados                │
│  • Você pode reativar a qualquer momento       │
│                                                 │
│  Motivo (opcional):                            │
│  ┌─────────────────────────────────────────┐   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Manter Assinatura]        [Confirmar]         │
└─────────────────────────────────────────────────┘
```

---

## Comportamentos Gerais

### Salvar Alterações
- Toast de sucesso: "Configurações salvas com sucesso!"
- Botão "Salvar" desabilitado quando não há alterações
- Confirmação ao tentar sair com alterações pendentes

### Validação
- Campos obrigatórios marcados com asterisco
- Erros inline abaixo de cada campo
- Botão "Salvar" desabilitado enquanto houver erros

### Responsividade
- **Desktop:** Layout com abas horizontais
- **Mobile:** Abas em scroll horizontal, formulários full-width

---

## Resumo de Funcionalidades

| Aba | Funcionalidades |
|-----|-----------------|
| Perfil | Foto, dados pessoais, bio |
| Empresa | Dados empresa, CNPJ, endereço, logo |
| Idioma | PT-BR, EN-US, ES-ES |
| Tema | Claro, Escuro, Sistema + personalização |
| Notificações | Canais, tipos, horário silencioso |
| Segurança | Senha, 2FA, sessões, exclusão |
| Pagamentos | Plano atual, histórico, mudar plano, cancelar |
