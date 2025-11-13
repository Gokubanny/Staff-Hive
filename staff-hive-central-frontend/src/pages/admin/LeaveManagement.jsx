// src/pages/admin/LeaveManagement.jsx - Mobile Responsive Version
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle, XCircle, User, FileText, Filter, Search, 
  Bell, Download, RefreshCw, Eye, AlertCircle, Menu, X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const API_BASE_URL = "https://staff-hive-backend.onrender.com/api";

const AdminLeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [showNotification, setShowNotification] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRequest, setExpandedRequest] = useState(null);

  // Load leave requests
  const loadAllLeaveRequests = async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE_URL}/leave/admin/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setLeaveRequests(result.data || []);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch leave requests');
      }
    } catch (error) {
      console.error('Error loading leave requests:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update leave status
  const updateLeaveStatus = async (requestId, status, reason = '') => {
    try {
      setActionLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/leave/admin/update-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requestId, status, reason })
      });

      const result = await response.json();
      
      if (response.ok) {
        // Update local state
        setLeaveRequests(prev => 
          prev.map(req => 
            (req._id === requestId || req.requestId === requestId) 
              ? { ...req, status, rejectionReason: reason } 
              : req
          )
        );
        return result;
      } else {
        throw new Error(result.message || 'Failed to update leave status');
      }
    } catch (error) {
      console.error('Error updating leave status:', error);
      setError(error.message);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const clearError = () => setError(null);

  // Load leave requests on component mount
  useEffect(() => {
    loadAllLeaveRequests();
  }, []);

  const handleApprove = async (request) => {
    setActionLoading(true);
    clearError();

    try {
      const requestId = request.requestId || request._id;
      await updateLeaveStatus(requestId, 'approved');
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
      const requestId = selectedRequest.requestId || selectedRequest._id;
      await updateLeaveStatus(requestId, 'rejected', rejectionReason);
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
    return `px-2 py-1 rounded-full text-xs sm:text-sm border ${colors[status] || colors.pending}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />;
      default: return <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />;
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
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-6">
      {/* Mobile-friendly container */}
      <div className="w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="text-sm">
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2 h-6 text-xs"
                  onClick={clearError}
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Header - Mobile Responsive */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leave Management</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Manage employee leave requests</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => loadAllLeaveRequests()}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none"
                >
                  <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <Button 
                  size="sm"
                  onClick={handleExport}
                  disabled={filteredRequests.length === 0}
                  className="flex-1 sm:flex-none"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards - Mobile Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-yellow-700">Pending</p>
                    <p className="text-xl sm:text-2xl font-bold text-yellow-800">{pendingRequests.length}</p>
                  </div>
                  <div className="relative">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                    {pendingRequests.length > 0 && (
                      <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center">
                        {pendingRequests.length}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-green-700">Approved</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-800">{approvedRequests.length}</p>
                  </div>
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-red-700">Rejected</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-800">{rejectedRequests.length}</p>
                  </div>
                  <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-blue-700">Total Days</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-800">
                      {leaveRequests.reduce((sum, r) => sum + (r.days || 0), 0)}
                    </p>
                  </div>
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters - Mobile Responsive */}
          <Card className="shadow-lg mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-4">
              {/* Mobile: Toggle button for filters */}
              <div className="lg:hidden mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
              </div>

              {/* Search - Always visible */}
              <div className="mb-3 lg:mb-0">
                <div className="relative">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 sm:pl-10 text-sm"
                  />
                </div>
              </div>

              {/* Filters - Collapsible on mobile */}
              <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="text-sm">
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
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <span>{filteredRequests.length} of {leaveRequests.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs - Mobile Scrollable */}
          <Card className="shadow-lg">
            <div className="border-b border-gray-200 overflow-x-auto">
              <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max">
                {[
                  { key: 'pending', label: 'Pending', count: pendingRequests.length },
                  { key: 'approved', label: 'Approved', count: approvedRequests.length },
                  { key: 'rejected', label: 'Rejected', count: rejectedRequests.length },
                  { key: 'all', label: 'All', count: leaveRequests.length }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label} ({tab.count})
                    {tab.key === 'pending' && tab.count > 0 && (
                      <span className="ml-1 sm:ml-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full inline-block"></span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Leave Requests - Mobile Optimized */}
            <CardContent className="p-3 sm:p-4 lg:p-6">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    {leaveRequests.length === 0 ? 'No Leave Requests Yet' : 'No Matching Requests'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {leaveRequests.length === 0 
                      ? "No leave requests have been submitted yet" 
                      : 'No requests match your current filters'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {filteredRequests.map((request) => (
                    <div key={request.requestId || request._id} className="border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                              {request.employeeName || request.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                              {request.employeeId && `${request.employeeId} • `}
                              {request.department}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
                          {getStatusIcon(request.status)}
                          <span className={getStatusBadge(request.status)}>
                            {(request.status || 'pending').charAt(0).toUpperCase() + (request.status || 'pending').slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Details Grid - Responsive */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Leave Type</p>
                          <p className="font-medium text-sm sm:text-base">{request.leaveType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Days</p>
                          <p className="font-medium text-sm sm:text-base">{request.days || 'N/A'} days</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="font-medium text-sm sm:text-base">
                            {formatDate(request.startDate)} to {formatDate(request.endDate)}
                          </p>
                        </div>
                      </div>

                      {/* Reason - Collapsible on mobile */}
                      {request.reason && (
                        <div className="mb-3 sm:mb-4">
                          <button
                            onClick={() => setExpandedRequest(expandedRequest === request._id ? null : request._id)}
                            className="text-xs text-gray-500 mb-1 flex items-center gap-1 sm:hidden"
                          >
                            <Eye className="w-3 h-3" />
                            {expandedRequest === request._id ? 'Hide' : 'Show'} reason
                          </button>
                          <p className={`text-xs sm:text-sm text-gray-500 mb-1 ${expandedRequest === request._id ? 'block' : 'hidden sm:block'}`}>Reason</p>
                          <p className={`text-gray-900 text-xs sm:text-sm ${expandedRequest === request._id ? 'block' : 'hidden sm:block'}`}>
                            {request.reason}
                          </p>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {request.status === 'rejected' && request.rejectionReason && (
                        <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs sm:text-sm text-red-600">
                            <strong>Rejection Reason:</strong> {request.rejectionReason}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons - Mobile Optimized */}
                      {(request.status === 'pending' || !request.status) && (
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <Button
                            onClick={() => handleApprove(request)}
                            disabled={actionLoading}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm w-full sm:w-auto"
                            size="sm"
                          >
                            {actionLoading ? (
                              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                            )}
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(request)}
                            disabled={actionLoading}
                            variant="outline"
                            className="border-red-600 text-red-600 hover:bg-red-50 text-sm w-full sm:w-auto"
                            size="sm"
                          >
                            <XCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {/* Status Info */}
                      {(request.status === 'approved' || request.status === 'rejected') && (
                        <div className="text-xs sm:text-sm text-gray-500 pt-2 border-t">
                          {(request.status || '').charAt(0).toUpperCase() + (request.status || '').slice(1)} by {request[`${request.status}By`] || 'Admin'} on {formatDate(request[`${request.status}Date`])}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rejection Dialog - Mobile Optimized */}
          <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
            <DialogContent className="w-[95vw] max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Reject Leave Request</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Please provide a reason for rejecting {selectedRequest?.employeeName || selectedRequest?.name}'s leave request.
                </DialogDescription>
              </DialogHeader>
              <div className="py-3 sm:py-4">
                <Textarea
                  placeholder="Enter rejection reason..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[80px] sm:min-h-[100px] text-sm"
                />
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(false)}
                  disabled={actionLoading}
                  className="w-full sm:w-auto"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmReject}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                  size="sm"
                >
                  {actionLoading ? (
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  )}
                  Confirm Rejection
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default AdminLeaveManagement;