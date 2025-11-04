# Scripts de Manutenção

## 📥 Importação de Questões

### Uso Básico

```bash
# Instalar dependências primeiro (se ainda não instalou)
npm install

# Importar todas as questões
npm run import-questions

# Limpar banco e reimportar tudo
npm run import-questions:clear
```

### Opções Avançadas

```bash
# Importar apenas uma certificação específica
npm run import-questions -- --cert=SAA-C03

# Limpar e importar apenas SAA-C03
npm run import-questions:clear -- --cert=SAA-C03
```

### O que o script faz:

1. ✅ Lê todos os arquivos JSON em `data/certifications/`
2. ✅ Valida cada questão antes de importar
3. ✅ Ignora templates vazios automaticamente
4. ✅ Usa `upsert` (atualiza se já existe, insere se não existe)
5. ✅ Mostra progresso em tempo real
6. ✅ Exibe resumo ao final

### Saída Esperada:

```
🚀 Iniciando importação de questões...

📚 Processando certificação: SAA-C03
  📄 Importando secure.json...
  ..........
  📄 Importando resilient.json...
  ...
  📄 Importando performance.json...
  ...
  📄 Importando cost.json...
  ...

📊 Resumo da Importação:
  ✅ Questões importadas: 45
  ⏭️  Questões ignoradas (templates): 12
  ❌ Erros: 0

✨ Importação concluída!
```

### Troubleshooting

**Erro: "Variáveis de ambiente não encontradas"**
- ✅ Certifique-se que o arquivo `.env.local` existe na raiz do projeto
- ✅ Verifique se contém `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

**Erro: "Cannot find module 'tsx'"**
- Execute: `npm install`

**Erro: "Questão inválida"**
- Verifique se a questão tem todos os campos obrigatórios
- Veja o template em `data/certifications/SAA-C03/secure.json`

**Erro: "duplicate key value violates unique constraint"**
- Use `npm run import-questions:clear` para limpar e reimportar
- OU mude o `id` da questão duplicada

---

## 🔄 Fluxo de Trabalho Recomendado

1. **Adicionar/Editar questões** nos arquivos JSON
2. **Validar JSON** (VS Code faz automaticamente)
3. **Importar** com `npm run import-questions`
4. **Testar** no app (`npm run dev`)
5. **Ajustar** se necessário e reimportar

---

## 📁 Estrutura de Arquivos JSON

Cada arquivo de domínio (ex: `secure.json`) deve seguir este formato:

```json
{
  "certification": "SAA-C03",
  "domain": "SECURE",
  "questions": [
    {
      "id": "saa-secure-001",
      "question": "Texto da questão aqui...",
      "options": {
        "A": "Opção A",
        "B": "Opção B",
        "C": "Opção C",
        "D": "Opção D"
      },
      "correct": "B",
      "explanation_basic": "Explicação curta...",
      "explanation_detailed": "Explicação detalhada...",
      "incorrect_explanations": {
        "A": "Por que A está errada...",
        "C": "Por que C está errada...",
        "D": "Por que D está errada..."
      },
      "tags": ["S3", "Security", "IAM"],
      "difficulty": "medium",
      "tier": "FREE"
    }
  ]
}
```

### Campos Obrigatórios:

- ✅ `id`: Único, formato `{cert}-{domain}-{número}`
- ✅ `question`: Texto da questão
- ✅ `options`: 4 opções (A, B, C, D)
- ✅ `correct`: Letra da resposta correta
- ✅ `explanation_basic`: Explicação FREE
- ✅ `explanation_detailed`: Explicação PRO
- ✅ `incorrect_explanations`: Pelo menos 3 explicações
- ✅ `tags`: Array com pelo menos 1 tag
- ✅ `difficulty`: "easy", "medium" ou "hard"
- ✅ `tier`: "FREE" ou "PRO"

---

## 🎯 Próximos Scripts (TODO)

- [ ] `export-questions.ts`: Exportar questões do Supabase para JSON
- [ ] `validate-questions.ts`: Validar questões sem importar
- [ ] `seed-users.ts`: Criar usuários de teste
- [ ] `reset-database.ts`: Resetar todo o banco
