/*
  # Criar tabela de rastreamentos

  1. Nova Tabela
    - `rastreamentos`
      - `id` (uuid, primary key)
      - `cpf` (text, unique, not null)
      - `inicio` (timestamptz, not null)
      - `etapa_atual` (integer, default 1)
      - `liberacao_paga` (boolean, default false)
      - `tentativas_entrega` (integer, default 0)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Segurança
    - Habilitar RLS na tabela `rastreamentos`
    - Adicionar políticas para permitir acesso completo

  3. Índices
    - Índice único no CPF
    - Índice na data de início
*/

-- Criar tabela de rastreamentos
CREATE TABLE IF NOT EXISTS rastreamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf text UNIQUE NOT NULL,
  inicio timestamptz NOT NULL,
  etapa_atual integer DEFAULT 1,
  liberacao_paga boolean DEFAULT false,
  tentativas_entrega integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE rastreamentos ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Permitir leitura de rastreamentos"
  ON rastreamentos
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir inserção de rastreamentos"
  ON rastreamentos
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de rastreamentos"
  ON rastreamentos
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_rastreamentos_cpf ON rastreamentos (cpf);
CREATE INDEX IF NOT EXISTS idx_rastreamentos_inicio ON rastreamentos (inicio);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_rastreamentos_updated_at
    BEFORE UPDATE ON rastreamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();