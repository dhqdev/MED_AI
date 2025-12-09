import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Award, Calendar, Settings, Target, Heart, Bell } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

const PerfilPage: React.FC = () => {
  const { user, progress, updateProgress } = useAuth();
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'info' | 'preferences' | 'goals'>('info');
  
  const [preferences, setPreferences] = useState(progress.preferences);
  const [goals, setGoals] = useState(progress.goals);
  
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
    'Endocrinologia',
  ];
  
  const handleSavePreferences = () => {
    updateProgress({ preferences });
    addNotification('Preferências salvas com sucesso!', 'success');
  };
  
  const handleSaveGoals = () => {
    updateProgress({ goals });
    addNotification('Metas atualizadas com sucesso!', 'success');
  };
  
  const toggleFavoriteSpecialty = (specialty: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteSpecialties: prev.favoriteSpecialties.includes(specialty)
        ? prev.favoriteSpecialties.filter(s => s !== specialty)
        : [...prev.favoriteSpecialties, specialty],
    }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Meu Perfil</h1>
        
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="inline w-4 h-4 mr-2" />
                Informações
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'preferences'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="inline w-4 h-4 mr-2" />
                Preferências
              </button>
              <button
                onClick={() => setActiveTab('goals')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'goals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Target className="inline w-4 h-4 mr-2" />
                Metas
              </button>
            </nav>
          </div>
          
          {/* Tab: Informações */}
          {activeTab === 'info' && (
            <div className="p-8">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-24 h-24 bg-blue-med rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {user?.name?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <User className="w-10 h-10 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">Nome</div>
                    <div className="font-semibold">{user?.name}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Mail className="w-10 h-10 text-green-500" />
                  <div>
                    <div className="text-sm text-gray-500">E-mail</div>
                    <div className="font-semibold">{user?.email}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Award className="w-10 h-10 text-purple-500" />
                  <div>
                    <div className="text-sm text-gray-500">Nível</div>
                    <div className="font-semibold">{progress.level}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Calendar className="w-10 h-10 text-orange-500" />
                  <div>
                    <div className="text-sm text-gray-500">Streak</div>
                    <div className="font-semibold">{progress.streakDays} dias</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Tab: Preferências */}
          {activeTab === 'preferences' && (
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Personalize sua Experiência</h3>
              
              {/* Especialidades Favoritas */}
              <div className="mb-8">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-4">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>Especialidades Favoritas</span>
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Selecione as especialidades que você mais gosta de estudar
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {specialties.map((specialty) => (
                    <button
                      key={specialty}
                      onClick={() => toggleFavoriteSpecialty(specialty)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        preferences.favoriteSpecialties.includes(specialty)
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {preferences.favoriteSpecialties.includes(specialty) && '❤️ '}
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Dificuldade Preferida */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Nível de Dificuldade Preferido
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, preferredDifficulty: 'easy' }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      preferences.preferredDifficulty === 'easy'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold">Fácil</div>
                    <div className="text-xs mt-1">Conceitos básicos</div>
                  </button>
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, preferredDifficulty: 'medium' }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      preferences.preferredDifficulty === 'medium'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold">Médio</div>
                    <div className="text-xs mt-1">Aplicação prática</div>
                  </button>
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, preferredDifficulty: 'hard' }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      preferences.preferredDifficulty === 'hard'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold">Difícil</div>
                    <div className="text-xs mt-1">Casos complexos</div>
                  </button>
                </div>
              </div>
              
              {/* Notificações */}
              <div className="mb-8">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-4">
                  <Bell className="w-5 h-5 text-blue-500" />
                  <span>Notificações e Lembretes</span>
                </label>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
                    <span className="text-gray-700">Lembretes de estudo diário</span>
                    <input
                      type="checkbox"
                      checked={preferences.studyReminders}
                      onChange={(e) => setPreferences(prev => ({ ...prev, studyReminders: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
                    <span className="text-gray-700">Notificações de conquistas</span>
                    <input
                      type="checkbox"
                      checked={preferences.notificationsEnabled}
                      onChange={(e) => setPreferences(prev => ({ ...prev, notificationsEnabled: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
              
              <button
                onClick={handleSavePreferences}
                className="btn-primary w-full"
              >
                Salvar Preferências
              </button>
            </div>
          )}
          
          {/* Tab: Metas */}
          {activeTab === 'goals' && (
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Defina suas Metas de Estudo</h3>
              
              <div className="space-y-6">
                {/* Meta Diária */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Meta de Questões Diárias
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={goals.dailyQuestions}
                      onChange={(e) => setGoals(prev => ({ ...prev, dailyQuestions: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <div className="w-20 text-center">
                      <div className="text-2xl font-bold text-blue-600">{goals.dailyQuestions}</div>
                      <div className="text-xs text-gray-500">questões</div>
                    </div>
                  </div>
                </div>
                
                {/* Meta Semanal */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Meta de Questões Semanais
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="20"
                      max="200"
                      step="10"
                      value={goals.weeklyQuestions}
                      onChange={(e) => setGoals(prev => ({ ...prev, weeklyQuestions: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <div className="w-20 text-center">
                      <div className="text-2xl font-bold text-green-600">{goals.weeklyQuestions}</div>
                      <div className="text-xs text-gray-500">questões</div>
                    </div>
                  </div>
                </div>
                
                {/* Nível Alvo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Nível de Conhecimento Alvo
                  </label>
                  <select
                    value={goals.targetLevel}
                    onChange={(e) => setGoals(prev => ({ ...prev, targetLevel: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="básico">Básico</option>
                    <option value="intermediário">Intermediário</option>
                    <option value="avançado">Avançado</option>
                    <option value="especialista">Especialista</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleSaveGoals}
                className="btn-primary w-full mt-8"
              >
                Salvar Metas
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PerfilPage;
