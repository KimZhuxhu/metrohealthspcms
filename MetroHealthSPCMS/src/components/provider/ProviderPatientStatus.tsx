import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  FileText,
  Search,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Stethoscope,
  Pill,
  TestTube,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import type { PatientProfile, Appointment, SOAPNote, Alert } from '@/types';

interface ProviderPatient extends PatientProfile {
  lastVisit?: string;
  nextAppointment?: string;
  pendingOrders: number;
  unreviewedResults: number;
  activeAlerts: Alert[];
  recentSOAPNote?: SOAPNote;
}

interface TodayScheduleItem {
  appointment: Appointment;
  patient: PatientProfile;
  isRunningLate: boolean;
  minutesLate?: number;
}

const ProviderPatientStatus: React.FC = () => {
  const [patients, setPatients] = useState<ProviderPatient[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<TodayScheduleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('my-patients');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviderData();
    const interval = setInterval(loadProviderData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadProviderData = () => {
    // Mock data - replace with actual API calls
    const mockPatients: ProviderPatient[] = [
      {
        patientId: 'P001',
        firstName: 'John',
        lastName: 'Smith',
        dateOfBirth: '1965-03-15',
        gender: 'male',
        mrn: 'MRN001234',
        bloodType: 'O+',
        allergies: ['Penicillin', 'Latex'],
        careTeam: [
          {
            userId: 'U001',
            name: 'Dr. Sarah Johnson',
            role: 'provider',
            specialty: 'Internal Medicine',
            isPrimary: true,
          },
        ],
        room: '302A',
        admissionDate: '2025-11-07',
        status: 'admitted',
        chiefComplaint: 'Chest pain',
        diagnosis: ['Unstable angina', 'Hypertension'],
        riskLevel: 'high',
        lastVisit: '2025-11-08',
        nextAppointment: '2025-11-10',
        pendingOrders: 3,
        unreviewedResults: 2,
        activeAlerts: [
          {
            alertId: 'A001',
            patientId: 'P001',
            type: 'vitals',
            severity: 'high',
            title: 'Elevated Blood Pressure',
            message: 'BP 165/95 - Above target range',
            timestamp: '2025-11-09T08:30:00',
            source: 'Vitals Monitor',
          },
        ],
      },
      {
        patientId: 'P002',
        firstName: 'Maria',
        lastName: 'Garcia',
        dateOfBirth: '1978-07-22',
        gender: 'female',
        mrn: 'MRN002345',
        bloodType: 'A+',
        allergies: ['Sulfa drugs'],
        careTeam: [
          {
            userId: 'U001',
            name: 'Dr. Sarah Johnson',
            role: 'provider',
            specialty: 'Internal Medicine',
            isPrimary: true,
          },
        ],
        room: '305B',
        admissionDate: '2025-11-08',
        status: 'admitted',
        chiefComplaint: 'Pneumonia',
        diagnosis: ['Community-acquired pneumonia'],
        riskLevel: 'medium',
        lastVisit: '2025-11-09',
        pendingOrders: 1,
        unreviewedResults: 4,
        activeAlerts: [],
      },
      {
        patientId: 'P003',
        firstName: 'Robert',
        lastName: 'Chen',
        dateOfBirth: '1955-11-30',
        gender: 'male',
        mrn: 'MRN003456',
        bloodType: 'B+',
        allergies: [],
        careTeam: [
          {
            userId: 'U001',
            name: 'Dr. Sarah Johnson',
            role: 'provider',
            specialty: 'Internal Medicine',
            isPrimary: true,
          },
        ],
        room: '308C',
        admissionDate: '2025-11-06',
        status: 'admitted',
        chiefComplaint: 'Diabetes management',
        diagnosis: ['Type 2 Diabetes Mellitus', 'Diabetic neuropathy'],
        riskLevel: 'medium',
        lastVisit: '2025-11-09',
        pendingOrders: 0,
        unreviewedResults: 1,
        activeAlerts: [
          {
            alertId: 'A002',
            patientId: 'P003',
            type: 'lab',
            severity: 'medium',
            title: 'Blood Glucose Level',
            message: 'Fasting glucose 185 mg/dL',
            timestamp: '2025-11-09T06:00:00',
            source: 'Lab System',
          },
        ],
      },
      {
        patientId: 'P004',
        firstName: 'Emily',
        lastName: 'Williams',
        dateOfBirth: '1990-04-18',
        gender: 'female',
        mrn: 'MRN004567',
        bloodType: 'AB+',
        allergies: ['Codeine'],
        careTeam: [
          {
            userId: 'U001',
            name: 'Dr. Sarah Johnson',
            role: 'provider',
            specialty: 'Internal Medicine',
            isPrimary: true,
          },
        ],
        room: '310A',
        admissionDate: '2025-11-09',
        status: 'admitted',
        chiefComplaint: 'Asthma exacerbation',
        diagnosis: ['Acute asthma exacerbation'],
        riskLevel: 'high',
        lastVisit: '2025-11-09',
        pendingOrders: 2,
        unreviewedResults: 0,
        activeAlerts: [],
      },
    ];

    const mockSchedule: TodayScheduleItem[] = [
      {
        appointment: {
          appointmentId: 'APT001',
          patientId: 'P005',
          providerId: 'U001',
          dateTime: '2025-11-09T09:00:00',
          duration: 30,
          type: 'follow-up',
          status: 'checked-in',
          reason: 'Post-discharge follow-up',
          checkInTime: '2025-11-09T08:55:00',
          checkInStatus: 'checked-in',
          location: 'Clinic 2A',
        },
        patient: {
          patientId: 'P005',
          firstName: 'David',
          lastName: 'Brown',
          dateOfBirth: '1982-09-12',
          gender: 'male',
          mrn: 'MRN005678',
          careTeam: [],
          status: 'discharged',
        },
        isRunningLate: false,
      },
      {
        appointment: {
          appointmentId: 'APT002',
          patientId: 'P006',
          providerId: 'U001',
          dateTime: '2025-11-09T10:00:00',
          duration: 30,
          type: 'consultation',
          status: 'confirmed',
          reason: 'New patient consultation',
          checkInStatus: 'not-arrived',
          location: 'Clinic 2A',
        },
        patient: {
          patientId: 'P006',
          firstName: 'Lisa',
          lastName: 'Anderson',
          dateOfBirth: '1975-12-05',
          gender: 'female',
          mrn: 'MRN006789',
          careTeam: [],
          status: 'admitted',
        },
        isRunningLate: true,
        minutesLate: 15,
      },
      {
        appointment: {
          appointmentId: 'APT003',
          patientId: 'P007',
          providerId: 'U001',
          dateTime: '2025-11-09T11:00:00',
          duration: 45,
          type: 'procedure',
          status: 'scheduled',
          reason: 'Minor procedure - skin biopsy',
          checkInStatus: 'not-arrived',
          location: 'Procedure Room 1',
        },
        patient: {
          patientId: 'P007',
          firstName: 'Michael',
          lastName: 'Taylor',
          dateOfBirth: '1968-06-20',
          gender: 'male',
          mrn: 'MRN007890',
          careTeam: [],
          status: 'admitted',
        },
        isRunningLate: false,
      },
    ];

    setPatients(mockPatients);
    setTodaySchedule(mockSchedule);
    setLoading(false);
  };

  const getRiskLevelColor = (level?: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getCheckInStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in':
        return 'bg-green-500 text-white';
      case 'arrived':
        return 'bg-blue-500 text-white';
      case 'ready-to-room':
        return 'bg-purple-500 text-white';
      case 'roomed':
        return 'bg-indigo-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading provider dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button variant="outline" size="sm">
            <ClipboardList className="h-4 w-4 mr-2" />
            Clinical Inbox
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Patients</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{todaySchedule.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.reduce((sum, p) => sum + p.pendingOrders, 0)}
                </p>
              </div>
              <ClipboardList className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unreviewed Results</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.reduce((sum, p) => sum + p.unreviewedResults, 0)}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-patients">My Patients</TabsTrigger>
          <TabsTrigger value="today-schedule">Today's Schedule</TabsTrigger>
        </TabsList>

        {/* My Patients Tab */}
        <TabsContent value="my-patients" className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name or MRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Patient List */}
          <div className="grid gap-4">
            {filteredPatients.map((patient) => (
              <Card key={patient.patientId} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Patient Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </h3>
                            <Badge className={getRiskLevelColor(patient.riskLevel)}>
                              {patient.riskLevel?.toUpperCase()}
                            </Badge>
                            {patient.activeAlerts.length > 0 && (
                              <Badge variant="destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {patient.activeAlerts.length} Alert
                                {patient.activeAlerts.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>MRN: {patient.mrn}</span>
                            <span>•</span>
                            <span>Room: {patient.room}</span>
                            <span>•</span>
                            <span>
                              Age: {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{patient.gender}</span>
                          </div>
                        </div>
                      </div>

                      {/* Clinical Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Chief Complaint
                          </p>
                          <p className="text-sm text-gray-600">{patient.chiefComplaint}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Diagnoses</p>
                          <div className="flex flex-wrap gap-1">
                            {patient.diagnosis?.map((dx, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {dx}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Allergies */}
                      {patient.allergies && patient.allergies.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-red-700 mb-1">
                            ⚠️ Allergies
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {patient.allergies.map((allergy, idx) => (
                              <Badge key={idx} variant="destructive" className="text-xs">
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Active Alerts */}
                      {patient.activeAlerts.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Active Alerts
                          </p>
                          <div className="space-y-2">
                            {patient.activeAlerts.map((alert) => (
                              <div
                                key={alert.alertId}
                                className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded"
                              >
                                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-red-900">
                                    {alert.title}
                                  </p>
                                  <p className="text-xs text-red-700">{alert.message}</p>
                                  <p className="text-xs text-red-600 mt-1">
                                    {format(new Date(alert.timestamp), 'h:mm a')}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick Stats */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-orange-600" />
                          <span className="text-gray-600">
                            {patient.pendingOrders} Pending Order
                            {patient.pendingOrders !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TestTube className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-600">
                            {patient.unreviewedResults} Unreviewed Result
                            {patient.unreviewedResults !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {patient.lastVisit && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-600">
                              Last visit: {format(new Date(patient.lastVisit), 'MMM d')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" className="w-32">
                        <FileText className="h-4 w-4 mr-2" />
                        SOAP Note
                      </Button>
                      <Button size="sm" variant="outline" className="w-32">
                        <Activity className="h-4 w-4 mr-2" />
                        Vitals
                      </Button>
                      <Button size="sm" variant="outline" className="w-32">
                        <Pill className="h-4 w-4 mr-2" />
                        Orders
                      </Button>
                      <Button size="sm" variant="outline" className="w-32">
                        <ChevronRight className="h-4 w-4 mr-2" />
                        Full Chart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No patients found</p>
            </div>
          )}
        </TabsContent>

        {/* Today's Schedule Tab */}
        <TabsContent value="today-schedule" className="space-y-4">
          <div className="grid gap-4">
            {todaySchedule.map((item) => (
              <Card
                key={item.appointment.appointmentId}
                className={`hover:shadow-lg transition-shadow ${
                  item.isRunningLate ? 'border-orange-500 border-2' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Appointment Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">
                            {format(new Date(item.appointment.dateTime), 'h:mm')}
                          </p>
                          <p className="text-xs text-gray-600">
                            {format(new Date(item.appointment.dateTime), 'a')}
                          </p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {item.patient.firstName} {item.patient.lastName}
                            </h3>
                            <Badge
                              className={getCheckInStatusColor(
                                item.appointment.checkInStatus || 'not-arrived'
                              )}
                            >
                              {item.appointment.checkInStatus?.replace('-', ' ').toUpperCase()}
                            </Badge>
                            {item.isRunningLate && (
                              <Badge variant="destructive">
                                <Clock className="h-3 w-3 mr-1" />
                                {item.minutesLate} min late
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">MRN: {item.patient.mrn}</p>
                        </div>
                      </div>

                      {/* Appointment Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Type</p>
                          <Badge variant="outline" className="mt-1">
                            {item.appointment.type}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Duration</p>
                          <p className="text-sm text-gray-600">
                            {item.appointment.duration} minutes
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Location</p>
                          <p className="text-sm text-gray-600">{item.appointment.location}</p>
                        </div>
                      </div>

                      {/* Reason */}
                      <div>
                        <p className="text-sm font-medium text-gray-700">Reason</p>
                        <p className="text-sm text-gray-600">{item.appointment.reason}</p>
                      </div>

                      {/* Check-in Time */}
                      {item.appointment.checkInTime && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          <span>
                            Checked in at{' '}
                            {format(new Date(item.appointment.checkInTime), 'h:mm a')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" className="w-32">
                        <Stethoscope className="h-4 w-4 mr-2" />
                        Start Visit
                      </Button>
                      <Button size="sm" variant="outline" className="w-32">
                        <ChevronRight className="h-4 w-4 mr-2" />
                        View Chart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {todaySchedule.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No appointments scheduled for today</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderPatientStatus;
