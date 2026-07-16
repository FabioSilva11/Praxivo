# Praxivo - Responsividade

## Visão Geral

O Praxivo deve funcionar perfeitamente em Desktop, Tablet e Celular, oferecendo experiência otimizada para cada dispositivo.

---

## Breakpoints

| Dispositivo | Largura | Breakpoint |
|-------------|---------|------------|
| Mobile | Até 640px | `sm` |
| Tablet | 641px - 1024px | `md` |
| Desktop | 1025px - 1440px | `lg` |
| Desktop Large | 1441px+ | `xl` |

---

## Comportamento por Dispositivo

### Sidebar

| Dispositivo | Comportamento |
|-------------|---------------|
| Desktop Large | Expandida (240px), sempre visível |
| Desktop | Recolhível (64px quando fechada) |
| Tablet | Drawer com overlay (abre/fecha) |
| Mobile | Drawer com overlay (abre/fecha), fullscreen |

### Header

| Dispositivo | Comportamento |
|-------------|---------------|
| Desktop | Pesquisa, notificações, tema, perfil |
| Tablet | Pesquisa (recolhida), notificações, perfil |
| Mobile | Menu hamburger, notificações, perfil |

### Tabelas

| Dispositivo | Comportamento |
|-------------|---------------|
| Desktop | Colunas completas |
| Tablet | Colunas essenciais (nome, validade, status) |
| Mobile | Cards empilhados (não tabela) |

### Cards

| Dispositivo | Grid |
|-------------|------|
| Desktop Large | 4 colunas |
| Desktop | 3 colunas |
| Tablet | 2 colunas |
| Mobile | 1 coluna |

### Gráficos

| Dispositivo | Comportamento |
|-------------|---------------|
| Desktop | Lado a lado (50/50) |
| Tablet | Empilhados (100% cada) |
| Mobile | Empilhados (100% cada), legenda abaixo |

---

## Página por Página

### Landing Page

| Elemento | Desktop | Tablet | Mobile |
|----------|---------|--------|--------|
| Header | Logo + Links + Botão | Logo + Hamburger | Logo + Hamburger |
| Hero | Texto + Imagem lado a lado | Texto + Imagem empilhados | Texto + Imagem empilhados |
| Benefícios | 3 colunas | 2 colunas | 1 coluna |
| Como Funciona | 3 passos horizontais | 3 passos horizontais | 3 passos verticais |
| Indicadores | 4 na linha | 2x2 grid | 1 coluna |
| FAQ | Largura máxima 700px | Full-width | Full-width |
| Rodapé | 4 colunas | 2x2 grid | 1 coluna |

### Dashboard

| Elemento | Desktop | Tablet | Mobile |
|----------|---------|--------|--------|
| Cards Resumo | 4 colunas | 2x2 grid | 1 coluna |
| Gráficos | 2 lado a lado | Empilhados | Empilhados |
| Calendário + Lista + Atividades | 3 colunas | Empilhados | Empilhados |

### Cadastro de Medicamentos

| Elemento | Desktop | Tablet | Mobile |
|----------|---------|--------|--------|
| Tabela | Colunas completas | Colunas essenciais | Cards empilhados |
| Filtros | Inline | Dropdown | Drawer |
| Modal | Centralizado, 500px | Centralizado, 90% | Fullscreen |
| Paginação | Completa | Completa | Simplificada |

### Alertas

| Elemento | Desktop | Tablet | Mobile |
|----------|---------|--------|--------|
| Tabs | Horizontais | Horizontais scrolláveis | Horizontais scrolláveis |
| Cards | 2 colunas | 1 coluna | 1 coluna |
| Ações do card | Inline | Dropdown | Dropdown |

### Relatórios

| Elemento | Desktop | Tablet | Mobile |
|----------|---------|--------|--------|
| Cards Resumo | 4 colunas | 2x2 | 1 coluna |
| Gráficos | Lado a lado | Empilhados | Empilhados |
| Tabela | Completa | Colunas essenciais | Cards |

### Configurações

| Elemento | Desktop | Tablet | Mobile |
|----------|---------|--------|--------|
| Abas | Horizontais | Horizontais scrolláveis | Horizontais scrolláveis |
| Formulários | 2 colunas | 1 coluna | 1 coluna |
| Seções | Empilhadas | Empilhadas | Empilhadas |

---

## Modais

### Comportamento por Dispositivo

| Dispositivo | Comportamento |
|-------------|---------------|
| Desktop | Centralizado, max-width definido, backdrop |
| Tablet | Centralizado, 90% da largura |
| Mobile | Fullscreen com header e footer |

### Animações de Modal

| Dispositivo | Animação |
|-------------|----------|
| Desktop | Fade-in + scale |
| Tablet | Slide-up |
| Mobile | Slide-up (full) |

---

## Navigation

### Desktop
- Sidebar sempre visível
- Todos os links visíveis
- Atalhos de teclado funcionais

### Tablet
- Sidebar como drawer
- Botão hamburguer no header
- Swipe para abrir/fechar sidebar

### Mobile
- Sidebar fullscreen
- Botão hamburguer no header
- Swipe para abrir/fechar
- Bottom navigation (alternativa)

---

## Touch Interactions (Mobile/Tablet)

| Elemento | Gestos |
|----------|--------|
| Sidebar | Swipe right para abrir, swipe left para fechar |
| Cards | Tap para ver detalhes |
| Listas | Swipe left para ações rápidas |
| Modais | Swipe down para fechar |
| Pull to refresh | Na página principal |

---

## Tipografia Responsiva

| Elemento | Desktop | Tablet | Mobile |
|----------|---------|--------|--------|
| H1 | 48px | 36px | 28px |
| H2 | 32px | 28px | 24px |
| H3 | 24px | 20px | 18px |
| Body | 16px | 16px | 14px |
| Small | 14px | 14px | 12px |

---

## Espaçamento Responsivo

| Elemento | Desktop | Tablet | Mobile |
|----------|---------|--------|--------|
| Container max-width | 1440px | 100% | 100% |
| Container padding | 32px | 24px | 16px |
| Card padding | 24px | 20px | 16px |
| Gap entre cards | 24px | 16px | 12px |

---

## Testes de Responsividade

### Checklist

- [ ] Landing Page renderiza corretamente em todos os breakpoints
- [ ] Sidebar funciona em desktop (recolhível) e mobile (drawer)
- [ ] Tabelas se transformam em cards no mobile
- [ ] Modais são fullscreen no mobile
- [ ] Gráficos são responsivos (empilham no mobile)
- [ ] Formulários são utilizáveis em telas pequenas
- [ ] Botões têm tamanho adequado para touch (min 44px)
- [ ] Texto é legível sem zoom
- [ ] Navegação por teclado funciona
- [ ] Animações são suaves em todos os dispositivos
- [ ] Dark mode funciona em todos os breakpoints

### Ferramentas de Teste

| Ferramenta | Uso |
|------------|-----|
| Chrome DevTools | Simulação de dispositivos |
| Responsively App | Visualização multi-dispositivo |
| BrowserStack | Testes em dispositivos reais |
| Lighthouse | Auditoria de performance mobile |
