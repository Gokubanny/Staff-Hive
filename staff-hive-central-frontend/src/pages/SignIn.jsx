import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState('user');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password, accountType);
      if (success) {
        toast({
          title: "Welcome back!",
          description: `You have successfully signed in as ${accountType}.`,
        });
        navigate(accountType === 'admin' ? '/dashboard' : '/user-dashboard');
      } else {
        toast({
          title: "Sign in failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary-glow/10 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
            {accountType === 'admin' ? (
              <Lock className="w-6 h-6 text-primary-foreground" />
            ) : (
              <User className="w-6 h-6 text-primary-foreground" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {accountType === 'admin' ? 'Admin Portal' : 'User Portal'}
          </h1>
        </div>

        <Card className="shadow-elevated border-0">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your {accountType} account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-6">
              <Button
                type="button"
                variant={accountType === 'user' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setAccountType('user')}
              >
                <User className="h-4 w-4" />
                User
              </Button>
              <Button
                type="button"
                variant={accountType === 'admin' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setAccountType('admin')}
              >
                <Lock className="h-4 w-4" />
                Admin
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-primary hover:text-primary-glow transition-colors"
                >
                  Sign up
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
// import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { useToast } from '@/hooks/use-toast';
// import { Eye, EyeOff, Building2 } from 'lucide-react';

// export default function SignIn() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const success = await login(email, password);
//       if (success) {
//         toast({
//           title: "Welcome back!",
//           description: "You have successfully signed in.",
//         });
//         navigate('/dashboard');
//       } else {
//         toast({
//           title: "Sign in failed",
//           description: "Invalid email or password. Please try again.",
//           variant: "destructive",
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "An unexpected error occurred. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary-glow/10 p-4">
//       <div className="w-full max-w-md space-y-8">
//         <div className="text-center">
//           <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
//             <Building2 className="w-6 h-6 text-primary-foreground" />
//           </div>
//           <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
//           <p className="text-muted-foreground mt-2">
//             Sign in to your HR Management account
//           </p>
//         </div>

//         <Card className="shadow-elevated border-0">
//           <CardHeader>
//             <CardTitle>Sign In</CardTitle>
//             <CardDescription>
//               Enter your credentials to access your account
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="Enter your email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="password">Password</Label>
//                 <div className="relative">
//                   <Input
//                     id="password"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Enter your password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
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
//                       <EyeOff className="h-4 w-4 text-muted-foreground" />
//                     ) : (
//                       <Eye className="h-4 w-4 text-muted-foreground" />
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
//                 {isLoading ? "Signing in..." : "Sign In"}
//               </Button>
//             </form>

//             <div className="mt-6 text-center">
//               <p className="text-sm text-muted-foreground">
//                 Don't have an account?{" "}
//                 <Link
//                   to="/signup"
//                   className="font-medium text-primary hover:text-primary-glow transition-colors"
//                 >
//                   Sign up
//                 </Link>
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

