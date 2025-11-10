import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  patientApi,
  vitalsApi,
  medicationApi,
  appointmentApi,
  alertApi,
  nursingNotesApi,
} from '@/lib/api';
import type {
  PatientProfile,
  VitalsTimeSeries,
  VitalSign,
  Medication,
  Appointment,
  Alert,
  NursingNote,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  User,
  Pill,
  Calendar,
  Activity,
  AlertTriangle,
  FileText,
  Phone,
  MapPin,
  Thermometer,
  Shield,
} from 'lucide-react';
import { format } from 'date-fns';

export function PatientDetail() {
  const { patientId } = useParams<{ patientId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [vitals, setVitals] = useState<VitalsTimeSeries | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notes, setNotes] = useState<NursingNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  useEffect(() => {
    // Security check: If user is a patient, they can only view their own data
    if (user?.roles.includes('patient') && user.patientId !== patientId) {
      setError('Access denied: You can only view your own medical records');
      setIsLoading(false);
    }
  }, [user, patientId]);

  const loadPatientData = async () => {
    if (!patientId) return;

    // Security check
    if (user?.roles.includes('patient') && user.patientId !== patientId) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Load patient profile
      const patientResponse = await patientApi.getById(patientId);
      if (!patientResponse.success || !patientResponse.data) {
        setError(patientResponse.error || 'Patient not found');
        setIsLoading(false);
        return;
      }
      setPatient(patientResponse.data);

      // Load all related data in parallel
      const [vitalsRes, medsRes, apptsRes, alertsRes, notesRes] = await Promise.all([
        vitalsApi.getByPatient(patientId),
        medicationApi.getByPatient(patientId),
        appointmentApi.getByPatient(patientId),
        alertApi.getByPatient(patientId),
        nursingNotesApi.getByPatient(patientId),
      ]);

      if (vitalsRes.success && vitalsRes.data) setVitals(vitalsRes.data);
      if (medsRes.success && medsRes.data) setMedications(medsRes.data);
      if (apptsRes.success && apptsRes.data) setAppointments(apptsRes.data);
      if (alertsRes.success && alertsRes.data) setAlerts(alertsRes.data);
      if (notesRes.success && notesRes.data) setNotes(notesRes.data);
    } catch (err) {
      setError('Failed to load patient data');
    } finally {
      setIsLoading(false);
    }
  };

  const getLatestVitals = (): VitalSign | null => {
    if (!vitals || vitals.readings.length === 0) return null;
    return vitals.readings[vitals.readings.length - 1];
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const getAlertSeverityBadge = (severity: Alert['severity']) => {
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'default',
      low: 'secondary',
      info: 'outline',
    } as const;

    return <Badge variant={variants[severity]}>{severity.toUpperCase()}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Activity className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {error || 'Patient not found'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {user?.roles.includes('patient')
                    ? 'You do not have permission to view this patient record.'
                    : 'The requested patient could not be found in the system.'}
                </p>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const latestVitals = getLatestVitals();
  const activeAlerts = alerts.filter((a) => !a.resolvedAt);
  const activeMedications = medications.filter((m) => m.status === 'active');
  const upcomingAppointments = appointments.filter(
    (a) =>
      new Date(a.dateTime) > new Date() &&
      a.status !== 'cancelled' &&
      a.status !== 'completed'
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-muted-foreground">
                MRN: {patient.mrn} | DOB: {formatDate(patient.dateOfBirth)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant={patient.status === 'admitted' ? 'default' : 'secondary'}>
              {patient.status.toUpperCase()}
            </Badge>
            {patient.riskLevel && (
              <Badge
                variant={
                  patient.riskLevel === 'critical' || patient.riskLevel === 'high'
                    ? 'destructive'
                    : 'default'
                }
              >
                {patient.riskLevel.toUpperCase()} RISK
              </Badge>
            )}
          </div>
        </div>

        {/* Active Alerts Banner */}
        {activeAlerts.length > 0 && (
          <Card className="border-destructive bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Active Alerts ({activeAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeAlerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.alertId}
                    className="flex items-start justify-between gap-4 p-3 bg-background rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getAlertSeverityBadge(alert.severity)}
                        <span className="font-semibold">{alert.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(alert.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="notes">Clinical Notes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Demographics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Demographics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">
                      {patient.firstName} {patient.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">{patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Type</p>
                    <p className="font-medium">{patient.bloodType || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Language</p>
                    <p className="font-medium">{patient.language || 'English'}</p>
                  </div>
                  {patient.room && (
                    <div>
                      <p className="text-sm text-muted-foreground">Current Room</p>
                      <Badge variant="outline">{patient.room}</Badge>
                    </div>
                  )}
                  {patient.admissionDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Admission Date</p>
                      <p className="font-medium">{formatDateTime(patient.admissionDate)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {patient.address && (
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Address
                      </p>
                      <p className="font-medium">
                        {patient.address.street}
                        <br />
                        {patient.address.city}, {patient.address.state}{' '}
                        {patient.address.zipCode}
                      </p>
                    </div>
                  )}
                  {patient.emergencyContact && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground mb-2">
                        Emergency Contact
                      </p>
                      <div className="space-y-1">
                        <p className="font-medium">{patient.emergencyContact.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {patient.emergencyContact.relationship}
                        </p>
                        <p className="text-sm font-mono">
                          {patient.emergencyContact.phone}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Allergies & Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Allergies & Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Allergies</p>
                    {patient.allergies && patient.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((allergy, idx) => (
                          <Badge key={idx} variant="destructive">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No known allergies</p>
                    )}
                  </div>
                  {patient.diagnosis && patient.diagnosis.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground mb-2">
                        Current Diagnoses
                      </p>
                      <ul className="space-y-1">
                        {patient.diagnosis.map((dx, idx) => (
                          <li key={idx} className="text-sm">
                            • {dx}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {patient.chiefComplaint && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground">Chief Complaint</p>
                      <p className="font-medium">{patient.chiefComplaint}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Care Team */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Care Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {patient.careTeam.map((member) => (
                      <div
                        key={member.userId}
                        className="flex items-start justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {member.role}
                            {member.specialty && ` - ${member.specialty}`}
                          </p>
                        </div>
                        {member.isPrimary && (
                          <Badge variant="outline">Primary</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Vitals Summary */}
            {latestVitals && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Latest Vital Signs
                  </CardTitle>
                  <CardDescription>
                    Recorded: {formatDateTime(latestVitals.timestamp)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Heart Rate</p>
                      <p className="text-2xl font-bold">
                        {latestVitals.heartRate || 'N/A'}
                        {latestVitals.heartRate && (
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            bpm
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Blood Pressure</p>
                      <p className="text-2xl font-bold">
                        {latestVitals.systolicBP && latestVitals.diastolicBP
                          ? `${latestVitals.systolicBP}/${latestVitals.diastolicBP}`
                          : 'N/A'}
                        {latestVitals.systolicBP && (
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            mmHg
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Temperature</p>
                      <p className="text-2xl font-bold">
                        {latestVitals.temperature
                          ? latestVitals.temperature.toFixed(1)
                          : 'N/A'}
                        {latestVitals.temperature && (
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            °C
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">SpO2</p>
                      <p className="text-2xl font-bold">
                        {latestVitals.spO2 || 'N/A'}
                        {latestVitals.spO2 && (
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            %
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Vitals Tab */}
          <TabsContent value="vitals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  Vital Signs History
                </CardTitle>
                <CardDescription>
                  {vitals?.readings.length || 0} readings available
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vitals && vitals.readings.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {vitals.readings
                      .slice()
                      .reverse()
                      .slice(0, 20)
                      .map((reading, idx) => (
                        <div
                          key={idx}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium">
                              {formatDateTime(reading.timestamp)}
                            </p>
                            {reading.consciousness && (
                              <Badge variant="outline" className="capitalize">
                                {reading.consciousness}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">HR</p>
                              <p className="font-medium">
                                {reading.heartRate || 'N/A'} bpm
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">BP</p>
                              <p className="font-medium">
                                {reading.systolicBP && reading.diastolicBP
                                  ? `${reading.systolicBP}/${reading.diastolicBP}`
                                  : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Temp</p>
                              <p className="font-medium">
                                {reading.temperature
                                  ? `${reading.temperature.toFixed(1)}°C`
                                  : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">SpO2</p>
                              <p className="font-medium">
                                {reading.spO2 ? `${reading.spO2}%` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No vital signs recorded
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Medications ({activeMedications.length} active)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {medications.length > 0 ? (
                  <div className="space-y-3">
                    {medications.map((med) => (
                      <div
                        key={med.medicationId}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-lg">{med.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {med.dosage} - {med.frequency}
                            </p>
                          </div>
                          <Badge
                            variant={
                              med.status === 'active'
                                ? 'default'
                                : med.status === 'completed'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {med.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Route:</span>{' '}
                            <span className="capitalize">{med.route}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Start Date:</span>{' '}
                            {formatDate(med.startDate)}
                          </div>
                          {med.endDate && (
                            <div>
                              <span className="text-muted-foreground">End Date:</span>{' '}
                              {formatDate(med.endDate)}
                            </div>
                          )}
                        </div>
                        {med.instructions && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {med.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No medications on record
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointments
                </CardTitle>
                <CardDescription>
                  {upcomingAppointments.length} upcoming
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments
                      .sort(
                        (a, b) =>
                          new Date(b.dateTime).getTime() -
                          new Date(a.dateTime).getTime()
                      )
                      .map((appt) => (
                        <div
                          key={appt.appointmentId}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold">
                                {formatDateTime(appt.dateTime)}
                              </p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {appt.type} - {appt.duration} minutes
                              </p>
                            </div>
                            <Badge
                              variant={
                                appt.status === 'completed'
                                  ? 'secondary'
                                  : appt.status === 'cancelled'
                                  ? 'outline'
                                  : 'default'
                              }
                            >
                              {appt.status}
                            </Badge>
                          </div>
                          {appt.reason && (
                            <p className="text-sm mb-2">
                              <span className="text-muted-foreground">Reason:</span>{' '}
                              {appt.reason}
                            </p>
                          )}
                          {appt.location && (
                            <p className="text-sm text-muted-foreground">
                              📍 {appt.location}
                              {appt.room && ` - ${appt.room}`}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No appointments scheduled
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clinical Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Clinical Notes ({notes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes
                      .sort(
                        (a, b) =>
                          new Date(b.timestamp).getTime() -
                          new Date(a.timestamp).getTime()
                      )
                      .map((note) => (
                        <div
                          key={note.noteId}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold">{note.authorName}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDateTime(note.timestamp)}
                              </p>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {note.category}
                            </Badge>
                          </div>
                          <p className="text-sm mt-2">{note.content}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No clinical notes available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
