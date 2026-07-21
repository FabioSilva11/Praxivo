import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Moon, Sun, Bell, BellRing, AlertTriangle, Clock, Heart, ArrowRightLeft, XCircle, FileEdit, Info, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

type NotificacaoHeader = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  lida: boolean;
  created_at: string;
};

const TIPO_ICON: Record<string, React.ReactNode> = {
  vencendo: <Clock className="h-4 w-4 text-warning" />,
  vencido: <AlertTriangle className="h-4 w-4 text-destructive" />,
  alteracao: <FileEdit className="h-4 w-4 text-info" />,
  doacao: <Heart className="h-4 w-4 text-info" />,
  transferencia: <ArrowRightLeft className="h-4 w-4 text-purple" />,
  descarte: <XCircle className="h-4 w-4 text-orange" />,
  sistema: <Info className="h-4 w-4 text-primary" />,
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `há ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days}d`;
  const months = Math.floor(days / 30);
  return `há ${months}m`;
}

function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const { resolved, toggle } = useTheme();
  const navigate = useNavigate();

  const { data: notifData = { count: 0, recent: [] } } = useQuery({
    enabled: !!user,
    queryKey: ["notificacoes-header"],
    queryFn: async () => {
      const { count } = await supabase.from("notificacoes").select("*", { count: "exact", head: true }).eq("lida", false);
      const { data } = await supabase.from("notificacoes").select("*").order("created_at", { ascending: false }).limit(5);
      return { count: count ?? 0, recent: (data ?? []) as NotificacaoHeader[] };
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando…</div>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="ml-2 mr-auto text-sm text-muted-foreground">{user.email}</div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {notifData.count > 0 && (
                    <Badge variant="destructive" className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px]">
                      {notifData.count > 9 ? "9+" : notifData.count}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={8} className="w-80 p-0">
                <div className="flex items-center justify-between border-b px-4 py-2.5">
                  <span className="text-sm font-semibold">Notificações</span>
                  {notifData.count > 0 && <span className="text-xs text-muted-foreground">{notifData.count} não lida{notifData.count !== 1 ? "s" : ""}</span>}
                </div>
                <ScrollArea className="max-h-[320px]">
                  {notifData.recent.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 p-6 text-center text-muted-foreground">
                      <BellRing className="h-8 w-8" />
                      <p className="text-sm font-medium">Nenhuma notificação</p>
                    </div>
                  ) : notifData.recent.map((n) => (
                    <div key={n.id} className={`flex items-start gap-3 border-b px-4 py-3 ${!n.lida ? "bg-accent/30" : ""}`}>
                      <div className="mt-0.5 shrink-0">{TIPO_ICON[n.tipo] ?? <Bell className="h-4 w-4" />}</div>
                      <div className="min-w-0 flex-1">
                        <div className={`truncate text-sm ${!n.lida ? "font-semibold" : ""}`}>{n.titulo}</div>
                        <div className="truncate text-xs text-muted-foreground">{n.descricao}</div>
                        <div className="mt-0.5 text-[10px] text-muted-foreground">{relativeTime(n.created_at)}</div>
                      </div>
                      {!n.lida && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </div>
                  ))}
                </ScrollArea>
                <div className="border-t p-2">
                  <Button variant="ghost" size="sm" className="w-full justify-between text-xs" asChild>
                    <Link to="/notificacoes">
                      Ver todas <ChevronRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" onClick={toggle} title={resolved === "dark" ? "Modo claro" : "Modo escuro"}>
              {resolved === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}