// User and Role Types
export type UserRole = 'patient' | 'nurse' | 'provider' | 'charge_nurse' | 'admin';

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  roles: UserRole[];
  unit?: string;
  patientId?: string;
  avatar?: string;
  phone?: string;
  department?: string;
}

// Patient Profile Types
export interface PatientDemographics {
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  mrn: string; // Medical Record Number
  bloodType?: string;
  allergies?: string[];
  language?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface CareTeamMember {
  userId: string;
  name: string;
  role: UserRole;
  specialty?: string;
  isPrimary?: boolean;
}

export interface PatientProfile extends PatientDemographics {
  careTeam: CareTeamMember[];
  room?: string;
  admissionDate?: string;
  status: 'admitted' | 'discharged' | 'transferred' | 'emergency';
  chiefComplaint?: string;
  diagnosis?: string[];
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

// Provider Types
export interface Provider {
  userId: string;
  name: string;
  email: string;
  specialty: string;
  department: string;
  availability: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:mm format
    endTime: string;
  }[];
  phone?: string;
  npiNumber?: string;
}

// Appointment Types
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
export type AppointmentType = 'consultation' | 'follow-up' | 'procedure' | 'lab' | 'imaging' | 'routine' | 'emergency';
export type CheckInStatus = 'not-arrived' | 'arrived' | 'checked-in' | 'ready-to-room' | 'roomed';

export interface Appointment {
  appointmentId: string;
  patientId: string;
  providerId: string;
  dateTime: string;
  duration: number; // minutes
  type: AppointmentType;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  checkInTime?: string;
  checkInStatus?: CheckInStatus;
  location?: string;
  department?: string;
  room?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  insuranceVerified?: boolean;
  addressConfirmed?: boolean;
}

export interface TimeSlot {
  startTime: string; // HH:mm format
  endTime: string;
  isAvailable: boolean;
  appointmentId?: string;
}

// Vitals and Monitoring Types
export interface VitalSign {
  timestamp: string;
  heartRate?: number;
  systolicBP?: number;
  diastolicBP?: number;
  respiratoryRate?: number;
  temperature?: number; // Celsius
  spO2?: number; // Oxygen saturation percentage
  painLevel?: number; // 0-10 scale
  consciousness?: 'alert' | 'verbal' | 'pain' | 'unresponsive';
}

export interface VitalsTimeSeries {
  patientId: string;
  readings: VitalSign[];
}

// Alert Types
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AlertType = 'vitals' | 'medication' | 'lab' | 'clinical' | 'system';

export interface Alert {
  alertId: string;
  patientId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  source?: string; // e.g., "SIRS Rule", "EWS Criteria"
  vitals?: VitalSign;
}

// Clinical Rules Types
export interface RuleCriteria {
  parameter: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value: number | string;
}

export interface Rule {
  ruleId: string;
  name: string;
  description: string;
  type: 'SIRS' | 'EWS' | 'custom';
  criteria: RuleCriteria[];
  severity: AlertSeverity;
  enabled: boolean;
  createdBy?: string;
  createdAt?: string;
}

// Medication Types
export interface Medication {
  medicationId: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  route: 'oral' | 'IV' | 'IM' | 'SC' | 'topical';
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  status: 'active' | 'completed' | 'discontinued';
  instructions?: string;
}

// Lab Results Types
export interface LabResult {
  labId: string;
  patientId: string;
  testName: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  status: 'pending' | 'completed' | 'reviewed';
  orderedBy: string;
  orderedDate: string;
  resultDate?: string;
  notes?: string;
  abnormalFlag?: 'high' | 'low' | 'critical';
}

// Nursing Notes Types
export interface NursingNote {
  noteId: string;
  patientId: string;
  authorId: string;
  authorName: string;
  timestamp: string;
  category: 'assessment' | 'intervention' | 'plan' | 'general';
  content: string;
  vitals?: VitalSign;
}

// Dashboard Statistics Types
export interface DashboardStats {
  totalPatients?: number;
  activeAlerts?: number;
  criticalAlerts?: number;
  todayAppointments?: number;
  completedAppointments?: number;
  pendingTasks?: number;
  bedOccupancy?: number;
  averageWaitTime?: number;
}

// Imaging Study Types
export interface ImagingStudy {
  studyId: string;
  patientId: string;
  type: 'x-ray' | 'ct' | 'mri' | 'ultrasound' | 'pet' | 'other';
  bodyPart: string;
  description: string;
  orderedBy: string;
  orderedDate: string;
  performedDate?: string;
  status: 'ordered' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  findings?: string;
  radiologist?: string;
  urgency?: 'routine' | 'urgent' | 'stat';
}

// Encounter Types
export interface Encounter {
  encounterId: string;
  patientId: string;
  type: 'inpatient' | 'outpatient' | 'emergency' | 'observation' | 'telehealth';
  status: 'planned' | 'arrived' | 'in-progress' | 'finished' | 'cancelled';
  startDate: string;
  endDate?: string;
  providerId: string;
  providerName?: string;
  department?: string;
  chiefComplaint?: string;
  diagnosis?: string[];
  procedures?: string[];
  notes?: string;
}

// SOAP Note Types
export interface SOAPNote {
  soapNoteId: string;
  encounterId: string;
  patientId: string;
  providerId: string;
  providerName: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'signed' | 'amended';
  signedAt?: string;
  
  // Subjective
  subjective: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    reviewOfSystems: {
      constitutional?: string;
      cardiovascular?: string;
      respiratory?: string;
      gastrointestinal?: string;
      genitourinary?: string;
      musculoskeletal?: string;
      neurological?: string;
      psychiatric?: string;
      skinIntegumentary?: string;
      hematologic?: string;
      allergicImmunologic?: string;
      endocrine?: string;
    };
  };
  
  // Objective
  objective: {
    vitalSigns?: VitalSign;
    physicalExam: string;
    labResults?: string;
    imagingResults?: string;
  };
  
  // Assessment
  assessment: {
    diagnoses: {
      code?: string; // ICD-10 code
      description: string;
      type: 'primary' | 'secondary';
    }[];
    clinicalImpression: string;
  };
  
  // Plan
  plan: {
    treatmentPlan: string;
    medications: string;
    labOrders: string;
    imagingOrders: string;
    procedures: string;
    followUp: string;
    patientInstructions: string;
  };
  
  // Audit trail
  auditLog: {
    timestamp: string;
    userId: string;
    userName: string;
    action: 'created' | 'updated' | 'signed' | 'amended';
    changes?: string;
  }[];
}

// Clinical Order Types
export type OrderPriority = 'routine' | 'urgent' | 'stat';
export type OrderStatus = 'draft' | 'ordered' | 'in-progress' | 'completed' | 'cancelled';

export interface MedicationOrder {
  orderId: string;
  encounterId: string;
  patientId: string;
  orderedBy: string;
  orderedByName: string;
  orderedAt: string;
  status: OrderStatus;
  
  medicationName: string;
  dose: string;
  route: 'oral' | 'IV' | 'IM' | 'SC' | 'topical' | 'inhalation' | 'rectal';
  frequency: string;
  duration?: string;
  quantity?: string;
  refills?: number;
  indication: string;
  instructions?: string;
  priority: OrderPriority;
  
  pharmacyNotes?: string;
  discontinuedAt?: string;
  discontinuedBy?: string;
  discontinuedReason?: string;
}

export interface LabOrder {
  orderId: string;
  encounterId: string;
  patientId: string;
  orderedBy: string;
  orderedByName: string;
  orderedAt: string;
  status: OrderStatus;
  
  testName: string;
  testCode?: string;
  priority: OrderPriority;
  indication: string;
  instructions?: string;
  
  specimenType?: string;
  collectedAt?: string;
  collectedBy?: string;
  resultedAt?: string;
  results?: string;
}

export interface ImagingOrder {
  orderId: string;
  encounterId: string;
  patientId: string;
  orderedBy: string;
  orderedByName: string;
  orderedAt: string;
  status: OrderStatus;
  
  studyType: string;
  bodyPart: string;
  laterality?: 'left' | 'right' | 'bilateral';
  priority: OrderPriority;
  indication: string;
  clinicalHistory?: string;
  instructions?: string;
  
  scheduledAt?: string;
  performedAt?: string;
  performedBy?: string;
  radiologist?: string;
  preliminaryFindings?: string;
  finalReport?: string;
  reportedAt?: string;
}

export interface ProcedureOrder {
  orderId: string;
  encounterId: string;
  patientId: string;
  orderedBy: string;
  orderedByName: string;
  orderedAt: string;
  status: OrderStatus;
  
  procedureName: string;
  procedureCode?: string;
  priority: OrderPriority;
  indication: string;
  instructions?: string;
  
  scheduledAt?: string;
  performedAt?: string;
  performedBy?: string;
  procedureNotes?: string;
  complications?: string;
}

// Nurse Workflow Types
export type PatientFlowState = 'admitted' | 'assessment' | 'treatment' | 'discharge_planning' | 'discharged';

export interface PatientAssignment {
  assignmentId: string;
  patientId: string;
  patientName: string;
  patientMRN: string;
  nurseId: string;
  nurseName: string;
  unit: string;
  room: string;
  bed: string;
  assignedAt: string;
  assignedBy: string;
  shiftStart: string;
  shiftEnd: string;
  acuityLevel: 'low' | 'medium' | 'high' | 'critical';
  isPrimary: boolean;
}

export interface BedAssignment {
  bedId: string;
  unit: string;
  room: string;
  bed: string;
  status: 'occupied' | 'available' | 'cleaning' | 'maintenance';
  patientId?: string;
  patientName?: string;
  assignedNurseId?: string;
  assignedNurseName?: string;
  admissionDate?: string;
}

export interface PatientFlowRecord {
  flowId: string;
  patientId: string;
  patientName: string;
  patientMRN: string;
  currentState: PatientFlowState;
  unit: string;
  room: string;
  bed: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  actualDischargeDate?: string;
  stateHistory: {
    state: PatientFlowState;
    timestamp: string;
    updatedBy: string;
    updatedByName: string;
    notes?: string;
  }[];
  pendingTransfer?: {
    toUnit: string;
    toRoom: string;
    toBed: string;
    requestedAt: string;
    requestedBy: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
  };
}

export type NurseTaskType = 'medication' | 'vitals' | 'assessment' | 'procedure' | 'lab_collection' | 'documentation' | 'other';
export type NurseTaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type NurseTaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

export interface NurseTask {
  taskId: string;
  patientId: string;
  patientName: string;
  patientMRN: string;
  room: string;
  assignedTo: string;
  assignedToName: string;
  taskType: NurseTaskType;
  priority: NurseTaskPriority;
  status: NurseTaskStatus;
  title: string;
  description?: string;
  dueAt: string;
  createdAt: string;
  createdBy: string;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export type MedicationAdministrationStatus = 'scheduled' | 'administered' | 'refused' | 'missed' | 'held' | 'discontinued';

export interface MedicationAdministration {
  administrationId: string;
  medicationOrderId: string;
  patientId: string;
  patientName: string;
  patientMRN: string;
  room: string;
  
  medicationName: string;
  dose: string;
  route: string;
  frequency: string;
  
  scheduledTime: string;
  timeWindow: {
    start: string;
    end: string;
  };
  
  status: MedicationAdministrationStatus;
  administeredAt?: string;
  administeredBy?: string;
  administeredByName?: string;
  
  // For refusal or held
  reason?: string;
  reasonDetails?: string;
  
  // For documentation
  patientResponse?: string;
  siteOfAdministration?: string;
  witnessedBy?: string;
  
  // Barcode scanning
  barcodeScanned?: boolean;
  scannedAt?: string;
}

// Provider Workflow Types
export interface PatientMessage {
  messageId: string;
  patientId: string;
  patientName: string;
  patientMRN: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'responded';
  timestamp: string;
  responseRequired: boolean;
  response?: string;
  respondedAt?: string;
  respondedBy?: string;
}

export interface ConsultationRequest {
  requestId: string;
  patientId: string;
  patientName: string;
  patientMRN: string;
  requestingProvider: string;
  requestingDepartment: string;
  consultationType: string;
  urgency: 'routine' | 'urgent' | 'stat';
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  reason: string;
  clinicalInfo: string;
  requestedAt: string;
  dueDate?: string;
  acceptedAt?: string;
  acceptedBy?: string;
  completedAt?: string;
  consultNote?: string;
  recommendations?: string;
}
