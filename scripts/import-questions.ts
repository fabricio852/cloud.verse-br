/**
 * Script para importar questões dos arquivos JSON para o Supabase
 *
 * Uso:
 *   npm run import-questions
 *   npm run import-questions:clear  (limpa e reimporta)
 *
 * Flags:
 *   --clear: Limpa todas as questões antes de importar
 *   --cert=SAA-C03: Importa apenas uma certificação específica
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Database } from '../types/database.js';

// Configurar __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
config({ path: join(__dirname, '..', '.env.local') });

// Configuração do Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas');
  console.error('📝 Crie o arquivo .env.local na raiz do projeto com essas variáveis');
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Tipos para os arquivos JSON
interface QuestionJSON {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct: 'A' | 'B' | 'C' | 'D';
  explanation_basic: string;
  explanation_detailed: string;
  incorrect_explanations: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
  };
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  tier: 'FREE' | 'PRO';
}

interface DomainFileJSON {
  certification: string;
  domain: string;
  questions: QuestionJSON[];
}

// Parsear argumentos
const args = process.argv.slice(2);
const shouldClear = args.includes('--clear');
const certFilter = args.find(arg => arg.startsWith('--cert='))?.split('=')[1];

async function main() {
  console.log('🚀 Iniciando importação de questões...\n');

  // Limpar questões se solicitado
  if (shouldClear) {
    console.log('🗑️  Limpando questões existentes...');
    const { error } = await supabase.from('questions').delete().neq('id', '');
    if (error) {
      console.error('❌ Erro ao limpar questões:', error);
      process.exit(1);
    }
    console.log('✅ Questões limpas com sucesso\n');
  }

  const dataPath = join(process.cwd(), 'data', 'certifications');
  const certifications = readdirSync(dataPath).filter(name => {
    const path = join(dataPath, name);
    return readdirSync(path).length > 0;
  });

  let totalImported = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  // Filtrar certificações se especificado
  const certsToImport = certFilter
    ? certifications.filter(cert => cert === certFilter)
    : certifications;

  if (certsToImport.length === 0) {
    console.error(`❌ Certificação "${certFilter}" não encontrada`);
    process.exit(1);
  }

  for (const certId of certsToImport) {
    console.log(`📚 Processando certificação: ${certId}`);
    const certPath = join(dataPath, certId);

    // Listar arquivos de domínio (secure.json, resilient.json, etc)
    const domainFiles = readdirSync(certPath).filter(f =>
      f.endsWith('.json') && f !== 'metadata.json'
    );

    for (const domainFile of domainFiles) {
      const filePath = join(certPath, domainFile);
      const domain = domainFile.replace('.json', '').toUpperCase();

      console.log(`  📄 Importando ${domainFile}...`);

      try {
        const fileContent = readFileSync(filePath, 'utf-8');
        const data: DomainFileJSON = JSON.parse(fileContent);

        for (const question of data.questions) {
          // Pular templates vazios
          if (question.question.includes('[ADICIONE SUA QUESTÃO AQUI]')) {
            totalSkipped++;
            continue;
          }

          // Validar questão
          if (!validateQuestion(question)) {
            console.error(`    ❌ Questão inválida: ${question.id}`);
            totalErrors++;
            continue;
          }

          // Preparar dados para inserção
          const questionData = {
            id: question.id,
            certification_id: certId,
            domain: domain,
            question_text: question.question,
            option_a: question.options.A,
            option_b: question.options.B,
            option_c: question.options.C,
            option_d: question.options.D,
            correct_answer: question.correct,
            explanation_basic: question.explanation_basic,
            explanation_detailed: question.explanation_detailed,
            explanation_incorrect_a: question.incorrect_explanations.A || null,
            explanation_incorrect_b: question.incorrect_explanations.B || null,
            explanation_incorrect_c: question.incorrect_explanations.C || null,
            explanation_incorrect_d: question.incorrect_explanations.D || null,
            tags: question.tags,
            difficulty: question.difficulty,
            tier: question.tier,
            times_answered: 0,
            times_correct: 0,
            active: true
          };

          // Inserir no Supabase
          const { error } = await supabase
            .from('questions')
            .upsert(questionData, { onConflict: 'id' });

          if (error) {
            console.error(`    ❌ Erro ao importar ${question.id}:`, error.message);
            totalErrors++;
          } else {
            totalImported++;
            process.stdout.write('.');
          }
        }

        console.log(''); // Nova linha após os pontos
      } catch (error) {
        console.error(`  ❌ Erro ao processar ${domainFile}:`, error);
        totalErrors++;
      }
    }
  }

  console.log('\n');
  console.log('📊 Resumo da Importação:');
  console.log(`  ✅ Questões importadas: ${totalImported}`);
  console.log(`  ⏭️  Questões ignoradas (templates): ${totalSkipped}`);
  console.log(`  ❌ Erros: ${totalErrors}`);
  console.log('\n✨ Importação concluída!');
}

function validateQuestion(question: QuestionJSON): boolean {
  // Validações básicas
  if (!question.id || !question.question) return false;
  if (!question.options.A || !question.options.B || !question.options.C || !question.options.D) return false;
  if (!['A', 'B', 'C', 'D'].includes(question.correct)) return false;
  if (!question.explanation_basic || !question.explanation_detailed) return false;
  if (!['easy', 'medium', 'hard'].includes(question.difficulty)) return false;
  if (!['FREE', 'PRO'].includes(question.tier)) return false;
  if (!Array.isArray(question.tags) || question.tags.length === 0) return false;

  return true;
}

// Executar script
main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
