import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatBRL, type Medicamento } from "@/lib/praxivo";
import { TrendingUp, Shield, CheckCircle, DollarSign, CreditCard, FileText, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — Praxivo" }] }),
  component: FinanceiroPage,
});

function FinanceiroPage() {
  const [tab, setTab] = useState("metricas");

  const { data: meds = [] } = useQuery({
    queryKey: ["medicamentos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("medicamentos").select("*").order("nome");
      if (error) throw error;
      return data as Medicamento[];
    },
  });

  const ativos = meds.filter((m) => m.estado === "operacional" || m.estado === "prioridade");
  const descartados = meds.filter((m) => m.estado === "descartado" || m.estado === "lixo");
  const doados = meds.filter((m) => m.estado === "doado");

  const valorEmEstoque = ativos.reduce((s, m) => s + Number(m.quantidade) * Number(m.valor_unitario), 0);
  const valorDesperdicado = descartados.reduce((s, m) => s + Number(m.quantidade) * Number(m.valor_unitario), 0);
  const valorDoado = doados.reduce((s, m) => s + Number(m.quantidade) * Number(m.valor_unitario), 0);
  const economiaEstimada = valorEmEstoque + valorDoado;
  const taxaAproveitamento = meds.length > 0 ? Math.round(((ativos.length + doados.length) / meds.length) * 100) : 0;

  const invoices = [
    { date: "15/07/2026", desc: "Plano Gratuito", valor: 0, status: "gratuito" as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Área Financeira</h1>
          <p className="text-sm text-muted-foreground">Métricas de economia e gestão financeira.</p>
        </div>
        <Badge variant="outline" className="gap-1"><CreditCard className="h-3 w-3" /> Modo gratuito</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={<TrendingUp className="h-4 w-4" />} title="Economia Estimada" value={formatBRL(economiaEstimada)} sub="Valor preservado + doado" />
        <MetricCard icon={<Shield className="h-4 w-4" />} title="Valor em Estoque" value={formatBRL(valorEmEstoque)} sub="Medicamentos operacionais" />
        <MetricCard icon={<CheckCircle className="h-4 w-4" />} title="Aproveitamento" value={`${taxaAproveitamento}%`} sub="Não descartados" />
        <MetricCard icon={<DollarSign className="h-4 w-4" />} title="Valor Desperdiçado" value={formatBRL(valorDesperdicado)} sub="Descartados + lixo" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="metricas">Métricas</TabsTrigger>
          <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
          <TabsTrigger value="faturas">Faturas</TabsTrigger>
        </TabsList>

        <TabsContent value="metricas" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle>Análise por Medicamento</CardTitle></CardHeader>
            <CardContent>
              {meds.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum medicamento cadastrado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground">
                      <tr><th className="py-2">Medicamento</th><th className="text-right">Unidades</th><th className="text-right">Valor Unit.</th><th className="text-right">Total</th><th>Destino</th></tr>
                    </thead>
                    <tbody>
                      {meds.map((m) => (
                        <tr key={m.id} className="border-t">
                          <td className="py-2">{m.nome} <span className="text-xs text-muted-foreground">· {m.lote}</span></td>
                          <td className="py-2 text-right">{Number(m.quantidade)} {m.unidade}</td>
                          <td className="py-2 text-right">{formatBRL(m.valor_unitario)}</td>
                          <td className="py-2 text-right font-medium">{formatBRL(Number(m.quantidade) * Number(m.valor_unitario))}</td>
                          <td className="py-2">{statusLabel(m.estado)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assinatura" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle>Plano Atual</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <CreditCard className="h-5 w-5 text-primary" /> Plano Gratuito
                </div>
                <p className="mt-1 text-sm text-muted-foreground">R$ 0,00/mês · Até 10 medicamentos operacionais</p>
                <p className="mt-1 text-xs text-muted-foreground">Faça upgrade para a versão Pro e tenha recursos ilimitados.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faturas" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle>Histórico de Faturas</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr><th className="py-2">Data</th><th>Descrição</th><th className="text-right">Valor</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {invoices.map((inv, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2">{inv.date}</td>
                      <td className="py-2">{inv.desc}</td>
                      <td className="py-2 text-right">{formatBRL(inv.valor)}</td>
                      <td className="py-2"><Badge variant="outline">Gratuito</Badge></td>
                      <td className="py-2"><Button size="sm" variant="ghost" disabled><Download className="h-3 w-3" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ icon, title, value, sub }: { icon: React.ReactNode; title: string; value: string; sub: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        {icon}
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}

function statusLabel(estado: string) {
  const map: Record<string, string> = {
    operacional: "Operacional",
    prioridade: "Prioridade",
    transferido: "Transferido",
    doado: "Doado",
    descartado: "Descartado",
    lixo: "Lixo",
    baixa: "Baixa",
  };
  return map[estado] ?? estado;
}
