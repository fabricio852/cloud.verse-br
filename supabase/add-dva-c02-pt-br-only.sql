-- ============================================
-- ADD DVA-C02 CERTIFICATION (PT-BR ONLY)
-- ============================================
-- Este script adiciona a certificação DVA-C02 APENAS para o app em PT-BR
-- O app em inglês NÃO verá esta certificação
-- ============================================

-- PASSO 1: Adicionar coluna locale à tabela certifications (se não existir)
ALTER TABLE certifications
ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'all';

-- PASSO 2: Adicionar comentário explicativo
COMMENT ON COLUMN certifications.locale IS 'Indica em qual versão do app a certificação aparece: "all", "pt-BR", "en"';

-- PASSO 3: Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_certifications_locale ON certifications(locale);

-- PASSO 4: Inserir certificação DVA-C02 (APENAS PT-BR)
INSERT INTO certifications (
  id,
  name,
  short_name,
  description,
  exam_duration_minutes,
  total_questions,
  passing_score,
  domains,
  active,
  locale
) VALUES (
  'DVA-C02',
  'AWS Certified Developer - Associate',
  'DVA-C02',
  'Valida a capacidade de desenvolver, implantar e depurar aplicações baseadas em nuvem usando a AWS',
  130,
  65,
  720,
  '[
    {"id": "DEVELOPMENT", "name": "Desenvolvimento", "weight": 0.30},
    {"id": "DVA_SECURITY", "name": "Segurança", "weight": 0.26},
    {"id": "DEPLOYMENT", "name": "Implantação", "weight": 0.22},
    {"id": "MONITORING", "name": "Monitoramento", "weight": 0.12},
    {"id": "REFACTORING", "name": "Refatoração", "weight": 0.10}
  ]'::jsonb,
  true,
  'pt-BR'  -- ← APENAS PT-BR!
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  description = EXCLUDED.description,
  exam_duration_minutes = EXCLUDED.exam_duration_minutes,
  total_questions = EXCLUDED.total_questions,
  passing_score = EXCLUDED.passing_score,
  domains = EXCLUDED.domains,
  active = EXCLUDED.active,
  locale = EXCLUDED.locale,
  updated_at = NOW();

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute para verificar que DVA-C02 está configurado corretamente:
-- SELECT id, name, locale, active FROM certifications ORDER BY id;
--
-- Resultado esperado:
-- AIF-C01  | AWS Certified AI Practitioner           | all   | true
-- CLF-C02  | AWS Certified Cloud Practitioner        | all   | true
-- DVA-C02  | AWS Certified Developer - Associate     | pt-BR | true
-- SAA-C03  | AWS Certified Solutions Architect       | all   | true
