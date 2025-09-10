import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Shield, 
  Plane, 
  GraduationCap, 
  Car,
  Coffee,
  Smartphone,
  Home,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  Info,
  Download,
  Phone,
  Mail
} from "lucide-react";

export default function UserBenefitsPage() {
  const [benefits, setBenefits] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Mock benefits data
    const mockBenefits = [
      {
        id: 1,
        title: 'Health Insurance',
        category: 'Health',
        icon: Heart,
        status: 'enrolled',
        coverage: '100%',
        description: 'Comprehensive medical, dental, and vision coverage for you and your family.',
        details: [
          'Medical coverage up to ₦5,000,000 annually',
          'Dental coverage up to ₦500,000',
          'Vision coverage included',
          'Family coverage available',
          'Network of 500+ hospitals nationwide'
        ],
        provider: 'Nigeria Health Plus',
        contactInfo: {
          phone: '+234 700 123 4567',
          email: 'support@healthplus.ng'
        },
        documents: ['Policy Document', 'Network Providers List', 'Claim Forms']
      },
      {
        id: 2,
        title: 'Annual Leave',
        category: 'Time Off',
        icon: Plane,
        status: 'active',
        coverage: '25 days',
        description: 'Paid vacation days to rest and recharge.',
        details: [
          '25 paid vacation days per year',
          'Additional 5 days after 5 years of service',
          'Unused days can be carried over (max 5 days)',
          'Advance booking required for peak periods'
        ],
        usage: {
          used: 8,
          total: 25,
          remaining: 17
        }
      },
      {
        id: 3,
        title: 'Life Insurance',
        category: 'Insurance',
        icon: Shield,
        status: 'enrolled',
        coverage: '₦10,000,000',
        description: 'Life insurance coverage to protect your family\'s financial future.',
        details: [
          'Coverage amount: ₦10,000,000',
          'Accidental death benefit: ₦15,000,000',
          'No medical exam required',
          'Beneficiary designation available',
          'Portable coverage option'
        ],
        provider: 'Guardian Life Insurance',
        contactInfo: {
          phone: '+234 701 234 5678',
          email: 'claims@guardianlife.ng'
        }
      },
      {
        id: 4,
        title: 'Professional Development Fund',
        category: 'Learning',
        icon: GraduationCap,
        status: 'active',
        coverage: '₦500,000',
        description: 'Annual budget for conferences, courses, and professional certifications.',
        details: [
          'Annual allocation: ₦500,000',
          'Covers conferences, workshops, and courses',
          'Online learning platforms included',
          'Certification exam fees covered',
          'Book and material allowances'
        ],
        usage: {
          used: 150000,
          total: 500000,
          remaining: 350000
        }
      },
      {
        id: 5,
        title: 'Transportation Allowance',
        category: 'Transportation',
        icon: Car,
        status: 'active',
        coverage: '₦50,000/month',
        description: 'Monthly transportation stipend for commuting expenses.',
        details: [
          'Monthly allowance: ₦50,000',
          'Covers public transportation or fuel costs',
          'Direct deposit to salary',
          'No receipts required',
          'Annual review for adjustments'
        ]
      },
      {
        id: 6,
        title: 'Wellness Program',
        category: 'Health',
        icon: Heart,
        status: 'enrolled',
        coverage: 'Full Access',
        description: 'Comprehensive wellness program including gym membership and health screenings.',
        details: [
          'Gym membership at partner facilities',
          'Annual health screenings',
          'Mental health counseling sessions',
          'Wellness workshops and seminars',
          'Healthy meal subsidies'
        ],
        provider: 'WellCare Wellness Center',
        contactInfo: {
          phone: '+234 802 345 6789',
          email: 'wellness@wellcare.ng'
        }
      },
      {
        id: 7,
        title: 'Remote Work Equipment',
        category: 'Equipment',
        icon: Home,
        status: 'eligible',
        coverage: '₦300,000',
        description: 'Equipment allowance for home office setup and remote work.',
        details: [
          'One-time setup allowance: ₦300,000',
          'Covers desk, chair, monitor, etc.',
          'Internet connectivity stipend',
          'Equipment replacement after 3 years',
          'Tech support included'
        ]
      },
      {
        id: 8,
        title: 'Mobile Phone Plan',
        category: 'Communication',
        icon: Smartphone,
        status: 'active',
        coverage: 'Unlimited',
        description: 'Company-sponsored mobile phone plan for work communication.',
        details: [
          'Unlimited calls and data',
          'International roaming included',
          'Latest smartphone every 2 years',
          'Family plan options available',
          'Insurance coverage included'
        ]
      },
      {
        id: 9,
        title: 'Employee Assistance Program',
        category: 'Support',
        icon: Coffee,
        status: 'active',
        coverage: '24/7 Support',
        description: 'Confidential counseling and support services for personal and work-related issues.',
        details: [
          '24/7 confidential counseling hotline',
          'Legal consultation services',
          'Financial planning assistance',
          'Childcare and eldercare referrals',
          'Work-life balance support'
        ],
        provider: 'Employee Care Services',
        contactInfo: {
          phone: '+234 800 HELP NOW',
          email: 'support@employeecare.ng'
        }
      }
    ];

    setBenefits(mockBenefits);
  }, []);

  const categories = [
    { key: 'all', label: 'All Benefits', count: benefits.length },
    { key: 'Health', label: 'Health & Wellness', count: benefits.filter(b => b.category === 'Health').length },
    { key: 'Insurance', label: 'Insurance', count: benefits.filter(b => b.category === 'Insurance').length },
    { key: 'Time Off', label: 'Time Off', count: benefits.filter(b => b.category === 'Time Off').length },
    { key: 'Learning', label: 'Learning & Development', count: benefits.filter(b => b.category === 'Learning').length },
    { key: 'Transportation', label: 'Transportation', count: benefits.filter(b => b.category === 'Transportation').length },
  ];

  const filteredBenefits = selectedCategory === 'all' 
    ? benefits 
    : benefits.filter(benefit => benefit.category === selectedCategory);

  const getStatusColor = (status) => {
    switch (status) {
      case 'enrolled':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'eligible':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Health':
        return Heart;
      case 'Insurance':
        return Shield;
      case 'Time Off':
        return Plane;
      case 'Learning':
        return GraduationCap;
      case 'Transportation':
        return Car;
      case 'Equipment':
        return Home;
      case 'Communication':
        return Smartphone;
      case 'Support':
        return Coffee;
      default:
        return Info;
    }
  };

  const enrollInBenefit = (benefitId) => {
    setBenefits(benefits.map(benefit =>
      benefit.id === benefitId ? { ...benefit, status: 'enrolled' } : benefit
    ));
  };

  const stats = {
    totalBenefits: benefits.length,
    enrolled: benefits.filter(b => b.status === 'enrolled').length,
    active: benefits.filter(b => b.status === 'active').length,
    eligible: benefits.filter(b => b.status === 'eligible').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Benefits</h1>
          <p className="text-gray-600">Explore and manage your comprehensive benefits package</p>
        </div>
      </div>

      {/* Benefits Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Benefits</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalBenefits}</p>
              </div>
              <Info className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enrolled</p>
                <p className="text-2xl font-bold text-green-600">{stats.enrolled}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Benefits</p>
                <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.eligible}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category.key}
            variant={selectedCategory === category.key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.key)}
            className="flex items-center gap-2"
          >
            {category.label}
            <Badge variant="secondary" className="ml-1">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBenefits.map((benefit) => {
          const IconComponent = getCategoryIcon(benefit.category);
          return (
            <Card key={benefit.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{benefit.title}</h3>
                      <p className="text-sm text-gray-600">{benefit.category}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(benefit.status)}>
                    {benefit.status}
                  </Badge>
                </div>

                <p className="text-gray-700 mb-4">{benefit.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Coverage:</span>
                    <span className="font-bold text-green-600">{benefit.coverage}</span>
                  </div>

                  {benefit.usage && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">Usage:</span>
                        <span className="text-sm text-gray-600">
                          {benefit.usage.used.toLocaleString()} / {benefit.usage.total.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={(benefit.usage.used / benefit.usage.total) * 100} 
                        className="w-full h-2" 
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Remaining: {benefit.usage.remaining?.toLocaleString() || (benefit.usage.total - benefit.usage.used).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Benefit Details */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">What's Included:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {benefit.details.slice(0, 3).map((detail, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                    {benefit.details.length > 3 && (
                      <li className="text-blue-600 text-xs">+{benefit.details.length - 3} more benefits</li>
                    )}
                  </ul>
                </div>

                {/* Provider Info */}
                {benefit.provider && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-1">Provider: {benefit.provider}</p>
                    {benefit.contactInfo && (
                      <div className="flex gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{benefit.contactInfo.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{benefit.contactInfo.email}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {benefit.status === 'eligible' && (
                    <Button 
                      className="flex-1"
                      onClick={() => enrollInBenefit(benefit.id)}
                    >
                      Enroll Now
                    </Button>
                  )}
                  
                  {benefit.status === 'enrolled' && (
                    <Button variant="outline" className="flex-1">
                      <Info className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  )}

                  {benefit.status === 'active' && (
                    <Button variant="outline" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  )}

                  {benefit.documents && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Open enrollment period runs from November 1-30 each year for the following year's benefits.</p>
            <p>• Life changes (marriage, birth, etc.) may qualify you for mid-year enrollment changes.</p>
            <p>• Contact HR at hr@company.com or +234 700 HR HELP for benefit questions or enrollment assistance.</p>
            <p>• Some benefits may have waiting periods or eligibility requirements based on employment duration.</p>
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {filteredBenefits.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No benefits found</h3>
            <p className="text-gray-600">
              {selectedCategory === 'all' 
                ? 'No benefits are currently available.' 
                : `No benefits found in the ${selectedCategory} category.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}