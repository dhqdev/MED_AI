import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, HelpCircle, Menu, X, BookOpen, User, LogOut, Sparkles, History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/historico-questoes', icon: History, label: 'Histórico de Questões' },
    { path: '/estudos', icon: BookOpen, label: 'Material de Estudo' },
    { path: '/perfil', icon: User, label: 'Meu Perfil' },
  ];

  return (
    <>
      {/* Menu Modal - Design Premium */}
      {showMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay com blur sofisticado */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 backdrop-blur-md animate-fade-in"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Modal Content Premium */}
          <div className="absolute bottom-0 left-0 right-0 animate-slide-up-smooth">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-white/30 rounded-full" />
            </div>
            
            <div className="bg-gradient-to-br from-white via-white to-gray-50 rounded-t-[32px] shadow-2xl p-6 pb-8">
              {/* Header com gradiente */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Menu</h3>
                    <p className="text-xs text-gray-500">Navegação rápida</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all shadow-sm"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              {/* Menu Items com design premium */}
              <div className="space-y-2 mb-4">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  const colors = [
                    { bg: 'bg-indigo-500', gradient: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-600' },
                    { bg: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50', text: 'text-blue-600' },
                    { bg: 'bg-purple-500', gradient: 'from-purple-500 to-purple-600', light: 'bg-purple-50', text: 'text-purple-600' }
                  ];
                  const color = colors[index % colors.length];
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowMenu(false)}
                      className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                        isActive(item.path)
                          ? `${color.light} ${color.text} shadow-md scale-[1.02]`
                          : 'hover:bg-gray-50 text-gray-700 active:scale-[0.98] hover:shadow-sm'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive(item.path) 
                          ? `bg-gradient-to-br ${color.gradient} shadow-lg shadow-${color.bg}/30`
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      }`}>
                        <Icon 
                          size={22} 
                          strokeWidth={2.5}
                          className={isActive(item.path) ? 'text-white' : 'text-gray-600'}
                        />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-base block">{item.label}</span>
                        <span className="text-xs text-gray-500">
                          {index === 0 ? 'Revise suas questões' : index === 1 ? 'Conteúdos e materiais' : 'Configurações e dados'}
                        </span>
                      </div>
                      <div className={`w-2 h-2 rounded-full transition-all ${
                        isActive(item.path) ? color.bg : 'bg-transparent'
                      }`} />
                    </Link>
                  );
                })}
              </div>

              {/* Separator elegante */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-xs text-gray-500 font-medium">Conta</span>
                </div>
              </div>

              {/* Botão de Logout premium */}
              <button
                onClick={() => {
                  logout();
                  setShowMenu(false);
                }}
                className="w-full group flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 text-red-600 transition-all active:scale-[0.98] hover:shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-100 group-hover:bg-red-200 transition-all">
                  <LogOut size={22} strokeWidth={2.5} />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-bold text-base block">Sair</span>
                  <span className="text-xs text-red-400">Encerrar sessão</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar - Design Ultra Premium */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden z-40 safe-area-bottom">
        {/* Background com blur e gradiente */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50" />
        
        <div className="relative flex items-center justify-around px-6 py-3">
          {/* Início */}
          <Link
            to="/dashboard"
            className="relative flex flex-col items-center gap-1 min-w-[70px] group"
          >
            <div className={`relative transition-all duration-300 ${
              isActive('/dashboard') ? 'scale-110' : 'group-active:scale-95'
            }`}>
              {/* Background glow quando ativo */}
              {isActive('/dashboard') && (
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-150" />
              )}
              
              {/* Ícone com container */}
              <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isActive('/dashboard')
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/40'
                  : 'bg-gray-100 group-hover:bg-gray-200'
              }`}>
                <Home 
                  size={26} 
                  strokeWidth={2.5}
                  className={`transition-colors ${
                    isActive('/dashboard') ? 'text-white' : 'text-gray-600'
                  }`}
                />
              </div>
            </div>
            <span className={`text-[10px] font-bold tracking-tight transition-colors ${
              isActive('/dashboard') ? 'text-blue-600' : 'text-gray-500'
            }`}>
              Início
            </span>
            {/* Indicator dot */}
            {isActive('/dashboard') && (
              <div className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full animate-pulse" />
            )}
          </Link>

          {/* Questões */}
          <Link
            to="/questoes"
            className="relative flex flex-col items-center gap-1 min-w-[70px] group"
          >
            <div className={`relative transition-all duration-300 ${
              isActive('/questoes') ? 'scale-110' : 'group-active:scale-95'
            }`}>
              {isActive('/questoes') && (
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full scale-150" />
              )}
              
              <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isActive('/questoes')
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/40'
                  : 'bg-gray-100 group-hover:bg-gray-200'
              }`}>
                <HelpCircle 
                  size={26} 
                  strokeWidth={2.5}
                  className={`transition-colors ${
                    isActive('/questoes') ? 'text-white' : 'text-gray-600'
                  }`}
                />
              </div>
            </div>
            <span className={`text-[10px] font-bold tracking-tight transition-colors ${
              isActive('/questoes') ? 'text-purple-600' : 'text-gray-500'
            }`}>
              Questões
            </span>
            {isActive('/questoes') && (
              <div className="absolute -bottom-1 w-1 h-1 bg-purple-600 rounded-full animate-pulse" />
            )}
          </Link>

          {/* Menu */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="relative flex flex-col items-center gap-1 min-w-[70px] group"
          >
            <div className={`relative transition-all duration-300 ${
              showMenu ? 'scale-110 rotate-90' : 'group-active:scale-95'
            }`}>
              {showMenu && (
                <div className="absolute inset-0 bg-gray-500/20 blur-xl rounded-full scale-150" />
              )}
              
              <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                showMenu
                  ? 'bg-gradient-to-br from-gray-700 to-gray-800 shadow-lg shadow-gray-500/40'
                  : 'bg-gray-100 group-hover:bg-gray-200'
              }`}>
                <Menu 
                  size={26} 
                  strokeWidth={2.5}
                  className={`transition-all duration-300 ${
                    showMenu ? 'text-white rotate-180' : 'text-gray-600'
                  }`}
                />
              </div>
            </div>
            <span className={`text-[10px] font-bold tracking-tight transition-colors ${
              showMenu ? 'text-gray-800' : 'text-gray-500'
            }`}>
              Menu
            </span>
            {showMenu && (
              <div className="absolute -bottom-1 w-1 h-1 bg-gray-800 rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </nav>

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

        .safe-area-bottom {
          padding-bottom: max(env(safe-area-inset-bottom), 0.5rem);
        }
        
        /* Smooth transitions para todos os elementos */
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </>
  );
};

export default BottomNav;
