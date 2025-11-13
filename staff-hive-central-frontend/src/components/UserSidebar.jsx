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
  Clock,
  Menu,
  X,
  ChevronLeft
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const mainItems = [
  { title: "Dashboard", url: "/user-dashboard", icon: Home },
  { title: "Attendance", url: "/user-dashboard/attendance", icon: Clock },
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
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleGroup = (title) => {
    setExpandedGroup(expandedGroup === title ? null : title);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          aria-label="Toggle sidebar"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex-col transition-all duration-300 ease-in-out z-40 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Staff Hive</div>
                  <div className="text-xs text-gray-500">Employee Portal</div>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            )}

            {/* Collapse/Expand Button */}
            <button
              onClick={toggleCollapse}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
              aria-label="Toggle sidebar collapse"
            >
              <ChevronLeft className={`w-5 h-5 text-gray-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            {!isCollapsed && (
              <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
                Main Menu
              </div>
            )}
            <div className="space-y-2">
              {mainItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.url);
                const hasSubItems = item.subItems && item.subItems.length > 0;

                return (
                  <div key={item.title}>
                    {hasSubItems ? (
                      <button
                        onClick={() => toggleGroup(item.title)}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        title={isCollapsed ? item.title : ''}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          {!isCollapsed && <span className="truncate">{item.title}</span>}
                        </div>
                        {!isCollapsed && (
                          <ChevronDown
                            className={`w-4 h-4 transition-transform flex-shrink-0 ${
                              expandedGroup === item.title ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </button>
                    ) : (
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        title={isCollapsed ? item.title : ''}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    )}

                    {!isCollapsed && hasSubItems && expandedGroup === item.title && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <NavLink
                            key={subItem.title}
                            to={subItem.url}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                isActive
                                  ? 'bg-blue-50 text-blue-600 font-medium'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`
                            }
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

          {!isCollapsed && (
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
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-100">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        )}

        {/* Logout Button for Collapsed */}
        {isCollapsed && (
          <div className="p-2 border-t border-gray-100">
            <button
              onClick={logout}
              className="w-full p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4 mx-auto" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out z-40 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 sticky top-0 bg-white">
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
            <div className="space-y-2">
              {mainItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.url);
                const hasSubItems = item.subItems && item.subItems.length > 0;

                return (
                  <div key={item.title}>
                    {hasSubItems ? (
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
                      <NavLink
                        to={item.url}
                        onClick={closeSidebar}
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
                            onClick={closeSidebar}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                isActive
                                  ? 'bg-blue-50 text-blue-600 font-medium'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`
                            }
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
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`
                    }
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
            onClick={() => {
              logout();
              closeSidebar();
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
};