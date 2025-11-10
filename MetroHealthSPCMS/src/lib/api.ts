import type {
  UserProfile,
  PatientProfile,
  Provider,
  Appointment,
  Alert,
  VitalsTimeSeries,
  Medication,
  NursingNote,
  Rule,
  CheckInStatus,
  AppointmentStatus,
  LabResult,
  ImagingStudy,
  Encounter,
  SOAPNote,
  MedicationOrder,
  LabOrder,
  ImagingOrder,
  ProcedureOrder,
  OrderStatus,
  PatientAssignment,
  BedAssignment,
  PatientFlowRecord,
  NurseTask,
  MedicationAdministration,
  MedicationAdministrationStatus,
  PatientMessage,
  ConsultationRequest,
} from '@/types';

import {
  mockUsers,
  mockPatients,
  mockProviders,
  mockAppointments,
  mockAlerts,
  mockVitals,
  mockMedications,
  mockNursingNotes,
  mockRules,
  mockCredentials,
  mockLabResults,
  mockImagingStudies,
  mockEncounters,
} from './mockData';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'metro_health_users',
  PATIENTS: 'metro_health_patients',
  PROVIDERS: 'metro_health_providers',
  APPOINTMENTS: 'metro_health_appointments',
  ALERTS: 'metro_health_alerts',
  VITALS: 'metro_health_vitals',
  MEDICATIONS: 'metro_health_medications',
  NURSING_NOTES: 'metro_health_nursing_notes',
  RULES: 'metro_health_rules',
  LAB_RESULTS: 'metro_health_lab_results',
  IMAGING_STUDIES: 'metro_health_imaging_studies',
  ENCOUNTERS: 'metro_health_encounters',
  CURRENT_USER: 'metro_health_current_user',
  PATIENT_MESSAGES: 'metro_health_patient_messages',
  CONSULTATION_REQUESTS: 'metro_health_consultation_requests',
};

// Initialize localStorage with mock data if not exists
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(mockPatients));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROVIDERS)) {
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(mockProviders));
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(mockAppointments));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ALERTS)) {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(mockAlerts));
  }
  if (!localStorage.getItem(STORAGE_KEYS.VITALS)) {
    localStorage.setItem(STORAGE_KEYS.VITALS, JSON.stringify(mockVitals));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEDICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(mockMedications));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NURSING_NOTES)) {
    localStorage.setItem(STORAGE_KEYS.NURSING_NOTES, JSON.stringify(mockNursingNotes));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RULES)) {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(mockRules));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LAB_RESULTS)) {
    localStorage.setItem(STORAGE_KEYS.LAB_RESULTS, JSON.stringify(mockLabResults));
  }
  if (!localStorage.getItem(STORAGE_KEYS.IMAGING_STUDIES)) {
    localStorage.setItem(STORAGE_KEYS.IMAGING_STUDIES, JSON.stringify(mockImagingStudies));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ENCOUNTERS)) {
    localStorage.setItem(STORAGE_KEYS.ENCOUNTERS, JSON.stringify(mockEncounters));
  }
}

// Simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// API Response type
interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Authentication API
export const authApi = {
  async login(email: string, password: string): Promise<ApiResponse<UserProfile>> {
    await delay();
    
    const credentials = mockCredentials[email as keyof typeof mockCredentials];
    if (!credentials || credentials.password !== password) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    const users: UserProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => u.userId === credentials.userId);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return { success: true, data: user };
  },
  
  async logout(): Promise<ApiResponse<void>> {
    await delay(100);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    return { success: true };
  },
  
  getCurrentUser(): UserProfile | null {
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userData ? JSON.parse(userData) : null;
  },
};

// User API
export const userApi = {
  async getAll(): Promise<ApiResponse<UserProfile[]>> {
    await delay();
    const users: UserProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    return { success: true, data: users };
  },
  
  async getById(userId: string): Promise<ApiResponse<UserProfile>> {
    await delay();
    const users: UserProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => u.userId === userId);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    return { success: true, data: user };
  },
};

// Patient API
export const patientApi = {
  async getAll(): Promise<ApiResponse<PatientProfile[]>> {
    await delay();
    const patients: PatientProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');
    return { success: true, data: patients };
  },
  
  async getById(patientId: string): Promise<ApiResponse<PatientProfile>> {
    await delay();
    const patients: PatientProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');
    const patient = patients.find(p => p.patientId === patientId);
    
    if (!patient) {
      return { success: false, error: 'Patient not found' };
    }
    
    return { success: true, data: patient };
  },
  
  async getByUnit(unit: string): Promise<ApiResponse<PatientProfile[]>> {
    await delay();
    const patients: PatientProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');
    const filtered = patients.filter(p => p.room?.startsWith(unit));
    return { success: true, data: filtered };
  },
};

// Provider API
export const providerApi = {
  async getAll(): Promise<ApiResponse<Provider[]>> {
    await delay();
    const providers: Provider[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROVIDERS) || '[]');
    return { success: true, data: providers };
  },
  
  async getById(providerId: string): Promise<ApiResponse<Provider>> {
    await delay();
    const providers: Provider[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROVIDERS) || '[]');
    const provider = providers.find(p => p.userId === providerId);
    
    if (!provider) {
      return { success: false, error: 'Provider not found' };
    }
    
    return { success: true, data: provider };
  },
};

// Appointment API
export const appointmentApi = {
  async getAll(): Promise<ApiResponse<Appointment[]>> {
    await delay();
    const appointments: Appointment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
    return { success: true, data: appointments };
  },
  
  async getById(appointmentId: string): Promise<ApiResponse<Appointment>> {
    await delay();
    const appointments: Appointment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
    const appointment = appointments.find(a => a.appointmentId === appointmentId);
    
    if (!appointment) {
      return { success: false, error: 'Appointment not found' };
    }
    
    return { success: true, data: appointment };
  },
  
  async getByPatient(patientId: string): Promise<ApiResponse<Appointment[]>> {
    await delay();
    const appointments: Appointment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
    const filtered = appointments.filter(a => a.patientId === patientId);
    return { success: true, data: filtered };
  },
  
  async getByProvider(providerId: string): Promise<ApiResponse<Appointment[]>> {
    await delay();
    const appointments: Appointment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
    const filtered = appointments.filter(a => a.providerId === providerId);
    return { success: true, data: filtered };
  },
  
  async create(appointment: Omit<Appointment, 'appointmentId'>): Promise<ApiResponse<Appointment>> {
    await delay();
    const appointments: Appointment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
    const newAppointment: Appointment = {
      ...appointment,
      appointmentId: `APT${String(appointments.length + 1).padStart(3, '0')}`,
    };
    
    appointments.push(newAppointment);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    
    return { success: true, data: newAppointment };
  },
  
  async update(appointmentId: string, updates: Partial<Appointment>): Promise<ApiResponse<Appointment>> {
    await delay();
    const appointments: Appointment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
    const index = appointments.findIndex(a => a.appointmentId === appointmentId);
    
    if (index === -1) {
      return { success: false, error: 'Appointment not found' };
    }
    
    appointments[index] = { ...appointments[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    
    return { success: true, data: appointments[index] };
  },
  
  async cancel(appointmentId: string, userId: string, reason: string): Promise<ApiResponse<Appointment>> {
    await delay();
    const appointments: Appointment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
    const index = appointments.findIndex(a => a.appointmentId === appointmentId);
    
    if (index === -1) {
      return { success: false, error: 'Appointment not found' };
    }
    
    appointments[index] = {
      ...appointments[index],
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancelledBy: userId,
      cancellationReason: reason,
    };
    
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    return { success: true, data: appointments[index] };
  },
  
  async reschedule(
    appointmentId: string,
    newDateTime: string,
    newProviderId?: string
  ): Promise<ApiResponse<Appointment>> {
    await delay();
    const appointments: Appointment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
    const index = appointments.findIndex(a => a.appointmentId === appointmentId);
    
    if (index === -1) {
      return { success: false, error: 'Appointment not found' };
    }
    
    const updates: Partial<Appointment> = {
      dateTime: newDateTime,
      status: 'scheduled',
    };
    
    if (newProviderId) {
      updates.providerId = newProviderId;
    }
    
    appointments[index] = { ...appointments[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    
    return { success: true, data: appointments[index] };
  },
  
  async updateStatus(appointmentId: string, status: AppointmentStatus): Promise<ApiResponse<Appointment>> {
    await delay();
    const appointments: Appointment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
    const index = appointments.findIndex(a => a.appointmentId === appointmentId);
    
    if (index === -1) {
      return { success: false, error: 'Appointment not found' };
    }
    
    appointments[index] = {
      ...appointments[index],
      status,
    };
    
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    return { success: true, data: appointments[index] };
  },

  async checkIn(appointmentId: string, checkInData: {
    checkInStatus?: CheckInStatus;
    insuranceVerified?: boolean;
    addressConfirmed?: boolean;
  }): Promise<ApiResponse<Appointment>> {
    await delay();
    const appointments: Appointment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
    const index = appointments.findIndex(a => a.appointmentId === appointmentId);
    
    if (index === -1) {
      return { success: false, error: 'Appointment not found' };
    }
    
    appointments[index] = {
      ...appointments[index],
      checkInTime: appointments[index].checkInTime || new Date().toISOString(),
      status: 'checked-in',
      ...checkInData,
    };
    
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    return { success: true, data: appointments[index] };
  },
};

// Alert API
export const alertApi = {
  async getAll(): Promise<ApiResponse<Alert[]>> {
    await delay();
    const alerts: Alert[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALERTS) || '[]');
    return { success: true, data: alerts };
  },
  
  async getByPatient(patientId: string): Promise<ApiResponse<Alert[]>> {
    await delay();
    const alerts: Alert[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALERTS) || '[]');
    const filtered = alerts.filter(a => a.patientId === patientId);
    return { success: true, data: filtered };
  },
  
  async acknowledge(alertId: string, userId: string): Promise<ApiResponse<Alert>> {
    await delay();
    const alerts: Alert[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALERTS) || '[]');
    const index = alerts.findIndex(a => a.alertId === alertId);
    
    if (index === -1) {
      return { success: false, error: 'Alert not found' };
    }
    
    alerts[index] = {
      ...alerts[index],
      acknowledgedBy: userId,
      acknowledgedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    return { success: true, data: alerts[index] };
  },
  
  async resolve(alertId: string, userId: string): Promise<ApiResponse<Alert>> {
    await delay();
    const alerts: Alert[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALERTS) || '[]');
    const index = alerts.findIndex(a => a.alertId === alertId);
    
    if (index === -1) {
      return { success: false, error: 'Alert not found' };
    }
    
    alerts[index] = {
      ...alerts[index],
      resolvedBy: userId,
      resolvedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    return { success: true, data: alerts[index] };
  },
};

// Vitals API
export const vitalsApi = {
  async getByPatient(patientId: string): Promise<ApiResponse<VitalsTimeSeries>> {
    await delay();
    const vitals: VitalsTimeSeries[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.VITALS) || '[]');
    const patientVitals = vitals.find(v => v.patientId === patientId);
    
    if (!patientVitals) {
      return { success: false, error: 'Vitals not found' };
    }
    
    return { success: true, data: patientVitals };
  },
};

// Medication API
export const medicationApi = {
  async getByPatient(patientId: string): Promise<ApiResponse<Medication[]>> {
    await delay();
    const medications: Medication[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDICATIONS) || '[]');
    const filtered = medications.filter(m => m.patientId === patientId);
    return { success: true, data: filtered };
  },
};

// Nursing Notes API
export const nursingNotesApi = {
  async getByPatient(patientId: string): Promise<ApiResponse<NursingNote[]>> {
    await delay();
    const notes: NursingNote[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NURSING_NOTES) || '[]');
    const filtered = notes.filter(n => n.patientId === patientId);
    return { success: true, data: filtered };
  },
  
  async create(note: Omit<NursingNote, 'noteId'>): Promise<ApiResponse<NursingNote>> {
    await delay();
    const notes: NursingNote[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NURSING_NOTES) || '[]');
    const newNote: NursingNote = {
      ...note,
      noteId: `NOTE${String(notes.length + 1).padStart(3, '0')}`,
    };
    
    notes.push(newNote);
    localStorage.setItem(STORAGE_KEYS.NURSING_NOTES, JSON.stringify(notes));
    
    return { success: true, data: newNote };
  },
};

// Rules API
export const rulesApi = {
  async getAll(): Promise<ApiResponse<Rule[]>> {
    await delay();
    const rules: Rule[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.RULES) || '[]');
    return { success: true, data: rules };
  },
};

// Lab Results API
export const labResultsApi = {
  async getByPatient(patientId: string): Promise<ApiResponse<LabResult[]>> {
    await delay();
    const labResults: LabResult[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LAB_RESULTS) || '[]');
    const filtered = labResults.filter(lab => lab.patientId === patientId);
    return { success: true, data: filtered };
  },
};

// Imaging Studies API
export const imagingApi = {
  async getByPatient(patientId: string): Promise<ApiResponse<ImagingStudy[]>> {
    await delay();
    const studies: ImagingStudy[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMAGING_STUDIES) || '[]');
    const filtered = studies.filter(study => study.patientId === patientId);
    return { success: true, data: filtered };
  },
};

// Encounters API
export const encountersApi = {
  async getByPatient(patientId: string): Promise<ApiResponse<Encounter[]>> {
    await delay();
    const encounters: Encounter[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ENCOUNTERS) || '[]');
    const filtered = encounters.filter(enc => enc.patientId === patientId);
    return { success: true, data: filtered };
  },
  
  async getById(encounterId: string): Promise<ApiResponse<Encounter>> {
    await delay();
    const encounters: Encounter[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ENCOUNTERS) || '[]');
    const encounter = encounters.find(enc => enc.encounterId === encounterId);
    
    if (!encounter) {
      return { success: false, error: 'Encounter not found' };
    }
    
    return { success: true, data: encounter };
  },
  
  async create(encounter: Encounter): Promise<ApiResponse<Encounter>> {
    await delay();
    const encounters: Encounter[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ENCOUNTERS) || '[]');
    encounters.push(encounter);
    localStorage.setItem(STORAGE_KEYS.ENCOUNTERS, JSON.stringify(encounters));
    return { success: true, data: encounter };
  },
  
  async update(encounterId: string, updates: Partial<Encounter>): Promise<ApiResponse<Encounter>> {
    await delay();
    const encounters: Encounter[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ENCOUNTERS) || '[]');
    const index = encounters.findIndex(enc => enc.encounterId === encounterId);
    
    if (index === -1) {
      return { success: false, error: 'Encounter not found' };
    }
    
    encounters[index] = { ...encounters[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.ENCOUNTERS, JSON.stringify(encounters));
    return { success: true, data: encounters[index] };
  },
};

// SOAP Notes API
const SOAP_STORAGE_KEY = 'soapNotes';

export const soapNotesApi = {
  async getByEncounter(encounterId: string): Promise<ApiResponse<SOAPNote | null>> {
    await delay();
    const soapNotes: SOAPNote[] = JSON.parse(localStorage.getItem(SOAP_STORAGE_KEY) || '[]');
    const note = soapNotes.find(note => note.encounterId === encounterId);
    return { success: true, data: note || null };
  },
  
  async create(soapNote: SOAPNote): Promise<ApiResponse<SOAPNote>> {
    await delay();
    const soapNotes: SOAPNote[] = JSON.parse(localStorage.getItem(SOAP_STORAGE_KEY) || '[]');
    soapNotes.push(soapNote);
    localStorage.setItem(SOAP_STORAGE_KEY, JSON.stringify(soapNotes));
    return { success: true, data: soapNote };
  },
  
  async update(soapNoteId: string, updates: Partial<SOAPNote>): Promise<ApiResponse<SOAPNote>> {
    await delay();
    const soapNotes: SOAPNote[] = JSON.parse(localStorage.getItem(SOAP_STORAGE_KEY) || '[]');
    const index = soapNotes.findIndex(note => note.soapNoteId === soapNoteId);
    
    if (index === -1) {
      return { success: false, error: 'SOAP note not found' };
    }
    
    soapNotes[index] = { ...soapNotes[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(SOAP_STORAGE_KEY, JSON.stringify(soapNotes));
    return { success: true, data: soapNotes[index] };
  },
  
  async sign(soapNoteId: string, _providerId: string): Promise<ApiResponse<SOAPNote>> {
    await delay();
    const soapNotes: SOAPNote[] = JSON.parse(localStorage.getItem(SOAP_STORAGE_KEY) || '[]');
    const index = soapNotes.findIndex(note => note.soapNoteId === soapNoteId);
    
    if (index === -1) {
      return { success: false, error: 'SOAP note not found' };
    }
    
    const now = new Date().toISOString();
    soapNotes[index] = {
      ...soapNotes[index],
      status: 'signed',
      signedAt: now,
      updatedAt: now,
    };
    
    localStorage.setItem(SOAP_STORAGE_KEY, JSON.stringify(soapNotes));
    return { success: true, data: soapNotes[index] };
  },
};

// Clinical Orders APIs
const MEDICATION_ORDERS_KEY = 'medicationOrders';
const LAB_ORDERS_KEY = 'labOrders';
const IMAGING_ORDERS_KEY = 'imagingOrders';
const PROCEDURE_ORDERS_KEY = 'procedureOrders';

export const medicationOrdersApi = {
  async getByEncounter(encounterId: string): Promise<ApiResponse<MedicationOrder[]>> {
    await delay();
    const orders: MedicationOrder[] = JSON.parse(localStorage.getItem(MEDICATION_ORDERS_KEY) || '[]');
    return { success: true, data: orders.filter(o => o.encounterId === encounterId) };
  },
  
  async create(order: MedicationOrder): Promise<ApiResponse<MedicationOrder>> {
    await delay();
    const orders: MedicationOrder[] = JSON.parse(localStorage.getItem(MEDICATION_ORDERS_KEY) || '[]');
    orders.push(order);
    localStorage.setItem(MEDICATION_ORDERS_KEY, JSON.stringify(orders));
    return { success: true, data: order };
  },
  
  async updateStatus(orderId: string, status: OrderStatus): Promise<ApiResponse<MedicationOrder>> {
    await delay();
    const orders: MedicationOrder[] = JSON.parse(localStorage.getItem(MEDICATION_ORDERS_KEY) || '[]');
    const index = orders.findIndex(o => o.orderId === orderId);
    
    if (index === -1) {
      return { success: false, error: 'Order not found' };
    }
    
    orders[index] = { ...orders[index], status };
    localStorage.setItem(MEDICATION_ORDERS_KEY, JSON.stringify(orders));
    return { success: true, data: orders[index] };
  },
};

export const labOrdersApi = {
  async getByEncounter(encounterId: string): Promise<ApiResponse<LabOrder[]>> {
    await delay();
    const orders: LabOrder[] = JSON.parse(localStorage.getItem(LAB_ORDERS_KEY) || '[]');
    return { success: true, data: orders.filter(o => o.encounterId === encounterId) };
  },
  
  async create(order: LabOrder): Promise<ApiResponse<LabOrder>> {
    await delay();
    const orders: LabOrder[] = JSON.parse(localStorage.getItem(LAB_ORDERS_KEY) || '[]');
    orders.push(order);
    localStorage.setItem(LAB_ORDERS_KEY, JSON.stringify(orders));
    return { success: true, data: order };
  },
};

export const imagingOrdersApi = {
  async getByEncounter(encounterId: string): Promise<ApiResponse<ImagingOrder[]>> {
    await delay();
    const orders: ImagingOrder[] = JSON.parse(localStorage.getItem(IMAGING_ORDERS_KEY) || '[]');
    return { success: true, data: orders.filter(o => o.encounterId === encounterId) };
  },
  
  async create(order: ImagingOrder): Promise<ApiResponse<ImagingOrder>> {
    await delay();
    const orders: ImagingOrder[] = JSON.parse(localStorage.getItem(IMAGING_ORDERS_KEY) || '[]');
    orders.push(order);
    localStorage.setItem(IMAGING_ORDERS_KEY, JSON.stringify(orders));
    return { success: true, data: order };
  },
};

export const procedureOrdersApi = {
  async getByEncounter(encounterId: string): Promise<ApiResponse<ProcedureOrder[]>> {
    await delay();
    const orders: ProcedureOrder[] = JSON.parse(localStorage.getItem(PROCEDURE_ORDERS_KEY) || '[]');
    return { success: true, data: orders.filter(o => o.encounterId === encounterId) };
  },
  
  async create(order: ProcedureOrder): Promise<ApiResponse<ProcedureOrder>> {
    await delay();
    const orders: ProcedureOrder[] = JSON.parse(localStorage.getItem(PROCEDURE_ORDERS_KEY) || '[]');
    orders.push(order);
    localStorage.setItem(PROCEDURE_ORDERS_KEY, JSON.stringify(orders));
    return { success: true, data: order };
  },
};

// Nurse Workflow APIs
const NURSE_ASSIGNMENTS_KEY = 'nurseAssignments';
const BED_ASSIGNMENTS_KEY = 'bedAssignments';
const PATIENT_FLOW_KEY = 'patientFlow';
const NURSE_TASKS_KEY = 'nurseTasks';
const MEDICATION_ADMIN_KEY = 'medicationAdministration';

export const nurseAssignmentsApi = {
  async getByNurse(nurseId: string): Promise<ApiResponse<PatientAssignment[]>> {
    await delay();
    const assignments: PatientAssignment[] = JSON.parse(localStorage.getItem(NURSE_ASSIGNMENTS_KEY) || '[]');
    return { success: true, data: assignments.filter(a => a.nurseId === nurseId) };
  },
  
  async getByUnit(unit: string): Promise<ApiResponse<PatientAssignment[]>> {
    await delay();
    const assignments: PatientAssignment[] = JSON.parse(localStorage.getItem(NURSE_ASSIGNMENTS_KEY) || '[]');
    return { success: true, data: assignments.filter(a => a.unit === unit) };
  },
  
  async create(assignment: PatientAssignment): Promise<ApiResponse<PatientAssignment>> {
    await delay();
    const assignments: PatientAssignment[] = JSON.parse(localStorage.getItem(NURSE_ASSIGNMENTS_KEY) || '[]');
    assignments.push(assignment);
    localStorage.setItem(NURSE_ASSIGNMENTS_KEY, JSON.stringify(assignments));
    return { success: true, data: assignment };
  },
  
  async update(assignmentId: string, updates: Partial<PatientAssignment>): Promise<ApiResponse<PatientAssignment>> {
    await delay();
    const assignments: PatientAssignment[] = JSON.parse(localStorage.getItem(NURSE_ASSIGNMENTS_KEY) || '[]');
    const index = assignments.findIndex(a => a.assignmentId === assignmentId);
    if (index === -1) return { success: false, error: 'Assignment not found' };
    
    assignments[index] = { ...assignments[index], ...updates };
    localStorage.setItem(NURSE_ASSIGNMENTS_KEY, JSON.stringify(assignments));
    return { success: true, data: assignments[index] };
  },
};

export const bedAssignmentsApi = {
  async getByUnit(unit: string): Promise<ApiResponse<BedAssignment[]>> {
    await delay();
    const beds: BedAssignment[] = JSON.parse(localStorage.getItem(BED_ASSIGNMENTS_KEY) || '[]');
    return { success: true, data: beds.filter(b => b.unit === unit) };
  },
  
  async updateStatus(bedId: string, status: BedAssignment['status']): Promise<ApiResponse<BedAssignment>> {
    await delay();
    const beds: BedAssignment[] = JSON.parse(localStorage.getItem(BED_ASSIGNMENTS_KEY) || '[]');
    const index = beds.findIndex(b => b.bedId === bedId);
    if (index === -1) return { success: false, error: 'Bed not found' };
    
    beds[index].status = status;
    localStorage.setItem(BED_ASSIGNMENTS_KEY, JSON.stringify(beds));
    return { success: true, data: beds[index] };
  },
};

export const patientFlowApi = {
  async getByPatient(patientId: string): Promise<ApiResponse<PatientFlowRecord | null>> {
    await delay();
    const flows: PatientFlowRecord[] = JSON.parse(localStorage.getItem(PATIENT_FLOW_KEY) || '[]');
    const flow = flows.find(f => f.patientId === patientId);
    return { success: true, data: flow || null };
  },
  
  async getByUnit(unit: string): Promise<ApiResponse<PatientFlowRecord[]>> {
    await delay();
    const flows: PatientFlowRecord[] = JSON.parse(localStorage.getItem(PATIENT_FLOW_KEY) || '[]');
    return { success: true, data: flows.filter(f => f.unit === unit) };
  },
  
  async updateState(
    flowId: string, 
    newState: PatientFlowRecord['currentState'],
    updatedBy: string,
    updatedByName: string,
    notes?: string
  ): Promise<ApiResponse<PatientFlowRecord>> {
    await delay();
    const flows: PatientFlowRecord[] = JSON.parse(localStorage.getItem(PATIENT_FLOW_KEY) || '[]');
    const index = flows.findIndex(f => f.flowId === flowId);
    if (index === -1) return { success: false, error: 'Flow record not found' };
    
    flows[index].currentState = newState;
    flows[index].stateHistory.push({
      state: newState,
      timestamp: new Date().toISOString(),
      updatedBy,
      updatedByName,
      notes,
    });
    
    localStorage.setItem(PATIENT_FLOW_KEY, JSON.stringify(flows));
    return { success: true, data: flows[index] };
  },
  
  async requestTransfer(
    flowId: string,
    transferRequest: PatientFlowRecord['pendingTransfer']
  ): Promise<ApiResponse<PatientFlowRecord>> {
    await delay();
    const flows: PatientFlowRecord[] = JSON.parse(localStorage.getItem(PATIENT_FLOW_KEY) || '[]');
    const index = flows.findIndex(f => f.flowId === flowId);
    if (index === -1) return { success: false, error: 'Flow record not found' };
    
    flows[index].pendingTransfer = transferRequest;
    localStorage.setItem(PATIENT_FLOW_KEY, JSON.stringify(flows));
    return { success: true, data: flows[index] };
  },
};

export const nurseTasksApi = {
  async getByNurse(nurseId: string): Promise<ApiResponse<NurseTask[]>> {
    await delay();
    const tasks: NurseTask[] = JSON.parse(localStorage.getItem(NURSE_TASKS_KEY) || '[]');
    return { success: true, data: tasks.filter(t => t.assignedTo === nurseId) };
  },
  
  async getByPatient(patientId: string): Promise<ApiResponse<NurseTask[]>> {
    await delay();
    const tasks: NurseTask[] = JSON.parse(localStorage.getItem(NURSE_TASKS_KEY) || '[]');
    return { success: true, data: tasks.filter(t => t.patientId === patientId) };
  },
  
  async create(task: NurseTask): Promise<ApiResponse<NurseTask>> {
    await delay();
    const tasks: NurseTask[] = JSON.parse(localStorage.getItem(NURSE_TASKS_KEY) || '[]');
    tasks.push(task);
    localStorage.setItem(NURSE_TASKS_KEY, JSON.stringify(tasks));
    return { success: true, data: task };
  },
  
  async updateStatus(
    taskId: string, 
    status: NurseTask['status'],
    completedBy?: string,
    notes?: string
  ): Promise<ApiResponse<NurseTask>> {
    await delay();
    const tasks: NurseTask[] = JSON.parse(localStorage.getItem(NURSE_TASKS_KEY) || '[]');
    const index = tasks.findIndex(t => t.taskId === taskId);
    if (index === -1) return { success: false, error: 'Task not found' };
    
    tasks[index].status = status;
    if (status === 'completed') {
      tasks[index].completedAt = new Date().toISOString();
      tasks[index].completedBy = completedBy;
    }
    if (notes) {
      tasks[index].notes = notes;
    }
    
    localStorage.setItem(NURSE_TASKS_KEY, JSON.stringify(tasks));
    return { success: true, data: tasks[index] };
  },
};

export const medicationAdministrationApi = {
  async getByNurse(nurseId: string, date?: string): Promise<ApiResponse<MedicationAdministration[]>> {
    await delay();
    const meds: MedicationAdministration[] = JSON.parse(localStorage.getItem(MEDICATION_ADMIN_KEY) || '[]');
    let filtered = meds.filter(m => m.administeredBy === nurseId || m.status === 'scheduled');
    
    if (date) {
      filtered = filtered.filter(m => m.scheduledTime.startsWith(date));
    }
    
    return { success: true, data: filtered };
  },
  
  async getByPatient(patientId: string, status?: MedicationAdministrationStatus): Promise<ApiResponse<MedicationAdministration[]>> {
    await delay();
    const meds: MedicationAdministration[] = JSON.parse(localStorage.getItem(MEDICATION_ADMIN_KEY) || '[]');
    let filtered = meds.filter(m => m.patientId === patientId);
    
    if (status) {
      filtered = filtered.filter(m => m.status === status);
    }
    
    return { success: true, data: filtered };
  },
  
  async administer(
    administrationId: string,
    administeredBy: string,
    administeredByName: string,
    details: {
      siteOfAdministration?: string;
      patientResponse?: string;
      witnessedBy?: string;
      barcodeScanned?: boolean;
    }
  ): Promise<ApiResponse<MedicationAdministration>> {
    await delay();
    const meds: MedicationAdministration[] = JSON.parse(localStorage.getItem(MEDICATION_ADMIN_KEY) || '[]');
    const index = meds.findIndex(m => m.administrationId === administrationId);
    if (index === -1) return { success: false, error: 'Medication administration record not found' };
    
    meds[index].status = 'administered';
    meds[index].administeredAt = new Date().toISOString();
    meds[index].administeredBy = administeredBy;
    meds[index].administeredByName = administeredByName;
    meds[index].siteOfAdministration = details.siteOfAdministration;
    meds[index].patientResponse = details.patientResponse;
    meds[index].witnessedBy = details.witnessedBy;
    meds[index].barcodeScanned = details.barcodeScanned;
    if (details.barcodeScanned) {
      meds[index].scannedAt = new Date().toISOString();
    }
    
    localStorage.setItem(MEDICATION_ADMIN_KEY, JSON.stringify(meds));
    return { success: true, data: meds[index] };
  },
  
  async refuse(
    administrationId: string,
    reason: string,
    reasonDetails?: string
  ): Promise<ApiResponse<MedicationAdministration>> {
    await delay();
    const meds: MedicationAdministration[] = JSON.parse(localStorage.getItem(MEDICATION_ADMIN_KEY) || '[]');
    const index = meds.findIndex(m => m.administrationId === administrationId);
    if (index === -1) return { success: false, error: 'Medication administration record not found' };
    
    meds[index].status = 'refused';
    meds[index].reason = reason;
    meds[index].reasonDetails = reasonDetails;
    
    localStorage.setItem(MEDICATION_ADMIN_KEY, JSON.stringify(meds));
    return { success: true, data: meds[index] };
  },
  
  async hold(
    administrationId: string,
    reason: string,
    reasonDetails?: string
  ): Promise<ApiResponse<MedicationAdministration>> {
    await delay();
    const meds: MedicationAdministration[] = JSON.parse(localStorage.getItem(MEDICATION_ADMIN_KEY) || '[]');
    const index = meds.findIndex(m => m.administrationId === administrationId);
    if (index === -1) return { success: false, error: 'Medication administration record not found' };
    
    meds[index].status = 'held';
    meds[index].reason = reason;
    meds[index].reasonDetails = reasonDetails;
    
    localStorage.setItem(MEDICATION_ADMIN_KEY, JSON.stringify(meds));
    return { success: true, data: meds[index] };
  },
};

// Provider Workflow APIs
export const patientMessagesApi = {
  async getByProvider(providerId: string): Promise<ApiResponse<PatientMessage[]>> {
    await delay();
    const messages: PatientMessage[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PATIENT_MESSAGES) || '[]'
    );
    // In a real app, filter by provider. For now, return all
    return { success: true, data: messages };
  },

  async getUnread(providerId: string): Promise<ApiResponse<PatientMessage[]>> {
    await delay();
    const messages: PatientMessage[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PATIENT_MESSAGES) || '[]'
    );
    return { success: true, data: messages.filter((m) => m.status === 'unread') };
  },

  async markRead(messageId: string): Promise<ApiResponse<PatientMessage>> {
    await delay();
    const messages: PatientMessage[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PATIENT_MESSAGES) || '[]'
    );
    const index = messages.findIndex((m) => m.messageId === messageId);
    if (index === -1) return { success: false, error: 'Message not found' };

    messages[index].status = 'read';
    localStorage.setItem(STORAGE_KEYS.PATIENT_MESSAGES, JSON.stringify(messages));
    return { success: true, data: messages[index] };
  },

  async respond(
    messageId: string,
    response: string,
    respondedBy: string
  ): Promise<ApiResponse<PatientMessage>> {
    await delay();
    const messages: PatientMessage[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PATIENT_MESSAGES) || '[]'
    );
    const index = messages.findIndex((m) => m.messageId === messageId);
    if (index === -1) return { success: false, error: 'Message not found' };

    messages[index].status = 'responded';
    messages[index].response = response;
    messages[index].respondedAt = new Date().toISOString();
    messages[index].respondedBy = respondedBy;
    localStorage.setItem(STORAGE_KEYS.PATIENT_MESSAGES, JSON.stringify(messages));
    return { success: true, data: messages[index] };
  },
};

export const consultationRequestsApi = {
  async getByProvider(providerId: string): Promise<ApiResponse<ConsultationRequest[]>> {
    await delay();
    const requests: ConsultationRequest[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CONSULTATION_REQUESTS) || '[]'
    );
    // In a real app, filter by consulting provider. For now, return all
    return { success: true, data: requests };
  },

  async getPending(providerId: string): Promise<ApiResponse<ConsultationRequest[]>> {
    await delay();
    const requests: ConsultationRequest[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CONSULTATION_REQUESTS) || '[]'
    );
    return { success: true, data: requests.filter((r) => r.status === 'pending') };
  },

  async accept(
    requestId: string,
    acceptedBy: string
  ): Promise<ApiResponse<ConsultationRequest>> {
    await delay();
    const requests: ConsultationRequest[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CONSULTATION_REQUESTS) || '[]'
    );
    const index = requests.findIndex((r) => r.requestId === requestId);
    if (index === -1) return { success: false, error: 'Request not found' };

    requests[index].status = 'accepted';
    requests[index].acceptedAt = new Date().toISOString();
    requests[index].acceptedBy = acceptedBy;
    localStorage.setItem(STORAGE_KEYS.CONSULTATION_REQUESTS, JSON.stringify(requests));
    return { success: true, data: requests[index] };
  },

  async complete(
    requestId: string,
    consultNote: string,
    recommendations: string
  ): Promise<ApiResponse<ConsultationRequest>> {
    await delay();
    const requests: ConsultationRequest[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CONSULTATION_REQUESTS) || '[]'
    );
    const index = requests.findIndex((r) => r.requestId === requestId);
    if (index === -1) return { success: false, error: 'Request not found' };

    requests[index].status = 'completed';
    requests[index].completedAt = new Date().toISOString();
    requests[index].consultNote = consultNote;
    requests[index].recommendations = recommendations;
    localStorage.setItem(STORAGE_KEYS.CONSULTATION_REQUESTS, JSON.stringify(requests));
    return { success: true, data: requests[index] };
  },

  async decline(requestId: string): Promise<ApiResponse<ConsultationRequest>> {
    await delay();
    const requests: ConsultationRequest[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CONSULTATION_REQUESTS) || '[]'
    );
    const index = requests.findIndex((r) => r.requestId === requestId);
    if (index === -1) return { success: false, error: 'Request not found' };

    requests[index].status = 'declined';
    localStorage.setItem(STORAGE_KEYS.CONSULTATION_REQUESTS, JSON.stringify(requests));
    return { success: true, data: requests[index] };
  },
};

// Initialize storage on module load
initializeStorage();
