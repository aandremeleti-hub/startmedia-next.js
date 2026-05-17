import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Variáveis de ambiente do Supabase não encontradas.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Verifica se um lead já existe com o mesmo e-mail ou WhatsApp
 * @param {string} email
 * @param {string} whatsapp
 * @returns {Promise<{exists: boolean, lead: object|null}>}
 */
export async function checkExistingLead(email, whatsapp) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('id, nome, email, whatsapp, created_at, diagnostico_gerado')
      .or(`email.eq.${email},whatsapp.eq.${whatsapp}`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) return { exists: false, lead: null };
    return { exists: true, lead: data[0] };
  } catch {
    return { exists: false, lead: null };
  }
}

/*
========================================================
SQL PARA MIGRAÇÃO DA TABELA NO SUPABASE
Execute no SQL Editor do painel Supabase (supabase.com/dashboard):
========================================================

-- Adicionar novos campos à tabela leads existente
ALTER TABLE leads ADD COLUMN IF NOT EXISTS cta_escolhido TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS data_reuniao TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS link_meet TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_recorrente BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS sessao_encerrada_por TEXT;

-- Se ainda não tem a tabela, criar do zero:
CREATE TABLE IF NOT EXISTS leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  nome text,
  email text,
  whatsapp text,
  respostas_raw jsonb,
  diagnostico_gerado jsonb,
  cta_escolhido text,
  data_reuniao text,
  link_meet text,
  lead_recorrente boolean DEFAULT false,
  sessao_encerrada_por text
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy para inserção (permite que a API e o frontend possam gravar novos leads)
CREATE POLICY "Allow insert" ON leads FOR INSERT WITH CHECK (true);

-- Policy para leitura protegida (bloqueia leitura pública)
CREATE POLICY "Allow select for service role" ON leads FOR SELECT USING (false);

-- Atualiza o cache de schema da API do PostgREST imediatamente
NOTIFY pgrst, 'reload schema';
*/
