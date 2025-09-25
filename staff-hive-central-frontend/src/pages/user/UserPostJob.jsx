//src/pages/UserPostPage
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function UserJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch jobs from API
    const fetchJobs = async () => {
      // Replace with actual API call
      const mockJobs = [
        {
          id: 1,
          title: "Senior DevOps Engineer",
          type: "full-time",
          location: "Lagos",
          expires: "2023-12-15"
        },
        // Add more mock jobs
      ];
      setJobs(mockJobs);
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">All Jobs</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search job title, skill"
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredJobs.map(job => (
          <div key={job.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {job.type} | {job.location}
                </p>
              </div>
              <Button variant="outline">View job</Button>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Expires in {job.expires}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}