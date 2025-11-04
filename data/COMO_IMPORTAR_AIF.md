# 🚀 Como Importar Questões AIF-C01

## ⚡ GUIA RÁPIDO (3 passos)

### 1️⃣ Crie o arquivo JSON com suas questões AIF

Salve como `data/aif-questions.json`:

```json
[
  {
    "id": "aif-c01-ai_services-001",
    "certification_id": "AIF-C01",
    "domain": "AI_SERVICES",
    "difficulty": "medium",
    "tier": "FREE",
    "required_selection_count": 1,
    "active": true,
    "question_text": "Uma empresa deseja criar um chatbot para atendimento ao cliente 24/7 que possa entender linguagem natural e manter o contexto da conversa. Qual serviço AWS é mais adequado para esta solução?",
    "option_a": "Amazon Polly",
    "option_b": "Amazon Lex",
    "option_c": "Amazon Comprehend",
    "option_d": "Amazon Translate",
    "correct_answers": ["B"],
    "explanation_detailed": "Amazon Lex é o serviço ideal para criar interfaces conversacionais usando voz e texto...",
    "incorrect_explanations": {
      "A": "Amazon Polly é um serviço de conversão de texto em fala...",
      "C": "Amazon Comprehend é um serviço de processamento de linguagem natural...",
      "D": "Amazon Translate é um serviço de tradução neural..."
    }
  }
]
```

### 2️⃣ Execute o comando de importação

```bash
npm run import-custom -- --cert=AIF-C01 --file=data/aif-questions.json
```

### 3️⃣ Verifique no app

```bash
npm run verify
```

Você deve ver as questões AIF-C01 no banco!

---

## 📋 PARÂMETROS DISPONÍVEIS

```bash
npm run import-custom -- [parâmetros]
```

| Parâmetro | Descrição | Padrão | Exemplo |
|-----------|-----------|--------|---------|
| `--cert=` | ID da certificação | SAA-C03 | `--cert=AIF-C01` |
| `--file=` | Caminho do arquivo JSON | data/custom-questions.json | `--file=data/aif-batch1.json` |
| `--tier=` | Tier das questões | FREE | `--tier=PRO` |
| `--start=` | ID inicial (se não usar IDs no JSON) | 1 | `--start=50` |
| `--clear` | Limpa questões existentes antes | - | `--clear` |

---

## 💡 EXEMPLOS DE USO

### Importar questões AIF básicas:
```bash
npm run import-custom -- --cert=AIF-C01 --file=data/aif-questions.json
```

### Importar lote 2 (continuação):
```bash
npm run import-custom -- --cert=AIF-C01 --file=data/aif-batch2.json
```

### Limpar e reimportar tudo:
```bash
npm run import-custom -- --cert=AIF-C01 --file=data/aif-all.json --clear
```

### Importar questões PRO:
```bash
npm run import-custom -- --cert=AIF-C01 --file=data/aif-pro.json --tier=PRO
```

---

## ⚠️ IMPORTANTE

### ✅ Certifique-se que o JSON tem:

1. **Campo `certification_id`**: Deve ser `"AIF-C01"`
2. **Campo `correct_answers`**: Deve ser array: `["A"]` não `"A"`
3. **Campo `required_selection_count`**: 1 para única escolha, 2+ para multiselect
4. **Campo `domain`**: Um dos domínios válidos:
   - `AI_FUNDAMENTALS`
   - `AI_SERVICES`
   - `RESPONSIBLE_AI`
   - `ML_DEVELOPMENT`

### ❌ Erros comuns:

```json
// ❌ ERRADO
{
  "correct_answers": "B",  // String em vez de array
  "required_selection_count": "1",  // String em vez de número
  "domain": "ai_services"  // Minúsculo (deve ser MAIÚSCULO)
}

// ✅ CORRETO
{
  "correct_answers": ["B"],  // Array
  "required_selection_count": 1,  // Número
  "domain": "AI_SERVICES"  // MAIÚSCULO
}
```

---

## 🔧 VALIDAR ANTES DE IMPORTAR

### Use um validador JSON online:
1. Acesse https://jsonlint.com
2. Cole seu JSON
3. Clique "Validate JSON"
4. Corrija erros se houver

### Ou use o Node.js:
```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('data/aif-questions.json')))"
```

Se não der erro, seu JSON está válido! ✅

---

## 📊 DEPOIS DA IMPORTAÇÃO

### 1. Verifique o banco:
```bash
npm run verify
```

### 2. Analise as questões:
```bash
npm run analyze
```

### 3. Veja exemplo de questão:
```bash
npm run show-example
```

### 4. Teste no app:
```bash
npm run dev
```

Acesse o app, selecione a certificação **AIF-C01** e inicie um quiz!

---

## 🎯 WORKFLOW RECOMENDADO

### Passo 1: Converter questões com IA
Use o prompt em `PROMPT_CONVERSAO_AIF.md` com ChatGPT/Claude

### Passo 2: Salvar JSON
Salve a resposta da IA como `data/aif-batch1.json`

### Passo 3: Validar
```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('data/aif-batch1.json')))"
```

### Passo 4: Importar
```bash
npm run import-custom -- --cert=AIF-C01 --file=data/aif-batch1.json
```

### Passo 5: Verificar
```bash
npm run verify
```

### Passo 6: Testar
```bash
npm run dev
```

---

## 🐛 TROUBLESHOOTING

### Erro: "JSON inválido"
**Solução**: Valide o JSON em https://jsonlint.com

### Erro: "Violação de chave única"
**Solução**: IDs duplicados. Use `--clear` ou mude os IDs

### Erro: "Domain inválido"
**Solução**: Use um dos 4 domínios permitidos (MAIÚSCULO):
- AI_FUNDAMENTALS
- AI_SERVICES
- RESPONSIBLE_AI
- ML_DEVELOPMENT

### Erro: "correct_answers não é array"
**Solução**: Mude `"correct_answers": "A"` para `"correct_answers": ["A"]`

---

## 📚 RECURSOS

- **Template**: `data/TEMPLATE_QUESTAO_AIF.md`
- **Prompt IA**: `data/PROMPT_CONVERSAO_AIF.md`
- **Status Multiselect**: `data/MULTISELECT_STATUS.md`
- **Script de importação**: `scripts/import-smart.ts`

---

**Boa sorte com a importação! 🚀**
