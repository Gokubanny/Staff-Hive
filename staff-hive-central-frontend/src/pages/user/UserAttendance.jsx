// src/components/UserAttendance.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Calendar,
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  History,
  BarChart3,
  AlertCircle,
  User
} from 'lucide-react';
import { useAttendance } from '../../contexts/AttendanceContext';
import { useAuth } from '../../contexts/AuthContext';

const UserAttendance = () => {
  const { user } = useAuth();
  const {
    todayAttendance,
    isLoading,
    error,
    checkIn,
    checkOut,
    loadTodayAttendance,
    calculateDuration,
    clearError
  } = useAttendance();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState('Loading...');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [actionLoading, setActionLoading] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Monitor online status
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

  // Sync offline actions
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      offlineQueue.forEach(async (action) => {
        try {
          if (action.type === 'checkin') await checkIn(action.data);
          if (action.type === 'checkout') await checkOut(action.data.employeeId);
        } catch (err) {
          console.error('Offline action failed:', err);
        }
      });
      setOfflineQueue([]);
      if (user?.employeeId) loadTodayAttendance(user.employeeId);
    }
  }, [isOnline, offlineQueue, checkIn, checkOut, loadTodayAttendance, user?.employeeId]);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocation('Office - Lagos, Nigeria'),
        () => setLocation('Location unavailable')
      );
    } else {
      setLocation('Location not supported');
    }
  }, []);

  // Load today's attendance on mount
  const loadAttendance = useCallback(() => {
    if (user?.employeeId) loadTodayAttendance(user.employeeId);
  }, [user?.employeeId, loadTodayAttendance]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  // ✅ Handle Check In with instant UI update
  const handleCheckIn = async () => {
    if (!user) return;

    setActionLoading(true);
    clearError();
    const now = new Date();
    const attendanceData = {
      employeeId: user.employeeId,
      name: user.name,
      department: user.department,
      email: user.email,
      checkInTime: now.toISOString(),
      checkOutTime: null
    };

    try {
      if (isOnline) {
        await checkIn(attendanceData);
        // instantly reflect in UI
        loadTodayAttendance(user.employeeId, attendanceData);
      } else {
        setOfflineQueue(prev => [...prev, { type: 'checkin', data: attendanceData }]);
        loadTodayAttendance(user.employeeId, attendanceData);
      }
    } catch (err) {
      console.error('Check-in failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Handle Check Out with instant UI update
  const handleCheckOut = async () => {
    if (!user?.employeeId) return;

    setActionLoading(true);
    clearError();
    const now = new Date();

    try {
      if (isOnline) {
        await checkOut(user.employeeId);
        loadTodayAttendance(user.employeeId, {
          ...todayAttendance,
          checkOutTime: now.toISOString()
        });
      } else {
        setOfflineQueue(prev => [...prev, { type: 'checkout', data: { employeeId: user.employeeId } }]);
        loadTodayAttendance(user.employeeId, {
          ...todayAttendance,
          checkOutTime: now.toISOString()
        });
      }
    } catch (err) {
      console.error('Check-out failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = () => loadAttendance();

  const formatTime = (date) => {
    if (!date) return '--:--:--';
    const d = new Date(date);
    if (isNaN(d)) return '--:--:--';
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = date => date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const getCurrentStatus = () => {
    if (!todayAttendance) return 'not-started';
    if (todayAttendance.checkInTime && !todayAttendance.checkOutTime) return 'working';
    if (todayAttendance.checkInTime && todayAttendance.checkOutTime) return 'completed';
    return 'not-started';
  };

  const getStatusBadge = () => {
    const status = getCurrentStatus();
    switch (status) {
      case 'working':
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><Activity className="h-3 w-3" />Working</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1"><CheckCircle className="h-3 w-3" />Day Complete</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1"><Clock className="h-3 w-3" />Not Started</Badge>;
    }
  };

  const isCheckedIn = getCurrentStatus() === 'working';
  const isCompleted = getCurrentStatus() === 'completed';
  const currentDuration = todayAttendance 
    ? calculateDuration(todayAttendance.checkInTime, todayAttendance.checkOutTime || null)
    : '--';

  if (isLoading && !todayAttendance) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading attendance data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600 mt-1">Track your daily attendance and working hours</p>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-sm text-gray-500">
              Welcome back, {user?.name} ({user?.employeeId})
            </p>
            <div className="flex items-center gap-1">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Current Time</p>
          <p className="text-2xl font-bold text-blue-600">{formatTime(currentTime)}</p>
          <p className="text-sm text-gray-600">{formatDate(currentTime)}</p>
        </div>
      </div>
  
      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={clearError}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}
  
      {/* Offline Warning */}
      {!isOnline && (
        <Alert className="border-orange-200 bg-orange-50">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">You're Offline</AlertTitle>
          <AlertDescription className="text-orange-700">
            Your attendance will be synced when you're back online. You can still check in/out offline.
          </AlertDescription>
        </Alert>
      )}
  
      {/* Today's Status Card */}
      <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6 text-blue-600" />
                Today's Status
              </CardTitle>
              <CardDescription>Your current attendance status for today</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm font-medium text-gray-600">Check In Time</p>
              <p className="text-xl font-bold text-green-600">
                {todayAttendance?.checkInTime ? formatTime(todayAttendance.checkInTime) : '--:--:--'}
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm font-medium text-gray-600">Check Out Time</p>
              <p className="text-xl font-bold text-red-600">
                {todayAttendance?.checkOutTime ? formatTime(todayAttendance.checkOutTime) : '--:--:--'}
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm font-medium text-gray-600">Duration</p>
              <p className="text-xl font-bold text-blue-600">{currentDuration}</p>
            </div>
          </div>
        </CardContent>
      </Card>
  
      {/* Check In/Out Actions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-600" />
            Mark Attendance
          </CardTitle>
          <CardDescription>Click to check in when you arrive and check out when you leave</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleCheckIn}
              disabled={isCheckedIn || isCompleted || actionLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 h-12"
            >
              {actionLoading ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5 mr-2" />
              )}
              {isCheckedIn || isCompleted ? 'Already Checked In' : 'Check In'}
            </Button>
            <Button 
              onClick={handleCheckOut}
              disabled={!isCheckedIn || isCompleted || actionLoading}
              variant="outline"
              className="flex-1 border-red-600 text-red-600 hover:bg-red-50 h-12"
            >
              {actionLoading ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-5 w-5 mr-2" />
              )}
              {isCompleted ? 'Already Checked Out' : 'Check Out'}
            </Button>
          </div>
          
          {/* Status Messages */}
          {!isCheckedIn && !isCompleted && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-800 font-medium">Ready to start your day?</p>
              </div>
              <p className="text-xs text-blue-600 mt-1">Click "Check In" when you arrive at your workplace.</p>
            </div>
          )}
  
          {isCheckedIn && !isCompleted && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-800 font-medium">You're currently checked in</p>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Working time: {currentDuration}. Don't forget to check out when you finish work.
              </p>
            </div>
          )}
  
          {isCompleted && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-800 font-medium">Day completed!</p>
              </div>
              <p className="text-xs text-blue-600 mt-1">You worked for {currentDuration} today. Great job!</p>
            </div>
          )}
        </CardContent>
      </Card>
  
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Manage your attendance records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <History className="h-4 w-4 mr-2" />
              View Attendance History
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Monthly Summary
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Request Leave
            </Button>
          </CardContent>
        </Card>
  
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Today's Summary</CardTitle>
            <CardDescription>Your attendance statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status</span>
              <span className="font-medium">
                {getCurrentStatus() === 'working' ? 'Active' : 
                 getCurrentStatus() === 'completed' ? 'Completed' : 'Not Started'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Time Worked</span>
              <span className="font-medium">{currentDuration}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Location</span>
              <span className="font-medium text-xs">{location}</span>
            </div>
            {!isOnline && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sync Status</span>
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Pending
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserAttendance;
