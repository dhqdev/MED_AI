import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { BookOpen, Loader, ChevronDown, ChevronUp, Sparkles, AlertCircle, CheckCircle, TrendingDown, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { generateStudyMaterial, type StudyMaterial } from '../services/openai';

const EstudosPage: React.FC = () => {
  const location = useLocation();
  const { progress } = useAuth();
  const { addNotification } = useNotification();
  
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);

  // Análise detalhada de desempenho
  const analyzePerformance = () => {
    const specialtyStats = Object.entries(progress.specialties)
      .map(([name, stats]) => ({
        name,
        accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
        total: stats.total,
        correct: stats.correct,
        needsImprovement: stats.total > 0 && (stats.correct / stats.total) < 0.7
      }))
      .filter(s => s.total >= 1)
      .sort((a, b) => a.accuracy - b.accuracy);

    return {
      weakSpecialties: specialtyStats.filter(s => s.needsImprovement),
      allSpecialties: specialtyStats,
      totalStudied: specialtyStats.length,
      averageAccuracy: specialtyStats.length > 0 
        ? specialtyStats.reduce((sum, s) => sum + s.accuracy, 0) / specialtyStats.length 
        : 0
    };
  };

  const analysis = analyzePerformance();

  useEffect(() => {
    // Se veio de uma especialidade específica
    if (location.state?.specialty) {
      setSelectedSpecialty(location.state.specialty);
      setShowAnalysis(false);
    } else if (analysis.weakSpecialties.length > 0) {
      setSelectedSpecialty(analysis.weakSpecialties[0].name);
    }
  }, []);

  const getWeakTopics = (specialty: string): string[] => {
    const stats = progress.specialties[specialty];
    if (!stats || stats.total === 0) {
      return ['Conceitos fundamentais', 'Diagnóstico', 'Conduta terapêutica'];
    }

    const accuracy = (stats.correct / stats.total) * 100;
    
    if (accuracy < 50) {
      return [
        'Conceitos fundamentais e definições',
        'Fisiopatologia básica',
        'Quadro clínico típico',
        'Principais diagnósticos diferenciais',
        'Abordagem inicial e tratamento'
      ];
    } else if (accuracy < 70) {
      return [
        'Diagnóstico diferencial avançado',
        'Exames complementares e interpretação',
        'Conduta terapêutica atualizada',
        'Complicações e manejo',
        'Casos clínicos práticos'
      ];
    } else {
      return [
        'Casos atípicos e complexos',
        'Atualizações em guidelines recentes',
        'Evidências científicas atuais',
        'Situações de emergência'
      ];
    }
  };

  const handleGenerateMaterial = async () => {
    if (!selectedSpecialty) {
      addNotification('Selecione uma especialidade', 'warning');
      return;
    }

    setGenerating(true);
    setLoading(true);
    addNotification('🤖 Analisando seu desempenho e gerando conteúdo personalizado...', 'info');

    try {
      const topics = getWeakTopics(selectedSpecialty);
      const stats = progress.specialties[selectedSpecialty];
      const accuracy = stats ? (stats.correct / stats.total) * 100 : 0;
      
      addNotification(`Identificados ${topics.length} tópicos prioritários para ${selectedSpecialty}`, 'info');
      
      const generatedMaterial = await generateStudyMaterial(selectedSpecialty, topics);
      
      setMaterial(generatedMaterial);
      setExpandedSections(new Set([0])); // Expandir primeira seção
      setShowAnalysis(false);
      addNotification(`✅ Material personalizado gerado! Foco em áreas com ${accuracy.toFixed(0)}% de aproveitamento.`, 'success');
    } catch (error) {
      console.error('Erro ao gerar material:', error);
      addNotification('Erro ao gerar material de estudo. Tente novamente.', 'error');
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const getSpecialtyStats = (specialty: string) => {
    const stats = progress.specialties[specialty];
    if (!stats || stats.total === 0) return null;

    const accuracy = Math.round((stats.correct / stats.total) * 100);
    return { accuracy, total: stats.total, correct: stats.correct };
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <BookOpen className="text-orange-600" />
            Material de Estudo
          </h1>
          <p className="text-xl text-gray-600">
            Conteúdo personalizado baseado na análise do seu desempenho
          </p>
        </div>

        {/* Análise Geral de Desempenho */}
        {analysis.totalStudied > 0 && showAnalysis && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl p-8 text-white mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingDown className="w-7 h-7" />
              Análise Inteligente de Desempenho
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold mb-1">{analysis.totalStudied}</div>
                <div className="text-sm text-orange-100">Especialidades estudadas</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold mb-1">{Math.round(analysis.averageAccuracy)}%</div>
                <div className="text-sm text-orange-100">Taxa média de acerto</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold mb-1">{analysis.weakSpecialties.length}</div>
                <div className="text-sm text-orange-100">Áreas para reforçar</div>
              </div>
            </div>
            {analysis.weakSpecialties.length > 0 && (
              <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Prioridade de Estudo:
                </p>
                <p className="text-orange-100">
                  {analysis.weakSpecialties.slice(0, 3).map(s => s.name).join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Análise de Desempenho por Especialidade */}
        {Object.keys(progress.specialties).length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-t-4 border-orange-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              Suas Especialidades
            </h2>
            <p className="text-gray-600 mb-6">
              Clique em uma especialidade para gerar material personalizado
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(progress.specialties)
                .filter(([, stats]) => stats.total > 0)
                .sort((a, b) => {
                  const accA = (a[1].correct / a[1].total) * 100;
                  const accB = (b[1].correct / b[1].total) * 100;
                  return accA - accB;
                })
                .map(([name, stats]) => {
                  const accuracy = Math.round((stats.correct / stats.total) * 100);
                  const isWeak = accuracy < 70;
                  
                  return (
                    <button
                      key={name}
                      onClick={() => setSelectedSpecialty(name)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedSpecialty === name
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{name}</h3>
                        {isWeak && (
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className={`font-semibold ${
                          accuracy >= 70 ? 'text-green-600' :
                          accuracy >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {accuracy}%
                        </div>
                        <div className="text-gray-500">
                          ({stats.correct}/{stats.total})
                        </div>
                      </div>
                      {isWeak && (
                        <p className="text-xs text-orange-600 mt-1">
                          Recomendado para estudo
                        </p>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* Seletor de Especialidade */}
        {Object.keys(progress.specialties).length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Escolha uma Especialidade</h2>
            <p className="text-gray-600 mb-6">
              Selecione a especialidade que você deseja estudar
            </p>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full max-w-md p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Selecione...</option>
              <option value="Cardiologia">Cardiologia</option>
              <option value="Pediatria">Pediatria</option>
              <option value="Cirurgia Geral">Cirurgia Geral</option>
              <option value="Clínica Médica">Clínica Médica</option>
              <option value="Ginecologia e Obstetrícia">Ginecologia e Obstetrícia</option>
              <option value="Neurologia">Neurologia</option>
              <option value="Ortopedia">Ortopedia</option>
              <option value="Dermatologia">Dermatologia</option>
              <option value="Psiquiatria">Psiquiatria</option>
              <option value="Infectologia">Infectologia</option>
            </select>
          </div>
        )}

        {/* Botão de Gerar Material */}
        {selectedSpecialty && !material && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Sparkles className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Gerar Material Personalizado
            </h2>
            <p className="text-gray-600 mb-6">
              Vamos criar um material de estudo completo sobre {selectedSpecialty},
              focado nos tópicos que você precisa reforçar
            </p>
            
            {getSpecialtyStats(selectedSpecialty) && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <p className="text-sm text-orange-800">
                  <strong>Seu desempenho atual:</strong> {getSpecialtyStats(selectedSpecialty)!.accuracy}% de acertos
                  ({getSpecialtyStats(selectedSpecialty)!.correct}/{getSpecialtyStats(selectedSpecialty)!.total} questões)
                </p>
              </div>
            )}

            <button
              onClick={handleGenerateMaterial}
              disabled={generating}
              className="btn-primary"
            >
              {generating ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Gerando material...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gerar Material de Estudo
                </>
              )}
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && !material && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Loader className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Criando seu material personalizado...
            </h2>
            <p className="text-gray-600">
              Estamos analisando seu desempenho e gerando conteúdo específico para suas necessidades.
            </p>
          </div>
        )}

        {/* Material Gerado */}
        {material && !loading && (
          <div className="space-y-6">
            {/* Header do Material */}
            <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl shadow-lg p-8 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-8 h-8" />
                    <span className="text-orange-100 font-semibold">{selectedSpecialty}</span>
                  </div>
                  <h1 className="text-3xl font-bold mb-3">{material.title}</h1>
                  <p className="text-orange-100 text-lg">{material.introduction}</p>
                </div>
              </div>
            </div>

            {/* Seções do Material */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {material.sections.map((section, index) => (
                <div key={index} className="border-b border-gray-200 last:border-0">
                  <button
                    onClick={() => toggleSection(index)}
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                        {index + 1}
                      </span>
                      {section.title}
                    </h3>
                    {expandedSections.has(index) ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </button>

                  {expandedSections.has(index) && (
                    <div className="px-6 pb-6">
                      {/* Conteúdo */}
                      <div className="prose max-w-none mb-6">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {section.content}
                        </p>
                      </div>

                      {/* Pontos-Chave */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-bold text-blue-900 mb-3 flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Pontos-Chave
                        </h4>
                        <ul className="space-y-2">
                          {section.keyPoints.map((point, pointIdx) => (
                            <li key={pointIdx} className="flex items-start">
                              <span className="text-blue-600 mr-2">•</span>
                              <span className="text-blue-800 text-sm">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Resumo Final */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Sparkles className="w-6 h-6 mr-2 text-orange-500" />
                Resumo Integrador
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">{material.summary}</p>

              {/* Referências */}
              {material.references && material.references.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-gray-900 mb-3">Referências</h3>
                  <ul className="space-y-2">
                    {material.references.map((ref, idx) => (
                      <li key={idx} className="text-sm text-gray-600">
                        {idx + 1}. {ref}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setMaterial(null);
                  setSelectedSpecialty('');
                }}
                className="btn-secondary flex-1"
              >
                Escolher Outra Especialidade
              </button>
              <button
                onClick={handleGenerateMaterial}
                disabled={generating}
                className="btn-primary flex-1"
              >
                {generating ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  'Gerar Novo Material'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EstudosPage;
