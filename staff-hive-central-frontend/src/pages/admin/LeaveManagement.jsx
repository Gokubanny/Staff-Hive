// src/components/AdminLeaveManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  FileText, 
  Filter, 
  Search, 
  Bell,
  Download,
  RefreshCw,
  Eye,
  AlertCircle,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useLeave } from '../../contexts/LeaveContext';

const AdminLeaveManagement = () => {
  const {
    leaveRequests,
    isLoading,
    error,
    loadAllLeaveRequests,
    updateLeaveStatus,
    getLeaveStatistics,
    clearError
  } = useLeave();

  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [showNotification, setShowNotification] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // Load leave requests on component mount
  useEffect(() => {
    loadAllLeaveRequests();
  }, [loadAllLeaveRequests]);

  // Load statistics
  useEffect(() => {
    const loadStats = async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      
      const stats = await getLeaveStatistics(
        startOfMonth.toISOString().split('T')[0],
        endOfMonth.toISOString().split('T')[0]
      );
      
      setStatistics(stats);
    };

    loadStats();
  }, [getLeaveStatistics, leaveRequests]);

  // Listen for new requests
  useEffect(() => {
    const handleNewRequest = (event) => {
      const { request, isNew } = event.detail;
      if (isNew) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
        // Refresh the list
        loadAllLeaveRequests();
      }
    };

    window.addEventListener('leaveRequestSubmitted', handleNewRequest);
    
    return () => {
      window.removeEventListener('leaveRequestSubmitted', handleNewRequest);
    };
  }, [loadAllLeaveRequests]);

  const handleApprove = async (request) => {
    setActionLoading(true);
    clearError();

    try {
      await updateLeaveStatus(request.requestId || request.id, 'approved');
      setShowNotification(false);
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowRejectDialog(true);
    setRejectionReason('');
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    clearError();

    try {
      await updateLeaveStatus(
        selectedRequest.requestId || selectedRequest.id, 
        'rejected', 
        rejectionReason
      );
      setShowRejectDialog(false);
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const exportData = {
        requests: filteredRequests,
        statistics: statistics,
        filters: { activeTab, searchTerm, filterType, filterDepartment },
        exportDate: new Date().toISOString(),
        totalCount: filteredRequests.length
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leave-requests-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const filteredRequests = leaveRequests.filter(request => {
    const matchesTab = activeTab === 'all' || request.status === activeTab;
    const matchesSearch = 
      (request.employeeName || request.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || request.leaveType === filterType;
    const matchesDepartment = filterDepartment === 'all' || request.department === filterDepartment;

    return matchesTab && matchesSearch && matchesType && matchesDepartment;
  });

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return `px-3 py-1 rounded-full text-sm border ${colors[status] || colors.pending}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const pendingRequests = leaveRequests.filter(r => r.status === 'pending');
  const approvedRequests = leaveRequests.filter(r => r.status === 'approved');
  const rejectedRequests = leaveRequests.filter(r => r.status === 'rejected');

  // Get unique departments and leave types for filters
  const departments = [...new Set(leaveRequests.map(r => r.department).filter(Boolean))];
  const leaveTypes = [...new Set(leaveRequests.map(r => r.leaveType).filter(Boolean))];

  return (
    <div className="p-6 bg-gray-50 min-h-screen ml-64">
      <div className="max-w-7xl mx-auto">
        {/* New Request Notification */}
        {showNotification && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-blue-400 mr-3" />
              <div>
                <p className="text-blue-700 font-medium">New Leave Request</p>
                <p className="text-blue-600 text-sm">A new leave request has been submitted and is pending your review.</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto"
                onClick={() => setShowNotification(false)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
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

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Leave Management</h1>
            <p className="text-gray-600">Manage employee leave requests and approvals</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => loadAllLeaveRequests()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={handleExport}
              disabled={filteredRequests.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700">Pending Requests</p>
                  <p className="text-2xl font-bold text-yellow-800">{pendingRequests.length}</p>
                </div>
                <div className="relative">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  {pendingRequests.length > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {pendingRequests.length}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Approved</p>
                  <p className="text-2xl font-bold text-green-800">{approvedRequests.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700">Rejected</p>
                  <p className="text-2xl font-bold text-red-800">{rejectedRequests.length}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Total Days</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {leaveRequests.reduce((sum, r) => sum + (r.days || 0), 0)}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by name, ID, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Leave Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leave Types</SelectItem>
                  {leaveTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

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

              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {filteredRequests.length} of {leaveRequests.length} requests
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card className="shadow-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'pending', label: 'Pending', count: pendingRequests.length },
                { key: 'approved', label: 'Approved', count: approvedRequests.length },
                { key: 'rejected', label: 'Rejected', count: rejectedRequests.length },
                { key: 'all', label: 'All Requests', count: leaveRequests.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                  {tab.key === 'pending' && tab.count > 0 && (
                    <span className="ml-2 w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Leave Requests */}
          <CardContent className="p-6">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {leaveRequests.length === 0 ? 'No Leave Requests Yet' : 'No Matching Requests'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {leaveRequests.length === 0 
                    ? "No leave requests have been submitted yet" 
                    : 'No requests match your current filters'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request.requestId || request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {request.employeeName || request.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {request.employeeId && `${request.employeeId} • `}
                            {request.department}
                          </p>
                          {request.email && (
                            <p className="text-sm text-gray-400">{request.email}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <span className={getStatusBadge(request.status)}>
                          {(request.status || 'pending').charAt(0).toUpperCase() + (request.status || 'pending').slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Leave Type</p>
                        <p className="font-medium">{request.leaveType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium">
                          {formatDate(request.startDate)} to {formatDate(request.endDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Days</p>
                        <p className="font-medium">{request.days || 'N/A'} days</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Applied Date</p>
                        <p className="font-medium">{formatDate(request.appliedDate || request.submittedAt)}</p>
                      </div>
                    </div>

                    {request.reason && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Reason</p>
                        <p className="text-gray-900 text-sm">{request.reason}</p>
                      </div>
                    )}

                    {request.emergencyContact && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Emergency Contact</p>
                        <p className="text-gray-900 text-sm">{request.emergencyContact}</p>
                      </div>
                    )}

                    {request.status === 'rejected' && request.rejectionReason && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">
                          <strong>Rejection Reason:</strong> {request.rejectionReason}
                        </p>
                      </div>
                    )}

                    {(request.status === 'pending' || !request.status) && (
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => handleApprove(request)}
                          disabled={actionLoading}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {actionLoading ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(request)}
                          disabled={actionLoading}
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    )}

                    {(request.status === 'approved' || request.status === 'rejected') && (
                      <div className="text-sm text-gray-500 pt-2 border-t">
                        {(request.status || '').charAt(0).toUpperCase() + (request.status || '').slice(1)} by {request[`${request.status}By`] || 'Admin'} on {formatDate(request[`${request.status}Date`])}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rejection Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Leave Request</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting {selectedRequest?.employeeName || selectedRequest?.name}'s leave request.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {actionLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminLeaveManagement;