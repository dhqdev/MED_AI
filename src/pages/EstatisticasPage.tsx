import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EstatisticasPage: React.FC = () => {
  const monthlyData = [
    { month: 'Jan', questions: 45, correct: 38 },
    { month: 'Fev', questions: 52, correct: 44 },
    { month: 'Mar', questions: 48, correct: 41 },
    { month: 'Abr', questions: 61, correct: 53 },
    { month: 'Mai', questions: 58, correct: 50 },
    { month: 'Jun', questions: 67, correct: 59 },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Estatísticas Detalhadas</h1>
        
        <div className="grid gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Progresso Mensal</h3>
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EstatisticasPage;
