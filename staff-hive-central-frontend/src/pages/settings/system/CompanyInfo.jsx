import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useData } from '@/contexts/DataContext';
import { 
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Calendar,
  Save,
  Upload,
  Camera
} from "lucide-react";

export default function CompanyInfo() {
  const { companies } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "TechCorp Solutions",
    description: "Leading technology solutions provider specializing in enterprise software and digital transformation.",
    industry: "Technology",
    size: "201-500 employees",
    founded: "2010",
    website: "https://techcorp.com",
    email: "contact@techcorp.com",
    phone: "+1 (555) 123-4567",
    address: {
      street: "123 Innovation Drive",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "United States"
    },
    logo: null,
    socialMedia: {
      linkedin: "https://linkedin.com/company/techcorp",
      twitter: "https://twitter.com/techcorp",
      facebook: ""
    },
    companyValues: [
      "Innovation",
      "Integrity",
      "Collaboration",
      "Excellence"
    ],
    benefits: [
      "Health Insurance",
      "Dental & Vision",
      "401(k) Matching",
      "Flexible PTO",
      "Remote Work Options",
      "Professional Development"
    ]
  });

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = () => {
    // Here you would typically save to your backend/context
    console.log('Saving company info:', formData);
    setIsEditing(false);
    // Show success message
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          logo: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Company Information</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your company profile and basic information.
          </p>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit Information'}
        </Button>
      </div>

      {/* Company Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo and Basic Info */}
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="relative">
                {formData.logo ? (
                  <img 
                    src={formData.logo} 
                    alt="Company Logo" 
                    className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                    <Building2 className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                {isEditing && (
                  <label className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload}
                      className="hidden" 
                    />
                  </label>
                )}
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  {isEditing ? (
                    <Input
                      id="company-name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-lg font-medium">{formData.name}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  {isEditing ? (
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1">{formData.industry}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="company-size">Company Size</Label>
                  {isEditing ? (
                    <select
                      id="company-size"
                      value={formData.size}
                      onChange={(e) => handleInputChange('size', e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1-10 employees">1-10 employees</option>
                      <option value="11-50 employees">11-50 employees</option>
                      <option value="51-200 employees">51-200 employees</option>
                      <option value="201-500 employees">201-500 employees</option>
                      <option value="501-1000 employees">501-1000 employees</option>
                      <option value="1000+ employees">1000+ employees</option>
                    </select>
                  ) : (
                    <p className="mt-1">{formData.size}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="founded">Founded</Label>
                  {isEditing ? (
                    <Input
                      id="founded"
                      value={formData.founded}
                      onChange={(e) => handleInputChange('founded', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1">{formData.founded}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Company Description</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-gray-700">{formData.description}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1">{formData.email}</p>
              )}
            </div>
            
            <div>
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1">{formData.phone}</p>
              )}
            </div>
            
            <div>
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website
              </Label>
              {isEditing ? (
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <a 
                  href={formData.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-1 text-blue-600 hover:underline block"
                >
                  {formData.website}
                </a>
              )}
            </div>
          </div>
          
          <div>
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Address
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <Input
                  placeholder="Street Address"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="City"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  disabled={!isEditing}
                />
                <Input
                  placeholder="State"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="ZIP Code"
                  value={formData.address.zipCode}
                  onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                  disabled={!isEditing}
                />
                <Input
                  placeholder="Country"
                  value={formData.address.country}
                  onChange={(e) => handleInputChange('address.country', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Values */}
      <Card>
        <CardHeader>
          <CardTitle>Company Values</CardTitle>
          <CardDescription>
            Core values that define your company culture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {formData.companyValues.map((value, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {value}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Employee Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Benefits</CardTitle>
          <CardDescription>
            Benefits and perks offered to employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {formData.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {benefit}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}