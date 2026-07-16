# Praxivo - Landing Page

## Estrutura da Página

A Landing Page é a primeira impressão do produto. Deve ser impactante, limpa e transmitir premium.

```
Header (fixo)
    │
    ▼
Hero Section
    │
    ▼
Seção de Benefícios
    │
    ▼
Como Funciona
    │
    ▼
Indicadores
    │
    ▼
FAQ
    │
    ▼
Rodapé
```

---

## Header (Fixo)

### Conteúdo

| Esquerda | Centro | Direita |
|----------|--------|---------|
| Logo "Praxivo" | Links: Funcionalidades, Preços, Sobre | Botão "Entrar" |

### Comportamento
- Fixo no topo ao rolar (backdrop-blur + fundo semi-transparente)
- Transição suave ao rolar (sombra aparece)
- Logo clicável → volta ao topo da página
- Links com hover underline sutil
- Botão "Entrar" → redireciona para `/login`
- Responsivo: menu hamburger no mobile

---

## Hero Section

### Layout
- **Esquerda:** Texto + Botões
- **Direita:** Imagem/Ilustração da Dashboard

### Conteúdo

**Título (H1):**
> Nunca mais perca medicamentos por vencimento.

**Subtítulo (Body):**
> Controle todo o seu estoque em um único lugar, receba alertas antes do vencimento e reduza desperdícios.

**Botões:**
| Botão | Variante | Ação |
|-------|----------|------|
| Começar Agora | Primary (grande) | Redireciona para `/cadastro` |
| Ver Demonstração | Secondary (grande) | Abre modal ou scroll para demonstração |

### Elemento Visual (Direita)
- Mockup/Captura da Dashboard do Praxivo
- Efeito sutil de flutuação ou parallax
- Bordas arredondadas, sombra suave
- Pode ser estático ou com leve animação

### Responsividade
- **Desktop:** Lado a lado (50/50 ou 40/60)
- **Tablet:** Texto acima, imagem abaixo (reduzida)
- **Mobile:** Texto acima, imagem abaixo (full-width)

---

## Seção de Benefícios

### Layout
- Título centralizado da seção
- Grid de 6 cards (3 colunas desktop, 2 tablet, 1 mobile)

### Cards

| Ícone | Título | Descrição |
|-------|--------|-----------|
| Sino/Bell | Alertas automáticos | Receba notificações antes do vencimento para nunca perder um medicamento |
| Organizer/Box | Organização completa | Mantenha todo o seu estoque organizado e fácil de consultar |
| PiggyBank/Money | Economia com redução de desperdício | Reduza perdas e economize com um controle inteligente |
| Chart/Dashboard | Dashboard inteligente | Visualize dados importantes em tempo real com gráficos modernos |
| Clock/History | Histórico completo | Acompanhe todas as ações realizadas no sistema |
| FileText/Report | Relatórios | Gere relatórios detalhados para análise e tomada de decisão |

### Estilo dos Cards
- Fundo: Branco (light) / Cinza 800 (dark)
- Ícone: Azul principal, dentro de um círculo com fundo Azul Claro
- Título: H4, Cinza 900
- Descrição: Body, Cinza 500
- Padding: 24px
- Border-radius: 12px
- Hover: leve elevação (shadow-md)
- Animação: fade-in staggered ao entrar no viewport

---

## Como Funciona

### Layout
- Título centralizado
- 3 passos em linha (horizontal desktop, vertical mobile)
- Conectados visualmente (linha ou seta entre eles)

### Passos

| Número | Título | Descrição | Ícone |
|--------|--------|-----------|-------|
| 1 | Cadastre seus medicamentos | Adicione nome, validade, quantidade e local de armazenamento | Plus/Add |
| 2 | O sistema acompanha automaticamente as datas | Monitore todas as validades em tempo real sem esforço | Activity/Automatic |
| 3 | Receba alertas antes do vencimento | Seja notificado com antecedência para tomar ação | Bell/Notification |

### Estilo
- Números: Grande, Azul principal, SemiBold
- Título do passo: H3, Cinza 900
- Descrição: Body, Cinza 500
- Animação: os passos aparecem sequencialmente ao rolar

---

## Indicadores

### Layout
- Seção com fundo Azul principal (ou gradiente azul)
- 4 métricas em linha
- Números grandes e animados (counter animation ao entrar no viewport)

### Métricas (Valores Ilustrativos)

| Número | Label | Formato |
|--------|-------|---------|
| 12.500+ | Medicamentos monitorados | Formato brasileiro com ponto |
| 98% | Desperdício evitado | Percentual |
| R$ 2.3M+ | Economia gerada | Moeda brasileira |
| 45.000+ | Alertas enviados | Número formatado |

### Estilo
- Fundo: Azul principal ou gradiente (Azul → Azul Escuro)
- Números: Branco, 48-56px, Bold
- Labels: Branco com opacidade 80%, 14-16px
- Animação: contadores incrementais ao entrar no viewport

---

## FAQ

### Layout
- Título centralizado
- Lista de perguntas em accordion (expand/collapse)
- Máximo de 6-8 perguntas

### Perguntas Sugeridas

| # | Pergunta | Resposta |
|---|----------|----------|
| 1 | O que é o Praxivo? | O Praxivo é uma plataforma web para controle de validade de medicamentos, ajudando a evitar desperdício e organizar estoques. |
| 2 | Como funciona o sistema de alertas? | O sistema monitora automaticamente as datas de validade e envia notificações com antecedência (30, 15, 7 e 1 dia antes do vencimento). |
| 3 | Posso cadastrar medicamentos em lote? | Sim, o sistema permite cadastro individual e em lote, com opção de duplicar cadastros existentes. |
| 4 | Os dados ficam seguros? | Sim, utilizamos criptografia e boas práticas de segurança para proteger todas as informações. |
| 5 | Posso usar no celular? | Sim, o Praxivo é totalmente responsivo e funciona em desktop, tablet e celular. |
| 6 | Como exportar relatórios? | Na página de Relatórios, você pode gerar relatórios detalhados. A exportação será disponibilizada em futuras atualizações. |

### Estilo
- Accordion com ícone de seta (rotaciona ao expandir)
- Pergunta: H4, Cinza 900
- Resposta: Body, Cinza 500
- Borda inferior separando cada item
- Animação suave de expand/collapse

---

## Rodapé (Footer)

### Layout
- 4 colunas + copyright

### Conteúdo

| Coluna 1 | Coluna 2 | Coluna 3 | Coluna 4 |
|----------|----------|----------|----------|
| Logo "Praxivo" | Produto | Empresa | Legal |
| Descrição curta do produto | Funcionalidades | Sobre | Privacidade |
| | Preços | Blog | Termos de Uso |
| | Alertas | Carreiras | |
| | Relatórios | Contato | |

**Copyright (abaixo):**
> © 2026 Praxivo. Todos os direitos reservados.

### Estilo
- Fundo: Cinza 50 (light) / Cinza 900 (dark)
- Texto: Cinza 500
- Links: Cinza 700, hover → Azul
- Padding top/bottom: 48px
- Separador sutil entre conteúdo e copyright

---

## Comportamentos Gerais da Landing Page

### Animações ao Rolar (Scroll)
- Hero: fade-in + slide-up imediato
- Benefícios: cards aparecem em stagger (100ms delay entre cada)
- Como Funciona: passos aparecem sequencialmente
- Indicadores: contadores animam de 0 ao valor final
- FAQ: itens aparecem fade-in

### Performance
- Imagens otimizadas (WebP)
- Lazy loading nas seções abaixo do fold
- Fonte carregada com `font-display: swap`
- CSS crítico inline

### SEO
- Meta title: "Praxivo - Controle de Validade de Medicamentos"
- Meta description baseada no subtítulo do Hero
- Open Graph tags para compartilhamento
- Schema.org结构化数据
