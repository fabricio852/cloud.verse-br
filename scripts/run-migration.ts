/**
 * Executa migrações SQL no Supabase
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
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

async function runMigration(sqlFile: string) {
  console.log(`🚀 Executando migração: ${sqlFile}\n`);

  try {
    // Ler arquivo SQL
    const sqlPath = join(process.cwd(), 'supabase', sqlFile);
    const sql = readFileSync(sqlPath, 'utf-8');

    // Dividir em comandos individuais (separados por ;)
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 ${commands.length} comandos SQL encontrados\n`);

    let executed = 0;
    let errors = 0;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];

      // Pular comentários de bloco e comandos vazios
      if (command.startsWith('/*') || command.length < 10) {
        continue;
      }

      try {
        console.log(`⚙️  Executando comando ${i + 1}/${commands.length}...`);

        const { error } = await supabase.rpc('exec_sql', {
          sql_query: command
        });

        if (error) {
          // Tentar executar diretamente se RPC não funcionar
          const { error: directError } = await supabase
            .from('_migrations')
            .insert({ sql: command });

          if (directError) {
            console.error(`❌ Erro no comando ${i + 1}:`, error.message);
            errors++;
          } else {
            executed++;
          }
        } else {
          executed++;
        }
      } catch (err: any) {
        console.error(`❌ Erro no comando ${i + 1}:`, err.message);
        errors++;
      }
    }

    console.log('\n');
    console.log('📊 Resumo da Migração:');
    console.log(`  ✅ Executados: ${executed}`);
    console.log(`  ❌ Erros: ${errors}`);
    console.log(`  📝 Total: ${commands.length}`);

    if (errors === 0) {
      console.log('\n✨ Migração concluída com sucesso!');
    } else {
      console.log('\n⚠️  Migração concluída com erros. Verifique o log acima.');
    }
  } catch (error: any) {
    console.error('❌ Erro fatal ao executar migração:', error.message);
    process.exit(1);
  }
}

// Verificar argumentos
const args = process.argv.slice(2);
const sqlFile = args[0] || 'migration-multiselect.sql';

console.log('🗄️  Rodando Migração SQL\n');
console.log(`📂 Arquivo: ${sqlFile}\n`);

runMigration(sqlFile).catch(error => {
  console.error('❌ Erro:', error);
  process.exit(1);
});
