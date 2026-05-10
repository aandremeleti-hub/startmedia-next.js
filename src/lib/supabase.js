import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Variáveis de ambiente do Supabase não encontradas.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/*
SQL para criar a tabela no Supabase (copie e cole no SQL Editor do painel do Supabase):

CREATE TABLE leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  nome text,
  email text,
  whatsapp text,
  respostas_raw jsonb,
  diagnostico_gerado text
);
*/
