//src/pages/AdminAllJob.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Eye, Trash2, Edit } from 'lucide-react';
import { useJobs } from '@/contexts/JobContext';
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
import { useToast } from "@/hooks/use-toast";

const AdminAllJob = () => {
  const { jobs, isLoading, removeJob } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesType = filterType === 'all' || job.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDeleteClick = (job) => {
    setJobToDelete(job);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (jobToDelete) {
      try {
        console.log('Deleting job:', jobToDelete); // Debug log
        const jobId = jobToDelete.id || jobToDelete._id;
        await removeJob(jobId);
        toast({
          title: "Success",
          description: "Job deleted successfully",
        });
        console.log('Job deleted successfully'); // Debug log
      } catch (error) {
        console.error('Error deleting job:', error); // Debug log
        toast({
          title: "Error",
          description: "Failed to delete job",
          variant: "destructive",
        });
      }
    }
    setDeleteDialogOpen(false);
    setJobToDelete(null);
  };

  const handleViewJob = (jobId) => {
    console.log('Viewing job:', jobId); // Debug log
    navigate(`/dashboard/jobs/view/${jobId}`);
  };

  const handleEditJob = (jobId) => {
    console.log('Editing job:', jobId); // Debug log
    navigate(`/dashboard/jobs/edit/${jobId}`);
  };

  if (isLoading) {
    return (
      <div className="p-6 ml-64 flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job posting 
              "{jobToDelete?.title}" and remove all associated applications from our servers.
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

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Posted Jobs</h1>
          <p className="text-gray-600">Manage all job postings and applications</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate('/dashboard/post-job')}
        >
          Post New Job
        </Button>
      </div>

      {/* Search and Filter Section */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            id="search-jobs"
            name="searchJobs"
            className="pl-10 w-full"
            placeholder="Search by job title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger id="filter-status" name="filterStatus" className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger id="filter-type" name="filterType" className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jobs Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead>Posted Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {jobs.length === 0 ? 'No jobs posted yet' : 'No matching jobs found'}
                    </h3>
                    <p className="text-gray-500">
                      {jobs.length === 0 ? 'Post your first job to get started' : 'Try adjusting your search or filters'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredJobs.map((job) => (
                <TableRow key={job._id || job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell className="capitalize">{job.type}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>
                    {job.salaryCurrency === 'USD' ? '$' : 
                     job.salaryCurrency === 'EUR' ? '€' : 
                     job.salaryCurrency === 'GBP' ? '£' : '₦'}
                    {job.salary}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      job.status === 'open' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                  </TableCell>
                  <TableCell>{job.applications?.length || 0}</TableCell>
                  <TableCell>
                    {new Date(job.postedDate || job.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const jobId = job.id || job._id;
                          console.log('View button clicked for job:', jobId);
                          handleViewJob(jobId);
                        }}
                        className="hover:bg-blue-50 text-blue-600"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const jobId = job.id || job._id;
                          console.log('Edit button clicked for job:', jobId);
                          handleEditJob(jobId);
                        }}
                        className="hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        onClick={() => {
                          console.log('Delete button clicked for job:', job);
                          handleDeleteClick(job);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminAllJob;



