import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { Dashboard } from './components/dashboard/Dashboard';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (user) {
    return <Dashboard />;
  }

  return isLogin ? (
    <LoginPage onSwitchToSignup={() => setIsLogin(false)} />
  ) : (
    <SignupPage onSwitchToLogin={() => setIsLogin(true)} />
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;