// pages/admin/settings/NotificationSettings.jsx
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useJobs } from '@/contexts/JobContext';
import { useEffect, useState } from 'react';

export default function NotificationSettings() {
  const { company, updateCompany } = useJobs();
  const [notifications, setNotifications] = useState({
    email: {
      newRegistrations: true,
      payrollAlerts: true,
      leaveRequests: true,
      systemUpdates: true,
      securityAlerts: true
    },
    app: {
      newMessages: true,
      approvalRequests: true,
      taskAssignments: true,
      deadlineReminders: true
    }
  });

  useEffect(() => {
    if (company.notificationSettings) {
      setNotifications(company.notificationSettings);
    }
  }, [company]);

  const handleToggle = (type, key) => {
    const updated = {
      ...notifications,
      [type]: {
        ...notifications[type],
        [key]: !notifications[type][key]
      }
    };
    setNotifications(updated);
    updateCompany({ notificationSettings: updated });
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-6">
        <h3 className="font-medium">Email Notifications</h3>
        <div className="space-y-4">
          {Object.entries(notifications.email).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={`email-${key}`}>
                {key.split(/(?=[A-Z])/).join(' ')}
              </Label>
              <Switch
                id={`email-${key}`}
                checked={value}
                onCheckedChange={() => handleToggle('email', key)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6 pt-8">
        <h3 className="font-medium">In-App Notifications</h3>
        <div className="space-y-4">
          {Object.entries(notifications.app).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={`app-${key}`}>
                {key.split(/(?=[A-Z])/).join(' ')}
              </Label>
              <Switch
                id={`app-${key}`}
                checked={value}
                onCheckedChange={() => handleToggle('app', key)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}