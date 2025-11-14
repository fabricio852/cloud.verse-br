# ✅ Guia: Validar e Completar Questões Geradas em Inglês

## 📋 Campos Obrigatórios vs Opcionais

### ✅ Campos que SEMPRE virão prontos (da IA em Inglês):
```
✓ id
✓ question (em inglês)
✓ options.A, B, C, D (em inglês)
✓ correct (A, B, C, ou D)
✓ explanation_basic (em inglês)
✓ explanation_detailed (em inglês)
✓ incorrect_explanations.A, B, C, D (em inglês)
✓ difficulty (easy, medium, hard)
✓ official_domain (SECURE, RESILIENT, PERFORMANCE, COST)
✓ primary_service (IAM, S3, RDS, etc)
```

### ⚠️ Campos que PRECISAM de TRADUÇÃO para Português:
```
⚠️ question → TRADUZIR
⚠️ options.A → TRADUZIR
⚠️ options.B → TRADUZIR
⚠️ options.C → TRADUZIR
⚠️ options.D → TRADUZIR
⚠️ explanation_basic → TRADUZIR
⚠️ explanation_detailed → TRADUZIR
⚠️ incorrect_explanations → TRADUZIR todas as explicações
```

### 🔴 Campos que PRECISAM ser CRIADOS/VALIDADOS:
```
🔴 tier (FREE ou PRO - pode não estar)
🔴 domain (SECURE, RESILIENT, etc - pode não estar)
🔴 certification (SAA-C03 - pode não estar)
```

### ⚪ Campos OPCIONAIS (não usados no app atual):
```
⚪ tags (existe no banco mas não é usado - pode deixar vazio ou preencher)
⚪ primary_service (só para sua análise - não vai pro banco)
⚪ related_services (só para sua análise - não vai pro banco)
⚪ topic (só para sua análise - não vai pro banco)
```

---

## 🔍 CHECKLIST: O QUE PROCURAR EM CADA QUESTÃO

### 1️⃣ TRADUÇÃO (Inglês → Português Brasil)

**Procure por:**
- [ ] `question` está em PORTUGUÊS?
- [ ] `options.A, B, C, D` estão em PORTUGUÊS?
- [ ] `explanation_basic` está em PORTUGUÊS?
- [ ] `explanation_detailed` está em PORTUGUÊS?
- [ ] `incorrect_explanations` para A, B, C, D estão em PORTUGUÊS?

**Exemplo - ANTES (Inglês):**
```json
{
  "id": "saa-secure-042",
  "question": "A company needs to encrypt data in S3 with customer-managed keys. Which approach is correct?",
  "options": {
    "A": "Use SSE-S3 (default S3 encryption)",
    "B": "Use SSE-KMS with AWS Managed Keys",
    "C": "Use SSE-KMS with Customer Managed Keys (CMK) in AWS KMS",
    "D": "Encrypt locally before uploading"
  },
  "explanation_basic": "SSE-KMS with CMK gives you full control over encryption keys..."
}
```

**Exemplo - DEPOIS (Português):**
```json
{
  "id": "saa-secure-042",
  "question": "Uma empresa precisa criptografar dados no S3 com chaves gerenciadas pelo cliente. Qual abordagem está correta?",
  "options": {
    "A": "Usar SSE-S3 (criptografia padrão do S3)",
    "B": "Usar SSE-KMS com AWS Managed Keys",
    "C": "Usar SSE-KMS com Customer Managed Keys (CMK) no AWS KMS",
    "D": "Criptografar localmente antes de fazer upload"
  },
  "explanation_basic": "SSE-KMS com CMK oferece controle total sobre as chaves de criptografia..."
}
```

---

### 2️⃣ TAGS (OPCIONAL - não usado no app)

⚠️ **IMPORTANTE**: Tags existem no banco mas **NÃO são usadas** no app atual.

**Você pode:**
- ✅ Deixar vazio: `"tags": []`
- ✅ Ou preencher para organização futura: `"tags": ["S3", "KMS", "Encryption"]`

**Não precisa perder tempo validando tags.** O app só usa:
- ✅ `domain` (SECURE, RESILIENT, PERFORMANCE, COST)
- ✅ `tier` (FREE ou PRO)
- ✅ `difficulty` (easy, medium, hard)

---

### 3️⃣ TIER (IMPORTANTE - Validação Obrigatória)

**Procure por:**
- [ ] Campo `tier` existe?
- [ ] `tier` contém "FREE" ou "PRO"?

**Se não existe ou está vazio, adicione:**
- 60% das questões = `"FREE"`
- 40% das questões = `"PRO"`

**Critério:**
```
"FREE"  → Questões mais fáceis (easy/medium)
"PRO"   → Questões mais desafiadoras (medium/hard)
```

**Exemplo:**
```json
{
  "id": "saa-secure-042",
  "difficulty": "medium",
  "tier": "FREE"  // ✅ Completado
}
```

---

### 4️⃣ DOMAIN (IMPORTANTE - Validação Obrigatória)

**Procure por:**
- [ ] Campo `domain` existe?
- [ ] `domain` é um dos: SECURE, RESILIENT, PERFORMANCE, COST?

**Se não existe, deduza do `official_domain`:**
```json
{
  "official_domain": "RESILIENT",
  "domain": "RESILIENT"  // ✅ Mesma coisa
}
```

**Exemplo:**
```json
{
  "id": "saa-resilient-023",
  "official_domain": "RESILIENT",
  "domain": "RESILIENT"  // ✅ Validado
}
```

---

### 5️⃣ CERTIFICATION_ID (Validação)

**Procure por:**
- [ ] Campo `certification` ou `certification_id` existe?
- [ ] Contém "SAA-C03"?

**Se não existe, adicione:**
```json
{
  "id": "saa-secure-042",
  "certification": "SAA-C03"  // ✅ Ou coloque como campo do wrapper
}
```

---

## 🛠️ PROCESSO PASSO A PASSO

### 1. Copiar questões da IA

A IA vai fornecer um JSON grande com 50 questões. Salve como:
```
data/certifications/SAA-C03/secure-from-ai.json
```

### 2. Validar estrutura básica

Para CADA questão, verifique:
```json
{
  "id": "saa-secure-XXX",                    // ✅ Existe?
  "question": "...",                         // ⚠️ Em INGLÊS - TRADUZIR
  "options": {
    "A": "...",                              // ⚠️ Em INGLÊS - TRADUZIR
    "B": "...",                              // ⚠️ Em INGLÊS - TRADUZIR
    "C": "...",                              // ⚠️ Em INGLÊS - TRADUZIR
    "D": "..."                               // ⚠️ Em INGLÊS - TRADUZIR
  },
  "correct": "B",                            // ✅ Existe?
  "explanation_basic": "...",                // ⚠️ Em INGLÊS - TRADUZIR
  "explanation_detailed": "...",             // ⚠️ Em INGLÊS - TRADUZIR
  "incorrect_explanations": {
    "A": "...",                              // ⚠️ Em INGLÊS - TRADUZIR
    "B": "...",                              // ⚠️ Em INGLÊS - TRADUZIR
    "C": "...",                              // ⚠️ Em INGLÊS - TRADUZIR
    "D": "..."                               // ⚠️ Em INGLÊS - TRADUZIR
  },
  "tags": ["..."],                           // 🔴 Validar/Completar
  "difficulty": "medium",                    // ✅ Existe?
  "tier": "FREE",                            // 🔴 Validar/Completar
  "official_domain": "SECURE",               // ✅ Existe?
  "domain": "SECURE",                        // 🔴 Validar/Completar
  "primary_service": "KMS",                  // ✅ Existe?
  "related_services": ["S3", "IAM"]          // ✅ Existe?
}
```

### 3. Traduzir para Português

Use uma ferramenta ou IA (como Claude/ChatGPT) para traduzir APENAS:
- `question`
- `options.A`, `B`, `C`, `D`
- `explanation_basic`
- `explanation_detailed`
- `incorrect_explanations` (todas 4)

**⚠️ NUNCA altere:**
- `id`
- `correct`
- `difficulty`
- `official_domain`
- `primary_service`

### 4. Completar campos faltantes

Para CADA questão:
```
✅ Se tier está vazio → Adicione "FREE" ou "PRO"
✅ Se tags está vazio → Adicione 3-5 tags relevantes
✅ Se domain está vazio → Cópia de official_domain
```

### 5. Validação final

Crie um checklist por questão:
```
[ ] ID é único?
[ ] Question está em PORTUGUÊS?
[ ] Options A,B,C,D estão em PORTUGUÊS?
[ ] Correct está setado (A, B, C, ou D)?
[ ] Explanation_basic está em PORTUGUÊS?
[ ] Explanation_detailed está em PORTUGUÊS?
[ ] Incorrect_explanations estão em PORTUGUÊS?
[ ] Tags tem 3-5 elementos?
[ ] Tags inclui domínio oficial?
[ ] Tier está "FREE" ou "PRO"?
[ ] Domain está SECURE, RESILIENT, PERFORMANCE, ou COST?
[ ] Difficulty está easy, medium, ou hard?
```

---

## 💡 DICAS PARA TRADUÇÃO

### Termos técnicos que NÃO se traduzem:
```
IAM, S3, RDS, DynamoDB, Lambda, EC2, VPC, ALB, NLB, CLB, Route 53,
CloudFront, ElastiCache, SQS, SNS, KMS, CloudTrail, WAF, Shield,
Auto Scaling, Direct Connect, SSL/TLS, HTTPS, HTTP, JSON, YAML
```

### Como traduzir frases comuns:
```
"A company needs to..." → "Uma empresa precisa..."
"What is the best approach?" → "Qual é a melhor abordagem?"
"Which service provides..." → "Qual serviço fornece..."
"High availability" → "Alta disponibilidade"
"Disaster recovery" → "Recuperação de desastres"
"Encryption keys" → "Chaves de criptografia"
```

---

## 📝 TEMPLATE DE QUESTÃO COMPLETADA

```json
{
  "id": "saa-secure-042",
  "question": "Uma empresa tem dados críticos em S3 que devem ser criptografados com chaves gerenciadas pelo cliente. Qual abordagem é CORRETA?",
  "options": {
    "A": "Usar SSE-S3 (criptografia padrão do S3)",
    "B": "Usar SSE-KMS com AWS Managed Keys",
    "C": "Usar SSE-KMS com Customer Managed Keys (CMK) no AWS KMS",
    "D": "Criptografar localmente antes de fazer upload"
  },
  "correct": "C",
  "explanation_basic": "SSE-KMS com CMK permite controle total das chaves de criptografia. Você gerencia rotação, acesso e auditoria das chaves.",
  "explanation_detailed": "SSE-KMS com Customer Managed Keys oferece controle máximo: você gerencia a chave no KMS, controla quem tem acesso via IAM policies, monitora uso via CloudTrail, e pode realizar rotação automática. Ideal para compliance (HIPAA, GDPR, PCI-DSS). AWS Managed Keys limitam seu controle.",
  "incorrect_explanations": {
    "A": "SSE-S3 usa chaves gerenciadas pela AWS, não pelo cliente.",
    "B": "AWS Managed Keys são gerenciadas pela AWS, não oferecendo controle ao cliente.",
    "C": "Esta é a resposta correta.",
    "D": "Possível mas não é a melhor prática. KMS integrado é mais seguro e auditável."
  },
  "tags": [],  // ⚪ Opcional - não usado no app (pode deixar vazio)
  "difficulty": "medium",  // ✅ Obrigatório
  "tier": "PRO",  // ✅ Obrigatório
  "domain": "SECURE"  // ✅ Obrigatório
}
```

---

## ⚡ CHECKLIST RÁPIDO (Usar para cada questão)

```
⚠️ Tradução (OBRIGATÓRIO):
  [ ] question em PT
  [ ] options A,B,C,D em PT
  [ ] explanation_basic em PT
  [ ] explanation_detailed em PT
  [ ] incorrect_explanations em PT

🔴 Campos obrigatórios:
  [ ] tier (FREE ou PRO)
  [ ] domain (SECURE/RESILIENT/PERFORMANCE/COST)
  [ ] difficulty (easy/medium/hard)
  [ ] correct (A, B, C, ou D)

✅ Validação:
  [ ] ID único e sequencial
  [ ] certification = "SAA-C03"

⚪ Opcional (pode ignorar):
  [ ] tags (deixe vazio [] se não quiser preencher)
```

---

**Pronto para validar as questões da IA!** ✅
