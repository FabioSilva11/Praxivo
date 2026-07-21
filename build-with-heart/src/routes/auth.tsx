import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PillBottle, Eye, EyeOff, ShieldCheck, BellRing, FileBarChart } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Praxivo" },
      { name: "description", content: "Acesse sua conta Praxivo para controlar validade e movimentações de medicamentos." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">(
    typeof window !== "undefined" && window.location.hash === "#signup" ? "signup" : "signin",
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center gap-2 text-lg font-semibold">
              <PillBottle className="h-6 w-6 text-primary" /> Praxivo
            </div>
            <CardTitle className="mt-2">Bem-vindo</CardTitle>
            <CardDescription>Gerencie seus medicamentos com inteligência.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>
              <TabsContent value="signin"><SignInForm onSuccess={() => navigate({ to: "/dashboard" })} /></TabsContent>
              <TabsContent value="signup"><SignUpForm onSuccess={() => navigate({ to: "/dashboard" })} /></TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div className="hidden flex-1 flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-12 lg:flex">
        <div className="max-w-sm space-y-6">
          <PillBottle className="h-16 w-16 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight">Controle de validade simplificado</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-success" /> Alertas automáticos de vencimento</li>
            <li className="flex items-center gap-2"><BellRing className="h-5 w-5 text-warning" /> Priorização por criticidade</li>
            <li className="flex items-center gap-2"><FileBarChart className="h-5 w-5 text-info" /> Relatórios e histórico completo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function SignInForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return toast.error("Email é obrigatório");
    if (!password) return toast.error("Senha é obrigatória");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error("Email ou senha incorretos");
    toast.success("Bem-vindo de volta");
    onSuccess();
  }

  return (
    <form onSubmit={submit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input id="signin-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signin-password">Senha</Label>
        <div className="relative">
          <Input id="signin-password" type={showPassword ? "text" : "password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
          Lembrar de mim
        </label>
        <Link to="/recuperar-senha" className="text-sm text-primary hover:underline">Esqueci a senha</Link>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "Entrando…" : "Entrar"}</Button>
      <p className="text-center text-sm text-muted-foreground">
        Não tem uma conta? <button type="button" className="text-primary hover:underline" onClick={() => document.querySelector('[data-value="signup"]')?.click()}>Cadastre-se</button>
      </p>
    </form>
  );
}

const SENHA_NIVEIS = [
  { min: 0, label: "Fraca", cor: "bg-destructive" },
  { min: 1, label: "Média", cor: "bg-warning" },
  { min: 3, label: "Forte", cor: "bg-success" },
];

function forcaSenha(s: string): number {
  let pts = 0;
  if (s.length >= 8) pts++;
  if (/[A-Z]/.test(s)) pts++;
  if (/[0-9]/.test(s)) pts++;
  if (/[^A-Za-z0-9]/.test(s)) pts++;
  return pts;
}

function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [aceito, setAceito] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const nivel = forcaSenha(password);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (nome.trim().length < 2) return toast.error("Nome deve ter no mínimo 2 caracteres");
    if (!email) return toast.error("Email é obrigatório");
    if (password.length < 8) return toast.error("Senha deve ter no mínimo 8 caracteres");
    if (password !== confirm) return toast.error("As senhas não coincidem");
    if (!aceito) return toast.error("Você precisa aceitar os termos");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { nome: nome.trim() },
      },
    });
    setLoading(false);
    if (error) return toast.error("Falha ao cadastrar", { description: error.message });
    toast.success("Conta criada com sucesso!");
    onSuccess();
  }

  return (
    <form onSubmit={submit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="signup-nome">Nome completo</Label>
        <Input id="signup-nome" required minLength={2} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input id="signup-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="signup-password">Senha</Label>
          <div className="relative">
            <Input id="signup-password" type={showPassword ? "text" : "password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password.length >= 8 && (
            <div className="flex items-center gap-2">
              <div className="flex h-1.5 flex-1 gap-1">
                {SENHA_NIVEIS.slice(0, 4).map((_, i) => (
                  <div key={i} className={`h-full flex-1 rounded-full ${i < nivel ? SENHA_NIVEIS[nivel].cor : "bg-muted"}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{SENHA_NIVEIS[nivel]?.label ?? "Fraca"}</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-confirm">Confirmar senha</Label>
          <Input id="signup-confirm" type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
      </div>
      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input type="checkbox" checked={aceito} onChange={(e) => setAceito(e.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300" />
        <span>Aceito os <span className="text-primary hover:underline cursor-default">Termos de Uso</span></span>
      </label>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "Criando conta…" : "Criar conta"}</Button>
      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta? <button type="button" className="text-primary hover:underline" onClick={() => document.querySelector('[data-value="signin"]')?.click()}>Entrar</button>
      </p>
    </form>
  );
}
