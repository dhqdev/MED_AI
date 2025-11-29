import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { BookOpen, FileText, Video } from 'lucide-react';

const EstudosPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Material de Estudo</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <BookOpen className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Resumos</h3>
            <p className="text-gray-600">Conteúdo organizado por especialidade</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <FileText className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Artigos</h3>
            <p className="text-gray-600">Referências científicas atualizadas</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <Video className="w-12 h-12 text-purple-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Vídeos</h3>
            <p className="text-gray-600">Aulas práticas e demonstrações</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EstudosPage;
