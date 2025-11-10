import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    
    setIsLoading(false);

    if (result.success) {
      // Get user from localStorage (just set by login)
      const currentUserStr = localStorage.getItem('metro_health_current_user');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        
        // Determine role-specific dashboard
        let destination = from || '/dashboard';
        if (currentUser.roles.includes('patient')) {
          destination = from || '/dashboard/patient';
        } else if (currentUser.roles.includes('provider')) {
          destination = from || '/dashboard/provider';
        } else if (currentUser.roles.includes('admin')) {
          destination = from || '/dashboard/admin';
        } else if (currentUser.roles.includes('nurse') || currentUser.roles.includes('charge_nurse')) {
          destination = from || '/dashboard/nurse';
        }
        
        navigate(destination, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const quickLogins = [
    { role: 'Patient', email: 'patient@metrohealth.org' },
    { role: 'Nurse', email: 'nurse@metrohealth.org' },
    { role: 'Physician', email: 'physician@metrohealth.org' },
    { role: 'Admin', email: 'admin@metrohealth.org' },
  ];

  const quickLogin = (email: string) => {
    setEmail(email);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6">
        {/* Branding Section */}
        <div className="flex flex-col justify-center text-center md:text-left space-y-4 p-8">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="bg-primary p-3 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">Metro Health System</h1>
              <p className="text-sm text-muted-foreground">Smart Patient Care Management</p>
            </div>
          </div>
          <div className="space-y-2 text-muted-foreground">
            <p className="text-lg">Welcome to your healthcare management platform</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Role-based access control</li>
              <li>Real-time patient monitoring</li>
              <li>Clinical decision support</li>
              <li>Comprehensive care coordination</li>
            </ul>
          </div>

          {/* Quick Login Section */}
          <div className="mt-8 p-4 bg-white/50 rounded-lg">
            <p className="text-sm font-semibold mb-2 text-muted-foreground">Demo Quick Login:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickLogins.map((item) => (
                <Button
                  key={item.email}
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin(item.email)}
                  className="text-xs"
                >
                  {item.role}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              All demo accounts use password: <code className="bg-muted px-1 rounded">password123</code>
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@metro.health"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
