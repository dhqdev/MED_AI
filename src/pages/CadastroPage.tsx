import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const CadastroPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birthDate: '',
    specialty: '',
    university: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step === 1 && (!formData.name || !formData.email)) {
      addNotification('Preencha todos os campos obrigatórios', 'warning');
      return;
    }
    if (step === 2 && (!formData.password || formData.password !== formData.confirmPassword)) {
      addNotification('As senhas não coincidem', 'error');
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(formData);
      addNotification('Conta criada com sucesso!', 'success');
      navigate('/dashboard');
    } catch (error) {
      addNotification('Erro ao criar conta. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Junte-se a nós!</h2>
                <p className="text-lg text-gray-600">
                  Comece sua jornada rumo à excelência médica com nossa plataforma adaptativa.
                </p>
              </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="card-hover bg-white rounded-2xl shadow-xl p-8">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Etapa {step} de 3</span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-med h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Conta</h1>
                <p className="text-gray-600">Preencha os dados para começar</p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Step 1: Basic Information */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        <User className="inline w-4 h-4 mr-2 text-blue-med" />
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-med focus:border-transparent transition-all"
                        placeholder="Digite seu nome completo"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        <Mail className="inline w-4 h-4 mr-2 text-blue-med" />
                        E-mail
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-med focus:border-transparent transition-all"
                        placeholder="seu@email.com"
                      />
                    </div>

                    <button type="button" onClick={handleNext} className="w-full btn-primary">
                      Continuar
                    </button>
                  </div>
                )}

                {/* Step 2: Password */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                        <Lock className="inline w-4 h-4 mr-2 text-blue-med" />
                        Senha
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
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

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                        <Lock className="inline w-4 h-4 mr-2 text-blue-med" />
                        Confirmar Senha
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-med focus:border-transparent transition-all"
                        placeholder="Confirme sua senha"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className="flex-1 btn-secondary"
                      >
                        Voltar
                      </button>
                      <button type="button" onClick={handleNext} className="flex-1 btn-primary">
                        Continuar
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Additional Info */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="inline w-4 h-4 mr-2 text-blue-med" />
                        Telefone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-med focus:border-transparent transition-all"
                        placeholder="(00) 00000-0000"
                      />
                    </div>

                    <div>
                      <label htmlFor="specialty" className="block text-sm font-semibold text-gray-700 mb-2">
                        Especialidade de Interesse
                      </label>
                      <select
                        id="specialty"
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-med focus:border-transparent transition-all"
                      >
                        <option value="">Selecione uma especialidade</option>
                        <option value="Cardiologia">Cardiologia</option>
                        <option value="Pediatria">Pediatria</option>
                        <option value="Cirurgia Geral">Cirurgia Geral</option>
                        <option value="Clínica Médica">Clínica Médica</option>
                        <option value="Ginecologia">Ginecologia e Obstetrícia</option>
                        <option value="Neurologia">Neurologia</option>
                        <option value="Ortopedia">Ortopedia</option>
                      </select>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className="flex-1 btn-secondary"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Criando conta...' : 'Criar Conta'}
                      </button>
                    </div>
                  </div>
                )}
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Já tem uma conta?{' '}
                  <Link to="/login" className="text-blue-med hover:text-blue-light font-semibold">
                    Fazer login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadastroPage;
