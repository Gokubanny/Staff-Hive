import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Building2, User, Lock, AlertCircle } from 'lucide-react';

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
  
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role-specific validation
    if (accountType === 'user') {
      if (!formData.employeeId.trim()) {
        newErrors.employeeId = 'Employee ID is required';
      }
    } else if (accountType === 'admin') {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data for backend
      const signupData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: accountType,
        ...(accountType === 'user' && { employeeId: formData.employeeId.trim() }),
        ...(accountType === 'admin' && { companyName: formData.companyName.trim() })
      };

      const result = await signup(signupData);

      if (result.success) {
        toast({
          title: "Account created successfully!",
          description: `Your ${accountType} account has been created and you are now signed in.`,
        });
        
        // Navigate based on role
        navigate(accountType === 'admin' ? '/dashboard' : '/user-dashboard');
      } else {
        // Handle backend validation errors
        if (result.error) {
          if (result.error.includes('already exists') || result.error.includes('email')) {
            setErrors({ email: result.error });
          } else if (result.error.includes('Employee ID')) {
            setErrors({ employeeId: result.error });
          } else {
            // Show general error
            toast({
              title: "Registration failed",
              description: result.error,
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error('SignUp error:', error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountTypeChange = (type) => {
    setAccountType(type);
    setErrors({}); // Clear errors when switching account type
    // Optionally clear role-specific fields
    setFormData(prev => ({
      ...prev,
      employeeId: '',
      companyName: ''
    }));
  };

  const renderUserForm = () => (
    <div className="space-y-2">
      <Label htmlFor="employeeId">Employee ID</Label>
      <Input
        id="employeeId"
        name="employeeId"
        type="text"
        placeholder="Enter your employee ID"
        value={formData.employeeId}
        onChange={handleChange}
        className={errors.employeeId ? 'border-destructive focus:border-destructive' : ''}
        disabled={isLoading}
        required
      />
      {errors.employeeId && (
        <div className="flex items-center gap-1 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {errors.employeeId}
        </div>
      )}
    </div>
  );

  const renderAdminForm = () => (
    <div className="space-y-2">
      <Label htmlFor="companyName">Company Name</Label>
      <Input
        id="companyName"
        name="companyName"
        type="text"
        placeholder="Enter your company name"
        value={formData.companyName}
        onChange={handleChange}
        className={errors.companyName ? 'border-destructive focus:border-destructive' : ''}
        disabled={isLoading}
        required
      />
      {errors.companyName && (
        <div className="flex items-center gap-1 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {errors.companyName}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary-glow/10 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-2">
            Join our HR Management platform
          </p>
        </div>

        <Card className="shadow-elevated border-0">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Select account type and create your account
            </CardDescription>
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
                <User className="h-4 w-4" />
                User
              </Button>
              <Button
                type="button"
                variant={accountType === 'admin' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => handleAccountTypeChange('admin')}
                disabled={isLoading}
              >
                <Lock className="h-4 w-4" />
                Admin
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'border-destructive focus:border-destructive' : ''}
                  disabled={isLoading}
                  required
                />
                {errors.name && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name}
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
                  className={errors.email ? 'border-destructive focus:border-destructive' : ''}
                  disabled={isLoading}
                  required
                />
                {errors.email && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email}
                  </div>
                )}
              </div>

              {accountType === 'user' ? renderUserForm() : renderAdminForm()}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'border-destructive focus:border-destructive' : ''}
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.password}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'border-destructive focus:border-destructive' : ''}
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="font-medium text-primary hover:text-primary-glow transition-colors"
                >
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



// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { useToast } from '@/hooks/use-toast';
// import { Eye, EyeOff, Building2, User, Lock } from 'lucide-react';

// export default function SignUp() {
//   const [accountType, setAccountType] = useState('user'); // 'user' or 'admin'
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     companyName: '', // Only for admin
//     employeeId: ''  // Only for user
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   const handleChange = (e) => {
//     setFormData(prev => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     if (formData.password !== formData.confirmPassword) {
//       toast({
//         title: "Password mismatch",
//         description: "Passwords do not match. Please try again.",
//         variant: "destructive",
//       });
//       setIsLoading(false);
//       return;
//     }

//     try {
//       // Mock registration - replace with real API call
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       toast({
//         title: "Account created!",
//         description: `Your ${accountType} account has been created successfully. Please sign in.`,
//       });
//       navigate('/signin');
//     } catch (error) {
//       toast({
//         title: "Registration failed",
//         description: "An error occurred during registration. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const renderUserForm = () => (
//     <>
//       <div className="space-y-2">
//         <Label htmlFor="employeeId">Employee ID</Label>
//         <Input
//           id="employeeId"
//           name="employeeId"
//           type="text"
//           placeholder="Enter your employee ID"
//           value={formData.employeeId}
//           onChange={handleChange}
//           required
//         />
//       </div>
//     </>
//   );

//   const renderAdminForm = () => (
//     <>
//       <div className="space-y-2">
//         <Label htmlFor="companyName">Company Name</Label>
//         <Input
//           id="companyName"
//           name="companyName"
//           type="text"
//           placeholder="Enter your company name"
//           value={formData.companyName}
//           onChange={handleChange}
//           required
//         />
//       </div>
//     </>
//   );

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary-glow/10 p-4">
//       <div className="w-full max-w-md space-y-8">
//         <div className="text-center">
//           <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
//             <Building2 className="w-6 h-6 text-primary-foreground" />
//           </div>
//           <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
//           <p className="text-muted-foreground mt-2">
//             Join our HR Management platform
//           </p>
//         </div>

//         <Card className="shadow-elevated border-0">
//           <CardHeader>
//             <CardTitle>Sign Up</CardTitle>
//             <CardDescription>
//               Select account type and create your account
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="flex gap-2 mb-6">
//               <Button
//                 type="button"
//                 variant={accountType === 'user' ? 'default' : 'outline'}
//                 className="flex-1 gap-2"
//                 onClick={() => setAccountType('user')}
//               >
//                 <User className="h-4 w-4" />
//                 User
//               </Button>
//               <Button
//                 type="button"
//                 variant={accountType === 'admin' ? 'default' : 'outline'}
//                 className="flex-1 gap-2"
//                 onClick={() => setAccountType('admin')}
//               >
//                 <Lock className="h-4 w-4" />
//                 Admin
//               </Button>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="name">Full Name</Label>
//                 <Input
//                   id="name"
//                   name="name"
//                   type="text"
//                   placeholder="Enter your full name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   name="email"
//                   type="email"
//                   placeholder="Enter your email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>

//               {accountType === 'user' ? renderUserForm() : renderAdminForm()}

//               <div className="space-y-2">
//                 <Label htmlFor="password">Password</Label>
//                 <div className="relative">
//                   <Input
//                     id="password"
//                     name="password"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Create a password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     required
//                   />
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="sm"
//                     className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? (
//                       <Eye className="h-4 w-4 text-muted-foreground" />
//                     ) : (
//                       <EyeOff className="h-4 w-4 text-muted-foreground" />
//                     )}
//                   </Button>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="confirmPassword">Confirm Password</Label>
//                 <div className="relative">
//                   <Input
//                     id="confirmPassword"
//                     name="confirmPassword"
//                     type={showConfirmPassword ? "text" : "password"}
//                     placeholder="Confirm your password"
//                     value={formData.confirmPassword}
//                     onChange={handleChange}
//                     required
//                   />
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="sm"
//                     className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   >
//                     {showConfirmPassword ? (
//                       <Eye className="h-4 w-4 text-muted-foreground" />
//                     ) : (
//                       <EyeOff className="h-4 w-4 text-muted-foreground" />
//                     )}
//                   </Button>
//                 </div>
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full"
//                 style={{color: 'black'}}
//                 disabled={isLoading}
//               >
//                 {isLoading ? "Creating account..." : "Create Account"}
//               </Button>
//             </form>

//             <div className="mt-6 text-center">
//               <p className="text-sm text-muted-foreground">
//                 Already have an account?{" "}
//                 <Link
//                   to="/signin"
//                   className="font-medium text-primary hover:text-primary-glow transition-colors"
//                 >
//                   Sign in
//                 </Link>
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }