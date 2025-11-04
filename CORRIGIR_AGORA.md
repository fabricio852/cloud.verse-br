# 🔧 CORREÇÃO URGENTE - 3 Passos Rápidos

## 🚨 PROBLEMA
6 questões AIF-C01 estão incompletas no banco de dados (faltam alternativas e respostas corretas).

## ✅ SOLUÇÃO (5 minutos)

### 📍 PASSO 1: Abrir Supabase
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **SQL Editor** (ícone de banco de dados no menu lateral)

### 📍 PASSO 2: Executar este SQL

**Copie TODO o código abaixo e cole no SQL Editor:**

```sql
-- Adicionar colunas para multiselect e 5 alternativas
ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_e TEXT NULL;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS correct_answers TEXT[] NULL;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS required_selection_count INT DEFAULT 1;

-- Popular com valores existentes
UPDATE questions SET correct_answers = ARRAY[correct_answer] WHERE correct_answers IS NULL;
UPDATE questions SET required_selection_count = 1 WHERE required_selection_count IS NULL OR required_selection_count = 0;

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_questions_multiselect ON questions(certification_id, required_selection_count);
```

**Depois clique em RUN** (botão verde ou Ctrl+Enter)

### 📍 PASSO 3: Reimportar Questões

**No terminal, execute:**

```bash
npm run import-aif -- --cert=AIF-C01 --file=data/aif-questions.json
```

Vai reimportar as 205 questões, agora com **todas** as alternativas e respostas corretas!

---

## ✨ Resultado Esperado

Após executar:
- ✅ 205 questões AIF-C01 completas
- ✅ 4 questões com 5 alternativas (A-E) funcionando
- ✅ 2 questões multiselect (2 respostas corretas) funcionando
- ✅ 0 erros

## ⏱️ Tempo Total: ~3 minutos

---

**Pronto para executar?** Comece pelo Passo 1! 🚀
