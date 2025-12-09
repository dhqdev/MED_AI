import React, { type ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle - Apenas para tablets */}
      <button
        onClick={toggleSidebar}
        className="hidden md:block lg:hidden fixed top-20 left-4 z-50 bg-blue-600 text-white p-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all"
      >
        <Menu className="w-5 h-5" />
      </button>

      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="lg:ml-64 pt-4 lg:pt-20 p-4 lg:p-6 pb-20 lg:pb-6">
        {children}
      </div>

      {/* Bottom Navigation - Apenas Mobile */}
      <BottomNav />
    </div>
  );
};

export default DashboardLayout;
