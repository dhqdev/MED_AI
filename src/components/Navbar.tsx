import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Menu, X, Bell, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLandingPage = location.pathname === '/';

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Brain className="text-blue-med w-8 h-8" />
              <span className="text-xl font-bold text-gray-900">MedMaster AI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isLandingPage && !isAuthenticated && (
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-med transition-colors">
                Recursos
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-med transition-colors">
                Como Funciona
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-med transition-colors">
                Planos
              </a>
              <Link to="/login" className="text-blue-med hover:text-blue-light transition-colors font-medium">
                Entrar
              </Link>
              <Link to="/cadastro" className="bg-blue-med text-white px-6 py-2 rounded-lg hover:bg-blue-light transition-colors">
                Criar Conta
              </Link>
            </div>
          )}

          {/* Authenticated User Menu */}
          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-med rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.substring(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && isLandingPage && !isAuthenticated && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            <a href="#features" className="block text-gray-700 hover:text-blue-med">
              Recursos
            </a>
            <a href="#how-it-works" className="block text-gray-700 hover:text-blue-med">
              Como Funciona
            </a>
            <a href="#pricing" className="block text-gray-700 hover:text-blue-med">
              Planos
            </a>
            <Link to="/login" className="block text-blue-med font-medium">
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className="block bg-blue-med text-white px-6 py-2 rounded-lg text-center"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
