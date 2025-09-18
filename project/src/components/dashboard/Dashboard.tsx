import React from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { TabContent } from './TabContent';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main>
        <TabContent activeTab={activeTab} />
      </main>
      {/* Motivational Footer */}
      <footer className="bg-white/80 backdrop-blur-lg border-t border-gray-200/50 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-2xl">🌟</span>
            <h3 className="text-lg font-semibold text-gray-800">
              Together, we're making our city more beautiful!
            </h3>
            <span className="text-2xl">🌟</span>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Every report you submit helps create cleaner, more organized public spaces. 
            Your community thanks you for being a guardian of urban beauty.
          </p>
        </div>
      </footer>
    </div>
  );
};