// Serviço para gerar sugestões personalizadas baseadas no progresso do usuário

import type { UserProgress, SuggestedTopic } from '../contexts/AuthContext';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callOpenAI(messages: ChatMessage[], temperature: number = 0.7): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('API Key da OpenAI não configurada');
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erro ao chamar API da OpenAI');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Erro ao chamar OpenAI:', error);
    throw error;
  }
}

export async function generatePersonalizedSuggestions(progress: UserProgress): Promise<SuggestedTopic[]> {
  // Calcular estatísticas por especialidade
  const specialtyStats = Object.entries(progress.specialties).map(([name, stats]) => ({
    name,
    total: stats.total,
    correct: stats.correct,
    accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
    lastStudied: stats.lastStudied || 'nunca',
  }));

  const prompt = `Como especialista em educação médica, analise o desempenho do estudante e sugira 3-5 tópicos para estudar.

ESTATÍSTICAS DO ESTUDANTE:
- Total de questões: ${progress.totalQuestions}
- Taxa de acerto geral: ${progress.totalQuestions > 0 ? ((progress.correctAnswers / progress.totalQuestions) * 100).toFixed(1) : 0}%
- Especialidades estudadas: ${specialtyStats.length}
- Streak: ${progress.streakDays} dias

DESEMPENHO POR ESPECIALIDADE:
${specialtyStats.map(s => `- ${s.name}: ${s.total} questões, ${s.accuracy.toFixed(1)}% de acerto, última vez: ${s.lastStudied}`).join('\n')}

ESPECIALIDADES FAVORITAS: ${progress.preferences.favoriteSpecialties.join(', ') || 'Nenhuma definida'}
METAS: ${progress.goals.dailyQuestions} questões/dia, foco em ${progress.goals.targetLevel}

Com base nesses dados, sugira tópicos que o estudante deveria focar, considerando:
1. Especialidades com menor desempenho (precisam de reforço)
2. Especialidades não estudadas ainda (expandir conhecimento)
3. Especialidades favoritas (manter engajamento)
4. Equilíbrio entre revisão e novos conteúdos

Responda APENAS no formato JSON:
[
  {
    "specialty": "nome da especialidade",
    "reason": "razão clara e motivadora para estudar este tópico",
    "priority": "high|medium|low",
    "accuracy": 0
  }
]`;

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'Você é um mentor de estudos médicos que cria planos personalizados. Sempre responda apenas com JSON válido.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  try {
    const response = await callOpenAI(messages, 0.8);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      throw new Error('Resposta não contém JSON válido');
    }
    
    const suggestions: SuggestedTopic[] = JSON.parse(jsonMatch[0]);
    return suggestions;
  } catch (error) {
    console.error('Erro ao gerar sugestões:', error);
    
    // Fallback: sugestões baseadas em regras simples
    const fallbackSuggestions: SuggestedTopic[] = [];
    
    // Sugerir especialidades com baixo desempenho
    const weakSpecialties = specialtyStats
      .filter(s => s.total >= 3 && s.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 2);
    
    weakSpecialties.forEach(s => {
      fallbackSuggestions.push({
        specialty: s.name,
        reason: `Reforçar conhecimento - sua taxa de acerto é ${s.accuracy.toFixed(0)}%`,
        priority: 'high',
        accuracy: s.accuracy,
      });
    });
    
    // Sugerir especialidades favoritas não estudadas recentemente
    const favoriteNotRecent = progress.preferences.favoriteSpecialties
      .filter(fav => !specialtyStats.some(s => s.name === fav))
      .slice(0, 2);
    
    favoriteNotRecent.forEach(specialty => {
      fallbackSuggestions.push({
        specialty,
        reason: 'Continue explorando suas especialidades favoritas',
        priority: 'medium',
        accuracy: 0,
      });
    });
    
    // Se ainda não tiver sugestões suficientes, sugerir especialidades populares
    if (fallbackSuggestions.length < 3) {
      const popularSpecialties = [
        'Cardiologia',
        'Clínica Médica',
        'Pediatria',
        'Cirurgia Geral',
        'Neurologia',
      ];
      
      const unStudied = popularSpecialties
        .filter(p => !specialtyStats.some(s => s.name === p))
        .slice(0, 3 - fallbackSuggestions.length);
      
      unStudied.forEach(specialty => {
        fallbackSuggestions.push({
          specialty,
          reason: 'Expandir conhecimento em especialidade essencial',
          priority: 'medium',
          accuracy: 0,
        });
      });
    }
    
    return fallbackSuggestions;
  }
}

export function calculateDailyGoalProgress(progress: UserProgress): {
  current: number;
  target: number;
  percentage: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayQuestions = progress.questionHistory?.filter(q => {
    const qDate = new Date(q.timestamp);
    qDate.setHours(0, 0, 0, 0);
    return qDate.getTime() === today.getTime();
  }).length || 0;
  
  const dailyTarget = progress.goals?.dailyQuestions || 10;
  
  return {
    current: todayQuestions,
    target: dailyTarget,
    percentage: Math.min(100, (todayQuestions / dailyTarget) * 100),
  };
}

export function calculateWeeklyGoalProgress(progress: UserProgress): {
  current: number;
  target: number;
  percentage: number;
} {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weekQuestions = progress.questionHistory?.filter(q => 
    new Date(q.timestamp) >= weekAgo
  ).length || 0;
  
  const weeklyTarget = progress.goals?.weeklyQuestions || 50;
  
  return {
    current: weekQuestions,
    target: weeklyTarget,
    percentage: Math.min(100, (weekQuestions / weeklyTarget) * 100),
  };
}
