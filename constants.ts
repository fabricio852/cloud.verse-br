
import { Domain, Question } from './types';

export const BRAND = { name: "Nuvem Mestra", initials: "NM" };

export const R = { sm:"rounded-md", md:"rounded-lg", lg:"rounded-xl", xl:"rounded-2xl" };

export const DOMAIN_LABELS: { [key in Domain]: string } = {
    SECURE: 'Arquitetura segura',
    RESILIENT: 'Arquitetura resiliente',
    PERFORMANCE: 'Arquitetura de alto desempenho',
    COST: 'Arquitetura com custo otimizado'
};

export const DOMAIN_WEIGHTS: { [key in Domain]: number } = {
    SECURE: 0.30,
    RESILIENT: 0.26,
    PERFORMANCE: 0.24,
    COST: 0.20
};

export const DONUT_COLORS: { [key in Domain]: string } = {
    SECURE: '#22c55e',
    RESILIENT: '#3b82f6',
    PERFORMANCE: '#ef4444',
    COST: '#f59e0b'
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
  { id:"sample-secure", domain:Domain.SECURE, stem:"Uma aplicação em múltiplas contas precisa de acesso somente leitura a objetos do Amazon S3. Qual abordagem minimiza permissões e facilita auditoria centralizada?", options:{ A:"Compartilhar a mesma chave de acesso longo prazo entre todas as contas", B:"Criar usuários IAM locais nas contas e anexar políticas inline", C:"Assumir uma role IAM compartilhada via AWS Organizations com política de somente leitura", D:"Usar credenciais estáticas guardadas em parâmetros do SSM por aplicação" }, answerKey:"C", explanation_basic:"Use role compartilhada e STS para acesso temporário e menor superfície de risco.", explanation_detailed:`Roles entre contas via STS reduzem credenciais estáticas. [[SERVICE:IAM Roles]] + [[TOPIC:STS-AssumeRole]] habilitam <b>acesso temporário</b> e auditoria centralizada.`, incorrect: { A: "Chaves de longo prazo compartilhadas entre contas aumentam risco e dificultam auditoria/rotação.", B: "Usuários locais e políticas inline geram espalhamento e manutenção difícil; não resolvem acesso entre contas.", C: "—", D: "Credenciais estáticas guardadas no SSM continuam de longo prazo e ampliam a superfície de ataque." } },
  { id:"sample-resilient", domain:Domain.RESILIENT, stem:"Um sistema de pedidos deve continuar operando mesmo com a queda de uma Zona de Disponibilidade. Qual desenho aumenta a resiliência?", options:{ A:"RDS Single‑AZ e todas as instâncias em uma única AZ", B:"Instâncias em duas AZs atrás de um ALB, fila SQS para desacoplamento e RDS Multi‑AZ", C:"ECS em uma AZ com volumes EBS e backups manuais", D:"Monólito atrás de um Classic Load Balancer em uma única AZ" }, answerKey:"B", explanation_basic:"Multi‑AZ + ALB + SQS remove ponto único e sustenta falha de AZ.", explanation_detailed:`Distribuir camadas em <b>múltiplas AZs</b> com [[SERVICE:ALB]] e fila [[SERVICE:SQS]] desacopla produtores/consumidores. [[TOPIC:RDS Multi‑AZ]] provê failover gerenciado.`, incorrect: { A: "Single‑AZ cria ponto único; queda da AZ derruba a aplicação.", B: "—", C: "Uma única AZ e backups manuais não oferecem failover automático.", D: "CLB em uma AZ não é alta disponibilidade e mantém ponto único." } },
  { id:"sample-performance", domain:Domain.PERFORMANCE, stem:"Uma aplicação com leituras intensas no DynamoDB enfrenta alta latência. Qual solução melhora desempenho sem alterar o modelo de dados?", options:{ A:"Aumentar RCU indefinidamente", B:"Ativar Amazon DAX para cache de leitura em microssegundos", C:"Migrar os dados para o Amazon S3", D:"Trocar para Amazon RDS MySQL" }, answerKey:"B", explanation_basic:"DAX provê cache de leitura para DynamoDB com latências muito baixas.", explanation_detailed:`[[SERVICE:DAX]] acrescenta cache compatível com API do DynamoDB, reduzindo latência de leituras quentes sem alterar código de acesso.`, incorrect: { A: "Aumentar RCU aumenta throughput, mas não entrega cache de microssegundos e encarece.", B: "—", C: "S3 não é banco de dados transacional de baixa latência para leituras frequentes.", D: "Migrar para RDS muda o modelo e não resolve o gargalo de leitura quente." } },
  { id:"sample-cost", domain:Domain.COST, stem:"Arquivos raramente acessados após 6 meses estão no Amazon S3. É necessário reduzir custo mantendo recuperação em horas. O que fazer?", options:{ A:"Manter no S3 Standard", B:"Habilitar Intelligent‑Tiering sem regras", C:"Aplicar lifecycle para S3 Glacier Flexible Retrieval após 90 dias", D:"Replicar para outra região com CRR" }, answerKey:"C", explanation_basic:"Lifecycle para classe de armazenamento de menor custo com recuperação em horas.", explanation_detailed:`[[TOPIC:S3 Lifecycle]] movendo para [[SERVICE:S3 Glacier Flexible Retrieval]] reduz custo de dados frios mantendo <i>retrieval</i> em horas. CRR (D) não reduz custo de armazenamento.`, incorrect: { A: "S3 Standard é mais caro para dados frios.", B: "Sem camadas de archive configuradas pode não atingir o menor custo; lifecycle direto para Glacier FR atende o requisito.", C: "—", D: "Replicação aumenta custo; não é mecanismo de otimização de armazenamento." } }
];

export const FLASHCARD_BANK_INITIAL = [
    { id: 'fc1', front: 'O que é Amazon S3?', back: 'Um serviço de armazenamento de objetos que oferece escalabilidade, disponibilidade de dados, segurança e performance líderes do setor.' },
    { id: 'fc2', front: 'O que é uma Instância EC2?', back: 'Um servidor virtual na nuvem da Amazon. É a sigla para Elastic Compute Cloud. Permite obter e configurar capacidade computacional com agilidade.' },
    { id: 'fc3', front: 'Qual a função do IAM?', back: 'AWS Identity and Access Management (IAM) é um serviço que ajuda a controlar o acesso aos recursos da AWS de forma segura.' },
    { id: 'fc4', front: 'O que é um VPC?', back: 'Amazon Virtual Private Cloud (VPC) permite provisionar uma seção da Nuvem AWS isolada logicamente, onde você pode executar recursos da AWS em uma rede virtual que você define.' },
    { id: 'fc5', front: 'Para que serve o Route 53?', back: 'É um serviço web de Domain Name System (DNS) na nuvem, altamente disponível e escalável.' },
    { id: 'fc6', front: 'O que é o AWS Lambda?', back: 'Um serviço de computação sem servidor (serverless) que executa seu código em resposta a eventos.' },
    { id: 'fc7', front: 'Diferença entre RDS e DynamoDB?', back: 'RDS é um serviço de banco de dados relacional (SQL), enquanto DynamoDB é um serviço de banco de dados NoSQL (chave-valor e de documentos).' },
    { id: 'fc8', front: 'O que é um Application Load Balancer (ALB)?', back: 'Atua na camada 7 (aplicação) e distribui o tráfego de entrada de aplicações com base em regras. Ideal para tráfego HTTP e HTTPS.' },
    { id: 'fc9', front: 'O que é o Amazon SQS?', back: 'Simple Queue Service. Um serviço de enfileiramento de mensagens que permite desacoplar e escalar microsserviços e sistemas distribuídos.' },
    { id: 'fc10', front: 'O que é CloudFormation?', back: 'Um serviço que ajuda a modelar e configurar seus recursos da AWS usando Infraestrutura como Código (IaC).' },
];
