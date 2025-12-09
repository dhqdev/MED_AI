import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader, ArrowRight, ArrowLeft, Trophy, Target, FileText, ListChecks, Send } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  generateObjectiveQuestion, 
  generateDissertativeQuestion,
  correctDissertativeAnswer,
  type ObjectiveQuestion,
  type DissertativeFeedback 
} from '../services/openai';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type QuestionMode = 'objetiva' | 'dissertativa';

const specialties = [
  'Cardiologia',
  'Pediatria',
  'Cirurgia Geral',
  'Clínica Médica',
  'Ginecologia e Obstetrícia',
  'Neurologia',
  'Ortopedia',
  'Dermatologia',
  'Psiquiatria',
  'Infectologia',
  'Pneumologia',
  'Nefrologia',
  'Gastroenterologia',
  'Endocrinologia',
  'Hematologia',
  'Reumatologia',
  'Oncologia',
  'Medicina Intensiva'
];

const QuestoesPage: React.FC = () => {
  const location = useLocation();
  const { progress, updateProgress } = useAuth();
  const { addNotification } = useNotification();

  // Estados gerais
  const [mode, setMode] = useState<QuestionMode>('objetiva');
  const [specialty, setSpecialty] = useState(
    location.state?.specialty || progress.preferences.favoriteSpecialties[0] || 'Cardiologia'
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    location.state?.difficulty || progress.preferences.preferredDifficulty || 'medium'
  );
  const [loading, setLoading] = useState(false);

  // Estados para modo objetivo (10 questões)
  const [objectiveQuestions, setObjectiveQuestions] = useState<ObjectiveQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(10).fill(null));
  const [showObjectiveResults, setShowObjectiveResults] = useState(false);

  // Estados para modo dissertativo
  const [dissertativeQuestion, setDissertativeQuestion] = useState('');
  const [dissertativeAnswer, setDissertativeAnswer] = useState('');
  const [dissertativeFeedback, setDissertativeFeedback] = useState<DissertativeFeedback | null>(null);
  const [submittingDissertative, setSubmittingDissertative] = useState(false);

  const totalQuestions = 10;

  // ===== MODO OBJETIVO =====
  const generateObjectiveQuestions = async () => {
    setLoading(true);
    addNotification('Gerando 10 questões objetivas...', 'info');
    
    try {
      const generatedQuestions: ObjectiveQuestion[] = [];
      
      for (let i = 0; i < totalQuestions; i++) {
        const question = await generateObjectiveQuestion(specialty, difficulty);
        generatedQuestions.push(question);
        
        if ((i + 1) % 3 === 0) {
          addNotification(`${i + 1}/${totalQuestions} questões geradas...`, 'info');
        }
      }
      
      setObjectiveQuestions(generatedQuestions);
      setAnswers(Array(totalQuestions).fill(null));
      setCurrentIndex(0);
      setShowObjectiveResults(false);
      addNotification('✅ Questões geradas! Boa sorte!', 'success');
    } catch (error) {
      console.error('Erro ao gerar questões:', error);
      addNotification('Erro ao gerar questões. Verifique sua conexão e API Key.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (answerIndex: number) => {
    if (showObjectiveResults) return;
    
    const newAnswers = [...answers];
    newAnswers[currentIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleFinishObjective = () => {
    const unanswered = answers.filter(a => a === null).length;
    
    if (unanswered > 0) {
      addNotification(`${unanswered} questão(ões) sem resposta`, 'warning');
    }
    
    setShowObjectiveResults(true);
    calculateObjectiveResults();
  };

  const calculateObjectiveResults = () => {
    const correctCount = answers.filter((ans, idx) => 
      ans !== null && ans === objectiveQuestions[idx].correctAnswer
    ).length;
    const score = Math.round((correctCount / totalQuestions) * 100);

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
      experience: progress.experience + (correctCount * 10) + 50,
    });

    addNotification(
      `🎉 Você acertou ${correctCount}/${totalQuestions} (${score}%)`,
      score >= 70 ? 'success' : score >= 50 ? 'warning' : 'error'
    );
  };

  // ===== MODO DISSERTATIVO =====
  const generateDissertativeQuestionHandler = async () => {
    setLoading(true);
    try {
      const question = await generateDissertativeQuestion(specialty, difficulty);
      setDissertativeQuestion(question);
      setDissertativeAnswer('');
      setDissertativeFeedback(null);
      addNotification('Questão dissertativa gerada!', 'success');
    } catch (error) {
      console.error('Erro ao gerar questão:', error);
      addNotification('Erro ao gerar questão. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDissertative = async () => {
    if (!dissertativeAnswer.trim()) {
      addNotification('Escreva sua resposta antes de enviar', 'warning');
      return;
    }

    setSubmittingDissertative(true);
    try {
      const feedback = await correctDissertativeAnswer(
        dissertativeQuestion,
        dissertativeAnswer,
        specialty
      );
      setDissertativeFeedback(feedback);
      
      // Atualizar progresso
      const isGoodScore = feedback.score >= 70;
      const newSpecialties = { ...progress.specialties };
      if (!newSpecialties[specialty]) {
        newSpecialties[specialty] = { total: 0, correct: 0 };
      }
      newSpecialties[specialty].total += 1;
      if (isGoodScore) newSpecialties[specialty].correct += 1;
      newSpecialties[specialty].lastStudied = new Date().toISOString();

      updateProgress({
        totalQuestions: progress.totalQuestions + 1,
        correctAnswers: progress.correctAnswers + (isGoodScore ? 1 : 0),
        specialties: newSpecialties,
        experience: progress.experience + Math.round(feedback.score / 10),
      });

      addNotification(
        `Nota: ${feedback.score}/100`,
        feedback.score >= 70 ? 'success' : feedback.score >= 50 ? 'warning' : 'error'
      );
    } catch (error) {
      console.error('Erro ao corrigir resposta:', error);
      addNotification('Erro ao corrigir resposta. Tente novamente.', 'error');
    } finally {
      setSubmittingDissertative(false);
    }
  };

  const currentObjectiveQuestion = objectiveQuestions[currentIndex];
  const selectedAnswer = answers[currentIndex];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Cabeçalho com Abas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6 border border-gray-100 dark:border-gray-700">
          <h1 className="text-3xl font-bold mb-8 flex items-center justify-center gap-3 text-gray-800 dark:text-white">
            <Target className="text-blue-600" size={32} />
            Questões
          </h1>

          {/* Tabs */}
          <div className="flex gap-3 mb-8 max-w-2xl mx-auto">
            <button
              onClick={() => {
                setMode('objetiva');
                setObjectiveQuestions([]);
                setShowObjectiveResults(false);
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                mode === 'objetiva'
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
            >
              <ListChecks size={20} />
              Múltipla Escolha
            </button>
            <button
              onClick={() => {
                setMode('dissertativa');
                setDissertativeQuestion('');
                setDissertativeAnswer('');
                setDissertativeFeedback(null);
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                mode === 'dissertativa'
                  ? 'bg-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
            >
              <FileText size={20} />
              Dissertativa
            </button>
          </div>

          {/* Configurações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Especialidade</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 dark:text-white"
              >
                {specialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Dificuldade</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 dark:text-white"
              >
                <option value="easy">Fácil - Conceitos Básicos</option>
                <option value="medium">Médio - Aplicação Clínica</option>
                <option value="hard">Difícil - Casos Complexos (Nível ENARE)</option>
              </select>
            </div>
          </div>

          {/* Botão Gerar */}
          <div className="max-w-2xl mx-auto">
            <button
              onClick={mode === 'objetiva' ? generateObjectiveQuestions : generateDissertativeQuestionHandler}
              disabled={loading}
              className={`w-full mt-6 py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                mode === 'objetiva'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={24} />
                  Gerando...
                </>
              ) : (
                <>
                  <Target size={24} />
                  {mode === 'objetiva' ? 'Gerar 10 Questões' : 'Gerar Questão Dissertativa'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* ===== CONTEÚDO MODO OBJETIVO ===== */}
        {mode === 'objetiva' && objectiveQuestions.length > 0 && !showObjectiveResults && (
          <div className="space-y-6">
            {/* Progresso */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  Questão {currentIndex + 1} de {totalQuestions}
                </span>
                <span className="text-sm text-gray-600">
                  {answers.filter(a => a !== null).length} respondidas
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-600 to-blue-500 h-3 rounded-full transition-all shadow-sm"
                  style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Questão Atual */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-start gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-xl w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-md">
                  {currentIndex + 1}
                </div>
                <p className="text-lg text-gray-800 leading-relaxed flex-1">{currentObjectiveQuestion.question}</p>
              </div>

              <div className="space-y-4">
                {currentObjectiveQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(idx)}
                    className={`w-full p-5 text-left rounded-xl border-2 transition-all text-gray-800 hover:shadow-md ${
                      selectedAnswer === idx
                        ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-100'
                        : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 bg-white'
                    }`}
                  >
                    <span className="font-bold mr-3 text-blue-600">{String.fromCharCode(65 + idx)})</span>
                    <span className="text-base">{option}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navegação */}
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="flex-1 py-4 px-8 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                <ArrowLeft size={20} />
                Anterior
              </button>

              {currentIndex === totalQuestions - 1 ? (
                <button
                  onClick={handleFinishObjective}
                  className="flex-1 py-4 px-8 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-600 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Trophy size={20} />
                  Finalizar
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex(Math.min(totalQuestions - 1, currentIndex + 1))}
                  className="flex-1 py-4 px-8 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  Próxima
                  <ArrowRight size={20} />
                </button>
              )}
            </div>

            {/* Miniaturas */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-4">Navegação Rápida:</p>
              <div className="grid grid-cols-10 gap-3">
                {objectiveQuestions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`aspect-square rounded-lg font-bold text-sm transition-all ${
                      idx === currentIndex
                        ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white ring-4 ring-blue-200 shadow-md scale-110'
                        : answers[idx] !== null
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-gray-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== RESULTADOS MODO OBJETIVO ===== */}
        {mode === 'objetiva' && showObjectiveResults && (
          <div className="space-y-6">
            {/* Resumo */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl shadow-xl p-10 text-center">
              <Trophy size={72} className="mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-4">Simulado Concluído!</h2>
              <p className="text-2xl mb-6">
                Você acertou{' '}
                <span className="font-bold text-3xl">
                  {answers.filter((ans, idx) => ans === objectiveQuestions[idx].correctAnswer).length}
                </span>{' '}
                de {totalQuestions} questões
              </p>
              <p className="text-xl opacity-90">
                {Math.round(
                  (answers.filter((ans, idx) => ans === objectiveQuestions[idx].correctAnswer).length /
                    totalQuestions) *
                    100
                )}
                % de aproveitamento
              </p>
            </div>

            {/* Revisão das Questões */}
            <div className="space-y-6">
              {objectiveQuestions.map((question, idx) => {
                const userAnswer = answers[idx];
                const isCorrect = userAnswer === question.correctAnswer;
                const wasAnswered = userAnswer !== null;

                return (
                  <div
                    key={idx}
                    className={`bg-white rounded-xl shadow-lg p-8 border-l-4 ${
                      !wasAnswered
                        ? 'border-gray-400'
                        : isCorrect
                        ? 'border-green-500'
                        : 'border-red-500'
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div
                        className={`rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold ${
                          !wasAnswered
                            ? 'bg-gray-100 text-gray-600'
                            : isCorrect
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {!wasAnswered ? (
                          <span className="font-bold">{idx + 1}</span>
                        ) : isCorrect ? (
                          <CheckCircle size={22} />
                        ) : (
                          <XCircle size={22} />
                        )}
                      </div>
                      <p className="text-lg text-gray-800 flex-1 leading-relaxed">{question.question}</p>
                    </div>

                    <div className="space-y-3 mb-6">
                      {question.options.map((option, optIdx) => {
                        const isUserChoice = userAnswer === optIdx;
                        const isCorrectOption = question.correctAnswer === optIdx;

                        return (
                          <div
                            key={optIdx}
                            className={`p-4 rounded-lg text-gray-800 ${
                              isCorrectOption
                                ? 'bg-green-50 border-2 border-green-400'
                                : isUserChoice
                                ? 'bg-red-50 border-2 border-red-400'
                                : 'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            <span className="font-bold mr-3 text-blue-600">
                              {String.fromCharCode(65 + optIdx)})
                            </span>
                            <span>{option}</span>
                            {isCorrectOption && (
                              <span className="ml-3 text-green-700 font-bold">
                                ✓ Resposta Correta
                              </span>
                            )}
                            {isUserChoice && !isCorrectOption && (
                              <span className="ml-3 text-red-700 font-bold">
                                ✗ Sua Resposta
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                      <p className="font-bold text-blue-900 mb-3 text-lg">
                        💡 Explicação:
                      </p>
                      <p className="text-gray-800 leading-relaxed">{question.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Botão Novo Simulado */}
            <button
              onClick={() => {
                setObjectiveQuestions([]);
                setAnswers(Array(totalQuestions).fill(null));
                setShowObjectiveResults(false);
                setCurrentIndex(0);
              }}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-600 transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              <Target size={24} />
              Fazer Novo Simulado
            </button>
          </div>
        )}

        {/* ===== CONTEÚDO MODO DISSERTATIVO ===== */}
        {mode === 'dissertativa' && dissertativeQuestion && (
          <div className="space-y-6">
            {/* Questão */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-start gap-4 mb-6">
                <FileText className="text-purple-600 flex-shrink-0 mt-1" size={28} />
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-3 text-gray-900">Questão Dissertativa</h3>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
                    {dissertativeQuestion}
                  </p>
                </div>
              </div>

              {/* Campo de Resposta */}
              {!dissertativeFeedback && (
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">Sua Resposta:</label>
                  <textarea
                    value={dissertativeAnswer}
                    onChange={(e) => setDissertativeAnswer(e.target.value)}
                    placeholder="Digite sua resposta detalhada aqui..."
                    rows={12}
                    className="w-full p-5 border-2 border-gray-200 rounded-xl bg-white text-gray-800 resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-gray-600 font-medium">
                      {dissertativeAnswer.length} caracteres
                    </span>
                    <button
                      onClick={handleSubmitDissertative}
                      disabled={submittingDissertative || !dissertativeAnswer.trim()}
                      className="py-3 px-8 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-bold hover:from-purple-700 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                    >
                      {submittingDissertative ? (
                        <>
                          <Loader className="animate-spin" size={20} />
                          Corrigindo...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Enviar Resposta
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {dissertativeFeedback && (
                <div className="space-y-5 mt-8 border-t-2 border-gray-100 pt-8">
                  {/* Nota */}
                  <div
                    className={`rounded-xl p-8 text-center shadow-md ${
                      dissertativeFeedback.score >= 70
                        ? 'bg-green-50 border-2 border-green-400'
                        : dissertativeFeedback.score >= 50
                        ? 'bg-yellow-50 border-2 border-yellow-400'
                        : 'bg-red-50 border-2 border-red-400'
                    }`}
                  >
                    <p className="text-sm font-semibold mb-2 text-gray-700">Nota:</p>
                    <p className={`text-5xl font-bold ${
                      dissertativeFeedback.score >= 70 ? 'text-green-700' :
                      dissertativeFeedback.score >= 50 ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {dissertativeFeedback.score}
                      <span className="text-3xl">/100</span>
                    </p>
                  </div>

                  {/* Pontos Fortes */}
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
                    <p className="font-bold text-green-800 mb-3 flex items-center gap-2 text-lg">
                      <CheckCircle size={22} />
                      Pontos Fortes:
                    </p>
                    <p className="text-gray-800 leading-relaxed">{dissertativeFeedback.strengths}</p>
                  </div>

                  {/* Pontos a Melhorar */}
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5">
                    <p className="font-bold text-orange-800 mb-3 flex items-center gap-2 text-lg">
                      <Target size={22} />
                      Pontos a Melhorar:
                    </p>
                    <p className="text-gray-800 leading-relaxed">
                      {dissertativeFeedback.improvements}
                    </p>
                  </div>

                  {/* Comentário */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                    <p className="font-bold text-blue-800 mb-3 text-lg">
                      💬 Comentário do Avaliador:
                    </p>
                    <p className="text-gray-800 leading-relaxed">{dissertativeFeedback.comment}</p>
                  </div>

                  {/* Botão Nova Questão */}
                  <button
                    onClick={() => {
                      setDissertativeQuestion('');
                      setDissertativeAnswer('');
                      setDissertativeFeedback(null);
                    }}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-bold hover:from-purple-700 hover:to-purple-600 transition-all flex items-center justify-center gap-2 shadow-lg text-lg"
                  >
                    <FileText size={22} />
                    Gerar Nova Questão
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuestoesPage;
