const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

// Níveis de dificuldade traduzidos
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

const difficultyDescriptions = {
  easy: 'Fácil - Questões básicas com conceitos fundamentais',
  medium: 'Média - Questões intermediárias com aplicação prática',
  hard: 'Difícil - Questões avançadas com casos complexos e raciocínio clínico aprofundado'
};

async function callGemini(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Erro ao chamar Gemini API:', error);
    throw error;
  }
}

// Extrair JSON da resposta (mesmo método usado com OpenAI)
function extractJSON(text: string): Record<string, unknown> {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return JSON.parse(text);
}

export async function generateObjectiveQuestion(
  specialty: string, 
  difficulty: DifficultyLevel = 'medium'
): Promise<{
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}> {
  const difficultyDesc = difficultyDescriptions[difficulty];
  
  const prompt = `Você é um professor de medicina especialista em criar questões para residência médica.

Crie UMA questão objetiva de múltipla escolha sobre ${specialty}.

Nível de dificuldade: ${difficultyDesc}

Instruções específicas por nível:
- FÁCIL: Use conceitos básicos e diretos, perguntas sobre definições e características principais
- MÉDIA: Inclua aplicação clínica simples, sinais/sintomas típicos, diagnósticos comuns
- DIFÍCIL: Crie casos clínicos complexos, diagnósticos diferenciais, decisões terapêuticas avançadas

A questão DEVE ser:
- Clinicamente relevante e realista
- Com 5 alternativas (A, B, C, D, E)
- Apenas UMA alternativa correta
- Com explicação detalhada da resposta

Retorne APENAS um JSON válido neste formato exato:
{
  "question": "texto da questão aqui",
  "options": ["A) opção 1", "B) opção 2", "C) opção 3", "D) opção 4", "E) opção 5"],
  "correctAnswer": 0,
  "explanation": "explicação detalhada aqui"
}

O campo correctAnswer deve ser o índice (0-4) da resposta correta.`;

  try {
    const response = await callGemini(prompt);
    const data = extractJSON(response) as {
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    };
    
    return {
      question: data.question,
      options: data.options,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
    };
  } catch (error) {
    console.error('Erro ao gerar questão objetiva:', error);
    throw new Error('Não foi possível gerar a questão. Tente novamente.');
  }
}

export async function generateDissertativeQuestion(
  specialty: string,
  difficulty: DifficultyLevel = 'medium'
): Promise<{
  question: string;
  expectedTopics: string[];
  maxScore: number;
}> {
  const difficultyDesc = difficultyDescriptions[difficulty];
  
  const prompt = `Você é um professor de medicina especialista em criar questões dissertativas.

Crie UMA questão dissertativa sobre ${specialty}.

Nível de dificuldade: ${difficultyDesc}

Instruções específicas por nível:
- FÁCIL: Perguntas sobre conceitos básicos, definições, características principais
- MÉDIA: Casos clínicos simples, plano diagnóstico/terapêutico básico
- DIFÍCIL: Casos complexos, diagnósticos diferenciais extensos, justificativas clínicas aprofundadas

A questão DEVE:
- Ser clara e objetiva
- Ter pontuação de 0 a 10
- Listar os tópicos esperados na resposta

Retorne APENAS um JSON válido neste formato:
{
  "question": "texto da questão dissertativa aqui",
  "expectedTopics": ["tópico 1", "tópico 2", "tópico 3"],
  "maxScore": 10
}`;

  try {
    const response = await callGemini(prompt);
    const data = extractJSON(response) as {
      question: string;
      expectedTopics: string[];
      maxScore: number;
    };
    
    return {
      question: data.question,
      expectedTopics: data.expectedTopics,
      maxScore: data.maxScore,
    };
  } catch (error) {
    console.error('Erro ao gerar questão dissertativa:', error);
    throw new Error('Não foi possível gerar a questão. Tente novamente.');
  }
}

export async function correctDissertativeAnswer(
  question: string,
  answer: string,
  expectedTopics: string[]
): Promise<{
  score: number;
  feedback: string;
  topicsCovered: string[];
  topicsMissing: string[];
  suggestions: string[];
}> {
  const prompt = `Você é um professor de medicina avaliando uma resposta dissertativa.

QUESTÃO: ${question}

TÓPICOS ESPERADOS:
${expectedTopics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

RESPOSTA DO ALUNO:
${answer}

Avalie a resposta e retorne APENAS um JSON válido com:
- score (0-10)
- feedback (comentário geral sobre a resposta)
- topicsCovered (array com tópicos que foram abordados)
- topicsMissing (array com tópicos que faltaram)
- suggestions (array com sugestões de melhoria)

Formato exato:
{
  "score": 7.5,
  "feedback": "texto do feedback aqui",
  "topicsCovered": ["tópico 1", "tópico 2"],
  "topicsMissing": ["tópico 3"],
  "suggestions": ["sugestão 1", "sugestão 2"]
}`;

  try {
    const response = await callGemini(prompt);
    const data = extractJSON(response) as {
      score: number;
      feedback: string;
      topicsCovered: string[];
      topicsMissing: string[];
      suggestions: string[];
    };
    
    return {
      score: data.score,
      feedback: data.feedback,
      topicsCovered: data.topicsCovered,
      topicsMissing: data.topicsMissing,
      suggestions: data.suggestions,
    };
  } catch (error) {
    console.error('Erro ao corrigir resposta:', error);
    throw new Error('Não foi possível avaliar a resposta. Tente novamente.');
  }
}

// Gerar plano de estudos personalizado
export async function generateStudyPlan(
  weakSpecialties: string[],
  strongSpecialties: string[],
  totalQuestions: number,
  goalLevel: string
): Promise<{
  weeklyPlan: Array<{
    day: string;
    specialty: string;
    topics: string[];
    duration: string;
    activities: string[];
  }>;
  recommendations: string[];
  focusAreas: string[];
}> {
  const prompt = `Você é um mentor de estudos médicos criando um plano personalizado.

PERFIL DO ALUNO:
- Questões respondidas: ${totalQuestions}
- Especialidades fracas: ${weakSpecialties.join(', ') || 'Nenhuma ainda'}
- Especialidades fortes: ${strongSpecialties.join(', ') || 'Nenhuma ainda'}
- Nível objetivo: ${goalLevel}

Crie um plano de estudos semanal (7 dias) focado em melhorar as especialidades fracas.

Retorne APENAS um JSON válido:
{
  "weeklyPlan": [
    {
      "day": "Segunda-feira",
      "specialty": "especialidade",
      "topics": ["tópico 1", "tópico 2"],
      "duration": "2 horas",
      "activities": ["atividade 1", "atividade 2"]
    }
  ],
  "recommendations": ["recomendação 1", "recomendação 2"],
  "focusAreas": ["área 1", "área 2"]
}`;

  try {
    const response = await callGemini(prompt);
    const data = extractJSON(response) as {
      weeklyPlan: Array<{
        day: string;
        specialty: string;
        topics: string[];
        duration: string;
        activities: string[];
      }>;
      recommendations: string[];
      focusAreas: string[];
    };
    return data;
  } catch (error) {
    console.error('Erro ao gerar plano de estudos:', error);
    throw new Error('Não foi possível gerar o plano. Tente novamente.');
  }
}

// Gerar resumo em áudio (texto para ser usado com Web Speech API)
export async function generateAudioScript(
  specialty: string,
  topics: string[]
): Promise<string> {
  const prompt = `Você é um professor criando um resumo em áudio sobre ${specialty}.

Tópicos a abordar:
${topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Crie um script para áudio de aproximadamente 3-5 minutos que:
- Seja didático e objetivo
- Use linguagem clara e pausada
- Inclua exemplos práticos
- Seja adequado para escuta em formato de podcast

Retorne apenas o texto do script, sem formatação JSON.`;

  try {
    const response = await callGemini(prompt);
    return response.trim();
  } catch (error) {
    console.error('Erro ao gerar script de áudio:', error);
    throw new Error('Não foi possível gerar o script. Tente novamente.');
  }
}

// Gerar roteiro para vídeo educativo
export async function generateVideoScript(
  specialty: string,
  topic: string,
  difficulty: DifficultyLevel = 'medium'
): Promise<{
  title: string;
  duration: string;
  introduction: string;
  mainContent: Array<{
    section: string;
    content: string;
    visualAids: string[];
  }>;
  conclusion: string;
  keyPoints: string[];
}> {
  const difficultyDesc = difficultyDescriptions[difficulty];
  
  const prompt = `Você é um roteirista de vídeos educativos médicos.

Crie um roteiro de vídeo sobre: ${topic} (${specialty})
Nível: ${difficultyDesc}

O roteiro deve ter:
- Introdução cativante
- Conteúdo dividido em seções
- Sugestões de recursos visuais
- Conclusão com pontos-chave
- Duração estimada

Retorne APENAS um JSON válido:
{
  "title": "título do vídeo",
  "duration": "10-15 minutos",
  "introduction": "texto da introdução",
  "mainContent": [
    {
      "section": "nome da seção",
      "content": "conteúdo explicativo",
      "visualAids": ["recurso visual 1", "recurso visual 2"]
    }
  ],
  "conclusion": "texto da conclusão",
  "keyPoints": ["ponto 1", "ponto 2", "ponto 3"]
}`;

  try {
    const response = await callGemini(prompt);
    const data = extractJSON(response) as {
      title: string;
      duration: string;
      introduction: string;
      mainContent: Array<{
        section: string;
        content: string;
        visualAids: string[];
      }>;
      conclusion: string;
      keyPoints: string[];
    };
    return data;
  } catch (error) {
    console.error('Erro ao gerar roteiro de vídeo:', error);
    throw new Error('Não foi possível gerar o roteiro. Tente novamente.');
  }
}
