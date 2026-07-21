import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  diasAteValidade, statusValidade, isOperacional, formatBRL, formatDate, formatDateTime,
  type Medicamento, type Historico,
} from "@/lib/praxivo";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Plus, PillBottle, Clock, AlertTriangle, TrendingUp, PackageOpen, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Praxivo" }] }),
  component: Dashboard,
});

const FREE_LIMIT = 10;
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function Dashboard() {
  const { data: meds = [], isLoading: loadingMeds } = useQuery({
    queryKey: ["medicamentos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("medicamentos").select("*").order("validade");
      if (error) throw error;
      return data as Medicamento[];
    },
  });

  const { data: hist = [] } = useQuery({
    queryKey: ["historico-recent"],
    queryFn: async () => {
      const { data, error } = await supabase.from("historico").select("*").order("created_at", { ascending: false }).limit(6);
      if (error) throw error;
      return data as Historico[];
    },
  });

  const operacionais = meds.filter(isOperacional);
  const validos = operacionais.filter((m) => statusValidade(m.validade) === "valido");
  const vencendo = operacionais.filter((m) => statusValidade(m.validade) === "vencendo");
  const vencidos = operacionais.filter((m) => statusValidade(m.validade) === "vencido");
  const valorEstoque = operacionais.reduce((sum, m) => sum + Number(m.quantidade) * Number(m.valor_unitario), 0);
  const economia = valorEstoque;
  const proximos = [...operacionais].sort((a, b) => a.validade.localeCompare(b.validade)).slice(0, 10);

  // Categorias
  const catCount = meds.reduce<Record<string, number>>((acc, m) => {
    acc[m.categoria] = (acc[m.categoria] ?? 0) + 1;
    return acc;
  }, {});
  const catColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
  const catData = Object.entries(catCount).map(([name, value], i) => ({ name, value, color: catColors[i % catColors.length] }));

  // Validade por mês (próximos 6 meses)
  const hoje = new Date();
  const mesesData = Array.from({ length: 6 }, (_, i) => {
    const mesRef = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    const mesStr = `${mesRef.getFullYear()}-${String(mesRef.getMonth() + 1).padStart(2, "0")}`;
    const count = operacionais.filter((m) => m.validade.startsWith(mesStr)).length;
    return { name: MESES[mesRef.getMonth()], value: count };
  });

  // Calendário
  const [calMonth, setCalMonth] = useState(hoje.getMonth());
  const [calYear, setCalYear] = useState(hoje.getFullYear());
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const hojeStr = hoje.toISOString().slice(0, 10);
  const calDays = operacionais.reduce<Record<string, string[]>>((acc, m) => {
    const d = m.validade.slice(0, 10);
    if (!acc[d]) acc[d] = [];
    acc[d].push(m.nome);
    return acc;
  }, {});

  const acaoIcon: Record<string, string> = {
    cadastro: "🟢", edicao: "🔵", exclusao: "🔴", mov_descar: "🟠", mov_lixo: "⚪",
    mov_doar: "💚", mov_transferir: "🟣", mov_prioridade: "🟡", mov_baixa: "⚫",
  };

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "agora";
    if (min < 60) return `há ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `há ${h}h`;
    const d = Math.floor(h / 24);
    if (d < 7) return `há ${d}d`;
    return formatDateTime(iso);
  }

  if (loadingMeds) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-48" /><Skeleton className="mt-1 h-4 w-64" /></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Situação atual do estoque.</p>
        </div>
        <Button asChild size="sm"><Link to="/medicamentos"><Plus className="h-4 w-4" /> Novo Medicamento</Link></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<PillBottle className="h-5 w-5 text-primary" />} title="Medicamentos Cadastrados" value={operacionais.length} sub={`+${vencendo.length} este mês`} />
        <StatCard icon={<Clock className="h-5 w-5 text-warning" />} title="Próximos do Vencimento" value={vencendo.length} sub="Próximos 30 dias" tone="warning" />
        <StatCard icon={<AlertTriangle className="h-5 w-5 text-destructive" />} title="Vencidos" value={vencidos.length} sub="Requer ação" tone="destructive" />
        <StatCard icon={<TrendingUp className="h-5 w-5 text-success" />} title="Economia Estimada" value={formatBRL(economia)} sub="vs. mês anterior" tone="success" />
      </div>

      {meds.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <PackageOpen className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Comece cadastrando seu primeiro medicamento</h3>
            <p className="text-sm text-muted-foreground">Adicione medicamentos para monitorar validades, receber alertas e gerar relatórios.</p>
            <Button asChild><Link to="/medicamentos"><Plus className="h-4 w-4" /> Cadastrar Medicamento</Link></Button>
          </CardContent>
        </Card>
      )}

      {meds.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Próximos vencimentos</CardTitle></CardHeader>
            <CardContent>
              {proximos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum item operacional cadastrado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground">
                      <tr><th className="py-2">Medicamento</th><th>Lote</th><th>Validade</th><th className="text-right">Dias</th></tr>
                    </thead>
                    <tbody>
                      {proximos.map((m) => {
                        const d = diasAteValidade(m.validade);
                        const s = statusValidade(m.validade);
                        return (
                          <tr key={m.id} className="border-t">
                            <td className="py-2 font-medium">{m.nome}</td>
                            <td className="py-2 font-mono text-xs">{m.lote}</td>
                            <td className="py-2">{formatDate(m.validade)}</td>
                            <td className="py-2 text-right">
                              <Badge variant={s === "vencido" ? "destructive" : s === "vencendo" ? "secondary" : "outline"}>
                                {d < 0 ? `Vencido há ${Math.abs(d)}d` : d === 0 ? "Hoje!" : `Em ${d}d`}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {proximos.length >= 10 && (
                    <div className="mt-3 text-right"><Button variant="link" size="sm" asChild><Link to="/alertas">Ver todos os alertas →</Link></Button></div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Distribuição</CardTitle></CardHeader>
              <CardContent>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={catData.length > 0 ? catData : [{ name: "Sem dados", value: 1, color: "hsl(var(--muted))" }]} innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                        {catData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 rounded-md bg-muted p-3 text-sm">
                  <div className="text-muted-foreground">Valor estimado em estoque</div>
                  <div className="text-lg font-semibold">{formatBRL(valorEstoque)}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Atividades recentes</CardTitle></CardHeader>
              <CardContent>
                {hist.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
                ) : (
                  <ul className="space-y-2">
                    {hist.map((h) => {
                      const icon = Object.entries(acaoIcon).find(([k]) => h.acao.includes(k.replace("mov_", ""))) ?? ["", "📋"];
                      return (
                        <li key={h.id} className="flex gap-2 text-sm">
                          <span className="mt-0.5 shrink-0">{icon[1] || "📋"}</span>
                          <div className="min-w-0">
                            <p className="truncate">{h.descricao}</p>
                            <p className="text-xs text-muted-foreground">{timeAgo(h.created_at)}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {hist.length > 0 && (
                  <div className="mt-3"><Button variant="link" size="sm" asChild><Link to="/historico">Ver histórico completo →</Link></Button></div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {meds.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Validade por Mês</CardTitle></CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mesesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {mesesData.map((_, i) => (
                        <Cell key={i} fill={i < 2 ? "hsl(var(--chart-3))" : i < 4 ? "hsl(var(--chart-2))" : "hsl(var(--chart-1))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Calendário de Vencimentos</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{MESES[calMonth]} {calYear}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {DIAS_SEMANA.map((d) => <div key={d} className="py-1 font-medium text-muted-foreground">{d}</div>)}
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const d = i + 1;
                  const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                  const hasExpiry = dateStr in calDays;
                  const isToday = dateStr === hojeStr;
                  return (
                    <div key={d} className={`relative py-1.5 text-sm ${isToday ? "rounded-md bg-primary font-bold text-primary-foreground" : hasExpiry ? "rounded-md bg-warning/20 font-medium" : ""}`}>
                      {d}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-warning/40" /> Vencendo</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-primary" /> Hoje</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, sub, tone }: { icon: React.ReactNode; title: string; value: string | number; sub?: string; tone?: "success" | "warning" | "destructive" }) {
  const toneCls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${toneCls}`}>{value}</div>
        {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}
