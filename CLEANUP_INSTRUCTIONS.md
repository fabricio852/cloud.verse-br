# Instruções para Limpeza Manual de Questões em Português

## Problema Identificado
- Há **34-75 questões em português** ainda na tabela `SAA-C03`
- A deleção via API REST está falhando por constraint de foreign key
- O RLS (Row Level Security) está ocultando as respostas órfãs

## Solução: Executar via Supabase SQL Editor

### Passo 1: Acessar Supabase SQL Editor
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **SQL Editor** → **New Query**

### Passo 2: Copiar e Executar o SQL

```sql
-- Passo 1: Remover user_answers referenciando questões em português
DELETE FROM user_answers
WHERE question_id IN (
  SELECT id FROM questions
  WHERE certification_id = 'SAA-C03'
  AND (
    question_text ILIKE '%empresa%' OR
    question_text ILIKE '%qual%' OR
    question_text ILIKE '%aplicação%' OR
    question_text ILIKE '%precisa%' OR
    question_text ILIKE '%solução%' OR
    question_text ILIKE '%serviço%' OR
    question_text ILIKE '%usuário%'
  )
);

-- Passo 2: Remover questões em português
DELETE FROM questions
WHERE certification_id = 'SAA-C03'
AND (
  question_text ILIKE '%empresa%' OR
  question_text ILIKE '%qual%' OR
  question_text ILIKE '%aplicação%' OR
  question_text ILIKE '%precisa%' OR
  question_text ILIKE '%solução%' OR
  question_text ILIKE '%serviço%' OR
  question_text ILIKE '%usuário%'
);

-- Passo 3: Verificar resultado
SELECT COUNT(*) as total FROM questions WHERE certification_id = 'SAA-C03';
```

### Passo 3: Verificar Resultado
O resultado final deve ser **exatamente 205 questões** (ou próximo disso).

Se houver ainda questões em português, execute novamente com mais palavras-chave.

## Alternativa: Se o SQL também falhar

Se o SQL também retornar constraint error, é porque há um problema estrutural no banco.
Nesse caso:

1. Desabilite a constraint temporariamente (requer admin):
```sql
ALTER TABLE user_answers DISABLE TRIGGER ALL;
-- Executar o DELETE acima
ALTER TABLE user_answers ENABLE TRIGGER ALL;
```

2. Ou, último recurso, limpe toda a tabela `user_answers`:
```sql
DELETE FROM user_answers WHERE question_id LIKE 'saa-c03%';
```

## Verificação Final

Após a limpeza, verifique:
```sql
SELECT COUNT(*) FROM questions WHERE certification_id = 'SAA-C03';
SELECT COUNT(*) FROM questions WHERE certification_id = 'SAA-C03'
  AND (question_text ILIKE '%empresa%' OR question_text ILIKE '%qual%');
```

A segunda query deve retornar **0** se a limpeza foi bem-sucedida.
