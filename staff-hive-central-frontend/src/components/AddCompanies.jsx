import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
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
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Building2, FileText, MapPin, Phone, ArrowLeft } from 'lucide-react';

export default function AddCompanies() {
  const navigate = useNavigate();
  const { addCompany } = useData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    businessType: '',
    registrationNumber: '',
    taxId: '',
    industry: '',
    founded: '',
    description: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    employeeCount: '',
    hrContactName: '',
    hrContactEmail: '',
    hrContactPhone: ''
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    addCompany(formData);
    toast({
      title: "Company registered",
      description: "New company has been registered successfully.",
    });
    
    navigate('/companies');
  };

  const businessTypes = [
    'Corporation',
    'LLC',
    'Partnership',
    'Sole Proprietorship',
    'Non-Profit',
    'Other'
  ];

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Consulting',
    'Other'
  ];

  const states = [
    'Lagos',
    'Abuja',
    'Kano',
    'Rivers',
    'Oyo',
    'Delta',
    'Kaduna',
    'Ogun',
    'Imo',
    'Plateau'
  ];

  const employeeCounts = [
    '1-10',
    '11-50',
    '51-100',
    '101-500',
    '501-1000',
    '1000+'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Company Registration
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Register your company with Staff Hive Central to start managing your HR operations efficiently
          </p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Company Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <FileText className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Company Information</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Please fill in all required information to register your company
                </p>
                
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Company Details
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Company Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter company name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type *</Label>
                      <Select
                        value={formData.businessType}
                        onValueChange={(value) => handleSelectChange('businessType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          {businessTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Business Registration Number *</Label>
                      <Input
                        id="registrationNumber"
                        name="registrationNumber"
                        placeholder="RC1234567"
                        value={formData.registrationNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID / TIN *</Label>
                      <Input
                        id="taxId"
                        name="taxId"
                        placeholder="Enter Tax ID"
                        value={formData.taxId}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry Type *</Label>
                      <Select
                        value={formData.industry}
                        onValueChange={(value) => handleSelectChange('industry', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="founded">Founded Year *</Label>
                      <Input
                        id="founded"
                        name="founded"
                        type="number"
                        placeholder="2020"
                        min="1800"
                        max={new Date().getFullYear()}
                        value={formData.founded}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Company Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Provide a brief description of your company's business activities"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Company Address Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <MapPin className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Company Address</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="streetAddress">Street Address *</Label>
                    <Input
                      id="streetAddress"
                      name="streetAddress"
                      placeholder="Enter complete street address"
                      value={formData.streetAddress}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="Enter city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) => handleSelectChange('state', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      placeholder="Enter postal code"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Phone className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Company Phone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="+234 801 234 5678"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Company Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="info@company.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        placeholder="https://www.company.com"
                        value={formData.website}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employeeCount">Number of Employees *</Label>
                      <Select
                        value={formData.employeeCount}
                        onValueChange={(value) => handleSelectChange('employeeCount', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee count" />
                        </SelectTrigger>
                        <SelectContent>
                          {employeeCounts.map((count) => (
                            <SelectItem key={count} value={count}>
                              {count}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* HR Contact Person Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Building2 className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">HR Contact Person</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hrContactName">HR Contact Name *</Label>
                      <Input
                        id="hrContactName"
                        name="hrContactName"
                        placeholder="Enter HR contact name"
                        value={formData.hrContactName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hrContactEmail">HR Contact Email *</Label>
                      <Input
                        id="hrContactEmail"
                        name="hrContactEmail"
                        type="email"
                        placeholder="hr@company.com"
                        value={formData.hrContactEmail}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hrContactPhone">HR Contact Phone *</Label>
                    <Input
                      id="hrContactPhone"
                      name="hrContactPhone"
                      placeholder="+234 801 234 5678"
                      value={formData.hrContactPhone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/dashboard/companies')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Companies
                </Button>
                <Button type="submit" className="flex bg-blue-600 hover:bg-blue-700">
                  <Building2 className="mr-2 h-4 w-4" />
                  Register Company
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

