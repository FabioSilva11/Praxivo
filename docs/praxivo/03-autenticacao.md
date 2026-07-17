# Praxivo - Autenticação

## Visão Geral

Sistema de autenticação completo com Login, Cadastro, Recuperação de Senha e Verificação de Email (apenas email/senha — sem login social).

---

## 1. Tela de Login

### Rota
`/login`

### Layout
- **Esquerda:** Formulário de login
- **Direita:** Ilustração/benefícios do produto (apenas desktop)
- **Mobile:** Formulário centralizado, sem lado direito

### Elementos do Formulário

| Elemento | Tipo | Obrigatório | Detalhes |
|----------|------|-------------|----------|
| Email | Input (email) | Sim | Placeholder: "seu@email.com" |
| Senha | Input (password) | Sim | Com toggle de visibilidade (olho) |
| Lembrar de mim | Checkbox | Não | Mantém sessão por mais tempo |
| Esqueci a senha | Link | — | Redireciona para `/recuperar-senha` |

### Botões de Ação

| Botão | Variante | Ação |
|-------|----------|------|
| Entrar | Primary (full-width) | Valida credenciais e redireciona para `/dashboard` |
| Entrar com Email | Ghost (full-width) | Magic link / Email de verificação |

### Links Inferiores
> Não tem uma conta? **Cadastre-se**

### Validações

| Campo | Regra | Mensagem de Erro |
|-------|-------|------------------|
| Email | Formato válido | "Email inválido" |
| Email | Obrigatório | "Email é obrigatório" |
| Senha | Mínimo 6 caracteres | "Senha deve ter no mínimo 6 caracteres" |
| Senha | Obrigatória | "Senha é obrigatória" |
| Credenciais | Corretas | "Email ou senha incorretos" |

### Estados

| Estado | Comportamento |
|--------|---------------|
| Idle | Formulário vazio, botão habilitado |
| Validating | Campos destacados com erros se inválidos |
| Loading | Botão mostra spinner, formulário desabilitado |
| Error | Toast de erro no topo + mensagem abaixo do campo |
| Success | Redirecionamento para `/dashboard` |

---

## 2. Tela de Cadastro

### Rota
`/cadastro`

### Layout
- **Esquerda:** Formulário de cadastro
- **Direita:** Ilustração/benefícios (apenas desktop)

### Elementos do Formulário

| Elemento | Tipo | Obrigatório | Detalhes |
|----------|------|-------------|----------|
| Nome completo | Input (text) | Sim | Placeholder: "Seu nome" |
| Email | Input (email) | Sim | Placeholder: "seu@email.com" |
| Senha | Input (password) | Sim | Com strength indicator |
| Confirmar senha | Input (password) | Sim | Deve coincidir com senha |
| Aceito os termos | Checkbox | Sim | Link para Termos de Uso |

### Botões de Ação

| Botão | Variante | Ação |
|-------|----------|------|
| Criar conta | Primary (full-width) | Cria conta e redireciona para onboarding |

### Links Inferiores
> Já tem uma conta? **Entrar**

### Indicador de Força da Senha

| Nível | Cor | Critérios |
|-------|-----|-----------|
| Fraca | Vermelho | Abaixo de 6 caracteres |
| Média | Amarelo | 6+ caracteres |
| Forte | Verde | 8+ caracteres, maiúscula, número, especial |

### Validações

| Campo | Regra | Mensagem |
|-------|-------|----------|
| Nome | Mínimo 2 caracteres | "Nome deve ter no mínimo 2 caracteres" |
| Email | Formato válido e único | "Email já cadastrado" |
| Senha | Mínimo 6 caracteres | "Senha deve ter no mínimo 6 caracteres" |
| Confirmar senha | Igual à senha | "As senhas não coincidem" |
| Termos | Marcado | "Você precisa aceitar os termos" |

---

## 3. Recuperação de Senha

### Rota
`/recuperar-senha`

### Etapas

#### Etapa 1: Solicitar Email
- Input: Email
- Botão: "Enviar link de recuperação"
- Mensagem: "Insira o email associado à sua conta"
- Após envio: mensagem de confirmação "Verifique sua caixa de entrada"

#### Etapa 2: Email Enviado
- Ícone de email enviado
- Título: "Email enviado!"
- Descrição: "Enviamos um link de recuperação para [email]"
- Botão: "Voltar ao login"
- Link: "Não recebeu? Reenviar email"

#### Etapa 3: Nova Senha (acesso via link no email)
- Input: Nova senha (com strength indicator)
- Input: Confirmar nova senha
- Botão: "Redefinir senha"
- Mensagem de sucesso: "Senha redefinida com sucesso!" → redireciona para login

---

## 4. Verificação de Email (pós-cadastro)

### Rota
`/verificar-email`

### Layout
- Ícone de email grande
- Título: "Verifique seu email"
- Descrição: "Enviamos um link de verificação para [email]"
- Botão: "Reenviar email"
- Link: "Voltar ao login"

### Funcionalidade
- Usuário não pode acessar dashboard até verificar email (exibir aviso)
- Email contém link de verificação com token
- Token expira em 24 horas

---

## 5. Tela de Boas-Vindas (Onboarding)

### Rota
`/onboarding` (após primeiro cadastro)

### Etapas

#### Etapa 1: Perfil
- Foto de perfil (upload ou avatar padrão)
- Nome (já preenchido)
- Empresa/Organização (opcional)
- Cargo (opcional)
- Botão: "Próximo"

#### Etapa 2: Preferências
- Tema: Claro / Escuro / Sistema
- Idioma: Português / English / Español
- Notificações: Ativar / Desativar
- Botão: "Próximo"

#### Etapa 3: Primeiro Medicamento (opcional)
- Formulário simplificado para cadastrar primeiro medicamento
- Botão: "Pular" ou "Cadastrar"
- Após: redireciona para `/dashboard`

---

## Layout Geral de Todas as Telas de Auth

### Estrutura Comum
```
┌─────────────────────────────────────────────┐
│  Logo "Praxivo"                    Link/Login │
├────────────────────┬────────────────────────┤
│                    │                        │
│   Formulário       │   Ilustração/          │
│                    │   Benefícios           │
│                    │                        │
├────────────────────┴────────────────────────┤
│  Footer: Privacidade | Termos              │
└─────────────────────────────────────────────┘
```

### Estilo
- Fundo: Branco (light) / Cinza 950 (dark)
- Card do formulário: centralizado, max-width 420px
- Padding do card: 32px
- Border-radius: 16px
- Sombra suave
- Transições entre etapas: slide horizontal

### Comportamentos
- Todas as telas são independentes (acessíveis por URL)
- Botão voltar do browser funciona corretamente
- Mensagens de erro desaparecem ao digitar novamente
- Loading states em todos os botões de ação
- Redirecionamento automático se já autenticado

---

## Segurança

| Medida | Implementação |
|--------|---------------|
| Senhas | Hash com bcrypt (salt rounds: 12) |
| Tokens JWT | Expiração de 7 dias (access), 30 dias (refresh) |
| Rate limiting | Máximo 5 tentativas de login em 15 minutos |
| CSRF | Token CSRF em formulários |
| HTTPS | Obrigatório em produção |
| Validade de email | Token de verificação com expiração de 24h |
