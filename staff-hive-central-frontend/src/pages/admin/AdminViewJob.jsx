//src/pages/AdminViewJob.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, DollarSign, Calendar, Briefcase, Users, Eye, Edit, Trash2 } from 'lucide-react';
import { useJobs } from '@/contexts/JobContext';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminViewJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, removeJob, getJobApplications } = useJobs();
  const { toast } = useToast();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const currentJob = jobs.find(j => (j._id || j.id) === id);
    if (currentJob) {
      setJob(currentJob);
      // Get applications for this job
      const jobApplications = getJobApplications ? getJobApplications(id) : [];
      setApplications(jobApplications);
    }
  }, [id, jobs, getJobApplications]);

  const handleEdit = () => {
    navigate(`/dashboard/jobs/edit/${id}`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await removeJob(id);
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
      navigate('/dashboard/job-postings');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
  };

  if (!job) {
    return (
      <div className="p-6 ml-64 flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Job not found</h2>
          <Button onClick={() => navigate('/dashboard/job-postings')}>
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job posting 
              "{job?.title}" and remove all associated applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard/job-postings')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Job
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Job
          </Button>
        </div>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Job Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-base">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {job.type}
                    </span>
                  </CardDescription>
                </div>
                <Badge variant={job.status === 'open' ? 'default' : 'secondary'} className="text-sm">
                  {job.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Job Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>

              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map((req, index) => (
                      <Badge key={index} variant="outline">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {job.benefits && job.benefits.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Benefits</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.benefits.map((benefit, index) => (
                      <Badge key={index} variant="secondary">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Job Statistics */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Salary</span>
                <span className="font-semibold">
                  {job.salaryCurrency === 'USD' ? '$' : 
                   job.salaryCurrency === 'EUR' ? '€' : 
                   job.salaryCurrency === 'GBP' ? '£' : '₦'}
                  {job.salary}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Applications</span>
                <span className="font-semibold flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {applications.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Posted</span>
                <span className="font-semibold">
                  {new Date(job.postedDate || job.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                  {job.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/dashboard/applicants')}
              >
                <Users className="h-4 w-4 mr-2" />
                View All Applications
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Job Details
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview as Candidate
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminViewJob;