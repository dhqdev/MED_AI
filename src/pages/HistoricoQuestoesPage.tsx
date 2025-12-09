import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock,
  BookOpen,
  TrendingUp,
  Award,
  Eye,
  X,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import type { QuestionHistoryItem } from '../contexts/AuthContext';

const HistoricoQuestoesPage: React.FC = () => {
  const { progress } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'objetiva' | 'dissertativa'>('all');
  const [filterResult, setFilterResult] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionHistoryItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Pegar todas as especialidades únicas
  const specialties = useMemo(() => {
    const specs = new Set<string>();
    progress.questionHistory.forEach(q => specs.add(q.specialty));
    return Array.from(specs).sort();
  }, [progress.questionHistory]);

  // Filtrar questões
  const filteredQuestions = useMemo(() => {
    return progress.questionHistory.filter(question => {
      // Filtro de busca
      if (searchTerm && !question.question.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !question.answer.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filtro de tipo
      if (filterType !== 'all' && question.type !== filterType) {
        return false;
      }

      // Filtro de resultado
      if (filterResult === 'correct' && !question.correct) return false;
      if (filterResult === 'incorrect' && question.correct) return false;

      // Filtro de especialidade
      if (selectedSpecialty !== 'all' && question.specialty !== selectedSpecialty) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [progress.questionHistory, searchTerm, filterType, filterResult, selectedSpecialty]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = filteredQuestions.length;
    const correct = filteredQuestions.filter(q => q.correct).length;
    const incorrect = total - correct;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    return { total, correct, incorrect, accuracy };
  }, [filteredQuestions]);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      if (diffInHours < 1) return 'Agora mesmo';
      return `Há ${diffInHours}h`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `Há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
    }

    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header Premium */}
        <div className="mb-6">
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-6 md:p-8 text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/20 rounded-full blur-2xl" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Histórico de Questões</h1>
                  <p className="text-indigo-100 text-sm md:text-base">Todas as questões geradas pela IA</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen size={18} className="text-white/80" />
                    <span className="text-xs text-white/80">Total</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </div>

                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={18} className="text-green-300" />
                    <span className="text-xs text-white/80">Acertos</span>
                  </div>
                  <div className="text-2xl font-bold text-green-300">{stats.correct}</div>
                </div>

                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle size={18} className="text-red-300" />
                    <span className="text-xs text-white/80">Erros</span>
                  </div>
                  <div className="text-2xl font-bold text-red-300">{stats.incorrect}</div>
                </div>

                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={18} className="text-yellow-300" />
                    <span className="text-xs text-white/80">Acurácia</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-300">{stats.accuracy}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Busca e Filtros */}
        <div className="bg-white rounded-3xl shadow-lg p-4 md:p-6 mb-6">
          {/* Barra de Busca */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar em questões e respostas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm md:text-base"
            />
          </div>

          {/* Toggle de Filtros Mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-4"
          >
            <div className="flex items-center gap-2">
              <Filter size={18} />
              <span className="font-semibold">Filtros</span>
            </div>
            <ChevronDown className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} size={18} />
          </button>

          {/* Filtros */}
          <div className={`grid md:grid md:grid-cols-3 gap-3 ${showFilters ? 'grid' : 'hidden md:grid'}`}>
            {/* Tipo de Questão */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Tipo</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'objetiva' | 'dissertativa')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
              >
                <option value="all">Todas</option>
                <option value="objetiva">Objetiva</option>
                <option value="dissertativa">Dissertativa</option>
              </select>
            </div>

            {/* Resultado */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Resultado</label>
              <select
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value as 'all' | 'correct' | 'incorrect')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
              >
                <option value="all">Todos</option>
                <option value="correct">Acertos</option>
                <option value="incorrect">Erros</option>
              </select>
            </div>

            {/* Especialidade */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Especialidade</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
              >
                <option value="all">Todas</option>
                {specialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Questões */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma questão encontrada</h3>
              <p className="text-gray-600">
                {progress.questionHistory.length === 0
                  ? 'Comece a resolver questões para ver seu histórico aqui!'
                  : 'Tente ajustar os filtros para encontrar o que procura.'}
              </p>
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <div
                key={question.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-4 md:p-5 border border-gray-100 cursor-pointer group"
                onClick={() => setSelectedQuestion(question)}
              >
                <div className="flex items-start gap-4">
                  {/* Ícone de Status */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    question.correct
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {question.correct ? (
                      <CheckCircle2 size={24} strokeWidth={2.5} />
                    ) : (
                      <XCircle size={24} strokeWidth={2.5} />
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        question.type === 'objetiva'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {question.type === 'objetiva' ? 'Múltipla Escolha' : 'Dissertativa'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {question.specialty}
                      </span>
                      {question.difficulty && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                          {question.difficulty}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-900 font-medium mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {question.question}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{formatDate(question.timestamp)}</span>
                      </div>
                      {question.score && (
                        <div className="flex items-center gap-1">
                          <Award size={14} />
                          <span>{question.score} pontos</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-purple-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye size={14} />
                        <span>Ver detalhes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de Detalhes */}
        {selectedQuestion && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
              onClick={() => setSelectedQuestion(null)}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-t-3xl md:rounded-3xl shadow-2xl w-full md:max-w-3xl max-h-[90vh] overflow-y-auto animate-slide-up-smooth">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-6 rounded-t-3xl md:rounded-t-3xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      selectedQuestion.correct ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {selectedQuestion.correct ? (
                        <CheckCircle2 size={24} />
                      ) : (
                        <XCircle size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Detalhes da Questão</h3>
                      <p className="text-sm text-purple-100">{formatDate(selectedQuestion.timestamp)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedQuestion(null)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
                    {selectedQuestion.type === 'objetiva' ? 'Múltipla Escolha' : 'Dissertativa'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
                    {selectedQuestion.specialty}
                  </span>
                  {selectedQuestion.difficulty && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
                      {selectedQuestion.difficulty}
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Questão */}
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Questão</h4>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedQuestion.question}</p>
                  </div>
                </div>

                {/* Resposta */}
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Sua Resposta</h4>
                  <div className={`rounded-2xl p-4 ${
                    selectedQuestion.correct
                      ? 'bg-green-50 border-2 border-green-200'
                      : 'bg-red-50 border-2 border-red-200'
                  }`}>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedQuestion.answer}</p>
                  </div>
                </div>

                {/* Score */}
                {selectedQuestion.score !== undefined && (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Award className="text-purple-600" size={20} />
                      <span className="font-semibold text-gray-900">Pontuação</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">{selectedQuestion.score}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-up-smooth {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slide-up-smooth {
          animation: slide-up-smooth 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default HistoricoQuestoesPage;
