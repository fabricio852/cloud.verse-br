# 🚀 Setup do Supabase - Guia Passo a Passo

## 📋 Pré-requisitos

- [ ] Conta no GitHub (para login no Supabase)
- [ ] Email válido

---

## 1️⃣ Criar Conta no Supabase

1. Acesse: https://supabase.com
2. Clique em **"Start your project"**
3. Faça login com **GitHub** (recomendado) ou **Email**

---

## 2️⃣ Criar Novo Projeto

1. No dashboard, clique em **"New Project"**
2. Preencha:
   - **Name**: `aws-trainer` (ou outro nome)
   - **Database Password**: Gere uma senha forte (salve em local seguro!)
   - **Region**: Escolha a mais próxima (ex: South America - São Paulo)
   - **Pricing Plan**: **Free** (suficiente para MVP)

3. Clique em **"Create new project"**
4. **Aguarde 2-3 minutos** (criação do banco de dados)

---

## 3️⃣ Executar o Schema SQL

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"+ New query"**
3. Abra o arquivo `supabase/schema.sql` deste projeto
4. **Copie TODO o conteúdo** e cole no SQL Editor
5. Clique em **"Run"** (canto inferior direito)
6. ✅ Deve aparecer: **"Success. No rows returned"**

### ⚠️ Se der erro:

- Certifique-se de que copiou TODO o arquivo
- Verifique se não há caracteres especiais quebrados
- Execute novamente (é idempotente, pode rodar múltiplas vezes)

---

## 4️⃣ Verificar Tabelas Criadas

1. No menu lateral, clique em **"Table Editor"**
2. Você deve ver estas tabelas:
   - ✅ `certifications` (3 linhas - SAA-C03, CLF-C02, AIF-C01)
   - ✅ `questions` (vazia por enquanto)
   - ✅ `profiles` (vazia - será populada ao criar usuários)
   - ✅ `quiz_attempts`
   - ✅ `user_answers`
   - ✅ `flashcards`
   - ✅ `user_achievements`

3. Clique em `certifications` → Deve ver 3 certificações cadastradas

---

## 5️⃣ Configurar Autenticação

1. No menu lateral, clique em **"Authentication"** → **"Providers"**
2. Habilite os providers desejados:

### Email (Obrigatório):
- Já vem habilitado por padrão
- **Desabilitar** "Confirm email" (para facilitar testes)
  - Settings → Email → Desligue "Enable email confirmations"

### Google OAuth (Recomendado):
1. Clique em **"Google"** → **"Enable"**
2. Você precisará de:
   - Google Cloud Project
   - Client ID
   - Client Secret
3. **Por enquanto, pule** (configure depois do MVP)

---

## 6️⃣ Copiar Credenciais

1. No menu lateral, clique em **"Project Settings"** (ícone de engrenagem)
2. Vá em **"API"**
3. **Copie e salve** (vamos usar no próximo passo):

```
Project URL: https://xxxxxxxxx.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **NÃO copie a `service_role key`** (é secreta!)

---

## 7️⃣ Configurar Variáveis de Ambiente

1. Na raiz do projeto, crie o arquivo **`.env.local`**:

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Gemini AI (já existe)
VITE_GEMINI_API_KEY=sua-chave-gemini-aqui
```

2. **Substitua** os valores pelas credenciais copiadas no passo anterior

3. Adicione `.env.local` ao **`.gitignore`** (se ainda não estiver):

```
# .gitignore
.env.local
.env*.local
```

---

## 8️⃣ Instalar Dependências

No terminal do projeto, execute:

```bash
npm install @supabase/supabase-js zustand
```

- `@supabase/supabase-js`: Cliente oficial do Supabase
- `zustand`: Gerenciamento de estado global (auth, user)

---

## 9️⃣ Testar Conexão

1. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

2. Abra o console do navegador (F12)
3. Não deve aparecer erros de conexão com Supabase

---

## 🎯 Próximos Passos

Agora que o Supabase está configurado, vamos:

1. ✅ Criar serviço de autenticação (`services/supabaseService.ts`)
2. ✅ Criar store Zustand para auth
3. ✅ Implementar login/signup funcional
4. ✅ Importar questões para o banco

---

## 🆘 Troubleshooting

### Erro: "Failed to fetch"
- Verifique se o `VITE_SUPABASE_URL` está correto (deve começar com `https://`)
- Verifique se não há espaços extras nas variáveis de ambiente

### Erro: "Invalid API key"
- Certifique-se de copiar a `anon key`, NÃO a `service_role key`
- Verifique se não quebrou a chave ao copiar (é MUITO longa)

### Tabelas não aparecem
- Execute o schema.sql novamente
- Verifique se não houve erro na execução (scroll no SQL Editor)

### Como deletar tudo e recomeçar?
1. SQL Editor → New Query
2. Execute:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
3. Execute o `schema.sql` novamente

---

## 📚 Recursos

- [Docs Supabase](https://supabase.com/docs)
- [Auth Helpers](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Pronto!** Supabase configurado com sucesso 🎉
