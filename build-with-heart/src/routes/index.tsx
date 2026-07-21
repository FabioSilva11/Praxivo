import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, PillBottle, Bell, PackageOpen, TrendingUp, LayoutDashboard, Clock, FileText, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const [checking, setChecking] = useState(true);
  const { resolved, toggle } = useTheme();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.location.replace("/dashboard");
      } else {
        setChecking(false);
      }
    });
  }, []);

  if (checking) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando…</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header resolved={resolved} toggle={toggle} />
      <HeroSection />
      <BeneficiosSection />
      <ComoFuncionaSection />
      <IndicadoresSection />
      <FAQSection />
      <FooterSection />
    </div>
  );
}

function Header({ resolved, toggle }: { resolved: string; toggle: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={`sticky top-0 z-50 transition-shadow ${scrolled ? "bg-background/80 shadow-sm backdrop-blur" : "bg-background"}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <PillBottle className="h-6 w-6 text-primary" />
          Praxivo
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#beneficios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
          <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Como funciona</a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          <Button variant="ghost" size="icon" onClick={toggle} title={resolved === "dark" ? "Modo claro" : "Modo escuro"}>
            {resolved === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button asChild variant="ghost"><Link to="/auth">Entrar</Link></Button>
          <Button asChild><Link to="/auth" hash="signup">Criar conta</Link></Button>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={toggle}>
            {resolved === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)}>
            <ChevronDown className={`h-5 w-5 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>
      {menuOpen && (
        <div className="border-t bg-background px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <a href="#beneficios" className="text-sm text-muted-foreground" onClick={() => setMenuOpen(false)}>Funcionalidades</a>
            <a href="#como-funciona" className="text-sm text-muted-foreground" onClick={() => setMenuOpen(false)}>Como funciona</a>
            <a href="#faq" className="text-sm text-muted-foreground" onClick={() => setMenuOpen(false)}>FAQ</a>
            <div className="flex gap-2 pt-2">
              <Button asChild variant="ghost" size="sm"><Link to="/auth">Entrar</Link></Button>
              <Button asChild size="sm"><Link to="/auth" hash="signup">Criar conta</Link></Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Nunca mais perca medicamentos por vencimento.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Controle todo o seu estoque em um único lugar, receba alertas antes do vencimento e reduza desperdícios.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to="/auth" hash="signup">Começar Agora</Link></Button>
            <Button asChild size="lg" variant="outline"><a href="#beneficios">Ver Demonstração</a></Button>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-success/10 p-4">
              <div className="text-2xl font-bold text-success">1.247</div>
              <div className="text-xs text-muted-foreground">Medicamentos monitorados</div>
            </div>
            <div className="rounded-lg bg-warning/10 p-4">
              <div className="text-2xl font-bold text-warning">34</div>
              <div className="text-xs text-muted-foreground">Próximos do vencimento</div>
            </div>
            <div className="rounded-lg bg-destructive/10 p-4">
              <div className="text-2xl font-bold text-destructive">8</div>
              <div className="text-xs text-muted-foreground">Vencidos</div>
            </div>
            <div className="rounded-lg bg-info/10 p-4">
              <div className="text-2xl font-bold text-info">R$ 4.850</div>
              <div className="text-xs text-muted-foreground">Economia estimada</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const beneficios = [
  { icon: Bell, title: "Alertas automáticos", desc: "Receba notificações antes do vencimento para nunca perder um medicamento." },
  { icon: PackageOpen, title: "Organização completa", desc: "Mantenha todo o seu estoque organizado e fácil de consultar." },
  { icon: TrendingUp, title: "Economia com redução de desperdício", desc: "Reduza perdas e economize com um controle inteligente." },
  { icon: LayoutDashboard, title: "Dashboard inteligente", desc: "Visualize dados importantes em tempo real com gráficos modernos." },
  { icon: Clock, title: "Histórico completo", desc: "Acompanhe todas as ações realizadas no sistema." },
  { icon: FileText, title: "Relatórios detalhados", desc: "Gere relatórios detalhados para análise e tomada de decisão." },
];

function BeneficiosSection() {
  return (
    <section id="beneficios" className="border-t bg-muted/30 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold tracking-tight">Por que escolher o Praxivo?</h2>
        <p className="mt-2 text-center text-muted-foreground">Tudo que você precisa para gerenciar seus medicamentos.</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {beneficios.map((b, i) => (
            <div key={i} className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const passos = [
  { num: "1", icon: PackageOpen, title: "Cadastre seus medicamentos", desc: "Adicione nome, validade, quantidade e local de armazenamento." },
  { num: "2", icon: LayoutDashboard, title: "O sistema acompanha automaticamente as datas", desc: "Monitore todas as validades em tempo real sem esforço." },
  { num: "3", icon: Bell, title: "Receba alertas antes do vencimento", desc: "Seja notificado com antecedência para tomar ação." },
];

function ComoFuncionaSection() {
  return (
    <section id="como-funciona" className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold tracking-tight">Como funciona</h2>
        <p className="mt-2 text-center text-muted-foreground">Em apenas 3 passos você começa a controlar seu estoque.</p>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {passos.map((p, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">{p.num}</div>
              <div className="mx-auto mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IndicadoresSection() {
  return (
    <section className="bg-primary px-6 py-16 text-primary-foreground">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="text-4xl font-bold md:text-5xl">12.500+</div>
            <div className="mt-2 text-sm opacity-80">Medicamentos monitorados</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold md:text-5xl">98%</div>
            <div className="mt-2 text-sm opacity-80">Desperdício evitado</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold md:text-5xl">R$ 2.3M+</div>
            <div className="mt-2 text-sm opacity-80">Economia gerada</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold md:text-5xl">45.000+</div>
            <div className="mt-2 text-sm opacity-80">Alertas enviados</div>
          </div>
        </div>
      </div>
    </section>
  );
}

const faqItems = [
  { q: "O que é o Praxivo?", a: "O Praxivo é uma plataforma web para controle de validade de medicamentos, ajudando a evitar desperdício e organizar estoques." },
  { q: "Como funciona o sistema de alertas?", a: "O sistema monitora automaticamente as datas de validade e envia notificações com antecedência (30, 15, 7 e 1 dia antes do vencimento)." },
  { q: "Posso cadastrar medicamentos em lote?", a: "Sim, o sistema permite cadastro individual e em lote, com opção de duplicar cadastros existentes." },
  { q: "Os dados ficam seguros?", a: "Sim, utilizamos criptografia e boas práticas de segurança para proteger todas as informações." },
  { q: "Posso usar no celular?", a: "Sim, o Praxivo é totalmente responsivo e funciona em desktop, tablet e celular." },
  { q: "Como exportar relatórios?", a: "Na página de Relatórios, você pode gerar relatórios detalhados. A exportação será disponibilizada em futuras atualizações." },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="border-t px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-3xl font-bold tracking-tight">Perguntas Frequentes</h2>
        <p className="mt-2 text-center text-muted-foreground">Tire suas dúvidas sobre o Praxivo.</p>
        <div className="mt-8 space-y-1">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b">
              <button
                className="flex w-full items-center justify-between py-4 text-left font-medium"
                onClick={() => setOpen(open === i ? null : i)}
              >
                {item.q}
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="pb-4 text-sm text-muted-foreground">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="border-t bg-muted/30 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <PillBottle className="h-5 w-5 text-primary" /> Praxivo
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Controle de validade de medicamentos inteligente.</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Produto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#beneficios" className="hover:text-foreground transition-colors">Funcionalidades</a></li>
              <li><a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a></li>
              <li><Link to="/auth" className="hover:text-foreground transition-colors">Preços</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Empresa</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-foreground transition-colors cursor-default">Sobre</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-default">Contato</span></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-foreground transition-colors cursor-default">Privacidade</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-default">Termos de Uso</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          © 2026 Praxivo. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
