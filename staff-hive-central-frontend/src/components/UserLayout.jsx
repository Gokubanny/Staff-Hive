import { UserSidebar } from './UserSidebar';
import { Outlet } from 'react-router-dom';

export const UserLayout = () => {
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar - fixed width of 16rem (w-64) */}
      <UserSidebar />
      
      {/* Main content area - offset by sidebar width (ml-64) */}
      <div className="flex flex-col flex-1 ml-64">
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};