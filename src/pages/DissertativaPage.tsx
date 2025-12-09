import React, { useState } from 'react';
import { Send, Loader } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  generateDissertativeQuestion, 
  correctDissertativeAnswer,
  type DissertativeFeedback
} from '../services/openai';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

const DissertativaPage: React.FC = () => {
  const { progress, updateProgress } = useAuth();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<DissertativeFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [questionId] = useState(() => Date.now().toString());
  const [specialty] = useState('Cardiologia'); // Pode ser passado via props ou state
  const [difficulty] = useState<DifficultyLevel>('medium'); // Pode ser passado via props ou state
  const { addNotification } = useNotification();

  const generateQuestion = async () => {
    setLoading(true);
    try {
      const generatedQuestion = await generateDissertativeQuestion(specialty, difficulty);
      setQuestion(generatedQuestion);
      addNotification('Questão gerada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao gerar questão:', error);
      addNotification(
        error instanceof Error 
          ? error.message 
          : 'Erro ao gerar questão. Verifique se a API Key está configurada.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      addNotification('Por favor, escreva sua resposta', 'warning');
      return;
    }

    setLoading(true);
    try {
      const generatedFeedback = await correctDissertativeAnswer(question, answer, specialty);
      setFeedback(generatedFeedback);
      
      // Atualizar progresso
      const isCorrect = generatedFeedback.score >= 70; // Considerar correto se score >= 70%
      const newHistory = [
        ...(progress.questionHistory || []),
        {
          id: questionId,
          question,
          answer,
          correct: isCorrect,
          specialty,
          type: 'dissertativa' as const,
          timestamp: new Date().toISOString(),
          score: generatedFeedback.score,
        },
      ];
      
      updateProgress({
        totalQuestions: progress.totalQuestions + 1,
        correctAnswers: progress.correctAnswers + (isCorrect ? 1 : 0),
        questionHistory: newHistory,
      });
      
      addNotification('Resposta corrigida!', 'success');
    } catch (error) {
      console.error('Erro ao corrigir resposta:', error);
      addNotification(
        error instanceof Error 
          ? error.message 
          : 'Erro ao corrigir resposta. Verifique se a API Key está configurada.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Modo Dissertativo</h1>
          <p className="text-xl text-gray-600">
            Pratique com casos clínicos complexos e receba feedback detalhado da IA
          </p>
        </div>

        {!question ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="w-12 h-12 text-purple-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pronto para começar?</h2>
            <p className="text-gray-600 mb-8">
              Clique no botão abaixo para gerar uma questão dissertativa personalizada
            </p>
            <button onClick={generateQuestion} disabled={loading} className="btn-primary">
              {loading ? (
                <>
                  <Loader className="inline w-5 h-5 mr-2 animate-spin" />
                  Gerando questão...
                </>
              ) : (
                'Gerar Questão'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Question */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Questão</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{question}</p>
              </div>
            </div>

            {/* Answer Box */}
            {!feedback && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Sua Resposta</h3>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  placeholder="Digite sua resposta aqui..."
                />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500">{answer.length} caracteres</span>
                  <div className="space-x-4">
                    <button
                      onClick={() => {
                        setQuestion('');
                        setAnswer('');
                      }}
                      className="btn-secondary"
                    >
                      Nova Questão
                    </button>
                    <button onClick={submitAnswer} disabled={loading} className="btn-primary">
                      {loading ? (
                        <>
                          <Loader className="inline w-5 h-5 mr-2 animate-spin" />
                          Corrigindo...
                        </>
                      ) : (
                        'Enviar Resposta'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">Resultado da Correção</h3>
                    <div className="text-5xl font-bold">{feedback.score}%</div>
                  </div>
                  <p className="text-purple-100">Excelente trabalho! Continue assim.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Pontos Fortes</h3>
                  <ul className="space-y-2">
                    {feedback.strengths.map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          ✓
                        </span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Pontos de Melhoria</h3>
                  <ul className="space-y-2">
                    {feedback.improvements.map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          !
                        </span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Feedback Detalhado</h3>
                  <p className="text-gray-700 leading-relaxed">{feedback.detailedFeedback}</p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setQuestion('');
                      setAnswer('');
                      setFeedback(null);
                    }}
                    className="btn-primary"
                  >
                    Nova Questão
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DissertativaPage;
