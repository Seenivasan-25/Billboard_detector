import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Trophy, Star, Target } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const levelProgress = ((user.points % 500) / 500) * 100;

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">🏢</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Billboard Monitor
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* User Stats */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 rounded-full">
                <Trophy className="w-4 h-4 text-white" />
                <span className="text-white font-semibold text-sm">{user.points}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-600">Level {user.level}</div>
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${levelProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-700">{user.name}</div>
                <div className="text-xs text-gray-500">{user.reports} reports</div>
              </div>
              
              <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};