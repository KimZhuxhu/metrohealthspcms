import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { nurseAssignmentsApi, vitalsApi, alertApi } from '@/lib/api';
import type { PatientAssignment, VitalSigns } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Wind, 
  Droplets,
  CheckCircle,
  AlertTriangle,
  Save
} from 'lucide-react';
import { format } from 'date-fns';
import { evaluateSIRS, evaluateEWS } from '@/lib/alertRules';

interface VitalsInput {
  patientId: string;
  patientName: string;
  room: string;
  vitals: VitalSigns;
  saved: boolean;
  hasAlert: boolean;
}

export default function QuickVitalsEntry() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<PatientAssignment[]>([]);
  const [vitalsInputs, setVitalsInputs] = useState<VitalsInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoSaving, setAutoSaving] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, [user]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(handleAutoSave, 30000);
    return () => clearInterval(interval);
  }, [vitalsInputs]);

  const loadAssignments = async () => {
    if (!user) return;

    try {
      const res = await nurseAssignmentsApi.getByNurse(user.userId);
      if (res.success && res.data) {
        const sortedAssignments = res.data.sort((a, b) => {
          const acuityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return acuityOrder[a.acuityLevel] - acuityOrder[b.acuityLevel];
        });
        setAssignments(sortedAssignments);
        
        // Initialize vitals inputs
        const inputs: VitalsInput[] = sortedAssignments.map(assignment => ({
          patientId: assignment.patientId,
          patientName: assignment.patientName,
          room: assignment.room,
          vitals: {
            heartRate: 0,
            bloodPressureSystolic: 0,
            bloodPressureDiastolic: 0,
            temperature: 0,
            respiratoryRate: 0,
            oxygenSaturation: 0,
          },
          saved: false,
          hasAlert: false,
        }));
        setVitalsInputs(inputs);
      }
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVitalsChange = (patientId: string, field: keyof VitalSigns, value: string) => {
    setVitalsInputs(prev => prev.map(input => {
      if (input.patientId === patientId) {
        const numValue = parseFloat(value) || 0;
        const updatedVitals = { ...input.vitals, [field]: numValue };
        
        // Check for alerts
        const sirsResult = evaluateSIRS(updatedVitals);
        const ewsResult = evaluateEWS(updatedVitals);
        const hasAlert = sirsResult.triggered || ewsResult.score >= 5;
        
        return {
          ...input,
          vitals: updatedVitals,
          saved: false,
          hasAlert,
        };
      }
      return input;
    }));
  };

  const handleSaveVitals = async (patientId: string) => {
    const input = vitalsInputs.find(v => v.patientId === patientId);
    if (!input || !user) return;

    // Validate vitals
    if (!isVitalsValid(input.vitals)) {
      alert('Please enter all vital signs');
      return;
    }

    try {
      // Save vitals
      await vitalsApi.create({
        patientId,
        timestamp: new Date().toISOString(),
        ...input.vitals,
        recordedBy: user.userId,
        recordedByName: user.name,
      });

      // Check for and create alerts
      const sirsResult = evaluateSIRS(input.vitals);
      const ewsResult = evaluateEWS(input.vitals);

      if (sirsResult.triggered) {
        await alertApi.create({
          alertId: `alert-${Date.now()}-sirs`,
          patientId,
          type: 'clinical',
          severity: 'critical',
          message: `SIRS Alert: ${sirsResult.criteria.join(', ')}`,
          timestamp: new Date().toISOString(),
          triggeredBy: 'SIRS Rule',
        });
      }

      if (ewsResult.score >= 5) {
        const severity = ewsResult.score >= 7 ? 'critical' : 'high';
        await alertApi.create({
          alertId: `alert-${Date.now()}-ews`,
          patientId,
          type: 'clinical',
          severity,
          message: `Early Warning Score: ${ewsResult.score} (${ewsResult.riskLevel})`,
          timestamp: new Date().toISOString(),
          triggeredBy: 'EWS Rule',
        });
      }

      // Mark as saved
      setVitalsInputs(prev => prev.map(v => 
        v.patientId === patientId ? { ...v, saved: true } : v
      ));
    } catch (error) {
      console.error('Failed to save vitals:', error);
      alert('Failed to save vitals. Please try again.');
    }
  };

  const handleAutoSave = async () => {
    setAutoSaving(true);
    
    const unsavedVitals = vitalsInputs.filter(v => !v.saved && isVitalsValid(v.vitals));
    
    for (const input of unsavedVitals) {
      await handleSaveVitals(input.patientId);
    }
    
    setAutoSaving(false);
  };

  const handleSaveAll = async () => {
    const unsavedVitals = vitalsInputs.filter(v => !v.saved && isVitalsValid(v.vitals));
    
    for (const input of unsavedVitals) {
      await handleSaveVitals(input.patientId);
    }
  };

  const isVitalsValid = (vitals: VitalSigns) => {
    return vitals.heartRate > 0 &&
           vitals.bloodPressureSystolic > 0 &&
           vitals.bloodPressureDiastolic > 0 &&
           vitals.temperature > 0 &&
           vitals.respiratoryRate > 0 &&
           vitals.oxygenSaturation > 0;
  };

  const getVitalStatus = (value: number, field: keyof VitalSigns) => {
    if (value === 0) return 'default';
    
    switch (field) {
      case 'heartRate':
        return value < 60 || value > 100 ? 'destructive' : 'default';
      case 'bloodPressureSystolic':
        return value < 90 || value > 140 ? 'destructive' : 'default';
      case 'bloodPressureDiastolic':
        return value < 60 || value > 90 ? 'destructive' : 'default';
      case 'temperature':
        return value < 36 || value > 38 ? 'destructive' : 'default';
      case 'respiratoryRate':
        return value < 12 || value > 20 ? 'destructive' : 'default';
      case 'oxygenSaturation':
        return value < 95 ? 'destructive' : 'default';
      default:
        return 'default';
    }
  };

  const unsavedCount = vitalsInputs.filter(v => !v.saved && isVitalsValid(v.vitals)).length;
  const savedCount = vitalsInputs.filter(v => v.saved).length;
  const alertCount = vitalsInputs.filter(v => v.hasAlert && !v.saved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-pulse mx-auto mb-2" />
          <p className="text-muted-foreground">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quick Vitals Entry</h1>
          <p className="text-muted-foreground">
            Batch documentation for assigned patients • {format(new Date(), 'EEEE, MMMM d, yyyy h:mm a')}
          </p>
        </div>
        <div className="flex gap-2">
          {autoSaving && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Save className="h-3 w-3 animate-pulse" />
              Auto-saving...
            </Badge>
          )}
          <Button onClick={handleSaveAll} disabled={unsavedCount === 0}>
            <Save className="h-4 w-4 mr-2" />
            Save All ({unsavedCount})
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vitalsInputs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documented</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{savedCount}</div>
            <p className="text-xs text-muted-foreground">
              {vitalsInputs.length > 0 ? Math.round((savedCount / vitalsInputs.length) * 100) : 0}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abnormal Values</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alertCount}</div>
            <p className="text-xs text-muted-foreground">Will trigger alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Vitals Entry Grid */}
      <div className="space-y-4">
        {vitalsInputs.map((input) => {
          const assignment = assignments.find(a => a.patientId === input.patientId);
          
          return (
            <Card key={input.patientId} className={input.saved ? 'bg-green-50' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {input.saved && <CheckCircle className="h-5 w-5 text-green-600" />}
                    <div>
                      <CardTitle className="text-lg">{input.patientName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Room {input.room} • {assignment?.unit}
                        {assignment && (
                          <Badge variant="outline" className="ml-2 capitalize">
                            {assignment.acuityLevel} Acuity
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {input.hasAlert && !input.saved && (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Alert Trigger
                      </Badge>
                    )}
                    {input.saved ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Saved
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleSaveVitals(input.patientId)}
                        disabled={!isVitalsValid(input.vitals)}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {/* Heart Rate */}
                  <div>
                    <Label className="flex items-center gap-1 mb-2">
                      <Heart className="h-3 w-3" />
                      Heart Rate (bpm)
                    </Label>
                    <Input
                      type="number"
                      value={input.vitals.heartRate || ''}
                      onChange={(e) => handleVitalsChange(input.patientId, 'heartRate', e.target.value)}
                      placeholder="60-100"
                      disabled={input.saved}
                      className={getVitalStatus(input.vitals.heartRate, 'heartRate') === 'destructive' ? 'border-red-500' : ''}
                    />
                    {getVitalStatus(input.vitals.heartRate, 'heartRate') === 'destructive' && input.vitals.heartRate > 0 && (
                      <p className="text-xs text-red-600 mt-1">Abnormal</p>
                    )}
                  </div>

                  {/* Blood Pressure Systolic */}
                  <div>
                    <Label className="flex items-center gap-1 mb-2">
                      <Activity className="h-3 w-3" />
                      BP Systolic (mmHg)
                    </Label>
                    <Input
                      type="number"
                      value={input.vitals.bloodPressureSystolic || ''}
                      onChange={(e) => handleVitalsChange(input.patientId, 'bloodPressureSystolic', e.target.value)}
                      placeholder="90-140"
                      disabled={input.saved}
                      className={getVitalStatus(input.vitals.bloodPressureSystolic, 'bloodPressureSystolic') === 'destructive' ? 'border-red-500' : ''}
                    />
                    {getVitalStatus(input.vitals.bloodPressureSystolic, 'bloodPressureSystolic') === 'destructive' && input.vitals.bloodPressureSystolic > 0 && (
                      <p className="text-xs text-red-600 mt-1">Abnormal</p>
                    )}
                  </div>

                  {/* Blood Pressure Diastolic */}
                  <div>
                    <Label className="flex items-center gap-1 mb-2">
                      <Activity className="h-3 w-3" />
                      BP Diastolic (mmHg)
                    </Label>
                    <Input
                      type="number"
                      value={input.vitals.bloodPressureDiastolic || ''}
                      onChange={(e) => handleVitalsChange(input.patientId, 'bloodPressureDiastolic', e.target.value)}
                      placeholder="60-90"
                      disabled={input.saved}
                      className={getVitalStatus(input.vitals.bloodPressureDiastolic, 'bloodPressureDiastolic') === 'destructive' ? 'border-red-500' : ''}
                    />
                    {getVitalStatus(input.vitals.bloodPressureDiastolic, 'bloodPressureDiastolic') === 'destructive' && input.vitals.bloodPressureDiastolic > 0 && (
                      <p className="text-xs text-red-600 mt-1">Abnormal</p>
                    )}
                  </div>

                  {/* Temperature */}
                  <div>
                    <Label className="flex items-center gap-1 mb-2">
                      <Thermometer className="h-3 w-3" />
                      Temperature (°C)
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={input.vitals.temperature || ''}
                      onChange={(e) => handleVitalsChange(input.patientId, 'temperature', e.target.value)}
                      placeholder="36-38"
                      disabled={input.saved}
                      className={getVitalStatus(input.vitals.temperature, 'temperature') === 'destructive' ? 'border-red-500' : ''}
                    />
                    {getVitalStatus(input.vitals.temperature, 'temperature') === 'destructive' && input.vitals.temperature > 0 && (
                      <p className="text-xs text-red-600 mt-1">Abnormal</p>
                    )}
                  </div>

                  {/* Respiratory Rate */}
                  <div>
                    <Label className="flex items-center gap-1 mb-2">
                      <Wind className="h-3 w-3" />
                      Resp Rate (bpm)
                    </Label>
                    <Input
                      type="number"
                      value={input.vitals.respiratoryRate || ''}
                      onChange={(e) => handleVitalsChange(input.patientId, 'respiratoryRate', e.target.value)}
                      placeholder="12-20"
                      disabled={input.saved}
                      className={getVitalStatus(input.vitals.respiratoryRate, 'respiratoryRate') === 'destructive' ? 'border-red-500' : ''}
                    />
                    {getVitalStatus(input.vitals.respiratoryRate, 'respiratoryRate') === 'destructive' && input.vitals.respiratoryRate > 0 && (
                      <p className="text-xs text-red-600 mt-1">Abnormal</p>
                    )}
                  </div>

                  {/* Oxygen Saturation */}
                  <div>
                    <Label className="flex items-center gap-1 mb-2">
                      <Droplets className="h-3 w-3" />
                      O2 Sat (%)
                    </Label>
                    <Input
                      type="number"
                      value={input.vitals.oxygenSaturation || ''}
                      onChange={(e) => handleVitalsChange(input.patientId, 'oxygenSaturation', e.target.value)}
                      placeholder="95-100"
                      disabled={input.saved}
                      className={getVitalStatus(input.vitals.oxygenSaturation, 'oxygenSaturation') === 'destructive' ? 'border-red-500' : ''}
                    />
                    {getVitalStatus(input.vitals.oxygenSaturation, 'oxygenSaturation') === 'destructive' && input.vitals.oxygenSaturation > 0 && (
                      <p className="text-xs text-red-600 mt-1">Abnormal</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
