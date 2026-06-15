import { useState } from 'react';
import { clearAuth } from '@/lib/api';
import { WelcomePage } from './components/WelcomePage';
import { ParentRegisterPage } from './components/ParentRegisterPage';
import { ParentLoginPage } from './components/ParentLoginPage';
import { ChildLoginPage } from './components/ChildLoginPage';
import { LoginCodeModal } from './components/LoginCodeModal';
import Dashboard from './components/Dashboard';
import { SimpleParentDashboard } from './components/SimpleParentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginPage } from './components/AdminLoginPage';
import { useGlobalClickSound } from './components/useGlobalClickSound';

type Page = 'welcome' | 'register' | 'parentLogin' | 'childLogin' | 'childDashboard' | 'parentDashboard' | 'adminLogin' | 'adminDashboard';

export default function App() {
  useGlobalClickSound(true);

  const [currentPage, setCurrentPage] = useState<Page>('welcome');
  const [childData, setChildData] = useState<any>(null);
  const [parentData, setParentData] = useState<any>(null);
  const [showLoginCodeModal, setShowLoginCodeModal] = useState(false);
  const [newLoginCode, setNewLoginCode] = useState('');
  const [newChildName, setNewChildName] = useState('');

  const handleRoleSelection = (role: 'parent' | 'child' | 'admin') => {
    if (role === 'parent') {
      setCurrentPage('register');
    } else if (role === 'child') {
      setCurrentPage('childLogin');
    } else if (role === 'admin') {
      setCurrentPage('adminLogin');
    }
  };

  const handleParentRegister = (parent: any, child: any, loginCode: string) => {
    setParentData(parent);
    setChildData(child);
    setNewLoginCode(loginCode);
    setNewChildName(child.name);
    setShowLoginCodeModal(true);
  };

  const handleParentLogin = (parent: any) => {
    setParentData(parent);
    setCurrentPage('parentDashboard');
  };

  const handleChildLogin = (child: any) => {
    setChildData(child);
    setCurrentPage('childDashboard');
  };

  const handleLoginCodeModalContinue = () => {
    setShowLoginCodeModal(false);
    setCurrentPage('parentDashboard');
  };

  const handleLoginCodeGoToLogins = () => {
    setShowLoginCodeModal(false);
    setCurrentPage('welcome');
  };

  const handleSignOut = () => {
    clearAuth();
    setChildData(null);
    setParentData(null);
    setCurrentPage('welcome');
  };

  const handleBackToWelcome = () => {
    setCurrentPage('welcome');
  };

  const handleAdminLogin = () => {
    setCurrentPage('adminDashboard');
  };

  // Render Parent Dashboard
  if (currentPage === 'parentDashboard') {
    return (
      <SimpleParentDashboard 
        parentData={parentData}
        onSignOut={handleSignOut}
      />
    );
  }

  // Render Child Dashboard
  if (currentPage === 'childDashboard') {
    return (
      <Dashboard 
        childData={childData}
        onSignOut={handleSignOut}
        showBackButton={false}
      />
    );
  }

  // Render Admin Dashboard
  if (currentPage === 'adminDashboard') {
    return (
      <AdminDashboard
        onSignOut={handleSignOut}
      />
    );
  }

  // Render Auth Pages
  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#4a8bb8] to-[#5ba3d4] p-4 sm:p-6 md:p-8 overflow-y-auto overflow-x-hidden">
        {/* Background decorative clouds */}
        <div className="absolute top-12 sm:top-20 left-4 sm:left-12 w-16 sm:w-20 h-10 sm:h-12 bg-white/10 rounded-full"></div>
        <div className="absolute top-16 sm:top-24 left-12 sm:left-20 w-12 sm:w-14 h-8 sm:h-9 bg-white/10 rounded-full"></div>
        <div className="absolute top-12 sm:top-20 right-4 sm:right-12 w-16 sm:w-20 h-10 sm:h-12 bg-white/10 rounded-full"></div>
        <div className="absolute top-16 sm:top-24 right-12 sm:right-20 w-12 sm:w-14 h-8 sm:h-9 bg-white/10 rounded-full"></div>
        
        <div className="absolute bottom-20 sm:bottom-32 left-8 sm:left-16 w-12 sm:w-16 h-8 sm:h-10 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-24 sm:bottom-36 left-16 sm:left-24 w-10 sm:w-12 h-6 sm:h-8 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 sm:bottom-32 right-8 sm:right-16 w-12 sm:w-16 h-8 sm:h-10 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-24 sm:bottom-36 right-16 sm:right-24 w-10 sm:w-12 h-6 sm:h-8 bg-white/10 rounded-full"></div>

        {/* Render current page */}
        {currentPage === 'welcome' && (
          <WelcomePage onSelectRole={handleRoleSelection} />
        )}
        
        {currentPage === 'register' && (
          <ParentRegisterPage 
            onBack={handleBackToWelcome}
            onSwitchToLogin={() => setCurrentPage('parentLogin')}
            onRegister={handleParentRegister}
          />
        )}
        
        {currentPage === 'parentLogin' && (
          <ParentLoginPage 
            onBack={handleBackToWelcome}
            onSwitchToRegister={() => setCurrentPage('register')}
            onLogin={handleParentLogin}
          />
        )}
        
        {currentPage === 'childLogin' && (
          <ChildLoginPage 
            onBack={handleBackToWelcome}
            onLogin={handleChildLogin}
          />
        )}

        {currentPage === 'adminLogin' && (
          <AdminLoginPage
            onBack={handleBackToWelcome}
            onLoginSuccess={handleAdminLogin}
          />
        )}
      </div>

      {/* Login Code Modal */}
      {showLoginCodeModal && (
        <LoginCodeModal 
          childName={newChildName}
          loginCode={newLoginCode}
          onContinue={handleLoginCodeModalContinue}
          onGoToLogins={handleLoginCodeGoToLogins}
        />
      )}
    </>
  );
}