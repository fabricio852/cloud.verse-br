# Como adicionar DVA-C02 apenas no app PT-BR

## 🎯 Objetivo

Adicionar a certificação **DVA-C02** apenas no app em **Português (PT-BR)**, sem afetar o app em **Inglês** que está em produção.

## 📋 Passo a Passo

### 1. Executar o Script SQL no Supabase

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Vá em **SQL Editor** → **New Query**
3. Copie o conteúdo do arquivo: `supabase/add-dva-c02-pt-br-only.sql`
4. Cole no editor e clique em **Run**

### 2. Verificar a Configuração

Execute este SQL para verificar:

```sql
SELECT id, name, locale, active
FROM certifications
ORDER BY id;
```

**Resultado esperado:**

| id       | name                                        | locale | active |
|----------|---------------------------------------------|--------|--------|
| AIF-C01  | AWS Certified AI Practitioner               | all    | true   |
| CLF-C02  | AWS Certified Cloud Practitioner            | all    | true   |
| **DVA-C02** | **AWS Certified Developer - Associate**  | **pt-BR** | **true** |
| SAA-C03  | AWS Certified Solutions Architect           | all    | true   |

### 3. Como Funciona

#### No Supabase:
- Coluna `locale` adicionada à tabela `certifications`
- Valores possíveis: `'all'`, `'pt-BR'`, `'en'`
- **DVA-C02** configurada com `locale = 'pt-BR'`
- Outras certificações com `locale = 'all'`

#### No App (store/certificationStore.ts):
```typescript
// Filtra certificações por locale do navegador
const currentLocale = navigator.language; // 'pt-BR' ou 'en-US', etc.

const { data } = await supabase
  .from('certifications')
  .select('*')
  .eq('active', true)
  .or(`locale.eq.all,locale.eq.${currentLocale}`) // ← FILTRO!
  .order('id', { ascending: true });
```

## ✅ Resultado Final

### App em PT-BR (cloud.verse-br):
- ✅ CLF-C02
- ✅ SAA-C03
- ✅ AIF-C01
- ✅ **DVA-C02** ← **Aparece aqui!**

### App em Inglês (outro domínio):
- ✅ CLF-C02
- ✅ SAA-C03
- ✅ AIF-C01
- ❌ DVA-C02 ← **NÃO aparece!**

## 🔄 Para adicionar DVA-C02 no app em inglês no futuro

Basta atualizar o locale no Supabase:

```sql
UPDATE certifications
SET locale = 'all'
WHERE id = 'DVA-C02';
```

## 📝 Notas Importantes

1. **O fallback local continua funcionando**: Se o Supabase falhar, o app PT-BR ainda carrega a DVA-C02 localmente
2. **Não afeta dados existentes**: Outras certificações continuam com `locale = 'all'`
3. **Código já atualizado**: O filtro por locale já está implementado no `certificationStore.ts`

## 🚀 Deploy

O código com o filtro de locale já está em produção após o último commit:
```
Redesign donation modal with landing page theme and fix visitor counter
```
