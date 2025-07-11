/*
  # Criar tabela de consultas de CPF

  1. Nova Tabela
    - `consultas`
      - `id` (uuid, primary key)
      - `cpf` (text, unique, not null)
      - `nome` (text, not null)
      - `nascimento` (text)
      - `data_consulta` (timestamptz, default now())
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Segurança
    - Habilitar RLS na tabela `consultas`
    - Adicionar política para permitir leitura e escrita para usuários anônimos e autenticados

  3. Índices
    - Índice único no CPF para consultas rápidas
    - Índice na data de consulta para ordenação
*/

-- Criar tabela de consultas
CREATE TABLE IF NOT EXISTS consultas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf text UNIQUE NOT NULL,
  nome text NOT NULL,
  nascimento text,
  data_consulta timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Permitir leitura de consultas"
  ON consultas
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir inserção de consultas"
  ON consultas
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de consultas"
  ON consultas
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_consultas_cpf ON consultas (cpf);
CREATE INDEX IF NOT EXISTS idx_consultas_data ON consultas (data_consulta);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_consultas_updated_at
    BEFORE UPDATE ON consultas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();