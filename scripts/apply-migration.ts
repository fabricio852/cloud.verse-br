/**
 * Aplica migração multiselect diretamente no Supabase
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function applyMigration() {
  console.log('🚀 Aplicando Migração Multiselect\n');

  const commands = [
    {
      name: 'Adicionar coluna option_e',
      sql: 'ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_e TEXT NULL'
    },
    {
      name: 'Adicionar coluna correct_answers',
      sql: 'ALTER TABLE questions ADD COLUMN IF NOT EXISTS correct_answers TEXT[] NULL'
    },
    {
      name: 'Adicionar coluna required_selection_count',
      sql: 'ALTER TABLE questions ADD COLUMN IF NOT EXISTS required_selection_count INT DEFAULT 1'
    },
    {
      name: 'Popular correct_answers com valores existentes',
      sql: `UPDATE questions
            SET correct_answers = ARRAY[correct_answer]
            WHERE correct_answers IS NULL`
    },
    {
      name: 'Popular required_selection_count',
      sql: `UPDATE questions
            SET required_selection_count = 1
            WHERE required_selection_count IS NULL OR required_selection_count = 0`
    }
  ];

  let success = 0;
  let errors = 0;

  for (const cmd of commands) {
    try {
      console.log(`⚙️  ${cmd.name}...`);

      const { error } = await supabase.rpc('exec_sql', { sql: cmd.sql });

      if (error) {
        console.error(`❌ Erro: ${error.message}`);
        errors++;
      } else {
        console.log(`✅ OK`);
        success++;
      }
    } catch (err: any) {
      console.error(`❌ Erro: ${err.message}`);
      errors++;
    }
  }

  console.log('\n📊 Resumo:');
  console.log(`  ✅ Sucesso: ${success}`);
  console.log(`  ❌ Erros: ${errors}`);
  console.log(`  📝 Total: ${commands.length}`);

  if (errors > 0) {
    console.log('\n⚠️  ATENÇÃO: Algumas migrações falharam.');
    console.log('Você precisará executar manualmente no Supabase Dashboard:');
    console.log('1. Acesse o SQL Editor');
    console.log('2. Execute os comandos de supabase/migration-multiselect.sql');
    return false;
  } else {
    console.log('\n✨ Migração aplicada com sucesso!');
    return true;
  }
}

applyMigration().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
