import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  encountersApi,
  soapNotesApi,
  medicationOrdersApi,
  labOrdersApi,
  imagingOrdersApi,
  procedureOrdersApi,
  patientApi,
} from '@/lib/api';
import type {
  Encounter,
  SOAPNote,
  PatientProfile,
  MedicationOrder,
  LabOrder,
  ImagingOrder,
  ProcedureOrder,
} from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Save,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Plus,
  Pill,
  FlaskConical,
  Scan,
  Scissors,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { MedicationOrderDialog } from './MedicationOrderDialog';
import { LabOrderDialog } from './LabOrderDialog';
import { ImagingOrderDialog } from './ImagingOrderDialog';
import { ProcedureOrderDialog } from './ProcedureOrderDialog';

export function EncounterPageSOAP() {
  const { encounterId } = useParams<{ encounterId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [soapNote, setSOAPNote] = useState<SOAPNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Orders
  const [medicationOrders, setMedicationOrders] = useState<MedicationOrder[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [imagingOrders, setImagingOrders] = useState<ImagingOrder[]>([]);
  const [procedureOrders, setProcedureOrders] = useState<ProcedureOrder[]>([]);

  // Dialog states
  const [showMedicationDialog, setShowMedicationDialog] = useState(false);
  const [showLabDialog, setShowLabDialog] = useState(false);
  const [showImagingDialog, setShowImagingDialog] = useState(false);
  const [showProcedureDialog, setShowProcedureDialog] = useState(false);

  // Role-based access
  const isAdmin = user?.roles?.includes('admin');
  const isReadOnly = isAdmin || soapNote?.status === 'signed';

  useEffect(() => {
    if (encounterId) {
      loadEncounter();
    }
  }, [encounterId]);

  const loadEncounter = async () => {
    if (!encounterId) return;

    setIsLoading(true);
    try {
      const encounterRes = await encountersApi.getById(encounterId);
      if (encounterRes.success && encounterRes.data) {
        setEncounter(encounterRes.data);

        // Load patient
        const patientRes = await patientApi.getById(encounterRes.data.patientId);
        if (patientRes.success && patientRes.data) {
          setPatient(patientRes.data);
        }

        // Load SOAP note
        const soapRes = await soapNotesApi.getByEncounter(encounterId);
        if (soapRes.success && soapRes.data) {
          setSOAPNote(soapRes.data);
        } else {
          // Create new SOAP note
          const newNote: SOAPNote = {
            soapNoteId: `soap-${Date.now()}`,
            encounterId,
            patientId: encounterRes.data.patientId,
            providerId: user?.userId || '',
            providerName: user?.name || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'draft',
            subjective: {
              chiefComplaint: encounterRes.data.chiefComplaint || '',
              historyOfPresentIllness: '',
              reviewOfSystems: {},
            },
            objective: {
              physicalExam: '',
            },
            assessment: {
              diagnoses: [],
              clinicalImpression: '',
            },
            plan: {
              treatmentPlan: '',
              medications: '',
              labOrders: '',
              imagingOrders: '',
              procedures: '',
              followUp: '',
              patientInstructions: '',
            },
            auditLog: [{
              timestamp: new Date().toISOString(),
              userId: user?.userId || '',
              userName: user?.name || '',
              action: 'created',
            }],
          };
          setSOAPNote(newNote);
        }

        // Load orders
        loadOrders(encounterId);
      }
    } catch (error) {
      console.error('Error loading encounter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async (encId: string) => {
    const [medRes, labRes, imgRes, procRes] = await Promise.all([
      medicationOrdersApi.getByEncounter(encId),
      labOrdersApi.getByEncounter(encId),
      imagingOrdersApi.getByEncounter(encId),
      procedureOrdersApi.getByEncounter(encId),
    ]);

    if (medRes.success && medRes.data) setMedicationOrders(medRes.data);
    if (labRes.success && labRes.data) setLabOrders(labRes.data);
    if (imgRes.success && imgRes.data) setImagingOrders(imgRes.data);
    if (procRes.success && procRes.data) setProcedureOrders(procRes.data);
  };

  const handleSave = async () => {
    if (!soapNote || isReadOnly) return;

    setIsSaving(true);
    try {
      const auditEntry = {
        timestamp: new Date().toISOString(),
        userId: user?.userId || '',
        userName: user?.name || '',
        action: 'updated' as const,
      };

      const updatedNote = {
        ...soapNote,
        auditLog: [...soapNote.auditLog, auditEntry],
      };

      if (soapNote.createdAt === soapNote.updatedAt) {
        // First save
        await soapNotesApi.create(updatedNote);
      } else {
        await soapNotesApi.update(soapNote.soapNoteId, updatedNote);
      }

      setSOAPNote(updatedNote);
      alert('SOAP note saved successfully');
    } catch (error) {
      console.error('Error saving SOAP note:', error);
      alert('Failed to save SOAP note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSign = async () => {
    if (!soapNote || isReadOnly || !user) return;

    if (!confirm('Are you sure you want to sign this note? It will become read-only.')) {
      return;
    }

    setIsSaving(true);
    try {
      const auditEntry = {
        timestamp: new Date().toISOString(),
        userId: user.userId,
        userName: user.name,
        action: 'signed' as const,
      };

      const signedNote = {
        ...soapNote,
        status: 'signed' as const,
        signedAt: new Date().toISOString(),
        auditLog: [...soapNote.auditLog, auditEntry],
      };

      await soapNotesApi.sign(soapNote.soapNoteId, user.userId);
      setSOAPNote(signedNote);
      alert('SOAP note signed successfully');
    } catch (error) {
      console.error('Error signing SOAP note:', error);
      alert('Failed to sign SOAP note');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSOAPField = (section: keyof SOAPNote, field: string, value: any) => {
    if (!soapNote || isReadOnly) return;

    setSOAPNote({
      ...soapNote,
      [section]: {
        ...(soapNote[section] as any),
        [field]: value,
      },
    });
  };

  const addDiagnosis = () => {
    if (!soapNote || isReadOnly) return;

    const newDiagnosis = {
      description: '',
      type: 'secondary' as const,
    };

    setSOAPNote({
      ...soapNote,
      assessment: {
        ...soapNote.assessment,
        diagnoses: [...soapNote.assessment.diagnoses, newDiagnosis],
      },
    });
  };

  const updateDiagnosis = (index: number, field: string, value: any) => {
    if (!soapNote || isReadOnly) return;

    const diagnoses = [...soapNote.assessment.diagnoses];
    diagnoses[index] = { ...diagnoses[index], [field]: value };

    setSOAPNote({
      ...soapNote,
      assessment: {
        ...soapNote.assessment,
        diagnoses,
      },
    });
  };

  const removeDiagnosis = (index: number) => {
    if (!soapNote || isReadOnly) return;

    setSOAPNote({
      ...soapNote,
      assessment: {
        ...soapNote.assessment,
        diagnoses: soapNote.assessment.diagnoses.filter((_, i) => i !== index),
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Loading encounter...</p>
      </div>
    );
  }

  if (!encounter || !soapNote || !patient) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-red-600">Encounter not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Clinical Documentation
            </h1>
            <p className="text-muted-foreground mt-1">
              {patient.firstName} {patient.lastName} (MRN: {patient.mrn})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {soapNote.status === 'signed' && (
            <Badge className="bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              Signed
            </Badge>
          )}
          {soapNote.status === 'draft' && (
            <Badge variant="outline">Draft</Badge>
          )}
        </div>
      </div>

      {/* Admin Read-Only Warning */}
      {isAdmin && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-900">Read-Only Mode</p>
              <p className="text-sm text-yellow-700">
                Admin users have read-only access to clinical documentation. Contact a clinical staff member to make changes.
              </p>
            </div>
            <Eye className="h-5 w-5 text-yellow-600 ml-auto" />
          </CardContent>
        </Card>
      )}

      {/* Signed Note Warning */}
      {soapNote.status === 'signed' && !isAdmin && (
        <Card className="border-blue-500 bg-blue-50">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900">Signed Note</p>
              <p className="text-sm text-blue-700">
                This note has been signed and is now read-only. Signed at: {soapNote.signedAt && format(new Date(soapNote.signedAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Encounter Info */}
      <Card>
        <CardHeader>
          <CardTitle>Encounter Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Encounter Type</label>
              <p className="text-lg capitalize">{encounter.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <p className="text-lg capitalize">{encounter.status}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date</label>
              <p className="text-lg">{format(new Date(encounter.startDate), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Provider</label>
              <p className="text-lg">{soapNote.providerName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Department</label>
              <p className="text-lg">{encounter.department || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-lg">{format(new Date(soapNote.createdAt), 'MMM dd, yyyy HH:mm')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SOAP Note Tabs */}
      <Tabs defaultValue="subjective" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="subjective">Subjective</TabsTrigger>
          <TabsTrigger value="objective">Objective</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="plan">Plan</TabsTrigger>
        </TabsList>

        {/* SUBJECTIVE */}
        <TabsContent value="subjective" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chief Complaint</CardTitle>
              <CardDescription>Primary reason for visit</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={soapNote.subjective.chiefComplaint}
                onChange={(e) => updateSOAPField('subjective', 'chiefComplaint', e.target.value)}
                placeholder="Enter chief complaint..."
                rows={2}
                disabled={isReadOnly}
                className={isReadOnly ? 'bg-gray-50' : ''}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>History of Present Illness (HPI)</CardTitle>
              <CardDescription>Detailed narrative of the patient's current condition</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={soapNote.subjective.historyOfPresentIllness}
                onChange={(e) => updateSOAPField('subjective', 'historyOfPresentIllness', e.target.value)}
                placeholder="Include onset, location, duration, characteristics, aggravating/relieving factors, timing, severity..."
                rows={6}
                disabled={isReadOnly}
                className={isReadOnly ? 'bg-gray-50' : ''}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review of Systems (ROS)</CardTitle>
              <CardDescription>Systematic review of body systems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'constitutional', label: 'Constitutional' },
                { key: 'cardiovascular', label: 'Cardiovascular' },
                { key: 'respiratory', label: 'Respiratory' },
                { key: 'gastrointestinal', label: 'Gastrointestinal' },
                { key: 'genitourinary', label: 'Genitourinary' },
                { key: 'musculoskeletal', label: 'Musculoskeletal' },
                { key: 'neurological', label: 'Neurological' },
                { key: 'psychiatric', label: 'Psychiatric' },
                { key: 'skinIntegumentary', label: 'Skin/Integumentary' },
              ].map((system) => (
                <div key={system.key}>
                  <label className="text-sm font-medium mb-1 block">{system.label}</label>
                  <Textarea
                    value={(soapNote.subjective.reviewOfSystems as any)[system.key] || ''}
                    onChange={(e) => {
                      if (isReadOnly) return;
                      setSOAPNote({
                        ...soapNote,
                        subjective: {
                          ...soapNote.subjective,
                          reviewOfSystems: {
                            ...soapNote.subjective.reviewOfSystems,
                            [system.key]: e.target.value,
                          },
                        },
                      });
                    }}
                    placeholder={`Enter ${system.label.toLowerCase()} findings...`}
                    rows={2}
                    disabled={isReadOnly}
                    className={isReadOnly ? 'bg-gray-50' : ''}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* OBJECTIVE */}
        <TabsContent value="objective" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Physical Examination</CardTitle>
              <CardDescription>Objective clinical findings</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={soapNote.objective.physicalExam}
                onChange={(e) => updateSOAPField('objective', 'physicalExam', e.target.value)}
                placeholder="Document physical examination findings by system..."
                rows={8}
                disabled={isReadOnly}
                className={isReadOnly ? 'bg-gray-50' : ''}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lab Results</CardTitle>
              <CardDescription>Relevant laboratory findings</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={soapNote.objective.labResults || ''}
                onChange={(e) => updateSOAPField('objective', 'labResults', e.target.value)}
                placeholder="Summarize relevant lab results..."
                rows={4}
                disabled={isReadOnly}
                className={isReadOnly ? 'bg-gray-50' : ''}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Imaging Results</CardTitle>
              <CardDescription>Relevant imaging study findings</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={soapNote.objective.imagingResults || ''}
                onChange={(e) => updateSOAPField('objective', 'imagingResults', e.target.value)}
                placeholder="Summarize relevant imaging findings..."
                rows={4}
                disabled={isReadOnly}
                className={isReadOnly ? 'bg-gray-50' : ''}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ASSESSMENT */}
        <TabsContent value="assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Diagnoses</CardTitle>
                  <CardDescription>ICD-10 coded diagnoses</CardDescription>
                </div>
                {!isReadOnly && (
                  <Button onClick={addDiagnosis} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Diagnosis
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {soapNote.assessment.diagnoses.map((diagnosis, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Type</label>
                      <select
                        value={diagnosis.type}
                        onChange={(e) => updateDiagnosis(index, 'type', e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={isReadOnly}
                      >
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium mb-1 block">ICD-10 Code (Optional)</label>
                      <Input
                        value={diagnosis.code || ''}
                        onChange={(e) => updateDiagnosis(index, 'code', e.target.value)}
                        placeholder="e.g., J44.1"
                        disabled={isReadOnly}
                        className={isReadOnly ? 'bg-gray-50' : ''}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Description</label>
                    <Input
                      value={diagnosis.description}
                      onChange={(e) => updateDiagnosis(index, 'description', e.target.value)}
                      placeholder="Enter diagnosis description..."
                      disabled={isReadOnly}
                      className={isReadOnly ? 'bg-gray-50' : ''}
                    />
                  </div>
                  {!isReadOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDiagnosis(index)}
                      className="text-red-600"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              {soapNote.assessment.diagnoses.length === 0 && (
                <p className="text-sm text-muted-foreground text-center p-4">
                  No diagnoses added yet. Click "Add Diagnosis" to begin.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clinical Impression</CardTitle>
              <CardDescription>Overall assessment and clinical reasoning</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={soapNote.assessment.clinicalImpression}
                onChange={(e) => updateSOAPField('assessment', 'clinicalImpression', e.target.value)}
                placeholder="Document your clinical impression, differential diagnoses, and reasoning..."
                rows={6}
                disabled={isReadOnly}
                className={isReadOnly ? 'bg-gray-50' : ''}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* PLAN */}
        <TabsContent value="plan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Plan</CardTitle>
              <CardDescription>Overall treatment strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={soapNote.plan.treatmentPlan}
                onChange={(e) => updateSOAPField('plan', 'treatmentPlan', e.target.value)}
                placeholder="Describe the overall treatment plan..."
                rows={4}
                disabled={isReadOnly}
                className={isReadOnly ? 'bg-gray-50' : ''}
              />
            </CardContent>
          </Card>

          {/* Clinical Orders Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Clinical Orders</CardTitle>
                  <CardDescription>Medications, labs, imaging, and procedures</CardDescription>
                </div>
                {!isReadOnly && (
                  <div className="flex gap-2">
                    <Button onClick={() => setShowMedicationDialog(true)} size="sm" variant="outline">
                      <Pill className="h-4 w-4 mr-1" />
                      Medication
                    </Button>
                    <Button onClick={() => setShowLabDialog(true)} size="sm" variant="outline">
                      <FlaskConical className="h-4 w-4 mr-1" />
                      Lab
                    </Button>
                    <Button onClick={() => setShowImagingDialog(true)} size="sm" variant="outline">
                      <Scan className="h-4 w-4 mr-1" />
                      Imaging
                    </Button>
                    <Button onClick={() => setShowProcedureDialog(true)} size="sm" variant="outline">
                      <Scissors className="h-4 w-4 mr-1" />
                      Procedure
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Medication Orders */}
              {medicationOrders.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Medication Orders ({medicationOrders.length})</h4>
                  <div className="space-y-2">
                    {medicationOrders.map((order) => (
                      <div key={order.orderId} className="p-3 border rounded bg-blue-50">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{order.medicationName}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.dose} | {order.route} | {order.frequency}
                            </p>
                            <p className="text-sm">{order.indication}</p>
                          </div>
                          <Badge variant="outline">{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lab Orders */}
              {labOrders.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Lab Orders ({labOrders.length})</h4>
                  <div className="space-y-2">
                    {labOrders.map((order) => (
                      <div key={order.orderId} className="p-3 border rounded bg-green-50">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{order.testName}</p>
                            <p className="text-sm">{order.indication}</p>
                          </div>
                          <Badge variant="outline">{order.priority}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Imaging Orders */}
              {imagingOrders.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Imaging Orders ({imagingOrders.length})</h4>
                  <div className="space-y-2">
                    {imagingOrders.map((order) => (
                      <div key={order.orderId} className="p-3 border rounded bg-purple-50">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{order.studyType} - {order.bodyPart}</p>
                            <p className="text-sm">{order.indication}</p>
                          </div>
                          <Badge variant="outline">{order.priority}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Procedure Orders */}
              {procedureOrders.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Procedure Orders ({procedureOrders.length})</h4>
                  <div className="space-y-2">
                    {procedureOrders.map((order) => (
                      <div key={order.orderId} className="p-3 border rounded bg-yellow-50">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{order.procedureName}</p>
                            <p className="text-sm">{order.indication}</p>
                          </div>
                          <Badge variant="outline">{order.priority}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {medicationOrders.length === 0 && labOrders.length === 0 && 
               imagingOrders.length === 0 && procedureOrders.length === 0 && (
                <p className="text-sm text-muted-foreground text-center p-4">
                  No orders placed yet. Use the buttons above to add orders.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Follow-Up</CardTitle>
              <CardDescription>Follow-up instructions and timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={soapNote.plan.followUp}
                onChange={(e) => updateSOAPField('plan', 'followUp', e.target.value)}
                placeholder="Enter follow-up plans, appointments, monitoring..."
                rows={3}
                disabled={isReadOnly}
                className={isReadOnly ? 'bg-gray-50' : ''}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patient Instructions</CardTitle>
              <CardDescription>Instructions and education for the patient</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={soapNote.plan.patientInstructions}
                onChange={(e) => updateSOAPField('plan', 'patientInstructions', e.target.value)}
                placeholder="Enter patient education and discharge instructions..."
                rows={4}
                disabled={isReadOnly}
                className={isReadOnly ? 'bg-gray-50' : ''}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      {!isReadOnly && (
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          {soapNote.status === 'draft' && (
            <Button onClick={handleSign} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Sign Note
            </Button>
          )}
        </div>
      )}

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {soapNote.auditLog.map((entry, index) => (
              <div key={index} className="text-sm flex items-center gap-2 text-muted-foreground">
                <span className="font-medium">{entry.action}</span>
                <span>by {entry.userName}</span>
                <span>at {format(new Date(entry.timestamp), 'MMM dd, yyyy HH:mm')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Dialogs */}
      {showMedicationDialog && encounterId && (
        <MedicationOrderDialog
          encounterId={encounterId}
          patientId={patient.patientId}
          onClose={() => setShowMedicationDialog(false)}
          onOrderCreated={() => {
            setShowMedicationDialog(false);
            if (encounterId) loadOrders(encounterId);
          }}
        />
      )}

      {showLabDialog && encounterId && (
        <LabOrderDialog
          encounterId={encounterId}
          patientId={patient.patientId}
          onClose={() => setShowLabDialog(false)}
          onOrderCreated={() => {
            setShowLabDialog(false);
            if (encounterId) loadOrders(encounterId);
          }}
        />
      )}

      {showImagingDialog && encounterId && (
        <ImagingOrderDialog
          encounterId={encounterId}
          patientId={patient.patientId}
          onClose={() => setShowImagingDialog(false)}
          onOrderCreated={() => {
            setShowImagingDialog(false);
            if (encounterId) loadOrders(encounterId);
          }}
        />
      )}

      {showProcedureDialog && encounterId && (
        <ProcedureOrderDialog
          encounterId={encounterId}
          patientId={patient.patientId}
          onClose={() => setShowProcedureDialog(false)}
          onOrderCreated={() => {
            setShowProcedureDialog(false);
            if (encounterId) loadOrders(encounterId);
          }}
        />
      )}
    </div>
  );
}
