# 🚀 Guia Rápido - Importação de Questões AIF-C01

## 📦 Arquivos Disponíveis

1. **TEMPLATE_QUESTAO_AIF.md** - Modelo completo de questão com exemplos
2. **PROMPT_CONVERSAO_AIF.md** - Prompt para usar com IA (ChatGPT, Claude)
3. Este README - Guia rápido de uso

---

## ⚡ INÍCIO RÁPIDO (3 passos)

### 1️⃣ Pegue suas questões originais
Exemplo:
```
1. Qual serviço AWS permite criar chatbots?
a) Polly  b) Lex  c) Comprehend  d) Translate
Resposta: B

2. O que é Amazon Bedrock?
a) Serviço de storage
b) Plataforma de modelos de fundação
c) Serviço de compute
d) Banco de dados
Resposta: B
```

### 2️⃣ Use o prompt de conversão
- Abra **PROMPT_CONVERSAO_AIF.md**
- Copie o prompt completo
- Cole no ChatGPT/Claude
- Cole suas questões no final
- Execute!

### 3️⃣ Importe para o banco
```bash
# Salve o JSON retornado como aif-batch1.json
npm run import-custom
```

---

## 🎯 DOMÍNIOS DISPONÍVEIS

Escolha o domínio mais adequado para cada questão:

| Domínio | Quando usar | Exemplo |
|---------|-------------|---------|
| **AI_FUNDAMENTALS** | Conceitos básicos de IA/ML | "O que é aprendizado supervisionado?" |
| **AI_SERVICES** | Serviços AWS específicos | "Quando usar Amazon Bedrock?" |
| **RESPONSIBLE_AI** | Ética, viés, privacidade | "Como garantir fairness em modelos ML?" |
| **ML_DEVELOPMENT** | Ciclo de vida, deploy, MLOps | "Como monitorar modelo em produção?" |

---

## 📋 FORMATO JSON ESPERADO

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
    "question_text": "Pergunta aqui...",
    "option_a": "Opção A",
    "option_b": "Opção B",
    "option_c": "Opção C",
    "option_d": "Opção D",
    "correct_answers": ["B"],
    "explanation_detailed": "Explicação completa...",
    "incorrect_explanations": {
      "A": "Por que A está errada...",
      "C": "Por que C está errada...",
      "D": "Por que D está errada..."
    }
  }
]
```

---

## ⚠️ PONTOS DE ATENÇÃO

### ✅ Faça isso:
- Use array em `correct_answers`: `["A"]`
- Numere sequencialmente: 001, 002, 003...
- Explicações com 100-200 palavras
- Mencione serviços AWS relevantes
- Revise sempre o JSON antes de importar

### ❌ Evite isso:
- `correct_answers` como string: `"A"` ❌
- IDs duplicados
- Explicações genéricas tipo "não atende requisitos"
- Questões sem contexto prático
- JSON inválido

---

## 🔧 COMANDOS ÚTEIS

```bash
# Ver exemplo de questão CLF
npm run show-example

# Importar questões AIF
npm run import-custom

# Verificar banco de dados
npm run verify

# Analisar questões importadas
npm run analyze
```

---

## 📊 SERVIÇOS AWS PARA COBRIR

### Alta Prioridade (cobrir primeiro)
- ✅ Amazon Bedrock
- ✅ Amazon SageMaker
- ✅ Amazon Q
- ✅ Amazon Rekognition
- ✅ Amazon Comprehend

### Média Prioridade
- Amazon Lex
- Amazon Polly
- Amazon Transcribe
- Amazon Translate
- Amazon Kendra

### Também importante
- Amazon Personalize
- Amazon Forecast
- Amazon Textract
- Amazon Augmented AI (A2I)
- AWS DeepRacer

---

## 💡 DICAS PRÁTICAS

### Para lotes grandes de questões
```bash
# Divida em arquivos menores
aif-batch1.json  (questões 001-050)
aif-batch2.json  (questões 051-100)
aif-batch3.json  (questões 101-150)
```

### Para questões de múltipla escolha
```json
{
  "required_selection_count": 2,
  "correct_answers": ["A", "C"],
  "question_text": "Selecione DUAS opções que..."
}
```

### Para revisar explicações
- Leia cada explicação como se você não soubesse nada do assunto
- Pergunte: "Isso realmente ensina o conceito?"
- Adicione exemplos práticos quando possível

---

## 🎓 PRÓXIMOS PASSOS

1. Leia o **TEMPLATE_QUESTAO_AIF.md** para entender o formato completo
2. Teste com 5-10 questões primeiro
3. Revise o resultado cuidadosamente
4. Se ficou bom, continue com lotes maiores
5. Meta: ~100-200 questões de qualidade

---

## 🆘 PRECISA DE AJUDA?

- Template completo: `data/TEMPLATE_QUESTAO_AIF.md`
- Prompt de conversão: `data/PROMPT_CONVERSAO_AIF.md`
- Logs de importação: Verifique o console ao executar `npm run import-custom`

**Boa sorte com a criação de questões! 🚀**
