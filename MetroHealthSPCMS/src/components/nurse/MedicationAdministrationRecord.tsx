import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { medicationAdministrationApi, nurseAssignmentsApi } from '@/lib/api';
import type { MedicationAdministration, MedicationAdministrationStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Pill, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Scan,
  Calendar
} from 'lucide-react';
import { format, parseISO, isWithinInterval, isPast } from 'date-fns';

export default function MedicationAdministrationRecord() {
  const { user } = useAuth();
  const [medications, setMedications] = useState<MedicationAdministration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Administration dialog state
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState<MedicationAdministration | null>(null);
  const [siteOfAdministration, setSiteOfAdministration] = useState('');
  const [patientResponse, setPatientResponse] = useState('');
  const [witnessedBy, setWitnessedBy] = useState('');
  const [barcodeScanned, setBarcodeScanned] = useState(false);
  
  // Refusal/Hold dialog state
  const [refusalDialogOpen, setRefusalDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'refuse' | 'hold'>('refuse');
  const [reason, setReason] = useState('');
  const [reasonDetails, setReasonDetails] = useState('');

  useEffect(() => {
    loadMedications();
    const interval = setInterval(loadMedications, 30000);
    return () => clearInterval(interval);
  }, [selectedDate, user]);

  const loadMedications = async () => {
    if (!user) return;
    
    try {
      const res = await medicationAdministrationApi.getByNurse(user.userId, selectedDate);
      if (res.success && res.data) {
        // Also get medications for assigned patients
        const assignmentsRes = await nurseAssignmentsApi.getByNurse(user.userId);
        if (assignmentsRes.success && assignmentsRes.data) {
          const patientIds = assignmentsRes.data.map(a => a.patientId);
          
          // Get medications for all assigned patients
          const patientMedPromises = patientIds.map(patientId => 
            medicationAdministrationApi.getByPatient(patientId)
          );
          const patientMedResults = await Promise.all(patientMedPromises);
          const allPatientMeds = patientMedResults.flatMap(r => r.success && r.data ? r.data : []);
          
          // Filter for selected date and combine
          const dateMeds = allPatientMeds.filter(m => 
            m.scheduledTime.startsWith(selectedDate)
          );
          
          setMedications(dateMeds);
        } else {
          setMedications(res.data);
        }
      }
    } catch (error) {
      console.error('Failed to load medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminister = (med: MedicationAdministration) => {
    setSelectedMed(med);
    setSiteOfAdministration('');
    setPatientResponse('');
    setWitnessedBy('');
    setBarcodeScanned(false);
    setAdminDialogOpen(true);
  };

  const handleRefuseOrHold = (med: MedicationAdministration, type: 'refuse' | 'hold') => {
    setSelectedMed(med);
    setActionType(type);
    setReason('');
    setReasonDetails('');
    setRefusalDialogOpen(true);
  };

  const handleAdminSubmit = async () => {
    if (!selectedMed || !user) return;
    
    const res = await medicationAdministrationApi.administer(
      selectedMed.administrationId,
      user.userId,
      user.name,
      {
        siteOfAdministration,
        patientResponse,
        witnessedBy,
        barcodeScanned,
      }
    );
    
    if (res.success) {
      setAdminDialogOpen(false);
      loadMedications();
    }
  };

  const handleRefusalSubmit = async () => {
    if (!selectedMed) return;
    
    const res = actionType === 'refuse'
      ? await medicationAdministrationApi.refuse(selectedMed.administrationId, reason, reasonDetails)
      : await medicationAdministrationApi.hold(selectedMed.administrationId, reason, reasonDetails);
    
    if (res.success) {
      setRefusalDialogOpen(false);
      loadMedications();
    }
  };

  const isMedicationDue = (med: MedicationAdministration) => {
    const now = new Date();
    return isWithinInterval(now, {
      start: parseISO(med.timeWindow.start),
      end: parseISO(med.timeWindow.end),
    });
  };

  const isMedicationOverdue = (med: MedicationAdministration) => {
    return isPast(parseISO(med.timeWindow.end));
  };

  const getMedicationsByStatus = (status: MedicationAdministrationStatus | 'due' | 'overdue') => {
    if (status === 'due') {
      return medications.filter(m => m.status === 'scheduled' && isMedicationDue(m) && !isMedicationOverdue(m));
    }
    if (status === 'overdue') {
      return medications.filter(m => m.status === 'scheduled' && isMedicationOverdue(m));
    }
    return medications.filter(m => m.status === status);
  };

  const overdueCount = getMedicationsByStatus('overdue').length;
  const dueNowCount = getMedicationsByStatus('due').length;
  const scheduledCount = medications.filter(m => m.status === 'scheduled').length;
  const administeredCount = getMedicationsByStatus('administered').length;

  const getStatusBadge = (med: MedicationAdministration) => {
    if (med.status === 'administered') {
      return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Administered</Badge>;
    }
    if (med.status === 'refused') {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Refused</Badge>;
    }
    if (med.status === 'held') {
      return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />Held</Badge>;
    }
    if (med.status === 'missed') {
      return <Badge variant="destructive"><Clock className="h-3 w-3 mr-1" />Missed</Badge>;
    }
    if (isMedicationOverdue(med)) {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Overdue</Badge>;
    }
    if (isMedicationDue(med)) {
      return <Badge variant="default"><Clock className="h-3 w-3 mr-1" />Due Now</Badge>;
    }
    return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
  };

  const renderMedicationCard = (med: MedicationAdministration) => {
    const isDue = isMedicationDue(med);
    const isOverdue = isMedicationOverdue(med);
    const canAdminister = med.status === 'scheduled' && (isDue || isOverdue);
    
    return (
      <div key={med.administrationId} className="border rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-lg">{med.patientName}</span>
              <Badge variant="outline">Room {med.room}</Badge>
              <Badge variant="outline">MRN: {med.patientMRN}</Badge>
            </div>
            
            <div className="text-sm space-y-1 mb-2">
              <div className="font-medium text-base">{med.medicationName}</div>
              <div className="text-muted-foreground">
                <span className="font-medium">{med.dose}</span> • {med.route} • {med.frequency}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(med)}
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {format(parseISO(med.scheduledTime), 'h:mm a')}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Window: {format(parseISO(med.timeWindow.start), 'h:mm a')} - {format(parseISO(med.timeWindow.end), 'h:mm a')}
              </span>
            </div>
            
            {med.status === 'administered' && med.administeredAt && (
              <div className="text-xs text-muted-foreground bg-green-50 p-2 rounded mt-2">
                <div className="font-medium text-green-900">Administered by {med.administeredByName}</div>
                <div>{format(parseISO(med.administeredAt), 'MMM d, yyyy h:mm a')}</div>
                {med.siteOfAdministration && <div>Site: {med.siteOfAdministration}</div>}
                {med.patientResponse && <div>Response: {med.patientResponse}</div>}
                {med.barcodeScanned && <div className="flex items-center gap-1"><Scan className="h-3 w-3" /> Barcode Scanned</div>}
              </div>
            )}
            
            {(med.status === 'refused' || med.status === 'held') && (
              <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded mt-2">
                <div className="font-medium text-yellow-900">{med.status === 'refused' ? 'Patient Refused' : 'Medication Held'}</div>
                {med.reason && <div>Reason: {med.reason}</div>}
                {med.reasonDetails && <div>Details: {med.reasonDetails}</div>}
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            {canAdminister && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleAdminister(med)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Pill className="h-4 w-4 mr-2" />
                  Administer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRefuseOrHold(med, 'refuse')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Refuse
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRefuseOrHold(med, 'hold')}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Hold
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Pill className="h-8 w-8 animate-pulse mx-auto mb-2" />
          <p className="text-muted-foreground">Loading MAR...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medication Administration Record (MAR)</h1>
          <p className="text-muted-foreground">
            Administer and document medications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
            <p className="text-xs text-muted-foreground">Requires immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Now</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dueNowCount}</div>
            <p className="text-xs text-muted-foreground">Within time window</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledCount}</div>
            <p className="text-xs text-muted-foreground">Total for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{administeredCount}</div>
            <p className="text-xs text-muted-foreground">
              {scheduledCount > 0 ? Math.round((administeredCount / scheduledCount) * 100) : 0}% completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Medications Tabs */}
      <Tabs defaultValue="overdue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overdue">
            Overdue
            {overdueCount > 0 && <Badge variant="destructive" className="ml-2">{overdueCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="due">
            Due Now
            {dueNowCount > 0 && <Badge variant="default" className="ml-2">{dueNowCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled ({scheduledCount})
          </TabsTrigger>
          <TabsTrigger value="administered">
            Administered ({administeredCount})
          </TabsTrigger>
          <TabsTrigger value="exceptions">
            Exceptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overdue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Overdue Medications</CardTitle>
            </CardHeader>
            <CardContent>
              {overdueCount === 0 ? (
                <p className="text-center text-muted-foreground py-8">No overdue medications</p>
              ) : (
                <div className="space-y-3">
                  {getMedicationsByStatus('overdue')
                    .sort((a, b) => parseISO(a.scheduledTime).getTime() - parseISO(b.scheduledTime).getTime())
                    .map(renderMedicationCard)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="due" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medications Due Now</CardTitle>
            </CardHeader>
            <CardContent>
              {dueNowCount === 0 ? (
                <p className="text-center text-muted-foreground py-8">No medications due now</p>
              ) : (
                <div className="space-y-3">
                  {getMedicationsByStatus('due')
                    .sort((a, b) => parseISO(a.scheduledTime).getTime() - parseISO(b.scheduledTime).getTime())
                    .map(renderMedicationCard)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Medications</CardTitle>
            </CardHeader>
            <CardContent>
              {scheduledCount === 0 ? (
                <p className="text-center text-muted-foreground py-8">No scheduled medications</p>
              ) : (
                <div className="space-y-3">
                  {medications
                    .filter(m => m.status === 'scheduled')
                    .sort((a, b) => parseISO(a.scheduledTime).getTime() - parseISO(b.scheduledTime).getTime())
                    .map(renderMedicationCard)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="administered" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Administered Medications</CardTitle>
            </CardHeader>
            <CardContent>
              {administeredCount === 0 ? (
                <p className="text-center text-muted-foreground py-8">No administered medications yet</p>
              ) : (
                <div className="space-y-3">
                  {getMedicationsByStatus('administered')
                    .sort((a, b) => parseISO(b.administeredAt || '').getTime() - parseISO(a.administeredAt || '').getTime())
                    .map(renderMedicationCard)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exceptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exceptions (Refused/Held/Missed)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...getMedicationsByStatus('refused'), ...getMedicationsByStatus('held'), ...getMedicationsByStatus('missed')].length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No exceptions</p>
                ) : (
                  <>
                    {getMedicationsByStatus('refused').map(renderMedicationCard)}
                    {getMedicationsByStatus('held').map(renderMedicationCard)}
                    {getMedicationsByStatus('missed').map(renderMedicationCard)}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Administration Dialog */}
      <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Administer Medication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded">
              <div className="font-semibold">{selectedMed?.patientName}</div>
              <div className="text-sm text-muted-foreground">Room {selectedMed?.room} • MRN: {selectedMed?.patientMRN}</div>
              <div className="font-medium mt-2">{selectedMed?.medicationName}</div>
              <div className="text-sm">{selectedMed?.dose} • {selectedMed?.route} • {selectedMed?.frequency}</div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="barcode"
                checked={barcodeScanned}
                onCheckedChange={(checked) => setBarcodeScanned(checked as boolean)}
              />
              <Label htmlFor="barcode" className="flex items-center gap-2">
                <Scan className="h-4 w-4" />
                Barcode Scanned
              </Label>
            </div>

            <div>
              <Label htmlFor="site">Site of Administration</Label>
              <Select value={siteOfAdministration} onValueChange={setSiteOfAdministration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select site..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Left Arm">Left Arm</SelectItem>
                  <SelectItem value="Right Arm">Right Arm</SelectItem>
                  <SelectItem value="Left Leg">Left Leg</SelectItem>
                  <SelectItem value="Right Leg">Right Leg</SelectItem>
                  <SelectItem value="Abdomen">Abdomen</SelectItem>
                  <SelectItem value="Oral">Oral</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="response">Patient Response</Label>
              <Textarea
                id="response"
                value={patientResponse}
                onChange={(e) => setPatientResponse(e.target.value)}
                placeholder="Document patient's response to medication..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="witness">Witnessed By (Optional)</Label>
              <Input
                id="witness"
                value={witnessedBy}
                onChange={(e) => setWitnessedBy(e.target.value)}
                placeholder="Name of witness (if required)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdminSubmit} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Administration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refusal/Hold Dialog */}
      <Dialog open={refusalDialogOpen} onOpenChange={setRefusalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === 'refuse' ? 'Document Medication Refusal' : 'Hold Medication'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded">
              <div className="font-semibold">{selectedMed?.patientName}</div>
              <div className="font-medium mt-1">{selectedMed?.medicationName}</div>
              <div className="text-sm">{selectedMed?.dose} • {selectedMed?.route}</div>
            </div>

            <div>
              <Label htmlFor="reason">Reason *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  {actionType === 'refuse' ? (
                    <>
                      <SelectItem value="Patient declined">Patient declined</SelectItem>
                      <SelectItem value="Nausea/vomiting">Nausea/vomiting</SelectItem>
                      <SelectItem value="Unable to swallow">Unable to swallow</SelectItem>
                      <SelectItem value="Religious/cultural">Religious/cultural reasons</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="NPO status">NPO status</SelectItem>
                      <SelectItem value="Abnormal vitals">Abnormal vitals</SelectItem>
                      <SelectItem value="Lab results">Awaiting lab results</SelectItem>
                      <SelectItem value="Provider order">Provider order</SelectItem>
                      <SelectItem value="Allergy concern">Allergy concern</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reasonDetails">Additional Details</Label>
              <Textarea
                id="reasonDetails"
                value={reasonDetails}
                onChange={(e) => setReasonDetails(e.target.value)}
                placeholder="Provide additional context..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefusalDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefusalSubmit} disabled={!reason}>
              Confirm {actionType === 'refuse' ? 'Refusal' : 'Hold'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
