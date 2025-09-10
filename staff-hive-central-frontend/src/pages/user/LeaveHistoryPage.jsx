import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, User, FileText, Filter, Search, RefreshCw, Eye, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock current user data - in real app, this would come from auth context
const currentUser = {
  employeeId: 'EMP001',
  name: 'John Doe',
  department: 'Engineering'
};

// Storage manager for leave requests
const LeaveStorage = {
  getAllRequests: () => {
    return JSON.parse(localStorage.getItem('leaveRequests') || '[]');
  },
  
  getUserRequests: (employeeId) => {
    return LeaveStorage.getAllRequests().filter(req => req.employeeId === employeeId);
  }
};

const LeaveHistoryPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [userRequests, setUserRequests] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [expandedRequest, setExpandedRequest] = useState(null);

  // Load user's requests
  const loadUserRequests = () => {
    const requests = LeaveStorage.getUserRequests(currentUser.employeeId);
    // Sort by most recent first
    const sortedRequests = requests.sort((a, b) => new Date(b.submittedAt || b.appliedDate) - new Date(a.submittedAt || a.appliedDate));
    setUserRequests(sortedRequests);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    loadUserRequests();

    // Listen for storage changes (when admin updates status)
    const handleStorageChange = (event) => {
      if (event.key === 'leaveRequests') {
        loadUserRequests();
      }
    };

    // Listen for custom events from admin updates
    const handleRequestUpdate = (event) => {
      const updatedRequest = event.detail;
      if (updatedRequest.employeeId === currentUser.employeeId) {
        loadUserRequests();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('leaveRequestUpdated', handleRequestUpdate);

    // Auto-refresh every 30 seconds to check for updates
    const refreshInterval = setInterval(() => {
      loadUserRequests();
    }, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('leaveRequestUpdated', handleRequestUpdate);
      clearInterval(refreshInterval);
    };
  }, []);

  const filteredRequests = userRequests.filter(request => {
    const matchesTab = activeTab === 'all' || request.status === activeTab;
    const matchesSearch = 
      request.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || request.leaveType === filterType;
    
    return matchesTab && matchesSearch && matchesType;
  });

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    
    return styles[status] || styles.pending;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusMessage = (request) => {
    switch(request.status) {
      case 'pending':
        return 'Your leave request is pending approval from your manager.';
      case 'approved':
        return `Your leave request was approved by ${request.approvedBy || 'Admin'} on ${request.approvedDate}.`;
      case 'rejected':
        return `Your leave request was rejected by ${request.rejectedBy || 'Admin'} on ${request.rejectedDate}.`;
      default:
        return 'Status unknown';
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

  const calculateDaysFromDates = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  const pendingRequests = userRequests.filter(r => r.status === 'pending');
  const approvedRequests = userRequests.filter(r => r.status === 'approved');
  const rejectedRequests = userRequests.filter(r => r.status === 'rejected');

  // Get unique leave types for filter
  const leaveTypes = [...new Set(userRequests.map(r => r.leaveType))];

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave History</h1>
          <p className="text-gray-600 mt-2">
            Track your leave requests and their approval status
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button 
            onClick={loadUserRequests}
            variant="outline" 
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-blue-600">{userRequests.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
              </div>
              <div className="relative">
                <Clock className="w-8 h-8 text-yellow-600" />
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedRequests.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedRequests.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by leave type or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Leave Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Leave Types</option>
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Requests', count: userRequests.length },
              { key: 'pending', label: 'Pending', count: pendingRequests.length },
              { key: 'approved', label: 'Approved', count: approvedRequests.length },
              { key: 'rejected', label: 'Rejected', count: rejectedRequests.length }
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
                  <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Leave Requests List */}
        <CardContent className="p-6">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {userRequests.length === 0 ? 'No Leave Requests Yet' : 'No Matching Requests'}
              </h3>
              <p className="text-gray-500 mb-4">
                {userRequests.length === 0 
                  ? "You haven't submitted any leave requests yet" 
                  : 'No requests match your current filters'
                }
              </p>
              {userRequests.length === 0 && (
                <Button 
                  onClick={() => window.location.href = '/leave-request'}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Submit Leave Request
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.leaveType}</h3>
                        <p className="text-sm text-gray-500">
                          Request ID: {request.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={`${getStatusBadge(request.status)} px-3 py-1 rounded-full text-sm border`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(request.status)}
                          <span>{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                        </div>
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {expandedRequest === request.id ? 'Hide' : 'View'} Details
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">
                        {formatDate(request.startDate)} to {formatDate(request.endDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Days</p>
                      <p className="font-medium">
                        {request.days || calculateDaysFromDates(request.startDate, request.endDate)} days
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Submitted</p>
                      <p className="font-medium">{formatDate(request.appliedDate)}</p>
                    </div>
                  </div>

                  {/* Status Message */}
                  <Alert className={`mb-4 ${
                    request.status === 'approved' ? 'border-green-200 bg-green-50' :
                    request.status === 'rejected' ? 'border-red-200 bg-red-50' :
                    'border-yellow-200 bg-yellow-50'
                  }`}>
                    {request.status === 'approved' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                     request.status === 'rejected' ? <XCircle className="h-4 w-4 text-red-600" /> :
                     <Clock className="h-4 w-4 text-yellow-600" />}
                    <AlertTitle className={`${
                      request.status === 'approved' ? 'text-green-800' :
                      request.status === 'rejected' ? 'text-red-800' :
                      'text-yellow-800'
                    }`}>
                      Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </AlertTitle>
                    <AlertDescription className={`${
                      request.status === 'approved' ? 'text-green-700' :
                      request.status === 'rejected' ? 'text-red-700' :
                      'text-yellow-700'
                    }`}>
                      {getStatusMessage(request)}
                    </AlertDescription>
                  </Alert>

                  {/* Rejection Reason */}
                  {request.status === 'rejected' && request.rejectionReason && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Rejection Reason</AlertTitle>
                      <AlertDescription>
                        {request.rejectionReason}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Expanded Details */}
                  {expandedRequest === request.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Leave Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Reason for Leave</p>
                            <p className="text-gray-900">{request.reason}</p>
                          </div>
                          {request.emergencyContact && (
                            <div>
                              <p className="text-sm text-gray-500">Emergency Contact</p>
                              <p className="text-gray-900">{request.emergencyContact}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {request.workHandover && (
                        <div>
                          <p className="text-sm text-gray-500">Work Handover Instructions</p>
                          <p className="text-gray-900">{request.workHandover}</p>
                        </div>
                      )}
                      
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Request Timeline</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Submitted:</span>
                            <span>{formatDate(request.appliedDate)} {request.submittedAt ? new Date(request.submittedAt).toLocaleTimeString() : ''}</span>
                          </div>
                          {request.approvedDate && (
                            <div className="flex justify-between text-green-700">
                              <span>Approved:</span>
                              <span>{formatDate(request.approvedDate)} by {request.approvedBy}</span>
                            </div>
                          )}
                          {request.rejectedDate && (
                            <div className="flex justify-between text-red-700">
                              <span>Rejected:</span>
                              <span>{formatDate(request.rejectedDate)} by {request.rejectedBy}</span>
                            </div>
                          )}
                          {request.lastUpdated && (
                            <div className="flex justify-between text-gray-500">
                              <span>Last Updated:</span>
                              <span>{new Date(request.lastUpdated).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveHistoryPage;