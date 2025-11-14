/**
 * Script para limpar SAA-C03 usando SQL raw do Supabase
 * Executa via REST API
 */

import { config } from 'dotenv';
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

async function executeSql(sql: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ query: sql })
  });

  return response.json();
}

async function main() {
  console.log('🧹 Limpeza SAA-C03 com SQL\n');

  try {
    console.log('Step 1️⃣  Contando questões SAA-C03...');
    const response1 = await fetch(
      `${SUPABASE_URL}/rest/v1/questions?certification_id=eq.SAA-C03&select=count=exact`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
        }
      }
    );

    const data1 = await response1.json();
    console.log(`Total: ${data1.length} questões`);

    if (data1.length === 0) {
      console.log('✅ Nenhuma questão SAA-C03 para limpar');
      process.exit(0);
    }

    console.log('\nStep 2️⃣  Removendo respostas do usuário...');
    const response2 = await fetch(
      `${SUPABASE_URL}/rest/v1/user_answers?question_id=in.(${
        data1.map((q: any) => `"${q.id}"`).join(',')
      })`,
      {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Prefer': 'return=representation',
        }
      }
    );

    console.log(`Status: ${response2.status}`);

    console.log('\nStep 3️⃣  Removendo questões SAA-C03...');
    const response3 = await fetch(
      `${SUPABASE_URL}/rest/v1/questions?certification_id=eq.SAA-C03`,
      {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Prefer': 'return=representation',
        }
      }
    );

    console.log(`Status: ${response3.status}`);

    if (response3.ok) {
      const deleted = await response3.json();
      console.log(`✅ ${deleted.length} questões removidas`);
    } else {
      const error = await response3.json();
      console.error('❌ Erro:', error);
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
