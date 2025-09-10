// pages/admin/settings/SecuritySettings.jsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SecuritySettings() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-4 p-6 border rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Password</h3>
            <p className="text-sm text-muted-foreground">
              Last changed 3 months ago
            </p>
          </div>
          <Button variant="outline">Change Password</Button>
        </div>
      </div>

      <div className="space-y-4 p-6 border rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Two-Factor Authentication</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="destructive">Disabled</Badge>
              <p className="text-sm text-muted-foreground">
                Add extra security to your account
              </p>
            </div>
          </div>
          <Button>Enable 2FA</Button>
        </div>
      </div>

      <div className="space-y-4 p-6 border rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Active Sessions</h3>
            <p className="text-sm text-muted-foreground">
              2 devices currently logged in
            </p>
          </div>
          <Button variant="outline">View All</Button>
        </div>
      </div>
    </div>
  );
}