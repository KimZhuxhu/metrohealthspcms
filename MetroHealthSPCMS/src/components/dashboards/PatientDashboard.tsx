import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  patientApi,
  appointmentApi,
  medicationApi,
  labResultsApi,
  vitalsApi,
} from '@/lib/api';
import type { PatientProfile, Appointment, Medication, LabResult, VitalsTimeSeries } from '@/types';
import {
  Calendar,
  FileText,
  Activity,
  User,
  Clock,
  Heart,
  LogOut,
  Bell,
  Pill,
  FlaskConical,
  MessageSquare,
  Shield,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export function PatientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [vitals, setVitals] = useState<VitalsTimeSeries | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.patientId) {
      loadPatientData();
    }
  }, [user]);

  const loadPatientData = async () => {
    if (!user?.patientId) return;

    setIsLoading(true);
    try {
      const [patientRes, apptsRes, medsRes, labsRes, vitalsRes] = await Promise.all([
        patientApi.getById(user.patientId),
        appointmentApi.getByPatient(user.patientId),
        medicationApi.getByPatient(user.patientId),
        labResultsApi.getByPatient(user.patientId),
        vitalsApi.getByPatient(user.patientId),
      ]);

      if (patientRes.success && patientRes.data) setPatient(patientRes.data);
      if (apptsRes.success && apptsRes.data) setAppointments(apptsRes.data);
      if (medsRes.success && medsRes.data) setMedications(medsRes.data);
      if (labsRes.success && labsRes.data) setLabResults(labsRes.data);
      if (vitalsRes.success && vitalsRes.data) setVitals(vitalsRes.data);
    } catch (err) {
      console.error('Failed to load patient data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const upcomingAppointments = appointments
    .filter(
      (a) =>
        new Date(a.dateTime) > new Date() &&
        a.status !== 'cancelled' &&
        a.status !== 'completed'
    )
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 3);

  const activeMedications = medications.filter((m) => m.status === 'active');

  const recentLabResults = labResults
    .filter((lab) => lab.status === 'completed')
    .sort(
      (a, b) =>
        new Date(b.resultDate || b.orderedDate).getTime() -
        new Date(a.resultDate || a.orderedDate).getTime()
    )
    .slice(0, 5);

  const latestVitals = vitals?.readings[vitals.readings.length - 1];

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

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
                <p className="text-xs text-muted-foreground">Patient Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">{user?.name}</p>
                  <Badge variant="secondary" className="text-xs">Patient</Badge>
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
        {isLoading ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your health information...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div>
              <h2 className="text-3xl font-bold">Welcome, {user?.name}!</h2>
              <p className="text-muted-foreground mt-1">
                Manage your health appointments and records
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
              <Link to="/appointments/schedule">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>Schedule Appointment</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Book a new appointment with your healthcare provider
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/appointments/my-appointments">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>My Appointments</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      View and manage your upcoming and past appointments
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link to={`/patients/${user?.patientId}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>Medical Records</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Access your complete medical history and test results
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Dashboard Content */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Upcoming Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Appointments
                  </CardTitle>
                  <CardDescription>Your scheduled visits</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingAppointments.map((apt) => (
                        <div
                          key={apt.appointmentId}
                          className="flex flex-col gap-2 p-4 border rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold">{formatDateTime(apt.dateTime)}</p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {apt.type}
                              </p>
                            </div>
                            <Badge variant="outline">{apt.status}</Badge>
                          </div>
                          {apt.reason && (
                            <p className="text-sm text-muted-foreground">{apt.reason}</p>
                          )}
                          {apt.location && (
                            <p className="text-sm text-muted-foreground">📍 {apt.location}</p>
                          )}
                        </div>
                      ))}
                      <Link to="/appointments/my-appointments">
                        <Button variant="outline" className="w-full">
                          View All Appointments
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                      <Link to="/appointments/schedule">
                        <Button>Schedule Appointment</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Current Medications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Current Medications
                  </CardTitle>
                  <CardDescription>{activeMedications.length} active</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeMedications.length > 0 ? (
                    <div className="space-y-3">
                      {activeMedications.slice(0, 5).map((med) => (
                        <div
                          key={med.medicationId}
                          className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <p className="font-semibold">{med.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {med.dosage} - {med.frequency}
                          </p>
                          {med.instructions && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {med.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                      <Link to={`/patients/${user?.patientId}`}>
                        <Button variant="outline" className="w-full">
                          View All Medications
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No active medications</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Lab Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5" />
                    Recent Lab Results
                  </CardTitle>
                  <CardDescription>Latest test results</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentLabResults.length > 0 ? (
                    <div className="space-y-3">
                      {recentLabResults.map((lab) => (
                        <div
                          key={lab.labId}
                          className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-semibold">{lab.testName}</p>
                            {lab.abnormalFlag && (
                              <Badge
                                variant={
                                  lab.abnormalFlag === 'critical'
                                    ? 'destructive'
                                    : 'default'
                                }
                              >
                                {lab.abnormalFlag}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm">
                            <span className="font-medium">{lab.value}</span> {lab.unit}
                            <span className="text-muted-foreground ml-2">
                              (Normal: {lab.referenceRange})
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(lab.resultDate || lab.orderedDate)}
                          </p>
                        </div>
                      ))}
                      <Link to={`/patients/${user?.patientId}`}>
                        <Button variant="outline" className="w-full">
                          View All Lab Results
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No lab results available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Latest Vital Signs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Latest Vital Signs
                  </CardTitle>
                  <CardDescription>
                    {latestVitals ? formatDateTime(latestVitals.timestamp) : 'No data'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {latestVitals ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Heart Rate</p>
                        <p className="text-lg font-bold">
                          {latestVitals.heartRate || 'N/A'}
                          {latestVitals.heartRate && (
                            <span className="text-xs font-normal text-muted-foreground ml-1">
                              bpm
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Blood Pressure</p>
                        <p className="text-lg font-bold">
                          {latestVitals.systolicBP && latestVitals.diastolicBP
                            ? `${latestVitals.systolicBP}/${latestVitals.diastolicBP}`
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Temperature</p>
                        <p className="text-lg font-bold">
                          {latestVitals.temperature
                            ? `${latestVitals.temperature.toFixed(1)}°C`
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">SpO2</p>
                        <p className="text-lg font-bold">
                          {latestVitals.spO2 ? `${latestVitals.spO2}%` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No vital signs recorded</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Health Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Health Summary
                </CardTitle>
                <CardDescription>
                  Quick overview of your health information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {patient ? (
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Blood Type</p>
                      <p className="text-2xl font-bold">{patient.bloodType || 'Unknown'}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Allergies</p>
                      {patient.allergies && patient.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {patient.allergies.map((allergy, idx) => (
                            <Badge key={idx} variant="destructive" className="text-xs">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm">None</p>
                      )}
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Care Team</p>
                      <p className="text-sm font-semibold">
                        {patient.careTeam.length} members
                      </p>
                      <Link to={`/patients/${patient.patientId}`}>
                        <Button variant="link" size="sm" className="px-0 h-auto">
                          View Team
                        </Button>
                      </Link>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Secure Messaging</p>
                      <Button variant="outline" size="sm" className="w-full mt-2" disabled>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Coming Soon
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading health summary...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
