import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { PillBottle, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — Praxivo" },
      { name: "description", content: "Recupere sua senha do Praxivo." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RecuperarSenhaPage,
});

function RecuperarSenhaPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return toast.error("Informe seu email");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setLoading(false);
    if (error) return toast.error("Erro ao enviar", { description: error.message });
    setEnviado(true);
    toast.success("Email de recuperação enviado");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center gap-2 text-lg font-semibold">
            <PillBottle className="h-6 w-6 text-primary" /> Praxivo
          </div>
          {enviado ? (
            <>
              <div className="mx-auto mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <CardTitle className="mt-2">Email enviado</CardTitle>
              <CardDescription>
                Enviamos um link de recuperação para <strong>{email}</strong>. Verifique sua caixa de entrada e spam.
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="mt-2">Recuperar senha</CardTitle>
              <CardDescription>Digite seu email cadastrado e enviaremos um link para redefinir sua senha.</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {enviado ? (
            <div className="space-y-4">
              <Button variant="outline" className="w-full" onClick={() => navigate({ to: "/auth" })}>
                <ArrowLeft className="h-4 w-4" /> Voltar ao login
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recover-email">Email</Label>
                <Input id="recover-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando…" : "Enviar link de recuperação"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                <Link to="/auth" className="inline-flex items-center gap-1 text-primary hover:underline">
                  <ArrowLeft className="h-3 w-3" /> Voltar ao login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
