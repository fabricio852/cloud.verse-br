import { supabase } from './supabaseClient';

/**
 * Analisa a distribuição de questões no banco
 */
async function analyzeQuestions() {
  console.log('📊 ANÁLISE DAS QUESTÕES NO SUPABASE\n');

  try {
    // Buscar todas as questões
    const { data: questions, error } = await supabase
      .from('questions')
      .select('certification_id, domain, tier, difficulty')
      .eq('active', true);

    if (error) {
      console.error('❌ Erro:', error.message);
      return;
    }

    if (!questions || questions.length === 0) {
      console.log('⚠️  Nenhuma questão encontrada!');
      return;
    }

    console.log(`📚 Total de questões: ${questions.length}\n`);

    // Agrupar por certificação
    const byCert: Record<string, any> = {};
    questions.forEach(q => {
      if (!byCert[q.certification_id]) {
        byCert[q.certification_id] = {
          total: 0,
          byDomain: {},
          byTier: { FREE: 0, PRO: 0 },
          byDifficulty: { easy: 0, medium: 0, hard: 0 }
        };
      }

      byCert[q.certification_id].total++;

      // Por domínio
      if (!byCert[q.certification_id].byDomain[q.domain]) {
        byCert[q.certification_id].byDomain[q.domain] = 0;
      }
      byCert[q.certification_id].byDomain[q.domain]++;

      // Por tier
      byCert[q.certification_id].byTier[q.tier]++;

      // Por dificuldade
      byCert[q.certification_id].byDifficulty[q.difficulty]++;
    });

    // Exibir resultados
    Object.entries(byCert).forEach(([certId, stats]: [string, any]) => {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📋 CERTIFICAÇÃO: ${certId}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`\n📊 Total: ${stats.total} questões`);

      console.log(`\n🎯 Por Domínio:`);
      Object.entries(stats.byDomain).forEach(([domain, count]) => {
        const pct = ((count as number / stats.total) * 100).toFixed(1);
        console.log(`   ${domain}: ${count} (${pct}%)`);
      });

      console.log(`\n💎 Por Tier:`);
      console.log(`   FREE: ${stats.byTier.FREE}`);
      console.log(`   PRO: ${stats.byTier.PRO}`);

      console.log(`\n📈 Por Dificuldade:`);
      console.log(`   Easy: ${stats.byDifficulty.easy}`);
      console.log(`   Medium: ${stats.byDifficulty.medium}`);
      console.log(`   Hard: ${stats.byDifficulty.hard}`);
    });

    // Pesos ideais SAA-C03
    if (byCert['SAA-C03']) {
      console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🎯 ANÁLISE SAA-C03 vs PADRÃO AWS`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      const idealWeights = {
        SECURE: 30,
        RESILIENT: 26,
        PERFORMANCE: 24,
        COST: 20
      };

      const domains = byCert['SAA-C03'].byDomain;
      const total = byCert['SAA-C03'].total;

      console.log(`\nDomínio          | Atual  | Ideal  | Diferença`);
      console.log(`-----------------|--------|--------|----------`);

      Object.entries(idealWeights).forEach(([domain, idealPct]) => {
        const currentCount = domains[domain] || 0;
        const currentPct = ((currentCount / total) * 100).toFixed(1);
        const diff = (parseFloat(currentPct) - idealPct).toFixed(1);
        const diffIcon = parseFloat(diff) > 0 ? '▲' : parseFloat(diff) < 0 ? '▼' : '=';

        console.log(`${domain.padEnd(16)} | ${currentPct.padStart(5)}% | ${idealPct}% | ${diffIcon} ${Math.abs(parseFloat(diff))}%`);
      });
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Erro ao analisar questões:', error);
  }
}

analyzeQuestions()
  .then(() => {
    console.log('✅ Análise concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
