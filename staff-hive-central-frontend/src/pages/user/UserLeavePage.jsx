import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarDays,
  Settings,
  History,
  RotateCcw,
  Users,
  ArrowRight
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Mock leave data
const leaveRequests = [
  {
    id: "LR001",
    type: "Annual Leave",
    startDate: "2024-02-15",
    endDate: "2024-02-19",
    days: 5,
    reason: "Family vacation",
    status: "approved",
    appliedDate: "2024-01-15",
    approver: "John Smith"
  },
  {
    id: "LR002", 
    type: "Sick Leave",
    startDate: "2024-01-20",
    endDate: "2024-01-22",
    days: 3,
    reason: "Medical treatment",
    status: "pending",
    appliedDate: "2024-01-18",
    approver: "John Smith"
  },
  {
    id: "LR003",
    type: "Personal Leave",
    startDate: "2023-12-28",
    endDate: "2023-12-29", 
    days: 2,
    reason: "Personal matters",
    status: "rejected",
    appliedDate: "2023-12-15",
    approver: "John Smith",
    rejectionReason: "Insufficient notice period"
  }
];

const leaveBalance = {
  annual: { used: 8, total: 21, remaining: 13 },
  sick: { used: 2, total: 10, remaining: 8 },
  personal: { used: 1, total: 5, remaining: 4 },
  emergency: { used: 0, total: 3, remaining: 3 }
};

const UserLeavePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Changed from isAdmin to user
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      type: "",
      startDate: "",
      endDate: "",
      reason: "",
      emergencyContact: ""
    }
  });

  const getStatusColor = (status) => {
    switch(status) {
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";  
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "approved": return CheckCircle;
      case "pending": return Clock;
      case "rejected": return XCircle;
      default: return AlertCircle;
    }
  };

  const handleRequestSubmit = (data) => {
    console.log("Leave request:", data);
    toast.success("Leave request submitted successfully!");
    form.reset();
    setIsRequestDialogOpen(false);
  };

  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage ALL Leave Applications - A relaxed employee is a performing employee.
        </p>
      </div>

      {/* Quick Actions - Admin/Manager Cards */}
      {user?.role === 'admin' && ( // Changed from isAdmin() to user?.role check
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800" onClick={() => navigate("/leave-config")}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Leave Settings</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Configure leave policies</p>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-600 ml-auto" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800" onClick={() => navigate("/leave-history")}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-600 rounded-lg">
                  <History className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">Leave History</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">View all leave records</p>
                </div>
                <ArrowRight className="h-4 w-4 text-green-600 ml-auto" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800" onClick={() => toast.info("Leave Recall feature coming soon!")}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-600 rounded-lg">
                  <RotateCcw className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100">Leave Recall</h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Cancel approved leaves</p>
                </div>
                <ArrowRight className="h-4 w-4 text-orange-600 ml-auto" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800" onClick={() => toast.info("Relief Officers feature coming soon!")}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-600 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">Relief Officers</h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Manage cover staff</p>
                </div>
                <ArrowRight className="h-4 w-4 text-purple-600 ml-auto" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rest of your component remains exactly the same */}
      {/* ... (Leave Balance Cards, Leave Requests Section, etc.) */}
    </div>
  );
};

export default UserLeavePage;