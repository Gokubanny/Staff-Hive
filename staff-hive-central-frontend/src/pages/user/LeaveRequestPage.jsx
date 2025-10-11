import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { 
  Calendar,
  AlertCircle,
  Send,
  RotateCcw,
  FileText,
  User,
  CheckCircle,
  Info,
  Calculator,
  Loader2,
  Building2
} from "lucide-react";

const API_BASE_URL = "https://staff-hive-backend.onrender.com/api";

const leaveTypes = [
  { 
    id: "Annual Leave", 
    name: "Annual Leave", 
    description: "Vacation time for rest and relaxation",
    maxDays: 25,
    minNotice: 7
  },
  { 
    id: "Sick Leave", 
    name: "Sick Leave", 
    description: "Medical leave for illness or injury",
    maxDays: 15,
    minNotice: 0
  },
  { 
    id: "Personal Leave", 
    name: "Personal Leave", 
    description: "Leave for personal matters",
    maxDays: 7,
    minNotice: 3
  },
  { 
    id: "Maternity Leave", 
    name: "Maternity Leave", 
    description: "Leave for childbirth and bonding",
    maxDays: 120,
    minNotice: 30
  },
  { 
    id: "Paternity Leave", 
    name: "Paternity Leave", 
    description: "Leave for new fathers",
    maxDays: 14,
    minNotice: 30
  },
  { 
    id: "Bereavement Leave", 
    name: "Bereavement Leave", 
    description: "Leave for family loss",
    maxDays: 5,
    minNotice: 0
  },
  { 
    id: "Emergency Leave", 
    name: "Emergency Leave", 
    description: "Unforeseen circumstances",
    maxDays: 3,
    minNotice: 0
  },
];

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top`}>
      {message}
    </div>
  );
};

export default function LeaveRequestPage() {
  const [user, setUser] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    emergencyContact: "",
    workHandover: "",
    managerEmail: ""
  });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Load user data from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Load leave balance
  useEffect(() => {
    const loadBalance = async () => {
      if (!user?.employeeId && !user?._id) return;
      
      try {
        const token = localStorage.getItem('token');
        const employeeId = user.employeeId || user._id;
        
        const response = await fetch(`${API_BASE_URL}/leave/balance/${employeeId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          setLeaveBalance(result.data);
        } else {
          console.log('Failed to load leave balance');
        }
      } catch (error) {
        console.error('Error loading balance:', error);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    if (user) {
      loadBalance();
    }
  }, [user]);

  // Calculate days
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const timeDiff = end.getTime() - start.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      setCalculatedDays(daysDiff > 0 ? daysDiff : 0);
    } else {
      setCalculatedDays(0);
    }
  }, [formData.startDate, formData.endDate]);

  // Update selected leave type
  useEffect(() => {
    const type = leaveTypes.find(t => t.id === formData.leaveType);
    setSelectedLeaveType(type);
  }, [formData.leaveType]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateLeaveBalance = () => {
    if (!formData.leaveType || calculatedDays === 0) return true;
    
    const leaveTypeKey = formData.leaveType.toLowerCase().replace(' leave', '');
    const balance = leaveBalance?.balances?.[leaveTypeKey];
    
    if (!balance) return true;
    
    if (calculatedDays > balance.current) {
      showToast(`You only have ${balance.current} days remaining for ${formData.leaveType}. Please adjust your request.`, 'error');
      return false;
    }
    
    return true;
  };

  const validateNoticeRequirement = () => {
    if (!formData.leaveType || !formData.startDate || !selectedLeaveType) return true;
    
    const start = new Date(formData.startDate);
    const today = new Date();
    const daysDiff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysDiff < selectedLeaveType.minNotice) {
      showToast(`This leave type requires ${selectedLeaveType.minNotice} days advance notice. Please select a later start date.`, 'error');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!user) {
      showToast("User not authenticated", 'error');
      return;
    }
    
    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason || !formData.managerEmail) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (!validateLeaveBalance() || !validateNoticeRequirement()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const employeeId = user.employeeId || user._id;
      
      const leaveRequestData = {
        employeeId: employeeId,
        employeeName: user.name || 'Employee',
        email: user.email,
        department: user.department || 'General',
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: calculatedDays,
        reason: formData.reason,
        emergencyContact: formData.emergencyContact,
        workHandover: formData.workHandover,
        managerEmail: formData.managerEmail,
        appliedDate: new Date().toISOString().split('T')[0]
      };

      console.log('Submitting leave request:', leaveRequestData);

      const response = await fetch(`${API_BASE_URL}/leave/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leaveRequestData)
      });

      const result = await response.json();
      console.log('Leave submission response:', result);

      if (response.ok) {
        showToast(`Leave request submitted successfully! Your ${formData.leaveType} request for ${calculatedDays} day(s) has been sent for approval.`, 'success');
        
        // Reload balance to reflect pending leave
        try {
          const balanceResponse = await fetch(`${API_BASE_URL}/leave/balance/${employeeId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (balanceResponse.ok) {
            const balanceResult = await balanceResponse.json();
            setLeaveBalance(balanceResult.data);
          }
        } catch (balanceError) {
          console.error('Error reloading balance:', balanceError);
        }
        
        handleReset();
      } else {
        showToast(result.message || 'Failed to submit leave request', 'error');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      showToast(error.message || 'Failed to submit leave request. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    const managerEmail = formData.managerEmail;
    setFormData({
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
      emergencyContact: "",
      workHandover: "",
      managerEmail: managerEmail
    });
    setCalculatedDays(0);
    setSelectedLeaveType(null);
  };

  const getLeaveBalance = (leaveType) => {
    if (!leaveBalance?.balances) return null;
    
    const leaveTypeKey = leaveType.toLowerCase().replace(' leave', '');
    return leaveBalance.balances[leaveTypeKey];
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please log in to submit a leave request.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Request Leave</h1>
          <p className="text-gray-600 mt-2">
            Submit a new leave request for approval
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employee Information Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Name</Label>
                  <p className="font-medium">{user.name || 'Employee'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Employee ID</Label>
                  <p className="font-medium">{user.employeeId || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Department</Label>
                  <p className="font-medium">{user.department || 'General'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              {user.companyName && (
                <div className="mt-4 flex items-center text-sm text-gray-600">
                  <Building2 className="h-4 w-4 mr-2" />
                  <span>{user.companyName}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leave Request Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Leave Application Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Leave Type */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Leave Type *</Label>
                    <Select onValueChange={(value) => handleInputChange('leaveType', value)} value={formData.leaveType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div>
                              <div className="font-medium">{type.name}</div>
                              <div className="text-xs text-gray-500">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Manager Email */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Manager Email *</Label>
                    <Input
                      placeholder="manager@company.com"
                      value={formData.managerEmail}
                      onChange={(e) => handleInputChange('managerEmail', e.target.value)}
                      required
                    />
                  </div>

                  {/* Start Date */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Start Date *</Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">End Date *</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Emergency Contact</Label>
                    <Input 
                      placeholder="Name and phone number" 
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    />
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Reason for Leave *</Label>
                  <Textarea
                    placeholder="Please provide detailed information about your leave request..."
                    className="min-h-[120px]"
                    value={formData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    required
                  />
                </div>

                {/* Work Handover */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Work Handover Instructions</Label>
                  <Textarea
                    placeholder="Describe how your work will be handled during your absence..."
                    className="min-h-[100px]"
                    value={formData.workHandover}
                    onChange={(e) => handleInputChange('workHandover', e.target.value)}
                  />
                </div>

                {/* Days Calculation */}
                {calculatedDays > 0 && formData.leaveType && (
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">
                        Total Leave Days: {calculatedDays} day{calculatedDays !== 1 ? 's' : ''}
                      </p>
                      {(() => {
                        const balance = getLeaveBalance(formData.leaveType);
                        if (balance) {
                          const remainingAfterRequest = balance.current - calculatedDays;
                          return (
                            <p className="text-sm text-blue-700">
                              Remaining balance after this request: {Math.max(0, remainingAfterRequest)} days
                              {remainingAfterRequest < 0 && (
                                <span className="text-red-600 ml-2">(Exceeds available balance)</span>
                              )}
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Form
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Leave Balances */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                Leave Balances
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingBalance ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : leaveBalance?.balances ? (
                Object.entries(leaveBalance.balances).map(([type, balance]) => {
                  const leaveType = leaveTypes.find(t => t.id.toLowerCase().includes(type));
                  const typeName = leaveType?.name || type.charAt(0).toUpperCase() + type.slice(1) + ' Leave';
                  
                  return (
                    <div key={type} className="flex justify-between items-center p-2 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{typeName}</p>
                        <p className="text-xs text-gray-500">
                          Used: {balance.used} / {balance.allocated}
                        </p>
                      </div>
                      <Badge variant={balance.current > 5 ? "default" : balance.current > 0 ? "secondary" : "destructive"}>
                        {balance.current} days
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No balance data available</p>
              )}
            </CardContent>
          </Card>

          {/* Selected Leave Type Info */}
          {selectedLeaveType && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Info className="h-5 w-5 mr-2" />
                  Leave Type Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm">{selectedLeaveType.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-gray-600">{selectedLeaveType.description}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Maximum Days</Label>
                  <p className="text-sm">{selectedLeaveType.maxDays} days per year</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Minimum Notice</Label>
                  <p className="text-sm">
                    {selectedLeaveType.minNotice === 0 ? 'No advance notice required' : `${selectedLeaveType.minNotice} days in advance`}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leave Policy Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 mr-2" />
                Policy Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important Notes</AlertTitle>
                <AlertDescription className="text-xs space-y-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Annual leave requires 7+ days advance notice</li>
                    <li>Medical certificate needed for 3+ consecutive sick days</li>
                    <li>Emergency leave may be approved retroactively</li>
                    <li>Requests processed within 2 business days</li>
                    <li>Unused annual leave expires at year end</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <div className="text-xs text-gray-600">
                <p><strong>Need help?</strong></p>
                <p>Contact HR at hr@company.com or ext. 1234</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}