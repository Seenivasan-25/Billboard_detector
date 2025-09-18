import React from 'react';
import { Crown, Medal, Award } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, name: 'Sarah Chen', points: 2450, reports: 32 },
    { rank: 2, name: 'Mike Johnson', points: 2180, reports: 28 },
    { rank: 3, name: 'Emma Wilson', points: 1950, reports: 25 },
    { rank: 4, name: 'Alex Rodriguez', points: 1720, reports: 22 },
    { rank: 5, name: 'You', points: 1250, reports: 15 },
    { rank: 6, name: 'Lisa Brown', points: 980, reports: 12 },
    { rank: 7, name: 'David Lee', points: 850, reports: 11 },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">#{rank}</div>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🏆 Community Leaderboard
        </h2>
        <p className="text-gray-600">Top contributors this month</p>
      </div>

      <div className="space-y-3">
        {leaderboard.map((user) => (
          <div
            key={user.rank}
            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
              user.name === 'You' 
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 ring-2 ring-blue-300' 
                : getRankColor(user.rank)
            }`}
          >
            <div className="flex items-center space-x-4">
              {getRankIcon(user.rank)}
              <div>
                <div className={`font-semibold ${
                  user.name === 'You' ? 'text-blue-800' : 'text-gray-800'
                }`}>
                  {user.name}
                  {user.name === 'You' && (
                    <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      YOU
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {user.reports} reports submitted
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-xl font-bold ${
                user.name === 'You' ? 'text-blue-700' : 'text-gray-800'
              }`}>
                {user.points.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">points</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200">
          View Full Leaderboard
        </button>
      </div>
    </div>
  );
};