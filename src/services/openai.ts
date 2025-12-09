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
  const difficultyInstructions: Record<string, string> = {
    easy: `nível BÁSICO:
- Foco em conceitos fundamentais e definições
- Casos clínicos simples e diretos
- Alternativas claras sem pegadinhas complexas
- Raciocínio linear sem múltiplas etapas`,
    
    medium: `nível INTERMEDIÁRIO:
- Aplicação clínica prática
- Casos com dados clínicos relevantes
- Exige integração de conhecimentos
- Diferenciação entre opções plausíveis`,
    
    hard: `nível DIFÍCIL (Estilo ENARE/USP/UNIFESP):
- Caso clínico COMPLEXO com múltiplas comorbidades
- Apresentação ATÍPICA da doença
- Dados CONFLITANTES que exigem análise crítica
- Integração de várias áreas do conhecimento
- Decisão terapêutica em situações de INCERTEZA
- Alternativas muito próximas (todas tecnicamente corretas, mas uma é MAIS adequada)
- Exige conhecimento PROFUNDO e atualizado
- Teste de RACIOCÍNIO CLÍNICO AVANÇADO, não apenas memorização
- Situações de URGÊNCIA/EMERGÊNCIA com decisões críticas
- Casos com desfechos inesperados ou complicações raras`
  };

  const prompt = `Gere uma questão de múltipla escolha sobre ${specialty} de ${difficultyInstructions[difficulty] || difficultyInstructions.medium}.

REQUISITOS ESSENCIAIS:
- Questão baseada em caso clínico realista e detalhado
- 5 alternativas (A, B, C, D, E)
- Para nível DIFÍCIL: TODAS as alternativas devem ser plausíveis, exigindo análise profunda
- Dados clínicos completos: história, exame físico, exames complementares
- Formato das principais bancas brasileiras (ENARE, USP, UNIFESP, SUS-SP)

${difficulty === 'hard' ? `
ATENÇÃO ESPECIAL PARA NÍVEL DIFÍCIL:
- O caso deve ser VERDADEIRAMENTE desafiador, não apenas "um pouco mais difícil"
- Incluir elementos que confundam mesmo residentes experientes
- Múltiplas hipóteses diagnósticas igualmente plausíveis no início
- Dados que apontam para diferentes direções
- A resposta correta deve exigir SÍNTESE de múltiplos conhecimentos
- Simule a PRESSÃO de uma decisão médica real em situação crítica
` : ''}

Responda APENAS no formato JSON abaixo, sem nenhum texto adicional:
{
  "question": "texto da questão com caso clínico completo e detalhado",
  "options": ["opção A", "opção B", "opção C", "opção D", "opção E"],
  "correctAnswer": 0,
  "explanation": "explicação detalhada e fundamentada da resposta correta, incluindo por que cada alternativa incorreta não é a melhor escolha neste cenário específico"
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
  const difficultyInstructions: Record<string, string> = {
    easy: `BÁSICO - focado em conceitos fundamentais:
- Caso clínico simples e direto
- Diagnóstico mais comum da especialidade
- Dados clínicos típicos e clássicos
- Conduta bem estabelecida em guidelines`,
    
    medium: `INTERMEDIÁRIO - aplicação prática:
- Caso com apresentação usual mas que exige raciocínio
- Necessidade de diagnósticos diferenciais
- Interpretação de exames complementares
- Escolha entre opções terapêuticas válidas`,
    
    hard: `DIFÍCIL - nível ENARE/grandes centros:
- Caso EXTREMAMENTE COMPLEXO e desafiador
- Paciente com MÚLTIPLAS comorbidades que interferem no manejo
- Apresentação ATÍPICA ou RARA da doença
- Dados CONFLITANTES ou INCOMPLETOS (como na vida real)
- Necessidade de PRIORIZAÇÃO em situação crítica
- Complicações INCOMUNS ou inesperadas
- Dilemas ÉTICOS ou decisões em zona de incerteza
- Integração de MÚLTIPLAS especialidades
- Conhecimento de evidências RECENTES e guidelines atualizados
- Simulação de plantão de emergência com recursos limitados`
  };

  const prompt = `Gere uma questão dissertativa sobre ${specialty} de nível ${difficultyInstructions[difficulty]}.

ESTRUTURA DA QUESTÃO:
1. Apresentação do caso clínico detalhado
2. História completa: queixa principal, HDA, antecedentes, medicações
3. Exame físico detalhado com sinais vitais
4. Resultados de exames complementares pertinentes
5. Perguntas específicas sobre:
   - Hipótese(s) diagnóstica(s) com justificativa
   - Diagnósticos diferenciais principais
   - Propedêutica complementar necessária
   - Conduta terapêutica detalhada e priorizada

${difficulty === 'hard' ? `
REQUISITOS ESPECIAIS PARA NÍVEL DIFÍCIL:
- O caso deve ser GENUINAMENTE desafiador (não apenas "mais difícil")
- Incluir elementos que gerem DÚVIDA mesmo em especialistas
- Simular PRESSÃO de decisão em tempo real
- Dados que possam levar a MAIS DE UM raciocínio válido
- Situação onde recursos são limitados e decisões têm ALTO IMPACTO
- Caso que você encontraria em um grande centro de referência
- Exemplo: paciente crítico com múltiplos problemas simultâneos, ou apresentação extremamente rara
` : ''}

Forneça APENAS o enunciado detalhado da questão, sem incluir a resposta ou gabarito.
A questão deve permitir que o aluno demonstre raciocínio clínico profundo, conhecimento atualizado e capacidade de tomar decisões em situações complexas.`;

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
  strengths: string;
  improvements: string;
  comment: string;
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
  "strengths": "descrição dos pontos fortes da resposta",
  "improvements": "descrição dos pontos que podem ser melhorados",
  "comment": "feedback detalhado sobre a resposta, incluindo sugestões de melhoria e conceitos que podem ser aprofundados"
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

export interface StudyMaterial {
  title: string;
  introduction: string;
  sections: Array<{
    title: string;
    content: string;
    keyPoints: string[];
  }>;
  summary: string;
  references: string[];
}

export async function generateStudyMaterial(
  specialty: string,
  topics: string[]
): Promise<StudyMaterial> {
  const topicsList = topics.join(', ');
  
  const prompt = `Como um professor de medicina experiente, crie um material de estudo completo e detalhado sobre ${specialty}, focando especialmente nos seguintes tópicos que o aluno precisa reforçar: ${topicsList}.

O material deve ser:
- Didático e bem estruturado
- Com explicações claras e exemplos clínicos
- Adequado para preparação para residência médica
- Completo mas objetivo
- Com pontos-chave destacados

Forneça APENAS um JSON válido neste formato:
{
  "title": "Título do material de estudo",
  "introduction": "Introdução contextualizando os tópicos",
  "sections": [
    {
      "title": "Título da seção 1",
      "content": "Conteúdo detalhado com 3-4 parágrafos explicativos, incluindo conceitos, fisiopatologia, manifestações clínicas, diagnóstico e tratamento quando aplicável",
      "keyPoints": [
        "Ponto-chave 1 resumido",
        "Ponto-chave 2 resumido",
        "Ponto-chave 3 resumido"
      ]
    }
  ],
  "summary": "Resumo final integrando todos os conceitos",
  "references": [
    "Referência bibliográfica 1",
    "Referência bibliográfica 2"
  ]
}

IMPORTANTE: Crie pelo menos 3-5 seções abrangendo os tópicos mencionados.`;

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'Você é um professor de medicina especialista em criar materiais didáticos para residência médica. Sempre responda apenas com JSON válido, sem texto adicional.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  const response = await callOpenAI(messages, 0.7);
  
  try {
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
