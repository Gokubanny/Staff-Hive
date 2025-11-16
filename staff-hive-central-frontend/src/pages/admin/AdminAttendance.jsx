// src/components/AdminAttendance.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Users, Clock, CheckCircle, XCircle, AlertCircle, Calendar, Download, Search, Filter, Eye,
  TrendingUp, MapPin, Timer, Activity, BarChart3, RefreshCw, UserCheck, Settings, Wifi, WifiOff
} from 'lucide-react';
import { useAttendance } from '../../contexts/AttendanceContext';

const AdminAttendance = () => {
  const navigate = useNavigate();
  const {
    attendanceRecords,
    isLoading,
    error,
    getAllAttendanceByDate,
    calculateDuration,
    clearError
  } = useAttendance();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [dailyStats, setDailyStats] = useState({
    totalEmployees: 0,
    present: 0,
    checkedOut: 0,
    stillWorking: 0,
    averageWorkTime: '0h 0m',
    onTimeRate: 100
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const departments = ['Engineering', 'Design', 'Marketing', 'HR', 'Sales', 'Operations', 'Finance'];

  // --- Functions ---
  const calculateStats = useCallback((data) => {
    if (!Array.isArray(data)) return;

    const present = data.length;
    const checkedOut = data.filter(r => r.checkOutTime && r.checkOutTime !== '--').length;
    const stillWorking = present - checkedOut;

    const completedRecords = data.filter(r => r.checkInTime && r.checkInTime !== '--' && r.checkOutTime && r.checkOutTime !== '--');
    let totalMinutes = 0;
    completedRecords.forEach(r => {
      const duration = calculateDuration(r.checkInTime, r.checkOutTime);
      const parts = duration.match(/(\d+)h (\d+)m/);
      if (parts) totalMinutes += parseInt(parts[1]) * 60 + parseInt(parts[2]);
    });

    const avgMinutes = completedRecords.length ? totalMinutes / completedRecords.length : 0;
    const avgHours = Math.floor(avgMinutes / 60);
    const avgMins = Math.round(avgMinutes % 60);
    const averageWorkTime = `${avgHours}h ${avgMins}m`;

    const onTimeCount = data.filter(r => {
      if (!r.checkInTime || r.checkInTime === '--') return false;
      const [h, m] = r.checkInTime.split(':').map(Number);
      return h < 9 || (h === 9 && m === 0);
    }).length;
    const onTimeRate = present ? Math.round((onTimeCount / present) * 100) : 100;

    setDailyStats({ totalEmployees: present, present, checkedOut, stillWorking, averageWorkTime, onTimeRate });
  }, [calculateDuration]);

  const determineStatus = useCallback(record => {
    if (!record.checkInTime || record.checkInTime === '--') return 'absent';
    if (record.checkInTime && record.checkOutTime && record.checkOutTime !== '--') return 'completed';
    return 'working';
  }, []);

  const getStatusColor = useCallback(status => {
    switch (status) {
      case 'working': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  const getStatusIcon = useCallback(status => {
    switch (status) {
      case 'working': return <Activity className="h-4 w-4 text-green-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  }, []);

  const openDetailsDialog = useCallback(record => {
    setSelectedRecord(record);
    setShowDetailsDialog(true);
  }, []);

  const formatDate = useCallback(date => new Date(date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }), []);

  const exportData = useCallback(() => {
    if (!attendanceRecords.length) return alert('No attendance data to export');

    const csv = [
      ['Employee ID', 'Name', 'Department', 'Check In', 'Check Out', 'Duration', 'Location', 'Status'].join(','),
      ...attendanceRecords.map(r => [
        r.employeeId || '', r.name || '', r.department || '', r.checkInTime || '',
        r.checkOutTime || '', calculateDuration(r.checkInTime, r.checkOutTime),
        r.location || '', determineStatus(r)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance-${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [attendanceRecords, selectedDate, calculateDuration, determineStatus]);

  const filteredData = attendanceRecords.filter(r => {
    const matchesSearch = r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDepartment === 'all' || r.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || determineStatus(r) === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // --- Effects ---
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshData = useCallback(async () => {
    clearError();
    try {
      const data = await getAllAttendanceByDate(selectedDate);
      calculateStats(data);
    } catch (err) {
      console.error('Error loading attendance:', err);
    }
  }, [selectedDate, getAllAttendanceByDate, calculateStats, clearError]);


  // --- JSX ---
  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Attendance Management</h1>
            {isOnline ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <Wifi className="h-3 w-3 mr-1" /> Online
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800 border-red-200">
                <WifiOff className="h-3 w-3 mr-1" /> Offline
              </Badge>
            )}
          </div>
          <p className="text-gray-600 mt-1">Monitor real-time employee attendance records</p>
          <p className="text-sm text-gray-500">Viewing data for {formatDate(selectedDate)}</p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" className="ml-2" onClick={clearError}>Dismiss</Button>
          </AlertDescription>
        </Alert>
      )}

      {!isOnline && (
        <Alert className="border-orange-200 bg-orange-50">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">You're Offline</AlertTitle>
          <AlertDescription className="text-orange-700">
            Showing cached data. Some features may be limited until you're back online.
          </AlertDescription>
        </Alert>
      )}

      {/* Daily Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Present */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <UserCheck className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-xl md:text-2xl font-bold text-blue-800">{dailyStats.present}</p>
            <p className="text-xs text-blue-600">Present Today</p>
          </CardContent>
        </Card>
        {/* Working */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <Activity className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-xl md:text-2xl font-bold text-green-800">{dailyStats.stillWorking}</p>
            <p className="text-xs text-green-600">Working</p>
          </CardContent>
        </Card>
        {/* Completed */}
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-gray-500 mx-auto mb-2" />
            <p className="text-xl md:text-2xl font-bold text-gray-800">{dailyStats.checkedOut}</p>
            <p className="text-xs text-gray-600">Completed</p>
          </CardContent>
        </Card>
        {/* On Time */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-xl md:text-2xl font-bold text-purple-800">{dailyStats.onTimeRate}%</p>
            <p className="text-xs text-purple-600">On Time</p>
          </CardContent>
        </Card>
        {/* Avg Time */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4 text-center">
            <Timer className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-lg md:text-xl font-bold text-yellow-800">{dailyStats.averageWorkTime}</p>
            <p className="text-xs text-yellow-600">Avg Time</p>
          </CardContent>
        </Card>
        {/* Completion */}
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
            <p className="text-xl md:text-2xl font-bold text-indigo-800">
              {dailyStats.present > 0 ? Math.round((dailyStats.checkedOut / dailyStats.present) * 100) : 0}%
            </p>
            <p className="text-xs text-indigo-600">Completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, employee ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="working">Currently Working</SelectItem>
                  <SelectItem value="completed">Day Completed</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {filteredData.length} of {attendanceRecords.length} records
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Attendance List */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Today's Attendance ({filteredData.length})
              </CardTitle>
              <CardDescription>
                Real-time attendance for {formatDate(selectedDate)}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && filteredData.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-muted-foreground">Loading attendance data...</p>
            </div>
          ) : filteredData.length > 0 ? (
            filteredData.map((record) => {
              const status = determineStatus(record);
              const duration = calculateDuration(record.checkInTime, record.checkOutTime);

              return (
                <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  {/* Mobile Layout */}
                  <div className="block lg:hidden">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {record.name ? record.name.split(' ').map(n => n[0]).join('') : '??'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{record.name || 'Unknown'}</h4>
                          <p className="text-sm text-gray-600">{record.employeeId || 'N/A'}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(status)} flex items-center gap-1`}>
                        {getStatusIcon(status)}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Check In</p>
                        <p className="font-semibold text-green-600">{record.checkInTime || '--'}</p>
                      </div>
                      <div className="bg-red-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Check Out</p>
                        <p className="font-semibold text-red-600">{record.checkOutTime || '--'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{record.department || 'N/A'}</span>
                        <span>•</span>
                        <span>{duration}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetailsDialog(record)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                      <MapPin className="h-3 w-3" />
                      {record.location || 'Unknown'}
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:flex lg:items-center lg:justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {record.name ? record.name.split(' ').map(n => n[0]).join('') : '??'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{record.name || 'Unknown'}</h4>
                        <p className="text-sm text-gray-600">{record.employeeId || 'N/A'} • {record.department || 'N/A'}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{record.location || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Check In</p>
                        <p className="font-semibold text-green-600">{record.checkInTime || '--'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Check Out</p>
                        <p className="font-semibold text-red-600">{record.checkOutTime || '--'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-semibold">{duration}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={`${getStatusColor(status)} flex items-center gap-1`}>
                          {getStatusIcon(status)}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailsDialog(record)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendance Records</h3>
              <p className="text-sm">No employees have checked in yet for {formatDate(selectedDate)}.</p>
              <p className="text-sm mt-2">Records will appear here as employees mark their attendance.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button
            className="justify-start"
            variant="outline"
            disabled={attendanceRecords.length === 0}
            onClick={exportData}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button
            className="justify-start"
            variant="outline"
            onClick={() => navigate('/dashboard/reports')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Historical Data
          </Button>
          <Button
            className="justify-start"
            variant="outline"
            onClick={() => navigate('/dashboard/employees')}
          >
            <Users className="h-4 w-4 mr-2" />
            Employee List
          </Button>
          <Button
            className="justify-start"
            variant="outline"
            onClick={() => navigate('/dashboard/settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Attendance Details</DialogTitle>
            <DialogDescription>
              Detailed information for {selectedRecord?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Employee ID</p>
                  <p className="font-medium">{selectedRecord.employeeId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{selectedRecord.department || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Check In Time</p>
                  <p className="font-medium text-green-600">{selectedRecord.checkInTime || '--'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Check Out Time</p>
                  <p className="font-medium text-red-600">{selectedRecord.checkOutTime || '--'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Duration</p>
                <p className="font-medium">{calculateDuration(selectedRecord.checkInTime, selectedRecord.checkOutTime)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{selectedRecord.location || 'Unknown'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge className={`${getStatusColor(determineStatus(selectedRecord))} flex items-center gap-1`}>
                  {getStatusIcon(determineStatus(selectedRecord))}
                  {determineStatus(selectedRecord).charAt(0).toUpperCase() + determineStatus(selectedRecord).slice(1)}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAttendance;








