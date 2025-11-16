import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  Eye, 
  UserCheck, 
  UserX, 
  Clock, 
  Mail, 
  Phone, 
  Calendar,
  FileText,
  Star,
  X,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  Plus
} from "lucide-react";

export default function Applicants() {
  const navigate = useNavigate();
  const { applicants, updateApplicantStage, deleteApplicant, loading } = useData();
  const { toast } = useToast();
  
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [notes, setNotes] = useState('');

  // Filter applicants based on search and status
  useEffect(() => {
    let filtered = applicants.filter(app => {
      const fullName = `${app.firstName} ${app.lastName}`;
      const matchesSearch = 
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || app.stage === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, applicants]);

  const updateApplicationStatus = async (applicationId, newStage) => {
    try {
      await updateApplicantStage(applicationId, newStage);
      toast({
        title: "Status Updated",
        description: `Application status changed to ${newStage}`,
      });
    } catch (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteApplicant = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteApplicant(id);
        toast({
          title: "Applicant deleted",
          description: `${name} has been removed successfully.`,
        });
      } catch (error) {
        toast({
          title: "Error deleting applicant",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const viewApplicationDetails = (application) => {
    setSelectedApplication(application);
    setNotes(application.notes || '');
    setShowDetailModal(true);
  };

  const getStatusColor = (stage) => {
    switch (stage) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'screening':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'offer':
        return 'bg-orange-100 text-orange-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (stage) => {
    switch (stage) {
      case 'applied':
        return <FileText className="h-4 w-4" />;
      case 'screening':
        return <Eye className="h-4 w-4" />;
      case 'interview':
        return <Users className="h-4 w-4" />;
      case 'offer':
        return <Clock className="h-4 w-4" />;
      case 'hired':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const stats = {
    total: applicants.length,
    applied: applicants.filter(app => app.stage === 'applied').length,
    screening: applicants.filter(app => app.stage === 'screening').length,
    interview: applicants.filter(app => app.stage === 'interview').length,
    hired: applicants.filter(app => app.stage === 'hired').length,
    rejected: applicants.filter(app => app.stage === 'rejected').length
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applicant Management</h1>
          <p className="text-gray-600">Review and manage job applications</p>
        </div>
        <Button onClick={() => navigate('/dashboard/add-applicant')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Applicant
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Applied</p>
                <p className="text-2xl font-bold text-blue-600">{stats.applied}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Screening</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.screening}</p>
              </div>
              <Eye className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interview</p>
                <p className="text-2xl font-bold text-purple-600">{stats.interview}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hired</p>
                <p className="text-2xl font-bold text-green-600">{stats.hired}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search applications by name, position, or email..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Status</option>
          <option value="applied">Applied</option>
          <option value="screening">Screening</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Applications List */}
      <div className="grid gap-4">
        {filteredApplications.map((application) => (
          <Card key={application._id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {`${application.firstName} ${application.lastName}`}
                    </h3>
                    <Badge className={getStatusColor(application.stage)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(application.stage)}
                        {application.stage}
                      </div>
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Position Applied For:</p>
                      <p className="font-medium">{application.position}</p>
                      <p className="text-sm text-gray-600">{application.experience}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Contact Information:</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        <span>{application.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        <span>{application.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Applied: {new Date(application.appliedDate || application.createdAt).toLocaleDateString()}</span>
                    </div>
                    {application.expectedSalary && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>Expected: ₦{application.expectedSalary.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {application.location && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-600 mb-1">Location:</p>
                      <p className="text-sm text-gray-700">{application.location}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewApplicationDetails(application)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  
                  {application.stage === 'applied' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateApplicationStatus(application._id, 'screening')}
                      className="text-yellow-600 hover:text-yellow-700"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Screen
                    </Button>
                  )}

                  {application.stage === 'screening' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateApplicationStatus(application._id, 'interview')}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Interview
                    </Button>
                  )}
                  
                  {(application.stage === 'applied' || application.stage === 'screening' || application.stage === 'interview') && (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateApplicationStatus(application._id, 'hired')}
                        className="text-green-600 hover:text-green-700 flex-1"
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateApplicationStatus(application._id, 'rejected')}
                        className="text-red-600 hover:text-red-700 flex-1"
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteApplicant(application._id, `${application.firstName} ${application.lastName}`)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Application Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Application Details
                  </h2>
                  <p className="text-gray-600">
                    {`${selectedApplication.firstName} ${selectedApplication.lastName}`} - {selectedApplication.position}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                      <p className="font-medium">{`${selectedApplication.firstName} ${selectedApplication.lastName}`}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <p>{selectedApplication.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <p>{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Experience</Label>
                      <p>{selectedApplication.experience}</p>
                    </div>
                    {selectedApplication.location && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Location</Label>
                        <p>{selectedApplication.location}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Current Status</Label>
                      <div className="mt-1">
                        <Badge className={getStatusColor(selectedApplication.stage)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(selectedApplication.stage)}
                            {selectedApplication.stage}
                          </div>
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Applied Date</Label>
                      <p>{new Date(selectedApplication.appliedDate || selectedApplication.createdAt).toLocaleDateString()}</p>
                    </div>
                    {selectedApplication.expectedSalary && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Expected Salary</Label>
                        <p>₦{selectedApplication.expectedSalary.toLocaleString()}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => updateApplicationStatus(selectedApplication._id, 'hired')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Hire
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateApplicationStatus(selectedApplication._id, 'rejected')}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedApplication.coverLetter && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Cover Letter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-gray-700">
                      {selectedApplication.coverLetter}
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedApplication.resume && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Resume/CV</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <a 
                        href={selectedApplication.resume} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Resume
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedApplication.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Internal Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-gray-700">
                      {selectedApplication.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredApplications.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No applications found' : 'No applications yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Applications will appear here when candidates apply for your job postings.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => navigate('/dashboard/add-applicant')}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Applicant
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}