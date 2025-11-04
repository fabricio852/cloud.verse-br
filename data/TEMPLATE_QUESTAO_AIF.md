# Template de Questão - AWS Certified AI Practitioner (AIF-C01)

## 📋 Estrutura da Questão

### Metadados
```json
{
  "id": "aif-c01-[dominio]-[numero]",
  "certification_id": "AIF-C01",
  "domain": "[DOMINIO]",
  "difficulty": "[easy|medium|hard]",
  "tier": "FREE",
  "required_selection_count": 1,
  "active": true
}
```

### Domínios Disponíveis (AIF-C01)
- **AI_FUNDAMENTALS** - Fundamentos de IA e ML
- **AI_SERVICES** - Serviços de IA da AWS
- **RESPONSIBLE_AI** - IA Responsável
- **ML_DEVELOPMENT** - Desenvolvimento de ML

---

## 📝 EXEMPLO COMPLETO DE QUESTÃO AIF

```json
{
  "id": "aif-c01-ai_fundamentals-001",
  "certification_id": "AIF-C01",
  "domain": "AI_FUNDAMENTALS",
  "difficulty": "medium",
  "tier": "FREE",
  "required_selection_count": 1,
  "active": true,

  "question_text": "Uma empresa deseja implementar um sistema de recomendação de produtos baseado no histórico de compras dos clientes. Qual tipo de aprendizado de máquina é mais adequado para este cenário?",

  "option_a": "Aprendizado supervisionado com classificação",
  "option_b": "Aprendizado não supervisionado com clustering",
  "option_c": "Aprendizado por reforço",
  "option_d": "Filtragem colaborativa",

  "correct_answers": ["D"],

  "explanation_detailed": "Filtragem colaborativa é a técnica mais adequada para sistemas de recomendação baseados em histórico de comportamento. Ela analisa padrões de preferências entre usuários similares para sugerir produtos. Amazon Personalize utiliza filtragem colaborativa e outras técnicas de ML para criar recomendações personalizadas em tempo real, sem necessidade de expertise em ML.",

  "incorrect_explanations": {
    "A": "Aprendizado supervisionado com classificação é usado quando você tem dados rotulados e quer categorizar novos dados em classes pré-definidas. Não é ideal para recomendações personalizadas baseadas em similaridade de comportamento.",
    "B": "Clustering agrupa dados similares, mas não é otimizado para fazer recomendações personalizadas baseadas em histórico de usuários. Seria mais útil para segmentação de clientes.",
    "C": "Aprendizado por reforço é usado quando um agente precisa aprender a tomar decisões sequenciais através de tentativa e erro. Não é a escolha principal para sistemas de recomendação baseados em histórico."
  }
}
```

---

## 🎯 DIRETRIZES PARA QUESTÕES AIF-C01

### 1. Foco em Serviços AWS de IA/ML
As questões devem mencionar ou ter resposta relacionada aos principais serviços:
- **Amazon SageMaker** - Plataforma completa de ML
- **Amazon Bedrock** - Modelos de fundação e LLMs
- **Amazon Q** - Assistente de IA generativa
- **Amazon Rekognition** - Análise de imagens e vídeos
- **Amazon Comprehend** - Processamento de linguagem natural
- **Amazon Polly** - Conversão de texto em fala
- **Amazon Transcribe** - Conversão de fala em texto
- **Amazon Translate** - Tradução de texto
- **Amazon Lex** - Chatbots e interfaces conversacionais
- **Amazon Kendra** - Busca inteligente
- **Amazon Personalize** - Recomendações
- **Amazon Forecast** - Previsões de séries temporais
- **Amazon Textract** - Extração de texto de documentos

### 2. Temas Importantes
- ✅ **Fundamentos de IA/ML**: Tipos de aprendizado, conceitos básicos
- ✅ **Casos de uso**: Quando usar cada serviço
- ✅ **IA Responsável**: Viés, privacidade, segurança, explicabilidade
- ✅ **Ciclo de vida ML**: Preparação de dados, treinamento, deploy, monitoramento
- ✅ **Custos e otimização**: Como reduzir custos de inferência e treinamento
- ✅ **Integração**: Como os serviços se integram entre si

### 3. Nível de Profundidade
- ❌ **NÃO** focar em detalhes de código ou matemática complexa
- ✅ **SIM** focar em conceitos, casos de uso e escolha de serviços
- ✅ **SIM** incluir cenários práticos de negócio
- ✅ **SIM** perguntar sobre IA responsável e ética

### 4. Qualidade das Explicações
- **Explicação detalhada**: Deve ensinar o conceito e mencionar o serviço AWS relevante
- **Explicações incorretas**: Devem explicar POR QUÊ a opção está errada, não apenas dizer que está
- Use linguagem clara e educativa
- Conecte a resposta com casos de uso reais

---

## 🔢 NUMERAÇÃO E IDs

### Padrão de ID:
```
aif-c01-[dominio]-[numero]

Exemplos:
- aif-c01-ai_fundamentals-001
- aif-c01-ai_services-042
- aif-c01-responsible_ai-015
- aif-c01-ml_development-028
```

### Distribuição Sugerida:
- **AI_FUNDAMENTALS**: 001-100 (fundamentos, conceitos básicos)
- **AI_SERVICES**: 101-250 (serviços AWS específicos)
- **RESPONSIBLE_AI**: 251-320 (ética, viés, segurança)
- **ML_DEVELOPMENT**: 321-400 (ciclo de vida, deployment, MLOps)

---

## ⚠️ IMPORTANTE

### Campo `required_selection_count`
- Maioria das questões: `1` (uma resposta correta)
- Se múltipla escolha: `2` ou mais (e `correct_answers` deve ter múltiplas respostas)

### Campo `correct_answers`
- Deve ser um ARRAY de strings: `["A"]` ou `["A", "C"]`
- Não usar string simples: ❌ `"A"`
- Usar array: ✅ `["A"]`

### Dificuldade
- **easy**: Conceitos básicos, definições, casos de uso óbvios
- **medium**: Escolha entre serviços, cenários com múltiplas variáveis
- **hard**: Otimização, trade-offs, cenários complexos com restrições

---

## 📦 FORMATO FINAL PARA IMPORTAÇÃO

Salvar como JSON:

```json
[
  {
    "id": "aif-c01-ai_fundamentals-001",
    "certification_id": "AIF-C01",
    "domain": "AI_FUNDAMENTALS",
    "difficulty": "easy",
    "tier": "FREE",
    "required_selection_count": 1,
    "active": true,
    "question_text": "...",
    "option_a": "...",
    "option_b": "...",
    "option_c": "...",
    "option_d": "...",
    "correct_answers": ["A"],
    "explanation_detailed": "...",
    "incorrect_explanations": {
      "B": "...",
      "C": "...",
      "D": "..."
    }
  }
]
```

---

**Próximo passo**: Use o prompt de conversão (veja PROMPT_CONVERSAO_AIF.md) para transformar questões existentes neste formato.
