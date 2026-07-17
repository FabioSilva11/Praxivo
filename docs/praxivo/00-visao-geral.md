# Praxivo - Visão Geral do Projeto

## Identidade do Produto

- **Nome:** Praxivo
- **Categoria:** SaaS - Controle de Validade de Medicamentos
- **Público-alvo:** Pessoas e empresas que precisam gerenciar estoques de medicamentos
- **Proposta de Valor:** Nunca mais perca medicamentos por vencimento

## Objetivo

O Praxivo é uma plataforma web moderna para controle de validade de medicamentos, ajudando pessoas e empresas a evitar desperdícios, reduzir custos e organizar seus estoques.

A aplicação deve transmitir confiança, organização e tecnologia.

## Pilares Fundamentais

| Pilar | Descrição |
|-------|-----------|
| **Confiança** | Interface profissional que transmite segurança no manejo de dados sensíveis |
| **Organização** | Fluxos claros e intuitivos para gestão de estoque |
| **Tecnologia** | Design moderno e funcionalidades inteligentes |
| **Economia** | Foco em redução de desperdício e geração de valor |

## Arquitetura de Páginas

### Fluxo do Usuário

```
Landing Page
    │
    ▼
Autenticação (Login/Cadastro)
    │
    ▼
Dashboard (página principal pós-login)
    │
    ├── Cadastro de Medicamentos
    ├── Alertas
    ├── Relatórios
    ├── Histórico
    ├── Área Financeira + Stripe
    ├── Notificações
    └── Configurações
```

## Navegação

### Sidebar Esquerda (recolhível)
- Dashboard
- Medicamentos
- Alertas
- Relatórios
- Histórico
- Financeiro
- Configurações

### Topo (após login)
- Pesquisa global
- Ícone de notificações (badge com contador)
- Perfil do usuário (dropdown)

## Estrutura de Arquivos MD

| Arquivo | Conteúdo |
|---------|----------|
| `00-visao-geral.md` | Este arquivo - visão geral do projeto |
| `01-design-system.md` | Paleta, tipografia, componentes, dark/light mode |
| `02-landing-page.md` | Hero, benefícios, como funciona, indicadores, FAQ, rodapé |
| `03-autenticacao.md` | Login, cadastro, recuperação de senha |
| `04-dashboard.md` | Cards, gráficos, calendário, atividades |
| `05-medicamentos.md` | CRUD completo de medicamentos |
| `06-alertas.md` | Sistema de alertas por vencimento |
| `07-relatorios.md` | Geração e visualização de relatórios |
| `08-historico.md` | Log de ações do sistema |
| `09-configuracoes.md` | Perfil, empresa, tema, segurança |
| `10-area-financeira.md` | Área financeira, métricas e integração Stripe |
| `11-notificacoes.md` | Central de notificações |
| `12-responsividade.md` | Comportamento desktop/tablet/celular |
| `13-integracao-stripe.md` | Documentação técnica da integração Stripe |
| `14-arquitetura.md` | Arquitetura, multi-tenancy, limites de planos |

## Premissas Técnicas

- **Framework:** A ser definido (sugestão: React/Next.js)
- **Estilo:** Inspirado em Linear, Notion, Vercel, Stripe Dashboard, Raycast
- **Pagamentos:** Stripe (Checkout, Customer Portal, Webhooks) - Produção
- **Multi-tenancy:** Isolamento completo de dados por usuário
- **Planos:** Starter (50), Pro (250), Enterprise (ilimitado)
- **Componentização:** Código limpo, componentizado e escalável
