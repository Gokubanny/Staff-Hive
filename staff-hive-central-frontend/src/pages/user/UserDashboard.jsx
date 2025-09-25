// user/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext'; // adjust path if needed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Briefcase, Clock, MapPin, DollarSign, TrendingUp, Calendar,
  CheckCircle, AlertCircle, User, Bell, BookOpen, Award, Target, Activity
} from 'lucide-react';

const UserDashboard = () => {
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [userRes, appsRes, notifRes, eventsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/user', config),
          axios.get('http://localhost:5000/api/applicants', config),
          axios.get('http://localhost:5000/api/notifications', config),
          axios.get('http://localhost:5000/api/events', config)
        ]);

        setUser(userRes.data?.user || null);
        setApplications(appsRes.data?.data || appsRes.data || []);
        setNotifications(notifRes.data?.data || notifRes.data || []);
        setUpcomingEvents(eventsRes.data?.data || eventsRes.data || []);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6 text-red-500">Failed to load user data</div>;

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'interview': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'hired': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'interview': return <Calendar className="h-4 w-4" />;
      case 'review': return <Clock className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      case 'hired': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Compute Success Rate dynamically
  const totalApplications = applications.length;
  const successfulApplications = applications.filter(app => app.status.toLowerCase() === 'hired').length;
  const successRate = totalApplications > 0
    ? Math.round((successfulApplications / totalApplications) * 100)
    : 0;

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
              <Progress value={user.profileCompletion || 0} className="w-24 h-2" />
              <span className="text-sm font-semibold">{user.profileCompletion || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Applications</p>
              <p className="text-3xl font-bold text-blue-800">{totalApplications}</p>
            </div>
            <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">In Progress</p>
              <p className="text-3xl font-bold text-green-800">
                {applications.filter(app => ['interview', 'review'].includes(app.status.toLowerCase())).length}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Interviews</p>
              <p className="text-3xl font-bold text-purple-800">
                {applications.filter(app => app.status.toLowerCase() === 'interview').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent 
            className="p-6 flex items-center justify-between"
            title={`${successfulApplications} out of ${totalApplications} applications were successful`}
          >
            <div>
              <p className="text-sm font-medium text-orange-600">Success Rate</p>
              <p className="text-3xl font-bold text-orange-800">{successRate}%</p>
            </div>
            <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
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
              {applications.map((app) => (
                <div key={app._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{app.jobId?.title || 'N/A'}</h4>
                      <p className="text-sm text-gray-600">{app.companyId?.name || 'N/A'}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{app.location || 'N/A'}</span>
                        <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{app.salary || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">View All Applications</Button>
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
                <div key={event._id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <Badge variant="outline" className="text-xs">{event.type}</Badge>
                  </div>
                  <p className="text-xs text-gray-600">{event.company}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">View Calendar</Button>
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
                <div key={notification._id} className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">View All Notifications</Button>
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
