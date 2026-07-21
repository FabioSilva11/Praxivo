import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { toast } from "sonner";
import { User, Building2, Globe, Palette, Bell, Shield, CreditCard } from "lucide-react";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Praxivo" }] }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState("perfil");

  const { data: profile } = useQuery({
    enabled: !!user,
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [cargo, setCargo] = useState("");
  const [telefone, setTelefone] = useState("");
  const [bio, setBio] = useState("");
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (profile) {
      setNome(profile.nome ?? "");
      setEmpresa(profile.empresa ?? "");
      setCargo(profile.cargo ?? "");
      setTelefone(profile.telefone ?? "");
      setBio(profile.bio ?? "");
      setAlertsEnabled(profile.alerts_enabled ?? true);
    }
  }, [profile]);

  const saveMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update({
        nome, empresa, cargo, telefone, bio, alerts_enabled: alertsEnabled,
      }).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Configurações salvas");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  const passwordMut = useMutation({
    mutationFn: async () => {
      if (newPassword.length < 8) throw new Error("Nova senha deve ter no mínimo 8 caracteres");
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Senha atualizada");
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function handleDeleteAccount() {
    if (!confirm("Tem certeza? Esta ação é irreversível. Digite CONFIRMAR no prompt.")) return;
    const confirmText = prompt('Digite "EXCLUIR" para confirmar a exclusão da conta');
    if (confirmText !== "EXCLUIR") return toast.error("Confirmação incorreta");
    const { error } = await supabase.rpc("delete_user_account");
    if (error) {
      toast.error("Não foi possível excluir a conta. Entre em contato com o suporte.");
    } else {
      toast.success("Conta excluída");
      navigate({ to: "/auth", replace: true });
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie sua conta e preferências.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="perfil"><User className="h-4 w-4" /> Perfil</TabsTrigger>
          <TabsTrigger value="empresa"><Building2 className="h-4 w-4" /> Empresa</TabsTrigger>
          <TabsTrigger value="tema"><Palette className="h-4 w-4" /> Tema</TabsTrigger>
          <TabsTrigger value="notificacoes"><Bell className="h-4 w-4" /> Notificações</TabsTrigger>
          <TabsTrigger value="seguranca"><Shield className="h-4 w-4" /> Segurança</TabsTrigger>
          <TabsTrigger value="assinatura"><CreditCard className="h-4 w-4" /> Assinatura</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle>Informações Pessoais</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={user?.email ?? ""} disabled />
              </div>
              <div className="space-y-1">
                <Label>Nome completo</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Telefone</Label>
                  <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" />
                </div>
                <div className="space-y-1">
                  <Label>Cargo</Label>
                  <Input value={cargo} onChange={(e) => setCargo(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Bio</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={200} />
                <p className="text-xs text-muted-foreground">{bio.length}/200 caracteres</p>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
                  {saveMut.isPending ? "Salvando…" : "Salvar Alterações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empresa" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle>Dados da Instituição</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label>Nome da Instituição</Label>
                <Input value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>Salvar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tema" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle>Aparência</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {(["light", "dark", "system"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`rounded-lg border p-4 text-center transition-all ${theme === t ? "border-primary ring-2 ring-primary/20" : "hover:border-muted-foreground/30"}`}
                  >
                    <Palette className="mx-auto h-6 w-6" />
                    <p className="mt-2 text-sm font-medium capitalize">{t === "light" ? "Claro" : t === "dark" ? "Escuro" : "Sistema"}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle>Preferências de Notificação</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><Label>Notificações no sistema</Label><p className="text-xs text-muted-foreground">Alertas sobre vencimentos e movimentações</p></div>
                <Switch checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>Salvar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle>Alterar Senha</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label>Nova senha</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => passwordMut.mutate()} disabled={passwordMut.isPending || newPassword.length < 8}>
                  {passwordMut.isPending ? "Atualizando…" : "Atualizar Senha"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Gerenciar Sessão</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button variant="secondary" onClick={handleLogout}>Sair da conta</Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader><CardTitle className="text-destructive">Zona de Perigo</CardTitle></CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">Excluir sua conta remove todos os dados permanentemente.</p>
              <Button variant="destructive" onClick={handleDeleteAccount}>Excluir minha conta</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assinatura" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle>Plano Atual</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-lg font-semibold">Plano Gratuito</p>
                <p className="text-sm text-muted-foreground">Até 10 medicamentos operacionais</p>
              </div>
              <p className="text-xs text-muted-foreground">Para mais recursos, entre em contato com nossa equipe.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
