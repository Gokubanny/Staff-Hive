// src/pages/SignUp.jsx - Updated with verification flow
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Building2, User, Lock, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function SignUp() {
  const [accountType, setAccountType] = useState('user');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    employeeId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [pendingVerification, setPendingVerification] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) newErrors.name = 'Name can only contain letters and spaces';

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      newErrors.password = 'Password must contain uppercase, lowercase, and number';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (accountType === 'user') {
      if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
      else if (formData.employeeId.trim().length < 3) newErrors.employeeId = 'Employee ID must be at least 3 characters';
      
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      else if (formData.companyName.trim().length < 2) newErrors.companyName = 'Company name must be at least 2 characters';
    } else if (accountType === 'admin') {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      else if (formData.companyName.trim().length < 2) newErrors.companyName = 'Company name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setPendingVerification(false);
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const signupData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: accountType,
        ...(accountType === 'user' && { employeeId: formData.employeeId.trim() }),
        companyName: formData.companyName.trim()
      };

      const result = await signup(signupData);

      if (result.success) {
        if (result.requiresVerification || result.user?.verificationStatus === 'pending') {
          setPendingVerification(true);
          toast({ 
            title: "Registration Submitted!", 
            description: "Your account is pending admin approval." 
          });
        } else {
          toast({ title: "Account created!", description: `Welcome, ${result.user.name}` });
          const redirectPath = result.user.role === 'admin' ? '/dashboard' : '/user-dashboard';
          navigate(redirectPath, { replace: true });
        }
      } else {
        const errorLower = (result.error || '').toLowerCase();
        if (errorLower.includes('email')) setErrors({ email: result.error });
        else if (errorLower.includes('employee id')) setErrors({ employeeId: result.error });
        else if (errorLower.includes('company')) setErrors({ companyName: result.error });
        else toast({ title: "Signup failed", description: result.error, variant: "destructive" });
      }
    } catch (err) {
      console.error('SignUp error:', err);
      toast({ title: "Signup failed", description: "Unexpected error occurred", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountTypeChange = (type) => {
    setAccountType(type);
    setErrors({});
    setPendingVerification(false);
    setFormData(prev => ({
      ...prev,
      employeeId: type === 'user' ? prev.employeeId : '',
      companyName: prev.companyName
    }));
  };

  if (pendingVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary-glow/10 p-4">
        <Card className="w-full max-w-md shadow-elevated border-0">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Pending Verification</CardTitle>
            <CardDescription>Your registration is under review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-yellow-200 bg-yellow-50">
              <CheckCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle>Registration Submitted Successfully</AlertTitle>
              <AlertDescription>
                Your account requires approval from your company administrator.
                You will receive notification once approved.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">What happens next?</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Your company admin will review your registration</li>
                <li>You'll receive notification once approved</li>
                <li>After approval, you can sign in with your credentials</li>
              </ul>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Button onClick={() => navigate('/signin')} className="w-full">
                Go to Sign In
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPendingVerification(false);
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    companyName: '',
                    employeeId: ''
                  });
                }}
                className="w-full"
              >
                Register Another Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary-glow/10 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join our HR Management platform</p>
        </div>

        <Card className="shadow-elevated border-0">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Select account type and create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-6">
              <Button
                type="button"
                variant={accountType === 'user' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => handleAccountTypeChange('user')}
                disabled={isLoading}
              >
                <User className="h-4 w-4" /> User
              </Button>
              <Button
                type="button"
                variant={accountType === 'admin' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => handleAccountTypeChange('admin')}
                disabled={isLoading}
              >
                <Lock className="h-4 w-4" /> Admin
              </Button>
            </div>

            {accountType === 'user' && (
              <Alert className="mb-4 border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  User accounts require admin approval. Enter the exact company name registered by your admin.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'border-destructive' : ''}
                  disabled={isLoading}
                />
                {errors.name && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" /> {errors.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'border-destructive' : ''}
                  disabled={isLoading}
                />
                {errors.email && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" /> {errors.email}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder={accountType === 'admin' ? 'Enter company name' : 'Enter exact company name'}
                  value={formData.companyName}
                  onChange={handleChange}
                  className={errors.companyName ? 'border-destructive' : ''}
                  disabled={isLoading}
                />
                {errors.companyName && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" /> {errors.companyName}
                  </div>
                )}
              </div>

              {accountType === 'user' && (
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    name="employeeId"
                    placeholder="Enter your employee ID"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className={errors.employeeId ? 'border-destructive' : ''}
                    disabled={isLoading}
                  />
                  {errors.employeeId && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" /> {errors.employeeId}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'border-destructive' : ''}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" /> {errors.password}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'border-destructive' : ''}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" /> {errors.confirmPassword}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/signin" className="font-medium text-primary hover:text-primary-glow transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}