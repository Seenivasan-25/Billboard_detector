import React, { useState } from 'react';
import { Home, Search, Map, Building, Monitor, Gamepad2 } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'detection', label: 'Detection', icon: Search },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'brand', label: 'Brand', icon: Building },
    { id: 'monitoring', label: 'Monitoring', icon: Monitor },
    { id: 'game', label: 'Game', icon: Gamepad2 },
    // Added Prediction tab (no icon)
    { id: 'prediction', label: 'Prediction', icon: null }
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="flex space-x-1 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ease-in-out
                    flex items-center space-x-2 min-w-[120px] justify-center
                    transform hover:scale-105 hover:-translate-y-1
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                    }
                  `}
                >
                  {/* Animated background for hover effect */}
                  <div className={`
                    absolute inset-0 rounded-xl transition-all duration-300 ease-in-out
                    ${!isActive ? 'bg-gradient-to-r from-blue-500/0 to-purple-600/0 hover:from-blue-500/10 hover:to-purple-600/10' : ''}
                  `} />

                  {/* Glowing border effect on hover */}
                  <div className={`
                    absolute inset-0 rounded-xl transition-all duration-300 ease-in-out
                    ${!isActive ? 'border-2 border-transparent hover:border-blue-200/50 hover:shadow-md' : ''}
                  `} />

                  {/* Icon */}
                  {Icon && (
                    <Icon className={`
                      w-4 h-4 transition-all duration-300 ease-in-out relative z-10
                      ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-500'}
                    `} />
                  )}

                  {/* Label */}
                  <span className="relative z-10 font-semibold">{tab.label}</span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}

                  {/* Hover glow effect */}
                  <div className={`
                    absolute inset-0 rounded-xl transition-all duration-300 ease-in-out opacity-0
                    ${!isActive ? 'hover:opacity-100 hover:shadow-lg hover:shadow-blue-500/20' : ''}
                  `} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Animated underline */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 transition-transform duration-300 ease-in-out" />
    </nav>
  );
};
