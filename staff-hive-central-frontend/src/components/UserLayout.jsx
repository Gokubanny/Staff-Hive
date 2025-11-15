// src/components/UserLayout.jsx - UPDATED
import { UserSidebar } from './UserSidebar';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext'; // ADD THESE IMPORTS

// CREATE INNER COMPONENT that uses the hook
const UserLayoutContent = () => {
  const { isCollapsed } = useSidebar(); // USE THE HOOK HERE

  return (
    <div className="flex min-h-screen w-full">
      <UserSidebar />
      <div 
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`} // DYNAMIC MARGIN BASED ON COLLAPSE STATE
      >
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// WRAP WITH PROVIDER
export const UserLayout = () => {
  return (
    <SidebarProvider>
      <UserLayoutContent />
    </SidebarProvider>
  );
};