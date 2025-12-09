import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { generateObjectiveQuestion, type ObjectiveQuestion } from '../services/openai';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

const ObjetivaPage: React.FC = () => {
  const location = useLocation();
  const { progress, updateProgress } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState<ObjectiveQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questionId] = useState(() => Date.now().toString());
  const [specialty, setSpecialty] = useState(
    location.state?.specialty || progress.preferences.favoriteSpecialties[0] || 'Cardiologia'
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    location.state?.difficulty || progress.preferences.preferredDifficulty || 'medium'
  );
  const [sessionQuestionsCount, setSessionQuestionsCount] = useState(0);
  const [sessionTarget] = useState(10); // Meta de 10 questões por sessão
  const { addNotification } = useNotification();

  // Inicializar ou continuar sessão
  useEffect(() => {
    const shouldResume = location.state?.resumeSession && progress.currentSession?.isActive;
    
    if (shouldResume) {
      setSessionQuestionsCount(progress.currentSession!.questionsCompleted);
      setSpecialty(progress.currentSession!.specialty);
      setDifficulty(progress.currentSession!.difficulty);
    } else {
      // Iniciar nova sessão
      updateProgress({
        currentSession: {
          id: Date.now().toString(),
          specialty,
          difficulty,
          mode: 'objetiva',
          questionsCompleted: 0,
          questionsTotal: sessionTarget,
          startedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          isActive: true,
        },
      });
    }
  }, []);

  const generateQuestion = async () => {
    setLoading(true);
    try {
      const question = await generateObjectiveQuestion(specialty, difficulty);
      setCurrentQuestion(question);
      setSelectedAnswer(null);
      setShowResult(false);
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

  const submitAnswer = () => {
    if (selectedAnswer === null) {
      addNotification('Selecione uma alternativa', 'warning');
      return;
    }
    
    setShowResult(true);
    const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;
    
    // Atualizar progresso
    if (currentQuestion) {
      const newSessionCount = sessionQuestionsCount + 1;
      setSessionQuestionsCount(newSessionCount);
      
      const newSpecialties = { ...progress.specialties };
      if (!newSpecialties[specialty]) {
        newSpecialties[specialty] = { total: 0, correct: 0 };
      }
      newSpecialties[specialty].total++;
      if (isCorrect) newSpecialties[specialty].correct++;
      newSpecialties[specialty].lastStudied = new Date().toISOString();
      
      const newHistory = [
        ...(progress.questionHistory || []),
        {
          id: questionId,
          question: currentQuestion.question,
          answer: currentQuestion.options[selectedAnswer],
          correct: isCorrect,
          specialty,
          type: 'objetiva' as const,
          timestamp: new Date().toISOString(),
          difficulty,
        },
      ];
      
      // Atualizar sessão atual
      const sessionComplete = newSessionCount >= sessionTarget;
      const updatedSession = progress.currentSession ? {
        ...progress.currentSession,
        questionsCompleted: newSessionCount,
        lastUpdated: new Date().toISOString(),
        isActive: !sessionComplete,
      } : null;
      
      updateProgress({
        totalQuestions: progress.totalQuestions + 1,
        correctAnswers: progress.correctAnswers + (isCorrect ? 1 : 0),
        questionHistory: newHistory,
        specialties: newSpecialties,
        currentSession: updatedSession,
        experience: progress.experience + (isCorrect ? 10 : 5),
      });
      
      if (sessionComplete) {
        addNotification('🎉 Sessão concluída! Parabéns!', 'success');
      }
    }
    
    if (isCorrect) {
      addNotification('Resposta correta!', 'success');
    } else {
      addNotification('Resposta incorreta. Veja a explicação.', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Modo Objetivo</h1>
          <p className="text-xl text-gray-600">
            Questões de múltipla escolha no formato das principais residências médicas
          </p>
          
          {/* Progresso da Sessão */}
          <div className="mt-6 bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Progresso da Sessão: {sessionQuestionsCount}/{sessionTarget}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round((sessionQuestionsCount / sessionTarget) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-orange-500 h-2.5 rounded-full transition-all"
                style={{ width: `${(sessionQuestionsCount / sessionTarget) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Especialidade: {specialty} | Dificuldade: {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Médio' : 'Difícil'}
            </p>
          </div>
        </div>

        {!currentQuestion ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pronto para começar?</h2>
            <p className="text-gray-600 mb-6">
              Escolha a especialidade e o nível de dificuldade
            </p>
            
            {/* Seletores */}
            <div className="max-w-md mx-auto space-y-4 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Especialidade
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Cardiologia">Cardiologia</option>
                  <option value="Pediatria">Pediatria</option>
                  <option value="Cirurgia Geral">Cirurgia Geral</option>
                  <option value="Clínica Médica">Clínica Médica</option>
                  <option value="Ginecologia e Obstetrícia">Ginecologia e Obstetrícia</option>
                  <option value="Neurologia">Neurologia</option>
                  <option value="Ortopedia">Ortopedia</option>
                  <option value="Dermatologia">Dermatologia</option>
                  <option value="Psiquiatria">Psiquiatria</option>
                  <option value="Infectologia">Infectologia</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nível de Dificuldade
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setDifficulty('easy')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      difficulty === 'easy'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold">⭐ Fácil</div>
                    <div className="text-xs mt-1">Básico</div>
                  </button>
                  <button
                    onClick={() => setDifficulty('medium')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      difficulty === 'medium'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold">⭐⭐ Médio</div>
                    <div className="text-xs mt-1">Prático</div>
                  </button>
                  <button
                    onClick={() => setDifficulty('hard')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      difficulty === 'hard'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold">⭐⭐⭐ Difícil</div>
                    <div className="text-xs mt-1">Avançado</div>
                  </button>
                </div>
              </div>
            </div>
            
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
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Questão</h3>
                <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm">
                  Múltipla Escolha
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">{currentQuestion.question}</p>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctAnswer;
                  const showCorrect = showResult && isCorrect;
                  const showWrong = showResult && isSelected && !isCorrect;

                  return (
                    <button
                      key={index}
                      onClick={() => !showResult && setSelectedAnswer(index)}
                      disabled={showResult}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        showCorrect
                          ? 'border-green-500 bg-green-50'
                          : showWrong
                          ? 'border-red-500 bg-red-50'
                          : isSelected
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              showCorrect
                                ? 'bg-green-500 text-white'
                                : showWrong
                                ? 'bg-red-500 text-white'
                                : isSelected
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="text-gray-800">{option}</span>
                        </div>
                        {showCorrect && <CheckCircle className="w-6 h-6 text-green-500" />}
                        {showWrong && <XCircle className="w-6 h-6 text-red-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              {!showResult && (
                <div className="flex justify-end space-x-4 mt-6">
                  <button onClick={generateQuestion} className="btn-secondary">
                    Nova Questão
                  </button>
                  <button onClick={submitAnswer} className="btn-primary">
                    Confirmar Resposta
                  </button>
                </div>
              )}
            </div>

            {/* Explanation */}
            {showResult && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Explicação</h3>
                <div
                  className={`p-4 rounded-lg mb-4 ${
                    selectedAnswer === currentQuestion.correctAnswer
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <p
                    className={`font-semibold ${
                      selectedAnswer === currentQuestion.correctAnswer ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {selectedAnswer === currentQuestion.correctAnswer
                      ? '✓ Resposta Correta!'
                      : '✗ Resposta Incorreta'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Alternativa correta:{' '}
                    <strong>{String.fromCharCode(65 + currentQuestion.correctAnswer)}</strong>
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed">{currentQuestion.explanation}</p>
                <div className="flex justify-center mt-6">
                  <button onClick={generateQuestion} className="btn-primary">
                    Próxima Questão
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

export default ObjetivaPage;
