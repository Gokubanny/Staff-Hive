import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useJobs } from '@/contexts/JobContext';
import { toast } from '@/components/ui/use-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Users,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Eye,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

export default function Reports() {
  const { jobs = [], applications = [], company } = useJobs();
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [selectedReport, setSelectedReport] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalJobs = jobs.length;
    const totalApplications = applications.length;
    const openJobs = jobs.filter(job => job.status === 'open').length;
    const closedJobs = jobs.filter(job => job.status === 'closed').length;
    
    const pendingApplications = applications.filter(app => app.status === 'pending').length;
    const approvedApplications = applications.filter(app => app.status === 'approved').length;
    const rejectedApplications = applications.filter(app => app.status === 'rejected').length;
    
    return {
      totalJobs,
      totalApplications,
      openJobs,
      closedJobs,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      averageApplicationsPerJob: totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0
    };
  }, [jobs, applications]);

  // Chart data
  const jobStatusData = [
    { name: 'Open', value: metrics.openJobs, color: '#10B981' },
    { name: 'Closed', value: metrics.closedJobs, color: '#6B7280' }
  ];

  const applicationStatusData = [
    { name: 'Pending', value: metrics.pendingApplications, color: '#F59E0B' },
    { name: 'Approved', value: metrics.approvedApplications, color: '#10B981' },
    { name: 'Rejected', value: metrics.rejectedApplications, color: '#EF4444' }
  ];

  // Monthly trends data (mock data for demonstration)
  const monthlyTrends = [
    { month: 'Jan', jobs: 12, applications: 45 },
    { month: 'Feb', jobs: 15, applications: 52 },
    { month: 'Mar', jobs: 18, applications: 68 },
    { month: 'Apr', jobs: 22, applications: 75 },
    { month: 'May', jobs: 20, applications: 82 },
    { month: 'Jun', jobs: 25, applications: 95 }
  ];

  const exportReport = (format) => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      company: company.name,
      metrics,
      jobs: jobs.map(job => ({
        id: job.id,
        title: job.title,
        status: job.status,
        location: job.location,
        postedDate: job.postedDate,
        applications: applications.filter(app => app.jobId === job.id).length
      })),
      applications: applications.map(app => ({
        id: app.id,
        jobId: app.jobId,
        status: app.status,
        appliedDate: app.appliedDate
      }))
    };

    let content, filename, mimeType;

    if (format === 'json') {
      content = JSON.stringify(reportData, null, 2);
      filename = `report-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else if (format === 'csv') {
      const headers = ['Job Title', 'Status', 'Location', 'Posted Date', 'Applications'];
      const rows = reportData.jobs.map(job => [
        job.title,
        job.status,
        job.location,
        job.postedDate,
        job.applications
      ]);
      content = [headers, ...rows].map(row => row.join(',')).join('\n');
      filename = `report-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report exported",
      description: `Report has been exported as ${format.toUpperCase()}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Track your hiring performance and get insights into your recruitment process
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportReport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportReport('json')}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Label>Filters:</Label>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>

            <Button variant="ghost" onClick={() => {
              setFilterStatus('all');
              setDateRange({ from: null, to: null });
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalJobs}</p>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="secondary">{metrics.openJobs} Open</Badge>
              <Badge variant="outline">{metrics.closedJobs} Closed</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalApplications}</p>
                <p className="text-sm text-muted-foreground">Total Applications</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">+12% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.averageApplicationsPerJob}</p>
                <p className="text-sm text-muted-foreground">Avg Applications/Job</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-600">Above industry avg</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-100">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.pendingApplications}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="destructive">Needs Attention</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs value={selectedReport} onValueChange={setSelectedReport} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Job Analytics</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Job Status Distribution</CardTitle>
                <CardDescription>Current status of all job postings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={jobStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {jobStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {jobStatusData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Application Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>Status breakdown of all applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={applicationStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {applicationStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4 flex-wrap">
                  {applicationStatusData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest hiring activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    icon: <CheckCircle className="h-4 w-4 text-green-600" />,
                    title: "Application approved",
                    description: "John Doe's application for Frontend Developer",
                    time: "2 hours ago"
                  },
                  {
                    icon: <Briefcase className="h-4 w-4 text-blue-600" />,
                    title: "New job posted",
                    description: "Backend Developer position in Remote",
                    time: "4 hours ago"
                  },
                  {
                    icon: <Users className="h-4 w-4 text-purple-600" />,
                    title: "New application received",
                    description: "Jane Smith applied for UI/UX Designer",
                    time: "6 hours ago"
                  },
                  {
                    icon: <XCircle className="h-4 w-4 text-red-600" />,
                    title: "Application rejected",
                    description: "Application for Data Scientist position",
                    time: "1 day ago"
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
                    <div className="p-1 rounded-full bg-muted">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Performance</CardTitle>
              <CardDescription>Analytics for your job postings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jobs.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="title" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="applications.length" 
                      fill="#3B82F6" 
                      name="Applications"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{metrics.pendingApplications}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{metrics.approvedApplications}</p>
                    <p className="text-sm text-muted-foreground">Approved</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-red-100">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{metrics.rejectedApplications}</p>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Job postings and applications over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="jobs" 
                      stackId="1" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.6}
                      name="Jobs Posted"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="applications" 
                      stackId="2" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.6}
                      name="Applications Received"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Application Success Rate</span>
              <span className="text-sm font-bold">
                {metrics.totalApplications > 0 
                  ? Math.round((metrics.approvedApplications / metrics.totalApplications) * 100) 
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Time to Fill</span>
              <span className="text-sm font-bold">12 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Most Popular Position</span>
              <span className="text-sm font-bold">Frontend Developer</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Review Pending Applications</p>
                <p className="text-xs text-muted-foreground">
                  {metrics.pendingApplications} applications awaiting your review
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">High Application Rate</p>
                <p className="text-xs text-muted-foreground">
                  Your jobs are receiving above-average applications
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}