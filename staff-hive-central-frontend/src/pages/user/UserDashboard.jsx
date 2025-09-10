import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Briefcase, 
  Clock, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  AlertCircle,
  User,
  Bell,
  BookOpen,
  Award,
  Target,
  Activity
} from 'lucide-react';

const UserDashboard = () => {
  const [user] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    department: "Engineering",
    position: "Frontend Developer",
    joinDate: "2024-01-15",
    profileCompletion: 85
  });

  const [applications] = useState([
    {
      id: 1,
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      appliedDate: "2024-05-15",
      status: "interview",
      location: "San Francisco, CA",
      salary: "$120,000"
    },
    {
      id: 2,
      jobTitle: "React Developer",
      company: "StartupXYZ",
      appliedDate: "2024-05-12",
      status: "review",
      location: "Remote",
      salary: "$95,000"
    },
    {
      id: 3,
      jobTitle: "Full Stack Engineer",
      company: "InnovateLabs",
      appliedDate: "2024-05-10",
      status: "rejected",
      location: "New York, NY",
      salary: "$110,000"
    }
  ]);

  const [notifications] = useState([
    {
      id: 1,
      title: "Interview Scheduled",
      message: "Your interview for Senior Frontend Developer is scheduled for tomorrow at 2 PM",
      type: "interview",
      time: "2 hours ago"
    },
    {
      id: 2,
      title: "Application Update",
      message: "Your application for React Developer position is now under review",
      type: "update",
      time: "1 day ago"
    },
    {
      id: 3,
      title: "New Training Available",
      message: "Advanced React Patterns course is now available",
      type: "training",
      time: "2 days ago"
    }
  ]);

  const [upcomingEvents] = useState([
    {
      id: 1,
      title: "Technical Interview",
      company: "TechCorp Inc.",
      date: "2024-05-20",
      time: "2:00 PM",
      type: "interview"
    },
    {
      id: 2,
      title: "Company Culture Session",
      company: "StartupXYZ",
      date: "2024-05-22",
      time: "10:00 AM",
      type: "meeting"
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'interview':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'interview':
        return <Calendar className="h-4 w-4" />;
      case 'review':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />;
      case 'hired':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
            <p className="text-blue-100 mt-2">Here's what's happening with your job search today</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Profile Completion</p>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={user.profileCompletion} className="w-24 h-2" />
              <span className="text-sm font-semibold">{user.profileCompletion}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Applications</p>
                <p className="text-3xl font-bold text-blue-800">{applications.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">In Progress</p>
                <p className="text-3xl font-bold text-green-800">
                  {applications.filter(app => app.status === 'interview' || app.status === 'review').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Interviews</p>
                <p className="text-3xl font-bold text-purple-800">
                  {applications.filter(app => app.status === 'interview').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Success Rate</p>
                <p className="text-3xl font-bold text-orange-800">75%</p>
              </div>
              <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Applications
              </CardTitle>
              <CardDescription>Track the status of your recent job applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{application.jobTitle}</h4>
                      <p className="text-sm text-gray-600">{application.company}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {application.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {application.salary}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(application.status)}>
                      {application.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      Applied {new Date(application.appliedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                View All Applications
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{event.company}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                View Calendar
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                View All Notifications
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Briefcase className="h-6 w-6" />
              Browse Jobs
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <User className="h-6 w-6" />
              Update Profile
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <BookOpen className="h-6 w-6" />
              Training Center
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Award className="h-6 w-6" />
              Certificates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;