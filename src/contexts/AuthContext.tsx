import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UserProgress {
  totalQuestions: number;
  correctAnswers: number;
  streakDays: number;
  level: number;
  experience: number;
  specialties: Record<string, any>;
  achievements: string[];
  studyTime: number;
  lastActivity: string;
}

interface AuthContextType {
  user: User | null;
  progress: UserProgress;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  updateProgress: (data: Partial<UserProgress>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress>({
    totalQuestions: 247,
    correctAnswers: 210,
    streakDays: 7,
    level: 4.2,
    experience: 3250,
    specialties: {},
    achievements: [],
    studyTime: 8280,
    lastActivity: new Date().toISOString(),
  });

  useEffect(() => {
    // Carregar usuário do localStorage
    const savedUser = localStorage.getItem('medmaster_user');
    const savedProgress = localStorage.getItem('medmaster_progress');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  const login = async (email: string, _password: string) => {
    // Simulação de login - em produção, fazer chamada à API
    const mockUser: User = {
      id: '1',
      name: 'Dr. Demo User',
      email: email,
      avatar: undefined,
    };
    
    setUser(mockUser);
    localStorage.setItem('medmaster_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medmaster_user');
  };

  const register = async (userData: any) => {
    // Simulação de registro - em produção, fazer chamada à API
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
    };
    
    setUser(newUser);
    localStorage.setItem('medmaster_user', JSON.stringify(newUser));
  };

  const updateProgress = (data: Partial<UserProgress>) => {
    const newProgress = { ...progress, ...data };
    setProgress(newProgress);
    localStorage.setItem('medmaster_progress', JSON.stringify(newProgress));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        progress,
        login,
        logout,
        register,
        updateProgress,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
