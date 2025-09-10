import { useState } from "react";
import { 
  Home,
  Calendar,
  BookOpen,
  Gift,
  User,
  Briefcase,
  LogOut,
  Building2,
  ChevronDown,
  Clock // Added for attendance
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const mainItems = [
  { title: "Dashboard", url: "/user-dashboard", icon: Home },
  { title: "Attendance", url: "/user-dashboard/attendance", icon: Clock }, // Added attendance
  { 
    title: "Leave", 
    url: "/user-dashboard/leave", 
    icon: Calendar,
    subItems: [
      { title: "Request Leave", url: "/user-dashboard/leave" },
      { title: "Leave Balance", url: "/user-dashboard/leave/balance" },
      { title: "Leave History", url: "/user-dashboard/leave/history" }
    ]
  },
  { 
    title: "Training", 
    url: "/user-dashboard/training", 
    icon: BookOpen,
    subItems: [
      { title: "My Training", url: "/user-dashboard/training" },
      { title: "Available Courses", url: "/user-dashboard/training/courses" }
    ]
  },
  { title: "Benefits", url: "/user-dashboard/benefits", icon: Gift },
  { title: "Job Applications", url: "/user-dashboard/jobs", icon: Briefcase },
  { title: "Profile", url: "/user-dashboard/profile", icon: User }
];

const secondaryItems = [
  { title: "Company Info", url: "/user-dashboard/company", icon: Building2 },
];

export const UserSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [expandedGroup, setExpandedGroup] = useState(null);

  const toggleGroup = (title) => {
    setExpandedGroup(expandedGroup === title ? null : title);
  };

  const handleItemClick = (e, item, hasSubItems) => {
    if (hasSubItems) {
      // Prevent navigation for items with sub-items, just toggle
      e.preventDefault();
      toggleGroup(item.title);
    }
    // For items without sub-items, let the NavLink handle navigation normally
  };

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 fixed top-0 left-0 overflow-y-auto">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">Staff Hive</div>
            <div className="text-xs text-gray-500">Employee Portal</div>
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <div className="p-6">
        <div className="mb-6">
          <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Main Menu
          </div>
          <div className="space-y-4">
            {mainItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.url);
              const hasSubItems = item.subItems && item.subItems.length > 0;
              
              return (
                <div key={item.title} className="group">
                  {hasSubItems ? (
                    // For items with sub-items, use a button instead of NavLink
                    <button
                      onClick={() => toggleGroup(item.title)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedGroup === item.title ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  ) : (
                    // For items without sub-items, use NavLink normally
                    <NavLink 
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  )}

                  {hasSubItems && expandedGroup === item.title && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <NavLink
                          key={subItem.title}
                          to={subItem.url}
                          className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="w-4 h-4 flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          </span>
                          <span>{subItem.title}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Resources Section */}
        <div className="mb-6">
          <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Resources
          </div>
          <div className="space-y-1">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              
              return (
                <NavLink 
                  key={item.title}
                  to={item.url} 
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100 sticky bottom-0 bg-white">
        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};