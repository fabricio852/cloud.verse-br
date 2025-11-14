
import { Domain, Question } from './types';

export const BRAND = { name: "CLOUD.VERSE", initials: "CV" };

export const R = { sm:"rounded-md", md:"rounded-lg", lg:"rounded-xl", xl:"rounded-2xl" };

export const DOMAIN_LABELS: Record<string, string> = {
    // SAA-C03
    SECURE: 'Secure Architecture',
    RESILIENT: 'Resilient Architecture',
    PERFORMANCE: 'High-Performance Architecture',
    COST: 'Cost-Optimized Architecture',

    // CLF-C02
    CLOUD_CONCEPTS: 'Cloud Concepts',
    CLOUD_TECHNOLOGY_SERVICES: 'Cloud Technology and Services',
    SECURITY_COMPLIANCE: 'Security and Compliance',
    TECHNOLOGY: 'Technology',
    BILLING_PRICING: 'Billing and Pricing',

    // AIF-C01
    RESPONSIBLE_AI: 'Responsible AI',
    AI_SERVICES: 'AI Services',
    AI_FUNDAMENTALS: 'AI Fundamentals',
    ML_DEVELOPMENT: 'ML Development'
};

export const DOMAIN_WEIGHTS: { [key in Domain]: number } = {
    // SAA-C03
    SECURE: 0.30,
    RESILIENT: 0.26,
    PERFORMANCE: 0.24,
    COST: 0.20,

    // CLF-C02
    CLOUD_CONCEPTS: 0.24,
    CLOUD_TECHNOLOGY_SERVICES: 0.34,
    SECURITY_COMPLIANCE: 0.30,
    TECHNOLOGY: 0.34,
    BILLING_PRICING: 0.12,

    // AIF-C01
    RESPONSIBLE_AI: 0.24,
    AI_SERVICES: 0.30,
    AI_FUNDAMENTALS: 0.24,
    ML_DEVELOPMENT: 0.22
};

export const DONUT_COLORS: { [key in Domain]: string } = {
    // SAA-C03
    SECURE: '#22c55e',
    RESILIENT: '#3b82f6',
    PERFORMANCE: '#ef4444',
    COST: '#f59e0b',

    // CLF-C02
    CLOUD_CONCEPTS: '#8b5cf6',
    CLOUD_TECHNOLOGY_SERVICES: '#06b6d4',
    SECURITY_COMPLIANCE: '#ec4899',
    TECHNOLOGY: '#06b6d4',
    BILLING_PRICING: '#84cc16',

    // AIF-C01
    RESPONSIBLE_AI: '#f97316',
    AI_SERVICES: '#14b8a6',
    AI_FUNDAMENTALS: '#6366f1',
    ML_DEVELOPMENT: '#a855f7'
};

export const AWS_DOCS: { [key: string]: string } = {
    'IAM Roles': 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html',
    'STS-AssumeRole': 'https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html',
    'ALB': 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html',
    'SQS': 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html',
    'RDS Multi‑AZ': 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html',
    'DAX': 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.html',
    'S3 Lifecycle': 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html',
    'S3 Glacier Flexible Retrieval': 'https://docs.aws.amazon.com/amazonglacier/latest/dev/introduction.html'
};

export const Q_BANK: Question[] = [
 { id:"sample-secure", domain:Domain.SECURE, stem:"Uma aplicação em múltiplas contas precisa de acesso somente leitura a objetos do Amazon S3. Qual abordagem minimiza permissões e facilita auditoria centralizada?", options:{ A:"Compartilhar a mesma chave de acesso longo prazo entre todas as contas", B:"Criar usuários IAM locais nas contas e anexar políticas inline", C:"Assumir uma role IAM compartilhada via AWS Organizations com política de somente leitura", D:"Usar credenciais estáticas guardadas em parâmetros do SSM por aplicação" }, answerKey:["C"], requiredSelections:1, explanation_basic:"Use role compartilhada e STS para acesso temporário e menor superfície de risco.", explanation_detailed:`Roles entre contas via STS reduzem credenciais estáticas. [[SERVICE:IAM Roles]] + [[TOPIC:STS-AssumeRole]] habilitam <b>acesso temporário</b> e auditoria centralizada.`, incorrect: { A: "Chaves de longo prazo compartilhadas entre contas aumentam risco e dificultam auditoria/rotação.", B: "Usuários locais e políticas inline geram espalhamento e manutenção difícil; não resolvem acesso entre contas.", C: "—", D: "Credenciais estáticas guardadas no SSM continuam de longo prazo e ampliam a superfície de ataque." } },
 { id:"sample-resilient", domain:Domain.RESILIENT, stem:"Um sistema de pedidos deve continuar operando mesmo com a queda de uma Zona de Disponibilidade. Qual desenho aumenta a resiliência?", options:{ A:"RDS Single‑AZ e todas as instâncias em uma única AZ", B:"Instâncias em duas AZs atrás de um ALB, fila SQS para desacoplamento e RDS Multi‑AZ", C:"ECS em uma AZ com volumes EBS e backups manuais", D:"Monólito atrás de um Classic Load Balancer em uma única AZ" }, answerKey:["B"], requiredSelections:1, explanation_basic:"Multi‑AZ + ALB + SQS remove ponto único e sustenta falha de AZ.", explanation_detailed:`Distribuir camadas em <b>múltiplas AZs</b> com [[SERVICE:ALB]] e fila [[SERVICE:SQS]] desacopla produtores/consumidores. [[TOPIC:RDS Multi‑AZ]] provê failover gerenciado.`, incorrect: { A: "Single‑AZ cria ponto único; queda da AZ derruba a aplicação.", B: "—", C: "Uma única AZ e backups manuais não oferecem failover automático.", D: "CLB em uma AZ não é alta disponibilidade e mantém ponto único." } },
 { id:"sample-performance", domain:Domain.PERFORMANCE, stem:"Uma aplicação com leituras intensas no DynamoDB enfrenta alta latência. Qual solução melhora desempenho sem alterar o modelo de dados?", options:{ A:"Aumentar RCU indefinidamente", B:"Ativar Amazon DAX para cache de leitura em microssegundos", C:"Migrar os dados para o Amazon S3", D:"Trocar para Amazon RDS MySQL" }, answerKey:["B"], requiredSelections:1, explanation_basic:"DAX provê cache de leitura para DynamoDB com latências muito baixas.", explanation_detailed:`[[SERVICE:DAX]] acrescenta cache compatível com API do DynamoDB, reduzindo latência de leituras quentes sem alterar código de acesso.`, incorrect: { A: "Aumentar RCU aumenta throughput, mas não entrega cache de microssegundos e encarece.", B: "—", C: "S3 não é banco de dados transacional de baixa latência para leituras frequentes.", D: "Migrar para RDS muda o modelo e não resolve o gargalo de leitura quente." } },
 { id:"sample-cost", domain:Domain.COST, stem:"Arquivos raramente acessados após 6 meses estão no Amazon S3. É necessário reduzir custo mantendo recuperação em horas. O que fazer?", options:{ A:"Manter no S3 Standard", B:"Habilitar Intelligent‑Tiering sem regras", C:"Aplicar lifecycle para S3 Glacier Flexible Retrieval após 90 dias", D:"Replicar para outra região com CRR" }, answerKey:["C"], requiredSelections:1, explanation_basic:"Lifecycle para classe de armazenamento de menor custo com recuperação em horas.", explanation_detailed:`[[TOPIC:S3 Lifecycle]] movendo para [[SERVICE:S3 Glacier Flexible Retrieval]] reduz custo de dados frios mantendo <i>retrieval</i> em horas. CRR (D) não reduz custo de armazenamento.`, incorrect: { A: "S3 Standard é mais caro para dados frios.", B: "Sem camadas de archive configuradas pode não atingir o menor custo; lifecycle direto para Glacier FR atende o requisito.", C: "—", D: "Replicação aumenta custo; não é mecanismo de otimização de armazenamento." } }
];

export const FLASHCARD_BANK_INITIAL = [
    { id: 'fc1', front: 'What is Amazon S3?', back: 'An object storage service that offers industry-leading scalability, data availability, security, and performance.' },
    { id: 'fc2', front: 'What is an EC2 Instance?', back: 'A virtual server in the AWS cloud. It stands for Elastic Compute Cloud. It allows you to obtain and configure computing capacity with agility.' },
    { id: 'fc3', front: 'What is the purpose of IAM?', back: 'AWS Identity and Access Management (IAM) is a service that helps you control access to AWS resources securely.' },
    { id: 'fc4', front: 'What is a VPC?', back: 'Amazon Virtual Private Cloud (VPC) allows you to provision a logically isolated section of the AWS Cloud where you can run AWS resources in a virtual network that you define.' },
    { id: 'fc5', front: 'What is Route 53 for?', back: 'It is a highly available and scalable Domain Name System (DNS) web service in the cloud.' },
    { id: 'fc6', front: 'What is AWS Lambda?', back: 'A serverless computing service that executes your code in response to events.' },
    { id: 'fc7', front: 'Difference between RDS and DynamoDB?', back: 'RDS is a relational database service (SQL), while DynamoDB is a NoSQL database service (key-value and document-based).' },
    { id: 'fc8', front: 'What is an Application Load Balancer (ALB)?', back: 'Operates at layer 7 (application) and distributes incoming application traffic based on rules. Ideal for HTTP and HTTPS traffic.' },
    { id: 'fc9', front: 'What is Amazon SQS?', back: 'Simple Queue Service. A message queuing service that allows you to decouple and scale microservices and distributed systems.' },
    { id: 'fc10', front: 'What is CloudFormation?', back: 'A service that helps you model and configure your AWS resources using Infrastructure as Code (IaC).' },
];
