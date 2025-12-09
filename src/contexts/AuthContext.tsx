import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface QuestionHistoryItem {
  id: string;
  question: string;
  answer: string;
  correct: boolean;
  specialty: string;
  type: 'objetiva' | 'dissertativa';
  timestamp: string;
  score?: number;
  difficulty?: string;
}

export interface StudySession {
  id: string;
  specialty: string;
  difficulty: string;
  mode: 'objetiva' | 'dissertativa';
  questionsCompleted: number;
  questionsTotal: number;
  startedAt: string;
  lastUpdated: string;
  isActive: boolean;
}

export interface UserGoals {
  dailyQuestions: number;
  weeklyQuestions: number;
  targetSpecialties: string[];
  targetLevel: string;
}

export interface UserPreferences {
  favoriteSpecialties: string[];
  preferredDifficulty: string;
  studyReminders: boolean;
  notificationsEnabled: boolean;
}

export interface SuggestedTopic {
  specialty: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  accuracy: number;
}

export interface UserProgress {
  totalQuestions: number;
  correctAnswers: number;
  streakDays: number;
  level: number;
  experience: number;
  specialties: Record<string, { total: number; correct: number; lastStudied?: string }>;
  achievements: string[];
  studyTime: number;
  lastActivity: string;
  questionHistory: QuestionHistoryItem[];
  currentSession: StudySession | null;
  goals: UserGoals;
  preferences: UserPreferences;
  suggestedTopics: SuggestedTopic[];
  lastLoginDate: string;
}

interface AuthContextType {
  user: User | null;
  progress: UserProgress;
  login: (email: string, password: string) => Promise<boolean>;
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
    totalQuestions: 0,
    correctAnswers: 0,
    streakDays: 0,
    level: 1,
    experience: 0,
    specialties: {},
    achievements: [],
    studyTime: 0,
    lastActivity: new Date().toISOString(),
    questionHistory: [],
    currentSession: null,
    goals: {
      dailyQuestions: 10,
      weeklyQuestions: 50,
      targetSpecialties: [],
      targetLevel: 'intermediário',
    },
    preferences: {
      favoriteSpecialties: [],
      preferredDifficulty: 'medium',
      studyReminders: true,
      notificationsEnabled: true,
    },
    suggestedTopics: [],
    lastLoginDate: new Date().toISOString(),
  });

  useEffect(() => {
    // Carregar usuário do localStorage
    const savedUser = localStorage.getItem('medmaster_user');
    const savedProgress = localStorage.getItem('medmaster_progress');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    if (savedProgress) {
      const parsedProgress = JSON.parse(savedProgress);
      
      // Migração de dados: garantir que goals e preferences existam
      const migratedProgress = {
        ...parsedProgress,
        goals: parsedProgress.goals || {
          dailyQuestions: 10,
          weeklyQuestions: 50,
          targetSpecialties: [],
          targetLevel: 'intermediário',
        },
        preferences: parsedProgress.preferences || {
          favoriteSpecialties: [],
          preferredDifficulty: 'medium',
          studyReminders: true,
          notificationsEnabled: true,
        },
        suggestedTopics: parsedProgress.suggestedTopics || [],
        currentSession: parsedProgress.currentSession || null,
      };
      
      setProgress(migratedProgress);
      
      // Calcular streak ao carregar
      const lastLogin = new Date(migratedProgress.lastLoginDate || new Date());
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      lastLogin.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Login consecutivo
        updateProgress({ 
          streakDays: migratedProgress.streakDays + 1,
          lastLoginDate: new Date().toISOString()
        });
      } else if (daysDiff > 1) {
        // Quebrou o streak
        updateProgress({ 
          streakDays: 1,
          lastLoginDate: new Date().toISOString()
        });
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Login mockado simples - credenciais fixas
    if (email === 'demo@medmaster.com' && password === 'demo123') {
      const mockUser: User = {
        id: '1',
        name: 'Dr. Usuário Demo',
        email: email,
        avatar: undefined,
      };
      
      setUser(mockUser);
      localStorage.setItem('medmaster_user', JSON.stringify(mockUser));
      
      // Retornar true para indicar primeiro login se necessário
      const savedProgress = localStorage.getItem('medmaster_progress');
      return !savedProgress || JSON.parse(savedProgress).totalQuestions === 0;
    } else {
      throw new Error('Credenciais inválidas. Use: demo@medmaster.com / demo123');
    }
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
