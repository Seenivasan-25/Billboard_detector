import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const mockAchievements = [
  { id: '1', title: 'First Report', description: 'Submit your first billboard report', icon: '📸', unlocked: false },
  { id: '2', title: 'Community Guardian', description: 'Submit 10 reports', icon: '🛡️', unlocked: false },
  { id: '3', title: 'Billboard Hunter', description: 'Find 5 violations', icon: '🎯', unlocked: false },
  { id: '4', title: 'City Hero', description: 'Reach 1000 points', icon: '🏆', unlocked: false },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in real app, this would call an API
    const mockUser: User = {
      id: '1',
      email,
      name: 'Billboard Reporter',
      points: 1250,
      level: 3,
      reports: 15,
      joinDate: '2024-01-15',
      achievements: mockAchievements.map((a, i) => ({ ...a, unlocked: i < 2 })),
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    return true;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      points: 0,
      level: 1,
      reports: 0,
      joinDate: new Date().toISOString(),
      achievements: mockAchievements,
    };
    
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};