import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Edit, 
  Save, 
  X,
  Plus,
  Trash2,
  Upload,
  Camera,
  Award,
  GraduationCap,
  Building
} from 'lucide-react';

const UserProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  
  const [profileData, setProfileData] = useState({
    // Personal Information
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    address: '123 Main Street, San Francisco, CA 94102',
    bio: 'Passionate software developer with 5+ years of experience in full-stack development. Love creating innovative solutions and working with cutting-edge technologies.',
    
    // Professional Information
    currentTitle: 'Senior Frontend Developer',
    currentCompany: 'TechCorp Inc.',
    yearsExperience: '5-7',
    industry: 'Technology',
    salaryExpectation: '120000',
    salaryCurrency: 'USD',
    noticePeriod: '2-weeks',
    
    // Skills
    skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'Python', 'AWS', 'MongoDB', 'GraphQL'],
    
    // Education
    education: [
      {
        id: 1,
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University of California, Berkeley',
        year: '2012-2016',
        gpa: '3.8'
      }
    ],
    
    // Experience
    experience: [
      {
        id: 1,
        title: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        startDate: '2022-01',
        endDate: 'Present',
        description: 'Lead frontend development for multiple web applications using React and TypeScript. Mentored junior developers and improved code quality standards.'
      },
      {
        id: 2,
        title: 'Frontend Developer',
        company: 'StartupXYZ',
        startDate: '2019-06',
        endDate: '2021-12',
        description: 'Developed responsive web applications and collaborated with design team to implement user-friendly interfaces.'
      }
    ],
    
    // Certifications
    certifications: [
      {
        id: 1,
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        date: '2023-03',
        expiryDate: '2026-03'
      }
    ],
    
    // Social Links
    socialLinks: {
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe',
      portfolio: 'https://johndoe.dev',
      twitter: ''
    }
  });

  const [tempData, setTempData] = useState({ ...profileData });
  const [newSkill, setNewSkill] = useState('');

  const calculateProfileCompletion = () => {
    const fields = [
      profileData.firstName, profileData.lastName, profileData.email, 
      profileData.phone, profileData.bio, profileData.currentTitle,
      profileData.currentCompany, profileData.skills.length > 0,
      profileData.education.length > 0, profileData.experience.length > 0
    ];
    const completed = fields.filter(field => field && field !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  const handleEdit = () => {
    setTempData({ ...profileData });
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfileData({ ...tempData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempData({ ...profileData });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    if (isEditing) {
      setTempData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleNestedInputChange = (section, field, value) => {
    if (isEditing) {
      setTempData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !tempData.skills.includes(newSkill.trim())) {
      setTempData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setTempData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addExperience = () => {
    const newExp = {
      id: Date.now(),
      title: '',
      company: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    setTempData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }));
  };

  const updateExperience = (id, field, value) => {
    setTempData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id) => {
    setTempData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const currentData = isEditing ? tempData : profileData;
  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {currentData.firstName} {currentData.lastName}
                </h1>
                <p className="text-blue-100 text-lg">{currentData.currentTitle}</p>
                <p className="text-blue-200">{currentData.currentCompany}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="flex items-center text-blue-100">
                    <Mail className="h-4 w-4 mr-1" />
                    {currentData.email}
                  </span>
                  <span className="flex items-center text-blue-100">
                    <Phone className="h-4 w-4 mr-1" />
                    {currentData.phone}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="mb-4">
                <p className="text-sm text-blue-100">Profile Completion</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Progress value={profileCompletion} className="w-32 h-2" />
                  <span className="text-sm font-semibold">{profileCompletion}%</span>
                </div>
              </div>
              {!isEditing ? (
                <Button onClick={handleEdit} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button onClick={handleSave} variant="secondary" className="bg-green-500 hover:bg-green-600 text-white border-green-500">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'personal', label: 'Personal Info', icon: User },
          { id: 'professional', label: 'Professional', icon: Briefcase },
          { id: 'experience', label: 'Experience', icon: Building },
          { id: 'education', label: 'Education', icon: GraduationCap },
          { id: 'skills', label: 'Skills', icon: Award }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Personal Information Tab */}
      {activeTab === 'personal' && (
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Manage your personal details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={currentData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={currentData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={currentData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={currentData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={currentData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={currentData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={currentData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </div>
            
            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={currentData.socialLinks.linkedin}
                    onChange={(e) => handleNestedInputChange('socialLinks', 'linkedin', e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={currentData.socialLinks.github}
                    onChange={(e) => handleNestedInputChange('socialLinks', 'github', e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://github.com/username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio</Label>
                  <Input
                    id="portfolio"
                    value={currentData.socialLinks.portfolio}
                    onChange={(e) => handleNestedInputChange('socialLinks', 'portfolio', e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={currentData.socialLinks.twitter}
                    onChange={(e) => handleNestedInputChange('socialLinks', 'twitter', e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://twitter.com/username"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professional Information Tab */}
      {activeTab === 'professional' && (
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
            <CardDescription>Your current role and career preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentTitle">Current Job Title</Label>
                <Input
                  id="currentTitle"
                  value={currentData.currentTitle}
                  onChange={(e) => handleInputChange('currentTitle', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentCompany">Current Company</Label>
                <Input
                  id="currentCompany"
                  value={currentData.currentCompany}
                  onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Select
                  value={currentData.yearsExperience}
                  onValueChange={(value) => handleInputChange('yearsExperience', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0-1 years</SelectItem>
                    <SelectItem value="2-3">2-3 years</SelectItem>
                    <SelectItem value="4-5">4-5 years</SelectItem>
                    <SelectItem value="5-7">5-7 years</SelectItem>
                    <SelectItem value="8-10">8-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={currentData.industry}
                  onValueChange={(value) => handleInputChange('industry', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryExpectation">Salary Expectation</Label>
                <div className="flex gap-2">
                  <Select
                    value={currentData.salaryCurrency}
                    onValueChange={(value) => handleInputChange('salaryCurrency', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="NGN">NGN</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="salaryExpectation"
                    value={currentData.salaryExpectation}
                    onChange={(e) => handleInputChange('salaryExpectation', e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., 120000"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="noticePeriod">Notice Period</Label>
                <Select
                  value={currentData.noticePeriod}
                  onValueChange={(value) => handleInputChange('noticePeriod', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select notice period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="1-week">1 week</SelectItem>
                    <SelectItem value="2-weeks">2 weeks</SelectItem>
                    <SelectItem value="1-month">1 month</SelectItem>
                    <SelectItem value="2-months">2 months</SelectItem>
                    <SelectItem value="3-months">3 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <Card>
          <CardHeader>
            <CardTitle>Skills & Expertise</CardTitle>
            <CardDescription>Showcase your technical and professional skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a new skill"
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill} disabled={!newSkill.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {currentData.skills.map((skill, index) => (
                <div key={index} className="relative">
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Experience Tab */}
      {activeTab === 'experience' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Work Experience</CardTitle>
                <CardDescription>Your professional work history</CardDescription>
              </div>
              {isEditing && (
                <Button onClick={addExperience} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentData.experience.map((exp, index) => (
              <div key={exp.id} className="border rounded-lg p-4 space-y-4">
                {isEditing && (
                  <div className="flex justify-end">
                    <Button
                      onClick={() => removeExperience(exp.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input
                      value={exp.title}
                      onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      value={exp.endDate}
                      onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Present"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Education Tab */}
      {activeTab === 'education' && (
        <Card>
          <CardHeader>
            <CardTitle>Education & Certifications</CardTitle>
            <CardDescription>Your educational background and professional certifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Education</h3>
              {currentData.education.map((edu, index) => (
                <div key={edu.id} className="border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Degree</Label>
                      <Input value={edu.degree} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label>Institution</Label>
                      <Input value={edu.institution} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Input value={edu.year} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label>GPA</Label>
                      <Input value={edu.gpa} disabled={!isEditing} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Certifications</h3>
              {currentData.certifications.map((cert, index) => (
                <div key={cert.id} className="border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Certification Name</Label>
                      <Input value={cert.name} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label>Issuing Organization</Label>
                      <Input value={cert.issuer} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label>Issue Date</Label>
                      <Input value={cert.date} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <Input value={cert.expiryDate} disabled={!isEditing} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserProfilePage;