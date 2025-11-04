# 🎯 ESTRATÉGIA FREEMIUM - AWS TRAINER 2.0

## 📊 MODELO DE NEGÓCIO

### ✅ FREE (Freemium)
**Objetivo:** Demonstrar valor → Converter para PRO

**Acesso:**
- ✅ Quiz Rápido: **10 questões/dia** (sempre as mesmas questões diárias)
- ✅ Quiz Completo: **10 questões/dia** (sempre as mesmas questões diárias)
- ✅ Quiz por Domínios: **10 questões/dia** (sempre as mesmas questões diárias)
- ✅ Revisão: **10 questões/dia** (sempre as mesmas questões diárias)

**Características:**
- Pool fixo de questões que muda a cada 24h
- Explicações **básicas** apenas
- Sem navegação livre (forward-only)
- Sem histórico completo
- **PAYWALL após 10 questões respondidas**

**Mensagem do Paywall:**
```
🎓 Parabéns! Você completou suas 10 questões diárias.

💎 Com o plano PRO você tem:
✅ Acesso ilimitado ao banco completo (249+ questões)
✅ Explicações detalhadas com links AWS Docs
✅ Navegação livre (voltar/revisar respostas)
✅ Histórico completo de tentativas
✅ Questões novas todos os dias
✅ Suporte prioritário

[Assinar PRO - R$ 29,90/mês] [Voltar ao Painel]
```

---

### 💎 PRO
**Objetivo:** Maximizar aprendizado e aprovação

**Acesso:**
- ✅ **Acesso ilimitado** ao banco completo
- ✅ Todos os tipos de quiz sem limites
- ✅ Questões aleatórias diferentes a cada tentativa
- ✅ Explicações **detalhadas** com links e aprofundamento
- ✅ Navegação livre (voltar/revisar)
- ✅ Histórico completo de tentativas
- ✅ Sistema de revisão inteligente (questões erradas)
- ✅ Flashcards com Spaced Repetition
- ✅ Estatísticas avançadas

---

## 🎨 SISTEMA DE CERTIFICAÇÕES

### Seleção na Tela Inicial

**Fluxo:**
1. Landing Page → Login
2. **Tela de Seleção de Certificação** (nova)
3. Painel com tema da certificação

**Certificações Disponíveis:**

#### 1️⃣ SAA-C03 - Solutions Architect Associate
- **Cor tema:** Roxo (`#9333ea` → `#6b21a8`)
- **Icon:** 🏗️
- **Gradiente:** `from-purple-600 to-purple-900`
- **Descrição:** "Projete arquiteturas resilientes, seguras e de alto desempenho"

#### 2️⃣ CLF-C01 - Cloud Practitioner
- **Cor tema:** Azul (`#2563eb` → `#1e40af`)
- **Icon:** ☁️
- **Gradiente:** `from-blue-600 to-blue-900`
- **Descrição:** "Fundamentos da nuvem AWS e principais serviços"

#### 3️⃣ AIF-C01 - AI Practitioner
- **Cor tema:** Vermelho escuro (`#dc2626` → `#991b1b`)
- **Icon:** 🤖
- **Gradiente:** `from-red-600 to-red-900`
- **Descrição:** "IA e Machine Learning na AWS"

---

## 🔒 CONTROLE DE ACESSO FREE

### 1. Contador de Questões Diárias

**Tabela `profiles`:**
```sql
daily_questions_answered: number  -- Contador de questões do dia
daily_questions_reset_at: timestamp  -- Última vez que resetou
daily_question_seed: string  -- Seed para gerar sempre as mesmas 10 questões
```

**Lógica:**
```typescript
// Ao responder uma questão
if (plano === 'FREE') {
  profile.daily_questions_answered++;

  if (profile.daily_questions_answered >= 10) {
    // Mostrar paywall
    showPaywall();
  }
}

// Reset diário (automático às 00:00)
if (profile.daily_questions_reset_at < hoje) {
  profile.daily_questions_answered = 0;
  profile.daily_question_seed = gerarNovaSeed();
  profile.daily_questions_reset_at = hoje;
}
```

### 2. Questões Fixas Diárias

**Como funciona:**
- FREE vê sempre as **mesmas 10 questões** durante 24h
- Seed baseado na data: `YYYYMMDD` + `userId`
- Usa algoritmo de shuffle determinístico

**Exemplo:**
```typescript
// Seed: "20251030-user123"
const seed = `${format(new Date(), 'yyyyMMdd')}-${userId}`;

// Gerar 10 questões fixas do pool FREE
const dailyQuestions = getQuestionsWithSeed(seed, certificationId, 10);
```

---

## 🎨 IMPLEMENTAÇÃO DO TEMA DINÂMICO

### 1. Store de Certificação

```typescript
// store/certificationStore.ts
export const useCertificationStore = create((set) => ({
  selectedCert: 'SAA-C03', // Padrão
  setCertification: (certId) => set({ selectedCert: certId }),

  getTheme: () => {
    const themes = {
      'SAA-C03': {
        primary: '#9333ea',
        secondary: '#6b21a8',
        gradient: 'from-purple-600 to-purple-900',
        icon: '🏗️',
        name: 'Solutions Architect Associate'
      },
      'CLF-C01': {
        primary: '#2563eb',
        secondary: '#1e40af',
        gradient: 'from-blue-600 to-blue-900',
        icon: '☁️',
        name: 'Cloud Practitioner'
      },
      'AIF-C01': {
        primary: '#dc2626',
        secondary: '#991b1b',
        gradient: 'from-red-600 to-red-900',
        icon: '🤖',
        name: 'AI Practitioner'
      }
    };
    return themes[selectedCert];
  }
}));
```

### 2. Aplicar Tema

```typescript
// Todos os cards, botões e backgrounds usam o tema
const { getTheme } = useCertificationStore();
const theme = getTheme();

<div className={`bg-gradient-to-br ${theme.gradient}`}>
  <h1 style={{ color: theme.primary }}>{theme.icon} {theme.name}</h1>
</div>
```

---

## 📱 TELAS A CRIAR/MODIFICAR

### ✅ Nova Tela: CertificationSelector
```
┌─────────────────────────────────────┐
│     Escolha sua Certificação        │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ 🏗️ SAA-C03                    │  │
│  │ Solutions Architect Associate │  │
│  │ [Gradient Roxo]               │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ ☁️ CLF-C01                     │  │
│  │ Cloud Practitioner            │  │
│  │ [Gradient Azul]               │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🤖 AIF-C01                     │  │
│  │ AI Practitioner               │  │
│  │ [Gradient Vermelho]           │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### ✅ Modificar: Painel
- Adicionar indicador de certificação selecionada (topo)
- Botão para trocar certificação
- Aplicar cores do tema em todos os cards
- Mostrar contador: "Questões hoje: X/10" (FREE)

### ✅ Modificar: QuizScreen
- Mostrar paywall após 10 questões (FREE)
- Bloquear navegação livre (FREE)
- Aplicar tema da certificação

### ✅ Nova: PaywallModal
- Mensagem persuasiva
- Benefícios do PRO
- Botão "Assinar PRO"
- Botão "Voltar ao Painel"

---

## 🚀 ORDEM DE IMPLEMENTAÇÃO

### Fase 1: Seleção de Certificação (1-2h)
1. ✅ Criar `CertificationSelectorScreen.tsx`
2. ✅ Criar `store/certificationStore.ts`
3. ✅ Adicionar rota no `App.tsx`
4. ✅ Criar componentes de card de certificação

### Fase 2: Sistema de Temas (1h)
1. ✅ Implementar hook `useTheme()`
2. ✅ Aplicar tema no Painel
3. ✅ Aplicar tema em todos os componentes

### Fase 3: Limites FREE (2-3h)
1. ✅ Adicionar campos no `profiles` (migration)
2. ✅ Criar sistema de seed diário
3. ✅ Implementar contador de questões
4. ✅ Criar lógica de reset diário

### Fase 4: Paywall (1h)
1. ✅ Criar `PaywallModal.tsx` melhorado
2. ✅ Integrar no QuizScreen
3. ✅ Adicionar analytics (opcional)

### Fase 5: Polimento (1h)
1. ✅ Indicadores visuais (contador FREE)
2. ✅ Animações de transição
3. ✅ Testes

---

## 💰 ESTRATÉGIA DE CONVERSÃO

### Gatilhos de Paywall:
1. **Após 10 questões diárias** → Paywall principal
2. **Ao tentar Quiz Completo (65q)** → "PRO para simulados completos"
3. **Ao tentar Revisão avançada** → "PRO para revisão inteligente"
4. **Ao ver explicação básica** → "PRO para explicações detalhadas"

### Mensagens Persuasivas:
- "Você está progredindo bem! 🎓"
- "Usuários PRO têm 3x mais aprovação"
- "Desbloqueie 239 questões adicionais"
- "Primeira semana: R$ 9,90"

---

## 📊 MÉTRICAS A ACOMPANHAR

- Taxa de conversão FREE → PRO
- Tempo médio até conversão
- Gatilho mais efetivo (qual paywall converte mais)
- Churn rate (cancelamentos)
- LTV (Lifetime Value)

---

## 🎯 RESULTADO ESPERADO

**Antes (Kofi):** ~5% contribuem voluntariamente
**Depois (Freemium):** Meta de 15-20% de conversão em 30 dias

**Valor:**
- FREE: Demonstra valor → Cria necessidade
- PRO: Remove fricção → Acelera aprendizado
