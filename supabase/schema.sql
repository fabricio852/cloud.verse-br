-- ============================================
-- AWS TRAINER - SUPABASE DATABASE SCHEMA
-- ============================================
-- Execute este script no Supabase SQL Editor
-- Dashboard -> SQL Editor -> New Query -> Cole e Execute
-- ============================================

-- Habilitar extensão UUID (se não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: certifications
-- Armazena metadados das certificações
-- ============================================
CREATE TABLE IF NOT EXISTS certifications (
  id TEXT PRIMARY KEY,                    -- 'SAA-C03', 'CLF-C02', 'AIF-C01'
  name TEXT NOT NULL,                     -- 'AWS Certified Solutions Architect - Associate'
  short_name TEXT NOT NULL,               -- 'SAA-C03'
  description TEXT,
  exam_duration_minutes INT NOT NULL,     -- 130
  total_questions INT NOT NULL,           -- 65
  passing_score INT NOT NULL,             -- 720
  domains JSONB NOT NULL,                 -- Array de domínios com peso
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_certifications_active ON certifications(active);

-- ============================================
-- TABELA: questions
-- Armazena todas as questões (modular por certificação)
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,                    -- 'saa-secure-001'
  certification_id TEXT NOT NULL REFERENCES certifications(id),
  domain TEXT NOT NULL,                   -- 'SECURE', 'RESILIENT', etc.

  -- Conteúdo da questão
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),

  -- Explicações (níveis de acesso)
  explanation_basic TEXT NOT NULL,        -- FREE tier
  explanation_detailed TEXT NOT NULL,     -- PRO tier
  incorrect_explanations JSONB NOT NULL,  -- {A: "...", B: "...", C: "..."}

  -- Metadados
  tags TEXT[],                            -- ['S3', 'IAM', 'Security']
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tier TEXT NOT NULL CHECK (tier IN ('FREE', 'PRO')),

  -- Controle
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_questions_cert ON questions(certification_id);
CREATE INDEX IF NOT EXISTS idx_questions_domain ON questions(domain);
CREATE INDEX IF NOT EXISTS idx_questions_tier ON questions(tier);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(active);
CREATE INDEX IF NOT EXISTS idx_questions_cert_active ON questions(certification_id, active);

-- ============================================
-- TABELA: profiles
-- Estende auth.users com dados do app
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,

  -- Plano do usuário
  plan TEXT NOT NULL DEFAULT 'FREE' CHECK (plan IN ('FREE', 'PRO', 'PRO_PLUS')),

  -- Limites FREE (reset diário)
  daily_quiz_count INT DEFAULT 0,
  daily_quiz_reset_at TIMESTAMPTZ DEFAULT NOW(),
  ai_questions_today INT DEFAULT 0,

  -- Stripe
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT,               -- 'active', 'canceled', 'past_due'
  subscription_ends_at TIMESTAMPTZ,

  -- Gamificação
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  streak_days INT DEFAULT 0,
  last_activity_date DATE,

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca por Stripe customer
CREATE INDEX IF NOT EXISTS idx_profiles_stripe ON profiles(stripe_customer_id);

-- ============================================
-- TABELA: quiz_attempts
-- Histórico de simulados realizados
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  certification_id TEXT NOT NULL REFERENCES certifications(id),

  -- Tipo de quiz
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('daily', 'full', 'practice', 'domains', 'review')),

  -- Configuração
  questions_count INT NOT NULL,           -- Quantas questões tinha
  time_limit_seconds INT,                 -- NULL = sem tempo

  -- Resultado
  questions_answered INT NOT NULL,
  correct_answers INT NOT NULL,
  score INT NOT NULL,                     -- 100-1000 (padrão AWS)

  -- Breakdown por domínio
  domain_breakdown JSONB NOT NULL,        -- {SECURE: {correct: 8, total: 10}, ...}

  -- Metadados
  duration_seconds INT,                   -- Tempo real gasto
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para queries comuns
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_cert ON quiz_attempts(certification_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_cert ON quiz_attempts(user_id, certification_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed ON quiz_attempts(completed_at DESC);

-- ============================================
-- TABELA: user_answers
-- Respostas individuais (para revisão)
-- ============================================
CREATE TABLE IF NOT EXISTS user_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  quiz_attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id),

  -- Resposta do usuário
  selected_answer TEXT NOT NULL CHECK (selected_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL,
  marked_for_review BOOLEAN DEFAULT false,
  time_spent_seconds INT,

  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para queries de revisão
CREATE INDEX IF NOT EXISTS idx_user_answers_user ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_quiz ON user_answers(quiz_attempt_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question ON user_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_incorrect ON user_answers(user_id, is_correct) WHERE is_correct = false;
CREATE INDEX IF NOT EXISTS idx_user_answers_marked ON user_answers(user_id, marked_for_review) WHERE marked_for_review = true;

-- ============================================
-- TABELA: flashcards
-- Flashcards gerados por IA ou pré-definidos
-- ============================================
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  certification_id TEXT NOT NULL REFERENCES certifications(id),

  -- Conteúdo
  front TEXT NOT NULL,                    -- Pergunta/Conceito
  back TEXT NOT NULL,                     -- Resposta/Explicação

  -- Metadados
  source TEXT NOT NULL CHECK (source IN ('predefined', 'ai_generated', 'user_created')),
  tags TEXT[],

  -- Spaced Repetition (algoritmo SM-2)
  ease_factor FLOAT DEFAULT 2.5,
  interval_days INT DEFAULT 1,
  repetitions INT DEFAULT 0,
  next_review_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para spaced repetition
CREATE INDEX IF NOT EXISTS idx_flashcards_user ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON flashcards(user_id, next_review_at);

-- ============================================
-- TABELA: achievements
-- Conquistas/badges do usuário
-- ============================================
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,           -- 'first_quiz', 'streak_7', 'master_secure'
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_achievements_user ON user_achievements(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Protege dados dos usuários
-- ============================================

-- Habilitar RLS em todas as tabelas de usuário
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies: Profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies: Quiz Attempts
CREATE POLICY "Users can view own quiz attempts"
  ON quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts"
  ON quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies: User Answers
CREATE POLICY "Users can view own answers"
  ON user_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own answers"
  ON user_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies: Flashcards
CREATE POLICY "Users can manage own flashcards"
  ON flashcards FOR ALL
  USING (auth.uid() = user_id);

-- Policies: Achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Questions e Certifications são públicas (mas tier controlado via app logic)
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active certifications"
  ON certifications FOR SELECT
  USING (active = true);

CREATE POLICY "Everyone can view active questions"
  ON questions FOR SELECT
  USING (active = true);

-- ============================================
-- FUNCTION: Auto-criar profile ao signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, plan, created_at)
  VALUES (NEW.id, 'FREE', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Criar profile automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCTION: Resetar limites diários FREE
-- ============================================
CREATE OR REPLACE FUNCTION public.reset_daily_limits()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET
    daily_quiz_count = 0,
    ai_questions_today = 0,
    daily_quiz_reset_at = NOW()
  WHERE
    plan = 'FREE'
    AND daily_quiz_reset_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Calcular streak de dias
-- ============================================
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INT;
BEGIN
  SELECT last_activity_date, streak_days
  INTO v_last_activity, v_current_streak
  FROM profiles
  WHERE id = p_user_id;

  -- Se atividade foi ontem, incrementa streak
  IF v_last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE profiles
    SET
      streak_days = streak_days + 1,
      last_activity_date = CURRENT_DATE
    WHERE id = p_user_id;

  -- Se atividade foi hoje, mantém streak
  ELSIF v_last_activity = CURRENT_DATE THEN
    -- Nada a fazer
    NULL;

  -- Se passou mais de 1 dia, reseta streak
  ELSE
    UPDATE profiles
    SET
      streak_days = 1,
      last_activity_date = CURRENT_DATE
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA: Certificações
-- ============================================
INSERT INTO certifications (id, name, short_name, description, exam_duration_minutes, total_questions, passing_score, domains) VALUES
(
  'SAA-C03',
  'Solutions Architect - Associate',
  'SAA-C03',
  'Valide sua capacidade de projetar arquiteturas resilientes, de alto desempenho, seguras e com custo otimizado na AWS.',
  130,
  65,
  720,
  '[
    {"key": "SECURE", "label": "Arquitetura Segura", "weight": 0.30, "color": "#22c55e"},
    {"key": "RESILIENT", "label": "Arquitetura Resiliente", "weight": 0.26, "color": "#3b82f6"},
    {"key": "PERFORMANCE", "label": "Alto Desempenho", "weight": 0.24, "color": "#ef4444"},
    {"key": "COST", "label": "Custo Otimizado", "weight": 0.20, "color": "#f59e0b"}
  ]'::jsonb
),
(
  'CLF-C02',
  'Cloud Practitioner',
  'CLF-C02',
  'Valide sua compreensão geral da nuvem AWS e dos principais serviços.',
  90,
  65,
  700,
  '[
    {"key": "CLOUD_CONCEPTS", "label": "Conceitos de Nuvem", "weight": 0.26, "color": "#3b82f6"},
    {"key": "SECURITY", "label": "Segurança e Conformidade", "weight": 0.25, "color": "#22c55e"},
    {"key": "TECHNOLOGY", "label": "Tecnologia", "weight": 0.33, "color": "#a855f7"},
    {"key": "BILLING", "label": "Faturamento e Preços", "weight": 0.16, "color": "#f59e0b"}
  ]'::jsonb
),
(
  'AIF-C01',
  'AI Practitioner',
  'AIF-C01',
  'Valide sua compreensão de conceitos fundamentais de IA e ML na AWS.',
  90,
  65,
  700,
  '[
    {"key": "AI_FUNDAMENTALS", "label": "Fundamentos de IA", "weight": 0.20, "color": "#a855f7"},
    {"key": "AI_SECURITY", "label": "Segurança de IA", "weight": 0.24, "color": "#22c55e"},
    {"key": "AI_APPLICATIONS", "label": "Aplicações de IA", "weight": 0.28, "color": "#3b82f6"},
    {"key": "AI_GOVERNANCE", "label": "Governança de IA", "weight": 0.28, "color": "#f59e0b"}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- FIM DO SCHEMA
-- ============================================
-- Próximos passos:
-- 1. Importar questões dos arquivos JSON
-- 2. Configurar variáveis de ambiente (.env.local)
-- 3. Testar autenticação
-- ============================================
