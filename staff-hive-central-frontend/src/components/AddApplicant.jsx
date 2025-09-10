import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building, 
  Users,
  Calendar,
  FileText,
  Send,
  X,
  CheckCircle
} from "lucide-react";

export default function AddApplicant() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applications, setApplications] = useState([]);
  const [applicationData, setApplicationData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    experience: '',
    skills: '',
    resume: null
  });

  // Mock job data - in real app, this would come from API
  useEffect(() => {
    const mockJobs = [
      {
        id: 1,
        title: 'Senior Software Engineer',
        company: 'Tech Solutions Ltd',
        location: 'Lagos, Nigeria',
        type: 'Full-time',
        salary: '₦2,500,000 - ₦3,500,000',
        posted: '2025-08-15',
        description: 'We are looking for an experienced software engineer to join our dynamic team. The ideal candidate will have 5+ years of experience in React, Node.js, and cloud technologies.',
        requirements: [
          'Bachelor\'s degree in Computer Science or related field',
          '5+ years of software development experience',
          'Proficiency in React, Node.js, JavaScript',
          'Experience with AWS or Azure cloud platforms',
          'Strong problem-solving skills'
        ],
        benefits: [
          'Competitive salary',
          'Health insurance',
          'Remote work options',
          '25 days paid vacation',
          'Professional development budget'
        ]
      },
      {
        id: 2,
        title: 'Marketing Manager',
        company: 'Digital Marketing Pro',
        location: 'Abuja, Nigeria',
        type: 'Full-time',
        salary: '₦1,800,000 - ₦2,200,000',
        posted: '2025-08-14',
        description: 'Join our marketing team to drive brand awareness and customer acquisition. Looking for a creative and data-driven marketing professional.',
        requirements: [
          'Bachelor\'s degree in Marketing or Business',
          '3+ years of marketing experience',
          'Experience with digital marketing tools',
          'Strong analytical skills',
          'Excellent communication skills'
        ],
        benefits: [
          'Performance bonuses',
          'Health and dental insurance',
          'Flexible working hours',
          'Training and certifications',
          'Team building events'
        ]
      },
      {
        id: 3,
        title: 'UX/UI Designer',
        company: 'Creative Studio Inc',
        location: 'Remote',
        type: 'Contract',
        salary: '₦1,200,000 - ₦1,800,000',
        posted: '2025-08-13',
        description: 'We need a talented UX/UI designer to create beautiful and intuitive user experiences for our web and mobile applications.',
        requirements: [
          'Portfolio demonstrating UX/UI design skills',
          '2+ years of design experience',
          'Proficiency in Figma, Sketch, or Adobe XD',
          'Understanding of user-centered design principles',
          'Experience with prototyping tools'
        ],
        benefits: [
          'Flexible schedule',
          'Remote work',
          'Creative freedom',
          'Latest design tools',
          'Portfolio building opportunities'
        ]
      }
    ];
    
    setJobs(mockJobs);
    setFilteredJobs(mockJobs);

    // Load existing applications from memory
    const savedApplications = JSON.parse(localStorage.getItem('applications') || '[]');
    setApplications(savedApplications);
  }, []);

  // Filter jobs based on search term
  useEffect(() => {
    const filtered = jobs.filter(job =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredJobs(filtered);
  }, [searchTerm, jobs]);

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = () => {
    // Basic validation
    if (!applicationData.fullName || !applicationData.email || !applicationData.phone || 
        !applicationData.coverLetter || !applicationData.experience || !applicationData.skills) {
      alert('Please fill in all required fields');
      return;
    }
    
    const newApplication = {
      id: Date.now(),
      jobId: selectedJob.id,
      jobTitle: selectedJob.title,
      company: selectedJob.company,
      applicantData: { ...applicationData },
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    const updatedApplications = [...applications, newApplication];
    setApplications(updatedApplications);
    
    // Save to localStorage for persistence
    localStorage.setItem('applications', JSON.stringify(updatedApplications));

    // Reset form
    setApplicationData({
      fullName: '',
      email: '',
      phone: '',
      coverLetter: '',
      experience: '',
      skills: '',
      resume: null
    });

    setShowApplicationModal(false);
    alert('Application submitted successfully!');
  };

  const hasApplied = (jobId) => {
    return applications.some(app => app.jobId === jobId);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const getJobTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'full-time':
        return 'bg-green-100 text-green-800';
      case 'part-time':
        return 'bg-blue-100 text-blue-800';
      case 'contract':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
          <p className="text-gray-600">Browse and apply for available positions</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search jobs by title, company, or location..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Job Listings */}
      <div className="grid gap-6">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                  <div className="flex items-center gap-4 text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Posted {formatDate(job.posted)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={getJobTypeColor(job.type)}>
                      {job.type}
                    </Badge>
                    <div className="flex items-center gap-1 text-green-600">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">{job.salary}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {hasApplied(job.id) ? (
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Applied
                    </Badge>
                  ) : (
                    <Button onClick={() => handleApply(job)}>
                      Apply Now
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-4">{job.description}</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {job.requirements.slice(0, 3).map((req, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-blue-600">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Benefits:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {job.benefits.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-green-600">•</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Application Modal */}
      {showApplicationModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Apply for Position</h2>
                  <p className="text-gray-600">{selectedJob.title} at {selectedJob.company}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApplicationModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={applicationData.fullName}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={applicationData.email}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={applicationData.phone}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    value={applicationData.experience}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="e.g. 3 years"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="skills">Key Skills *</Label>
                  <Input
                    id="skills"
                    value={applicationData.skills}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, skills: e.target.value }))}
                    placeholder="e.g. React, Node.js, JavaScript"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="coverLetter">Cover Letter *</Label>
                  <Textarea
                    id="coverLetter"
                    rows={4}
                    value={applicationData.coverLetter}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                    placeholder="Tell us why you're the perfect fit for this role..."
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" onClick={handleSubmitApplication} className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Application
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowApplicationModal(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search terms to find available positions.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}