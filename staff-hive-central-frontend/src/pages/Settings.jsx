import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useJobs } from '@/contexts/JobContext';
import { toast } from '@/components/ui/use-toast';
import { 
  User, 
  Shield, 
  Bell, 
  Settings as SettingsIcon,
  Building2,
  Database,
  Plug,
  ChevronRight,
  Home,
  Save
} from "lucide-react";

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  const { company, updateCompany } = useJobs();

  const settingsNavigation = [
    {
      name: "Profile",
      href: "/dashboard/settings/profile",
      icon: User,
      description: "Manage your personal information and account details",
      badge: null
    },
    {
      name: "Security",
      href: "/dashboard/settings/security",
      icon: Shield,
      description: "Password, 2FA, and security preferences",
      badge: "Important"
    },
    {
      name: "Notifications",
      href: "/dashboard/settings/notifications",
      icon: Bell,
      description: "Email and in-app notification preferences",
      badge: null
    },
    {
      name: "System Settings",
      href: "/dashboard/settings/system",
      icon: SettingsIcon,
      description: "Company info, integrations, and data management",
      badge: null,
      subItems: [
        {
          name: "Company Info",
          href: "/dashboard/settings/system/company",
          icon: Building2,
          description: "Basic company information and business hours"
        },
        {
          name: "Integrations",
          href: "/dashboard/settings/system/integrations",
          icon: Plug,
          description: "Connect third-party services and applications"
        },
        {
          name: "Data Management",
          href: "/dashboard/settings/system/data",
          icon: Database,
          description: "Export, import, and manage your data"
        }
      ]
    }
  ];

  const isCurrentPath = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    
    if (currentPath.includes('/profile')) return 'Profile Settings';
    if (currentPath.includes('/security')) return 'Security Settings';
    if (currentPath.includes('/notifications')) return 'Notification Settings';
    if (currentPath.includes('/system/company')) return 'Company Information';
    if (currentPath.includes('/system/integrations')) return 'Integrations';
    if (currentPath.includes('/system/data')) return 'Data Management';
    if (currentPath.includes('/system')) return 'System Settings';
    
    return 'Settings';
  };

  const getBreadcrumbs = () => {
    const currentPath = location.pathname;
    const breadcrumbs = [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Settings', href: '/dashboard/settings' }
    ];

    if (currentPath.includes('/profile')) {
      breadcrumbs.push({ name: 'Profile', href: '/dashboard/settings/profile' });
    } else if (currentPath.includes('/security')) {
      breadcrumbs.push({ name: 'Security', href: '/dashboard/settings/security' });
    } else if (currentPath.includes('/notifications')) {
      breadcrumbs.push({ name: 'Notifications', href: '/dashboard/settings/notifications' });
    } else if (currentPath.includes('/system')) {
      breadcrumbs.push({ name: 'System', href: '/dashboard/settings/system' });
      
      if (currentPath.includes('/company')) {
        breadcrumbs.push({ name: 'Company Info', href: '/dashboard/settings/system/company' });
      } else if (currentPath.includes('/integrations')) {
        breadcrumbs.push({ name: 'Integrations', href: '/dashboard/settings/system/integrations' });
      } else if (currentPath.includes('/data')) {
        breadcrumbs.push({ name: 'Data Management', href: '/dashboard/settings/system/data' });
      }
    }

    return breadcrumbs;
  };

  const handleQuickSave = async () => {
    try {
      // This will trigger a save of the current form if it exists
      const event = new CustomEvent('settings-save');
      window.dispatchEvent(event);
      
      toast({
        title: "Settings saved",
        description: "Your changes have been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "There was an error saving your settings",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 ml-64">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{getCurrentPageTitle()}</h1>
          
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-1 text-sm text-muted-foreground mt-2">
            {getBreadcrumbs().map((crumb, index) => (
              <div key={crumb.href} className="flex items-center">
                {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
                {index === 0 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(crumb.href)}
                    className="h-auto p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Home className="h-4 w-4 mr-1" />
                    {crumb.name}
                  </Button>
                ) : index === getBreadcrumbs().length - 1 ? (
                  <span className="text-foreground font-medium">{crumb.name}</span>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(crumb.href)}
                    className="h-auto p-0 text-muted-foreground hover:text-foreground"
                  >
                    {crumb.name}
                  </Button>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleQuickSave}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Quick Save
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                {settingsNavigation.map((item) => (
                  <div key={item.name}>
                    <Button
                      variant={isCurrentPath(item.href) ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start text-left h-auto p-3",
                        isCurrentPath(item.href) && "bg-secondary"
                      )}
                      onClick={() => navigate(item.href)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <item.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.name}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </Button>

                    {/* Sub-navigation for System Settings */}
                    {item.subItems && isCurrentPath(item.href) && (
                      <div className="ml-8 mt-2 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Button
                            key={subItem.name}
                            variant={isCurrentPath(subItem.href) ? "secondary" : "ghost"}
                            size="sm"
                            className={cn(
                              "w-full justify-start text-left h-auto p-2",
                              isCurrentPath(subItem.href) && "bg-primary"
                            )}
                            onClick={() => navigate(subItem.href)}
                          >
                            <div className="flex items-start gap-2 w-full">
                              <subItem.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-sm">{subItem.name}</span>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {subItem.description}
                                </p>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Company Info Summary */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Company Info</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p><strong>Name:</strong> {company?.name || 'Not set'}</p>
                <p><strong>Email:</strong> {company?.contactEmail || 'Not set'}</p>
                <p><strong>Phone:</strong> {company?.phone || 'Not set'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Settings Tips */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">💡 Quick Tips</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>• Enable 2FA for better security</p>
                <p>• Customize notifications to stay focused</p>
                <p>• Regularly backup your data</p>
                <p>• Review connected integrations</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Card className="min-h-[600px]">
            <CardContent className="p-6">
              <Outlet />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}