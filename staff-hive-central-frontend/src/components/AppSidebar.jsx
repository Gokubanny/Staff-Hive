// src/components/AppSidebar.jsx - UPDATED
import { useState } from "react"
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  UserPlus, 
  BookOpen, 
  BarChart3,
  Settings,
  Briefcase,
  Calendar,
  Clock,
  UserCheck,
  Menu,
  X,
  ChevronDown,
  ChevronLeft
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useSidebar } from '@/contexts/SidebarContext' // ADD THIS IMPORT

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Companies", url: "/dashboard/companies", icon: Building2 },
  { title: "Employees", url: "/dashboard/employees", icon: Users },
  { title: "Pending Users", url: "/dashboard/pending-users", icon: UserCheck },
  { title: "Attendance", url: "/dashboard/attendance", icon: Clock },
  { title: "Payroll", url: "/dashboard/payroll", icon: CreditCard },
  { title: "Leave Management", url: "/dashboard/leave-management", icon: Calendar },
  { title: "Applicants", url: "/dashboard/applicants", icon: UserPlus },
  { 
    title: "Job Postings", 
    url: "/dashboard/job-postings", 
    icon: Briefcase,
    subItems: [
      { title: "All Jobs", url: "/dashboard/job-postings" },
      { title: "Post New Job", url: "/dashboard/post-job" }
    ]
  }
]

const secondaryItems = [
  { title: "Knowledge Base", url: "/dashboard/knowledge", icon: BookOpen },
  { title: "Reports", url: "/dashboard/reports", icon: BarChart3 },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()
  const [expandedGroup, setExpandedGroup] = useState(null)
  
  // REPLACE these useState with useSidebar hook
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar()

  const toggleGroup = (title) => {
    setExpandedGroup(expandedGroup === title ? null : title)
  }

  const toggleSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const closeSidebar = () => {
    setIsMobileOpen(false)
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          aria-label="Toggle sidebar"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
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
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Staff Hive</div>
                  <div className="text-xs text-gray-500">Central</div>
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
          <div className="mb-3">
            {!isCollapsed && (
              <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
                Main
              </div>
            )}
            <div className="space-y-1">
              {mainItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname.startsWith(item.url)
                const hasSubItems = item.subItems && item.subItems.length > 0
                
                return (
                  <div key={item.title}>
                    <NavLink
                      to={hasSubItems ? '#' : item.url}
                      onClick={() => hasSubItems && toggleGroup(item.title)}
                      className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
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
                      {!isCollapsed && hasSubItems && (
                        <ChevronDown
                          className={`w-4 h-4 transition-transform flex-shrink-0 ${
                            expandedGroup === item.title ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </NavLink>

                    {!isCollapsed && hasSubItems && expandedGroup === item.title && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <NavLink
                            key={subItem.title}
                            to={subItem.url}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                              location.pathname === subItem.url
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
                )
              })}
            </div>
          </div>

          {!isCollapsed && (
            <div>
              <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
                Resources
              </div>
              <div className="space-y-1">
                {secondaryItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.url
                  
                  return (
                    <NavLink
                      key={item.title}
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
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out z-40 overflow-y-auto ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-100 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">Staff Hive</div>
              <div className="text-xs text-gray-500">Central</div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
              Main
            </div>
            <div className="space-y-1">
              {mainItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname.startsWith(item.url)
                const hasSubItems = item.subItems && item.subItems.length > 0
                
                return (
                  <div key={item.title}>
                    <NavLink
                      to={hasSubItems ? '#' : item.url}
                      onClick={() => {
                        if (hasSubItems) toggleGroup(item.title)
                        else closeSidebar()
                      }}
                      className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </div>
                      {hasSubItems && (
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedGroup === item.title ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </NavLink>

                    {hasSubItems && expandedGroup === item.title && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <NavLink
                            key={subItem.title}
                            to={subItem.url}
                            onClick={closeSidebar}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                              location.pathname === subItem.url
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
                )
              })}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
              Resources
            </div>
            <div className="space-y-1">
              {secondaryItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.url
                
                return (
                  <NavLink
                    key={item.title}
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
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}