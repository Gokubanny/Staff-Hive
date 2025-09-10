import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Clock, 
  Calendar, 
  Award, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  FileText,
  Download
} from "lucide-react";

export default function UserReportPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  // Mock data for user reports
  const userStats = {
    attendanceRate: 96,
    hoursWorked: 168,
    tasksCompleted: 24,
    performanceScore: 8.5,
    leaveBalance: 15
  };

  const recentActivities = [
    {
      id: 1,
      type: 'task',
      title: 'Project Alpha Milestone',
      status: 'completed',
      date: '2025-08-15',
      description: 'Successfully delivered project milestone ahead of schedule'
    },
    {
      id: 2,
      type: 'training',
      title: 'Cybersecurity Training',
      status: 'in-progress',
      date: '2025-08-12',
      description: 'Completing mandatory cybersecurity certification'
    },
    {
      id: 3,
      type: 'leave',
      title: 'Annual Leave Request',
      status: 'approved',
      date: '2025-08-10',
      description: 'Leave request for Aug 25-27 has been approved'
    }
  ];

  const performanceMetrics = [
    { label: 'Goals Achieved', value: '8/10', trend: 'up' },
    { label: 'Peer Rating', value: '4.2/5', trend: 'up' },
    { label: 'Project Success Rate', value: '92%', trend: 'stable' },
    { label: 'Training Completion', value: '85%', trend: 'up' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-600">Track your performance, attendance, and achievements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Time Filter */}
      <div className="flex gap-2">
        {['week', 'month', 'quarter', 'year'].map((timeframe) => (
          <Button
            key={timeframe}
            variant={selectedTimeframe === timeframe ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeframe(timeframe)}
            className="capitalize"
          >
            {timeframe}
          </Button>
        ))}
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-green-600">{userStats.attendanceRate}%</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hours Worked</p>
                <p className="text-2xl font-bold text-blue-600">{userStats.hoursWorked}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold text-purple-600">{userStats.tasksCompleted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance</p>
                <p className="text-2xl font-bold text-orange-600">{userStats.performanceScore}/10</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leave Balance</p>
                <p className="text-2xl font-bold text-indigo-600">{userStats.leaveBalance} days</p>
              </div>
              <User className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <TrendingUp className={`h-4 w-4 ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`} />
                </div>
                <p className="text-xl font-bold">{metric.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                <div className="mt-1">
                  {getStatusIcon(activity.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{activity.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                      <span className="text-sm text-gray-500">{activity.date}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}