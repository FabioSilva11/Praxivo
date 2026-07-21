# Praxivo — versão web

Reimplemento o Praxivo Desktop como aplicação web usando TanStack Start + Lovable Cloud (Postgres com RLS). Mantenho o design system dos documentos (Segoe UI, paleta azul, layout com sidebar) e a lógica de negócio (estados de validade, movimentações, limite free 10 lotes).

## Stack e infraestrutura

- **Frontend**: TanStack Start, Tailwind v4, shadcn/ui, sidebar shadcn
- **Backend**: Lovable Cloud (Postgres, Auth email/senha, RLS)
- **Auth**: email + senha (sem OAuth — segue o modelo local do produto original)

## Schema (Postgres com RLS por `auth.uid()`)

```text
profiles          id, user_id, nome, telefone, cargo, empresa, cnpj, endereco, bio, theme, primary_color, alerts_enabled
categorias        id, user_id, nome
locais            id, user_id, nome
medicamentos      id, user_id, nome, categoria, fabricante, lote (unique/user),
                  quantidade, unidade, fabricacao, validade, local,
                  lote_fornecedor, valor_unitario, observacoes, estado, created_at
historico         id, user_id, medicamento_id, medicamento_nome, acao,
                  descricao, detalhes (jsonb), created_at
```

Todas as tabelas têm `GRANT` para `authenticated` + `service_role` e policies escopadas ao dono.

## Rotas

- `/` — landing/redirect (envia para `/auth` ou `/dashboard`)
- `/auth` — login + cadastro (nome, email, senha 8+)
- `/_authenticated/dashboard` — cards, próximos vencimentos, gráfico donut, valor estimado
- `/_authenticated/medicamentos` — tabela + filtros + diálogo cadastro/edição + movimentações (transferir, doar, priorizar, descartar, lixo, baixa)
- `/_authenticated/alertas` — lista priorizada (crítica/alta/média/baixa)
- `/_authenticated/relatorios` — filtros, resumo, tabela, exportar CSV
- `/_authenticated/historico` — log de eventos com filtros e detalhes JSON
- `/_authenticated/configuracoes` — perfil, aparência (tema/cor), segurança (trocar senha), preferências

## Design system

Aplico as cores do doc 01 em `src/styles.css` como tokens oklch (claro/escuro), fontes Segoe UI/Inter, raios (cards 12px, campos 8px), estados de validade como variantes semânticas (`valido`, `vencendo`, `vencido`, `transferido`, `doado`, `descartado`, `baixa`).

## O que fica fora do MVP web

- PDF Pro, licenciamento Ed25519, limite de 10 (deixo a UI mas sem paywall real)
- Backup `.db` local — dados vivem na Cloud
- Notificações desktop nativas

## Passos de implementação

1. Habilito Lovable Cloud
2. Migrations: enums + tabelas + RLS + trigger de perfil no signup
3. Design system em `src/styles.css`
4. Layout autenticado com sidebar (Dashboard, Medicamentos, Alertas, Relatórios, Histórico, Configurações)
5. Auth (`/auth`) + gate `_authenticated`
6. Medicamentos: CRUD + diálogo de movimentação (grava histórico)
7. Dashboard, Alertas, Relatórios (com CSV), Histórico, Configurações
8. Metadados de rota (títulos/description), sitemap, robots

Confirma que sigo por aí?
