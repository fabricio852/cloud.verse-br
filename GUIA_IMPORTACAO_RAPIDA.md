# 🚀 Guia de Importação Rápida - Suas Questões

Você tem questões em JSON no formato customizado. Aqui está como importar **TODAS DE UMA VEZ**!

## 📝 Passo a Passo (3 minutos)

### 1️⃣ Preparar o Arquivo

Crie um arquivo chamado `custom-questions.json` na pasta `data/`:

```
nuvem-mestra---aws-trainer/
  └── data/
      └── custom-questions.json  ← Cole suas questões aqui
```

**Formato esperado:**

```json
[
  {
    "question": "244. Uma empresa planeja migrar...",
    "options": [
      "A. AWS DataSync",
      "B. AWS Application Migration Service",
      "C. AWS Application Discovery Service",
      "D. AWS Database Migration Service (AWS DMS)"
    ],
    "correctAnswer": "C. AWS Application Discovery Service",
    "explanation": "O AWS Application Discovery Service ajuda...",
    "multiSelect": false
  },
  {
    "question": "245. Uma empresa está utilizando...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correctAnswer": ["A. AWS Glue", "C. Amazon Redshift"],
    "explanation": "...",
    "multiSelect": true
  }
]
```

**Cole todas as suas questões neste arquivo!**

---

### 2️⃣ Importar para o Supabase

Execute no terminal:

```bash
npm run import-custom
```

**Pronto!** 🎉

Todas as questões serão:
- ✅ Convertidas automaticamente para o formato correto
- ✅ Recebem IDs únicos (saa-secure-001, saa-secure-002, etc)
- ✅ Tags extraídas automaticamente (serviços AWS mencionados)
- ✅ Inseridas no Supabase

---

## ⚙️ Opções Avançadas

### Especificar Certificação e Domínio

```bash
# Importar como CLF-C02 (Cloud Practitioner)
npm run import-custom -- --cert=CLF-C02 --domain=CLOUD_CONCEPTS

# Importar como domínio RESILIENT
npm run import-custom -- --cert=SAA-C03 --domain=RESILIENT

# Importar como domínio PERFORMANCE
npm run import-custom -- --cert=SAA-C03 --domain=PERFORMANCE

# Importar como domínio COST
npm run import-custom -- --cert=SAA-C03 --domain=COST
```

### Especificar ID Inicial

```bash
# Começar do ID 100
npm run import-custom -- --start=100

# Resultado: saa-secure-100, saa-secure-101, etc
```

### Especificar Tier e Dificuldade

```bash
# Importar como PRO e difícil
npm run import-custom -- --tier=PRO --difficulty=hard

# Importar como FREE e fácil
npm run import-custom -- --tier=FREE --difficulty=easy
```

### Arquivo Customizado

```bash
# Usar outro arquivo
npm run import-custom -- --file=data/minhas-questoes.json
```

### Combinar Opções

```bash
# Exemplo completo
npm run import-custom -- \
  --cert=SAA-C03 \
  --domain=SECURE \
  --start=1 \
  --tier=FREE \
  --difficulty=medium \
  --file=data/custom-questions.json
```

---

## 📊 O que o Script Faz

### 1. **Conversão Automática**

Seu formato:
```json
{
  "question": "Uma empresa planeja...",
  "options": ["A. AWS DataSync", "B. ...", "C. ...", "D. ..."],
  "correctAnswer": "C. AWS Application Discovery Service",
  "explanation": "O AWS Application Discovery Service...",
  "multiSelect": false
}
```

↓ **Convertido para:** ↓

```json
{
  "id": "saa-secure-001",
  "certification_id": "SAA-C03",
  "domain": "SECURE",
  "question_text": "Uma empresa planeja...",
  "option_a": "AWS DataSync",
  "option_b": "AWS Application Migration Service",
  "option_c": "AWS Application Discovery Service",
  "option_d": "AWS Database Migration Service (AWS DMS)",
  "correct_answer": "C",
  "explanation_basic": "O AWS Application Discovery Service...",
  "explanation_detailed": "O AWS Application Discovery Service...",
  "tags": ["AWS", "Migration", "Application Discovery Service"],
  "difficulty": "medium",
  "tier": "FREE"
}
```

### 2. **Extração Inteligente de Tags**

O script identifica automaticamente:
- **Serviços AWS** mencionados (S3, EC2, Lambda, etc)
- **Categorias** (Security, Storage, Networking, etc)
- Remove duplicatas e limita a 8 tags

Exemplo:
```
"Uma empresa precisa armazenar dados no Amazon S3 com criptografia usando AWS KMS..."
↓
Tags: ["S3", "KMS", "Security", "Storage"]
```

### 3. **Suporte a Multi-Select**

Questões com múltiplas respostas corretas são identificadas:

```json
{
  "correctAnswer": ["A. AWS Glue", "C. Amazon Redshift"],
  "multiSelect": true
}
```

O script:
- Extrai a primeira letra como resposta principal
- Marca na explicação: "(Questão de múltipla escolha)"
- Você pode adicionar lógica customizada depois

---

## 🎯 Domínios Disponíveis

Para **SAA-C03** (Solutions Architect Associate):

| Domínio | Peso | Descrição |
|---------|------|-----------|
| `SECURE` | 30% | Arquitetura segura |
| `RESILIENT` | 26% | Arquitetura resiliente |
| `PERFORMANCE` | 24% | Alto desempenho |
| `COST` | 20% | Custo otimizado |

Para **CLF-C02** (Cloud Practitioner):

| Domínio | Peso | Descrição |
|---------|------|-----------|
| `CLOUD_CONCEPTS` | 26% | Conceitos de nuvem |
| `SECURITY` | 25% | Segurança e conformidade |
| `TECHNOLOGY` | 33% | Tecnologia |
| `BILLING` | 16% | Faturamento e pricing |

---

## ✅ Verificar Importação

### 1. No Terminal

Você verá:
```
🚀 Importação de Questões Customizadas

📂 Arquivo: data/custom-questions.json
📚 Certificação: SAA-C03
🏗️  Domínio: SECURE
🔢 ID inicial: 1
🎯 Tier: FREE
📊 Dificuldade: medium

📝 245 questões encontradas

...................................................  50
...................................................  100
...................................................  150
...................................................  200
.............................................      245

📊 Resumo:
  ✅ Importadas: 245
  ❌ Erros: 0
  📝 Total: 245

✨ Concluído!
```

### 2. No Supabase Dashboard

1. Abra: https://supabase.com/dashboard
2. Vá em **Table Editor** → **questions**
3. Filtre: `certification_id = "SAA-C03"` e `domain = "SECURE"`
4. Veja suas questões importadas! 🎉

---

## 🔧 Troubleshooting

### Erro: "Arquivo não encontrado"

**Solução:**
```bash
# Certifique-se que o arquivo existe
ls data/custom-questions.json

# Se não existir, crie:
# Windows (PowerShell)
New-Item -Path data\custom-questions.json -ItemType File

# Mac/Linux
touch data/custom-questions.json
```

Depois cole suas questões no arquivo.

---

### Erro: "JSON deve ser um array"

Seu JSON precisa ser um **array** de questões:

❌ **Errado:**
```json
{
  "question": "...",
  "options": [...]
}
```

✅ **Correto:**
```json
[
  {
    "question": "...",
    "options": [...]
  },
  {
    "question": "...",
    "options": [...]
  }
]
```

**Nota:** Coloque `[` no início e `]` no final!

---

### Erro: "Variáveis de ambiente não encontradas"

**Solução:** Certifique-se que o `.env.local` existe e tem:

```bash
VITE_SUPABASE_URL=https://xxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Questões duplicadas

O script usa `upsert`, então:
- Se o ID já existe → **atualiza**
- Se o ID não existe → **insere novo**

Para começar do zero:
```bash
# Limpar todas as questões do Supabase
# (No SQL Editor do Supabase)
DELETE FROM questions WHERE certification_id = 'SAA-C03';

# Depois reimporte
npm run import-custom
```

---

## 💡 Dicas Importantes

### 1. **Organize por Domínio**

Se você tem questões de diferentes domínios, separe em arquivos:

```bash
# Domínio SECURE
npm run import-custom -- \
  --file=data/questoes-secure.json \
  --domain=SECURE \
  --start=1

# Domínio RESILIENT
npm run import-custom -- \
  --file=data/questoes-resilient.json \
  --domain=RESILIENT \
  --start=1

# Domínio PERFORMANCE
npm run import-custom -- \
  --file=data/questoes-performance.json \
  --domain=PERFORMANCE \
  --start=1

# Domínio COST
npm run import-custom -- \
  --file=data/questoes-cost.json \
  --domain=COST \
  --start=1
```

### 2. **Distribuição FREE vs PRO**

Recomendação:
- **60% FREE** (para atrair usuários)
- **40% PRO** (para monetizar)

```bash
# Primeiras 150 questões FREE
npm run import-custom -- --tier=FREE --start=1

# Próximas 100 questões PRO
npm run import-custom -- --tier=PRO --start=151
```

### 3. **Validar JSON Antes**

Use um validador online:
- https://jsonlint.com
- VS Code (já valida automaticamente)

---

## 🎉 Exemplo Completo

### Arquivo: `data/custom-questions.json`

```json
[
  {
    "question": "244. Uma empresa planeja migrar para a nuvem AWS. A empresa está reunindo informações sobre sua infraestrutura local e requer informações como nome do host, endereço IP e endereço MAC. Qual serviço da AWS atende a esses requisitos?",
    "options": [
      "A. AWS DataSync",
      "B. AWS Application Migration Service",
      "C. AWS Application Discovery Service",
      "D. AWS Database Migration Service (AWS DMS)"
    ],
    "correctAnswer": "C. AWS Application Discovery Service",
    "explanation": "O AWS Application Discovery Service ajuda a planejar sua migração para a nuvem AWS coletando dados sobre sua infraestrutura local.",
    "multiSelect": false
  },
  {
    "question": "245. Uma empresa está utilizando uma plataforma de dados central para gerenciar vários tipos de dados para seus clientes. A empresa quer usar serviços da AWS para descobrir, transformar e visualizar os dados. Quais combinações de serviços da AWS a empresa deve usar para atender a esses requisitos? (Selecione DOIS.)",
    "options": [
      "A. AWS Glue",
      "B. Amazon Elastic File System (Amazon EFS)",
      "C. Amazon Redshift",
      "D. Amazon QuickSight",
      "E. Amazon Quantum Ledger Database (Amazon QLDB)"
    ],
    "correctAnswer": ["A. AWS Glue", "C. Amazon Redshift"],
    "explanation": "O AWS Glue pode ser usado para a descoberta e transformação de dados, enquanto o Amazon Redshift pode ser usado para análise e visualização de dados com o Amazon QuickSight.",
    "multiSelect": true
  }
]
```

### Comando:

```bash
npm run import-custom -- --cert=SAA-C03 --domain=SECURE --tier=FREE
```

### Resultado:

```
✅ 2 questões importadas
   - saa-secure-001
   - saa-secure-002
```

---

## 🚀 Próximos Passos

Depois de importar:

1. **Verificar no Supabase**
   ```
   Dashboard → Table Editor → questions
   ```

2. **Testar no App**
   ```bash
   npm run dev
   ```

3. **Fazer um quiz**
   - Login → Iniciar Quiz → Ver suas questões! 🎉

---

**Dúvidas?** Consulte `INTEGRACAO_COMPLETA.md` ou `scripts/README.md`
