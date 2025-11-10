import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/components/LoginPage';
import { DashboardPage } from '@/components/DashboardPage';
import { PatientDashboard } from '@/components/dashboards/PatientDashboard';
import { NurseDashboard } from '@/components/dashboards/NurseDashboard';
import { ProviderPatientStatus } from '@/components/dashboards/ProviderPatientStatus';
import { SystemAdminDashboard } from '@/components/dashboards/SystemAdminDashboard';
import { PatientAppointmentScheduler } from '@/components/appointments/PatientAppointmentScheduler';
import { MyAppointments } from '@/components/appointments/MyAppointments';
import { AppointmentManagement } from '@/components/appointments/AppointmentManagement';
import { PatientCheckIn } from '@/components/appointments/PatientCheckIn';
import { PatientList } from '@/components/patients/PatientList';
import { PatientDetail } from '@/components/patients/PatientDetail';
import { CareTeamManagement } from '@/components/patients/CareTeamManagement';
import { VitalsMonitoring } from '@/components/vitals/VitalsMonitoring';
import { AlertsList } from '@/components/alerts/AlertsList';
import { AdminRulesPage } from '@/components/admin/AdminRulesPage';
import { EncounterPageSOAP } from '@/components/encounters/EncounterPageSOAP';
import NurseDashboardNew from '@/components/nurse/NurseDashboard';
import NursePatientFlow from '@/components/nurse/NursePatientFlow';
import MedicationAdministrationRecord from '@/components/nurse/MedicationAdministrationRecord';
import QuickVitalsEntry from '@/components/nurse/QuickVitalsEntry';
import VersionControl from '@/components/admin/VersionControl';
import ProviderPatientStatusNew from '@/components/provider/ProviderPatientStatus';
import ClinicalInbox from '@/components/provider/ClinicalInbox';
import OrderReview from '@/components/provider/OrderReview';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Generic Dashboard - redirects to role-specific dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Role-Specific Dashboards */}
          <Route
            path="/dashboard/patient"
            element={
              <ProtectedRoute requiredRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/nurse"
            element={
              <ProtectedRoute requiredRoles={['nurse', 'charge_nurse']}>
                <NurseDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/provider"
            element={
              <ProtectedRoute requiredRoles={['provider']}>
                <ProviderPatientStatus />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <SystemAdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <ComingSoon title="Appointments" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments/management"
            element={
              <ProtectedRoute requiredRoles={['admin', 'nurse', 'charge_nurse', 'provider']}>
                <AppointmentManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments/check-in"
            element={
              <ProtectedRoute requiredRoles={['admin', 'nurse', 'charge_nurse']}>
                <PatientCheckIn />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments/schedule"
            element={
              <ProtectedRoute requiredRoles={['patient']}>
                <PatientAppointmentScheduler />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments/my-appointments"
            element={
              <ProtectedRoute requiredRoles={['patient']}>
                <MyAppointments />
              </ProtectedRoute>
            }
          />

          {/* Patient Management Routes */}
          <Route
            path="/patients"
            element={
              <ProtectedRoute requiredRoles={['admin', 'nurse', 'charge_nurse', 'provider']}>
                <PatientList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patients/:patientId"
            element={
              <ProtectedRoute>
                <PatientDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patients/:patientId/care-team"
            element={
              <ProtectedRoute requiredRoles={['admin', 'nurse', 'charge_nurse', 'provider']}>
                <CareTeamManagement />
              </ProtectedRoute>
            }
          />

          {/* Encounters & Clinical Documentation Routes */}
          <Route
            path="/encounters/:encounterId"
            element={
              <ProtectedRoute requiredRoles={['admin', 'nurse', 'charge_nurse', 'provider']}>
                <EncounterPageSOAP />
              </ProtectedRoute>
            }
          />

          {/* Vitals & Alerts Routes */}
          <Route
            path="/vitals/:patientId"
            element={
              <ProtectedRoute requiredRoles={['admin', 'nurse', 'charge_nurse', 'provider']}>
                <VitalsMonitoring />
              </ProtectedRoute>
            }
          />

          <Route
            path="/alerts"
            element={
              <ProtectedRoute requiredRoles={['admin', 'nurse', 'charge_nurse', 'provider']}>
                <AlertsList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/alerts/:patientId"
            element={
              <ProtectedRoute requiredRoles={['admin', 'nurse', 'charge_nurse', 'provider']}>
                <AlertsList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/rules"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminRulesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/version-control"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <VersionControl />
              </ProtectedRoute>
            }
          />

          {/* Nurse Workflow Routes */}
          <Route
            path="/nurse/dashboard"
            element={
              <ProtectedRoute requiredRoles={['nurse', 'charge_nurse']}>
                <NurseDashboardNew />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nurse/patient-flow"
            element={
              <ProtectedRoute requiredRoles={['nurse', 'charge_nurse']}>
                <NursePatientFlow />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nurse/mar"
            element={
              <ProtectedRoute requiredRoles={['nurse', 'charge_nurse']}>
                <MedicationAdministrationRecord />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nurse/vitals-entry"
            element={
              <ProtectedRoute requiredRoles={['nurse', 'charge_nurse']}>
                <QuickVitalsEntry />
              </ProtectedRoute>
            }
          />

          {/* Provider Routes */}
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute requiredRoles={['provider']}>
                <ProviderPatientStatusNew />
              </ProtectedRoute>
            }
          />

          <Route
            path="/provider/inbox"
            element={
              <ProtectedRoute requiredRoles={['provider']}>
                <ClinicalInbox />
              </ProtectedRoute>
            }
          />

          <Route
            path="/provider/orders"
            element={
              <ProtectedRoute requiredRoles={['provider']}>
                <OrderReview />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vitals"
            element={
              <ProtectedRoute requiredRoles={['admin', 'nurse', 'charge_nurse', 'provider']}>
                <ComingSoon title="Vitals & Alerts" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notes"
            element={
              <ProtectedRoute requiredRoles={['admin', 'nurse', 'charge_nurse', 'provider']}>
                <ComingSoon title="Clinical Notes" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <ComingSoon title="Settings" />
              </ProtectedRoute>
            }
          />

          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// Temporary placeholder components
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="text-muted-foreground">This feature is under development</p>
        <a href="/dashboard" className="inline-block text-primary hover:underline">
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}

function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-destructive">Unauthorized</h1>
        <p className="text-muted-foreground">You don't have permission to access this page</p>
        <a href="/dashboard" className="inline-block text-primary hover:underline">
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">Page not found</p>
        <a href="/dashboard" className="inline-block text-primary hover:underline">
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}

export default App;
