import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { appointmentApi, patientApi, providerApi } from '@/lib/api';
import type { Appointment, PatientProfile, Provider, AppointmentStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar, Clock, User, MapPin, FileText, Edit, CheckCircle, XCircle, Heart, LogOut, Filter } from 'lucide-react';
import { format } from 'date-fns';

export function AppointmentManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Reschedule dialog
  const [rescheduleDialog, setRescheduleDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newDateTime, setNewDateTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  
  // Details dialog
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [detailsAppointment, setDetailsAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    loadData();
  }, []);

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

  const getPatientName = (patientId: string): string => {
    const patient = patients.find(p => p.patientId === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getProviderName = (providerId: string): string => {
    const provider = providers.find(p => p.userId === providerId);
    return provider ? provider.name : 'Unknown Provider';
  };

  const getStatusVariant = (status: AppointmentStatus) => {
    const variants: Record<AppointmentStatus, any> = {
      scheduled: 'default',
      confirmed: 'success',
      'checked-in': 'warning',
      'in-progress': 'warning',
      completed: 'secondary',
      cancelled: 'destructive',
      'no-show': 'destructive',
    };
    return variants[status] || 'default';
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      const result = await appointmentApi.updateStatus(appointmentId, newStatus);
      if (result.success) {
        setAppointments(prev =>
          prev.map(apt => apt.appointmentId === appointmentId ? { ...apt, status: newStatus } : apt)
        );
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleReschedule = async () => {
    if (!selectedAppointment || !newDateTime) return;

    setRescheduling(true);
    try {
      const result = await appointmentApi.reschedule(
        selectedAppointment.appointmentId,
        newDateTime
      );

      if (result.success && result.data) {
        setAppointments(prev =>
          prev.map(apt => apt.appointmentId === selectedAppointment.appointmentId ? result.data! : apt)
        );
        setRescheduleDialog(false);
        setSelectedAppointment(null);
        setNewDateTime('');
      }
    } catch (error) {
      console.error('Failed to reschedule:', error);
    } finally {
      setRescheduling(false);
    }
  };

  const openRescheduleDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNewDateTime(appointment.dateTime.slice(0, 16)); // Format for datetime-local input
    setRescheduleDialog(true);
  };

  const openDetailsDialog = (appointment: Appointment) => {
    setDetailsAppointment(appointment);
    setDetailsDialog(true);
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
    // Date filter
    if (dateFilter) {
      const aptDate = new Date(apt.dateTime).toISOString().split('T')[0];
      if (aptDate !== dateFilter) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && apt.status !== statusFilter) return false;

    // Search filter (patient name or provider name)
    if (searchTerm) {
      const patientName = getPatientName(apt.patientId).toLowerCase();
      const providerName = getProviderName(apt.providerId).toLowerCase();
      const search = searchTerm.toLowerCase();
      if (!patientName.includes(search) && !providerName.includes(search)) return false;
    }

    return true;
  });

  // Sort by date/time
  const sortedAppointments = [...filteredAppointments].sort((a, b) => 
    new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading appointments...</p>
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
                <p className="text-xs text-muted-foreground">Appointment Management</p>
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
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <CardDescription>Filter appointments by date, status, or search</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="date-filter">Date</Label>
                  <Input
                    id="date-filter"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="checked-in">Checked-in</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no-show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Patient or provider name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {(dateFilter || statusFilter !== 'all' || searchTerm) && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Showing {sortedAppointments.length} of {appointments.length} appointments
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDateFilter('');
                      setStatusFilter('all');
                      setSearchTerm('');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointments List */}
          <div className="space-y-4">
            {sortedAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No appointments found</p>
                  {(dateFilter || statusFilter !== 'all' || searchTerm) && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Try adjusting your filters
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              sortedAppointments.map((apt) => (
                <Card key={apt.appointmentId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Patient and Provider Info */}
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">{getPatientName(apt.patientId)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Provider: {getProviderName(apt.providerId)}
                            </p>
                          </div>
                          <Badge variant={getStatusVariant(apt.status)}>
                            {apt.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </div>

                        {/* Date/Time and Type */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(apt.dateTime), 'MMMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(apt.dateTime), 'h:mm a')}</span>
                          </div>
                          {apt.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{apt.location}</span>
                            </div>
                          )}
                        </div>

                        {apt.reason && (
                          <div className="flex items-start gap-2 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-muted-foreground">{apt.reason}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailsDialog(apt)}
                        >
                          View Details
                        </Button>

                        {apt.status === 'scheduled' || apt.status === 'confirmed' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRescheduleDialog(apt)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Reschedule
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(apt.appointmentId, 'confirmed')}
                              disabled={apt.status === 'confirmed'}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                          </>
                        ) : null}

                        {apt.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/appointments/check-in?id=${apt.appointmentId}`)}
                          >
                            Check In
                          </Button>
                        )}

                        {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(apt.appointmentId, 'cancelled')}
                            className="text-destructive"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialog} onOpenChange={setRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Change the date and time for {selectedAppointment && getPatientName(selectedAppointment.patientId)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-datetime">New Date & Time</Label>
              <Input
                id="new-datetime"
                type="datetime-local"
                value={newDateTime}
                onChange={(e) => setNewDateTime(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReschedule} disabled={rescheduling || !newDateTime}>
              {rescheduling ? 'Rescheduling...' : 'Reschedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>

          {detailsAppointment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Patient</Label>
                  <p className="font-medium">{getPatientName(detailsAppointment.patientId)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Provider</Label>
                  <p className="font-medium">{getProviderName(detailsAppointment.providerId)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">
                    {format(new Date(detailsAppointment.dateTime), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Time</Label>
                  <p className="font-medium">
                    {format(new Date(detailsAppointment.dateTime), 'h:mm a')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duration</Label>
                  <p className="font-medium">{detailsAppointment.duration} minutes</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium capitalize">{detailsAppointment.type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge variant={getStatusVariant(detailsAppointment.status)}>
                      {detailsAppointment.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                {detailsAppointment.location && (
                  <div>
                    <Label className="text-muted-foreground">Location</Label>
                    <p className="font-medium">{detailsAppointment.location}</p>
                  </div>
                )}
              </div>

              {detailsAppointment.reason && (
                <div>
                  <Label className="text-muted-foreground">Reason for Visit</Label>
                  <p className="mt-1">{detailsAppointment.reason}</p>
                </div>
              )}

              {detailsAppointment.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="mt-1">{detailsAppointment.notes}</p>
                </div>
              )}

              {detailsAppointment.checkInTime && (
                <div>
                  <Label className="text-muted-foreground">Check-in Time</Label>
                  <p className="mt-1">
                    {format(new Date(detailsAppointment.checkInTime), 'h:mm a')}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
