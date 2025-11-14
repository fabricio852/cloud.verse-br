-- Script SQL para limpar SAA-C03 e remover respostas órfãs
-- Cole isso no Supabase SQL Editor e execute

-- Passo 1: Listar questões SAA-C03 com português (as antigas)
-- SELECT id, question_text FROM questions WHERE certification_id = 'SAA-C03' LIMIT 5;

-- Passo 2: Remover respostas de usuário para SAA-C03
DELETE FROM user_answers
WHERE question_id IN (
  SELECT id FROM questions WHERE certification_id = 'SAA-C03'
);

-- Passo 3: Remover questões SAA-C03
DELETE FROM questions WHERE certification_id = 'SAA-C03';

-- Passo 4: Verificar se limpou
-- SELECT COUNT(*) FROM questions WHERE certification_id = 'SAA-C03';
