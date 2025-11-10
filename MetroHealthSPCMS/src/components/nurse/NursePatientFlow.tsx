import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { patientFlowApi, bedAssignmentsApi, nurseAssignmentsApi } from '@/lib/api';
import type { PatientFlowRecord, BedAssignment, PatientFlowState } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowRight, 
  Building2, 
  Bed, 
  UserCheck, 
  ClipboardCheck, 
  Stethoscope, 
  Home,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function NursePatientFlow() {
  const { user } = useAuth();
  const [flows, setFlows] = useState<PatientFlowRecord[]>([]);
  const [beds, setBeds] = useState<BedAssignment[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  
  // Transfer dialog state
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<PatientFlowRecord | null>(null);
  const [transferUnit, setTransferUnit] = useState('');
  const [transferRoom, setTransferRoom] = useState('');
  const [transferBed, setTransferBed] = useState('');
  const [transferReason, setTransferReason] = useState('');
  
  // State update dialog
  const [stateDialogOpen, setStateDialogOpen] = useState(false);
  const [newState, setNewState] = useState<PatientFlowState>('assessment');
  const [stateNotes, setStateNotes] = useState('');

  useEffect(() => {
    loadFlowData();
    const interval = setInterval(loadFlowData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadFlowData = async () => {
    try {
      // Get all units from user assignments
      const assignmentsRes = await nurseAssignmentsApi.getByNurse(user?.userId || '');
      const units = assignmentsRes.success && assignmentsRes.data
        ? Array.from(new Set(assignmentsRes.data.map(a => a.unit)))
        : [];
      
      // Load flows for all units
      const flowPromises = units.map(unit => patientFlowApi.getByUnit(unit));
      const flowResults = await Promise.all(flowPromises);
      const allFlows = flowResults.flatMap(r => r.success && r.data ? r.data : []);
      setFlows(allFlows);
      
      // Load bed assignments
      const bedPromises = units.map(unit => bedAssignmentsApi.getByUnit(unit));
      const bedResults = await Promise.all(bedPromises);
      const allBeds = bedResults.flatMap(r => r.success && r.data ? r.data : []);
      setBeds(allBeds);
    } catch (error) {
      console.error('Failed to load flow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (flow: PatientFlowRecord, state: PatientFlowState) => {
    setSelectedFlow(flow);
    setNewState(state);
    setStateDialogOpen(true);
  };

  const handleStateUpdate = async () => {
    if (!selectedFlow || !user) return;
    
    const res = await patientFlowApi.updateState(
      selectedFlow.flowId,
      newState,
      user.userId,
      user.name,
      stateNotes || undefined
    );
    
    if (res.success) {
      setStateDialogOpen(false);
      setStateNotes('');
      loadFlowData();
    }
  };

  const handleRequestTransfer = (flow: PatientFlowRecord) => {
    setSelectedFlow(flow);
    setTransferDialogOpen(true);
  };

  const handleTransferSubmit = async () => {
    if (!selectedFlow || !user) return;
    
    const res = await patientFlowApi.requestTransfer(selectedFlow.flowId, {
      toUnit: transferUnit,
      toRoom: transferRoom,
      toBed: transferBed,
      requestedAt: new Date().toISOString(),
      requestedBy: user.userId,
      reason: transferReason,
      status: 'pending',
    });
    
    if (res.success) {
      setTransferDialogOpen(false);
      setTransferUnit('');
      setTransferRoom('');
      setTransferBed('');
      setTransferReason('');
      loadFlowData();
    }
  };

  const getStateIcon = (state: PatientFlowState) => {
    switch (state) {
      case 'admitted': return UserCheck;
      case 'assessment': return ClipboardCheck;
      case 'treatment': return Stethoscope;
      case 'discharge_planning': return Home;
      case 'discharged': return CheckCircle;
      default: return Clock;
    }
  };

  const getStateColor = (state: PatientFlowState) => {
    switch (state) {
      case 'admitted': return 'bg-blue-500';
      case 'assessment': return 'bg-yellow-500';
      case 'treatment': return 'bg-green-500';
      case 'discharge_planning': return 'bg-orange-500';
      case 'discharged': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStateLabel = (state: PatientFlowState) => {
    switch (state) {
      case 'admitted': return 'Admitted';
      case 'assessment': return 'Assessment';
      case 'treatment': return 'Treatment';
      case 'discharge_planning': return 'Discharge Planning';
      case 'discharged': return 'Discharged';
      default: return state;
    }
  };

  const workflow: PatientFlowState[] = ['admitted', 'assessment', 'treatment', 'discharge_planning', 'discharged'];

  const filteredFlows = selectedUnit === 'all' 
    ? flows.filter(f => f.currentState !== 'discharged')
    : flows.filter(f => f.unit === selectedUnit && f.currentState !== 'discharged');

  const units = Array.from(new Set(flows.map(f => f.unit)));

  const bedOccupancy = {
    total: beds.length,
    occupied: beds.filter(b => b.status === 'occupied').length,
    available: beds.filter(b => b.status === 'available').length,
    cleaning: beds.filter(b => b.status === 'cleaning').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading patient flow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patient Flow Management</h1>
          <p className="text-muted-foreground">
            Track patient journey through care process
          </p>
        </div>
      </div>

      {/* Bed Occupancy Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bedOccupancy.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{bedOccupancy.occupied}</div>
            <p className="text-xs text-muted-foreground">
              {bedOccupancy.total > 0 ? Math.round((bedOccupancy.occupied / bedOccupancy.total) * 100) : 0}% occupancy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{bedOccupancy.available}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cleaning</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{bedOccupancy.cleaning}</div>
          </CardContent>
        </Card>
      </div>

      {/* Unit Filter */}
      {units.length > 1 && (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Unit:</span>
          <div className="flex gap-2">
            <Button
              variant={selectedUnit === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedUnit('all')}
            >
              All Units
            </Button>
            {units.map(unit => (
              <Button
                key={unit}
                variant={selectedUnit === unit ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedUnit(unit)}
              >
                {unit}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Visual */}
      <Card>
        <CardHeader>
          <CardTitle>Care Process Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {workflow.map((state, index) => {
              const Icon = getStateIcon(state);
              const count = filteredFlows.filter(f => f.currentState === state).length;
              
              return (
                <div key={state} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-full ${getStateColor(state)} flex items-center justify-center text-white mb-2`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="text-sm font-medium text-center">{getStateLabel(state)}</div>
                    <Badge variant="secondary" className="mt-1">{count}</Badge>
                  </div>
                  {index < workflow.length - 1 && (
                    <ArrowRight className="h-6 w-6 text-muted-foreground mx-4" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Patient Flow Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Patients</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFlows.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No active patients</p>
          ) : (
            <div className="space-y-3">
              {filteredFlows
                .sort((a, b) => new Date(a.admissionDate).getTime() - new Date(b.admissionDate).getTime())
                .map(flow => {
                  const Icon = getStateIcon(flow.currentState);
                  const currentStateIndex = workflow.indexOf(flow.currentState);
                  
                  return (
                    <div key={flow.flowId} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-lg">{flow.patientName}</span>
                            <Badge variant="outline">MRN: {flow.patientMRN}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {flow.unit} • Room {flow.room}-{flow.bed} • Admitted {format(new Date(flow.admissionDate), 'MMM d, yyyy')}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestTransfer(flow)}
                          >
                            Request Transfer
                          </Button>
                        </div>
                      </div>

                      {/* Current State */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-8 h-8 rounded-full ${getStateColor(flow.currentState)} flex items-center justify-center text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium">Current: {getStateLabel(flow.currentState)}</span>
                      </div>

                      {/* Workflow Progress */}
                      <div className="flex items-center gap-2 mb-3">
                        {workflow.map((state, index) => {
                          const completed = index < currentStateIndex;
                          const current = index === currentStateIndex;
                          
                          return (
                            <div key={state} className="flex items-center flex-1">
                              <div
                                className={`flex-1 h-2 rounded ${
                                  completed ? 'bg-green-500' : current ? 'bg-blue-500' : 'bg-gray-200'
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-wrap">
                        {workflow.map((state, index) => {
                          if (index <= currentStateIndex) return null;
                          
                          return (
                            <Button
                              key={state}
                              variant="outline"
                              size="sm"
                              onClick={() => handleStateChange(flow, state)}
                            >
                              Move to {getStateLabel(state)}
                            </Button>
                          );
                        })}
                      </div>

                      {/* Pending Transfer Alert */}
                      {flow.pendingTransfer && flow.pendingTransfer.status === 'pending' && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium text-yellow-900">Transfer Request Pending</div>
                            <div className="text-sm text-yellow-700">
                              To: {flow.pendingTransfer.toUnit} - Room {flow.pendingTransfer.toRoom}-{flow.pendingTransfer.toBed}
                            </div>
                            <div className="text-sm text-yellow-700">Reason: {flow.pendingTransfer.reason}</div>
                          </div>
                        </div>
                      )}

                      {/* State History */}
                      {flow.stateHistory.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm font-medium mb-2">History</div>
                          <div className="space-y-1">
                            {flow.stateHistory.slice(-3).reverse().map((history, idx) => (
                              <div key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                                <CheckCircle className="h-3 w-3" />
                                <span>{getStateLabel(history.state)}</span>
                                <span>•</span>
                                <span>{format(new Date(history.timestamp), 'MMM d, h:mm a')}</span>
                                <span>•</span>
                                <span>{history.updatedByName}</span>
                                {history.notes && (
                                  <>
                                    <span>•</span>
                                    <span>{history.notes}</span>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* State Update Dialog */}
      <Dialog open={stateDialogOpen} onOpenChange={setStateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Patient State</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Patient</Label>
              <div className="text-sm font-medium">{selectedFlow?.patientName}</div>
            </div>
            <div>
              <Label>New State</Label>
              <div className="text-sm font-medium capitalize">{getStateLabel(newState)}</div>
            </div>
            <div>
              <Label htmlFor="stateNotes">Notes (Optional)</Label>
              <Textarea
                id="stateNotes"
                value={stateNotes}
                onChange={(e) => setStateNotes(e.target.value)}
                placeholder="Add any relevant notes about this state change..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStateUpdate}>
              Update State
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Request Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Patient Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Patient</Label>
              <div className="text-sm font-medium">{selectedFlow?.patientName}</div>
              <div className="text-sm text-muted-foreground">
                Current: {selectedFlow?.unit} - Room {selectedFlow?.room}-{selectedFlow?.bed}
              </div>
            </div>
            <div>
              <Label htmlFor="transferUnit">To Unit *</Label>
              <Select value={transferUnit} onValueChange={setTransferUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ICU">ICU</SelectItem>
                  <SelectItem value="Med-Surg">Med-Surg</SelectItem>
                  <SelectItem value="Cardiac">Cardiac</SelectItem>
                  <SelectItem value="Neuro">Neuro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transferRoom">Room *</Label>
                <Input
                  id="transferRoom"
                  value={transferRoom}
                  onChange={(e) => setTransferRoom(e.target.value)}
                  placeholder="e.g., 301"
                />
              </div>
              <div>
                <Label htmlFor="transferBed">Bed *</Label>
                <Input
                  id="transferBed"
                  value={transferBed}
                  onChange={(e) => setTransferBed(e.target.value)}
                  placeholder="e.g., A"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="transferReason">Reason *</Label>
              <Textarea
                id="transferReason"
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder="Reason for transfer request..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleTransferSubmit}
              disabled={!transferUnit || !transferRoom || !transferBed || !transferReason}
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
