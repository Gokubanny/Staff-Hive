import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, User, Mail, Phone, Briefcase, FileText, CheckCircle, Clock, MapPin, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const JobApplicationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Mock job data
  const [job] = useState({
    id: 'job1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    type: 'full-time',
    salary: '120000',
    salaryCurrency: 'USD',
    description: 'We are looking for a skilled Frontend Developer to join our dynamic team. You will be responsible for building user-facing web applications using modern JavaScript frameworks.',
    requirements: ['React', 'JavaScript', 'HTML/CSS', 'TypeScript'],
    benefits: ['Health Insurance', 'Remote Work', '401k', 'Flexible Hours']
  });
  
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    email: '',
    phone: '',
    location: '',
    
    // Professional Info
    currentPosition: '',
    experience: '',
    expectedSalary: '',
    noticePeriod: '',
    
    // Application Details
    coverLetter: '',
    linkedinProfile: '',
    portfolioWebsite: '',
    availability: '',
    relocate: '',
    additionalInfo: '',
    
    // Documents
    resumeFile: null,
    portfolioFile: null
  });

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field, file) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.fullName && formData.email && formData.phone && formData.location;
      case 2:
        return formData.currentPosition && formData.experience;
      case 3:
        return formData.coverLetter;
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      alert('Please fill in all required fields before continuing.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitSuccess(true);
    } catch (error) {
      alert("There was an error submitting your application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card className="text-center p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-green-800">Application Submitted!</h2>
            <p className="text-green-700">
              Thank you for applying to <strong>{job.title}</strong> at <strong>{job.company}</strong>.
            </p>
            <p className="text-sm text-green-600">
              We'll review your application and get back to you within 2-3 business days.
            </p>
            <div className="flex gap-4 justify-center mt-6">
              <Button className="bg-green-600 hover:bg-green-700">
                View Application Status
              </Button>
              <Button variant="outline">
                Browse More Jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Button>
      </div>

      {/* Job Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl text-blue-900">{job.title}</CardTitle>
              <CardDescription className="text-blue-700 text-lg mt-1">
                {job.company}
              </CardDescription>
              <div className="flex items-center gap-4 mt-2 text-sm text-blue-600">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {job.type}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  ${job.salary}
                </span>
              </div>
            </div>
            <Badge className="bg-blue-600 text-white">
              Now Hiring
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Application Progress</span>
            <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Personal Info</span>
            <span>Professional</span>
            <span>Application</span>
            <span>Documents</span>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep === 1 && <><User className="h-5 w-5" />Personal Information</>}
            {currentStep === 2 && <><Briefcase className="h-5 w-5" />Professional Information</>}
            {currentStep === 3 && <><FileText className="h-5 w-5" />Application Details</>}
            {currentStep === 4 && <><Upload className="h-5 w-5" />Upload Documents</>}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Let's start with your basic information"}
            {currentStep === 2 && "Tell us about your professional background"}
            {currentStep === 3 && "Why are you interested in this position?"}
            {currentStep === 4 && "Upload your resume and portfolio (optional)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Current Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g. New York, NY"
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Professional Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPosition">Current Position *</Label>
                <Input
                  id="currentPosition"
                  value={formData.currentPosition}
                  onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                  placeholder="e.g. Frontend Developer at ABC Company"
                  className="h-11"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Select onValueChange={(value) => handleInputChange('experience', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="2-3">2-3 years</SelectItem>
                      <SelectItem value="4-5">4-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedSalary">Expected Salary</Label>
                  <Input
                    id="expectedSalary"
                    value={formData.expectedSalary}
                    onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                    placeholder="e.g. $80,000 - $100,000"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="noticePeriod">Notice Period</Label>
                <Select onValueChange={(value) => handleInputChange('noticePeriod', value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select notice period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Available immediately</SelectItem>
                    <SelectItem value="2-weeks">2 weeks</SelectItem>
                    <SelectItem value="1-month">1 month</SelectItem>
                    <SelectItem value="2-months">2 months</SelectItem>
                    <SelectItem value="3-months">3 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Application Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coverLetter">Cover Letter *</Label>
                <Textarea
                  id="coverLetter"
                  value={formData.coverLetter}
                  onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                  placeholder="Tell us why you're interested in this position and how your skills align with the role..."
                  rows={8}
                  className="min-h-[120px]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                  <Input
                    id="linkedinProfile"
                    value={formData.linkedinProfile}
                    onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolioWebsite">Portfolio Website</Label>
                  <Input
                    id="portfolioWebsite"
                    value={formData.portfolioWebsite}
                    onChange={(e) => handleInputChange('portfolioWebsite', e.target.value)}
                    placeholder="https://yourportfolio.com"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="availability">Preferred Start Date</Label>
                  <Input
                    id="availability"
                    type="date"
                    value={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relocate">Willing to Relocate?</Label>
                  <Select onValueChange={(value) => handleInputChange('relocate', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="maybe">Maybe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                  placeholder="Any additional information you'd like to share..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 4: Upload Documents */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="resume" className="text-lg font-medium">Upload Resume/CV</Label>
                    <p className="text-sm text-gray-500">PDF, DOC, or DOCX (Max 5MB)</p>
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange('resumeFile', e.target.files[0])}
                      className="mt-2"
                    />
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="portfolio" className="text-lg font-medium">Portfolio/Additional Documents</Label>
                    <p className="text-sm text-gray-500">Optional - PDF, DOC, or DOCX (Max 5MB)</p>
                    <Input
                      id="portfolio"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange('portfolioFile', e.target.files[0])}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Application Summary */}
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg">Application Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Position:</span> {job.title}
                    </div>
                    <div>
                      <span className="font-medium">Company:</span> {job.company}
                    </div>
                    <div>
                      <span className="font-medium">Name:</span> {formData.fullName || 'Not provided'}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {formData.email || 'Not provided'}
                    </div>
                    <div>
                      <span className="font-medium">Experience:</span> {formData.experience || 'Not provided'}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {formData.location || 'Not provided'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 1}
              className="h-11 px-6"
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentStep < totalSteps ? (
                <Button 
                  onClick={nextStep}
                  className="h-11 px-6 bg-blue-600 hover:bg-blue-700"
                >
                  Next Step
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="h-11 px-8 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobApplicationForm;