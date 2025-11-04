-- ============================================
-- MIGRATION: Suporte a Questões Multiselect
-- Adiciona colunas necessárias para questões com múltiplas respostas corretas
-- ============================================

-- 1. Adicionar option_e (5ª alternativa opcional)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_e TEXT NULL;

-- 2. Adicionar correct_answers (array de respostas corretas)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS correct_answers TEXT[] NULL;

-- 3. Adicionar required_selection_count (quantas alternativas devem ser selecionadas)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS required_selection_count INT DEFAULT 1;

-- 4. Remover constraint antiga de correct_answer e adicionar nova que inclui 'E'
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_correct_answer_check;
ALTER TABLE questions ADD CONSTRAINT questions_correct_answer_check
  CHECK (correct_answer IN ('A', 'B', 'C', 'D', 'E'));

-- 5. Atualizar constraint de selected_answer em user_answers para incluir 'E'
ALTER TABLE user_answers DROP CONSTRAINT IF EXISTS user_answers_selected_answer_check;
ALTER TABLE user_answers ADD CONSTRAINT user_answers_selected_answer_check
  CHECK (selected_answer IN ('A', 'B', 'C', 'D', 'E'));

-- 6. Popular correct_answers com valores de correct_answer existentes
UPDATE questions
SET correct_answers = ARRAY[correct_answer]
WHERE correct_answers IS NULL;

-- 7. Popular required_selection_count com 1 para questões existentes
UPDATE questions
SET required_selection_count = 1
WHERE required_selection_count IS NULL OR required_selection_count = 0;

-- 8. Criar índice para melhorar performance de queries com multiselect
CREATE INDEX IF NOT EXISTS idx_questions_multiselect
  ON questions(certification_id, required_selection_count);

-- ============================================
-- VERIFICAÇÃO PÓS-MIGRAÇÃO
-- ============================================
-- Execute este comando para verificar se a migração foi bem-sucedida:
--
-- SELECT
--   id,
--   correct_answer,
--   correct_answers,
--   required_selection_count,
--   option_e
-- FROM questions
-- LIMIT 5;
