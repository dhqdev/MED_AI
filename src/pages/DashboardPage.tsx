import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, CheckCircle, Star, Clock, TrendingUp, ArrowUp, Target, PlayCircle, Lightbulb, Award } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { generatePersonalizedSuggestions, calculateDailyGoalProgress, calculateWeeklyGoalProgress } from '../services/suggestions';
import type { SuggestedTopic } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user, progress, updateProgress } = useAuth();
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  const accuracyRate = progress.totalQuestions > 0 
    ? ((progress.correctAnswers / progress.totalQuestions) * 100).toFixed(0)
    : '0';
  const avgTimePerDay = progress.streakDays > 0
    ? (progress.studyTime / 60 / progress.streakDays).toFixed(1)
    : '0.0';

  const dailyGoal = calculateDailyGoalProgress(progress);
  const weeklyGoal = calculateWeeklyGoalProgress(progress);

  // Carregar sugestões ao montar o componente
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

  // Calcular dados semanais baseado no histórico real
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

  const weeklyData = getWeeklyData();

  // Calcular desempenho por especialidade baseado no histórico real
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
    }));
  };

  const specialtyData = getSpecialtyData();

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bem-vindo, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-gray-600">Continue sua jornada rumo à excelência médica</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-med">{progress.streakDays}</div>
                <div className="text-sm text-gray-500">Dias consecutivos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{accuracyRate}%</div>
                <div className="text-sm text-gray-500">Taxa de acerto</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue de onde parou */}
      {progress.currentSession?.isActive && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <PlayCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Continue de onde parou</h3>
                  <p className="text-purple-100">
                    Sessão de {progress.currentSession.specialty} - {progress.currentSession.mode === 'objetiva' ? 'Múltipla Escolha' : 'Dissertativa'}
                  </p>
                  <p className="text-sm text-purple-200 mt-1">
                    {progress.currentSession.questionsCompleted}/{progress.currentSession.questionsTotal} questões completadas
                  </p>
                </div>
              </div>
              <Link
                to={progress.currentSession.mode === 'objetiva' ? '/objetiva' : '/dissertativa'}
                state={{ resumeSession: true }}
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Continuar
              </Link>
            </div>
            <div className="mt-4 bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{
                  width: `${(progress.currentSession.questionsCompleted / progress.currentSession.questionsTotal) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Metas Diárias e Semanais */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Meta Diária</h3>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {dailyGoal.current}/{dailyGoal.target}
            </span>
          </div>
          <div className="relative pt-1">
            <div className="overflow-hidden h-3 text-xs flex rounded-full bg-blue-100">
              <div
                style={{ width: `${dailyGoal.percentage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {dailyGoal.percentage >= 100 
                ? '🎉 Meta diária alcançada!' 
                : `Faltam ${dailyGoal.target - dailyGoal.current} questões para completar sua meta`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Meta Semanal</h3>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {weeklyGoal.current}/{weeklyGoal.target}
            </span>
          </div>
          <div className="relative pt-1">
            <div className="overflow-hidden h-3 text-xs flex rounded-full bg-green-100">
              <div
                style={{ width: `${weeklyGoal.percentage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {weeklyGoal.percentage >= 100 
                ? '🏆 Meta semanal alcançada!' 
                : `Faltam ${weeklyGoal.target - weeklyGoal.current} questões esta semana`}
            </p>
          </div>
        </div>
      </div>

      {/* Sugestões Personalizadas */}
      {(progress.suggestedTopics.length > 0 || loadingSuggestions) && (
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Sugestões Personalizadas para Você</h3>
            </div>
            {loadingSuggestions ? (
              <div className="text-center py-8 text-gray-500">
                Analisando seu desempenho...
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progress.suggestedTopics.map((topic, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 ${
                      topic.priority === 'high'
                        ? 'border-red-200 bg-red-50'
                        : topic.priority === 'medium'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-900">{topic.specialty}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          topic.priority === 'high'
                            ? 'bg-red-200 text-red-700'
                            : topic.priority === 'medium'
                            ? 'bg-yellow-200 text-yellow-700'
                            : 'bg-blue-200 text-blue-700'
                        }`}
                      >
                        {topic.priority === 'high' ? 'Alta' : topic.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{topic.reason}</p>
                    <Link
                      to="/questoes"
                      state={{ specialty: topic.specialty }}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Estudar agora →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<HelpCircle className="w-6 h-6 text-white" />}
          iconBg="bg-blue-light"
          title="Questões Respondidas"
          value={progress.totalQuestions.toString()}
          change="+12% esta semana"
          positive={true}
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          iconBg="bg-green-500"
          title="Taxa de Acerto"
          value={`${accuracyRate}%`}
          change="+5% esta semana"
          positive={true}
        />
        <StatCard
          icon={<Star className="w-6 h-6 text-white" />}
          iconBg="bg-purple-500"
          title="Nível Atual"
          value={progress.level.toString()}
          change="Avançado"
          positive={true}
        />
        <StatCard
          icon={<Clock className="w-6 h-6 text-white" />}
          iconBg="bg-orange-500"
          title="Tempo Médio/Dia"
          value={`${avgTimePerDay}h`}
          change="Meta: 3h/dia"
          positive={false}
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Chart */}
        <div className="card-hover bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Desempenho Semanal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="questions" fill="#3b82f6" name="Questões" />
              <Bar dataKey="correct" fill="#10b981" name="Acertos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Specialty Performance */}
        <div className="card-hover bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Desempenho por Especialidade</h3>
          {specialtyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={specialtyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {specialtyData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <p>Responda questões para ver seu desempenho por especialidade</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <ActionCard
          title="Questões Rápidas"
          description="Responda questões aleatórias adaptadas ao seu nível"
          link="/questoes"
          color="bg-blue-med"
        />
        <ActionCard
          title="Modo Dissertativo"
          description="Pratique com questões dissertativas e receba feedback detalhado"
          link="/dissertativa"
          color="bg-purple-500"
        />
        <ActionCard
          title="Modo Objetivo"
          description="Teste seus conhecimentos com questões de múltipla escolha"
          link="/objetiva"
          color="bg-orange-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Atividade Recente</h3>
        {progress.questionHistory && progress.questionHistory.length > 0 ? (
          <div className="space-y-4">
            {progress.questionHistory.slice(-4).reverse().map((item, index) => (
              <ActivityItem
                key={index}
                title={`Questão de ${item.specialty}`}
                status={item.correct ? 'Correta' : 'Incorreta'}
                time={new Date(item.timestamp).toLocaleString('pt-BR')}
                correct={item.correct}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma atividade ainda. Comece respondendo questões!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: string;
  change: string;
  positive: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, iconBg, title, value, change, positive }) => {
  return (
    <div className="card-hover bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
        <div className="ml-4">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{title}</div>
        </div>
      </div>
      <div className="mt-4">
        <div className={`flex items-center text-sm ${positive ? 'text-green-600' : 'text-orange-600'}`}>
          {positive && <ArrowUp className="w-4 h-4 mr-1" />}
          <span>{change}</span>
        </div>
      </div>
    </div>
  );
};

interface ActionCardProps {
  title: string;
  description: string;
  link: string;
  color: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, link, color }) => {
  return (
    <Link
      to={link}
      className={`card-hover ${color} text-white rounded-2xl shadow-lg p-6 block`}
    >
      <h4 className="text-xl font-bold mb-2">{title}</h4>
      <p className="text-white/90 mb-4">{description}</p>
      <div className="flex items-center text-sm font-semibold">
        Começar agora
        <TrendingUp className="ml-2 w-4 h-4" />
      </div>
    </Link>
  );
};

interface ActivityItemProps {
  title: string;
  status: string;
  time: string;
  correct: boolean;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ title, status, time, correct }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            correct ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          {correct ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <span className="text-red-600 font-bold">✕</span>
          )}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{time}</div>
        </div>
      </div>
      <div
        className={`px-3 py-1 rounded-full text-sm font-semibold ${
          correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}
      >
        {status}
      </div>
    </div>
  );
};

export default DashboardPage;
