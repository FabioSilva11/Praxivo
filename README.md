# Praxivo

Plataforma web moderna para controle de validade de medicamentos.

![Praxivo](https://img.shields.io/badge/Praxivo-SaaS-blue) ![Docs](https://img.shields.io/badge/docs-Especificação-orange) ![License](https://img.shields.io/badge/license-MIT-green)

---

## Sobre

O **Praxivo** é uma plataforma SaaS para controle de validade de medicamentos, ajudando pessoas e empresas a evitar desperdícios, reduzir custos e organizar seus estoques.

### Objetivo

Nunca mais perca medicamentos por vencimento. Controle todo o seu estoque em um único lugar, receba alertas antes do vencimento e reduza desperdícios.

---

## Status do Projeto

🟡 **Fase de Especificação** — Este repositório contém a documentação de especificação/planejamento do projeto. A implementação do código-fonte ainda não foi iniciada.

---

## Funcionalidades

### Dashboard
- Cards de resumo com métricas principais
- Gráficos de medicamentos por categoria e validade
- Calendário de vencimentos
- Lista dos próximos vencimentos
- Atividades recentes

### Medicamentos
- Cadastro completo com todos os detalhes
- Quantidade com tipo (Individual, Caixa, Frasco, Lote, Bloco)
- Transferência entre locais
- Marcação para doação (apenas produtos válidos)
- Antecipação de uso
- Descarte adequado (segundo normas ANVISA)
- Registro de descarte inadequado (lixo)
- Baixa de estoque
- Duplicação de cadastro
- Seleção múltipla para ações em lote

### Alertas
- Gatilhos de notificação por vencimento (30, 15, 7, 1 dia)
- Classificação por prioridade na página de Alertas (Crítico, Alta, Média, Baixa)
- Ações rápidas diretamente do alerta

### Relatórios
- Métricas de economia e desperdício
- Gráficos detalhados
- Análise por categoria e status
- Exportação (preparado)

### Histórico
- Timeline de todas as ações
- Filtros por ação, medicamento e data
- Detalhes expandíveis com comparação antes/depois

### Área Financeira
- Métricas de economia gerada
- Gestão de assinatura via Stripe
- Histórico de pagamentos
- Mudança de plano
- Cancelamento de assinatura

### Configurações
- Perfil do usuário
- Dados da empresa
- Idioma (PT-BR, EN-US, ES-ES)
- Tema (Claro, Escuro, Sistema)
- Notificações
- Segurança (Senha, 2FA, Sessões)
- Pagamentos

---

## Planos

| Plano | Preço | Medicamentos |
|-------|-------|--------------|
| **Starter** | R$ 29,90/mês | 50 |
| **Pro** | R$ 79,90/mês | 250 |
| **Enterprise** | R$ 199,90/mês | Ilimitado |

---

## Stack Tecnológica (Planejada)

- **Frontend:** A definir (sugestão: React/Next.js)
- **Estilo:** Inspirado em Linear, Notion, Vercel, Stripe Dashboard
- **Pagamentos:** Stripe (Checkout, Customer Portal, Webhooks)
- **Banco de Dados:** A definir
- **Hospedagem:** A definir

---

## Estrutura da Documentação

```
docs/praxivo/
├── 00-visao-geral.md          # Visão geral do projeto
├── 01-design-system.md         # Paleta, tipografia, componentes
├── 02-landing-page.md          # Landing page completa
├── 03-autenticacao.md          # Login, cadastro, OAuth
├── 04-dashboard.md             # Dashboard principal
├── 05-medicamentos.md          # CRUD de medicamentos
├── 06-alertas.md               # Sistema de alertas
├── 07-relatorios.md            # Relatórios e gráficos
├── 08-historico.md             # Timeline de atividades
├── 09-configuracoes.md         # Configurações do usuário
├── 10-area-financeira.md       # Área financeira + Stripe
├── 11-notificacoes.md          # Central de notificações
├── 12-responsividade.md        # Responsividade desktop/tablet/mobile
├── 13-integracao-stripe.md     # Documentação técnica Stripe
└── 14-arquitetura.md           # Arquitetura e multi-tenancy
```

---

## Multi-Tenancy

- Cada usuário visualiza apenas seus próprios dados
- Isolamento completo por `userId` em todas as queries
- Row Level Security (RLS) no banco de dados
- Validação de propriedade em todas as operações

---

## Segurança

- Senhas hasheadas com bcrypt
- Autenticação via JWT
- Autenticação de dois fatores (2FA)
- Cartões processados pelo Stripe (nunca pelo backend)
- PCI DSS Compliance via Stripe Elements
- Webhook verification com assinatura
- Rate limiting em todas as APIs

📄 Política de segurança completa e consolidada: **[SECURITY.md](./SECURITY.md)**

---

## Pagamentos

Integração completa com **Stripe** — a única integração externa do produto, usada exclusivamente para pagamentos:

- Checkout para novas assinaturas
- Customer Portal para gerenciar pagamento
- Webhooks apenas para eventos de status de pagamento/assinatura (ex: `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`)
- Restrições automáticas por status de pagamento
- Dados preservados mesmo com inadimplência

> Não há login social (Google/Microsoft) nem integrações com Slack ou outras ferramentas — a autenticação é feita por email/senha, e o Stripe é usado apenas para cobrança.

---

## Design

### Paleta de Cores

| Cor | Uso |
|-----|-----|
| Azul | Cor principal, botões, links |
| Verde | Indicadores positivos, sucesso |
| Amarelo | Alertas, vencimento próximo |
| Vermelho | Vencidos, erros, exclusão |
| Laranja | Prioridade média, descartados |
| Roxo | Transferências, ações secundárias |
| Cinza | Neutro, textos secundários |

### Responsividade

- **Desktop:** Layout completo com sidebar
- **Tablet:** Sidebar drawer, cards adaptados
- **Mobile:** Sidebar fullscreen, cards empilhados

---

## Como Rodar (quando implementado)

```bash
# Clonar o repositório
git clone https://github.com/FabioSilva11/Praxivo.git

# Entrar na pasta
cd Praxivo

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

> ⚠️ Instruções válidas apenas após a implementação do código-fonte.

---

## Licença

MIT License

---

## Contato

- **GitHub:** [FabioSilva11](https://github.com/FabioSilva11)
- **Repositório:** [Praxivo](https://github.com/FabioSilva11/Praxivo)
