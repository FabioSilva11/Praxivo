import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatDateTime } from "@/lib/praxivo";
import { Bell, BellRing, CheckCheck, Trash2, AlertTriangle, Clock, Heart, ArrowRightLeft, XCircle, FileEdit, Info } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notificacoes")({
  head: () => ({ meta: [{ title: "Notificações — Praxivo" }] }),
  component: NotificacoesPage,
});

type Notificacao = {
  id: string;
  user_id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  lida: boolean;
  created_at: string;
};

function NotificacoesPage() {
  const [tab, setTab] = useState("todas");
  const [tipoFilter, setTipoFilter] = useState("all");

  const { data: notifs = [], refetch } = useQuery({
    queryKey: ["notificacoes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notificacoes").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return (data ?? []) as Notificacao[];
    },
  });

  const filtered = notifs.filter((n) => {
    if (tab === "naolidas" && n.lida) return false;
    if (tab === "lidas" && !n.lida) return false;
    if (tipoFilter !== "all" && n.tipo !== tipoFilter) return false;
    return true;
  });

  const naoLidas = notifs.filter((n) => !n.lida).length;

  async function marcarLida(id: string) {
    await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
    refetch();
  }

  async function marcarTodasLidas() {
    await supabase.from("notificacoes").update({ lida: true }).eq("user_id", notifs[0]?.user_id ?? "").is("lida", false);
    refetch();
  }

  async function deletarNotificacao(id: string) {
    await supabase.from("notificacoes").delete().eq("id", id);
    refetch();
  }

  const tipoIcon: Record<string, React.ReactNode> = {
    vencendo: <Clock className="h-4 w-4 text-warning" />,
    vencido: <AlertTriangle className="h-4 w-4 text-destructive" />,
    alteracao: <FileEdit className="h-4 w-4 text-info" />,
    doacao: <Heart className="h-4 w-4 text-info" />,
    transferencia: <ArrowRightLeft className="h-4 w-4 text-purple" />,
    descarte: <XCircle className="h-4 w-4 text-orange" />,
    sistema: <Info className="h-4 w-4 text-primary" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notificações</h1>
          <p className="text-sm text-muted-foreground">{naoLidas} não lida{naoLidas !== 1 ? "s" : ""}</p>
        </div>
        {naoLidas > 0 && (
          <Button variant="outline" size="sm" onClick={marcarTodasLidas}>
            <CheckCheck className="h-4 w-4" /> Marcar todas como lidas
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="todas">Todas <Badge variant="outline" className="ml-1">{notifs.length}</Badge></TabsTrigger>
            <TabsTrigger value="naolidas">Não lidas <Badge variant="outline" className="ml-1">{naoLidas}</Badge></TabsTrigger>
            <TabsTrigger value="lidas">Lidas</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="vencendo">Vencendo</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
            <SelectItem value="alteracao">Alteração</SelectItem>
            <SelectItem value="doacao">Doação</SelectItem>
            <SelectItem value="transferencia">Transferência</SelectItem>
            <SelectItem value="descarte">Descarte</SelectItem>
            <SelectItem value="sistema">Sistema</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="divide-y">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
            <BellRing className="h-10 w-10" />
            <p className="font-medium">Nenhuma notificação</p>
            <p className="text-sm">Quando houver alertas ou atualizações, elas aparecerão aqui.</p>
          </div>
        ) : filtered.map((n) => (
          <div
            key={n.id}
            className={`flex items-start justify-between gap-4 p-4 ${!n.lida ? "bg-accent/30" : ""}`}
            onClick={() => !n.lida && marcarLida(n.id)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">{tipoIcon[n.tipo] ?? <Bell className="h-4 w-4" />}</div>
              <div>
                <div className={`text-sm ${!n.lida ? "font-semibold" : ""}`}>{n.titulo}</div>
                <div className="text-xs text-muted-foreground">{n.descricao}</div>
                <div className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.created_at)}</div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {!n.lida && <span className="h-2 w-2 rounded-full bg-primary" />}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); deletarNotificacao(n.id); }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
