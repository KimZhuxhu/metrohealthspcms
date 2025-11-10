import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentApi, providerApi, patientApi } from '@/lib/api';
import type { Provider, AppointmentType } from '@/types';
import {
  formatDateForInput,
  getDaysFromNow,
  isWeekend,
  generateTimeSlots,
  isTimeSlotInPast,
  combineDateAndTime,
} from '@/lib/dateUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, MapPin, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BookingFormData {
  providerId: string;
  date: string;
  timeSlot: string;
  type: AppointmentType;
  reason: string;
  department: string;
}

export function PatientAppointmentScheduler() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [formData, setFormData] = useState<BookingFormData>({
    providerId: '',
    date: '',
    timeSlot: '',
    type: 'consultation',
    reason: '',
    department: '',
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load providers
  useEffect(() => {
    loadProviders();
  }, []);

  // Load available slots when provider and date change
  useEffect(() => {
    if (formData.providerId && formData.date) {
      loadAvailableSlots();
    }
  }, [formData.providerId, formData.date]);

  const loadProviders = async () => {
    setIsLoading(true);
    const response = await providerApi.getAll();
    if (response.success && response.data) {
      setProviders(response.data);
    }
    setIsLoading(false);
  };

  const loadAvailableSlots = async () => {
    if (!formData.providerId || !formData.date) return;

    const provider = providers.find(p => p.userId === formData.providerId);
    if (!provider) return;

    // Get day of week (0-6)
    const date = new Date(formData.date);
    const dayOfWeek = date.getDay();

    // Find provider availability for this day
    const dayAvailability = provider.availability.find(a => a.dayOfWeek === dayOfWeek);
    
    if (!dayAvailability) {
      setAvailableSlots([]);
      return;
    }

    // Generate time slots
    const slots = generateTimeSlots(dayAvailability.startTime, dayAvailability.endTime, 30);
    
    // Filter out past slots
    const futureSlots = slots.filter(slot => !isTimeSlotInPast(formData.date, slot, 30));

    // Load booked appointments for this provider and date
    const appointmentsResponse = await appointmentApi.getByProvider(formData.providerId);
    if (appointmentsResponse.success && appointmentsResponse.data) {
      const appointments = appointmentsResponse.data;
      const booked = new Set(
        appointments
          .filter(apt => {
            const aptDate = apt.dateTime.split('T')[0];
            return aptDate === formData.date && apt.status !== 'cancelled';
          })
          .map(apt => {
            const time = new Date(apt.dateTime);
            return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
          })
      );
      setBookedSlots(booked);
    }

    setAvailableSlots(futureSlots);
  };

  const handleProviderSelect = (providerId: string) => {
    const provider = providers.find(p => p.userId === providerId);
    setSelectedProvider(provider || null);
    setFormData({ ...formData, providerId, department: provider?.department || '' });
    setFormData(prev => ({ ...prev, providerId, department: provider?.department || '', timeSlot: '' }));
  };

  const handleDateChange = (date: string) => {
    setFormData({ ...formData, date, timeSlot: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.providerId || !formData.date || !formData.timeSlot || !formData.reason.trim()) {
        setError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Get patient info
      const patientResponse = await patientApi.getById(user?.patientId || '');
      if (!patientResponse.success) {
        setError('Could not find patient information');
        setIsSubmitting(false);
        return;
      }

      // Create appointment
      const dateTime = combineDateAndTime(formData.date, formData.timeSlot);
      const response = await appointmentApi.create({
        patientId: user?.patientId || '',
        providerId: formData.providerId,
        dateTime,
        duration: 30,
        type: formData.type,
        status: 'scheduled',
        reason: formData.reason,
        department: formData.department,
        location: `${formData.department} Clinic`,
      });

      if (response.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          providerId: '',
          date: '',
          timeSlot: '',
          type: 'consultation',
          reason: '',
          department: '',
        });
        setSelectedProvider(null);
        
        // Reset success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(response.error || 'Failed to book appointment');
      }
    } catch (err) {
      setError('An error occurred while booking the appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get unique specialties
  const specialties = ['all', ...new Set(providers.map(p => p.specialty))];

  // Filter providers by specialty
  const filteredProviders = selectedSpecialty === 'all'
    ? providers
    : providers.filter(p => p.specialty === selectedSpecialty);

  // Get minimum date (today)
  const minDate = formatDateForInput(getDaysFromNow(0));
  
  // Get maximum date (90 days from now)
  const maxDate = formatDateForInput(getDaysFromNow(90));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Schedule an Appointment</h1>
        <p className="text-muted-foreground">Book an appointment with one of our healthcare providers</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-success/10 border border-success rounded-lg flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <div>
            <p className="font-semibold text-success">Appointment Booked Successfully!</p>
            <p className="text-sm text-success/80">You will receive a confirmation email shortly.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Specialty */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
              Select Specialty
            </CardTitle>
            <CardDescription>Choose the type of care you need</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Label>Specialty</Label>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty === 'all' ? 'All Specialties' : specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Select Provider */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
              Select Provider
            </CardTitle>
            <CardDescription>Choose your healthcare provider</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {filteredProviders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No providers available for this specialty</p>
              ) : (
                <div className="grid gap-3">
                  {filteredProviders.map(provider => (
                    <div
                      key={provider.userId}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.providerId === provider.userId
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleProviderSelect(provider.userId)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{provider.name}</p>
                            <Badge variant="secondary" className="mt-1">{provider.specialty}</Badge>
                            <p className="text-sm text-muted-foreground mt-1">{provider.department}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Select Date & Time */}
        {selectedProvider && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
                Select Date & Time
              </CardTitle>
              <CardDescription>Choose your preferred appointment date and time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="date">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Appointment Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  min={minDate}
                  max={maxDate}
                  value={formData.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  required
                />
                {formData.date && isWeekend(formData.date) && (
                  <p className="text-sm text-warning flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Weekend appointments are not available
                  </p>
                )}
              </div>

              {formData.date && !isWeekend(formData.date) && (
                <div className="grid gap-3">
                  <Label>
                    <Clock className="inline h-4 w-4 mr-2" />
                    Available Time Slots
                  </Label>
                  {availableSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No available time slots for this date</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map(slot => {
                        const isBooked = bookedSlots.has(slot);
                        return (
                          <Button
                            key={slot}
                            type="button"
                            variant={formData.timeSlot === slot ? 'default' : 'outline'}
                            className="w-full"
                            disabled={isBooked}
                            onClick={() => setFormData({ ...formData, timeSlot: slot })}
                          >
                            {slot}
                            {isBooked && ' (Booked)'}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Appointment Details */}
        {formData.timeSlot && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">4</span>
                Appointment Details
              </CardTitle>
              <CardDescription>Provide details about your visit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="type">
                  <FileText className="inline h-4 w-4 mr-2" />
                  Appointment Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: AppointmentType) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="procedure">Procedure</SelectItem>
                    <SelectItem value="lab">Lab Work</SelectItem>
                    <SelectItem value="imaging">Imaging</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="reason">
                  Reason for Visit <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Please describe the reason for your appointment..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                  rows={4}
                />
              </div>

              <div className="grid gap-3">
                <Label>
                  <MapPin className="inline h-4 w-4 mr-2" />
                  Location
                </Label>
                <Input value={`${formData.department} Clinic`} disabled />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        {formData.timeSlot && (
          <div className="flex gap-3">
            <Button type="submit" size="lg" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                setFormData({
                  providerId: '',
                  date: '',
                  timeSlot: '',
                  type: 'consultation',
                  reason: '',
                  department: '',
                });
                setSelectedProvider(null);
                setError('');
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
