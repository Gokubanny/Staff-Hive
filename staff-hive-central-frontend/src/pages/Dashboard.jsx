import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users, Briefcase, Calendar, TrendingUp, Plus, Eye, Clock, CheckCircle, XCircle,
  AlertTriangle, BarChart3, Activity, UserCheck, Building, Star
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';

// Live Clock Component to avoid full dashboard re-render
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return <span className="font-medium">{time.toLocaleString()}</span>;
};

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const [dashboardData, setDashboardData] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    interviewsScheduled: 0,
    hiredThisMonth: 0,
    rejectedApplications: 0,
    averageTimeToHire: 0,
    topPerformingJobs: [],
    recentApplications: [],
    upcomingInterviews: [],
    departmentStats: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [jobsRes, appsRes, interviewsRes, employeesRes] = await Promise.all([
          axios.get('/api/jobs'),
          axios.get('/api/applications'),
          axios.get('/api/interviews'),
          axios.get('/api/employees')
        ]);

        // Ensure we are working with arrays
        const jobs = Array.isArray(jobsRes.data) ? jobsRes.data : jobsRes.data.jobs || [];
        const applications = Array.isArray(appsRes.data) ? appsRes.data : appsRes.data.applications || [];
        const interviews = Array.isArray(interviewsRes.data) ? interviewsRes.data : interviewsRes.data.interviews || [];
        const employees = Array.isArray(employeesRes.data) ? employeesRes.data : employeesRes.data.employees || [];

        const activeJobs = jobs.filter(job => job.isActive).length;
        const totalJobs = jobs.length;

        const today = new Date();
        const newApplications = applications.filter(app => {
          const appliedDate = new Date(app.appliedDate);
          return appliedDate >= new Date(today.setDate(today.getDate() - 7));
        }).length;

        const interviewsScheduled = interviews.length;

        const now = new Date();
        const hiredThisMonth = employees.filter(emp => {
          const hireDate = new Date(emp.hireDate);
          return hireDate.getMonth() === now.getMonth() && hireDate.getFullYear() === now.getFullYear();
        }).length;

        const departments = ['Engineering', 'Design', 'Product'];
        const departmentStats = departments.map(dept => {
          const deptJobs = jobs.filter(job => job.department === dept);
          const deptApplications = applications.filter(app => deptJobs.find(j => j.id === app.jobId));
          const deptHires = employees.filter(emp => deptJobs.find(j => j.id === emp.jobId));
          return {
            name: dept,
            openPositions: deptJobs.filter(j => j.isActive).length,
            applications: deptApplications.length,
            hires: deptHires.length
          };
        });

        setDashboardData({
          totalJobs,
          activeJobs,
          totalApplications: applications.length,
          newApplications,
          interviewsScheduled,
          hiredThisMonth,
          rejectedApplications: applications.filter(app => app.status === 'rejected').length,
          averageTimeToHire: Math.round(employees.reduce((sum, emp) => sum + (emp.daysToHire || 0), 0) / (employees.length || 1)),
          topPerformingJobs: jobs.sort((a, b) => (b.applications?.length || 0) - (a.applications?.length || 0)).slice(0, 3),
          recentApplications: applications.slice(-5).reverse(),
          upcomingInterviews: interviews.slice(0, 5),
          departmentStats
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'interview': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'hired': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'interview': return <Calendar className="h-4 w-4" />;
      case 'review': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const StatusBadge = ({ status }) => (
    <Badge className={`${getStatusColor(status)} flex items-center gap-1`}>
      {getStatusIcon(status)}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );

  const RatingStars = ({ rating }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} className={`h-3 w-3 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      ))}
      <span className="text-xs text-gray-600 ml-1">({rating})</span>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your recruitment and HR activities | <LiveClock />
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Post New Job
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Jobs Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Jobs</p>
                <p className="text-3xl font-bold text-blue-800">{dashboardData.activeJobs}</p>
                <p className="text-xs text-blue-600 mt-1">of {dashboardData.totalJobs} total</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Applications Card */}
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Applications</p>
                <p className="text-3xl font-bold text-green-800">{dashboardData.totalApplications}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +{dashboardData.newApplications} new
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interviews Card */}
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Interviews</p>
                <p className="text-3xl font-bold text-purple-800">{dashboardData.interviewsScheduled}</p>
                <p className="text-xs text-purple-600 mt-1">scheduled this week</p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hired This Month Card */}
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Hired This Month</p>
                <p className="text-3xl font-bold text-orange-800">{dashboardData.hiredThisMonth}</p>
                <p className="text-xs text-orange-600 mt-1">Avg. {dashboardData.averageTimeToHire} days</p>
              </div>
              <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-white" />
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Applications
                  </CardTitle>
                  <CardDescription>Latest job applications received</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-full text-white font-bold text-sm">
                      {application.applicantName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{application.applicantName}</h4>
                      <p className="text-sm text-gray-600">{application.position}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <RatingStars rating={application.rating} />
                        <span className="text-xs text-gray-500">
                          Applied {new Date(application.appliedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={application.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Upcoming Interviews */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Interviews
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardData.upcomingInterviews.map((interview) => (
                <div key={interview.id} className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{interview.applicantName}</h4>
                    <Badge variant="outline" className="text-xs bg-white">
                      {interview.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{interview.position}</p>
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <Calendar className="h-3 w-3" />
                    {new Date(interview.date).toLocaleDateString()} at {interview.time}
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                View Schedule
              </Button>
            </CardContent>
          </Card>

          {/* Top Performing Jobs */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Performing Jobs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardData.topPerformingJobs.map((job, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm truncate">{job.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {job.applications}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{job.company}</p>
                  <div className="mt-2">
                    <Progress value={(job.applications / 50) * 100} className="h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Department Statistics */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Department Overview
              </CardTitle>
              <CardDescription>Hiring statistics by department</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dashboardData.departmentStats.map((dept, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                <h3 className="font-semibold text-lg mb-3">{dept.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Open Positions</span>
                    <span className="font-medium">{dept.openPositions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Applications</span>
                    <span className="font-medium">{dept.applications}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Hires</span>
                    <span className="font-medium text-green-600">{dept.hires}</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Success Rate</span>
                      <span>{Math.round((dept.hires / dept.applications) * 100)}%</span>
                    </div>
                    <Progress value={(dept.hires / dept.applications) * 100} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common HR tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col gap-2 bg-blue-600 hover:bg-blue-700" variant="default">
              <Plus className="h-6 w-6" />
              Post Job
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Users className="h-6 w-6" />
              Review Applications
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Calendar className="h-6 w-6" />
              Schedule Interview
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <BarChart3 className="h-6 w-6" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

