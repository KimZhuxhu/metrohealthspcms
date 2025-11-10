import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientApi, vitalsApi } from '@/lib/api';
import type { PatientProfile, VitalsTimeSeries, VitalSign } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VitalsChart } from './VitalsChart';
import {
  ArrowLeft,
  Activity,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';

// Normal ranges for vitals
const NORMAL_RANGES = {
  heartRate: { min: 60, max: 100, unit: 'bpm' },
  systolicBP: { min: 90, max: 140, unit: 'mmHg' },
  diastolicBP: { min: 60, max: 90, unit: 'mmHg' },
  spO2: { min: 95, max: 100, unit: '%' },
  temperature: { min: 36.1, max: 37.2, unit: '°C' },
  respiratoryRate: { min: 12, max: 20, unit: '/min' },
};

export function VitalsMonitoring() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [vitals, setVitals] = useState<VitalsTimeSeries | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      loadData();
    }
  }, [patientId]);

  const loadData = async () => {
    if (!patientId) return;

    setIsLoading(true);
    try {
      const [patientRes, vitalsRes] = await Promise.all([
        patientApi.getById(patientId),
        vitalsApi.getByPatient(patientId),
      ]);

      if (patientRes.success && patientRes.data) setPatient(patientRes.data);
      if (vitalsRes.success && vitalsRes.data) setVitals(vitalsRes.data);
    } catch (err) {
      console.error('Failed to load vitals data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getLatestVitals = (): VitalSign | null => {
    if (!vitals || vitals.readings.length === 0) return null;
    return vitals.readings[vitals.readings.length - 1];
  };

  const getVitalStatus = (
    value: number | undefined,
    range: { min: number; max: number }
  ): 'normal' | 'warning' | 'critical' => {
    if (!value) return 'normal';

    if (value < range.min * 0.8 || value > range.max * 1.2) return 'critical';
    if (value < range.min || value > range.max) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status: 'normal' | 'warning' | 'critical') => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-900';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      default:
        return 'bg-green-100 border-green-500 text-green-900';
    }
  };

  const getStatusBadge = (status: 'normal' | 'warning' | 'critical') => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">Warning</Badge>;
      default:
        return <Badge className="bg-green-600 hover:bg-green-700">Normal</Badge>;
    }
  };

  const latestVitals = getLatestVitals();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Activity className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading vitals data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="font-semibold mb-2">Patient not found</p>
              <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hrStatus = latestVitals
    ? getVitalStatus(latestVitals.heartRate, NORMAL_RANGES.heartRate)
    : 'normal';
  const bpStatus = latestVitals
    ? getVitalStatus(latestVitals.systolicBP, NORMAL_RANGES.systolicBP)
    : 'normal';
  const spO2Status = latestVitals
    ? getVitalStatus(latestVitals.spO2, NORMAL_RANGES.spO2)
    : 'normal';
  const tempStatus = latestVitals
    ? getVitalStatus(latestVitals.temperature, NORMAL_RANGES.temperature)
    : 'normal';
  const rrStatus = latestVitals
    ? getVitalStatus(latestVitals.respiratoryRate, NORMAL_RANGES.respiratoryRate)
    : 'normal';

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
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Activity className="h-8 w-8" />
                Vitals Monitoring
              </h1>
              <p className="text-muted-foreground mt-1">
                {patient.firstName} {patient.lastName} - MRN: {patient.mrn}
              </p>
            </div>
          </div>
          {patient.room && <Badge variant="outline" className="text-lg">{patient.room}</Badge>}
        </div>

        {/* Current Vitals Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle>Current Vital Signs</CardTitle>
            <CardDescription>
              {latestVitals
                ? `Last updated: ${format(new Date(latestVitals.timestamp), 'MMM dd, yyyy HH:mm')}`
                : 'No recent vitals'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {latestVitals ? (
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                {/* Heart Rate */}
                <div
                  className={`p-4 border-2 rounded-lg ${getStatusColor(hrStatus)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Heart className="h-5 w-5" />
                    {getStatusBadge(hrStatus)}
                  </div>
                  <p className="text-sm font-medium mb-1">Heart Rate</p>
                  <p className="text-3xl font-bold">
                    {latestVitals.heartRate || 'N/A'}
                  </p>
                  <p className="text-xs mt-1">
                    Normal: {NORMAL_RANGES.heartRate.min}-{NORMAL_RANGES.heartRate.max}{' '}
                    {NORMAL_RANGES.heartRate.unit}
                  </p>
                </div>

                {/* Blood Pressure */}
                <div
                  className={`p-4 border-2 rounded-lg ${getStatusColor(bpStatus)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Droplets className="h-5 w-5" />
                    {getStatusBadge(bpStatus)}
                  </div>
                  <p className="text-sm font-medium mb-1">Blood Pressure</p>
                  <p className="text-3xl font-bold">
                    {latestVitals.systolicBP && latestVitals.diastolicBP
                      ? `${latestVitals.systolicBP}/${latestVitals.diastolicBP}`
                      : 'N/A'}
                  </p>
                  <p className="text-xs mt-1">
                    Normal: {NORMAL_RANGES.systolicBP.min}-{NORMAL_RANGES.systolicBP.max}/
                    {NORMAL_RANGES.diastolicBP.min}-{NORMAL_RANGES.diastolicBP.max}{' '}
                    {NORMAL_RANGES.systolicBP.unit}
                  </p>
                </div>

                {/* SpO2 */}
                <div
                  className={`p-4 border-2 rounded-lg ${getStatusColor(spO2Status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="h-5 w-5" />
                    {getStatusBadge(spO2Status)}
                  </div>
                  <p className="text-sm font-medium mb-1">SpO2</p>
                  <p className="text-3xl font-bold">
                    {latestVitals.spO2 || 'N/A'}
                    {latestVitals.spO2 && <span className="text-lg">%</span>}
                  </p>
                  <p className="text-xs mt-1">
                    Normal: {NORMAL_RANGES.spO2.min}-{NORMAL_RANGES.spO2.max}{' '}
                    {NORMAL_RANGES.spO2.unit}
                  </p>
                </div>

                {/* Temperature */}
                <div
                  className={`p-4 border-2 rounded-lg ${getStatusColor(tempStatus)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Thermometer className="h-5 w-5" />
                    {getStatusBadge(tempStatus)}
                  </div>
                  <p className="text-sm font-medium mb-1">Temperature</p>
                  <p className="text-3xl font-bold">
                    {latestVitals.temperature
                      ? latestVitals.temperature.toFixed(1)
                      : 'N/A'}
                    {latestVitals.temperature && <span className="text-lg">°C</span>}
                  </p>
                  <p className="text-xs mt-1">
                    Normal: {NORMAL_RANGES.temperature.min}-{NORMAL_RANGES.temperature.max}{' '}
                    {NORMAL_RANGES.temperature.unit}
                  </p>
                </div>

                {/* Respiratory Rate */}
                <div
                  className={`p-4 border-2 rounded-lg ${getStatusColor(rrStatus)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Wind className="h-5 w-5" />
                    {getStatusBadge(rrStatus)}
                  </div>
                  <p className="text-sm font-medium mb-1">Respiratory Rate</p>
                  <p className="text-3xl font-bold">
                    {latestVitals.respiratoryRate || 'N/A'}
                  </p>
                  <p className="text-xs mt-1">
                    Normal: {NORMAL_RANGES.respiratoryRate.min}-
                    {NORMAL_RANGES.respiratoryRate.max}{' '}
                    {NORMAL_RANGES.respiratoryRate.unit}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No vital signs recorded
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trend Charts */}
        {vitals && vitals.readings.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Trend Analysis</h2>

            <VitalsChart
              data={vitals.readings}
              vitalType="heartRate"
              title="Heart Rate"
              unit="bpm"
              normalRange={NORMAL_RANGES.heartRate}
            />

            <VitalsChart
              data={vitals.readings}
              vitalType="bloodPressure"
              title="Blood Pressure"
              unit="mmHg"
              normalRange={NORMAL_RANGES.systolicBP}
            />

            <VitalsChart
              data={vitals.readings}
              vitalType="spO2"
              title="Oxygen Saturation (SpO2)"
              unit="%"
              normalRange={NORMAL_RANGES.spO2}
            />

            <VitalsChart
              data={vitals.readings}
              vitalType="temperature"
              title="Temperature"
              unit="°C"
              normalRange={NORMAL_RANGES.temperature}
            />

            <VitalsChart
              data={vitals.readings}
              vitalType="respiratoryRate"
              title="Respiratory Rate"
              unit="/min"
              normalRange={NORMAL_RANGES.respiratoryRate}
            />
          </div>
        )}
      </div>
    </div>
  );
}
