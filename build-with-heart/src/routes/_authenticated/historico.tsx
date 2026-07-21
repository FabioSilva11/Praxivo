import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatDateTime, type Historico } from "@/lib/praxivo";
import { Search, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/historico")({
  head: () => ({ meta: [{ title: "Histórico — Praxivo" }] }),
  component: HistoricoPage,
});

const ACAO_CORES: Record<string, { cor: string; icon: string }> = {
  cadastro: { cor: "border-l-success", icon: "🟢" },
  edicao: { cor: "border-l-info", icon: "🔵" },
  exclusao: { cor: "border-l-destructive", icon: "🔴" },
  mov_descar: { cor: "border-l-orange", icon: "🟠" },
  mov_lixo: { cor: "border-l-muted-foreground", icon: "⚪" },
  mov_doar: { cor: "border-l-info", icon: "💚" },
  mov_transferir: { cor: "border-l-purple", icon: "🟣" },
  mov_prioridade: { cor: "border-l-warning", icon: "🟡" },
  mov_baixa: { cor: "border-l-muted-foreground", icon: "⚫" },
};

function acaoStyle(acao: string) {
  for (const [k, v] of Object.entries(ACAO_CORES)) {
    if (acao.startsWith(k.replace("mov_", "mov_"))) return v;
    if (acao === k) return v;
    if (acao.startsWith("mov_") && k.startsWith("mov_") && acao.includes(k.replace("mov_", ""))) return v;
  }
  return { cor: "border-l-muted", icon: "📋" };
}

function labelAcao(acao: string): string {
  const map: Record<string, string> = {
    cadastro: "Cadastro",
    edicao: "Edição",
    exclusao: "Exclusão",
    mov_transferir: "Transferência",
    mov_doar: "Doação",
    mov_prioridade: "Antecipar Uso",
    mov_descar: "Descarte",
    mov_lixo: "Lixo",
    mov_baixa: "Baixa",
  };
  return map[acao] ?? acao;
}

function HistoricoPage() {
  const [search, setSearch] = useState("");
  const [acaoFilter, setAcaoFilter] = useState("all");

  const { data: hist = [] } = useQuery({
    queryKey: ["historico"],
    queryFn: async () => {
      const { data, error } = await supabase.from("historico").select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data as Historico[];
    },
  });

  const filtered = hist.filter((h) => {
    if (acaoFilter !== "all" && !h.acao.startsWith(acaoFilter) && h.acao !== acaoFilter) {
      if (acaoFilter === "movimentacao" && !h.acao.startsWith("mov_")) return false;
      if (acaoFilter !== "movimentacao") return false;
    }
    if (search) {
      const q = search.toLowerCase();
      if (!h.descricao.toLowerCase().includes(q) && !(h.medicamento_nome ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Histórico de Atividades</h1>
          <p className="text-sm text-muted-foreground">Últimas {hist.length} movimentações.</p>
        </div>
        {acaoFilter !== "all" || search ? (
          <Button variant="ghost" size="sm" onClick={() => { setAcaoFilter("all"); setSearch(""); }}>
            <RotateCcw className="h-4 w-4" /> Limpar filtros
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar atividades..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={acaoFilter} onValueChange={setAcaoFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo de ação" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas ações</SelectItem>
            <SelectItem value="cadastro">Cadastros</SelectItem>
            <SelectItem value="edicao">Edições</SelectItem>
            <SelectItem value="exclusao">Exclusões</SelectItem>
            <SelectItem value="movimentacao">Movimentações</SelectItem>
            <SelectItem value="mov_transferir">Transferências</SelectItem>
            <SelectItem value="mov_doar">Doações</SelectItem>
            <SelectItem value="mov_descar">Descartes</SelectItem>
            <SelectItem value="mov_prioridade">Antecipações</SelectItem>
            <SelectItem value="mov_baixa">Baixas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="divide-y">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {hist.length === 0 ? "Nenhuma atividade registrada ainda." : "Nenhuma atividade encontrada para este filtro."}
          </div>
        ) : filtered.map((h) => {
          const style = acaoStyle(h.acao);
          return (
            <div key={h.id} className={`border-l-4 ${style.cor} p-4`}>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-base">{style.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{h.descricao}</div>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{labelAcao(h.acao)}</span>
                    {h.medicamento_nome && <span>· {h.medicamento_nome}</span>}
                  </div>
                </div>
                <div className="shrink-0 text-right text-xs text-muted-foreground">
                  {formatDateTime(h.created_at)}
                </div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
