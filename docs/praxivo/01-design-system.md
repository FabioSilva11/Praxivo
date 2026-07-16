# Praxivo - Design System

## Referências Visuais

O design do Praxivo é inspirado em:

| Referência | O que inspira |
|------------|---------------|
| **Linear** | Limpeza visual, espaçamento generoso, micro-animações |
| **Notion** | Organização em blocos, clareza tipográfica |
| **Vercel** | Minimalismo, bordas suaves, dark mode refinado |
| **Stripe Dashboard** | Cards de dados, gráficos elegantes, hierarquia visual |
| **Raycast** | Animações fluidas, transições suaves, sensação premium |

## Paleta de Cores

### Light Mode

| Cor | Uso | Hex |
|-----|-----|-----|
| **Azul Principal** | Botões primários, links, destaques | `#2563EB` |
| **Azul Claro** | Hover, fundos sutis | `#DBEAFE` |
| **Verde** | Indicadores positivos, sucesso, vencimento OK | `#16A34A` |
| **Verde Claro** | Fundo de badges positivos | `#DCFCE7` |
| **Amarelo** | Alertas, vencimento próximo | `#EAB308` |
| **Amarelo Claro** | Fundo de badges de alerta | `#FEF9C3` |
| **Vermelho** | Vencidos, erros, exclusão | `#DC2626` |
| **Vermelho Claro** | Fundo de badges de erro | `#FEE2E2` |
| **Cinza 50** | Fundo da página | `#F9FAFB` |
| **Cinza 100** | Fundo de cards | `#F3F4F6` |
| **Cinza 200** | Bordas leves | `#E5E7EB` |
| **Cinza 300** | Bordas médias | `#D1D5DB` |
| **Cinza 500** | Texto secundário | `#6B7280` |
| **Cinza 700** | Texto primário | `#374151` |
| **Cinza 900** | Texto forte/títulos | `#111827` |
| **Branco** | Fundo de cards, modais | `#FFFFFF` |

### Dark Mode

| Cor | Uso | Hex |
|-----|-----|-----|
| **Fundo Principal** | Background geral | `#0A0A0B` |
| **Fundo Cards** | Superfícies elevadas | `#18181B` |
| **Fundo Hover** | Estados interativos | `#27272A` |
| **Borda** | Separadores | `#27272A` |
| **Texto Primário** | Títulos, texto forte | `#FAFAFA` |
| **Texto Secundário** | Descrições, labels | `#A1A1AA` |
| **Texto Terciário** | Placeholder, muted | `#71717A` |
| **Azul Principal** | Mesmo do light mode | `#3B82F6` |
| **Verde** | Mesmo do light mode | `#22C55E` |
| **Amarelo** | Mesmo do light mode | `#FACC15` |
| **Vermelho** | Mesmo do light mode | `#EF4444` |

## Tipografia

### Fonte Principal
- **Família:** Inter (ou Geist do Vercel como alternativa)
- **Fallback:** system-ui, -apple-system, sans-serif

### Hierarquia

| Elemento | Peso | Tamanho | Cor |
|----------|------|---------|-----|
| H1 | 700 (Bold) | 36-48px | Cinza 900 / Branco (dark) |
| H2 | 600 (SemiBold) | 28-32px | Cinza 900 / Branco (dark) |
| H3 | 600 (SemiBold) | 20-24px | Cinza 700 / Cinza 100 (dark) |
| H4 | 500 (Medium) | 16-18px | Cinza 700 / Cinza 100 (dark) |
| Body | 400 (Regular) | 14-16px | Cinza 700 / Cinza 200 (dark) |
| Small | 400 (Regular) | 12-14px | Cinza 500 / Cinza 400 (dark) |
| Caption | 400 (Regular) | 10-12px | Cinza 500 / Cinza 400 (dark) |

## Espaçamento

| Token | Valor |
|-------|-------|
| `xs` | 4px |
| `sm` | 8px |
| `md` | 12px |
| `lg` | 16px |
| `xl` | 20px |
| `2xl` | 24px |
| `3xl` | 32px |
| `4xl` | 40px |
| `5xl` | 48px |
| `6xl` | 64px |

## Bordas

| Elemento | Radius |
|----------|--------|
| Botões | 8px |
| Inputs | 8px |
| Cards | 12px |
| Modais | 16px |
| Badges | 9999px (pill) |
| Avatares | 9999px (circular) |

## Sombras

### Light Mode
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04);
--shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04);
```

### Dark Mode
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.4);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.5);
--shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.5);
```

## Animações

| Animação | Duração | Uso |
|----------|---------|-----|
| `fade-in` | 200ms | Entrada de elementos |
| `slide-up` | 300ms | Cards, modais |
| `slide-in-left` | 300ms | Sidebar |
| `scale-in` | 200ms | Dropdowns, tooltips |
| `pulse` | 2s | Indicadores de notificação |
| `shimmer` | 1.5s | Loading skeletons |

**Easing padrão:** `cubic-bezier(0.4, 0, 0.2, 1)`

## Componentes Base

### Botões

| Variante | Fundo | Texto | Borda | Uso |
|----------|-------|-------|-------|-----|
| Primary | Azul | Branco | — | Ações principais |
| Secondary | Transparente | Azul | Azul | Ações alternativas |
| Ghost | Transparente | Cinza 700 | — | Ações neutras |
| Danger | Vermelho | Branco | — | Exclusões, ações destrutivas |
| Outline | Branco | Cinza 700 | Cinza 300 | Ações secundárias |

**Tamanhos:** Small (32px), Medium (40px), Large (48px)

### Inputs

- Borda Cinza 300 (light) / Cinza 700 (dark)
- Focus ring: Azul com 2px offset
- Placeholder: Cinza 400
- Label: Cinza 700, 14px, Medium

### Cards

- Fundo: Branco (light) / Cinza 800 (dark)
- Borda: 1px Cinza 200 (light) / Cinza 700 (dark)
- Padding: 24px
- Border-radius: 12px
- Shadow: `--shadow-sm` normal, `--shadow-md` hover

### Tabelas

- Header: Fundo Cinza 50 (light) / Cinza 800 (dark)
- Rows: Branco (light) / Cinza 900 (dark)
- Hover: Cinza 50 (light) / Cinza 800 (dark)
- Borda inferior: 1px Cinza 200
- Cells padding: 12px 16px

### Badges/Tags

- Pill shape (border-radius: 9999px)
- Variante por status: Verde (OK), Amarelo (Alerta), Vermelho (Vencido)
- Fonte: 12px, SemiBold
- Padding: 4px 10px

## Ícones

- Biblioteca sugerida: **Lucide React** ou **Phosphor Icons**
- Tamanho padrão: 20px
- Cor: herdada do contexto (texto ou cor explícita)
- Consistência: todos stroke-based, peso 1.5 ou 2

## Toggle Dark/Light Mode

- Localização: Header (ao lado do perfil) e nas Configurações
- Animação: transição suave de 300ms em todas as cores
- Persistência: salvar preferência no localStorage
- Detecção: respeitar `prefers-color-scheme` do sistema na primeira visita
