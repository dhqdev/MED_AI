import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, CheckCircle, Target, BookOpen, TrendingUp, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-20 pb-32 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Treine Medicina com <span className="gradient-text">IA</span>
                <br />
                como se estivesse na <span className="gradient-text">banca examinadora</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Domine os concursos médicos com questões adaptativas, correção inteligente e trilhas
                de estudo personalizadas. A tecnologia que se adapta ao seu ritmo de aprendizagem.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/cadastro" className="btn-primary text-center">
                  Começar Agora
                </Link>
                <Link to="/login" className="btn-secondary text-center">
                  Entrar
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="animate-float">
                <img
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=600&fit=crop&crop=center"
                  alt="Estudante de Medicina"
                  className="rounded-2xl shadow-2xl w-full max-w-lg mx-auto"
                />
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500 w-6 h-6" />
                  <span className="text-sm font-semibold">IA Adaptativa</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="text-blue-500 w-6 h-6" />
                  <span className="text-sm font-semibold">Progresso Real</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Método Revolucionário</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa plataforma combina inteligência artificial avançada com metodologias comprovadas
              para maximizar seu desempenho nos concursos médicos.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Brain className="w-8 h-8 text-white" />}
              iconBg="bg-blue-light"
              title="IA Cria Questões Reais"
              description="Questões geradas baseadas em casos clínicos reais, seguindo padrões das principais bancas examinadoras do país."
            />
            <FeatureCard
              icon={<CheckCircle className="w-8 h-8 text-white" />}
              iconBg="bg-green-500"
              title="Corrige Suas Respostas"
              description="Análise detalhada com feedback personalizado, identificando pontos fortes e áreas que precisam de atenção."
            />
            <FeatureCard
              icon={<Target className="w-8 h-8 text-white" />}
              iconBg="bg-purple-500"
              title="Te Ensina Suas Falhas"
              description="Explicações completas sobre erros com recomendações de estudo específicas para cada lacuna identificada."
            />
            <FeatureCard
              icon={<BookOpen className="w-8 h-8 text-white" />}
              iconBg="bg-orange-500"
              title="Cria Trilhas de Estudo"
              description="Rotas de aprendizagem personalizadas baseadas em seu desempenho e metas específicas de concurso."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Como Funciona?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Quatro passos simples para transformar sua preparação e alcançar excelência médica.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard
              number="1"
              title="Escolha seu Tema"
              description="Selecione a especialidade, nível de dificuldade e tipo de questão que deseja praticar."
            />
            <StepCard
              number="2"
              title="Responda a Questão"
              description="Questões dissertativas ou objetivas com casos clínicos reais e imagens quando necessário."
            />
            <StepCard
              number="3"
              title="Receba Correção"
              description="Análise detalhada com feedback personalizado e explicações completas."
            />
            <StepCard
              number="4"
              title="Evolua Constantemente"
              description="O sistema adapta a dificuldade e cria trilhas personalizadas baseadas em seu progresso."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-med text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">10,000+</div>
              <div className="text-xl opacity-90">Questões Geradas</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">95%</div>
              <div className="text-xl opacity-90">Taxa de Satisfação</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">2,500+</div>
              <div className="text-xl opacity-90">Alunos Aprovados</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Pronto para Transformar sua Preparação?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Junte-se a milhares de estudantes que já estão usando a IA para alcançar seus objetivos.
          </p>
          <Link to="/cadastro" className="btn-primary inline-flex items-center">
            Começar Gratuitamente
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, iconBg, title, description }) => {
  return (
    <div className="card-hover bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className={`w-16 h-16 ${iconBg} rounded-xl flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

const StepCard: React.FC<StepCardProps> = ({ number, title, description }) => {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-med to-blue-light rounded-full flex items-center justify-center text-white font-bold text-xl">
          {number}
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

export default LandingPage;
