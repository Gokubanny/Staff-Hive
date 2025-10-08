// src/pages/admin/PendingUsers.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, User, Mail, Briefcase, AlertCircle, Building2 } from 'lucide-react';

const PendingUsers = () => {
  const { token, user: adminUser } = useAuth();
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/auth/pending-users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pending users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setActionLoading(true);
      const response = await axios.post(
        `http://localhost:5000/api/auth/verify-user/${userId}`,
        { action: 'approve' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: 'User Approved',
        description: 'User has been approved and employee record created successfully!',
      });

      fetchPendingUsers(); // Refresh the list
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve user',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive'
      });
      return;
    }

    try {
      setActionLoading(true);
      await axios.post(
        `http://localhost:5000/api/auth/verify-user/${selectedUser._id}`,
        { action: 'reject', reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: 'User Rejected',
        description: 'The user registration has been rejected.',
      });

      setShowRejectDialog(false);
      setRejectionReason('');
      setSelectedUser(null);
      fetchPendingUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject user',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectDialog = (user) => {
    setSelectedUser(user);
    setShowRejectDialog(true);
  };

  if (loading) {
    return (
      <div className="p-6 ml-64">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 ml-64 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-orange-500" />
                Pending User Verifications
              </CardTitle>
              <CardDescription>
                Review and approve user registrations for {adminUser?.companyName || 'your company'}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {pendingUsers.length} Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                All Caught Up!
              </h3>
              <p className="text-gray-600">
                No pending user verifications at the moment.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Details</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-gray-700">
                          <Briefcase className="h-4 w-4" />
                          <span className="font-mono">{user.employeeId || 'Not assigned'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-gray-700">
                          <Building2 className="h-4 w-4" />
                          <span>{user.companyName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(user._id)}
                            disabled={actionLoading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve & Create Employee
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRejectDialog(user)}
                            disabled={actionLoading}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Reject User Registration
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedUser?.name}'s registration.
              This will be sent to the user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Input
                id="reason"
                placeholder="e.g., Invalid employee ID, Wrong company, etc."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
                setSelectedUser(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? 'Rejecting...' : 'Reject User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingUsers;