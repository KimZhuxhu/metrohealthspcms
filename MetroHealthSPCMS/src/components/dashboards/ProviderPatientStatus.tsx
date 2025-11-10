import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Users,
  Activity,
  Bell,
  FileText,
  Heart,
  LogOut,
  Stethoscope,
  ClipboardCheck,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProviderPatientStatus() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const todayAppointments = [
    {
      id: 'APT002',
      time: '2:00 PM',
      patientName: 'Mary Thompson',
      type: 'Consultation',
      status: 'Checked-in',
      duration: '45 min',
    },
  ];

  const myPatients = [
    {
      id: 'P001',
      name: 'John Anderson',
      age: 59,
      room: 'ICU-101',
      diagnosis: 'Acute Coronary Syndrome',
      lastVisit: '2 hours ago',
      status: 'Stable',
      alerts: 1,
    },
    {
      id: 'P003',
      name: 'James Wilson',
      age: 73,
      room: 'MS-201',
      diagnosis: 'Community-Acquired Pneumonia',
      lastVisit: '5 hours ago',
      status: 'Improving',
      alerts: 0,
    },
  ];

  const pendingTasks = [
    { id: 1, task: 'Review lab results - John Anderson', priority: 'high' },
    { id: 2, task: 'Update treatment plan - James Wilson', priority: 'medium' },
    { id: 3, task: 'Discharge planning - Patient P003', priority: 'low' },
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
                <p className="text-xs text-muted-foreground">
                  Provider Dashboard - {user?.department || 'Internal Medicine'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">{user?.name}</p>
                  <Badge variant="success">Physician</Badge>
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
            <h2 className="text-3xl font-bold">Good morning, {user?.name}!</h2>
            <p className="text-muted-foreground mt-1">
              You have {todayAppointments.length} appointment and {myPatients.length} active patients today
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today's Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{todayAppointments.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Scheduled visits</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{myPatients.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Under your care</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pendingTasks.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Require review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">
                  {myPatients.reduce((sum, p) => sum + p.alerts, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Patient alerts</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Schedule
                </CardTitle>
                <CardDescription>Your appointments for today</CardDescription>
              </CardHeader>
              <CardContent>
                {todayAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {todayAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Clock className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <p className="font-semibold">{apt.patientName}</p>
                              <p className="text-sm text-muted-foreground">{apt.type}</p>
                            </div>
                            <Badge>{apt.status}</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{apt.time}</span>
                            <span>•</span>
                            <span>{apt.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No appointments scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Patients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  My Patients
                </CardTitle>
                <CardDescription>Patients under your care</CardDescription>
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
                        <div className="flex gap-2">
                          {patient.alerts > 0 && (
                            <Badge variant="warning" className="h-6">
                              {patient.alerts} Alert
                            </Badge>
                          )}
                          <Badge variant="default">{patient.status}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{patient.diagnosis}</p>
                      <p className="text-xs text-muted-foreground">
                        Last visit: {patient.lastVisit}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Pending Tasks
                </CardTitle>
                <CardDescription>Action items requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 mt-0.5 rounded border-gray-300"
                        readOnly
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.task}</p>
                        <Badge
                          variant={
                            task.priority === 'high'
                              ? 'destructive'
                              : task.priority === 'medium'
                              ? 'warning'
                              : 'secondary'
                          }
                          className="text-xs mt-1"
                        >
                          {task.priority} priority
                        </Badge>
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
                <CardDescription>Common provider tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Write SOAP Note
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Review Vitals
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Full Schedule
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Patient List
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
