import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, Target, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  
  const { login } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const firstLogin = await login(email, password);
      setIsFirstLogin(firstLogin || false);
      addNotification('Login realizado com sucesso!', 'success');
      setShowWelcomeModal(true);
    } catch (error) {
      addNotification('Erro ao fazer login. Verifique suas credenciais.', 'error');
      setLoading(false);
    }
  };
  
  const handleCloseModal = () => {
    setShowWelcomeModal(false);
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Content */}
            <div className="hidden lg:block">
              <div className="animate-float">
                <img
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=600&fit=crop&crop=center"
                  alt="Estudante de Medicina"
                  className="rounded-2xl shadow-2xl w-full"
                />
              </div>
              <div className="mt-8 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Bem-vindo de volta!</h2>
                <p className="text-lg text-gray-600">
                  Continue sua jornada rumo à excelência médica com nossa plataforma adaptativa.
                </p>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="card-hover bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Entrar na Plataforma</h1>
                <p className="text-gray-600">Acesse sua conta e continue estudando</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-2 text-blue-med" />
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-med focus:border-transparent transition-all"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    <Lock className="inline w-4 h-4 mr-2 text-blue-med" />
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-med focus:border-transparent transition-all"
                      placeholder="Digite sua senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-med focus:ring-blue-med"
                    />
                    <span className="ml-2 text-sm text-gray-600">Lembrar-me</span>
                  </label>
                  <a href="#" className="text-sm text-blue-med hover:text-blue-light transition-colors">
                    Esqueceu sua senha?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Não tem uma conta?{' '}
                  <Link to="/cadastro" className="text-blue-med hover:text-blue-light font-semibold">
                    Criar conta
                  </Link>
                </p>
              </div>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Ou continue com</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Google</span>
                  </button>
                  <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <img src="https://www.facebook.com/favicon.ico" alt="Facebook" className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Facebook</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de Boas-vindas */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {isFirstLogin ? '🎉 Bem-vindo ao MedMaster!' : '👋 Bem-vindo de volta!'}
                </h2>
                <p className="text-gray-600 text-lg">
                  {isFirstLogin 
                    ? 'Sua jornada rumo à excelência médica começa agora!' 
                    : 'Continue sua jornada de aprendizado onde você parou!'}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Questões Personalizadas</h3>
                    <p className="text-sm text-gray-600">
                      A IA cria questões adaptadas ao seu nível e especialidades favoritas
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Análise de Performance</h3>
                    <p className="text-sm text-gray-600">
                      Acompanhe seu progresso em tempo real com estatísticas detalhadas
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Sugestões Inteligentes</h3>
                    <p className="text-sm text-gray-600">
                      Receba recomendações personalizadas de tópicos para estudar
                    </p>
                  </div>
                </div>
              </div>

              {isFirstLogin && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                    Dica Inicial
                  </h3>
                  <p className="text-gray-700 text-sm mb-2">
                    Configure suas preferências no <strong>Perfil</strong> para personalizar completamente sua experiência de estudo!
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Escolha suas especialidades favoritas</li>
                    <li>• Defina metas diárias e semanais</li>
                    <li>• Ajuste o nível de dificuldade</li>
                  </ul>
                </div>
              )}

              <button
                onClick={handleCloseModal}
                className="w-full btn-primary text-lg py-4"
              >
                {isFirstLogin ? 'Começar a Estudar! 🚀' : 'Continuar Estudando! 📚'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
