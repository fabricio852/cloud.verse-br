/**
 * Script para importar questões de JSON customizado direto no Supabase
 *
 * Uso:
 *   1. Cole suas questões em um arquivo: data/custom-questions.json
 *   2. Execute: npm run import-custom
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Database } from '../types/database.js';

// Configurar __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Tipo do formato customizado
interface CustomQuestion {
  question: string;
  options: string[];
  correctAnswer: string | string[];
  explanation: string;
  multiSelect: boolean;
}

// Argumentos
const args = process.argv.slice(2);
const certId = args.find(arg => arg.startsWith('--cert='))?.split('=')[1] || 'SAA-C03';
const domain = args.find(arg => arg.startsWith('--domain='))?.split('=')[1] || 'SECURE';
const startId = parseInt(args.find(arg => arg.startsWith('--start='))?.split('=')[1] || '1');
const tier = (args.find(arg => arg.startsWith('--tier='))?.split('=')[1] || 'FREE') as 'FREE' | 'PRO';
const difficulty = (args.find(arg => arg.startsWith('--difficulty='))?.split('=')[1] || 'medium') as 'easy' | 'medium' | 'hard';
const filePath = args.find(arg => arg.startsWith('--file='))?.split('=')[1] || 'data/custom-questions.json';

/**
 * Extrai a letra da resposta correta
 */
function extractAnswerLetter(answer: string | string[]): 'A' | 'B' | 'C' | 'D' | string {
  if (Array.isArray(answer)) {
    // Multi-select: pegar primeira letra
    const first = answer[0].trim().charAt(0);
    return first as 'A' | 'B' | 'C' | 'D';
  }

  const letter = answer.trim().charAt(0);
  return letter as 'A' | 'B' | 'C' | 'D';
}

/**
 * Extrai todas as letras corretas (para multi-select)
 */
function extractAllAnswerLetters(answer: string | string[]): string[] {
  if (Array.isArray(answer)) {
    return answer.map(a => a.trim().charAt(0));
  }
  return [answer.trim().charAt(0)];
}

/**
 * Remove prefixo "A. ", "B. " das opções
 */
function cleanOption(option: string): string {
  return option.replace(/^[A-D]\.\s*/, '').trim();
}

/**
 * Extrai tags (serviços AWS) da questão
 */
function extractTags(question: string, options: string[]): string[] {
  const text = `${question} ${options.join(' ')}`;
  const tags = new Set<string>();

  // Padrões comuns de serviços AWS
  const awsServices = [
    'S3', 'EC2', 'RDS', 'Lambda', 'DynamoDB', 'CloudFront', 'Route 53',
    'VPC', 'IAM', 'CloudWatch', 'CloudTrail', 'EBS', 'EFS', 'ELB',
    'Auto Scaling', 'Elastic Beanstalk', 'SNS', 'SQS', 'API Gateway',
    'Kinesis', 'Redshift', 'EMR', 'Glue', 'Athena', 'QuickSight',
    'SageMaker', 'Rekognition', 'Comprehend', 'Translate', 'Polly',
    'Step Functions', 'EventBridge', 'Systems Manager', 'Secrets Manager',
    'KMS', 'ACM', 'WAF', 'Shield', 'GuardDuty', 'Inspector', 'Macie',
    'Config', 'Trusted Advisor', 'CloudFormation', 'CDK', 'OpsWorks',
    'DataSync', 'Application Migration Service', 'Application Discovery Service',
    'Database Migration Service', 'DMS', 'Snow Family', 'Storage Gateway',
    'Direct Connect', 'VPN', 'Transit Gateway', 'PrivateLink', 'Quantum Ledger Database',
    'QLDB', 'Neptune', 'DocumentDB', 'ElastiCache', 'MemoryDB'
  ];

  for (const service of awsServices) {
    const regex = new RegExp(service, 'gi');
    if (regex.test(text)) {
      // Normalizar nome
      tags.add(service.replace(/\s+/g, ' '));
    }
  }

  // Adicionar algumas tags genéricas baseadas em palavras-chave
  if (/security|secure|encryption|iam|acesso|permission/gi.test(text)) tags.add('Security');
  if (/storage|armazenamento|bucket|volume/gi.test(text)) tags.add('Storage');
  if (/network|rede|vpc|subnet/gi.test(text)) tags.add('Networking');
  if (/database|banco de dados|sql|nosql/gi.test(text)) tags.add('Database');
  if (/cost|custo|pricing|economia/gi.test(text)) tags.add('Cost Optimization');
  if (/migration|migra[çc][ãa]o/gi.test(text)) tags.add('Migration');
  if (/monitoring|monitoramento|log/gi.test(text)) tags.add('Monitoring');
  if (/compliance|conformidade|audit/gi.test(text)) tags.add('Compliance');

  return Array.from(tags).slice(0, 8); // Máximo 8 tags
}

/**
 * Converte questão customizada para formato do Supabase
 */
function convertQuestion(custom: CustomQuestion, index: number): any {
  const id = `${certId.toLowerCase()}-${domain.toLowerCase()}-${String(startId + index).padStart(3, '0')}`;

  // Extrair opções
  const optionA = cleanOption(custom.options[0] || '');
  const optionB = cleanOption(custom.options[1] || '');
  const optionC = cleanOption(custom.options[2] || '');
  const optionD = cleanOption(custom.options[3] || '');

  // Resposta correta
  const correctLetter = extractAnswerLetter(custom.correctAnswer);
  const allCorrectLetters = extractAllAnswerLetters(custom.correctAnswer);

  // Tags
  const tags = extractTags(custom.question, custom.options);
  if (tags.length === 0) tags.push('AWS');

  // Explicações para alternativas incorretas
  const incorrectExplanations: any = {};
  ['A', 'B', 'C', 'D'].forEach(letter => {
    if (!allCorrectLetters.includes(letter)) {
      incorrectExplanations[letter] = `Esta opção não atende completamente aos requisitos da questão.`;
    }
  });

  return {
    id,
    certification_id: certId,
    domain: domain.toUpperCase(),
    question_text: custom.question,
    option_a: optionA,
    option_b: optionB,
    option_c: optionC,
    option_d: optionD,
    correct_answer: correctLetter,
    explanation_basic: custom.explanation,
    explanation_detailed: custom.explanation + (custom.multiSelect ? ' (Questão de múltipla escolha)' : ''),
    incorrect_explanations: incorrectExplanations,  // JSONB format
    tags,
    difficulty,
    tier,
    active: true
  };
}

async function main() {
  console.log('🚀 Importação de Questões Customizadas\n');
  console.log(`📂 Arquivo: ${filePath}`);
  console.log(`📚 Certificação: ${certId}`);
  console.log(`🏗️  Domínio: ${domain}`);
  console.log(`🔢 ID inicial: ${startId}`);
  console.log(`🎯 Tier: ${tier}`);
  console.log(`📊 Dificuldade: ${difficulty}\n`);

  // Ler arquivo
  let questions: CustomQuestion[];
  try {
    const fileContent = readFileSync(join(process.cwd(), filePath), 'utf-8');
    questions = JSON.parse(fileContent);

    if (!Array.isArray(questions)) {
      console.error('❌ Erro: JSON deve ser um array de questões');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erro ao ler arquivo:', error);
    console.error('\n💡 Dica: Certifique-se que o arquivo existe e é um JSON válido');
    process.exit(1);
  }

  console.log(`📝 ${questions.length} questões encontradas\n`);

  let imported = 0;
  let errors = 0;

  for (let i = 0; i < questions.length; i++) {
    const customQuestion = questions[i];

    try {
      const dbQuestion = convertQuestion(customQuestion, i);

      // Inserir no Supabase
      const { error } = await supabase
        .from('questions')
        .upsert(dbQuestion, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Erro ao importar questão ${i + 1}:`, error.message);
        errors++;
      } else {
        imported++;
        process.stdout.write('.');

        // Quebra de linha a cada 50 questões
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
  console.log('📊 Resumo:');
  console.log(`  ✅ Importadas: ${imported}`);
  console.log(`  ❌ Erros: ${errors}`);
  console.log(`  📝 Total: ${questions.length}`);
  console.log('\n✨ Concluído!');

  if (imported > 0) {
    console.log(`\n🔗 Verifique no Supabase:`);
    console.log(`   Dashboard → Table Editor → questions`);
    console.log(`   Filtro: certification_id = "${certId}" AND domain = "${domain}"`);
  }
}

main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
