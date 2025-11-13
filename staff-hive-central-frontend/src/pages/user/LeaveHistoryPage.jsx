// src/pages/user/LeaveHistoryPage.jsx - Mobile Responsive Version
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle, XCircle, FileText, Filter, Search, 
  RefreshCw, Eye, AlertCircle, ChevronDown, ChevronUp 
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_BASE_URL = "https://staff-hive-backend.onrender.com/api";

// Mock current user data
const currentUser = {
  employeeId: 'EMP001',
  name: 'John Doe',
  department: 'Engineering'
};

const LeaveHistoryPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [userRequests, setUserRequests] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Load user's requests from API
  const loadUserRequests = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/leave/user/${currentUser.employeeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const sortedRequests = (result.data || []).sort((a, b) => 
          new Date(b.submittedAt || b.appliedDate) - new Date(a.submittedAt || a.appliedDate)
        );
        setUserRequests(sortedRequests);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error loading leave requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserRequests();

    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      loadUserRequests();
    }, 30000);

    return () => clearInterval(refreshInterval);
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
      case 'approved': return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />;
      default: return <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />;
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

  const leaveTypes = [...new Set(userRequests.map(r => r.leaveType))];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-6">
      {/* Mobile-friendly container */}
      <div className="w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-7xl mx-auto">
        {/* Header - Mobile Responsive */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leave History</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Track your leave requests and their approval status
              </p>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="text-xs sm:text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <Button 
                onClick={loadUserRequests}
                variant="outline" 
                size="sm"
                disabled={isLoading}
                className="flex items-center"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview - Mobile Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{userRequests.length}</p>
                </div>
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
                </div>
                <div className="relative">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                  {pendingRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 bg-yellow-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center">
                      {pendingRequests.length}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Approved</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{approvedRequests.length}</p>
                </div>
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Rejected</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">{rejectedRequests.length}</p>
                </div>
                <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search - Mobile Responsive */}
        <Card className="mb-4 sm:mb-6">
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
                  type="text"
                  placeholder="Search by leave type or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 text-sm"
                />
              </div>
            </div>
            
            {/* Leave Type Filter - Collapsible on mobile */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs - Mobile Scrollable */}
        <Card className="shadow-lg">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max">
              {[
                { key: 'all', label: 'All', count: userRequests.length },
                { key: 'pending', label: 'Pending', count: pendingRequests.length },
                { key: 'approved', label: 'Approved', count: approvedRequests.length },
                { key: 'rejected', label: 'Rejected', count: rejectedRequests.length }
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
                    <span className="ml-1 sm:ml-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full inline-block"></span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Leave Requests List - Mobile Optimized */}
          <CardContent className="p-3 sm:p-4 lg:p-6">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-gray-500">
                <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  {userRequests.length === 0 ? 'No Leave Requests Yet' : 'No Matching Requests'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {userRequests.length === 0 
                    ? "You haven't submitted any leave requests yet" 
                    : 'No requests match your current filters'
                  }
                </p>
                {userRequests.length === 0 && (
                  <Button 
                    onClick={() => window.location.href = '/user-dashboard/leave'}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    size="sm"
                  >
                    Submit Leave Request
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request._id || request.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900">{request.leaveType}</h3>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            Request ID: {request.requestId || request.id}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getStatusBadge(request.status)} px-2 py-1 rounded-full text-xs border flex items-center gap-1 flex-shrink-0 ml-2`}>
                        {getStatusIcon(request.status)}
                        <span className="hidden sm:inline">{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                      </Badge>
                    </div>

                    {/* Details Grid - Responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                      <div className="sm:col-span-2">
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-medium text-sm">
                          {formatDate(request.startDate)} to {formatDate(request.endDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Days</p>
                        <p className="font-medium text-sm">
                          {request.days || calculateDaysFromDates(request.startDate, request.endDate)} days
                        </p>
                      </div>
                      <div className="sm:col-span-3">
                        <p className="text-xs text-gray-500">Submitted</p>
                        <p className="font-medium text-sm">{formatDate(request.appliedDate)}</p>
                      </div>
                    </div>

                    {/* Status Message */}
                    <Alert className={`mb-3 sm:mb-4 ${
                      request.status === 'approved' ? 'border-green-200 bg-green-50' :
                      request.status === 'rejected' ? 'border-red-200 bg-red-50' :
                      'border-yellow-200 bg-yellow-50'
                    }`}>
                      {request.status === 'approved' ? <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" /> :
                       request.status === 'rejected' ? <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" /> :
                       <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />}
                      <AlertTitle className={`text-xs sm:text-sm ${
                        request.status === 'approved' ? 'text-green-800' :
                        request.status === 'rejected' ? 'text-red-800' :
                        'text-yellow-800'
                      }`}>
                        Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </AlertTitle>
                      <AlertDescription className={`text-xs sm:text-sm ${
                        request.status === 'approved' ? 'text-green-700' :
                        request.status === 'rejected' ? 'text-red-700' :
                        'text-yellow-700'
                      }`}>
                        {getStatusMessage(request)}
                      </AlertDescription>
                    </Alert>

                    {/* Rejection Reason */}
                    {request.status === 'rejected' && request.rejectionReason && (
                      <Alert variant="destructive" className="mb-3 sm:mb-4">
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                        <AlertTitle className="text-xs sm:text-sm">Rejection Reason</AlertTitle>
                        <AlertDescription className="text-xs sm:text-sm">
                          {request.rejectionReason}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Expandable Details */}
                    <button
                      onClick={() => setExpandedRequest(expandedRequest === request._id ? null : request._id)}
                      className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      {expandedRequest === request._id ? 'Hide' : 'View'} Details
                      {expandedRequest === request._id ? 
                        <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : 
                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                      }
                    </button>

                    {/* Expanded Details */}
                    {expandedRequest === request._id && (
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg space-y-3 sm:space-y-4">
                        <div>
                          <h4 className="font-medium text-sm sm:text-base text-gray-900 mb-2">Leave Details</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Reason for Leave</p>
                              <p className="text-sm text-gray-900">{request.reason}</p>
                            </div>
                            {request.emergencyContact && (
                              <div>
                                <p className="text-xs text-gray-500">Emergency Contact</p>
                                <p className="text-sm text-gray-900">{request.emergencyContact}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {request.workHandover && (
                          <div>
                            <p className="text-xs text-gray-500">Work Handover Instructions</p>
                            <p className="text-sm text-gray-900">{request.workHandover}</p>
                          </div>
                        )}
                        
                        <div className="border-t pt-3 sm:pt-4">
                          <h4 className="font-medium text-sm sm:text-base text-gray-900 mb-2">Request Timeline</h4>
                          <div className="space-y-2 text-xs sm:text-sm">
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
    </div>
  );
};

export default LeaveHistoryPage;