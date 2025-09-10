import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Building2, ArrowLeft } from 'lucide-react';

export default function EditCompany() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { companies, updateCompany } = useData();
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

  useEffect(() => {
    const company = companies.find(c => c.id === id);
    if (company) {
      setFormData(company);
    }
  }, [id, companies]);

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
    
    updateCompany(id, formData);
    toast({
      title: "Company updated",
      description: "Company information has been updated successfully.",
    });
    
    navigate('/dashboard/companies');
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
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Company
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Update company information and details
          </p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="founded">Founded Year *</Label>
                  <Input
                    id="founded"
                    name="founded"
                    type="number"
                    value={formData.founded}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

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
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Building2 className="mr-2 h-4 w-4" />
                  Update Company
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}