# 📚 Guia de Questões - AWS Trainer

## 📁 Estrutura de Arquivos

```
data/
└── certifications/
    ├── SAA-C03/              # Solutions Architect Associate
    │   ├── metadata.json     # Configuração da certificação
    │   ├── secure.json       # Questões do domínio SECURE (30%)
    │   ├── resilient.json    # Questões do domínio RESILIENT (26%)
    │   ├── performance.json  # Questões do domínio PERFORMANCE (24%)
    │   └── cost.json         # Questões do domínio COST (20%)
    │
    ├── CLF-C01/              # Cloud Practitioner
    │   └── metadata.json
    │
    └── AIF-C01/              # AI Practitioner
        └── metadata.json
```

## ✍️ Como Adicionar Questões

### 1. Escolha o Arquivo Correto

Cada certificação tem arquivos separados por domínio. Para **SAA-C03**:
- `secure.json` → Questões sobre segurança
- `resilient.json` → Questões sobre resiliência
- `performance.json` → Questões sobre performance
- `cost.json` → Questões sobre otimização de custos

### 2. Formato de uma Questão

```json
{
  "id": "saa-secure-001",
  "question": "Texto da questão aqui...",
  "options": {
    "A": "Primeira opção",
    "B": "Segunda opção",
    "C": "Terceira opção",
    "D": "Quarta opção"
  },
  "correct": "B",
  "explanation_basic": "Explicação curta (1-2 frases) - VISÍVEL PARA FREE",
  "explanation_detailed": "Explicação completa com detalhes técnicos - APENAS PRO",
  "incorrect_explanations": {
    "A": "Por que A está errada",
    "C": "Por que C está errada",
    "D": "Por que D está errada"
  },
  "tags": ["S3", "Security", "IAM"],
  "difficulty": "medium",
  "tier": "FREE"
}
```

### 3. Campos Explicados

| Campo | Obrigatório | Descrição | Exemplos |
|-------|------------|-----------|----------|
| `id` | ✅ Sim | Identificador único | `saa-secure-001`, `clf-cloud-015` |
| `question` | ✅ Sim | Enunciado da questão | "Uma empresa precisa..." |
| `options` | ✅ Sim | 4 alternativas (A, B, C, D) | `{"A": "...", "B": "...", ...}` |
| `correct` | ✅ Sim | Resposta correta | `"A"`, `"B"`, `"C"` ou `"D"` |
| `explanation_basic` | ✅ Sim | Explicação curta (FREE) | "S3 Object Lock impede..." |
| `explanation_detailed` | ✅ Sim | Explicação detalhada (PRO) | "S3 Object Lock em modo Compliance..." |
| `incorrect_explanations` | ✅ Sim | Por que outras estão erradas | `{"A": "...", "C": "...", "D": "..."}` |
| `tags` | ❌ Não | Tags para busca | `["S3", "Lambda", "API Gateway"]` |
| `difficulty` | ✅ Sim | Dificuldade | `"easy"`, `"medium"`, `"hard"` |
| `tier` | ✅ Sim | FREE ou PRO | `"FREE"` ou `"PRO"` |

### 4. Proporções Recomendadas

Para **SAA-C03** (baseado no exame oficial):
- **SECURE**: 30% das questões (~20 de 65)
- **RESILIENT**: 26% das questões (~17 de 65)
- **PERFORMANCE**: 24% das questões (~16 de 65)
- **COST**: 20% das questões (~13 de 65)

**Distribuição FREE vs PRO**:
- **60% FREE** (~40 questões) - dificuldade fácil/média
- **40% PRO** (~25 questões) - dificuldade média/difícil

### 5. Boas Práticas

✅ **FAÇA**:
- Use cenários realistas (empresas, requisitos de negócio)
- Seja específico nas opções erradas (não óbvias demais)
- Adicione números/contexto ("por 7 anos", "1000 usuários", "latência <100ms")
- Explique o "porquê" na explanation_detailed
- Use tags para facilitar busca futura

❌ **EVITE**:
- Questões ambíguas (2 respostas corretas)
- Opções absurdas ("Deletar a AWS")
- Explicações genéricas ("Porque é melhor")
- Erros de português/gramática

### 6. Exemplo Completo

```json
{
  "id": "saa-cost-042",
  "question": "Uma startup precisa hospedar um site WordPress com tráfego variável (50-5000 usuários/dia). O CEO quer minimizar custos operacionais sem sacrificar disponibilidade. Qual arquitetura você recomenda?",
  "options": {
    "A": "EC2 t3.large com Reserved Instance de 3 anos + RDS MySQL m5.large",
    "B": "Lightsail com plano de $10/mês + banco MySQL integrado",
    "C": "ECS Fargate + Aurora Serverless v2",
    "D": "Lambda + API Gateway + DynamoDB"
  },
  "correct": "C",
  "explanation_basic": "ECS Fargate escala automaticamente conforme demanda (0-5000 usuários) e você só paga pelo que usa. Aurora Serverless v2 ajusta capacidade do banco automaticamente.",
  "explanation_detailed": "ECS Fargate elimina gerenciamento de servidores e escala de 0 a milhares de containers automaticamente. Com tráfego variável (50-5000), você paga apenas pelas horas de uso real, não por capacidade ociosa. Aurora Serverless v2 escala de 0.5 ACU a 128 ACUs em segundos, ideal para cargas imprevisíveis. Custo típico: $50-200/mês vs $500+ com Reserved Instances. Opção A desperdiça $ em baixo tráfego. Opção B (Lightsail) não escala bem para 5k usuários. Opção D (serverless puro) não é ideal para WordPress (precisa de sistema de arquivos).",
  "incorrect_explanations": {
    "A": "Reserved Instances de 3 anos prendem você em capacidade fixa. Com tráfego variável, você pagará por recursos ociosos 90% do tempo. Não é otimizado para custos.",
    "B": "Lightsail de $10/mês não aguenta picos de 5000 usuários. Você precisaria fazer upgrade manual constantemente ou enfrentar downtime.",
    "D": "WordPress precisa de filesystem persistente (wp-content, uploads, plugins). Lambda é stateless. Você precisaria refatorar completamente o WordPress, o que aumenta custos de desenvolvimento."
  },
  "tags": ["ECS", "Fargate", "Aurora Serverless", "Cost Optimization", "Scaling", "WordPress"],
  "difficulty": "hard",
  "tier": "PRO"
}
```

## 🚀 Próximos Passos

1. **Adicione suas questões** nos arquivos `.json`
2. **Valide o JSON** (use um validador online ou VS Code)
3. **Teste localmente** antes de fazer deploy
4. **Importe para Supabase** quando estiver pronto

## 📊 Meta de Questões

Para lançamento MVP (SAA-C03):
- [ ] **Mínimo**: 50 questões (30 FREE + 20 PRO)
- [ ] **Ideal**: 100 questões (60 FREE + 40 PRO)
- [ ] **Objetivo Final**: 300+ questões por certificação

---

**Dúvidas?** Revise o exemplo em `SAA-C03/secure.json` (questão `saa-secure-001`)
