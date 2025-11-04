# Prompt para Conversão de Questões - AWS AI Practitioner (AIF-C01)

## 🎯 OBJETIVO

Converter questões de qualquer formato para o formato padronizado JSON compatível com o sistema de quiz AWS AI Practitioner.

---

## 📋 PROMPT COMPLETO PARA IA

```
Você é um especialista em AWS AI/ML e criação de conteúdo educacional. Sua tarefa é converter questões sobre AWS AI Practitioner (AIF-C01) para um formato JSON padronizado.

FORMATO ALVO:
{
  "id": "aif-c01-[dominio]-[numero]",
  "certification_id": "AIF-C01",
  "domain": "[DOMINIO]",
  "difficulty": "[easy|medium|hard]",
  "tier": "FREE",
  "required_selection_count": 1,
  "active": true,
  "question_text": "Texto da questão",
  "option_a": "Opção A",
  "option_b": "Opção B",
  "option_c": "Opção C",
  "option_d": "Opção D",
  "correct_answers": ["LETRA_CORRETA"],
  "explanation_detailed": "Explicação detalhada da resposta correta",
  "incorrect_explanations": {
    "A": "Por que A está incorreta",
    "B": "Por que B está incorreta",
    "C": "Por que C está incorreta"
  }
}

DOMÍNIOS PERMITIDOS (escolha o mais apropriado):
- AI_FUNDAMENTALS (Fundamentos de IA/ML, conceitos básicos)
- AI_SERVICES (Serviços AWS de IA: Bedrock, SageMaker, Rekognition, etc.)
- RESPONSIBLE_AI (IA responsável, ética, viés, privacidade)
- ML_DEVELOPMENT (Desenvolvimento ML, ciclo de vida, deployment)

REGRAS OBRIGATÓRIAS:
1. IDs devem seguir: aif-c01-[dominio]-[numero sequencial com 3 dígitos]
   Exemplos: aif-c01-ai_services-001, aif-c01-responsible_ai-042

2. correct_answers DEVE SER UM ARRAY: ["A"] e NÃO uma string "A"

3. A explicação detalhada DEVE:
   - Ensinar o conceito
   - Mencionar o serviço AWS relevante quando aplicável
   - Ser clara e educativa (100-200 palavras)

4. As explicações das incorretas DEVEM:
   - Explicar POR QUÊ a opção está errada
   - Não apenas dizer "não atende aos requisitos"
   - Educar sobre o conceito (30-60 palavras cada)

5. Dificuldade:
   - easy: Conceitos básicos, definições
   - medium: Escolha entre serviços, cenários práticos
   - hard: Otimização, trade-offs complexos

6. Sempre use "tier": "FREE"

7. required_selection_count: use 1 para questões de única escolha

IMPORTANTE - SERVIÇOS AWS PARA MENCIONAR:
- Amazon Bedrock (LLMs e modelos de fundação)
- Amazon SageMaker (plataforma completa ML)
- Amazon Q (assistente IA generativa)
- Amazon Rekognition (visão computacional)
- Amazon Comprehend (NLP)
- Amazon Polly (text-to-speech)
- Amazon Transcribe (speech-to-text)
- Amazon Translate (tradução)
- Amazon Lex (chatbots)
- Amazon Kendra (busca inteligente)
- Amazon Personalize (recomendações)
- Amazon Forecast (previsões)

FORMATO DE SAÍDA:
Retorne um array JSON válido com as questões convertidas. Exemplo:

[
  {
    "id": "aif-c01-ai_services-001",
    "certification_id": "AIF-C01",
    ...
  },
  {
    "id": "aif-c01-ai_services-002",
    "certification_id": "AIF-C01",
    ...
  }
]

Agora converta as seguintes questões:

[COLE AS QUESTÕES AQUI]
```

---

## 📝 EXEMPLO DE USO

### Entrada (questão original):
```
Pergunta: Qual serviço AWS permite criar chatbots conversacionais?
a) Amazon Polly
b) Amazon Lex
c) Amazon Comprehend
d) Amazon Translate
Resposta: B
```

### Saída esperada:
```json
[
  {
    "id": "aif-c01-ai_services-001",
    "certification_id": "AIF-C01",
    "domain": "AI_SERVICES",
    "difficulty": "easy",
    "tier": "FREE",
    "required_selection_count": 1,
    "active": true,
    "question_text": "Uma empresa deseja criar um chatbot para atendimento ao cliente 24/7 que possa entender linguagem natural e manter o contexto da conversa. Qual serviço AWS é mais adequado para esta solução?",
    "option_a": "Amazon Polly",
    "option_b": "Amazon Lex",
    "option_c": "Amazon Comprehend",
    "option_d": "Amazon Translate",
    "correct_answers": ["B"],
    "explanation_detailed": "Amazon Lex é o serviço ideal para criar interfaces conversacionais usando voz e texto. Ele utiliza as mesmas tecnologias de deep learning do Amazon Alexa para entender a intenção do usuário, manter contexto e fornecer respostas naturais. O Lex se integra facilmente com AWS Lambda para lógica de negócios e pode ser implementado em aplicações web, mobile e plataformas de mensagens como Facebook Messenger e Slack.",
    "incorrect_explanations": {
      "A": "Amazon Polly é um serviço de conversão de texto em fala (text-to-speech) usando deep learning. Enquanto pode ser usado JUNTO com um chatbot para dar voz às respostas, ele não cria a lógica conversacional ou entende a intenção do usuário.",
      "C": "Amazon Comprehend é um serviço de processamento de linguagem natural (NLP) para análise de texto, extração de entidades e análise de sentimento. Ele analisa texto mas não cria diálogos conversacionais interativos.",
      "D": "Amazon Translate é um serviço de tradução neural que converte texto entre idiomas. Pode ser usado em conjunto com um chatbot multilíngue, mas não cria a interface conversacional em si."
    }
  }
]
```

---

## 🚀 FLUXO DE TRABALHO RECOMENDADO

### Passo 1: Preparar as questões
- Organize suas questões em lotes de 5-10 por vez
- Certifique-se de que cada questão tem pergunta, opções e resposta

### Passo 2: Usar o prompt
- Copie o prompt completo acima
- Cole suas questões no final onde diz `[COLE AS QUESTÕES AQUI]`
- Execute na IA de sua preferência (ChatGPT 4, Claude, etc.)

### Passo 3: Validar o JSON
- Verifique se o JSON está válido (use um validador online)
- Confira se os IDs estão sequenciais
- Confirme que `correct_answers` é array: `["A"]`

### Passo 4: Salvar e importar
- Salve o JSON em um arquivo (ex: `aif-questions-batch1.json`)
- Use o script de importação: `npm run import-custom`

---

## ⚡ DICAS PARA MELHORES RESULTADOS

### 1. Seja específico no prompt
Se suas questões originais forem de um domínio específico, adicione ao prompt:
```
ATENÇÃO: Todas estas questões são sobre [Amazon Bedrock/SageMaker/etc],
use o domínio AI_SERVICES e numere a partir de 050.
```

### 2. Revise as explicações
A IA pode gerar explicações genéricas. Sempre revise e melhore:
- ✅ Adicione exemplos práticos
- ✅ Mencione preços ou limites quando relevante
- ✅ Conecte com outros serviços AWS

### 3. Ajuste a dificuldade
Se achar que a IA classificou errado:
- Questões sobre definições básicas = easy
- Questões sobre escolha de serviços = medium
- Questões com múltiplas restrições = hard

### 4. Mantenha consistência
- Use sempre o mesmo padrão de numeração
- Mantenha o mesmo nível de detalhe nas explicações
- Seja consistente na profundidade técnica

---

## 🔧 TROUBLESHOOTING

### Problema: IA retorna `correct_answers` como string
```json
"correct_answers": "A"  ❌
```
**Solução**: Adicione ao prompt:
```
CRÍTICO: correct_answers DEVE SER UM ARRAY. Sempre use ["A"] e nunca "A"
```

### Problema: Explicações muito curtas
**Solução**: Adicione ao prompt:
```
As explicações devem ter no mínimo 100 palavras e incluir exemplos práticos.
```

### Problema: IDs duplicados
**Solução**: Especifique o range:
```
Numere as questões de 001 a 010 para este lote.
```

---

## 📚 RECURSOS ADICIONAIS

- **Template completo**: Ver `TEMPLATE_QUESTAO_AIF.md`
- **Documentação AWS AI/ML**: https://aws.amazon.com/ai/
- **Guia do exame AIF-C01**: https://aws.amazon.com/certification/certified-ai-practitioner/
- **Script de importação**: `npm run import-custom`

---

**Boa sorte na criação de questões! 🎓**
