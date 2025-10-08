// UserProfilePage.jsx - FIXED WITH PROPER AUTH USER ID HANDLING
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { employeeAPI } from '@/services/api';
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
  Building,
  Building2
} from 'lucide-react';

const UserProfilePage = () => {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [employeeRecord, setEmployeeRecord] = useState(null);
  
  const [profileData, setProfileData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    bio: '',
    
    // Professional Information
    currentTitle: '',
    currentCompany: '',
    yearsExperience: '',
    industry: '',
    salary: '',
    salaryCurrency: 'NGN',
    noticePeriod: '',
    
    // Skills
    skills: [],
    
    // Education
    education: [],
    
    // Experience
    experience: [],
    
    // Certifications
    certifications: [],
    
    // Social Links
    socialLinks: {
      linkedin: '',
      github: '',
      portfolio: '',
      twitter: ''
    }
  });

  const [tempData, setTempData] = useState({ ...profileData });
  const [newSkill, setNewSkill] = useState('');

  // Fetch employee record from backend
  useEffect(() => {
    if (authUser && (authUser.id || authUser._id)) {
      loadEmployeeProfile();
    } else if (authUser) {
      // If authUser exists but no ID, try to load with fallback data
      console.log('⚠️ Auth user exists but no ID found, using fallback data');
      loadFallbackProfile();
    }
  }, [authUser]);

  const loadFallbackProfile = () => {
    const nameParts = (authUser?.name || '').split(' ');
    const fallbackData = {
      ...profileData,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: authUser?.email || '',
      currentCompany: authUser?.companyName || 'Your Company',
      currentTitle: 'Employee',
    };
    setProfileData(fallbackData);
    setTempData(fallbackData);
    setLoading(false);
  };

  const loadEmployeeProfile = async () => {
    try {
      setLoading(true);
      
      // Get user ID - try different possible fields
      const userId = authUser.id || authUser._id;
      console.log('🔄 Loading employee profile for user:', userId);
      
      if (!userId) {
        console.log('❌ No user ID found, using fallback data');
        loadFallbackProfile();
        return;
      }

      // Fetch employee record by user ID
      const response = await employeeAPI.getByUserId(userId);
      console.log('📥 Employee API response:', response);

      if (response?.data) {
        const employee = response.data;
        setEmployeeRecord(employee);

        // Map employee data to profile data
        const mappedData = {
          firstName: employee.firstName || '',
          lastName: employee.lastName || '',
          email: employee.email || authUser.email,
          phone: employee.phone || '',
          dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
          address: employee.address || '',
          bio: employee.bio || '',
          
          // Professional data
          currentTitle: employee.position || '',
          currentCompany: employee.companyName || authUser.companyName || '',
          salary: employee.salary || '',
          yearsExperience: employee.yearsExperience || '',
          industry: employee.industry || '',
          noticePeriod: employee.noticePeriod || '',
          
          // Arrays
          skills: employee.skills || [],
          education: employee.education || [],
          experience: employee.experience || [],
          certifications: employee.certifications || [],
          socialLinks: employee.socialLinks || { linkedin: '', github: '', portfolio: '', twitter: '' }
        };

        console.log('✅ Mapped profile data:', mappedData);
        setProfileData(mappedData);
        setTempData(mappedData);
      } else {
        // No employee record exists, use auth user data as fallback
        console.log('⚠️ No employee record found, using auth data');
        loadFallbackProfile();
      }
    } catch (error) {
      console.error('❌ Error loading employee profile:', error);
      
      // Check if it's a 404 (not found) error
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        console.log('👤 No employee record exists yet, using fallback data');
        loadFallbackProfile();
      } else {
        toast({
          title: "Error loading profile",
          description: error.message || "Failed to load your profile data.",
          variant: "destructive",
        });
        loadFallbackProfile();
      }
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async () => {
    try {
      setLoading(true);
      console.log('💾 Saving profile data to backend...');

      // Get user ID
      const userId = authUser.id || authUser._id;
      
      if (!userId) {
        toast({
          title: "Error",
          description: "User not authenticated properly.",
          variant: "destructive",
        });
        return;
      }

      // Prepare update data
      const updateData = {
        // Personal info
        firstName: tempData.firstName,
        lastName: tempData.lastName,
        email: tempData.email,
        phone: tempData.phone || 'To be updated',
        dateOfBirth: tempData.dateOfBirth,
        address: tempData.address,
        bio: tempData.bio,
        
        // Professional info
        position: tempData.currentTitle,
        department: tempData.department || tempData.currentTitle || 'General',
        salary: parseFloat(tempData.salary) || 0,
        companyName: tempData.currentCompany,
        
        // Additional profile data
        skills: tempData.skills,
        education: tempData.education,
        experience: tempData.experience,
        certifications: tempData.certifications,
        socialLinks: tempData.socialLinks,
        yearsExperience: tempData.yearsExperience,
        industry: tempData.industry,
        noticePeriod: tempData.noticePeriod,
      };

      console.log('📤 Sending update data:', updateData);

      let response;
      
      if (employeeRecord) {
        // Update existing employee record
        response = await employeeAPI.update(employeeRecord._id, updateData);
      } else {
        // Create new employee record
        response = await employeeAPI.create({
          ...updateData,
          userId: userId,
          status: 'active'
        });
      }
      
      console.log('✅ Save response:', response);

      if (response?.data) {
        setEmployeeRecord(response.data);
        setProfileData({ ...tempData });
        setIsEditing(false);
        
        toast({
          title: "Profile Updated",
          description: "Your profile has been saved successfully.",
        });

        // Reload to ensure data is fresh
        await loadEmployeeProfile();
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: error.message || "Failed to update your profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  const addEducation = () => {
    const newEdu = {
      id: Date.now(),
      degree: '',
      institution: '',
      year: '',
      gpa: ''
    };
    setTempData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const updateEducation = (id, field, value) => {
    setTempData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id) => {
    setTempData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addCertification = () => {
    const newCert = {
      id: Date.now(),
      name: '',
      issuer: '',
      date: '',
      expiryDate: ''
    };
    setTempData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCert]
    }));
  };

  const updateCertification = (id, field, value) => {
    setTempData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert => 
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const removeCertification = (id) => {
    setTempData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
  };

  const currentData = isEditing ? tempData : profileData;
  const profileCompletion = calculateProfileCompletion();

  // Show loading only on initial load, not when saving
  if (loading && !profileData.firstName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading your profile...</p>
          <p className="text-sm text-gray-600 mt-2">Please wait while we load your data</p>
        </div>
      </div>
    );
  }

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
                  {currentData.firstName} {currentData.lastName || authUser?.name}
                </h1>
                <p className="text-blue-100 text-lg">{currentData.currentTitle}</p>
                <div className="flex items-center space-x-2 text-blue-200 mt-1">
                  <Building2 className="h-4 w-4" />
                  <span>{currentData.currentCompany}</span>
                </div>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="flex items-center text-blue-100">
                    <Mail className="h-4 w-4 mr-1" />
                    {currentData.email || authUser?.email}
                  </span>
                  {currentData.phone && (
                    <span className="flex items-center text-blue-100">
                      <Phone className="h-4 w-4 mr-1" />
                      {currentData.phone}
                    </span>
                  )}
                  {currentData.salary && (
                    <span className="flex items-center text-blue-100">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {new Intl.NumberFormat('en-NG', {
                        style: 'currency',
                        currency: 'NGN',
                        minimumFractionDigits: 0
                      }).format(currentData.salary)}
                    </span>
                  )}
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
                <Button 
                  onClick={handleEdit} 
                  variant="secondary" 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  disabled={loading}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button 
                    onClick={handleSave} 
                    variant="secondary" 
                    className="bg-green-500 hover:bg-green-600 text-white border-green-500"
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button 
                    onClick={handleCancel} 
                    variant="secondary" 
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    disabled={loading}
                  >
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

      {/* Professional Information Tab - Updated with Company and Salary */}
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
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentCompany">
                  Company
                  <span className="text-xs text-gray-500 ml-2">(from your registration)</span>
                </Label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 font-medium">{currentData.currentCompany}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Company name is set from your registration and cannot be changed here.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Monthly Salary (₦)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={currentData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., 150000"
                />
                <p className="text-xs text-gray-500">
                  This salary will be used for payroll calculations and shown in employee lists.
                </p>
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="flex justify-between items-center">
              <CardTitle>Education & Certifications</CardTitle>
              {isEditing && (
                <div className="space-x-2">
                  <Button onClick={addEducation} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                  <Button onClick={addCertification} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certification
                  </Button>
                </div>
              )}
            </div>
            <CardDescription>Your educational background and professional certifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Education</h3>
              {currentData.education.map((edu) => (
                <div key={edu.id} className="border rounded-lg p-4 space-y-4 mb-4">
                  {isEditing && (
                    <div className="flex justify-end">
                      <Button
                        onClick={() => removeEducation(edu.id)}
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
                      <Label>Degree</Label>
                      <Input 
                        value={edu.degree} 
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Institution</Label>
                      <Input 
                        value={edu.institution} 
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Input 
                        value={edu.year} 
                        onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>GPA</Label>
                      <Input 
                        value={edu.gpa} 
                        onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                        disabled={!isEditing} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Certifications</h3>
              {currentData.certifications.map((cert) => (
                <div key={cert.id} className="border rounded-lg p-4 space-y-4 mb-4">
                  {isEditing && (
                    <div className="flex justify-end">
                      <Button
                        onClick={() => removeCertification(cert.id)}
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
                      <Label>Certification Name</Label>
                      <Input 
                        value={cert.name} 
                        onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Issuing Organization</Label>
                      <Input 
                        value={cert.issuer} 
                        onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Issue Date</Label>
                      <Input 
                        value={cert.date} 
                        onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <Input 
                        value={cert.expiryDate} 
                        onChange={(e) => updateCertification(cert.id, 'expiryDate', e.target.value)}
                        disabled={!isEditing} 
                      />
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