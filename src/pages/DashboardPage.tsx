import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, CheckCircle, Star, Clock, TrendingUp, Target, PlayCircle, 
  Lightbulb, Award, BarChart3, Activity, ChevronDown, ChevronUp 
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { generatePersonalizedSuggestions, calculateDailyGoalProgress, calculateWeeklyGoalProgress } from '../services/suggestions';

const DashboardPage: React.FC = () => {
  const { user, progress, updateProgress } = useAuth();
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  
  const accuracyRate = progress.totalQuestions > 0 
    ? ((progress.correctAnswers / progress.totalQuestions) * 100).toFixed(0)
    : '0';
  const avgTimePerDay = progress.streakDays > 0
    ? (progress.studyTime / 60 / progress.streakDays).toFixed(1)
    : '0.0';

  const dailyGoal = calculateDailyGoalProgress(progress);
  const weeklyGoal = calculateWeeklyGoalProgress(progress);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (progress.suggestedTopics.length === 0 && progress.totalQuestions >= 3) {
        setLoadingSuggestions(true);
        try {
          const suggestions = await generatePersonalizedSuggestions(progress);
          updateProgress({ suggestedTopics: suggestions });
        } catch (error) {
          console.error('Erro ao carregar sugestões:', error);
        } finally {
          setLoadingSuggestions(false);
        }
      }
    };
    loadSuggestions();
  }, []);

  const getWeeklyData = () => {
    const today = new Date();
    const weekData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return {
        day: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()],
        questions: 0,
        correct: 0,
      };
    });

    progress.questionHistory?.forEach(q => {
      const qDate = new Date(q.timestamp);
      const daysDiff = Math.floor((today.getTime() - qDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < 7) {
        const index = 6 - daysDiff;
        weekData[index].questions++;
        if (q.correct) weekData[index].correct++;
      }
    });

    return weekData;
  };

  const getMonthlyData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentDate = new Date();
    const monthlyStats: Record<string, { questions: number; correct: number }> = {};

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${months[date.getMonth()]}`;
      monthlyStats[monthKey] = { questions: 0, correct: 0 };
    }

    progress.questionHistory?.forEach(q => {
      const qDate = new Date(q.timestamp);
      const monthKey = months[qDate.getMonth()];
      if (monthlyStats[monthKey]) {
        monthlyStats[monthKey].questions++;
        if (q.correct) monthlyStats[monthKey].correct++;
      }
    });

    return Object.entries(monthlyStats).map(([month, stats]) => ({
      month,
      questions: stats.questions,
      correct: stats.correct,
      accuracy: stats.questions > 0 ? Math.round((stats.correct / stats.questions) * 100) : 0
    }));
  };

  const getSpecialtyData = () => {
    const specialtyStats: Record<string, { total: number; correct: number }> = {};
    
    progress.questionHistory?.forEach(q => {
      if (!specialtyStats[q.specialty]) {
        specialtyStats[q.specialty] = { total: 0, correct: 0 };
      }
      specialtyStats[q.specialty].total++;
      if (q.correct) specialtyStats[q.specialty].correct++;
    });

    return Object.entries(specialtyStats).map(([name, stats]) => ({
      name,
      value: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      total: stats.total
    })).sort((a, b) => b.total - a.total).slice(0, 5);
  };

  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();
  const specialtyData = getSpecialtyData();

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <DashboardLayout>
      {/* Welcome Section - Mobile Optimized */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 rounded-3xl shadow-2xl p-6 md:p-8 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
          
          <div className="relative">
            <div className="mb-4">
              <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">
                Olá, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-blue-100 text-sm md:text-lg">Continue sua jornada rumo à excelência</p>
            </div>
            
            {/* Stats - Grid responsivo */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 mt-5">
              <div className="text-center bg-white/15 backdrop-blur-md px-3 py-3 md:px-6 md:py-4 rounded-2xl border border-white/20">
                <div className="text-2xl md:text-3xl font-bold">{progress.streakDays}</div>
                <div className="text-[10px] md:text-sm text-blue-100 font-medium mt-1">Dias seguidos</div>
              </div>
              <div className="text-center bg-white/15 backdrop-blur-md px-3 py-3 md:px-6 md:py-4 rounded-2xl border border-white/20">
                <div className="text-2xl md:text-3xl font-bold">{accuracyRate}%</div>
                <div className="text-[10px] md:text-sm text-blue-100 font-medium mt-1">Acertos</div>
              </div>
              <div className="text-center bg-white/15 backdrop-blur-md px-3 py-3 md:px-6 md:py-4 rounded-2xl border border-white/20">
                <div className="text-2xl md:text-3xl font-bold">{progress.totalQuestions}</div>
                <div className="text-[10px] md:text-sm text-blue-100 font-medium mt-1">Questões</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue de onde parou - Mobile Optimized */}
      {progress.currentSession?.isActive && (
        <div className="mb-6">
          <div className="bg-white rounded-3xl shadow-lg p-5 md:p-6 border-l-4 border-purple-600 hover:shadow-xl transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start md:items-center space-x-3 md:space-x-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
                  <PlayCircle className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1">Continue de onde parou</h3>
                  <p className="text-sm md:text-base text-gray-600 truncate">
                    {progress.currentSession.specialty} - {progress.currentSession.mode === 'objetiva' ? 'Múltipla Escolha' : 'Dissertativa'}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                    {progress.currentSession.questionsCompleted}/{progress.currentSession.questionsTotal} questões
                  </p>
                </div>
              </div>
              <Link
                to="/questoes"
                state={{ resumeSession: true }}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-2xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg active:scale-95 text-center text-sm md:text-base"
              >
                Continuar
              </Link>
            </div>
            <div className="mt-4 bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-full h-2.5 transition-all shadow-sm"
                style={{
                  width: `${(progress.currentSession.questionsCompleted / progress.currentSession.questionsTotal) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Metas Diárias e Semanais - Mobile Optimized */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div className="bg-white rounded-3xl shadow-lg p-5 md:p-6 border-t-4 border-blue-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Meta Diária</h3>
            </div>
            <span className="text-3xl font-bold text-blue-600">
              {dailyGoal.current}/{dailyGoal.target}
            </span>
          </div>
          <div className="relative pt-1">
            <div className="overflow-hidden h-4 text-xs flex rounded-full bg-blue-100">
              <div
                style={{ width: `${dailyGoal.percentage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all"
              />
            </div>
            <p className="text-sm text-gray-600 mt-3">
              {dailyGoal.percentage >= 100 
                ? '🎉 Meta diária alcançada!' 
                : `Faltam ${dailyGoal.target - dailyGoal.current} questões para completar sua meta`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-green-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Meta Semanal</h3>
            </div>
            <span className="text-3xl font-bold text-green-600">
              {weeklyGoal.current}/{weeklyGoal.target}
            </span>
          </div>
          <div className="relative pt-1">
            <div className="overflow-hidden h-4 text-xs flex rounded-full bg-green-100">
              <div
                style={{ width: `${weeklyGoal.percentage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-600 transition-all"
              />
            </div>
            <p className="text-sm text-gray-600 mt-3">
              {weeklyGoal.percentage >= 100 
                ? '🏆 Meta semanal alcançada!' 
                : `Faltam ${weeklyGoal.target - weeklyGoal.current} questões esta semana`}
            </p>
          </div>
        </div>
      </div>

      {/* Estatísticas Expansíveis */}
      <div className="mb-8">
        <button
          onClick={() => setShowStatistics(!showStatistics)}
          className="w-full bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900">Estatísticas Detalhadas</h3>
                <p className="text-sm text-gray-600">Clique para {showStatistics ? 'ocultar' : 'visualizar'} gráficos e análises</p>
              </div>
            </div>
            {showStatistics ? <ChevronUp className="w-6 h-6 text-gray-400" /> : <ChevronDown className="w-6 h-6 text-gray-400" />}
          </div>
        </button>

        {showStatistics && (
          <div className="mt-6 space-y-6">
            {/* Gráfico Semanal */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Desempenho Semanal
              </h3>
              {weeklyData.some(d => d.questions > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="questions" fill="#3b82f6" name="Questões" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="correct" fill="#10b981" name="Acertos" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <p>Nenhum dado disponível para esta semana</p>
                </div>
              )}
            </div>

            {/* Gráfico Mensal */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Evolução Mensal
              </h3>
              {monthlyData.some(m => m.questions > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="questions" stroke="#3b82f6" name="Questões" strokeWidth={3} />
                    <Line type="monotone" dataKey="correct" stroke="#10b981" name="Acertos" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <p>Nenhum dado disponível ainda</p>
                </div>
              )}
            </div>

            {/* Desempenho por Especialidade */}
            {specialtyData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Desempenho por Especialidade</h3>
                <div className="space-y-4">
                  {specialtyData.map((spec, index) => (
                    <div key={spec.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">{spec.name}</span>
                        <span className="text-sm font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                          {spec.value}% ({spec.total} questões)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all"
                          style={{
                            width: `${spec.value}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sugestões Personalizadas */}
      {(progress.suggestedTopics.length > 0 || loadingSuggestions) && (
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Sugestões Personalizadas</h3>
            </div>
            {loadingSuggestions ? (
              <div className="text-center py-12 text-gray-500">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                Analisando seu desempenho...
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progress.suggestedTopics.map((topic, index) => (
                  <Link
                    key={index}
                    to="/questoes"
                    state={{ specialty: topic.specialty }}
                    className={`p-5 rounded-xl border-2 transition-all hover:shadow-lg ${
                      topic.priority === 'high'
                        ? 'border-red-300 bg-red-50 hover:bg-red-100'
                        : topic.priority === 'medium'
                        ? 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100'
                        : 'border-green-300 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-gray-900">{topic.specialty}</h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          topic.priority === 'high'
                            ? 'bg-red-200 text-red-800'
                            : topic.priority === 'medium'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-green-200 text-green-800'
                        }`}
                      >
                        {topic.priority === 'high' ? 'Urgente' : topic.priority === 'medium' ? 'Médio' : 'Baixo'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{topic.reason}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link
          to="/questoes"
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <HelpCircle className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Resolver Questões</h3>
              <p className="text-sm text-gray-600">Pratique agora</p>
            </div>
          </div>
        </Link>

        <Link
          to="/estudos"
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Star className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Material de Estudo</h3>
              <p className="text-sm text-gray-600">Conteúdo personalizado</p>
            </div>
          </div>
        </Link>

        <Link
          to="/perfil"
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Meu Perfil</h3>
              <p className="text-sm text-gray-600">Ver conquistas</p>
            </div>
          </div>
        </Link>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
