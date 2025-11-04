/**
 * Script para consertar JSON com chaves sem aspas
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const filePath = process.argv[2] || 'data/custom-questions.json';
const fullPath = join(process.cwd(), filePath);

console.log('🔧 Consertando JSON...');
console.log(`📂 Arquivo: ${filePath}\n`);

try {
  // Ler arquivo
  let content = readFileSync(fullPath, 'utf-8');

  // Adicionar aspas nas chaves
  content = content
    .replace(/(\s+)question:/g, '$1"question":')
    .replace(/(\s+)options:/g, '$1"options":')
    .replace(/(\s+)correctAnswer:/g, '$1"correctAnswer":')
    .replace(/(\s+)explanation:/g, '$1"explanation":')
    .replace(/(\s+)multiSelect:/g, '$1"multiSelect":');

  // Remover vírgula antes de ] (último item do array)
  content = content.replace(/,(\s*)\]/g, '$1]');

  // Remover vírgula antes de } (último campo do objeto)
  content = content.replace(/,(\s*)\}/g, '$1}');

  // Salvar arquivo corrigido
  writeFileSync(fullPath, content, 'utf-8');

  console.log('✅ JSON consertado com sucesso!');
  console.log('\n📝 Agora execute:');
  console.log('   npm run import-custom');
} catch (error) {
  console.error('❌ Erro:', error);
  process.exit(1);
}
