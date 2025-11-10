import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Activity,
  Bell,
  AlertTriangle,
  FileText,
  Heart,
  LogOut,
  Stethoscope,
  ClipboardList,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NurseDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const activeAlerts = [
    {
      id: 'ALT001',
      patientName: 'Robert Garcia',
      room: 'ICU-103',
      alert: 'Critical Vital Signs',
      severity: 'critical',
      time: '15 min ago',
    },
    {
      id: 'ALT002',
      patientName: 'John Anderson',
      room: 'ICU-101',
      alert: 'Elevated Blood Pressure',
      severity: 'high',
      time: '45 min ago',
    },
  ];

  const myPatients = [
    {
      id: 'P001',
      name: 'John Anderson',
      room: 'ICU-101',
      age: 59,
      diagnosis: 'Acute Coronary Syndrome',
      status: 'Stable',
    },
    {
      id: 'P005',
      name: 'Robert Garcia',
      room: 'ICU-103',
      age: 80,
      diagnosis: 'Septic Shock',
      status: 'Critical',
    },
  ];

  const tasks = [
    { id: 1, task: 'Vitals check - John Anderson', time: '10:00 AM', completed: false },
    { id: 2, task: 'Medication - Robert Garcia', time: '10:30 AM', completed: false },
    { id: 3, task: 'Wound care - John Anderson', time: '11:00 AM', completed: false },
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
                <p className="text-xs text-muted-foreground">Nurse Dashboard - {user?.unit || 'ICU'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-critical rounded-full"></span>
              </Button>

              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">{user?.name}</p>
                  <Badge variant="default">Nurse</Badge>
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
            <h2 className="text-3xl font-bold">Good morning, {user?.name.split(' ')[0]}!</h2>
            <p className="text-muted-foreground mt-1">
              You have {myPatients.length} patients and {activeAlerts.length} active alerts
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  My Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{myPatients.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Active assignments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-critical">{activeAlerts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Require attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tasks Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{tasks.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Pending tasks</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Critical Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1</div>
                <p className="text-xs text-muted-foreground mt-1">Need monitoring</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Active Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-critical" />
                  Active Alerts
                </CardTitle>
                <CardDescription>Patients requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <AlertTriangle
                        className={`h-5 w-5 mt-0.5 ${
                          alert.severity === 'critical' ? 'text-critical' : 'text-warning'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-semibold">{alert.patientName}</p>
                          <Badge
                            variant={alert.severity === 'critical' ? 'destructive' : 'warning'}
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.alert}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>Room: {alert.room}</span>
                          <span>•</span>
                          <span>{alert.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* My Patients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  My Patients
                </CardTitle>
                <CardDescription>Current patient assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {patient.age} years • Room {patient.room}
                          </p>
                        </div>
                        <Badge
                          variant={patient.status === 'Critical' ? 'destructive' : 'default'}
                        >
                          {patient.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{patient.diagnosis}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Today's Tasks
                </CardTitle>
                <CardDescription>Scheduled nursing tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        className="h-4 w-4 rounded border-gray-300"
                        readOnly
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.task}</p>
                        <p className="text-xs text-muted-foreground">{task.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common nursing tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Record Vitals
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Add Nursing Note
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  View All Alerts
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Patient Census
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
