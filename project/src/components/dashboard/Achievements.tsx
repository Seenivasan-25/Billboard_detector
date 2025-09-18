import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const Achievements: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🏆 Your Achievements
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {user.achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
              achievement.unlocked
                ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md'
                : 'border-gray-200 bg-gray-50 opacity-60'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`text-3xl ${achievement.unlocked ? 'animate-pulse' : 'grayscale'}`}>
                {achievement.icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${
                  achievement.unlocked ? 'text-gray-800' : 'text-gray-500'
                }`}>
                  {achievement.title}
                </h3>
                <p className={`text-sm ${
                  achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {achievement.description}
                </p>
                {achievement.unlocked && achievement.unlockedAt && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            {achievement.unlocked && (
              <div className="absolute top-2 right-2">
                <div className="bg-yellow-400 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
                  EARNED
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
          <span className="text-purple-700 font-medium">
            {user.achievements.filter(a => a.unlocked).length} of {user.achievements.length} unlocked
          </span>
        </div>
      </div>
    </div>
  );
};