import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Download, PillBottle, AlertTriangle, Heart, ArrowRightLeft, Trash2, TrendingUp } from "lucide-react";
import { downloadCSV, toCSV, formatBRL, formatDate, statusValidade, ESTADO_LABEL, type Medicamento } from "@/lib/praxivo";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — Praxivo" }] }),
  component: RelatoriosPage,
});

type Periodo = "7" | "30" | "90" | "365" | "all";
type TipoRel = "geral" | "vencidos" | "doados" | "transferidos" | "descartados" | "lixo" | "economia";

function RelatoriosPage() {
  const [periodo, setPeriodo] = useState<Periodo>("30");
  const [tipoRel, setTipoRel] = useState<TipoRel>("geral");

  const { data: meds = [] } = useQuery({
    queryKey: ["medicamentos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("medicamentos").select("*").order("nome");
      if (error) throw error;
      return data as Medicamento[];
    },
  });

  const hoje = new Date();
  const periodoLimite = periodo === "all" ? null : new Date(hoje.getTime() - Number(periodo) * 86400000);
  const filtrados = meds.filter((m) => {
    if (!periodoLimite) return true;
    return new Date(m.created_at) >= periodoLimite;
  });

  const filteredByType = filtrados.filter((m) => {
    if (tipoRel === "geral") return true;
    if (tipoRel === "vencidos") return statusValidade(m.validade) === "vencido";
    if (tipoRel === "doados") return m.estado === "doado";
    if (tipoRel === "transferidos") return m.estado === "transferido";
    if (tipoRel === "descartados") return m.estado === "descartado";
    if (tipoRel === "lixo") return m.estado === "lixo";
    if (tipoRel === "economia") return true;
    return true;
  });

  const ativos = filtrados.filter((m) => m.estado === "operacional" || m.estado === "prioridade");
  const vencidos = filtrados.filter((m) => statusValidade(m.validade) === "vencido");
  const doados = filtrados.filter((m) => m.estado === "doado");
  const transferidos = filtrados.filter((m) => m.estado === "transferido");
  const descartados = filtrados.filter((m) => m.estado === "descartado");
  const lixo = filtrados.filter((m) => m.estado === "lixo");
  const totalValor = filtrados.reduce((s, m) => s + Number(m.quantidade) * Number(m.valor_unitario), 0);
  const valorDesperdicado = [...descartados, ...lixo].reduce((s, m) => s + Number(m.quantidade) * Number(m.valor_unitario), 0);
  const economia = totalValor - valorDesperdicado;

  const porCategoria = filtrados.reduce<Record<string, number>>((acc, m) => {
    acc[m.categoria] = (acc[m.categoria] ?? 0) + 1;
    return acc;
  }, {});

  const donutData = [
    { name: "Válidos", value: ativos.length, color: "hsl(var(--chart-2))" },
    { name: "Vencendo", value: filtrados.filter((m) => statusValidade(m.validade) === "vencendo").length, color: "hsl(var(--chart-3))" },
    { name: "Vencidos", value: vencidos.length, color: "hsl(var(--chart-4))" },
    { name: "Descartados", value: descartados.length, color: "hsl(var(--chart-5))" },
  ];

  const catData = Object.entries(porCategoria)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  const taxaDesperdicio = filtrados.length > 0 ? ((descartados.length + lixo.length) / filtrados.length * 100).toFixed(1) : "0";

  const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const evolucaoMensal = filtrados.reduce<Record<string, number>>((acc, m) => {
    const mes = m.created_at?.slice(0, 7);
    if (mes) acc[mes] = (acc[mes] ?? 0) + 1;
    return acc;
  }, {});
  const evolucaoData = Object.entries(evolucaoMensal).sort().map(([k, v]) => {
    const [ano, mes] = k.split("-");
    return { mes: `${MESES[Number(mes) - 1]}/${ano}`, count: v };
  });

  const economiaMensal = filtrados.reduce<Record<string, number>>((acc, m) => {
    if (m.estado === "operacional" || m.estado === "prioridade") {
      const mes = m.created_at?.slice(0, 7);
      if (mes) acc[mes] = (acc[mes] ?? 0) + Number(m.quantidade) * Number(m.valor_unitario);
    }
    return acc;
  }, {});
  const economiaData = Object.entries(economiaMensal).sort().map(([k, v]) => {
    const [ano, mes] = k.split("-");
    return { mes: `${MESES[Number(mes) - 1]}/${ano}`, valor: v };
  });

  function exportarDados() {
    const rows: (string | number)[][] = [[
      "Nome", "Categoria", "Fabricante", "Lote", "Quantidade", "Unidade",
      "Fabricação", "Validade", "Situação", "Estado", "Local", "Valor unitário", "Valor total",
    ]];
    for (const m of filteredByType) {
      rows.push([
        m.nome, m.categoria, m.fabricante, m.lote,
        Number(m.quantidade), m.unidade,
        formatDate(m.fabricacao), formatDate(m.validade),
        statusValidade(m.validade), ESTADO_LABEL[m.estado],
        m.local, Number(m.valor_unitario).toFixed(2),
        (Number(m.quantidade) * Number(m.valor_unitario)).toFixed(2),
      ]);
    }
    downloadCSV(`praxivo-relatorio-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(rows));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Análise detalhada do inventário.</p>
        </div>
        <Button onClick={exportarDados}><Download className="h-4 w-4" /> Exportar CSV</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={periodo} onValueChange={(v) => setPeriodo(v as Periodo)}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Período" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
            <SelectItem value="all">Todo período</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tipoRel} onValueChange={(v) => setTipoRel(v as TipoRel)}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="geral">Geral</SelectItem>
            <SelectItem value="vencidos">Vencidos</SelectItem>
            <SelectItem value="doados">Doados</SelectItem>
            <SelectItem value="transferidos">Transferidos</SelectItem>
            <SelectItem value="descartados">Descartados</SelectItem>
            <SelectItem value="lixo">Lixo</SelectItem>
            <SelectItem value="economia">Economia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SumCard icon={<PillBottle className="h-4 w-4" />} title="Total" value={filtrados.length} />
        <SumCard icon={<AlertTriangle className="h-4 w-4 text-destructive" />} title="Vencidos" value={vencidos.length} />
        <SumCard icon={<Heart className="h-4 w-4 text-info" />} title="Doados" value={doados.length} />
        <SumCard icon={<TrendingUp className="h-4 w-4 text-success" />} title="Economia" value={formatBRL(economia)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Distribuição por Status</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                    {donutData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Por Categoria</CardTitle></CardHeader>
          <CardContent>
            {catData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sem dados.</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={catData} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Evolução Mensal</CardTitle></CardHeader>
          <CardContent>
            {evolucaoData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sem dados.</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolucaoData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} name="Medicamentos" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Economia por Mês</CardTitle></CardHeader>
          <CardContent>
            {economiaData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sem dados.</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={economiaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v: number) => formatBRL(v)} />
                    <Tooltip formatter={(v: number) => formatBRL(v)} />
                    <Bar dataKey="valor" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Economia" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Taxa de Desperdício</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-destructive">{taxaDesperdicio}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Valor em Estoque</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatBRL(totalValor)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Valor Desperdiçado</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-warning">{formatBRL(valorDesperdicado)}</div></CardContent>
        </Card>
      </div>

      {filteredByType.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Dados Detalhados</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr><th className="py-2">Medicamento</th><th>Categoria</th><th className="text-right">Qtd</th><th>Validade</th><th>Status</th><th className="text-right">Valor</th></tr>
                </thead>
                <tbody>
                  {filteredByType.slice(0, 50).map((m) => (
                    <tr key={m.id} className="border-t">
                      <td className="py-2">{m.nome}</td>
                      <td className="py-2">{m.categoria}</td>
                      <td className="py-2 text-right">{Number(m.quantidade)} {m.unidade}</td>
                      <td className="py-2">{formatDate(m.validade)}</td>
                      <td className="py-2"><BadgeStatus estado={m.estado} /></td>
                      <td className="py-2 text-right">{formatBRL(Number(m.quantidade) * Number(m.valor_unitario))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredByType.length > 50 && (
                <p className="mt-2 text-xs text-muted-foreground">Mostrando 50 de {filteredByType.length} registros.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SumCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        {icon}
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
    </Card>
  );
}

function BadgeStatus({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    operacional: "bg-success/10 text-success",
    prioridade: "bg-warning/10 text-warning",
    transferido: "bg-purple/10 text-purple",
    doado: "bg-info/10 text-info",
    descartado: "bg-orange/10 text-orange",
    lixo: "bg-muted text-muted-foreground",
    baixa: "bg-muted text-muted-foreground",
  };
  return <span className={`inline-block rounded-md px-2 py-0.5 text-xs ${map[estado] ?? ""}`}>{ESTADO_LABEL[estado as keyof typeof ESTADO_LABEL] ?? estado}</span>;
}
