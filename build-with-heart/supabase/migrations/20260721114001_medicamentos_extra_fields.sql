-- Campos adicionais para medicamentos (docs/05-medicamentos.md)
ALTER TABLE public.medicamentos
  ADD COLUMN IF NOT EXISTS tipo_quantidade TEXT NOT NULL DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS registro_anvisa TEXT,
  ADD COLUMN IF NOT EXISTS prescricao_medica BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS temperatura_armazenamento TEXT;

-- Tipo_quantidade ENUM-like check
ALTER TABLE public.medicamentos DROP CONSTRAINT IF EXISTS check_tipo_quantidade;
ALTER TABLE public.medicamentos ADD CONSTRAINT check_tipo_quantidade
  CHECK (tipo_quantidade IN ('individual', 'caixa', 'frasco', 'lote', 'bloco'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.medicamentos TO authenticated;
