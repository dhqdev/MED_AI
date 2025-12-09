import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader, ArrowRight, ArrowLeft, Trophy, Target } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { generateObjectiveQuestion, type ObjectiveQuestion } from '../services/openai';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface QuestionResult {
  question: ObjectiveQuestion;
  selectedAnswer: number | null;
  isCorrect: boolean;
}

const ObjetivaPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { progress, updateProgress } = useAuth();
  const [questions, setQuestions] = useState<ObjectiveQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(10).fill(null));
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [specialty, setSpecialty] = useState(
    location.state?.specialty || progress.preferences.favoriteSpecialties[0] || 'Cardiologia'
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    location.state?.difficulty || progress.preferences.preferredDifficulty || 'medium'
  );
  const { addNotification } = useNotification();

  const totalQuestions = 10;
  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentIndex];

  // Gerar 10 questões
  const generateAllQuestions = async () => {
    setLoading(true);
    addNotification('Gerando 10 questões... Isso pode levar alguns segundos.', 'info');
    
    try {
      const generatedQuestions: ObjectiveQuestion[] = [];
      
      for (let i = 0; i < totalQuestions; i++) {
        const question = await generateObjectiveQuestion(specialty, difficulty);
        generatedQuestions.push(question);
        
        // Notificar progresso
        if ((i + 1) % 3 === 0) {
          addNotification(`${i + 1}/${totalQuestions} questões geradas...`, 'info');
        }
      }
      
      setQuestions(generatedQuestions);
      setAnswers(Array(totalQuestions).fill(null));
      setCurrentIndex(0);
      setShowResults(false);
      addNotification('✅ Todas as questões foram geradas! Boa sorte!', 'success');
    } catch (error) {
      console.error('Erro ao gerar questões:', error);
      addNotification(
        'Erro ao gerar questões. Verifique sua conexão e API Key.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (answerIndex: number) => {
    if (showResults) return;
    
    const newAnswers = [...answers];
    newAnswers[currentIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = () => {
    // Verificar se todas as questões foram respondidas
    const unanswered = answers.filter(a => a === null).length;
    
    if (unanswered > 0) {
      addNotification(
        `Você ainda tem ${unanswered} questão(ões) sem resposta. Deseja finalizar mesmo assim?`,
        'warning'
      );
      // Poderia adicionar um modal de confirmação aqui
    }
    
    setShowResults(true);
    calculateResults();
  };

  const calculateResults = () => {
    const results: QuestionResult[] = questions.map((q, idx) => ({
      question: q,
      selectedAnswer: answers[idx],
      isCorrect: answers[idx] !== null && answers[idx] === q.correctAnswer
    }));

    const correctCount = results.filter(r => r.isCorrect).length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Criar histórico de questões
    const newHistory = [
      ...(progress.questionHistory || []),
      ...questions.map((q, idx) => ({
        id: `obj-${Date.now()}-${idx}`,
        question: q.question,
        answer: q.options[answers[idx] || 0],
        correct: answers[idx] === q.correctAnswer,
        specialty: specialty,
        type: 'objetiva' as const,
        timestamp: new Date().toISOString(),
        difficulty: difficulty,
      }))
    ];

    // Atualizar progresso
    const newSpecialties = { ...progress.specialties };
    if (!newSpecialties[specialty]) {
      newSpecialties[specialty] = { total: 0, correct: 0 };
    }
    newSpecialties[specialty].total += totalQuestions;
    newSpecialties[specialty].correct += correctCount;
    newSpecialties[specialty].lastStudied = new Date().toISOString();

    updateProgress({
      totalQuestions: progress.totalQuestions + totalQuestions,
      correctAnswers: progress.correctAnswers + correctCount,
      specialties: newSpecialties,
      experience: progress.experience + (correctCount * 10) + 50, // Bônus por completar
      questionHistory: newHistory,
    });

    addNotification(
      `🎉 Prova concluída! Você acertou ${correctCount}/${totalQuestions} (${score}%)`,
      score >= 70 ? 'success' : score >= 50 ? 'warning' : 'error'
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Loader className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gerando suas questões...</h2>
            <p className="text-gray-600">
              Estamos criando 10 questões personalizadas para você. Aguarde um momento.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Tela inicial - Configuração
  if (questions.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Simulado - 10 Questões</h1>
            <p className="text-xl text-gray-600">
              Resolva 10 questões objetivas e receba seu desempenho completo no final
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-12 h-12 text-orange-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Configure seu simulado
            </h2>

            <div className="max-w-md mx-auto space-y-6 mb-8">
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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>📝 Formato:</strong> 10 questões de múltipla escolha<br />
                  <strong>⏱️ Duração:</strong> Sem limite de tempo<br />
                  <strong>🎯 Resultado:</strong> Disponível ao finalizar
                </p>
              </div>
            </div>

            <button
              onClick={generateAllQuestions}
              disabled={loading}
              className="btn-primary w-full max-w-md mx-auto block"
            >
              Iniciar Simulado
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Tela de resultados
  if (showResults) {
    const correctCount = answers.filter((ans, idx) => ans !== null && ans === questions[idx].correctAnswer).length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const answeredCount = answers.filter(a => a !== null).length;

    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Resultado do Simulado</h1>
          </div>

          {/* Card de Pontuação */}
          <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl shadow-lg p-8 text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <Trophy className="w-16 h-16 mb-4" />
                <h2 className="text-3xl font-bold mb-2">Sua Pontuação</h2>
                <p className="text-orange-100">
                  {specialty} - {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Médio' : 'Difícil'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-6xl font-bold">{score}%</div>
                <div className="text-xl mt-2">{correctCount}/{totalQuestions} acertos</div>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{correctCount}</div>
              <div className="text-sm text-gray-600">Corretas</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{answeredCount - correctCount}</div>
              <div className="text-sm text-gray-600">Incorretas</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <Target className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{totalQuestions - answeredCount}</div>
              <div className="text-sm text-gray-600">Sem resposta</div>
            </div>
          </div>

          {/* Revisão das questões */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Revisão das Questões</h3>
            <div className="space-y-6">
              {questions.map((q, idx) => {
                const userAnswer = answers[idx];
                const isCorrect = userAnswer !== null && userAnswer === q.correctAnswer;
                const wasAnswered = userAnswer !== null;

                return (
                  <div key={idx} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                        !wasAnswered ? 'bg-gray-200 text-gray-600' :
                        isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium mb-3">{q.question}</p>
                        
                        <div className="space-y-2 mb-3">
                          {q.options.map((option, optIdx) => {
                            const isUserAnswer = userAnswer === optIdx;
                            const isCorrectAnswer = optIdx === q.correctAnswer;
                            
                            return (
                              <div
                                key={optIdx}
                                className={`p-3 rounded-lg border-2 ${
                                  isCorrectAnswer
                                    ? 'border-green-500 bg-green-50'
                                    : isUserAnswer && !isCorrect
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">
                                    <strong>{String.fromCharCode(65 + optIdx)})</strong> {option}
                                  </span>
                                  {isCorrectAnswer && <CheckCircle className="w-5 h-5 text-green-500" />}
                                  {isUserAnswer && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-blue-900 mb-1">Explicação:</p>
                          <p className="text-sm text-blue-800">{q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ações finais */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setQuestions([]);
                setAnswers(Array(10).fill(null));
                setShowResults(false);
                setCurrentIndex(0);
              }}
              className="btn-primary flex-1"
            >
              Fazer Novo Simulado
            </button>
            <button
              onClick={() => navigate('/estudos', { state: { specialty, weakTopics: true } })}
              className="btn-secondary flex-1"
            >
              Ver Material de Estudo
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Tela de questões (durante o simulado)
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header com progresso */}
        <div className="mb-6 bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Questão {currentIndex + 1} de {totalQuestions}</h2>
              <p className="text-gray-600">{specialty} • {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Médio' : 'Difícil'}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Respondidas</div>
              <div className="text-2xl font-bold text-orange-500">
                {answers.filter(a => a !== null).length}/{totalQuestions}
              </div>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Miniaturas das questões */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                  idx === currentIndex
                    ? 'bg-orange-500 text-white'
                    : answers[idx] !== null
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Questão atual */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Questão {currentIndex + 1}</h3>
          <p className="text-gray-700 leading-relaxed text-lg mb-6">{currentQuestion.question}</p>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(idx)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === idx
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      selectedAnswer === idx
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-gray-800">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navegação */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Anterior
          </button>

          {currentIndex === totalQuestions - 1 ? (
            <button onClick={handleFinish} className="btn-primary">
              Finalizar Simulado
              <Trophy className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary">
              Próxima
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ObjetivaPage;
