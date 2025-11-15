/**
 * Script de importação para questões no formato PADRONIZADO
 * Compatível com AIF-C01, CLF-C02, SAA-C03 e futuras certificações
 * Suporta multiselect e todos os campos do schema
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
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || (!SUPABASE_ANON_KEY && !SUPABASE_SERVICE_ROLE_KEY)) {
  console.error('? Erro: Variveis de ambiente no encontradas');
  process.exit(1);
}

const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY!;
const usingServiceRole = Boolean(SUPABASE_SERVICE_ROLE_KEY);

if (!usingServiceRole) {
  console.warn(
    '?  Ateno: usando a chave annima (VITE_SUPABASE_ANON_KEY). Inseres podem ser bloqueadas pelo RLS. ' +
      'Adicione SUPABASE_SERVICE_ROLE_KEY ao .env.local para ingesto administrativa.'
  );
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);


interface StandardizedQuestion {
  id: string;
  certification_id: string;
  domain: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tier: 'FREE' | 'PRO';
  required_selection_count: number;
  active: boolean;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e?: string;
  correct_answers: string[];
  explanation_detailed: string;
  explanation_basic?: string;
  incorrect_explanations?: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
    E?: string;
  };
  tags?: string[];
}

// Argumentos
const args = process.argv.slice(2);
const certId = args.find(arg => arg.startsWith('--cert='))?.split('=')[1];
const filePath = args.find(arg => arg.startsWith('--file='))?.split('=')[1] || 'data/aif-questions.json';
const clearFirst = args.includes('--clear');

/**
 * Valida questão padronizada
 */
function validateQuestion(q: any, index: number): string[] {
  const errors: string[] = [];

  if (!q.id) errors.push(`Questão ${index + 1}: Campo 'id' obrigatório`);
  if (!q.certification_id) errors.push(`Questão ${index + 1}: Campo 'certification_id' obrigatório`);
  if (!q.domain) errors.push(`Questão ${index + 1}: Campo 'domain' obrigatório`);
  if (!q.question_text) errors.push(`Questão ${index + 1}: Campo 'question_text' obrigatório`);
  if (!q.option_a) errors.push(`Questão ${index + 1}: Campo 'option_a' obrigatório`);
  if (!q.option_b) errors.push(`Questão ${index + 1}: Campo 'option_b' obrigatório`);
  if (!q.option_c) errors.push(`Questão ${index + 1}: Campo 'option_c' obrigatório`);
  if (!q.option_d) errors.push(`Questão ${index + 1}: Campo 'option_d' obrigatório`);

  if (!q.correct_answers) {
    errors.push(`Questão ${index + 1}: Campo 'correct_answers' obrigatório`);
  } else if (!Array.isArray(q.correct_answers)) {
    errors.push(`Questão ${index + 1}: Campo 'correct_answers' deve ser um array (ex: ["A"])`);
  } else if (q.correct_answers.length === 0) {
    errors.push(`Questão ${index + 1}: Campo 'correct_answers' não pode estar vazio`);
  }

  if (q.required_selection_count === undefined) {
    errors.push(`Questão ${index + 1}: Campo 'required_selection_count' obrigatório`);
  }

  return errors;
}

/**
 * Converte questão para formato do banco
 */
function convertToDbFormat(q: StandardizedQuestion): any {
  // Normalizar correct_answers
  const correctAnswers = Array.isArray(q.correct_answers) ? q.correct_answers : [q.correct_answers];

  // Para compatibilidade com código legado, manter correct_answer com a primeira letra
  const correctAnswer = correctAnswers[0];

  // Extrair tags automaticamente se não fornecidas
  const tags = q.tags || extractTags(q);

  // Montar o registro para o banco
  const dbRecord: any = {
    id: q.id,
    certification_id: q.certification_id,
    domain: q.domain,
    difficulty: q.difficulty || 'medium',
    tier: q.tier || 'FREE',
    active: q.active !== false, // default true
    question_text: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_answer: correctAnswer,
    explanation_basic: q.explanation_basic || q.explanation_detailed?.substring(0, 200),
    explanation_detailed: q.explanation_detailed,
    incorrect_explanations: q.incorrect_explanations || {},
    tags,
  };

  // Campos adicionados após migração (tentar incluir, ignorar erro se não existirem)
  if (q.option_e) {
    dbRecord.option_e = q.option_e;
  }

  dbRecord.correct_answers = correctAnswers;
  dbRecord.required_selection_count = q.required_selection_count;

  return dbRecord;
}

/**
 * Extrai tags automaticamente da questão
 */
function extractTags(q: StandardizedQuestion): string[] {
  const text = `${q.question_text} ${q.option_a} ${q.option_b} ${q.option_c} ${q.option_d}`;
  const tags = new Set<string>();

  const awsServices = [
    'Bedrock', 'SageMaker', 'Rekognition', 'Comprehend', 'Polly', 'Transcribe',
    'Translate', 'Lex', 'Kendra', 'Personalize', 'Forecast', 'Textract',
    'Q', 'CodeWhisperer', 'DevOps Guru', 'Augmented AI', 'A2I',
    'S3', 'EC2', 'RDS', 'Lambda', 'DynamoDB', 'CloudFront', 'Route 53',
    'VPC', 'IAM', 'CloudWatch', 'CloudTrail', 'EBS', 'EFS', 'ELB',
    'Auto Scaling', 'Elastic Beanstalk', 'SNS', 'SQS', 'API Gateway',
    'Kinesis', 'Redshift', 'EMR', 'Glue', 'Athena', 'QuickSight',
    'Step Functions', 'Systems Manager', 'Secrets Manager', 'KMS',
    'WAF', 'Shield', 'GuardDuty', 'Inspector', 'Macie', 'Config',
    'CloudFormation', 'DataSync', 'DMS', 'Storage Gateway',
    'Direct Connect', 'Transit Gateway', 'PrivateLink', 'ElastiCache',
    'MemoryDB', 'Cognito', 'Amplify', 'AppSync'
  ];

  for (const service of awsServices) {
    const regex = new RegExp(service, 'gi');
    if (regex.test(text)) {
      tags.add(service);
    }
  }

  // Tags por domínio
  if (q.domain === 'AI_FUNDAMENTALS') tags.add('AI Basics');
  if (q.domain === 'AI_SERVICES') tags.add('AWS AI');
  if (q.domain === 'RESPONSIBLE_AI') tags.add('Ethics');
  if (q.domain === 'ML_DEVELOPMENT') tags.add('MLOps');

  if (tags.size === 0) tags.add('AWS');

  return Array.from(tags).slice(0, 8);
}

async function main() {
  console.log('🚀 Importação de Questões Padronizadas\n');
  console.log(`📂 Arquivo: ${filePath}`);

  if (certId) {
    console.log(`📚 Certificação: ${certId} (forçada via parâmetro)`);
  }
  console.log('');

  // Limpar questões antigas se solicitado
  if (clearFirst && certId) {
    console.log(`🗑️  Limpando questões de ${certId}...`);
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('certification_id', certId);

    if (error) {
      console.error('❌ Erro ao limpar:', error.message);
    } else {
      console.log('✅ Questões antigas removidas\n');
    }
  }

  // Ler arquivo
  let questions: StandardizedQuestion[];
  try {
    const fileContent = readFileSync(join(process.cwd(), filePath), 'utf-8');
    questions = JSON.parse(fileContent);

    if (!Array.isArray(questions)) {
      console.error('❌ Erro: JSON deve ser um array de questões');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Erro ao ler arquivo:', error.message);
    process.exit(1);
  }

  console.log(`📝 ${questions.length} questões encontradas\n`);

  // Validar todas as questões primeiro
  console.log('🔍 Validando questões...\n');
  const allErrors: string[] = [];

  for (let i = 0; i < questions.length; i++) {
    const errors = validateQuestion(questions[i], i);
    if (errors.length > 0) {
      allErrors.push(...errors);
    }
  }

  if (allErrors.length > 0) {
    console.error('❌ Erros de validação encontrados:\n');
    allErrors.forEach(err => console.error(`   ${err}`));
    console.error(`\n❌ Total: ${allErrors.length} erro(s)`);
    console.error('\n💡 Corrija os erros e tente novamente.');
    process.exit(1);
  }

  console.log('✅ Todas as questões são válidas!\n');

  // Verificar se há questões multiselect ou com option_e
  const multiselectCount = questions.filter(q => q.required_selection_count > 1).length;
  const optionECount = questions.filter(q => q.option_e).length;

  if (multiselectCount > 0 || optionECount > 0) {
    console.log('⚠️  AVISOS:');
    if (multiselectCount > 0) {
      console.log(`   • ${multiselectCount} questões multiselect (apenas 1ª resposta será salva)`);
    }
    if (optionECount > 0) {
      console.log(`   • ${optionECount} questões com option_e (5ª opção será ignorada)`);
    }
    console.log('   Para suporte completo, execute a migração SQL:');
    console.log('   supabase/migration-multiselect.sql\n');
  }

  console.log('📥 Importando para o banco de dados...\n');

  let imported = 0;
  let errors = 0;
  const domainCounts: Record<string, number> = {};
  const certCounts: Record<string, number> = {};

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];

    try {
      // Se certId foi fornecido, sobrescrever
      if (certId) {
        question.certification_id = certId;
      }

      const dbQuestion = convertToDbFormat(question);

      // Contar por domínio e certificação
      domainCounts[dbQuestion.domain] = (domainCounts[dbQuestion.domain] || 0) + 1;
      certCounts[dbQuestion.certification_id] = (certCounts[dbQuestion.certification_id] || 0) + 1;

      // Inserir no Supabase
      const { error } = await supabase
        .from('questions')
        .upsert(dbQuestion, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Erro ao importar questão ${i + 1} (${question.id}):`, error.message);
        errors++;
      } else {
        imported++;
        process.stdout.write('.');

        if (imported % 50 === 0) {
          console.log(` ${imported}`);
        }
      }
    } catch (error: any) {
      console.error(`❌ Erro ao processar questão ${i + 1} (${question.id}):`, error.message);
      errors++;
    }
  }

  console.log('\n');
  console.log('📊 Resumo da Importação:');
  console.log(`  ✅ Importadas: ${imported}`);
  console.log(`  ❌ Erros: ${errors}`);
  console.log(`  📝 Total: ${questions.length}`);

  console.log('\n📈 Distribuição por Certificação:');
  Object.entries(certCounts).forEach(([cert, count]) => {
    console.log(`  📚 ${cert}: ${count} questões`);
  });

  console.log('\n📈 Distribuição por Domínio:');
  Object.entries(domainCounts).forEach(([domain, count]) => {
    const percentage = Math.round((count / imported) * 100);
    console.log(`  📂 ${domain}: ${count} questões (${percentage}%)`);
  });

  console.log('\n✨ Concluído!');

  if (imported > 0) {
    console.log(`\n🔗 Verifique no Supabase:`);
    console.log(`   Dashboard → Table Editor → questions`);
  }
}

main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
