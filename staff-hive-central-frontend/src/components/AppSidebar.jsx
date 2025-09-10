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
  FileText,
  Calendar,
  Clock // Added for attendance
} from "lucide-react"
import { ChevronDown } from 'lucide-react';
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Companies", url: "/dashboard/companies", icon: Building2 },
  { title: "Employees", url: "/dashboard/employees", icon: Users },
  { title: "Attendance", url: "/dashboard/attendance", icon: Clock }, // Added attendance
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

  const toggleGroup = (title) => {
    setExpandedGroup(expandedGroup === title ? null : title)
  }

  return (
    <Sidebar collapsible="none" className="bg-white border-r border-gray-200 fixed">
      <SidebarHeader className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">Staff Hive</div>
            <div className="text-xs text-gray-500">Central</div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <div className="mb-3">
          <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Main
          </div>
          <SidebarMenu className="space-y-1">
            {mainItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname.startsWith(item.url)
              const hasSubItems = item.subItems && item.subItems.length > 0
              
              return (
                <SidebarGroup key={item.title}>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      onClick={() => hasSubItems && toggleGroup(item.title)}
                      className="w-full"
                    >
                      <NavLink 
                        to={hasSubItems ? '#' : item.url}
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
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {hasSubItems && expandedGroup === item.title && (
                    <SidebarGroupContent className="ml-8 mt-1">
                      {item.subItems.map((subItem) => (
                        <SidebarMenuItem key={subItem.title}>
                          <SidebarMenuButton asChild>
                            <NavLink
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
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarGroupContent>
                  )}
                </SidebarGroup>
              )
            })}
          </SidebarMenu>
        </div>

        <div>
          <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Resources
          </div>
          <SidebarMenu className="space-y-1">
            {secondaryItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.url
              
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
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
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}