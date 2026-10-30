import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { Footer } from './components/layout/Footer';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SplitBillsView } from './components/split/SplitBillsView';
import { SettingsView } from './components/settings/SettingsView';
import { LoginView } from './components/auth/LoginView';
import { AddTransactionModal } from './components/transactions/AddTransactionModal';

const MainContent: React.FC = () => {
  const { activeTab } = useFinance();

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'transactions':
        return <TransactionsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'split-bills':
        return <SplitBillsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans antialiased">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          {renderCurrentView()}
        </main>

        <Footer />
      </div>

      {/* Global Add/Edit Transaction Modal - accessible from Topbar and any page */}
      <AddTransactionModal />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500">Checking authentication...</p>
      </div>
    );
  }

  // When not logged in, display the landing / sign-in screen
  if (!session) {
    return <LoginView />;
  }

  return (
    <FinanceProvider>
      <MainContent />
    </FinanceProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
