/**
 * Script INTELIGENTE de importação
 * - Detecta domínio automaticamente
 * - Gera explicações de alternativas incorretas
 * - Extrai tags
 * - Importa corretamente no Supabase
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
const startId = parseInt(args.find(arg => arg.startsWith('--start='))?.split('=')[1] || '1');
const tier = (args.find(arg => arg.startsWith('--tier='))?.split('=')[1] || 'FREE') as 'FREE' | 'PRO';
const filePath = args.find(arg => arg.startsWith('--file='))?.split('=')[1] || 'data/custom-questions.json';
const clearFirst = args.includes('--clear');

/**
 * DETECTA O DOMÍNIO baseado em palavras-chave
 */
function detectDomain(question: string, options: string[]): string {
  const text = `${question} ${options.join(' ')}`.toLowerCase();

  // Contadores de score por domínio
  const scores = {
    SECURE: 0,
    RESILIENT: 0,
    PERFORMANCE: 0,
    COST: 0
  };

  // Palavras-chave SECURE (Segurança)
  const secureKeywords = [
    'segurança', 'security', 'iam', 'permissão', 'permissões', 'permission',
    'acesso', 'access', 'autenticação', 'authentication', 'autorização',
    'authorization', 'criptografia', 'encryption', 'kms', 'certificado',
    'certificate', 'ssl', 'tls', 'vpc', 'security group', 'nacl',
    'waf', 'shield', 'guardduty', 'inspector', 'macie', 'secrets manager',
    'cognito', 'mfa', 'firewall', 'compliance', 'audit', 'cloudtrail',
    'config', 'controle de acesso', 'política', 'policy', 'role',
    'usuário', 'user', 'credential', 'token', 'chave', 'privacidade',
    'gdpr', 'hipaa', 'pci', 'detective', 'ameaça', 'threat', 'vulnerabilidade'
  ];

  // Palavras-chave RESILIENT (Resiliência/Disponibilidade)
  const resilientKeywords = [
    'disponibilidade', 'availability', 'resiliência', 'resilient', 'backup',
    'recuperação', 'recovery', 'disaster', 'failover', 'alta disponibilidade',
    'high availability', 'multi-az', 'multi-region', 'replicação',
    'replication', 'snapshot', 'rds', 'aurora', 'elasticache',
    'redundância', 'redundancy', 'auto scaling', 'load balancer',
    'health check', 'route 53', 'cloudfront', 's3 versioning',
    'glacier', 'durabilidade', 'durability', 'rto', 'rpo',
    'tolerância a falhas', 'fault tolerant', 'elb', 'alb', 'nlb'
  ];

  // Palavras-chave PERFORMANCE (Desempenho)
  const performanceKeywords = [
    'desempenho', 'performance', 'latência', 'latency', 'throughput',
    'velocidade', 'speed', 'otimização', 'optimization', 'cache',
    'caching', 'cloudfront', 'elasticache', 'redis', 'memcached',
    'accelerator', 'global accelerator', 'direct connect', 'vpc peering',
    'transit gateway', 'ebs optimized', 'provisioned iops', 'io1', 'io2',
    'lambda edge', 'appsync', 'dynamodb accelerator', 'dax',
    'read replica', 'query', 'índice', 'index', 'partition key',
    'escala', 'scale', 'rápido', 'fast', 'lento', 'slow'
  ];

  // Palavras-chave COST (Custo)
  const costKeywords = [
    'custo', 'cost', 'preço', 'pricing', 'economia', 'economizar',
    'barato', 'cheap', 'caro', 'expensive', 'otimização de custos',
    'cost optimization', 'savings plan', 'reserved instance', 'spot instance',
    's3 glacier', 's3 intelligent-tiering', 's3 standard-ia', 's3 one zone-ia',
    'lifecycle', 'billing', 'faturamento', 'budget', 'orçamento',
    'trusted advisor', 'cost explorer', 'compute optimizer',
    'reduzir', 'reduce', 'menor', 'menor custo', 'lowest cost',
    'mais barato', 'cheapest', 'pay as you go', 'capex', 'opex'
  ];

  // Calcular scores
  secureKeywords.forEach(keyword => {
    if (text.includes(keyword)) scores.SECURE += 1;
  });

  resilientKeywords.forEach(keyword => {
    if (text.includes(keyword)) scores.RESILIENT += 1;
  });

  performanceKeywords.forEach(keyword => {
    if (text.includes(keyword)) scores.PERFORMANCE += 1;
  });

  costKeywords.forEach(keyword => {
    if (text.includes(keyword)) scores.COST += 1;
  });

  // Retornar domínio com maior score
  const maxScore = Math.max(scores.SECURE, scores.RESILIENT, scores.PERFORMANCE, scores.COST);

  if (maxScore === 0) {
    // Se não detectou nada, usar heurística pela posição
    return 'SECURE'; // default
  }

  if (scores.SECURE === maxScore) return 'SECURE';
  if (scores.RESILIENT === maxScore) return 'RESILIENT';
  if (scores.PERFORMANCE === maxScore) return 'PERFORMANCE';
  if (scores.COST === maxScore) return 'COST';

  return 'SECURE';
}

/**
 * GERA EXPLICAÇÃO para alternativa incorreta
 */
function generateIncorrectExplanation(
  questionText: string,
  option: string,
  correctOption: string,
  correctLetter: string
): string {
  const optionLower = option.toLowerCase();
  const questionLower = questionText.toLowerCase();

  // Templates inteligentes baseados em padrões comuns

  // Se menciona um serviço AWS
  const awsServiceMatch = option.match(/AWS\s+([A-Za-z]+\s*[A-Za-z]*)|Amazon\s+([A-Za-z]+)/i);
  if (awsServiceMatch) {
    const service = awsServiceMatch[1] || awsServiceMatch[2];

    if (questionLower.includes('segurança') || questionLower.includes('security')) {
      return `${service} não é a solução mais adequada para este requisito de segurança. A resposta correta oferece recursos mais específicos para o cenário descrito.`;
    }

    if (questionLower.includes('custo') || questionLower.includes('econom')) {
      return `Embora ${service} seja uma opção válida, não oferece o melhor custo-benefício para este caso. A alternativa ${correctLetter} é mais econômica.`;
    }

    if (questionLower.includes('desempenho') || questionLower.includes('latência') || questionLower.includes('performance')) {
      return `${service} não oferece o melhor desempenho para este cenário específico. A resposta correta proporciona latência menor ou throughput maior.`;
    }

    if (questionLower.includes('disponibilidade') || questionLower.includes('backup') || questionLower.includes('recuperação')) {
      return `${service} não atende completamente aos requisitos de alta disponibilidade ou recuperação de desastres mencionados na questão.`;
    }
  }

  // Padrões genéricos
  if (optionLower.includes('não') || optionLower.includes('incorret')) {
    return 'Esta afirmação está incorreta ou não se aplica ao cenário descrito.';
  }

  if (questionLower.includes('menor custo') || questionLower.includes('mais barato')) {
    return 'Esta opção não representa a solução com menor custo para o requisito especificado.';
  }

  if (questionLower.includes('melhor prática') || questionLower.includes('best practice')) {
    return 'Esta não é considerada uma melhor prática da AWS para o cenário apresentado.';
  }

  // Template padrão
  return 'Esta opção não atende completamente aos requisitos especificados na questão. A resposta correta oferece uma solução mais apropriada para o cenário.';
}

/**
 * Extrai letra da resposta
 */
function extractAnswerLetter(answer: string | string[]): 'A' | 'B' | 'C' | 'D' {
  if (Array.isArray(answer)) {
    const first = answer[0].trim().charAt(0);
    return first as 'A' | 'B' | 'C' | 'D';
  }
  const letter = answer.trim().charAt(0);
  return letter as 'A' | 'B' | 'C' | 'D';
}

/**
 * Extrai todas as letras corretas
 */
function extractAllAnswerLetters(answer: string | string[]): string[] {
  if (Array.isArray(answer)) {
    return answer.map(a => a.trim().charAt(0));
  }
  return [answer.trim().charAt(0)];
}

/**
 * Remove prefixo das opções
 */
function cleanOption(option: string): string {
  return option.replace(/^[A-E]\.\s*/, '').trim();
}

/**
 * Extrai tags
 */
function extractTags(question: string, options: string[]): string[] {
  const text = `${question} ${options.join(' ')}`;
  const tags = new Set<string>();

  const awsServices = [
    'S3', 'EC2', 'RDS', 'Lambda', 'DynamoDB', 'CloudFront', 'Route 53',
    'VPC', 'IAM', 'CloudWatch', 'CloudTrail', 'EBS', 'EFS', 'ELB',
    'Auto Scaling', 'Elastic Beanstalk', 'SNS', 'SQS', 'API Gateway',
    'Kinesis', 'Redshift', 'EMR', 'Glue', 'Athena', 'QuickSight',
    'SageMaker', 'Rekognition', 'Comprehend', 'Step Functions',
    'Systems Manager', 'Secrets Manager', 'KMS', 'WAF', 'Shield',
    'GuardDuty', 'Inspector', 'Macie', 'Config', 'CloudFormation',
    'DataSync', 'Application Migration Service', 'Application Discovery Service',
    'DMS', 'Snow Family', 'Storage Gateway', 'Direct Connect',
    'Transit Gateway', 'PrivateLink', 'QLDB', 'Neptune', 'DocumentDB',
    'ElastiCache', 'MemoryDB', 'Cognito', 'Amplify', 'AppSync'
  ];

  for (const service of awsServices) {
    const regex = new RegExp(service, 'gi');
    if (regex.test(text)) {
      tags.add(service);
    }
  }

  if (tags.size === 0) tags.add('AWS');

  return Array.from(tags).slice(0, 8);
}

/**
 * Detecta dificuldade
 */
function detectDifficulty(question: string, options: string[]): 'easy' | 'medium' | 'hard' {
  const text = `${question} ${options.join(' ')}`.toLowerCase();

  // Questões difíceis geralmente:
  // - Têm múltiplas condições
  // - Pedem "melhor" ou "mais otimizado"
  // - Mencionam múltiplos serviços
  // - Pedem seleção de DUAS ou mais opções

  if (
    text.includes('selecione dois') ||
    text.includes('selecione duas') ||
    text.includes('select two') ||
    text.includes('exceto') ||
    text.includes('except') ||
    text.includes('não')
  ) {
    return 'hard';
  }

  if (
    text.includes('melhor') ||
    text.includes('best') ||
    text.includes('mais') ||
    text.includes('most') ||
    text.includes('otimiz') ||
    text.includes('optimi')
  ) {
    return 'medium';
  }

  return 'easy';
}

/**
 * Converte questão
 */
function convertQuestion(custom: CustomQuestion, index: number): any {
  // Detectar domínio
  const domain = detectDomain(custom.question, custom.options);

  // Gerar ID
  const id = `${certId.toLowerCase()}-${domain.toLowerCase()}-${String(startId + index).padStart(3, '0')}`;

  // Extrair opções
  const optionA = cleanOption(custom.options[0] || '');
  const optionB = cleanOption(custom.options[1] || '');
  const optionC = cleanOption(custom.options[2] || '');
  const optionD = cleanOption(custom.options[3] || '');

  // Resposta correta
  const correctLetter = extractAnswerLetter(custom.correctAnswer);
  const allCorrectLetters = extractAllAnswerLetters(custom.correctAnswer);
  const correctOption = custom.correctAnswer;

  // Gerar explicações para alternativas incorretas
  const incorrectExplanations: any = {};

  if (!allCorrectLetters.includes('A')) {
    incorrectExplanations.A = generateIncorrectExplanation(custom.question, optionA, correctOption as string, correctLetter);
  }
  if (!allCorrectLetters.includes('B')) {
    incorrectExplanations.B = generateIncorrectExplanation(custom.question, optionB, correctOption as string, correctLetter);
  }
  if (!allCorrectLetters.includes('C')) {
    incorrectExplanations.C = generateIncorrectExplanation(custom.question, optionC, correctOption as string, correctLetter);
  }
  if (!allCorrectLetters.includes('D')) {
    incorrectExplanations.D = generateIncorrectExplanation(custom.question, optionD, correctOption as string, correctLetter);
  }

  // Tags e dificuldade
  const tags = extractTags(custom.question, custom.options);
  const difficulty = detectDifficulty(custom.question, custom.options);

  return {
    id,
    certification_id: certId,
    domain: domain,
    question_text: custom.question,
    option_a: optionA,
    option_b: optionB,
    option_c: optionC,
    option_d: optionD,
    correct_answer: correctLetter,
    explanation_basic: custom.explanation,
    explanation_detailed: custom.explanation + (custom.multiSelect ? '\n\nObservação: Esta é uma questão de múltipla escolha que pode ter mais de uma resposta correta.' : ''),
    incorrect_explanations: incorrectExplanations,
    tags,
    difficulty,
    tier,
    active: true
  };
}

async function main() {
  console.log('🚀 Importação INTELIGENTE de Questões\n');
  console.log(`📂 Arquivo: ${filePath}`);
  console.log(`📚 Certificação: ${certId}`);
  console.log(`🔢 ID inicial: ${startId}`);
  console.log(`🎯 Tier: ${tier}\n`);

  // Limpar questões antigas se solicitado
  if (clearFirst) {
    console.log('🗑️  Limpando questões antigas...');
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
    process.exit(1);
  }

  console.log(`📝 ${questions.length} questões encontradas\n`);
  console.log('🔍 Detectando domínios e gerando explicações...\n');

  let imported = 0;
  let errors = 0;
  const domainCounts = { SECURE: 0, RESILIENT: 0, PERFORMANCE: 0, COST: 0 };

  for (let i = 0; i < questions.length; i++) {
    const customQuestion = questions[i];

    try {
      const dbQuestion = convertQuestion(customQuestion, i);

      // Contar por domínio
      domainCounts[dbQuestion.domain as keyof typeof domainCounts]++;

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
  console.log('\n📈 Distribuição por Domínio:');
  console.log(`  🔒 SECURE: ${domainCounts.SECURE} questões (${Math.round(domainCounts.SECURE / imported * 100)}%)`);
  console.log(`  🏗️  RESILIENT: ${domainCounts.RESILIENT} questões (${Math.round(domainCounts.RESILIENT / imported * 100)}%)`);
  console.log(`  ⚡ PERFORMANCE: ${domainCounts.PERFORMANCE} questões (${Math.round(domainCounts.PERFORMANCE / imported * 100)}%)`);
  console.log(`  💰 COST: ${domainCounts.COST} questões (${Math.round(domainCounts.COST / imported * 100)}%)`);
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
