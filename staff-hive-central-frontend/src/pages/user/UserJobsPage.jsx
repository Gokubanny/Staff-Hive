//src/pages/UserJobsPage
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Clock, DollarSign, Briefcase, Calendar } from 'lucide-react';
import { useJobs } from '@/contexts/JobContext';

const UserJobsPage = () => {
  const { jobs, isLoading } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const navigate = useNavigate();

  // Filter jobs that are open for applications
  const availableJobs = jobs.filter(job => job.status === 'open');

  const filteredJobs = availableJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || job.type === filterType;
    const matchesLocation = filterLocation === 'all' || job.location.toLowerCase().includes(filterLocation.toLowerCase());
    return matchesSearch && matchesType && matchesLocation;
  });

  // Get unique locations for filter
  const uniqueLocations = [...new Set(availableJobs.map(job => job.location))];

  const handleApplyClick = (jobId) => {
    navigate(`../apply-job/${jobId}`);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Available Jobs</h1>
          <p className="text-gray-600">Find and apply for jobs that match your skills</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filteredJobs.length} jobs available
        </Badge>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-10 w-full"
            placeholder="Search jobs by title, description, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Job Type" />
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
        <Select value={filterLocation} onValueChange={setFilterLocation}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {uniqueLocations.map(location => (
              <SelectItem key={location} value={location.toLowerCase()}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Jobs Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {availableJobs.length === 0 ? 'No jobs available' : 'No matching jobs found'}
            </h3>
            <p className="text-gray-500">
              {availableJobs.length === 0 
                ? 'Check back later for new opportunities' 
                : 'Try adjusting your search or filters'
              }
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job._id || job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {job.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {job.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      {job.salaryCurrency === 'USD' ? '$' : 
                       job.salaryCurrency === 'EUR' ? '€' : 
                       job.salaryCurrency === 'GBP' ? '£' : '₦'}
                      {job.salary}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Posted {new Date(job.postedDate || job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {job.requirements && job.requirements.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Requirements:</h4>
                    <div className="flex flex-wrap gap-1">
                      {job.requirements.slice(0, 3).map((req, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                      {job.requirements.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{job.requirements.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleApplyClick(job._id || job.id)}
                >
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default UserJobsPage;