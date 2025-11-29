import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Award, Calendar } from 'lucide-react';

const PerfilPage: React.FC = () => {
  const { user, progress } = useAuth();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Meu Perfil</h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
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
                <div className="text-sm text-gray-500">Dias Consecutivos</div>
                <div className="font-semibold">{progress.streakDays} dias</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Conquistas</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg text-center">
              <div className="text-4xl mb-2">🏆</div>
              <div className="font-bold">100 Questões</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg text-center">
              <div className="text-4xl mb-2">🎯</div>
              <div className="font-bold">85% Acerto</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg text-center">
              <div className="text-4xl mb-2">🔥</div>
              <div className="font-bold">7 Dias Seguidos</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PerfilPage;
