import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EstatisticasPage: React.FC = () => {
  const { progress } = useAuth();

  // Calcular dados mensais baseado no histórico real
  const getMonthlyData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentDate = new Date();
    const monthlyStats: Record<string, { questions: number; correct: number }> = {};

    // Inicializar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${months[date.getMonth()]}`;
      monthlyStats[monthKey] = { questions: 0, correct: 0 };
    }

    // Preencher com dados reais
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
    }));
  };

  const monthlyData = getMonthlyData();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Estatísticas Detalhadas</h1>
        
        <div className="grid gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Progresso Mensal</h3>
            {monthlyData.some(m => m.questions > 0) ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="questions" stroke="#3b82f6" name="Questões" />
                  <Line type="monotone" dataKey="correct" stroke="#10b981" name="Acertos" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-500">
                <div className="text-center">
                  <p className="text-lg mb-2">Nenhum dado disponível ainda</p>
                  <p className="text-sm">Comece respondendo questões para ver suas estatísticas</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EstatisticasPage;
