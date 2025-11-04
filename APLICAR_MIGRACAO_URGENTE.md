# 🚨 MIGRAÇÃO URGENTE - Suporte Completo AIF-C01

## ⚠️ PROBLEMA IDENTIFICADO

6 questões AIF-C01 foram importadas de forma incompleta:
- **4 questões com 5 alternativas** (faltando option_e)
- **2 questões multiselect** (apenas 1ª resposta correta salva)

Isso afeta a integridade das questões!

## ✅ SOLUÇÃO - Executar Migração SQL (5 minutos)

### Passo 1: Acessar Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **SQL Editor** (menu lateral esquerdo)

### Passo 2: Executar a Migração

Copie e cole este SQL completo no editor:

```sql
-- ============================================
-- MIGRATION: Suporte a Questões Multiselect
-- ============================================

-- 1. Adicionar option_e (5ª alternativa opcional)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_e TEXT NULL;

-- 2. Adicionar correct_answers (array de respostas corretas)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS correct_answers TEXT[] NULL;

-- 3. Adicionar required_selection_count (quantas alternativas devem ser selecionadas)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS required_selection_count INT DEFAULT 1;

-- 4. Popular correct_answers com valores de correct_answer existentes
UPDATE questions
SET correct_answers = ARRAY[correct_answer]
WHERE correct_answers IS NULL;

-- 5. Popular required_selection_count com 1 para questões existentes
UPDATE questions
SET required_selection_count = 1
WHERE required_selection_count IS NULL OR required_selection_count = 0;

-- 6. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_questions_multiselect
  ON questions(certification_id, required_selection_count);
```

### Passo 3: Executar

1. Clique no botão **RUN** (ou pressione Ctrl+Enter)
2. Aguarde a confirmação de sucesso
3. Volte aqui e execute o próximo comando

### Passo 4: Reimportar Questões AIF-C01

```bash
npm run import-aif -- --cert=AIF-C01 --file=data/aif-questions.json
```

Isso vai reimportar as 205 questões agora com suporte completo!

## 📊 Questões Afetadas

### Com option_e (5 alternativas):
1. `aif-c01-responsible_ai-039`: corretas=B,C
2. `aif-c01-ai_services-044`: corretas=B,D
3. `aif-c01-responsible_ai-048`: corretas=A,C
4. `aif-c01-responsible_ai-071`: corretas=A,C (multiselect - requer 2)

### Multiselect (2 respostas corretas):
1. `aif-c01-responsible_ai-071`: corretas=A,C
2. `aif-c01-ml_development-206`: corretas=A,B

## ⏱️ Tempo estimado

- **Migração SQL**: 1 minuto
- **Reimportação**: 2 minutos
- **Total**: ~3 minutos

## 🆘 Problemas?

Se der erro na migração, compartilhe a mensagem de erro.

---

**STATUS**: 🔴 URGENTE - Execute assim que possível para corrigir as questões!
