import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { appointmentApi, patientApi, providerApi } from '@/lib/api';
import type { Appointment, PatientProfile, Provider, CheckInStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, LogOut, User, Calendar, Clock, MapPin, CheckCircle, ArrowRight, Search } from 'lucide-react';
import { format } from 'date-fns';

const CHECK_IN_STATUSES: { value: CheckInStatus; label: string; description: string }[] = [
  { value: 'not-arrived', label: 'Not Arrived', description: 'Patient has not arrived yet' },
  { value: 'arrived', label: 'Arrived', description: 'Patient is in waiting area' },
  { value: 'checked-in', label: 'Checked In', description: 'Registration complete' },
  { value: 'ready-to-room', label: 'Ready to Room', description: 'Waiting for room assignment' },
  { value: 'roomed', label: 'Roomed', description: 'Patient is in exam room' },
];

export function PatientCheckIn() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentIdParam = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Data
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  
  // Selected appointment
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [currentStatus, setCurrentStatus] = useState<CheckInStatus>('not-arrived');
  const [insuranceVerified, setInsuranceVerified] = useState(false);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (appointmentIdParam && appointments.length > 0) {
      const apt = appointments.find(a => a.appointmentId === appointmentIdParam);
      if (apt) {
        selectAppointment(apt);
      }
    }
  }, [appointmentIdParam, appointments]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [aptsRes, patientsRes, providersRes] = await Promise.all([
        appointmentApi.getAll(),
        patientApi.getAll(),
        providerApi.getAll(),
      ]);

      if (aptsRes.success && aptsRes.data) setAppointments(aptsRes.data);
      if (patientsRes.success && patientsRes.data) setPatients(patientsRes.data);
      if (providersRes.success && providersRes.data) setProviders(providersRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getPatient = (patientId: string): PatientProfile | undefined => {
    return patients.find(p => p.patientId === patientId);
  };

  const getProvider = (providerId: string): Provider | undefined => {
    return providers.find(p => p.userId === providerId);
  };

  const selectAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCurrentStatus(appointment.checkInStatus || 'not-arrived');
    setInsuranceVerified(appointment.insuranceVerified || false);
    setAddressConfirmed(appointment.addressConfirmed || false);
    setSuccessMessage('');
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSearching(true);
    try {
      // Search for appointments by patient name or MRN
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.dateTime).toISOString().split('T')[0];
        if (aptDate !== today) return false;
        
        const patient = getPatient(apt.patientId);
        if (!patient) return false;
        
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        const mrn = patient.mrn.toLowerCase();
        const search = searchTerm.toLowerCase();
        
        return fullName.includes(search) || mrn.includes(search);
      });

      if (todayAppointments.length > 0) {
        selectAppointment(todayAppointments[0]);
      } else {
        setSelectedAppointment(null);
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleUpdateCheckIn = async () => {
    if (!selectedAppointment) return;

    setUpdating(true);
    try {
      const result = await appointmentApi.checkIn(selectedAppointment.appointmentId, {
        checkInStatus: currentStatus,
        insuranceVerified,
        addressConfirmed,
      });

      if (result.success && result.data) {
        setAppointments(prev =>
          prev.map(apt => apt.appointmentId === selectedAppointment.appointmentId ? result.data! : apt)
        );
        setSelectedAppointment(result.data);
        setSuccessMessage('Check-in status updated successfully!');
        
        // Auto-dismiss success message
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (error) {
      console.error('Failed to update check-in:', error);
    } finally {
      setUpdating(false);
    }
  };

  const advanceStatus = () => {
    const currentIndex = CHECK_IN_STATUSES.findIndex(s => s.value === currentStatus);
    if (currentIndex < CHECK_IN_STATUSES.length - 1) {
      setCurrentStatus(CHECK_IN_STATUSES[currentIndex + 1].value);
    }
  };

  const canAdvance = () => {
    const currentIndex = CHECK_IN_STATUSES.findIndex(s => s.value === currentStatus);
    return currentIndex < CHECK_IN_STATUSES.length - 1;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
                <p className="text-xs text-muted-foreground">Patient Check-In</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                ← Back to Dashboard
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Patient Appointment
              </CardTitle>
              <CardDescription>
                Search by patient name or MRN to check in today's appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="Patient name or MRN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={searching || !searchTerm.trim()}>
                  {searching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Success Message */}
          {successMessage && (
            <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg text-success">
              <CheckCircle className="h-5 w-5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Selected Appointment */}
          {selectedAppointment && (
            <>
              {/* Patient Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const patient = getPatient(selectedAppointment.patientId);
                    const provider = getProvider(selectedAppointment.providerId);
                    
                    if (!patient) return <p>Patient not found</p>;
                    
                    return (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-muted-foreground">Patient Name</Label>
                          <p className="font-semibold text-lg">
                            {patient.firstName} {patient.lastName}
                          </p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">MRN</Label>
                          <p className="font-semibold">{patient.mrn}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Date of Birth</Label>
                          <p>{format(new Date(patient.dateOfBirth), 'MMMM d, yyyy')}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Blood Type</Label>
                          <p>{patient.bloodType || 'N/A'}</p>
                        </div>
                        {patient.allergies && patient.allergies.length > 0 && (
                          <div className="col-span-2">
                            <Label className="text-muted-foreground">Allergies</Label>
                            <div className="flex gap-2 mt-1">
                              {patient.allergies.map((allergy, i) => (
                                <Badge key={i} variant="destructive">{allergy}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="col-span-2 pt-4 border-t">
                          <Label className="text-muted-foreground">Appointment Details</Label>
                          <div className="grid gap-2 mt-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{format(new Date(selectedAppointment.dateTime), 'MMMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{format(new Date(selectedAppointment.dateTime), 'h:mm a')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{provider?.name || 'Unknown Provider'}</span>
                            </div>
                            {selectedAppointment.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{selectedAppointment.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Check-In Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Check-In Status</CardTitle>
                  <CardDescription>Update the patient's check-in progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status Timeline */}
                  <div className="space-y-3">
                    {CHECK_IN_STATUSES.map((status, index) => {
                      const isActive = status.value === currentStatus;
                      const isCompleted = CHECK_IN_STATUSES.findIndex(s => s.value === currentStatus) > index;
                      
                      return (
                        <div
                          key={status.value}
                          className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                            isActive
                              ? 'border-primary bg-primary/5'
                              : isCompleted
                              ? 'border-success bg-success/5'
                              : 'border-gray-200'
                          }`}
                          onClick={() => setCurrentStatus(status.value)}
                        >
                          <div className="flex-shrink-0 mt-1">
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-success" />
                            ) : (
                              <div
                                className={`h-5 w-5 rounded-full border-2 ${
                                  isActive ? 'border-primary bg-primary' : 'border-gray-300'
                                }`}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold ${isActive ? 'text-primary' : ''}`}>
                              {status.label}
                            </p>
                            <p className="text-sm text-muted-foreground">{status.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Verification Checkboxes */}
                  <div className="space-y-3 pt-4 border-t">
                    <Label className="text-base font-semibold">Verification</Label>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="insurance"
                        checked={insuranceVerified}
                        onCheckedChange={(checked) => setInsuranceVerified(checked as boolean)}
                      />
                      <label
                        htmlFor="insurance"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Insurance verified
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="address"
                        checked={addressConfirmed}
                        onCheckedChange={(checked) => setAddressConfirmed(checked as boolean)}
                      />
                      <label
                        htmlFor="address"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Address confirmed
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleUpdateCheckIn}
                      disabled={updating}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {updating ? 'Updating...' : 'Save Check-In Status'}
                    </Button>
                    
                    {canAdvance() && (
                      <Button
                        onClick={advanceStatus}
                        variant="outline"
                        className="flex-1"
                      >
                        Advance to Next Step
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* No Selection State */}
          {!selectedAppointment && !loading && (
            <Card>
              <CardContent className="py-12 text-center">
                <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Appointment Selected</h3>
                <p className="text-muted-foreground">
                  Search for a patient to begin the check-in process
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
