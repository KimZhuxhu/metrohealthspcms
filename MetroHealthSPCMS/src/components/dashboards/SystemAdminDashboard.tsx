import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Activity,
  Settings,
  Shield,
  Heart,
  LogOut,
  Bell,
  Server,
  Database,
  UserCog,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SystemAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const systemStats = [
    { label: 'Total Users', value: '8', icon: Users, change: '+2 this month' },
    { label: 'Active Patients', value: '5', icon: Activity, change: 'In system' },
    { label: 'System Uptime', value: '99.9%', icon: Server, change: 'Last 30 days' },
    { label: 'Storage Used', value: '45%', icon: Database, change: '2.3 GB / 5 GB' },
  ];

  const recentActivity = [
    {
      id: 1,
      user: 'Dr. Robert Smith',
      action: 'Logged in',
      time: '5 minutes ago',
      type: 'login',
    },
    {
      id: 2,
      user: 'Jennifer Johnson',
      action: 'Added nursing note',
      time: '15 minutes ago',
      type: 'activity',
    },
    {
      id: 3,
      user: 'patient1@metro.health',
      action: 'Scheduled appointment',
      time: '32 minutes ago',
      type: 'appointment',
    },
    {
      id: 4,
      user: 'System',
      action: 'Database backup completed',
      time: '1 hour ago',
      type: 'system',
    },
  ];

  const systemAlerts = [
    {
      id: 1,
      message: 'Storage approaching 50% capacity',
      severity: 'warning',
      time: '2 hours ago',
    },
    {
      id: 2,
      message: 'Security update available',
      severity: 'info',
      time: '1 day ago',
    },
  ];

  const usersByRole = [
    { role: 'Patients', count: 2, color: 'bg-blue-500' },
    { role: 'Nurses', count: 2, color: 'bg-green-500' },
    { role: 'Providers', count: 2, color: 'bg-purple-500' },
    { role: 'Charge Nurses', count: 1, color: 'bg-orange-500' },
    { role: 'Admins', count: 1, color: 'bg-red-500' },
  ];

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
                <p className="text-xs text-muted-foreground">System Administration</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {systemAlerts.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-warning rounded-full"></span>
                )}
              </Button>

              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">{user?.name}</p>
                  <Badge variant="destructive">Administrator</Badge>
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
            <h2 className="text-3xl font-bold">System Overview</h2>
            <p className="text-muted-foreground mt-1">
              Monitor and manage your healthcare system
            </p>
          </div>

          {/* System Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            {systemStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </CardTitle>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  System Alerts
                </CardTitle>
                <CardDescription>Active system notifications</CardDescription>
              </CardHeader>
              <CardContent>
                {systemAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {systemAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <AlertTriangle
                          className={`h-5 w-5 mt-0.5 ${
                            alert.severity === 'warning' ? 'text-warning' : 'text-primary'
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                        </div>
                        <Badge
                          variant={alert.severity === 'warning' ? 'warning' : 'default'}
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No active alerts</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.user}</p>
                        <p className="text-sm text-muted-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  User Distribution
                </CardTitle>
                <CardDescription>Users by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {usersByRole.map((item) => (
                    <div key={item.role} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.role}</span>
                          <span className="text-sm text-muted-foreground">{item.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>Total Users</span>
                      <span>{usersByRole.reduce((sum, item) => sum + item.count, 0)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Admin Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Administration
                </CardTitle>
                <CardDescription>System management tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  User Management
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Database Management
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics & Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
