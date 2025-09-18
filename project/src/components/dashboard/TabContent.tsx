import React from 'react';
import ImageUpload from './ImageUpload';
import { Achievements } from './Achievements';
import { Leaderboard } from './Leaderboard';
import { StatsCards } from './StatsCards';
import Billboard from './Billboard';
import Prediction from './Prediction';


import { MapPin, Building, Monitor, Gamepad2, Search } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

// ✅ Reuse leaderboard data from your Leaderboard component
const leaderboard = [
  { rank: 1, name: 'Sarah Chen', points: 2450, reports: 32 },
  { rank: 2, name: 'Mike Johnson', points: 2180, reports: 28 },
  { rank: 3, name: 'Emma Wilson', points: 1950, reports: 25 },
  { rank: 4, name: 'Alex Rodriguez', points: 1720, reports: 22 },
  { rank: 5, name: 'You', points: 1250, reports: 15 },
  { rank: 6, name: 'Lisa Brown', points: 980, reports: 12 },
  { rank: 7, name: 'David Lee', points: 850, reports: 11 },
];

interface TabContentProps {
  activeTab: string;
}

export const TabContent: React.FC<TabContentProps> = ({ activeTab }) => {
  const renderHeader = (Icon: any, title: string, desc: string, color: string) => (
    <div className="text-center py-10">
      <Icon className={`w-16 h-16 ${color} mx-auto mb-4`} />
      <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
      <p className="text-gray-600 max-w-2xl mx-auto">{desc}</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-12">
            <StatsCards />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 📊 Overview container with Graph */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  📊 Leaderboard Points Overview
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={leaderboard}
                    margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip contentStyle={{ borderRadius: '8px', background: '#fff' }} />
                    <Bar dataKey="points" fill="url(#colorPoints)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 🏅 Achievements */}
              <div>
                <Achievements />
              </div>
            </div>

            {/* 🏆 Leaderboard List */}
            <Leaderboard />
          </div>
        );

      case 'detection':
        return (
          <div className="space-y-12">
            {renderHeader(
              Search,
              'Billboard Detection',
              'Advanced AI-powered billboard detection and analysis system. Upload images to detect violations and compliance issues.',
              'text-blue-500'
            )}
            <ImageUpload />
          </div>
        );

      case 'map':
        return (
          <div className="space-y-12">
            {renderHeader(
              MapPin,
              'Interactive Map',
              'Explore billboard locations, violations, and compliance data on an interactive map.',
              'text-green-500'
            )}
            <Billboard />
          </div>
        );

      case 'brand':
        return (
          <div className="space-y-12">
            {renderHeader(
              Building,
              'Brand Management',
              'Manage and track different brands and their billboard compliance across the city.',
              'text-purple-500'
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {["McDonald's", 'Coca-Cola', 'Nike', 'Apple', 'Samsung', 'Toyota'].map((brand) => (
                <div
                  key={brand}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{brand}</h3>
                      <p className="text-sm text-gray-600">
                        {Math.floor(Math.random() * 50) + 10} billboards
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Compliance Rate</span>
                      <span className="font-semibold text-green-600">
                        {Math.floor(Math.random() * 20) + 80}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                        style={{ width: `${Math.floor(Math.random() * 20) + 80}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'monitoring':
        return (
          <div className="space-y-12">
            {renderHeader(
              Monitor,
              'Billboard Monitoring',
              'Real-time monitoring dashboard for tracking billboard compliance and violations.',
              'text-indigo-500'
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: 'Total Monitored', value: '1,247', color: 'blue' },
                { title: 'Violations Found', value: '89', color: 'red' },
                { title: 'Compliant', value: '1,158', color: 'green' },
                { title: 'Under Review', value: '23', color: 'yellow' },
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center">
                  <div className={`text-3xl font-bold text-${stat.color}-600 mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-sm">{stat.title}</div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">Billboard #{1000 + index}</div>
                        <div className="text-sm text-gray-600">
                          Location: Main Street, Block {index + 1}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        index % 3 === 0
                          ? 'bg-red-100 text-red-800'
                          : index % 3 === 1
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {index % 3 === 0 ? 'Violation' : index % 3 === 1 ? 'Compliant' : 'Review'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'game':
        return (
          <div className="space-y-12">
            {renderHeader(
              Gamepad2,
              'Gamification Hub',
              'Compete with other users, unlock achievements, and climb the leaderboards!',
              'text-pink-500'
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Achievements />
              <Leaderboard />
            </div>
          </div>
        );

      // ✅ Added Prediction tab
      case 'prediction':
        return (
          <div className="space-y-12">
            {renderHeader(
              Building,
              'Prediction Model',
              'Check billboard compliance predictions based on input data.',
              'text-indigo-500'
            )}
            <Prediction />
          </div>
        );

      default:
        return null;

    case 'chatbot':
      return (
        <div className="space-y-12">
          {renderHeader(
            Monitor,
            'AI Chatbot',
            'Interact with our AI-powered chatbot for assistance and information.',   
            'text-indigo-500'   
          )}
        </div>  
      );
    }
  };

  return <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">{renderContent()}</div>;
};
