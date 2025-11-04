# 🔧 GUIA DE TROUBLESHOOTING

## ❌ Problema: Tela branca no quiz

### Passos para diagnosticar:

#### 1. **Abra o Console do Navegador**
- Pressione `F12` ou `Ctrl+Shift+I` (Windows/Linux)
- Vá para a aba "Console"

#### 2. **Procure por erros em vermelho**

Erros comuns e soluções:

##### ❌ "user is null" ou "Cannot read property 'id' of null"
**Problema:** Você não está autenticado

**Solução:**
1. Volte para a landing page
2. Faça login com Google
3. Tente o quiz novamente

##### ❌ "questions is undefined" ou "Cannot read property 'length' of undefined"
**Problema:** Questões não foram carregadas do Supabase

**Solução:**
1. Verifique se há internet
2. Verifique o `.env.local` (credenciais Supabase corretas)
3. Execute: `npm run verify` para testar conexão

##### ❌ "Failed to fetch" ou "Network error"
**Problema:** Erro de rede ou Supabase offline

**Solução:**
1. Verifique sua internet
2. Teste: https://supabase.com (site está no ar?)
3. Verifique se as credenciais no `.env.local` são válidas

##### ❌ "RLS policy violation" ou "permission denied"
**Problema:** Row Level Security bloqueando acesso

**Solução:**
1. Verifique se você executou o schema.sql completo
2. As policies devem permitir leitura pública de questions/certifications

#### 3. **Verifique o Network Tab**
1. Abra DevTools → aba "Network"
2. Recarregue a página
3. Procure por requisições em vermelho (status 400, 500, etc.)
4. Clique nelas e veja o erro detalhado

#### 4. **Teste com questões mocadas**
Se o problema persistir, vamos testar com dados locais:

**Edite `App.tsx`:**
```typescript
// Linha ~212 (Quiz Rápido)
// ANTES:
questions={plano === 'FREE' ? questionsQuickFree : questionsQuickPro}

// DEPOIS (temporário):
questions={undefined} // Vai usar Q_BANK local
```

Isso vai usar as 3 questões de exemplo e confirmar se o problema é:
- ✅ Quiz funciona → Problema é no Supabase/fetch
- ❌ Quiz não funciona → Problema é no componente

#### 5. **Logs no console**
No console, você deve ver:
```
[useQuizAttempt] Sem usuário autenticado - pulando salvamento
[useQuizAttempt] Sem questões - pulando criação de attempt
```

**Esses avisos são NORMAIS** se você não estiver logado ou não houver questões.

---

## ✅ Checklist de Verificação

- [ ] Servidor Vite está rodando (`npm run dev`)
- [ ] Navegador está em http://localhost:3000
- [ ] Você fez login com Google
- [ ] Console não mostra erros em vermelho
- [ ] Network tab mostra requisições ao Supabase com status 200
- [ ] `npm run verify` passa sem erros

---

## 🆘 Se nada funcionar:

Execute e me envie a saída:
```bash
npm run verify
```

E também me envie:
1. Printscreen do console do navegador (aba Console)
2. Printscreen do Network tab (filtrado por "supabase")
3. A última mensagem de erro que você vê

---

## 🔍 Debug Avançado

### Testar Supabase Client direto no Console do navegador:

Cole no console:
```javascript
// Importar o cliente
const { supabase } = await import('./services/supabaseClient.ts');

// Testar conexão
const { data, error } = await supabase.from('certifications').select('*').limit(1);
console.log('Data:', data);
console.log('Error:', error);
```

**Resultado esperado:**
```
Data: [{ id: "SAA-C03", name: "AWS Certified...", ... }]
Error: null
```

Se você vir um erro aqui, o problema é na configuração do Supabase.
