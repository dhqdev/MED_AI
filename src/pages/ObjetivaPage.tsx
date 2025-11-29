import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useNotification } from '../contexts/NotificationContext';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const ObjetivaPage: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  const generateQuestion = () => {
    setLoading(true);
    // Simulação - em produção, chamar API
    setTimeout(() => {
      const mockQuestion: Question = {
        id: 1,
        question:
          'Paciente de 45 anos, sexo masculino, apresenta dor torácica retroesternal há 30 minutos, com irradiação para membro superior esquerdo. ECG mostra supradesnivelamento do segmento ST em V1-V4. Qual a conduta mais adequada?',
        options: [
          'Iniciar trombolítico imediatamente',
          'Solicitar ecocardiograma antes de qualquer conduta',
          'Transferir para cateterismo de urgência',
          'Aguardar resultado de troponina',
          'Administrar AAS e observar evolução',
        ],
        correctAnswer: 2,
        explanation:
          'O paciente apresenta quadro de IAM com supradesnivelamento de ST (IAMCSST) de parede anterior. A conduta gold standard é a angioplastia primária (cateterismo de urgência) quando disponível em até 120 minutos. O tempo porta-balão ideal é inferior a 90 minutos.',
      };
      setCurrentQuestion(mockQuestion);
      setSelectedAnswer(null);
      setShowResult(false);
      setLoading(false);
      addNotification('Questão gerada com sucesso!', 'success');
    }, 1500);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) {
      addNotification('Selecione uma alternativa', 'warning');
      return;
    }
    setShowResult(true);
    if (selectedAnswer === currentQuestion?.correctAnswer) {
      addNotification('Resposta correta!', 'success');
    } else {
      addNotification('Resposta incorreta. Veja a explicação.', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Modo Objetivo</h1>
          <p className="text-xl text-gray-600">
            Questões de múltipla escolha no formato das principais residências médicas
          </p>
        </div>

        {!currentQuestion ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pronto para começar?</h2>
            <p className="text-gray-600 mb-8">
              Clique no botão abaixo para gerar uma questão objetiva personalizada
            </p>
            <button onClick={generateQuestion} disabled={loading} className="btn-primary">
              {loading ? (
                <>
                  <Loader className="inline w-5 h-5 mr-2 animate-spin" />
                  Gerando questão...
                </>
              ) : (
                'Gerar Questão'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Question */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Questão #{currentQuestion.id}</h3>
                <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm">
                  Múltipla Escolha
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">{currentQuestion.question}</p>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctAnswer;
                  const showCorrect = showResult && isCorrect;
                  const showWrong = showResult && isSelected && !isCorrect;

                  return (
                    <button
                      key={index}
                      onClick={() => !showResult && setSelectedAnswer(index)}
                      disabled={showResult}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        showCorrect
                          ? 'border-green-500 bg-green-50'
                          : showWrong
                          ? 'border-red-500 bg-red-50'
                          : isSelected
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              showCorrect
                                ? 'bg-green-500 text-white'
                                : showWrong
                                ? 'bg-red-500 text-white'
                                : isSelected
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="text-gray-800">{option}</span>
                        </div>
                        {showCorrect && <CheckCircle className="w-6 h-6 text-green-500" />}
                        {showWrong && <XCircle className="w-6 h-6 text-red-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              {!showResult && (
                <div className="flex justify-end space-x-4 mt-6">
                  <button onClick={generateQuestion} className="btn-secondary">
                    Nova Questão
                  </button>
                  <button onClick={submitAnswer} className="btn-primary">
                    Confirmar Resposta
                  </button>
                </div>
              )}
            </div>

            {/* Explanation */}
            {showResult && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Explicação</h3>
                <div
                  className={`p-4 rounded-lg mb-4 ${
                    selectedAnswer === currentQuestion.correctAnswer
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <p
                    className={`font-semibold ${
                      selectedAnswer === currentQuestion.correctAnswer ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {selectedAnswer === currentQuestion.correctAnswer
                      ? '✓ Resposta Correta!'
                      : '✗ Resposta Incorreta'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Alternativa correta:{' '}
                    <strong>{String.fromCharCode(65 + currentQuestion.correctAnswer)}</strong>
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed">{currentQuestion.explanation}</p>
                <div className="flex justify-center mt-6">
                  <button onClick={generateQuestion} className="btn-primary">
                    Próxima Questão
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ObjetivaPage;
