// Serviço de integração com OpenAI
// Configure a variável de ambiente VITE_OPENAI_API_KEY no arquivo .env

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callOpenAI(messages: ChatMessage[], temperature: number = 0.7): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('API Key da OpenAI não configurada. Configure VITE_OPENAI_API_KEY no arquivo .env');
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
        max_tokens: 2000,
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

export interface ObjectiveQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export async function generateObjectiveQuestion(
  specialty: string,
  difficulty: string
): Promise<ObjectiveQuestion> {
  const difficultyMap: Record<string, string> = {
    easy: 'básico',
    medium: 'intermediário',
    hard: 'avançado',
  };

  const prompt = `Gere uma questão de múltipla escolha sobre ${specialty} de nível ${difficultyMap[difficulty] || 'intermediário'} para residência médica.

A questão deve:
- Ser baseada em um caso clínico realista
- Ter 5 alternativas
- Incluir dados clínicos relevantes
- Testar raciocínio clínico
- Ser no formato das principais bancas de residência médica brasileiras

Responda APENAS no formato JSON abaixo, sem nenhum texto adicional:
{
  "question": "texto da questão com caso clínico",
  "options": ["opção A", "opção B", "opção C", "opção D", "opção E"],
  "correctAnswer": 0,
  "explanation": "explicação detalhada da resposta correta e por que as outras estão incorretas"
}`;

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'Você é um especialista em educação médica e criação de questões para residência médica. Sempre responda apenas com JSON válido, sem texto adicional.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  const response = await callOpenAI(messages, 0.8);
  
  try {
    // Tentar extrair JSON da resposta
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Resposta não contém JSON válido');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error('Erro ao parsear resposta:', error);
    console.error('Resposta recebida:', response);
    throw new Error('Erro ao processar resposta da IA');
  }
}

export async function generateDissertativeQuestion(
  specialty: string,
  difficulty: string
): Promise<string> {
  const difficultyMap: Record<string, string> = {
    easy: 'básico, focado em conceitos fundamentais',
    medium: 'intermediário, com aplicação prática',
    hard: 'avançado, com caso complexo e múltiplas variáveis',
  };

  const prompt = `Gere uma questão dissertativa sobre ${specialty} de nível ${difficultyMap[difficulty] || 'intermediário'}.

A questão deve:
- Apresentar um caso clínico detalhado
- Incluir dados de história, exame físico e exames complementares relevantes
- Solicitar ao candidato que discorra sobre diagnóstico, diagnósticos diferenciais e conduta
- Ser adequada para prova de residência médica
- Ter complexidade apropriada ao nível solicitado

Forneça apenas o enunciado da questão, sem a resposta.`;

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'Você é um especialista em educação médica e criação de questões dissertativas para residência médica.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  return await callOpenAI(messages, 0.9);
}

export interface DissertativeFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
}

export async function correctDissertativeAnswer(
  question: string,
  answer: string,
  specialty: string
): Promise<DissertativeFeedback> {
  const prompt = `Como um professor experiente de medicina, corrija a seguinte resposta dissertativa.

QUESTÃO:
${question}

RESPOSTA DO ALUNO:
${answer}

Avalie a resposta considerando:
1. Correção dos conceitos médicos
2. Completude da resposta
3. Organização e clareza
4. Aplicação prática do conhecimento
5. Adequação à especialidade de ${specialty}

Forneça a avaliação APENAS no formato JSON abaixo, sem texto adicional:
{
  "score": 85,
  "strengths": ["ponto forte 1", "ponto forte 2", "ponto forte 3"],
  "improvements": ["ponto de melhoria 1", "ponto de melhoria 2"],
  "detailedFeedback": "feedback detalhado sobre a resposta, incluindo sugestões de melhoria e conceitos que podem ser aprofundados"
}`;

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'Você é um professor experiente de medicina especializado em avaliar respostas dissertativas. Sempre responda apenas com JSON válido, sem texto adicional.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  const response = await callOpenAI(messages, 0.7);
  
  try {
    // Tentar extrair JSON da resposta
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Resposta não contém JSON válido');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error('Erro ao parsear resposta:', error);
    console.error('Resposta recebida:', response);
    throw new Error('Erro ao processar resposta da IA');
  }
}
