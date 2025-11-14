-- Script SQL para remover questões em português do SAA-C03
-- Cole no Supabase SQL Editor e execute

-- Passo 1: Encontrar as 75 questões em português (IDs que foram processadas)
-- Essas são as que deram erro de constraint

-- Passo 2: Remover respostas de usuário para essas questões
-- (Isso não funciona diretamente porque há foreign key, então vamos usar outra abordagem)

-- Abordagem: Deletar tudo via uma única transação

-- IDs que ainda têm erro:
-- saa-c03-resilient-010
-- saa-c03-secure-029
-- saa-c03-secure-132
-- saa-c03-secure-032
-- saa-c03-secure-037
-- ... (e mais 70)

-- Solução: Remover com Cascade ou via RLS

-- Opção 1: Via DELETE com subconsulta (pode ter problema de constraint ainda)
DELETE FROM user_answers
WHERE question_id IN (
  SELECT id FROM questions
  WHERE certification_id = 'SAA-C03'
  AND (
    question_text ILIKE '%empresa%' OR
    question_text ILIKE '%qual%' OR
    question_text ILIKE '%aplicação%' OR
    question_text ILIKE '%precisa%' OR
    question_text ILIKE '%solução%'
  )
);

-- Opção 2: Agora remover as questões
DELETE FROM questions
WHERE certification_id = 'SAA-C03'
AND (
  question_text ILIKE '%empresa%' OR
  question_text ILIKE '%qual%' OR
  question_text ILIKE '%aplicação%' OR
  question_text ILIKE '%precisa%' OR
  question_text ILIKE '%solução%'
);

-- Verificar resultado
SELECT COUNT(*) as "Total SAA-C03" FROM questions WHERE certification_id = 'SAA-C03';
