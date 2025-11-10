import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Users,
  Calendar,
  Activity,
  FileText,
  Settings,
  LogOut,
  Bell,
  LayoutDashboard,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'charge_nurse':
        return 'warning';
      case 'nurse':
        return 'default';
      case 'provider':
        return 'success';
      case 'patient':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const quickLinks = [
    { icon: Users, label: 'Patients', href: '/patients', roles: ['admin', 'nurse', 'charge_nurse', 'provider'] },
    { icon: Calendar, label: 'Schedule Appointment', href: '/appointments/schedule', roles: ['patient'] },
    { icon: Calendar, label: 'My Appointments', href: '/appointments/my-appointments', roles: ['patient'] },
    { icon: Calendar, label: 'Appointments', href: '/appointments', roles: ['admin', 'nurse', 'provider'] },
    { icon: Activity, label: 'Vitals & Alerts', href: '/vitals', roles: ['admin', 'nurse', 'charge_nurse', 'provider'] },
    { icon: FileText, label: 'Clinical Notes', href: '/notes', roles: ['admin', 'nurse', 'charge_nurse', 'provider'] },
    { icon: Settings, label: 'Settings', href: '/settings', roles: ['admin'] },
  ];

  const userQuickLinks = quickLinks.filter(link =>
    link.roles.some(role => user?.roles.includes(role as any))
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Metro Health System</h1>
                <p className="text-xs text-muted-foreground">Smart Patient Care Management</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-critical rounded-full"></span>
              </Button>

              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{user && getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div>
            <h2 className="text-3xl font-bold">Welcome back, {user?.name.split(' ')[0]}!</h2>
            <p className="text-muted-foreground mt-1">
              Here's what's happening in your healthcare system today
            </p>
            <div className="flex gap-2 mt-3">
              {user?.roles.map((role) => (
                <Badge key={role} variant={getRoleBadgeVariant(role) as any}>
                  {role.replace('_', ' ').toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              Quick Access
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userQuickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} to={link.href}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <CardTitle className="text-lg">{link.label}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>
                          Access {link.label.toLowerCase()} management
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Role-specific Dashboard Content */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Overview</CardTitle>
                <CardDescription>Current statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Patients</span>
                    <span className="font-semibold">5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Alerts</span>
                    <span className="font-semibold text-critical">4</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Appointments Today</span>
                    <span className="font-semibold">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Latest updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">New vitals recorded</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Bell className="h-4 w-4 text-warning mt-0.5" />
                    <div>
                      <p className="font-medium">Alert acknowledged</p>
                      <p className="text-xs text-muted-foreground">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Appointment completed</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Activity className="h-4 w-4 mr-2" />
                  Record Vitals
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
