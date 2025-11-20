-- ============================================
-- VERIFICAR SE DVA-C02 EXISTE NO SUPABASE
-- ============================================
-- Execute este script no SQL Editor do Supabase para verificar

-- 1. Ver todas as certificações
SELECT id, name, locale, active
FROM certifications
ORDER BY id;

-- 2. Verificar especificamente DVA-C02
SELECT *
FROM certifications
WHERE id = 'DVA-C02';

-- 3. Ver quais certificações aparecem para PT-BR
SELECT id, name, locale, active
FROM certifications
WHERE active = true
  AND (locale = 'all' OR locale = 'pt-BR')
ORDER BY id;

-- 4. Ver TODAS as certificações (inclusive inativas)
SELECT id, name, locale, active
FROM certifications;
