import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText, 
  ArrowLeft,
  UserPlus,
  Calendar,
  MapPin
} from 'lucide-react';

export default function AddApplicant() {
  const navigate = useNavigate();
  const { addApplicant } = useData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    expectedSalary: '',
    location: '',
    source: '',
    resume: '',
    coverLetter: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      experience: '',
      expectedSalary: '',
      location: '',
      source: '',
      resume: '',
      coverLetter: '',
      notes: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const applicantData = {
        ...formData,
        expectedSalary: parseFloat(formData.expectedSalary) || 0
      };
      
      await addApplicant(applicantData);
      
      toast({
        title: "Applicant Added Successfully!",
        description: `${applicantData.firstName} ${applicantData.lastName} has been added to the applicant tracking system.`,
      });
      
      navigate('/dashboard/applicants');
      
    } catch (error) {
      toast({
        title: "Error adding applicant",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const positions = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Data Scientist',
    'Product Manager',
    'UI/UX Designer',
    'QA Engineer',
    'Business Analyst',
    'Project Manager',
    'HR Manager',
    'Marketing Manager',
    'Sales Representative',
    'Accountant',
    'Other'
  ];

  const experienceLevels = [
    'Entry Level (0-1 years)',
    'Junior (1-3 years)',
    'Mid-Level (3-5 years)',
    'Senior (5-8 years)',
    'Lead (8+ years)',
    'Executive (10+ years)'
  ];

  const sources = [
    'Company Website',
    'LinkedIn',
    'Indeed',
    'Glassdoor',
    'Referral',
    'Job Fair',
    'Recruitment Agency',
    'Social Media',
    'Other'
  ];

  const locations = [
    'Lagos, Nigeria',
    'Abuja, Nigeria',
    'Port Harcourt, Nigeria',
    'Kano, Nigeria',
    'Ibadan, Nigeria',
    'Remote',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add New Applicant
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Add a new job applicant to your recruitment pipeline and start tracking their progress
          </p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <User className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="applicant@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+234 801 234 5678"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Job Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Briefcase className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Job Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position Applied For *</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => handleSelectChange('position', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent className='bg-blue-100'>
                        {positions.map((position) => (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level *</Label>
                    <Select
                      value={formData.experience}
                      onValueChange={(value) => handleSelectChange('experience', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent className='bg-blue-100'>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expectedSalary">Expected Salary (₦)</Label>
                    <Input
                      id="expectedSalary"
                      name="expectedSalary"
                      type="number"
                      placeholder="500000"
                      value={formData.expectedSalary}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Preferred Location
                    </Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => handleSelectChange('location', value)}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-100 border border-gray-200 shadow-lg">
                        {locations.map((location) => (
                          <SelectItem 
                            key={location} 
                            value={location}
                            className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
                          >
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">How did they find us?</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => handleSelectChange('source', value)}
                  >
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent className="bg-blue-100 border border-gray-200 shadow-lg">
                      {sources.map((source) => (
                        <SelectItem 
                          key={source} 
                          value={source}
                          className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
                        >
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Documents & Notes Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <FileText className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Documents & Additional Information</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume/CV Link</Label>
                    <Input
                      id="resume"
                      name="resume"
                      placeholder="https://drive.google.com/file/..."
                      value={formData.resume}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">Cover Letter</Label>
                    <Textarea
                      id="coverLetter"
                      name="coverLetter"
                      placeholder="Paste cover letter content here..."
                      value={formData.coverLetter}
                      onChange={handleInputChange}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Any additional notes about the applicant..."
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/dashboard/applicants')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 w-4" />
                  Back to Applicants
                </Button>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                  >
                    Reset Form
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 flex"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Adding...' : 'Add Applicant'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}