
-- Enum de estado do medicamento (movimentações finais)
CREATE TYPE public.medicamento_estado AS ENUM (
  'operacional', 'prioridade', 'transferido', 'doado', 'descartado', 'lixo', 'baixa'
);

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  cargo TEXT,
  empresa TEXT,
  cnpj TEXT,
  endereco TEXT,
  bio TEXT,
  theme TEXT NOT NULL DEFAULT 'system',
  primary_color TEXT NOT NULL DEFAULT '#2563EB',
  alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- medicamentos (cada linha = 1 lote)
CREATE TABLE public.medicamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  fabricante TEXT NOT NULL,
  lote TEXT NOT NULL,
  quantidade NUMERIC(14,3) NOT NULL DEFAULT 0,
  unidade TEXT NOT NULL,
  fabricacao DATE NOT NULL,
  validade DATE NOT NULL,
  local TEXT NOT NULL,
  lote_fornecedor TEXT,
  valor_unitario NUMERIC(14,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  estado public.medicamento_estado NOT NULL DEFAULT 'operacional',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lote)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medicamentos TO authenticated;
GRANT ALL ON public.medicamentos TO service_role;
ALTER TABLE public.medicamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own med select" ON public.medicamentos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own med insert" ON public.medicamentos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own med update" ON public.medicamentos FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own med delete" ON public.medicamentos FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX medicamentos_user_validade_idx ON public.medicamentos (user_id, validade);

-- historico
CREATE TABLE public.historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medicamento_id UUID,
  medicamento_nome TEXT,
  acao TEXT NOT NULL,
  descricao TEXT NOT NULL,
  detalhes JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.historico TO authenticated;
GRANT ALL ON public.historico TO service_role;
ALTER TABLE public.historico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own hist select" ON public.historico FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own hist insert" ON public.historico FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX historico_user_created_idx ON public.historico (user_id, created_at DESC);

-- updated_at helper
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER medicamentos_updated_at BEFORE UPDATE ON public.medicamentos
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Cria perfil no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
