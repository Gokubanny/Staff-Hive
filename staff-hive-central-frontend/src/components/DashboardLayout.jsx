// src/components/DashboardLayout.jsx - UPDATED
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext'; // ADD THESE IMPORTS
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// CREATE INNER COMPONENT that uses the hook
const DashboardContent = () => {
  const { user, logout } = useAuth();
  const { isCollapsed } = useSidebar(); // USE THE HOOK HERE

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <AppSidebar />
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`} // DYNAMIC MARGIN BASED ON COLLAPSE STATE
      >
        <header className="bg-white border-b border-gray-200 h-16">
          <div className="flex h-full items-center justify-between px-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Staff Hive Central</h1>
              <p className="text-sm text-gray-500">HR Management System</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  1
                </span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 flex">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-sm">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// WRAP WITH PROVIDER
export const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
};