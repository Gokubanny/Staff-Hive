// src/pages/AdminPostJob.jsx - Fixed version
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Building,
  Users,
  FileText,
  X,
  Save,
  MapPin,
  DollarSign,
} from "lucide-react";
import ApiService from "@/services/apiService";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminJobPosting() {
  const { token, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    requirements: [],
    responsibilities: [],
    department: "",
    location: "",
    employmentType: "Full-time",
    salaryRange: { min: 0, max: 0 },
    experienceLevel: "Entry Level",
    status: "Draft",
    applicationDeadline: "",
    companyId: "",
    newRequirement: "",
    newResponsibility: "",
  });

  // Fetch companies for dropdown
  const fetchCompanies = async () => {
    try {
      const data = await ApiService.getCompanies(token);
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  // Fetch jobs from backend
  const fetchJobs = async () => {
    try {
      const data = await ApiService.getJobs({}, token);
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
  }, []);

  const resetJobData = () => {
    setJobData({
      title: "",
      description: "",
      requirements: [],
      responsibilities: [],
      department: "",
      location: "",
      employmentType: "Full-time",
      salaryRange: { min: 0, max: 0 },
      experienceLevel: "Entry Level",
      status: "Draft",
      applicationDeadline: "",
      companyId: "",
      newRequirement: "",
      newResponsibility: "",
    });
  };

  const handleCreateJob = () => {
    setEditingJob(null);
    resetJobData();
    setShowCreateModal(true);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setJobData({
      title: job.title,
      description: job.description,
      requirements: [...(job.requirements || [])],
      responsibilities: [...(job.responsibilities || [])],
      department: job.department,
      location: job.location,
      employmentType: job.employmentType,
      salaryRange: { ...job.salaryRange },
      experienceLevel: job.experienceLevel,
      status: job.status,
      applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : "",
      companyId: job.companyId?._id || job.companyId,
      newRequirement: "",
      newResponsibility: "",
    });
    setShowCreateModal(true);
  };

  const handleSaveJob = async () => {
    // Validation
    if (!jobData.title || !jobData.description || !jobData.department || 
        !jobData.location || !jobData.companyId || !jobData.applicationDeadline) {
      alert("Please fill in all required fields");
      return;
    }

    if (jobData.description.length < 50) {
      alert("Job description must be at least 50 characters");
      return;
    }

    if (jobData.requirements.length === 0) {
      alert("Please add at least one requirement");
      return;
    }

    if (jobData.responsibilities.length === 0) {
      alert("Please add at least one responsibility");
      return;
    }

    if (jobData.salaryRange.min <= 0 || jobData.salaryRange.max <= 0) {
      alert("Please enter valid salary range");
      return;
    }

    if (jobData.salaryRange.max < jobData.salaryRange.min) {
      alert("Maximum salary must be greater than minimum salary");
      return;
    }

    // Prepare payload matching backend schema
    const payload = {
      title: jobData.title,
      description: jobData.description,
      requirements: jobData.requirements,
      responsibilities: jobData.responsibilities,
      department: jobData.department,
      location: jobData.location,
      employmentType: jobData.employmentType,
      salaryRange: {
        min: Number(jobData.salaryRange.min),
        max: Number(jobData.salaryRange.max)
      },
      experienceLevel: jobData.experienceLevel,
      status: jobData.status,
      applicationDeadline: new Date(jobData.applicationDeadline).toISOString(),
      companyId: jobData.companyId,
      // createdBy will be set by backend from token
    };

    try {
      if (editingJob) {
        await ApiService.updateJob(editingJob._id, payload, token);
      } else {
        await ApiService.addJob(payload, token);
      }
      setShowCreateModal(false);
      resetJobData();
      fetchJobs();
    } catch (error) {
      console.error("Error saving job:", error);
      alert(`Failed to save job: ${error.message}`);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (confirm("Are you sure you want to delete this job posting?")) {
      try {
        await ApiService.deleteJob(jobId, token);
        fetchJobs();
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("Failed to delete job. Check console for details.");
      }
    }
  };

  const toggleJobStatus = async (job) => {
    try {
      const newStatus = job.status === "Published" ? "Closed" : "Published";
      await ApiService.updateJob(job._id, { status: newStatus }, token);
      fetchJobs();
    } catch (error) {
      console.error("Error toggling job status:", error);
      alert("Failed to update status.");
    }
  };

  const addRequirement = () => {
    if (jobData.newRequirement.trim()) {
      setJobData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, prev.newRequirement.trim()],
        newRequirement: "",
      }));
    }
  };

  const removeRequirement = (index) => {
    setJobData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const addResponsibility = () => {
    if (jobData.newResponsibility.trim()) {
      setJobData((prev) => ({
        ...prev,
        responsibilities: [...prev.responsibilities, prev.newResponsibility.trim()],
        newResponsibility: "",
      }));
    }
  };

  const removeResponsibility = (index) => {
    setJobData((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index),
    }));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Published": return "bg-green-100 text-green-800";
      case "Draft": return "bg-yellow-100 text-yellow-800";
      case "Closed": return "bg-red-100 text-red-800";
      case "On Hold": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getJobTypeColor = (type) => {
    switch (type) {
      case "Full-time": return "bg-blue-100 text-blue-800";
      case "Part-time": return "bg-purple-100 text-purple-800";
      case "Contract": return "bg-orange-100 text-orange-800";
      case "Intern": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header & Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-600">Manage and create job postings</p>
        </div>
        <Button onClick={handleCreateJob}>
          <Plus className="h-4 w-4 mr-2" />
          Create Job Posting
        </Button>
      </div>

      {/* Job Cards */}
      <div className="grid gap-4">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <Card key={job._id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                      <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                      <Badge className={getJobTypeColor(job.employmentType)}>{job.employmentType}</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>{job.companyId?.name || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>${job.salaryRange?.min?.toLocaleString()} - ${job.salaryRange?.max?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{job.applicationCount || 0} applicants</span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>
                    <p className="text-sm text-gray-500">
                      Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => toggleJobStatus(job)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditJob(job)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteJob(job._id)} 
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings yet</h3>
              <p className="text-gray-600 mb-4">Create your first job posting to start recruiting candidates.</p>
              <Button onClick={handleCreateJob}>
                <Plus className="h-4 w-4 mr-2" />
                Create Job Posting
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={jobData.title}
                      onChange={(e) => setJobData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyId">Company *</Label>
                    <select
                      id="companyId"
                      value={jobData.companyId}
                      onChange={(e) => setJobData(prev => ({ ...prev, companyId: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Company</option>
                      {companies.map((company) => (
                        <option key={company._id} value={company._id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location, Type, Status */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Input
                      id="department"
                      value={jobData.department}
                      onChange={(e) => setJobData(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="e.g. Engineering"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={jobData.location}
                      onChange={(e) => setJobData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g. Lagos, Nigeria"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employmentType">Employment Type *</Label>
                    <select
                      id="employmentType"
                      value={jobData.employmentType}
                      onChange={(e) => setJobData(prev => ({ ...prev, employmentType: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Intern">Intern</option>
                    </select>
                  </div>
                </div>

                {/* Salary, Experience, Status, Deadline */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salaryMin">Minimum Salary *</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={jobData.salaryRange.min}
                      onChange={(e) => setJobData(prev => ({ 
                        ...prev, 
                        salaryRange: { ...prev.salaryRange, min: e.target.value }
                      }))}
                      placeholder="e.g. 50000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaryMax">Maximum Salary *</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={jobData.salaryRange.max}
                      onChange={(e) => setJobData(prev => ({ 
                        ...prev, 
                        salaryRange: { ...prev.salaryRange, max: e.target.value }
                      }))}
                      placeholder="e.g. 80000"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="experienceLevel">Experience Level *</Label>
                    <select
                      id="experienceLevel"
                      value={jobData.experienceLevel}
                      onChange={(e) => setJobData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="Entry Level">Entry Level</option>
                      <option value="Mid Level">Mid Level</option>
                      <option value="Senior Level">Senior Level</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <select
                      id="status"
                      value={jobData.status}
                      onChange={(e) => setJobData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Closed">Closed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="applicationDeadline">Application Deadline *</Label>
                    <Input
                      id="applicationDeadline"
                      type="date"
                      value={jobData.applicationDeadline}
                      onChange={(e) => setJobData(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Job Description * (min 50 characters)</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={jobData.description}
                    onChange={(e) => setJobData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                  />
                  <p className="text-sm text-gray-500 mt-1">{jobData.description.length} / 50 characters</p>
                </div>

                {/* Requirements */}
                <div>
                  <Label>Requirements *</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={jobData.newRequirement}
                        onChange={(e) => setJobData(prev => ({ ...prev, newRequirement: e.target.value }))}
                        placeholder="Add a requirement..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                      />
                      <Button type="button" onClick={addRequirement}>Add</Button>
                    </div>
                    <div className="space-y-1">
                      {jobData.requirements.map((req, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm">{req}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRequirement(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Responsibilities */}
                <div>
                  <Label>Responsibilities *</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={jobData.newResponsibility}
                        onChange={(e) => setJobData(prev => ({ ...prev, newResponsibility: e.target.value }))}
                        placeholder="Add a responsibility..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
                      />
                      <Button type="button" onClick={addResponsibility}>Add</Button>
                    </div>
                    <div className="space-y-1">
                      {jobData.responsibilities.map((resp, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm">{resp}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeResponsibility(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveJob} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {editingJob ? 'Update Job' : 'Create Job'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}