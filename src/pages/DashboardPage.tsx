import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, CheckCircle, Star, Clock, TrendingUp, ArrowUp } from 'lucide-react';
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

const DashboardPage: React.FC = () => {
  const { user, progress } = useAuth();

  const accuracyRate = ((progress.correctAnswers / progress.totalQuestions) * 100).toFixed(0);
  const avgTimePerDay = (progress.studyTime / 60 / progress.streakDays).toFixed(1);

  // Dados para gráficos
  const weeklyData = [
    { day: 'Seg', questions: 12, correct: 10 },
    { day: 'Ter', questions: 15, correct: 13 },
    { day: 'Qua', questions: 18, correct: 16 },
    { day: 'Qui', questions: 20, correct: 17 },
    { day: 'Sex', questions: 16, correct: 14 },
    { day: 'Sáb', questions: 22, correct: 19 },
    { day: 'Dom', questions: 14, correct: 12 },
  ];

  const specialtyData = [
    { name: 'Cardiologia', value: 85 },
    { name: 'Pediatria', value: 78 },
    { name: 'Cirurgia', value: 92 },
    { name: 'Clínica Médica', value: 88 },
    { name: 'Neurologia', value: 75 },
  ];

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
        <div className="space-y-4">
          <ActivityItem
            title="Questão de Cardiologia"
            status="Correta"
            time="2 horas atrás"
            correct={true}
          />
          <ActivityItem
            title="Questão de Pediatria"
            status="Correta"
            time="4 horas atrás"
            correct={true}
          />
          <ActivityItem
            title="Questão de Cirurgia"
            status="Incorreta"
            time="6 horas atrás"
            correct={false}
          />
          <ActivityItem
            title="Questão de Clínica Médica"
            status="Correta"
            time="1 dia atrás"
            correct={true}
          />
        </div>
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
