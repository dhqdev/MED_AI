import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileEdit, CheckSquare, Brain, Target, TrendingUp } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

const QuestoesPage: React.FC = () => {
  const { progress } = useAuth();
  const [selectedMode, setSelectedMode] = useState<'dissertativa' | 'objetiva' | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [difficulty, setDifficulty] = useState('medium');

  // Calcular estatísticas de hoje
  const getTodayStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayQuestions = progress.questionHistory?.filter(q => {
      const qDate = new Date(q.timestamp);
      qDate.setHours(0, 0, 0, 0);
      return qDate.getTime() === today.getTime();
    }) || [];
    
    const total = todayQuestions.length;
    const correct = todayQuestions.filter(q => q.correct).length;
    const rate = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    return { total, correct, rate };
  };

  // Calcular estatísticas da semana
  const getWeekStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekQuestions = progress.questionHistory?.filter(q => 
      new Date(q.timestamp) >= weekAgo
    ) || [];
    
    const total = weekQuestions.length;
    const correct = weekQuestions.filter(q => q.correct).length;
    const rate = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    return { total, correct, rate };
  };

  const todayStats = getTodayStats();
  const weekStats = getWeekStats();

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
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Questões</h1>
          <p className="text-xl text-gray-600">
            Escolha o modo de estudo e personalize sua prática
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Escolha o Modo de Estudo</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div
              onClick={() => setSelectedMode('dissertativa')}
              className={`card-hover bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500 rounded-2xl p-8 cursor-pointer transition-all ${
                selectedMode === 'dissertativa' ? 'ring-4 ring-purple-300' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileEdit className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Modo Dissertativo</h3>
                  <p className="text-gray-600 mb-4">
                    Responda questões abertas com casos clínicos complexos. Ideal para treinar
                    raciocínio clínico e elaboração de respostas completas.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center">
                      <Brain className="w-4 h-4 mr-2 text-purple-500" />
                      Correção detalhada por IA
                    </li>
                    <li className="flex items-center">
                      <Target className="w-4 h-4 mr-2 text-purple-500" />
                      Feedback personalizado
                    </li>
                    <li className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
                      Identifica pontos de melhoria
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div
              onClick={() => setSelectedMode('objetiva')}
              className={`card-hover bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500 rounded-2xl p-8 cursor-pointer transition-all ${
                selectedMode === 'objetiva' ? 'ring-4 ring-orange-300' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckSquare className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Modo Objetivo</h3>
                  <p className="text-gray-600 mb-4">
                    Questões de múltipla escolha no formato das principais residências. Perfeito para
                    treinar velocidade e precisão na tomada de decisão.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center">
                      <Brain className="w-4 h-4 mr-2 text-orange-500" />
                      Questões estilo banca
                    </li>
                    <li className="flex items-center">
                      <Target className="w-4 h-4 mr-2 text-orange-500" />
                      Explicações detalhadas
                    </li>
                    <li className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
                      Estatísticas em tempo real
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        {selectedMode && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Configurações da Sessão</h2>
            
            <div className="space-y-6">
              {/* Specialty Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Escolha a Especialidade
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {specialties.map((specialty) => (
                    <button
                      key={specialty}
                      onClick={() => setSelectedSpecialty(specialty)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        selectedSpecialty === specialty
                          ? 'border-blue-med bg-blue-50 text-blue-med'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Nível de Dificuldade
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setDifficulty('easy')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      difficulty === 'easy'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold">Fácil</div>
                    <div className="text-xs mt-1">Conceitos básicos</div>
                  </button>
                  <button
                    onClick={() => setDifficulty('medium')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      difficulty === 'medium'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold">Médio</div>
                    <div className="text-xs mt-1">Aplicação prática</div>
                  </button>
                  <button
                    onClick={() => setDifficulty('hard')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      difficulty === 'hard'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold">Difícil</div>
                    <div className="text-xs mt-1">Casos complexos</div>
                  </button>
                </div>
              </div>

              {/* Start Button */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => setSelectedMode(null)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <Link
                  to={selectedMode === 'dissertativa' ? '/dissertativa' : '/objetiva'}
                  state={{ specialty: selectedSpecialty, difficulty }}
                  className="btn-primary"
                >
                  Iniciar Sessão
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Preview */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Sessão de Hoje</h3>
              <div className="w-12 h-12 bg-blue-light rounded-xl flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{todayStats.total} questões</div>
            <div className="text-sm text-gray-600">
              {todayStats.correct} acertos ({todayStats.rate}%)
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Esta Semana</h3>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{weekStats.total} questões</div>
            <div className="text-sm text-gray-600">
              {weekStats.correct} acertos ({weekStats.rate}%)
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Total Geral</h3>
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{progress.totalQuestions} questões</div>
            <div className="text-sm text-gray-600">
              {progress.correctAnswers} acertos (
              {progress.totalQuestions > 0 
                ? Math.round((progress.correctAnswers / progress.totalQuestions) * 100)
                : 0}%)
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QuestoesPage;
