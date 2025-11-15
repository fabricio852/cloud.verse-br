/**
 * Script de Importação de Questões Traduzidas para Português
 * - Importa questões do arquivo *-br.json
 * - Adiciona sufixo "-br" nos IDs para evitar conflito com questões em inglês
 * - Mantém questões em inglês intactas
 * - Zero impacto no funcionamento do app em inglês
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Database } from '../types/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Argumentos
const args = process.argv.slice(2);
const certId = args.find(arg => arg.startsWith('--cert='))?.split('=')[1];
const clearFirst = args.includes('--clear');

// Mapeamento de certificações para arquivos
const CERT_FILES: Record<string, string> = {
  'SAA-C03': 'data/saa-questions-br.json',
  'CLF-C02': 'data/clf-questions-br.json',
  'AIF-C01': 'data/aif-questions-br.json'
};

// Se nenhuma certificação foi especificada, processar todas
const certsToProcess = certId ? [certId] : Object.keys(CERT_FILES);

// Validar certificações
for (const cert of certsToProcess) {
  if (!CERT_FILES[cert]) {
    console.error(`❌ Certificação desconhecida: ${cert}`);
    console.error(`Opções: ${Object.keys(CERT_FILES).join(', ')}`);
    process.exit(1);
  }
}

/**
 * Normaliza domínio para o formato curto
 * Mapeia domínios longos para as chaves esperadas
 */
function normalizeDomain(domain: string): string {
  const mapping: Record<string, string> = {
    // SAA-C03
    'DESIGN_SECURE_APPLICATIONS_ARCHITECTURES': 'SECURE',
    'DESIGN_RESILIENT_ARCHITECTURES': 'RESILIENT',
    'DESIGN_HIGH_PERFORMING_ARCHITECTURES': 'PERFORMANCE',
    'DESIGN_COST_OPTIMIZED_ARCHITECTURES': 'COST',

    // CLF-C02
    'CLOUD_CONCEPTS': 'CLOUD_CONCEPTS',
    'CLOUD_TECHNOLOGY_SERVICES': 'CLOUD_TECHNOLOGY_SERVICES',
    'SECURITY_COMPLIANCE': 'SECURITY_COMPLIANCE',
    'BILLING_PRICING': 'BILLING_PRICING',
    'TECHNOLOGY': 'TECHNOLOGY',

    // AIF-C01
    'RESPONSIBLE_AI': 'RESPONSIBLE_AI',
    'AI_SERVICES': 'AI_SERVICES',
    'AI_FUNDAMENTALS': 'AI_FUNDAMENTALS',
    'ML_DEVELOPMENT': 'ML_DEVELOPMENT'
  };

  return mapping[domain] || domain;
}

/**
 * Processa e importa questões de um arquivo
 */
async function importBRQuestions(certification: string, filePath: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📚 Importando: ${certification}`);
  console.log(`📂 Arquivo: ${filePath}`);
  console.log(`${'='.repeat(60)}\n`);

  // Limpar questões BR antigas se solicitado
  if (clearFirst) {
    console.log('🗑️  Limpando questões antigas (PT-BR)...');
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('certification_id', certification)
      .like('id', '%-br');

    if (error) {
      console.error('⚠️  Aviso ao limpar:', error.message);
    } else {
      console.log('✅ Questões antigas (PT-BR) removidas\n');
    }
  }

  // Ler arquivo
  let questions: any[];
  try {
    const fileContent = readFileSync(join(process.cwd(), filePath), 'utf-8');
    questions = JSON.parse(fileContent);

    if (!Array.isArray(questions)) {
      console.error('❌ Erro: JSON deve ser um array de questões');
      return;
    }
  } catch (error) {
    console.error('❌ Erro ao ler arquivo:', error);
    return;
  }

  console.log(`📝 ${questions.length} questões encontradas\n`);

  let imported = 0;
  let errors = 0;
  const domainCounts: Record<string, number> = {};

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    try {
      // Normalizar domínio
      const normalizedDomain = normalizeDomain(q.domain || 'SECURE');

      // **IMPORTANTE**: Adicionar sufixo "-br" no ID para evitar conflito
      const brQuestion = {
        ...q,
        id: `${q.id}-br`,  // SUFIXO CRÍTICO: garante que não sobrescreve questões EN
        certification_id: certification,
        domain: normalizedDomain,
        active: q.active !== false // Default true se não especificado
      };

      // Contar por domínio
      domainCounts[normalizedDomain] = (domainCounts[normalizedDomain] || 0) + 1;

      // Inserir no Supabase
      const { error } = await supabase
        .from('questions')
        .upsert(brQuestion, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Erro ao importar questão ${i + 1} (${q.id}):`, error.message);
        errors++;
      } else {
        imported++;
        process.stdout.write('.');

        if (imported % 50 === 0) {
          console.log(` ${imported}`);
        }
      }
    } catch (error: any) {
      console.error(`❌ Erro ao processar questão ${i + 1}:`, error.message);
      errors++;
    }
  }

  console.log('\n');
  console.log('📊 Resumo da Importação:');
  console.log(`  ✅ Importadas: ${imported}`);
  console.log(`  ❌ Erros: ${errors}`);
  console.log(`  📝 Total: ${questions.length}`);

  if (Object.keys(domainCounts).length > 0) {
    console.log('\n📈 Distribuição por Domínio:');
    for (const [domain, count] of Object.entries(domainCounts)) {
      const percentage = Math.round((count / imported) * 100);
      console.log(`  📌 ${domain}: ${count} questões (${percentage}%)`);
    }
  }

  console.log('\n✨ Concluído para ' + certification + '!');
  console.log(`🔗 IDs adicionados com sufixo: "-br"`);
  console.log(`   Exemplo: ${questions[0]?.id}-br\n`);

  return imported;
}

/**
 * Função principal
 */
async function main() {
  console.log('\n🚀 Importação de Questões Traduzidas (PT-BR)');
  console.log('⚠️  NOTA: Questões em inglês NÃO serão afetadas\n');

  let totalImported = 0;

  for (const cert of certsToProcess) {
    const filePath = CERT_FILES[cert];
    const count = await importBRQuestions(cert, filePath);
    if (count) totalImported += count;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 TOTAL GERAL IMPORTADO: ${totalImported} questões PT-BR`);
  console.log('='.repeat(60));

  if (totalImported > 0) {
    console.log('\n✅ Sucesso! Próximos passos:');
    console.log('   1. Verificar no Supabase Dashboard:');
    console.log('      → Table Editor → questions');
    console.log('      → Procurar por IDs com sufixo "-br"');
    console.log('   2. Confirmar que questões em inglês continuam intactas');
    console.log('   3. Atualizar app para usar questões PT-BR\n');
  }
}

main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
