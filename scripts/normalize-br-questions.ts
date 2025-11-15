/**
 * Script para normalizar questões em PT-BR
 * Converte valores em português para inglês no schema
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const CERT_FILES: Record<string, string> = {
  'SAA-C03': 'data/saa-questions-br.json',
  'CLF-C02': 'data/clf-questions-br.json',
  'AIF-C01': 'data/aif-questions-br.json'
};

function normalizeQuestion(q: any) {
  // Normalizar difficulty (português → inglês)
  if (q.difficulty) {
    const difficultyMap: Record<string, string> = {
      'fácil': 'easy',
      'médio': 'medium',
      'difícil': 'hard',
      'easy': 'easy',
      'medium': 'medium',
      'hard': 'hard'
    };
    q.difficulty = difficultyMap[q.difficulty] || 'medium';
  } else {
    q.difficulty = 'medium';
  }

  // Normalizar tier (português → inglês)
  if (q.tier) {
    const tierMap: Record<string, string> = {
      'GRATUITO': 'FREE',
      'PROFISSIONAL': 'PRO',
      'FREE': 'FREE',
      'PRO': 'PRO'
    };
    q.tier = tierMap[q.tier] || 'FREE';
  } else {
    q.tier = 'FREE';
  }

  return q;
}

async function normalizeAll() {
  console.log('🔄 Normalizando questões...\n');

  for (const [cert, filePath] of Object.entries(CERT_FILES)) {
    try {
      const fileContent = readFileSync(join(process.cwd(), filePath), 'utf-8');
      const questions = JSON.parse(fileContent);

      // Normalizar cada questão
      const normalized = questions.map((q: any) => normalizeQuestion(q));

      // Salvar arquivo normalizado
      writeFileSync(
        join(process.cwd(), filePath),
        JSON.stringify(normalized, null, 2)
      );

      console.log(`✅ ${cert}: ${normalized.length} questões normalizadas`);

      // Mostrar valores únicos
      const diffValues = [...new Set(normalized.map(q => q.difficulty))];
      const tierValues = [...new Set(normalized.map(q => q.tier))];
      console.log(`   Difficulty: ${diffValues.join(', ')}`);
      console.log(`   Tier: ${tierValues.join(', ')}\n`);

    } catch (error) {
      console.error(`❌ Erro ao processar ${cert}:`, error);
    }
  }

  console.log('🎉 Normalização concluída!');
  console.log('\nPróximo passo: Execute novamente o script de geração SQL');
  console.log('npm run generate-sql:split');
}

normalizeAll().catch(console.error);
