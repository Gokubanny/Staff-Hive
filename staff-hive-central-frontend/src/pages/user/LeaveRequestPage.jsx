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
  Clock,
  AlertCircle,
  Send,
  RotateCcw,
  Menu,
  FileText,
  User,
  CheckCircle,
  Info,
  Calculator
} from "lucide-react";

const leaveTypes = [
  { 
    id: "annual", 
    name: "Annual Leave", 
    description: "Vacation time for rest and relaxation",
    maxDays: 25,
    minNotice: 7
  },
  { 
    id: "sick", 
    name: "Sick Leave", 
    description: "Medical leave for illness or injury",
    maxDays: 15,
    minNotice: 0
  },
  { 
    id: "personal", 
    name: "Personal Leave", 
    description: "Leave for personal matters",
    maxDays: 5,
    minNotice: 3
  },
  { 
    id: "maternity", 
    name: "Maternity Leave", 
    description: "Leave for childbirth and bonding",
    maxDays: 120,
    minNotice: 30
  },
  { 
    id: "paternity", 
    name: "Paternity Leave", 
    description: "Leave for new fathers",
    maxDays: 14,
    minNotice: 30
  },
  { 
    id: "bereavement", 
    name: "Bereavement Leave", 
    description: "Leave for family loss",
    maxDays: 5,
    minNotice: 0
  },
  { 
    id: "emergency", 
    name: "Emergency Leave", 
    description: "Unforeseen circumstances",
    maxDays: 3,
    minNotice: 0
  },
];

// Mock user data - in real app, this would come from context/API
const mockUser = {
  name: "John Doe",
  employeeId: "EMP001",
  department: "Engineering",
  manager: "Jane Smith",
  email: "john.doe@company.com",
  leaveBalances: {
    annual: 18,
    sick: 10,
    personal: 5,
    maternity: 120,
    paternity: 14,
    bereavement: 5,
    emergency: 3
  }
};

export default function LeaveRequestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    emergencyContact: "",
    workHandover: "",
    managerEmail: mockUser.manager ? `${mockUser.manager.toLowerCase().replace(' ', '.')}@company.com` : ""
  });

  // Calculate leave days when dates change
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

  // Update selected leave type details
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason || !formData.managerEmail) {
      alert('Please fill in all required fields');
      return;
    }

    if (!validateLeaveBalance() || !validateNoticeRequirement()) {
      return;
    }

    setIsSubmitting(true);
    
    // Create leave request object
    const leaveRequest = {
      id: `LR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      employeeName: mockUser.name,
      employeeId: mockUser.employeeId,
      department: mockUser.department,
      email: mockUser.email,
      leaveType: leaveTypes.find(t => t.id === formData.leaveType)?.name || formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      days: calculatedDays,
      reason: formData.reason,
      emergencyContact: formData.emergencyContact,
      workHandover: formData.workHandover,
      managerEmail: formData.managerEmail,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
      submittedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    try {
      // In a real app, you would send this to your backend API
      // For now, we'll use localStorage and simulate API calls
      const requests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
      requests.push(leaveRequest);
      localStorage.setItem('leaveRequests', JSON.stringify(requests));
      
      // Show success message
      alert(`Leave request submitted successfully! Your ${leaveRequest.leaveType} request for ${calculatedDays} day(s) has been sent for approval.`);
      
      // Reset form
      handleReset();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('Failed to submit leave request. Please try again.');
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
      managerEmail: managerEmail // Keep manager email
    });
    setCalculatedDays(0);
    setSelectedLeaveType(null);
  };

  const validateLeaveBalance = () => {
    if (formData.leaveType && calculatedDays > 0) {
      const balance = mockUser.leaveBalances[formData.leaveType] || 0;
      if (calculatedDays > balance) {
        alert(`You only have ${balance} days remaining for ${leaveTypes.find(t => t.id === formData.leaveType)?.name}. Please adjust your request.`);
        return false;
      }
    }
    return true;
  };

  const validateNoticeRequirement = () => {
    if (formData.leaveType && formData.startDate && selectedLeaveType) {
      const start = new Date(formData.startDate);
      const today = new Date();
      const daysDiff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 3600 * 24));
      if (daysDiff < selectedLeaveType.minNotice) {
        alert(`This leave type requires ${selectedLeaveType.minNotice} days advance notice. Please select a later start date.`);
        return false;
      }
    }
    return true;
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
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
                  <p className="font-medium">{mockUser.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Employee ID</Label>
                  <p className="font-medium">{mockUser.employeeId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Department</Label>
                  <p className="font-medium">{mockUser.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Manager</Label>
                  <p className="font-medium">{mockUser.manager}</p>
                </div>
              </div>
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
              <form onSubmit={handleSubmit} className="space-y-6">
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
                {calculatedDays > 0 && (
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">
                        Total Leave Days: {calculatedDays} day{calculatedDays !== 1 ? 's' : ''}
                      </p>
                      {selectedLeaveType && (
                        <p className="text-sm text-blue-700">
                          Remaining balance after this request: {(mockUser.leaveBalances[formData.leaveType] || 0) - calculatedDays} days
                        </p>
                      )}
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
                    type="submit"
                    disabled={
                      isSubmitting || 
                      (calculatedDays > 0 && !validateLeaveBalance()) ||
                      (calculatedDays > 0 && !validateNoticeRequirement())
                    }
                    className="w-full sm:w-auto min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
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
              {Object.entries(mockUser.leaveBalances).map(([type, balance]) => {
                const leaveType = leaveTypes.find(t => t.id === type);
                return (
                  <div key={type} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{leaveType?.name || type}</p>
                      <p className="text-xs text-gray-500">
                        Max: {leaveType?.maxDays} days
                      </p>
                    </div>
                    <Badge variant={balance > 5 ? "default" : balance > 0 ? "secondary" : "destructive"}>
                      {balance} days
                    </Badge>
                  </div>
                );
              })}
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