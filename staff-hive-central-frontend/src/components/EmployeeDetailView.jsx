// src/components/EmployeeDetailView.jsx - FIXED VERSION
import React, { useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Briefcase, Calendar, DollarSign, Award, GraduationCap, Building2 } from 'lucide-react';

const EmployeeDetailView = ({ employee, isOpen, onClose }) => {
  console.log('🔍 EmployeeDetailView props:', { 
    hasEmployee: !!employee, 
    isOpen, 
    employeeData: employee 
  });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      console.log('✅ Modal opened, body scroll disabled');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !employee) {
    console.log('⚠️ Not rendering - isOpen:', isOpen, 'employee:', !!employee);
    return null;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFullName = () => {
    if (employee.firstName && employee.lastName) {
      return `${employee.firstName} ${employee.lastName}`;
    }
    return employee.name || 'Unknown Employee';
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      console.log('🔙 Backdrop clicked, closing modal');
      onClose();
    }
  };

  console.log('🎨 Rendering employee detail view for:', getFullName());

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Employee Details</h2>
            <p className="text-sm text-gray-500">Complete profile information for {getFullName()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{getFullName()}</h2>
                <p className="text-blue-100">{employee.position || 'N/A'}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="flex items-center text-sm">
                    <Building2 className="h-4 w-4 mr-1" />
                    {employee.companyName || employee.companyId?.name || 'N/A'}
                  </span>
                  <span className="flex items-center text-sm">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {employee.department || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white border rounded-lg">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <div className="flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-900">{employee.email || 'N/A'}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <div className="flex items-center mt-1">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-900">{employee.phone || 'N/A'}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-900">{formatDate(employee.dateOfBirth)}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <span className="block mt-1 text-gray-900">{employee.gender || 'N/A'}</span>
              </div>
              {employee.bio && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Bio</label>
                  <p className="mt-1 text-gray-700">{employee.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* Employment Information */}
          <div className="bg-white border rounded-lg">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Employment Information
              </h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Employee ID</label>
                <span className="block mt-1 font-mono text-gray-900">{employee.employeeId || 'N/A'}</span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Position</label>
                <span className="block mt-1 text-gray-900">{employee.position || 'N/A'}</span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Department</label>
                <span className="block mt-1 text-gray-900">{employee.department || 'N/A'}</span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Employment Type</label>
                <span className="block mt-1 text-gray-900">{employee.employmentType || 'N/A'}</span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Start Date</label>
                <span className="block mt-1 text-gray-900">{formatDate(employee.startDate)}</span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                  employee.status === 'Active' ? 'bg-green-100 text-green-800' :
                  employee.status === 'Inactive' ? 'bg-yellow-100 text-yellow-800' :
                  employee.status === 'On Leave' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {employee.status || 'Active'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Monthly Salary</label>
                <div className="flex items-center mt-1">
                  <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                  <span className="font-semibold text-lg text-gray-900">{formatCurrency(employee.salary)}</span>
                </div>
              </div>
              {employee.yearsExperience && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Years of Experience</label>
                  <span className="block mt-1 text-gray-900">{employee.yearsExperience}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {employee.skills && employee.skills.length > 0 && (
            <div className="bg-white border rounded-lg">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Skills
                </h3>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {employee.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Education */}
          {employee.education && employee.education.length > 0 && (
            <div className="bg-white border rounded-lg">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Education
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {employee.education.map((edu, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                    <p className="text-gray-600">{edu.institution}</p>
                    <p className="text-sm text-gray-500">
                      {edu.year} {edu.gpa && `• GPA: ${edu.gpa}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {employee.experience && employee.experience.length > 0 && (
            <div className="bg-white border rounded-lg">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Work Experience
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {employee.experience.map((exp, index) => (
                  <div key={index} className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                    <p className="text-gray-600">{exp.company}</p>
                    <p className="text-sm text-gray-500">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </p>
                    {exp.description && (
                      <p className="text-sm mt-2 text-gray-700">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Address */}
          {employee.address && (
            <div className="bg-white border rounded-lg">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Address
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-900">{employee.address?.street || 'N/A'}</p>
                <p className="text-gray-900">
                  {employee.address?.city ? `${employee.address.city}, ` : ''}
                  {employee.address?.state || ''} {employee.address?.postalCode || ''}
                </p>
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {employee.emergencyContact && (
            <div className="bg-white border rounded-lg">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold">Emergency Contact</h3>
              </div>
              <div className="p-6 grid grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <span className="block mt-1 text-gray-900">{employee.emergencyContact?.name || 'N/A'}</span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Relationship</label>
                  <span className="block mt-1 text-gray-900">{employee.emergencyContact?.relationship || 'N/A'}</span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <span className="block mt-1 text-gray-900">{employee.emergencyContact?.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailView;