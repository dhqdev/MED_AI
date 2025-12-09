import React, { type ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
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
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-blue-med text-white p-4 rounded-full shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="lg:ml-64 pt-20 p-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
