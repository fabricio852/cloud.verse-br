# 🎯 Guia Detalhado: Domínios, Tópicos e Tags da SAA-C03

## 📊 Distribuição Oficial dos Domínios SAA-C03

A prova SAA-C03 (Solutions Architect Associate) tem **4 domínios principais**:

| Domínio | % da Prova | Descrição | Exemplos |
|---------|-----------|-----------|----------|
| **SECURE** | 30% | **Arquitetura Segura** | IAM, Encryption, VPC, Security Groups, WAF, Shield |
| **RESILIENT** | 26% | **Arquitetura Resiliente** | Multi-AZ, Auto Scaling, Load Balancing, RDS failover |
| **PERFORMANCE** | 24% | **Arquitetura de Alto Desempenho** | Caching, CDN, DynamoDB, ElastiCache, RDS optimization |
| **COST** | 20% | **Arquitetura com Custo Otimizado** | Pricing, Reserved Instances, Spot, Storage tiers |

---

## 🏷️ Tags Oficiais por Domínio

### 🔐 DOMÍNIO: SECURE (Arquitetura Segura)

**Tópicos principais:**
- IAM (Identity and Access Management)
- Encryption (Criptografia)
- VPC (Virtual Private Cloud)
- Security Groups & NACLs
- KMS & Secrets Manager
- CloudTrail & Logging
- WAF (Web Application Firewall)
- Shield & DDoS
- Certificate Manager
- VPN & Direct Connect

**Tags a usar:**
```
["IAM", "Security Groups", "VPC", "KMS", "Encryption", "S3", "CloudTrail"]
["Secrets Manager", "WAF", "Shield", "SSL/TLS", "ACL", "Network Security"]
["Compliance", "Audit", "Access Control", "Data Protection", "Identity"]
```

**Exemplos de questões:**
- Qual serviço controla permissões de usuários? → **IAM**
- Como criptografar dados em S3 com chaves do cliente? → **KMS**
- Como isolar recursos em rede virtual? → **VPC**

---

### 🛡️ DOMÍNIO: RESILIENT (Arquitetura Resiliente)

**Tópicos principais:**
- High Availability (HA)
- Multi-AZ Deployments
- Auto Scaling
- Load Balancing (ALB, NLB, CLB)
- RDS with failover
- Replication (cross-region)
- Snapshots & Backups
- Route 53 failover
- SQS & decoupling

**Tags a usar:**
```
["Multi-AZ", "Auto Scaling", "Load Balancer", "High Availability"]
["RDS", "Failover", "Replication", "Route 53", "Health Check"]
["Backup", "Disaster Recovery", "Decoupling", "SQS", "SNS"]
["Availability Zone", "Regional", "Cross-region", "Resilience"]
```

**Exemplos de questões:**
- Como garantir que aplicação continua se 1 AZ cai? → **Multi-AZ + ALB**
- Qual serviço faz balanceamento de carga? → **ALB/NLB**
- Como escalar automaticamente? → **Auto Scaling**

---

### ⚡ DOMÍNIO: PERFORMANCE (Arquitetura de Alto Desempenho)

**Tópicos principais:**
- Caching strategies (ElastiCache, CloudFront)
- CDN (CloudFront)
- Database optimization
- DynamoDB (provisioned vs on-demand)
- RDS Read Replicas
- Compute optimization
- Network optimization
- S3 Transfer Acceleration
- Kinesis & streaming

**Tags a usar:**
```
["Caching", "CloudFront", "ElastiCache", "CDN", "Performance"]
["DynamoDB", "RDS", "Database", "Read Replica", "Query Optimization"]
["Latency", "Throughput", "Scalability", "Optimization"]
["Redis", "Memcached", "S3 Transfer Acceleration", "Global"]
```

**Exemplos de questões:**
- Como reduzir latência para usuários globais? → **CloudFront**
- Como acelerar reads de DynamoDB? → **DynamoDB Accelerator (DAX)**
- Qual é mais rápido para leitura: RDS ou DynamoDB? → **Context-dependent**

---

### 💰 DOMÍNIO: COST (Arquitetura com Custo Otimizado)

**Tópicos principais:**
- Pricing models (On-demand, Reserved, Spot, Savings Plans)
- Storage optimization (S3 lifecycle, Glacier)
- Right-sizing instances
- Cost monitoring (Cost Explorer, Budgets)
- Data transfer costs
- Compute options (Lambda vs EC2)
- Managed services vs self-managed

**Tags a usar:**
```
["Pricing", "Cost Optimization", "Reserved Instances", "Spot"]
["S3 Lifecycle", "Glacier", "Storage", "Cost Explorer"]
["Savings Plans", "Right-sizing", "Instance Type", "Reserved Capacity"]
["Lambda", "Serverless", "Data Transfer", "Estimated costs"]
```

**Exemplos de questões:**
- Qual opção é mais barata para 3 anos de uso constante? → **Reserved Instances**
- Como reduzir custo de armazenamento de logs antigos? → **S3 Lifecycle to Glacier**
- Qual é mais barato: Lambda ou EC2 para picos de tráfego? → **Context-dependent**

---

## 🎯 PROMPT MELHORADO PARA IA

Use este prompt para gerar questões **com análise de domínio e tags automáticas**:

```
Você é um especialista certificado em AWS SAA-C03 (Solutions Architect Associate).

GERE 50 QUESTÕES para o domínio SECURE da prova SAA-C03.

Para CADA questão, faça:

1. CRIE a questão técnica e desafiadora
2. ANALISE qual domínio ela pertence (SECURE, RESILIENT, PERFORMANCE, ou COST)
3. IDENTIFIQUE os tópicos AWS específicos (IAM, KMS, VPC, etc)
4. ATRIBUA 3-5 tags relevantes
5. RESPONDA exatamente neste formato JSON:

{
  "id": "saa-secure-XXX",
  "question": "Questão em português (Brasil)",
  "domain_analysis": "SECURE - Esta questão testa conhecimento de [tópico específico] que representa X% da prova",
  "options": {
    "A": "Opção incorreta mas plausível",
    "B": "Opção correta (exemplo)",
    "C": "Opção incorreta mas plausível",
    "D": "Opção incorreta mas plausível"
  },
  "correct": "B",
  "explanation_basic": "Explicação curta para FREE users - 1-2 linhas",
  "explanation_detailed": "Explicação PRO: 3-5 parágrafos com referências AWS, serviços relacionados, trade-offs",
  "incorrect_explanations": {
    "A": "Por que está errada (conceito incorreto)",
    "B": "Porque está correta / confirmação",
    "C": "Por que está errada (conceito incorreto)",
    "D": "Por que está errada (conceito incorreto)"
  },
  "primary_service": "S3",
  "related_services": ["IAM", "KMS", "CloudTrail"],
  "tags": ["S3", "Security", "Encryption", "Compliance", "Data Protection"],
  "difficulty": "medium",
  "tier": "FREE",
  "official_domain": "SECURE",
  "topic": "Data Encryption in S3 with Customer Managed Keys"
}

IMPORTANTES:
✓ official_domain DEVE SER: SECURE, RESILIENT, PERFORMANCE, ou COST
✓ topic: Nome do tópico oficial AWS (ex: "Multi-AZ Deployment", "Cost Optimization")
✓ primary_service: Serviço AWS principal da questão
✓ related_services: Array de serviços relacionados (2-4)
✓ tags: Array de 3-5 tags (deve incluir official_domain, primary_service, e conceitos)
✓ difficulty: 30% easy, 50% medium, 20% hard
✓ tier: 60% FREE, 40% PRO
✓ Respostas SEMPRE em Português (Brasil)

DISTRIBUIÇÃO de questões por domínio:
- SECURE: 30% (15 questões)
- RESILIENT: 26% (13 questões)
- PERFORMANCE: 24% (12 questões)
- COST: 20% (10 questões)

Gere as questões de forma variada, testando diferentes aspectos, não repita padrões.
```

---

## 📋 TAGS OFICIAIS CONSOLIDADAS

Use APENAS estas tags (não invente):

### Serviços principais
```
"IAM", "EC2", "S3", "RDS", "DynamoDB", "Lambda", "VPC", "ALB", "NLB",
"CLB", "Route 53", "CloudFront", "ElastiCache", "SQS", "SNS", "KMS",
"Secrets Manager", "CloudTrail", "WAF", "Shield", "Direct Connect",
"VPN", "Auto Scaling", "Elasticache", "DAX", "Kinesis", "CloudWatch"
```

### Conceitos principais
```
"High Availability", "Disaster Recovery", "Scalability", "Performance",
"Security", "Encryption", "Multi-AZ", "Failover", "Caching", "CDN",
"Load Balancing", "Auto Scaling", "Cost Optimization", "Data Transfer",
"Monitoring", "Logging", "Compliance", "Access Control", "Networking"
```

### Domínios (OBRIGATÓRIO incluir um)
```
"SECURE", "RESILIENT", "PERFORMANCE", "COST"
```

---

## ✅ EXEMPLO COMPLETO COM NOVO FORMATO

```json
{
  "id": "saa-resilient-023",
  "question": "Uma aplicação de e-commerce precisa garantir que continue operacional mesmo com falha de uma Zona de Disponibilidade inteira. A aplicação usa RDS MySQL com heavy write operations. Qual arquitetura atende melhor?",
  "domain_analysis": "RESILIENT - Esta questão testa conhecimento de Multi-AZ deployments e failover automático, representando 26% da prova SAA-C03",
  "options": {
    "A": "RDS Multi-AZ com instâncias em 2 AZs, ALB em front, Auto Scaling com mínimo 2 instances",
    "B": "RDS Single-AZ com backups manuais, EC2 em 1 AZ com EBS local storage",
    "C": "DynamoDB cross-region replication com Lambda em 1 AZ",
    "D": "RDS Read Replica em segunda AZ com manual failover"
  },
  "correct": "A",
  "explanation_basic": "RDS Multi-AZ faz failover automático, ALB distribui tráfego, Auto Scaling mantém capacidade - resiste a falha de AZ inteira.",
  "explanation_detailed": "RDS Multi-AZ (Opção A) mantém uma réplica síncrona em outra AZ. Se a AZ primária falha, o failover é automático (~1-2 min) sem intervenção manual. ALB com target groups em múltiplas AZs distribui conexões. Auto Scaling detecta instâncias unhealthy e lança novas. Isso garante 99.95% de uptime. Opção B falha em 1 AZ. Opção C usa DynamoDB (não MySQL) e Lambda (não ideal para heavy writes). Opção D requer failover manual - não automático.",
  "incorrect_explanations": {
    "A": "Esta é a resposta correta",
    "B": "Single-AZ RDS não sobrevive a falha de AZ; backups manuais causam data loss",
    "C": "Questão pede MySQL (RDS), não DynamoDB; failover não é automático com Lambda",
    "D": "Read Replica em outra AZ não faz failover automático - requer ação manual"
  },
  "primary_service": "RDS",
  "related_services": ["ALB", "Auto Scaling", "CloudWatch"],
  "tags": ["RESILIENT", "RDS", "Multi-AZ", "High Availability", "Failover", "Auto Scaling"],
  "difficulty": "medium",
  "tier": "FREE",
  "official_domain": "RESILIENT",
  "topic": "Multi-AZ RDS Deployment with Automatic Failover"
}
```

---

## 🚀 CHECKLIST FINAL (ANTES DE IMPORTAR)

- [ ] Cada questão tem `official_domain` correto? (SECURE, RESILIENT, PERFORMANCE, COST)
- [ ] Cada questão tem `topic` descritivo?
- [ ] Tags incluem pelo menos 1 serviço AWS + 1 domínio?
- [ ] Primary service é um serviço AWS real?
- [ ] Distribuição de domínios: 30% SECURE, 26% RESILIENT, 24% PERFORMANCE, 20% COST?
- [ ] Explicações referem-se ao serviço e trade-offs?
- [ ] Nenhuma questão é muito parecida com outra?
- [ ] IDs são únicos e sequenciais?
- [ ] Tudo em Português (Brasil)?

---

**Agora a IA vai gerar questões muito mais alinhadas com a prova oficial!** 🎯
