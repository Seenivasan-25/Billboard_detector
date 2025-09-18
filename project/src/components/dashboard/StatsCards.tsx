import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Target, Shield, TrendingUp } from 'lucide-react';

export const StatsCards: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const stats = [
    {
      title: 'Total Points',
      value: user.points.toLocaleString(),
      icon: Trophy,
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Reports Submitted',
      value: user.reports,
      icon: Target,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Current Level',
      value: user.level,
      icon: Shield,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'This Month',
      value: '8',
      icon: TrendingUp,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};