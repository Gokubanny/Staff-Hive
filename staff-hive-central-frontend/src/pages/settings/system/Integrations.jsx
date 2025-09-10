import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useJobs } from '@/contexts/JobContext';
import { 
  Calendar,
  CreditCard,
  Mail,
  Database,
  Shield,
  Settings,
  ExternalLink,
  Check,
  X,
  AlertCircle
} from "lucide-react";

export default function Integrations() {
  const { integrations, updateIntegration } = useJobs();
  const [configuring, setConfiguring] = useState(null);
  const [configs, setConfigs] = useState({});

  const integrationIcons = {
    payroll: <CreditCard className="h-5 w-5" />,
    calendar: <Calendar className="h-5 w-5" />,
    email: <Mail className="h-5 w-5" />,
    backup: <Database className="h-5 w-5" />,
    security: <Shield className="h-5 w-5" />
  };

  const integrationData = [
    {
      id: 'payroll',
      name: 'Payroll System',
      description: 'Sync employee data and automate payroll calculations',
      category: 'Finance',
      provider: 'PayrollPro',
      status: integrations?.find(i => i.id === 'payroll')?.status || 'disconnected',
      lastSync: '2 hours ago',
      configFields: [
        { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter API key' },
        { key: 'endpoint', label: 'Endpoint URL', type: 'url', placeholder: 'https://api.payrollpro.com' },
        { key: 'syncFrequency', label: 'Sync Frequency', type: 'select', options: ['Hourly', 'Daily', 'Weekly'] }
      ]
    },
    {
      id: 'calendar',
      name: 'Calendar Integration',
      description: 'Sync leave requests and events with external calendars',
      category: 'Productivity',
      provider: 'Google Calendar',
      status: integrations?.find(i => i.id === 'calendar')?.status || 'disconnected',
      lastSync: '1 day ago',
      configFields: [
        { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Google Client ID' },
        { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Client Secret' },
        { key: 'calendarId', label: 'Calendar ID', type: 'text', placeholder: 'primary' }
      ]
    },
    {
      id: 'email',
      name: 'Email Service',
      description: 'Send automated notifications and reminders',
      category: 'Communication',
      provider: 'SendGrid',
      status: integrations?.find(i => i.id === 'email')?.status || 'connected',
      lastSync: '30 minutes ago',
      configFields: [
        { key: 'apiKey', label: 'SendGrid API Key', type: 'password', placeholder: 'SG.xxxxxx' },
        { key: 'fromEmail', label: 'From Email', type: 'email', placeholder: 'no-reply@company.com' },
        { key: 'fromName', label: 'From Name', type: 'text', placeholder: 'Company Name' }
      ]
    },
    {
      id: 'backup',
      name: 'Data Backup',
      description: 'Automated daily backups to cloud storage',
      category: 'Security',
      provider: 'AWS S3',
      status: integrations?.find(i => i.id === 'backup')?.status || 'connected',
      lastSync: '6 hours ago',
      configFields: [
        { key: 'accessKey', label: 'Access Key ID', type: 'text', placeholder: 'AWS Access Key' },
        { key: 'secretKey', label: 'Secret Access Key', type: 'password', placeholder: 'AWS Secret Key' },
        { key: 'bucketName', label: 'S3 Bucket Name', type: 'text', placeholder: 'company-backups' },
        { key: 'region', label: 'AWS Region', type: 'select', options: ['us-east-1', 'us-west-2', 'eu-west-1'] }
      ]
    },
    {
      id: 'security',
      name: 'Single Sign-On',
      description: 'Enterprise SSO with multi-factor authentication',
      category: 'Security',
      provider: 'Auth0',
      status: integrations?.find(i => i.id === 'security')?.status || 'disconnected',
      lastSync: 'Never',
      configFields: [
        { key: 'domain', label: 'Auth0 Domain', type: 'text', placeholder: 'company.auth0.com' },
        { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Auth0 Client ID' },
        { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Client Secret' }
      ]
    }
  ];

  const handleToggle = (id) => {
    const integration = integrationData.find(i => i.id === id);
    const newStatus = integration.status === 'connected' ? 'disconnected' : 'connected';
    updateIntegration(id, newStatus);
  };

  const handleConfigure = (id) => {
    setConfiguring(configuring === id ? null : id);
  };

  const handleSaveConfig = (id) => {
    // Here you would typically save the configuration
    console.log('Saving config for:', id, configs[id]);
    setConfiguring(null);
    // You might want to show a success message here
  };

  const updateConfig = (integrationId, field, value) => {
    setConfigs(prev => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId],
        [field]: value
      }
    }));
  };

  const getStatusBadge = (status) => {
    const variants = {
      connected: { variant: "default", color: "bg-green-100 text-green-800", icon: Check },
      disconnected: { variant: "secondary", color: "bg-gray-100 text-gray-800", icon: X },
      error: { variant: "destructive", color: "bg-red-100 text-red-800", icon: AlertCircle }
    };

    const config = variants[status] || variants.disconnected;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const groupedIntegrations = integrationData.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Integrations</h1>
        <p className="mt-1 text-sm text-gray-600">
          Connect your HR system with third-party services to streamline operations.
        </p>
      </div>

      {Object.entries(groupedIntegrations).map(([category, integrations]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">{category}</h2>
          <div className="grid gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="transition-all duration-200 hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        {integrationIcons[integration.id]}
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {integration.name}
                          {getStatusBadge(integration.status)}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {integration.description}
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>Provider: {integration.provider}</span>
                          <span>•</span>
                          <span>Last sync: {integration.lastSync}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfigure(integration.id)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                      <Switch
                        checked={integration.status === 'connected'}
                        onCheckedChange={() => handleToggle(integration.id)}
                      />
                    </div>
                  </div>
                </CardHeader>

                {configuring === integration.id && (
                  <CardContent className="pt-0">
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">
                        Configuration Settings
                      </h3>
                      <div className="grid gap-4">
                        {integration.configFields.map((field) => (
                          <div key={field.key} className="space-y-2">
                            <Label htmlFor={`${integration.id}-${field.key}`} className="text-sm">
                              {field.label}
                            </Label>
                            {field.type === 'select' ? (
                              <select
                                id={`${integration.id}-${field.key}`}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={configs[integration.id]?.[field.key] || ''}
                                onChange={(e) => updateConfig(integration.id, field.key, e.target.value)}
                              >
                                <option value="">Select {field.label}</option>
                                {field.options.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <Input
                                id={`${integration.id}-${field.key}`}
                                type={field.type}
                                placeholder={field.placeholder}
                                value={configs[integration.id]?.[field.key] || ''}
                                onChange={(e) => updateConfig(integration.id, field.key, e.target.value)}
                              />
                            )}
                          </div>
                        ))}
                        <div className="flex justify-end gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfiguring(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveConfig(integration.id)}
                          >
                            Save Configuration
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Need Help?</CardTitle>
          <CardDescription>
            Having trouble with integrations? Check our documentation or contact support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-1" />
              View Documentation
            </Button>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}