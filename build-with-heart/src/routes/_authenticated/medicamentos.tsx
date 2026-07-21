import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, MoreHorizontal, Search, Pencil, Trash2, Eye, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  diasAteValidade, statusValidade, isOperacional, formatBRL, formatDate,
  ESTADO_LABEL, UNIDADES, type Medicamento, type Estado,
} from "@/lib/praxivo";

export const Route = createFileRoute("/_authenticated/medicamentos")({
  head: () => ({ meta: [{ title: "Medicamentos — Praxivo" }] }),
  component: MedicamentosPage,
});

type MovAction = "transferir" | "doar" | "prioridade" | "descartar" | "lixo" | "baixa";

const FREE_LIMIT = 10;
const PAGE_SIZES = [10, 25, 50];

const TIPOS_QUANTIDADE = ["individual", "caixa", "frasco", "lote", "bloco"] as const;
const TEMPERATURAS = ["ambiente", "refrigerado", "congelado"] as const;
const TEMPERATURAS_LABEL = { ambiente: "15-30°C", refrigerado: "2-8°C", congelado: "-20°C" };

function MedicamentosPage() {
  const qc = useQueryClient();
  const { data: meds = [] } = useQuery({
    queryKey: ["medicamentos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("medicamentos").select("*").order("nome");
      if (error) throw error;
      return data as Medicamento[];
    },
  });

  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [estadoFilter, setEstadoFilter] = useState<string>("all");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Medicamento | null>(null);
  const [movOpen, setMovOpen] = useState(false);
  const [movTarget, setMovTarget] = useState<{ med: Medicamento; action: MovAction } | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailMed, setDetailMed] = useState<Medicamento | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const categorias = useMemo(() => Array.from(new Set(meds.map((m) => m.categoria))).sort(), [meds]);

  const filtered = meds.filter((m) => {
    const q = search.toLowerCase();
    if (q && ![m.nome, m.lote, m.fabricante].some((f) => f.toLowerCase().includes(q))) return false;
    if (categoriaFilter !== "all" && m.categoria !== categoriaFilter) return false;
    if (estadoFilter !== "all" && m.estado !== estadoFilter) return false;
    if (statusFilter !== "all") { const s = statusValidade(m.validade); if (statusFilter !== s) return false; }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const operacionaisCount = meds.filter(isOperacional).length;

  function toggleSelect(id: string) {
    setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  function toggleAll() {
    if (selected.size === paged.length && paged.length > 0) setSelected(new Set());
    else setSelected(new Set(paged.map((m) => m.id)));
  }

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const med = meds.find((m) => m.id === id);
      const { error } = await supabase.from("medicamentos").delete().eq("id", id);
      if (error) throw error;
      if (med) {
        await supabase.from("historico").insert({
          user_id: med.user_id, medicamento_id: null, medicamento_nome: med.nome,
          acao: "exclusao", descricao: `Excluiu ${med.nome} (lote ${med.lote})`,
          detalhes: { lote: med.lote, quantidade: med.quantidade },
        });
      }
    },
    onSuccess: () => { toast.success("Medicamento excluído"); qc.invalidateQueries({ queryKey: ["medicamentos"] }); qc.invalidateQueries({ queryKey: ["historico"] }); },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  const duplicateMut = useMutation({
    mutationFn: async (med: Medicamento) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { data, error } = await supabase.from("medicamentos").insert({
        user_id: user.id, nome: med.nome, categoria: med.categoria, fabricante: med.fabricante,
        lote: `${med.lote}-C${Date.now().toString().slice(-4)}`,
        quantidade: med.quantidade, tipo_quantidade: med.tipo_quantidade, unidade: med.unidade,
        fabricacao: med.fabricacao, validade: med.validade, local: med.local,
        lote_fornecedor: med.lote_fornecedor, registro_anvisa: med.registro_anvisa,
        prescricao_medica: med.prescricao_medica, temperatura_armazenamento: med.temperatura_armazenamento,
        valor_unitario: med.valor_unitario, observacoes: med.observacoes,
      }).select().single();
      if (error) throw error;
      await supabase.from("historico").insert({
        user_id: user.id, medicamento_id: data.id, medicamento_nome: data.nome,
        acao: "cadastro", descricao: `Duplicou ${data.nome} de ${med.lote} para ${data.lote}`,
        detalhes: { origem: med.lote, novo_lote: data.lote },
      });
    },
    onSuccess: () => { toast.success("Medicamento duplicado"); qc.invalidateQueries({ queryKey: ["medicamentos"] }); qc.invalidateQueries({ queryKey: ["historico"] }); },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Medicamentos</h1>
          <p className="text-sm text-muted-foreground">
            {operacionaisCount} de {FREE_LIMIT} operacionais · {meds.length} total
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setEditOpen(true); }} disabled={operacionaisCount >= FREE_LIMIT}>
          <Plus className="h-4 w-4" /> Novo lote
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Nome, lote ou fabricante" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
          <Select value={categoriaFilter} onValueChange={(v) => { setCategoriaFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categorias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Situação" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="valido">Válidos</SelectItem>
              <SelectItem value="vencendo">Vencendo</SelectItem>
              <SelectItem value="vencido">Vencidos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={estadoFilter} onValueChange={(v) => { setEstadoFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(ESTADO_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {selected.size > 0 && (
        <Card className="bg-primary/5 p-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-medium">{selected.size} selecionado{selected.size !== 1 ? "s" : ""}</span>
            <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>Limpar seleção</Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="w-10 p-3">
                  <Checkbox checked={paged.length > 0 && selected.size === paged.length} onCheckedChange={() => toggleAll()} />
                </th>
                <th className="p-3">Medicamento</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Lote</th>
                <th className="p-3">Reg. ANVISA</th>
                <th className="p-3 text-right">Qtd</th>
                <th className="p-3">Validade</th>
                <th className="p-3">Situação</th>
                <th className="p-3">Armazenamento</th>
                <th className="p-3">Local</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={11} className="p-6 text-center text-muted-foreground">Nenhum medicamento encontrado.</td></tr>
              ) : paged.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="p-3"><Checkbox checked={selected.has(m.id)} onCheckedChange={() => toggleSelect(m.id)} /></td>
                  <td className="p-3">
                    <div className="font-medium">{m.nome}</div>
                    <div className="text-xs text-muted-foreground">{m.fabricante}</div>
                  </td>
                  <td className="p-3">{m.categoria}</td>
                  <td className="p-3 font-mono text-xs">{m.lote}</td>
                  <td className="p-3 font-mono text-xs">{m.registro_anvisa || "—"}</td>
                  <td className="p-3 text-right">{Number(m.quantidade)} {m.unidade}</td>
                  <td className="p-3">{formatDate(m.validade)}</td>
                  <td className="p-3"><SituacaoBadge m={m} /></td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {m.temperatura_armazenamento && (
                        <span className="inline-flex rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{TEMPERATURAS_LABEL[m.temperatura_armazenamento as keyof typeof TEMPERATURAS_LABEL] ?? m.temperatura_armazenamento}</span>
                      )}
                      <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium ${m.prescricao_medica ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"}`}>
                        {m.prescricao_medica ? "Receita" : "Livre"}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">{m.local}</td>
                  <td className="p-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => { setDetailMed(m); setDetailOpen(true); }}><Eye className="h-4 w-4" /> Visualizar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setEditing(m); setEditOpen(true); }}><Pencil className="h-4 w-4" /> Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateMut.mutate(m)}><Copy className="h-4 w-4" /> Duplicar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Movimentação</DropdownMenuLabel>
                        {(["transferir", "doar", "prioridade", "descartar", "lixo", "baixa"] as MovAction[]).map((a) => (
                          <DropdownMenuItem key={a} onClick={() => { setMovTarget({ med: m, action: a }); setMovOpen(true); }}>
                            {labelAcao(a)}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("Excluir permanentemente?")) deleteMut.mutate(m.id); }}>
                          <Trash2 className="h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Mostrando {page * pageSize + 1}-{Math.min((page + 1) * pageSize, filtered.length)} de {filtered.length}</span>
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(0); }}>
            <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="px-2">{page + 1} / {totalPages || 1}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <MedicamentoDialog open={editOpen} onOpenChange={setEditOpen} editing={editing} operacionaisCount={operacionaisCount} />
      <MovimentacaoDialog open={movOpen} onOpenChange={setMovOpen} target={movTarget} />
      <DetalheDialog open={detailOpen} onOpenChange={setDetailOpen} med={detailMed} />
    </div>
  );
}

function SituacaoBadge({ m }: { m: Medicamento }) {
  if (!isOperacional(m)) {
    const tone: Record<string, string> = {
      operacional: "", prioridade: "bg-warning text-warning-foreground", transferido: "bg-purple text-purple-foreground",
      doado: "bg-info text-info-foreground", descartado: "bg-orange text-orange-foreground",
      lixo: "bg-muted text-muted-foreground", baixa: "bg-muted text-muted-foreground",
    };
    return <span className={`inline-flex rounded-md px-2 py-0.5 text-xs ${tone[m.estado] ?? ""}`}>{ESTADO_LABEL[m.estado]}</span>;
  }
  const s = statusValidade(m.validade);
  const d = diasAteValidade(m.validade);
  if (s === "vencido") return <Badge variant="destructive">Vencido ({d}d)</Badge>;
  if (s === "vencendo") return <span className="inline-flex rounded-md bg-warning px-2 py-0.5 text-xs text-warning-foreground">Vencendo ({d}d)</span>;
  return <span className="inline-flex rounded-md bg-success px-2 py-0.5 text-xs text-success-foreground">Válido ({d}d)</span>;
}

function labelAcao(a: MovAction): string {
  return { transferir: "Transferir", doar: "Marcar doação", prioridade: "Antecipar uso", descartar: "Descarte adequado", lixo: "Marcar como lixo", baixa: "Dar baixa" }[a];
}

function DetalheDialog({ open, onOpenChange, med }: { open: boolean; onOpenChange: (v: boolean) => void; med: Medicamento | null }) {
  if (!med) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{med.nome}</DialogTitle>
          <DialogDescription>Detalhes completos do medicamento.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Categoria:</span> {med.categoria}</div>
          <div><span className="text-muted-foreground">Fabricante:</span> {med.fabricante}</div>
          <div><span className="text-muted-foreground">Lote:</span> {med.lote}</div>
          <div><span className="text-muted-foreground">Quantidade:</span> {Number(med.quantidade)} {med.unidade}</div>
          <div><span className="text-muted-foreground">Tipo:</span> {med.tipo_quantidade}</div>
          <div><span className="text-muted-foreground">Local:</span> {med.local}</div>
          <div><span className="text-muted-foreground">Fabricação:</span> {formatDate(med.fabricacao)}</div>
          <div><span className="text-muted-foreground">Validade:</span> {formatDate(med.validade)}</div>
          <div><span className="text-muted-foreground">Valor unitário:</span> {formatBRL(med.valor_unitario)}</div>
          <div><span className="text-muted-foreground">Estado:</span> {ESTADO_LABEL[med.estado]}</div>
          {med.registro_anvisa && <div className="col-span-2"><span className="text-muted-foreground">Registro ANVISA:</span> {med.registro_anvisa}</div>}
          {med.lote_fornecedor && <div className="col-span-2"><span className="text-muted-foreground">Lote fornecedor:</span> {med.lote_fornecedor}</div>}
          {med.temperatura_armazenamento && <div><span className="text-muted-foreground">Temperatura:</span> {med.temperatura_armazenamento}</div>}
          <div><span className="text-muted-foreground">Prescrição:</span> {med.prescricao_medica ? "Sim" : "Não"}</div>
          {med.observacoes && <div className="col-span-2"><span className="text-muted-foreground">Obs:</span> {med.observacoes}</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MedicamentoDialog({ open, onOpenChange, editing, operacionaisCount }: {
  open: boolean; onOpenChange: (v: boolean) => void; editing: Medicamento | null; operacionaisCount: number;
}) {
  const qc = useQueryClient();
  const isEdit = !!editing;
  const [form, setForm] = useState(() => defaultForm(editing));
  const openKey = `${open}-${editing?.id ?? "new"}`;
  useMemo(() => setForm(defaultForm(editing)), [openKey]);

  const mut = useMutation({
    mutationFn: async () => {
      if (form.nome.trim().length < 2) throw new Error("Nome inválido");
      if (form.fabricante.trim().length < 2) throw new Error("Fabricante inválido");
      if (!form.lote.trim()) throw new Error("Lote é obrigatório");
      if (form.quantidade <= 0) throw new Error("Quantidade deve ser > 0");
      if (new Date(form.fabricacao) > new Date()) throw new Error("Fabricação não pode ser futura");
      if (new Date(form.validade) <= new Date(form.fabricacao)) throw new Error("Validade deve ser posterior à fabricação");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      if (isEdit && editing) {
        const { error } = await supabase.from("medicamentos").update({
          nome: form.nome, categoria: form.categoria, fabricante: form.fabricante, lote: form.lote,
          quantidade: form.quantidade, tipo_quantidade: form.tipo_quantidade, unidade: form.unidade,
          fabricacao: form.fabricacao, validade: form.validade, local: form.local,
          lote_fornecedor: form.lote_fornecedor || null, valor_unitario: form.valor_unitario,
          observacoes: form.observacoes || null, registro_anvisa: form.registro_anvisa || null,
          prescricao_medica: form.prescricao_medica, temperatura_armazenamento: form.temperatura_armazenamento || null,
        }).eq("id", editing.id);
        if (error) throw error;
        await supabase.from("historico").insert({
          user_id: user.id, medicamento_id: editing.id, medicamento_nome: form.nome,
          acao: "edicao", descricao: `Editou ${form.nome} (lote ${form.lote})`,
          detalhes: { antes: editing, depois: form },
        });
      } else {
        if (operacionaisCount >= FREE_LIMIT) throw new Error(`Limite grátis (${FREE_LIMIT}) atingido`);
        const { data, error } = await supabase.from("medicamentos").insert({
          user_id: user.id, nome: form.nome, categoria: form.categoria, fabricante: form.fabricante, lote: form.lote,
          quantidade: form.quantidade, tipo_quantidade: form.tipo_quantidade, unidade: form.unidade,
          fabricacao: form.fabricacao, validade: form.validade, local: form.local,
          lote_fornecedor: form.lote_fornecedor || null, valor_unitario: form.valor_unitario,
          observacoes: form.observacoes || null, registro_anvisa: form.registro_anvisa || null,
          prescricao_medica: form.prescricao_medica, temperatura_armazenamento: form.temperatura_armazenamento || null,
        }).select().single();
        if (error) throw error;
        await supabase.from("historico").insert({
          user_id: user.id, medicamento_id: data.id, medicamento_nome: data.nome,
          acao: "cadastro", descricao: `Cadastrou ${data.nome} (lote ${data.lote})`,
          detalhes: { quantidade: data.quantidade, validade: data.validade },
        });
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "Atualizado" : "Cadastrado");
      qc.invalidateQueries({ queryKey: ["medicamentos"] });
      qc.invalidateQueries({ queryKey: ["historico"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar lote" : "Novo lote"}</DialogTitle>
          <DialogDescription>Preencha os dados. Campos com * são obrigatórios.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nome *"><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></Field>
          <Field label="Categoria *"><Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Analgésico…" /></Field>
          <Field label="Fabricante *"><Input value={form.fabricante} onChange={(e) => setForm({ ...form, fabricante: e.target.value })} /></Field>
          <Field label="Lote *"><Input value={form.lote} onChange={(e) => setForm({ ...form, lote: e.target.value })} /></Field>
          <Field label="Quantidade *"><Input type="number" min={0} step="0.001" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })} /></Field>
          <Field label="Tipo">
            <Select value={form.tipo_quantidade} onValueChange={(v) => setForm({ ...form, tipo_quantidade: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIPOS_QUANTIDADE.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Unidade *">
            <Select value={form.unidade} onValueChange={(v) => setForm({ ...form, unidade: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{UNIDADES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Fabricação *"><Input type="date" value={form.fabricacao} onChange={(e) => setForm({ ...form, fabricacao: e.target.value })} /></Field>
          <Field label="Validade *"><Input type="date" value={form.validade} onChange={(e) => setForm({ ...form, validade: e.target.value })} /></Field>
          <Field label="Local *"><Input value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} placeholder="Prateleira A…" /></Field>
          <Field label="Lote fornec."><Input value={form.lote_fornecedor} onChange={(e) => setForm({ ...form, lote_fornecedor: e.target.value })} /></Field>
          <Field label="Registro ANVISA"><Input value={form.registro_anvisa} onChange={(e) => setForm({ ...form, registro_anvisa: e.target.value })} /></Field>
          <Field label="Valor unit. (R$)"><Input type="number" min={0} step="0.01" value={form.valor_unitario} onChange={(e) => setForm({ ...form, valor_unitario: Number(e.target.value) })} /></Field>
          <Field label="Temperatura">
            <Select value={form.temperatura_armazenamento} onValueChange={(v) => setForm({ ...form, temperatura_armazenamento: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {TEMPERATURAS.map((t) => <SelectItem key={t} value={t}>{t === "ambiente" ? "Ambiente (15-30°C)" : t === "refrigerado" ? "Refrigerado (2-8°C)" : "Congelado (-20°C)"}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Prescrição"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.prescricao_medica} onChange={(e) => setForm({ ...form, prescricao_medica: e.target.checked })} /> Requer prescrição</label></Field>
          <Field label="Observações" full><Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>{mut.isPending ? "Salvando…" : "Salvar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div className={`space-y-1 ${full ? "col-span-2" : ""}`}><Label className="text-xs">{label}</Label>{children}</div>;
}

function defaultForm(m: Medicamento | null) {
  const today = new Date().toISOString().slice(0, 10);
  const oneYear = new Date(); oneYear.setFullYear(oneYear.getFullYear() + 1);
  return {
    nome: m?.nome ?? "", categoria: m?.categoria ?? "Geral", fabricante: m?.fabricante ?? "",
    lote: m?.lote ?? "", quantidade: m ? Number(m.quantidade) : 1,
    tipo_quantidade: m?.tipo_quantidade ?? "individual", unidade: m?.unidade ?? "comprimido",
    fabricacao: m?.fabricacao ?? today, validade: m?.validade ?? oneYear.toISOString().slice(0, 10),
    local: m?.local ?? "Prateleira A", lote_fornecedor: m?.lote_fornecedor ?? "",
    registro_anvisa: m?.registro_anvisa ?? "", prescricao_medica: m?.prescricao_medica ?? false,
    temperatura_armazenamento: m?.temperatura_armazenamento ?? "ambiente",
    valor_unitario: m ? Number(m.valor_unitario) : 0, observacoes: m?.observacoes ?? "",
  };
}

function MovimentacaoDialog({ open, onOpenChange, target }: {
  open: boolean; onOpenChange: (v: boolean) => void; target: { med: Medicamento; action: MovAction } | null;
}) {
  const qc = useQueryClient();
  const [quantidade, setQuantidade] = useState<number>(0);
  const [destino, setDestino] = useState("");
  const [observacao, setObservacao] = useState("");
  useMemo(() => { setQuantidade(target ? Number(target.med.quantidade) : 0); setDestino(""); setObservacao(""); }, [target?.med.id, target?.action]);

  const mut = useMutation({
    mutationFn: async () => {
      if (!target) return;
      const { med, action } = target;
      const qtd = Number(quantidade);
      const disponivel = Number(med.quantidade);
      if (action !== "prioridade") { if (qtd <= 0) throw new Error("Quantidade > 0"); if (qtd > disponivel) throw new Error("Excede disponível"); }
      if (action === "transferir" && !destino.trim()) throw new Error("Informe destino");
      const restante = action === "prioridade" ? disponivel : disponivel - qtd;
      const totalSaida = action !== "prioridade" && qtd === disponivel;
      const estadoFinal: Estado = action === "prioridade" ? "prioridade" : totalSaida ?
        (action === "transferir" ? "transferido" : action === "doar" ? "doado" : action === "descartar" ? "descartado" : action === "lixo" ? "lixo" : "baixa") : "operacional";
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const updates: Partial<Medicamento> = { estado: estadoFinal };
      if (action !== "prioridade") updates.quantidade = restante;
      if (action === "transferir" && totalSaida) updates.local = destino;
      const { error } = await supabase.from("medicamentos").update(updates).eq("id", med.id);
      if (error) throw error;
      if (action === "transferir" && !totalSaida) {
        const { error: e2 } = await supabase.from("medicamentos").insert({
          user_id: user.id, nome: med.nome, categoria: med.categoria, fabricante: med.fabricante,
          lote: `${med.lote}-T${Date.now().toString().slice(-4)}`, quantidade: qtd, unidade: med.unidade,
          fabricacao: med.fabricacao, validade: med.validade, local: destino,
          lote_fornecedor: med.lote_fornecedor, valor_unitario: med.valor_unitario,
          observacoes: `Derivado de ${med.lote}`, estado: "transferido" as Estado,
          tipo_quantidade: med.tipo_quantidade, prescricao_medica: med.prescricao_medica,
        });
        if (e2) throw e2;
      }
      await supabase.from("historico").insert({
        user_id: user.id, medicamento_id: med.id, medicamento_nome: med.nome,
        acao: `mov_${action}`, descricao: `${labelAcao(action)} — ${med.nome} (lote ${med.lote})`,
        detalhes: { quantidade: action === "prioridade" ? null : qtd, destino: action === "transferir" ? destino : null, observacao, saldo: restante, estado_final: estadoFinal },
      });
    },
    onSuccess: () => { toast.success("Movimentação registrada"); qc.invalidateQueries({ queryKey: ["medicamentos"] }); qc.invalidateQueries({ queryKey: ["historico"] }); onOpenChange(false); },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  if (!target) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{labelAcao(target.action)}</DialogTitle>
          <DialogDescription>{target.med.nome} — lote {target.med.lote} · {Number(target.med.quantidade)} {target.med.unidade}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {target.action !== "prioridade" && (
            <Field label={`Quantidade (máx ${Number(target.med.quantidade)})`}>
              <Input type="number" min={0} step="0.001" max={Number(target.med.quantidade)} value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} />
            </Field>
          )}
          {target.action === "transferir" && <Field label="Destino"><Input value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="Prateleira B…" /></Field>}
          <Field label="Observação"><Textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
