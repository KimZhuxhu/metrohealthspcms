import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentApi, providerApi } from '@/lib/api';
import type { Appointment, Provider } from '@/types';
import { formatDate, formatTime, formatDateTime } from '@/lib/dateUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, MapPin, User, X, CheckCircle2, Edit } from 'lucide-react';

export function MyAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [providers, setProviders] = useState<Map<string, Provider>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [newDateTime, setNewDateTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const loadAppointments = async () => {
    if (!user?.patientId) return;

    setIsLoading(true);
    const response = await appointmentApi.getByPatient(user.patientId);
    
    if (response.success && response.data) {
      const sorted = response.data.sort((a, b) => 
        new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
      );
      setAppointments(sorted);

      // Load providers
      const providersResponse = await providerApi.getAll();
      if (providersResponse.success && providersResponse.data) {
        const providerMap = new Map(
          providersResponse.data.map(p => [p.userId, p])
        );
        setProviders(providerMap);
      }
    }
    setIsLoading(false);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment || !cancellationReason.trim()) return;

    setIsSubmitting(true);
    const response = await appointmentApi.cancel(
      selectedAppointment.appointmentId,
      user?.userId || '',
      cancellationReason
    );

    if (response.success) {
      setSuccessMessage('Appointment cancelled successfully');
      setIsCancelDialogOpen(false);
      setCancellationReason('');
      setSelectedAppointment(null);
      loadAppointments();
      
      setTimeout(() => setSuccessMessage(''), 5000);
    }
    setIsSubmitting(false);
  };

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment || !newDateTime) return;

    setIsSubmitting(true);
    const response = await appointmentApi.reschedule(
      selectedAppointment.appointmentId,
      newDateTime
    );

    if (response.success) {
      setSuccessMessage('Appointment rescheduled successfully');
      setIsRescheduleDialogOpen(false);
      setNewDateTime('');
      setSelectedAppointment(null);
      loadAppointments();
      
      setTimeout(() => setSuccessMessage(''), 5000);
    }
    setIsSubmitting(false);
  };

  const openRescheduleDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    // Format datetime for datetime-local input (YYYY-MM-DDTHH:mm)
    setNewDateTime(appointment.dateTime.slice(0, 16));
    setIsRescheduleDialogOpen(true);
  };

  const openCancelDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsCancelDialogOpen(true);
  };

  const getStatusBadge = (status: Appointment['status']) => {
    const variants: Record<string, any> = {
      scheduled: 'default',
      confirmed: 'success',
      'checked-in': 'warning',
      'in-progress': 'warning',
      completed: 'secondary',
      cancelled: 'destructive',
      'no-show': 'destructive',
    };
    return variants[status] || 'outline';
  };

  const getTypeBadge = (type: Appointment['type']) => {
    const colors: Record<string, string> = {
      consultation: 'bg-blue-100 text-blue-800',
      'follow-up': 'bg-green-100 text-green-800',
      procedure: 'bg-purple-100 text-purple-800',
      lab: 'bg-yellow-100 text-yellow-800',
      imaging: 'bg-pink-100 text-pink-800',
      emergency: 'bg-red-100 text-red-800',
      routine: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const isUpcoming = (dateTime: string) => {
    return new Date(dateTime) > new Date();
  };

  const canCancel = (appointment: Appointment) => {
    return isUpcoming(appointment.dateTime) && 
           appointment.status !== 'cancelled' && 
           appointment.status !== 'completed';
  };

  const canReschedule = (appointment: Appointment) => {
    return isUpcoming(appointment.dateTime) && 
           (appointment.status === 'scheduled' || appointment.status === 'confirmed');
  };

  const upcomingAppointments = appointments.filter(apt => 
    isUpcoming(apt.dateTime) && apt.status !== 'cancelled'
  );

  const pastAppointments = appointments.filter(apt => 
    !isUpcoming(apt.dateTime) || apt.status === 'cancelled'
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
        <p className="text-muted-foreground">View and manage your scheduled appointments</p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-success/10 border border-success rounded-lg flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <p className="text-success">{successMessage}</p>
        </div>
      )}

      <div className="space-y-8">
        {/* Upcoming Appointments */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Upcoming Appointments
          </h2>
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No upcoming appointments</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingAppointments.map(appointment => {
                const provider = providers.get(appointment.providerId);
                return (
                  <Card key={appointment.appointmentId} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getStatusBadge(appointment.status) as any}>
                              {appointment.status}
                            </Badge>
                            <Badge className={getTypeBadge(appointment.type)}>
                              {appointment.type}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">
                            {formatDate(appointment.dateTime)} at {formatTime(appointment.dateTime)}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{provider?.name || 'Unknown Provider'}</span>
                          <span className="text-muted-foreground">({provider?.specialty})</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{appointment.location || appointment.department}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{appointment.duration} minutes</span>
                        </div>

                        {appointment.reason && (
                          <div className="mt-2 p-3 bg-muted rounded-md">
                            <p className="text-sm font-medium mb-1">Reason for Visit:</p>
                            <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                          </div>
                        )}

                        <div className="mt-3 flex gap-2">
                          {canReschedule(appointment) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRescheduleDialog(appointment)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Reschedule
                            </Button>
                          )}
                          {canCancel(appointment) && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openCancelDialog(appointment)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel Appointment
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Appointments */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-muted-foreground" />
            Past Appointments
          </h2>
          {pastAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No past appointments</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastAppointments.slice(0, 10).map(appointment => {
                const provider = providers.get(appointment.providerId);
                return (
                  <Card key={appointment.appointmentId} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getStatusBadge(appointment.status) as any}>
                              {appointment.status}
                            </Badge>
                            <Badge className={getTypeBadge(appointment.type)}>
                              {appointment.type}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">
                            {formatDateTime(appointment.dateTime)}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{provider?.name || 'Unknown Provider'}</span>
                        </div>
                        
                        {appointment.status === 'cancelled' && appointment.cancellationReason && (
                          <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                            <p className="text-sm font-medium text-destructive mb-1">Cancellation Reason:</p>
                            <p className="text-sm text-destructive/80">{appointment.cancellationReason}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Choose a new date and time for your appointment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedAppointment && (
              <div className="p-3 bg-muted rounded-md text-sm">
                <p className="font-medium">Current: {formatDateTime(selectedAppointment.dateTime)}</p>
                <p className="text-muted-foreground">
                  with {providers.get(selectedAppointment.providerId)?.name}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="new-datetime">
                New Date & Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new-datetime"
                type="datetime-local"
                value={newDateTime}
                onChange={(e) => setNewDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-xs text-muted-foreground">
                Note: Please ensure the selected time is during the provider's available hours
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRescheduleDialogOpen(false);
                setNewDateTime('');
                setSelectedAppointment(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRescheduleAppointment}
              disabled={!newDateTime || isSubmitting}
            >
              {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedAppointment && (
              <div className="p-3 bg-muted rounded-md text-sm">
                <p className="font-medium">{formatDateTime(selectedAppointment.dateTime)}</p>
                <p className="text-muted-foreground">
                  with {providers.get(selectedAppointment.providerId)?.name}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="cancellation-reason">
                Reason for Cancellation <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="cancellation-reason"
                placeholder="Please provide a reason for cancellation..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCancelDialogOpen(false);
                setCancellationReason('');
                setSelectedAppointment(null);
              }}
            >
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={!cancellationReason.trim() || isSubmitting}
            >
              {isSubmitting ? 'Cancelling...' : 'Cancel Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
