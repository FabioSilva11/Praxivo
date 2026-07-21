import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { diasAteValidade, isOperacional, prioridadeAlerta, formatDate, ESTADO_LABEL, type Medicamento, type Estado } from "@/lib/praxivo";
import { AlertTriangle, AlertCircle, Clock, Search, CheckCircle2, Heart, XCircle, CornerUpRight, Trash2, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/alertas")({
  head: () => ({ meta: [{ title: "Alertas — Praxivo" }] }),
  component: AlertasPage,
});

const PRIORIDADE_TABS = [
  { key: "todas", label: "Todos" },
  { key: "critica", label: "Crítico" },
  { key: "alta", label: "Alta" },
  { key: "media", label: "Média" },
  { key: "baixa", label: "Baixa" },
] as const;

const PRIORIDADE_CORES: Record<string, { cor: string; bg: string; border: string; label: string }> = {
  critica: { cor: "text-destructive", bg: "bg-destructive/10", border: "border-l-destructive", label: "Crítico" },
  alta: { cor: "text-orange", bg: "bg-orange/10", border: "border-l-orange", label: "Alta" },
  media: { cor: "text-warning", bg: "bg-warning/10", border: "border-l-warning", label: "Média" },
  baixa: { cor: "text-info", bg: "bg-info/10", border: "border-l-info", label: "Baixa" },
};

type AcaoRapida = "doar" | "descartar" | "lixo" | "transferir" | "prioridade";

function AlertasPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("todas");
  const [search, setSearch] = useState("");
  const [acaoTarget, setAcaoTarget] = useState<{ med: Medicamento; acao: AcaoRapida } | null>(null);

  const { data: meds = [] } = useQuery({
    queryKey: ["medicamentos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("medicamentos").select("*").order("validade");
      if (error) throw error;
      return data as Medicamento[];
    },
  });

  const operacionais = meds.filter(isOperacional);
  const criticos = operacionais.filter((m) => prioridadeAlerta(m.validade) === "critica");
  const altos = operacionais.filter((m) => prioridadeAlerta(m.validade) === "alta");
  const medios = operacionais.filter((m) => prioridadeAlerta(m.validade) === "media");
  const baixos = operacionais.filter((m) => prioridadeAlerta(m.validade) === "baixa");

  const prioridadeMap: Record<string, Medicamento[]> = {
    todas: operacionais, critica: criticos, alta: altos, media: medios, baixa: baixos,
  };

  const filtered = (prioridadeMap[tab] ?? operacionais).filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [m.nome, m.lote, m.fabricante].some((f) => f.toLowerCase().includes(q));
  });

  const totalAlertas = operacionais.length;

  if (totalAlertas === 0) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold tracking-tight">Alertas</h1><p className="text-sm text-muted-foreground">Priorização por proximidade do vencimento.</p></div>
        <Card className="border-success/30 bg-success/5">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-success" />
            <h3 className="text-lg font-semibold text-success">Nenhum alerta no momento!</h3>
            <p className="text-sm text-muted-foreground">Todos os seus medicamentos estão dentro do prazo de validade.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alertas</h1>
          <p className="text-sm text-muted-foreground">{totalAlertas} alerta{totalAlertas !== 1 ? "s" : ""} ativo{totalAlertas !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {PRIORIDADE_TABS.map((p) => (
              <TabsTrigger key={p.key} value={p.key} className="gap-1">
                {p.label}
                {p.key !== "todas" && (
                  <Badge variant="outline" className="ml-1 text-xs">{prioridadeMap[p.key]?.length ?? 0}</Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative ml-auto">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar alertas..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-8 w-[200px]" />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Nenhum alerta encontrado para este filtro.</CardContent></Card>
        ) : filtered.map((m) => {
          const p = prioridadeAlerta(m.validade);
          const d = diasAteValidade(m.validade);
          const estilo = PRIORIDADE_CORES[p] ?? PRIORIDADE_CORES.baixa;
          const podeDoar = d > 0 && m.estado === "operacional";

          return (
            <Card key={m.id} className={`border-l-4 ${estilo.border} transition-shadow hover:shadow-md`}>
              <CardContent className="flex flex-wrap items-start justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={estilo.cor}>
                      {p === "critica" ? <AlertCircle className="h-5 w-5" /> : p === "alta" ? <AlertTriangle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    </span>
                    <h3 className="font-semibold">{m.nome}</h3>
                    <Badge variant="outline" className={`text-xs ${estilo.cor}`}>{estilo.label}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Lote: {m.lote}</span>
                    <span>Qtd: {Number(m.quantidade)} {m.unidade}</span>
                    <span>Local: {m.local}</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">{formatDate(m.validade)}</span>
                    <span className={`ml-2 ${estilo.cor}`}>
                      {d < 0 ? `Vencido há ${Math.abs(d)}d` : d === 0 ? "Vence hoje!" : `Em ${d}d`}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button size="sm" variant="ghost" asChild><Link to="/medicamentos">Ver Detalhes</Link></Button>
                  {podeDoar && (
                    <Button size="sm" variant="outline" className="text-info" onClick={() => setAcaoTarget({ med: m, acao: "doar" })}>
                      <Heart className="h-3 w-3" /> Doar
                    </Button>
                  )}
                  {d > 0 && (
                    <Button size="sm" variant="outline" className="text-warning" onClick={() => setAcaoTarget({ med: m, acao: "prioridade" })}>
                      <Clock className="h-3 w-3" /> Antecipar
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setAcaoTarget({ med: m, acao: "transferir" })}>
                    <ArrowRightLeft className="h-3 w-3" /> Transferir
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => setAcaoTarget({ med: m, acao: "descartar" })}>
                    <XCircle className="h-3 w-3" /> Descartar
                  </Button>
                  <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setAcaoTarget({ med: m, acao: "lixo" })}>
                    <Trash2 className="h-3 w-3" /> Lixo
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AcaoRapidaDialog target={acaoTarget} onClose={() => setAcaoTarget(null)} />
    </div>
  );
}

function AcaoRapidaDialog({ target, onClose }: { target: { med: Medicamento; acao: AcaoRapida } | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [motivo, setMotivo] = useState("");

  const mut = useMutation({
    mutationFn: async () => {
      if (!target) return;
      const { med, acao } = target;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      if (acao === "doar" && diasAteValidade(med.validade) < 0) {
        throw new Error("Medicamentos vencidos ou expirados não podem ser doados. Utilize a opção 'Descartar'.");
      }

      const estadoMap: Record<string, Estado> = {
        doar: "doado", descartar: "descartado", lixo: "lixo", transferir: "transferido", prioridade: "prioridade",
      };

      const { error } = await supabase.from("medicamentos").update({ estado: estadoMap[acao] ?? "operacional" }).eq("id", med.id);
      if (error) throw error;

      await supabase.from("historico").insert({
        user_id: user.id, medicamento_id: med.id, medicamento_nome: med.nome,
        acao: `mov_${acao}`,
        descricao: `${acao === "doar" ? "Doou" : acao === "descartar" ? "Descartou" : acao === "lixo" ? "Descartou no lixo" : acao === "transferir" ? "Transferiu" : "Antecipou uso"} ${med.nome} (lote ${med.lote})`,
        detalhes: { acao, motivo: motivo || null },
      });
    },
    onSuccess: () => {
      toast.success("Ação registrada");
      qc.invalidateQueries({ queryKey: ["medicamentos"] });
      qc.invalidateQueries({ queryKey: ["historico"] });
      onClose();
    },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  if (!target) return null;

  const tituloMap: Record<string, string> = {
    doar: "Marcar para Doação", descartar: "Descartar Medicamento", lixo: "Marcar como Lixo",
    transferir: "Transferir Medicamento", prioridade: "Antecipar Uso",
  };

  return (
    <Dialog open={!!target} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tituloMap[target.acao]}</DialogTitle>
          <DialogDescription>{target.med.nome} — lote {target.med.lote} · {Number(target.med.quantidade)} {target.med.unidade}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Observação / Motivo</Label>
            <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Informe o motivo" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AlertasPage;
