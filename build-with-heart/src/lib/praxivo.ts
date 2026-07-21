import type { Database } from "@/integrations/supabase/types";

export type Medicamento = Database["public"]["Tables"]["medicamentos"]["Row"];
export type Historico = Database["public"]["Tables"]["historico"]["Row"];
export type Notificacao = Database["public"]["Tables"]["notificacoes"]["Row"];
export type Estado = Database["public"]["Enums"]["medicamento_estado"];

export type ValidadeStatus = "vencido" | "vencendo" | "valido";

export function diasAteValidade(validade: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const v = new Date(validade + "T00:00:00");
  return Math.round((v.getTime() - hoje.getTime()) / 86400000);
}

export function statusValidade(validade: string): ValidadeStatus {
  const d = diasAteValidade(validade);
  if (d < 0) return "vencido";
  if (d <= 30) return "vencendo";
  return "valido";
}

export function prioridadeAlerta(validade: string): "critica" | "alta" | "media" | "baixa" {
  const d = diasAteValidade(validade);
  if (d <= 0) return "critica";
  if (d <= 3) return "alta";
  if (d <= 7) return "media";
  return "baixa";
}

export function isOperacional(m: Medicamento): boolean {
  return (m.estado === "operacional" || m.estado === "prioridade") && Number(m.quantidade) > 0;
}

export const ESTADO_LABEL: Record<Estado, string> = {
  operacional: "Operacional",
  prioridade: "Prioridade",
  transferido: "Transferido",
  doado: "Doado",
  descartado: "Descartado",
  lixo: "Lixo",
  baixa: "Baixa",
};

export const UNIDADES = ["comprimido", "cápsula", "frasco", "ampola", "ml", "mg", "unidade"];

export function formatBRL(v: number | string | null | undefined): string {
  const n = typeof v === "string" ? parseFloat(v) : (v ?? 0);
  return (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("pt-BR");
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR");
}

export function toCSV(rows: (string | number)[][]): string {
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    if (/[";\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  return "\ufeff" + rows.map((r) => r.map(escape).join(";")).join("\r\n");
}

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}