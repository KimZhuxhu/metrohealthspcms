import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { nurseAssignmentsApi, nurseTasksApi, alertApi, medicationAdministrationApi } from '@/lib/api';
import type { PatientAssignment, NurseTask, Alert, MedicationAdministration } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  AlertCircle, 
  ClipboardList, 
  Activity, 
  Pill, 
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Building2
} from 'lucide-react';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function NurseDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<PatientAssignment[]>([]);
  const [tasks, setTasks] = useState<NurseTask[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [medications, setMedications] = useState<MedicationAdministration[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const [assignmentsRes, tasksRes, alertsRes, medsRes] = await Promise.all([
        nurseAssignmentsApi.getByNurse(user.userId),
        nurseTasksApi.getByNurse(user.userId),
        alertApi.getAll(),
        medicationAdministrationApi.getByNurse(user.userId, format(new Date(), 'yyyy-MM-dd')),
      ]);

      if (assignmentsRes.success && assignmentsRes.data) {
        setAssignments(assignmentsRes.data);
      }
      if (tasksRes.success && tasksRes.data) {
        setTasks(tasksRes.data);
      }
      if (alertsRes.success && alertsRes.data) {
        // Filter alerts for assigned patients
        const assignedPatientIds = assignmentsRes.data?.map((a: PatientAssignment) => a.patientId) || [];
        setAlerts(alertsRes.data.filter((a: Alert) => assignedPatientIds.includes(a.patientId) && !a.acknowledgedAt));
      }
      if (medsRes.success && medsRes.data) {
        setMedications(medsRes.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    if (!user) return;
    const res = await alertApi.acknowledge(alertId, user.userId);
    if (res.success) {
      loadDashboardData();
    }
  };

  const getAcuityColor = (acuity: PatientAssignment['acuityLevel']) => {
    switch (acuity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTaskPriorityColor = (priority: NurseTask['priority']) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const isOverdue = (dueAt: string) => {
    return new Date(dueAt) < new Date();
  };

  const isMedicationDueNow = (_scheduledTime: string, timeWindow: { start: string; end: string }) => {
    const now = new Date();
    return isWithinInterval(now, {
      start: parseISO(timeWindow.start),
      end: parseISO(timeWindow.end),
    });
  };

  const filteredAssignments = selectedUnit === 'all' 
    ? assignments 
    : assignments.filter(a => a.unit === selectedUnit);

  const units = Array.from(new Set(assignments.map(a => a.unit)));

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.acknowledgedAt);
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const overdueTasks = pendingTasks.filter(t => isOverdue(t.dueAt));
  const dueMedications = medications.filter(m => 
    m.status === 'scheduled' && 
    isMedicationDueNow(m.scheduledTime, m.timeWindow)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nurse Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name} • {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/nurse/patient-flow')} variant="outline">
            <ArrowRight className="h-4 w-4 mr-2" />
            Patient Flow
          </Button>
          <Button onClick={() => navigate('/nurse/mar')} variant="outline">
            <Pill className="h-4 w-4 mr-2" />
            MAR
          </Button>
          <Button onClick={() => navigate('/nurse/vitals-entry')} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Quick Vitals
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAssignments.length}</div>
            <p className="text-xs text-muted-foreground">
              {assignments.filter(a => a.acuityLevel === 'critical' || a.acuityLevel === 'high').length} high acuity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {overdueTasks.length} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medications Due</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueMedications.length}</div>
            <p className="text-xs text-muted-foreground">
              Within time window
            </p>
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

      <Tabs defaultValue="patients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patients">My Patients</TabsTrigger>
          <TabsTrigger value="alerts">
            Active Alerts
            {criticalAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">{criticalAlerts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks
            {overdueTasks.length > 0 && (
              <Badge variant="destructive" className="ml-2">{overdueTasks.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="medications">
            Medications
            {dueMedications.length > 0 && (
              <Badge variant="default" className="ml-2">{dueMedications.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* My Patients Tab */}
        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Patients</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAssignments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No patient assignments</p>
              ) : (
                <div className="space-y-3">
                  {filteredAssignments
                    .sort((a, b) => {
                      const acuityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                      return acuityOrder[a.acuityLevel] - acuityOrder[b.acuityLevel];
                    })
                    .map(assignment => (
                      <div
                        key={assignment.assignmentId}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => navigate(`/patients/${assignment.patientId}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-12 rounded ${getAcuityColor(assignment.acuityLevel)}`} />
                          <div>
                            <div className="font-semibold">{assignment.patientName}</div>
                            <div className="text-sm text-muted-foreground">
                              MRN: {assignment.patientMRN} • Room: {assignment.room}-{assignment.bed}
                            </div>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">{assignment.unit}</Badge>
                              <Badge variant={assignment.isPrimary ? 'default' : 'secondary'}>
                                {assignment.isPrimary ? 'Primary' : 'Secondary'}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {assignment.acuityLevel} Acuity
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts for Assigned Patients</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.filter(a => !a.acknowledgedAt).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No active alerts</p>
              ) : (
                <div className="space-y-3">
                  {alerts
                    .filter(a => !a.acknowledgedAt)
                    .sort((a, b) => {
                      const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
                      return (severityOrder[a.severity] || 5) - (severityOrder[b.severity] || 5);
                    })
                    .map(alert => {
                      const assignment = assignments.find(a => a.patientId === alert.patientId);
                      return (
                        <div key={alert.alertId} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                                  {alert.severity.toUpperCase()}
                                </Badge>
                                <Badge variant="outline">{alert.type}</Badge>
                                <span className="text-sm font-semibold">
                                  {assignment?.patientName || 'Unknown Patient'}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  Room {assignment?.room}
                                </span>
                              </div>
                              <div className="text-sm font-medium">{alert.message}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {format(new Date(alert.timestamp), 'h:mm a')}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAcknowledgeAlert(alert.alertId)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Acknowledge
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending tasks</p>
              ) : (
                <div className="space-y-3">
                  {pendingTasks
                    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
                    .map(task => {
                      const overdue = isOverdue(task.dueAt);
                      return (
                        <div key={task.taskId} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={getTaskPriorityColor(task.priority)}>
                                  {task.priority.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {task.taskType.replace('_', ' ')}
                                </Badge>
                                <span className="text-sm font-semibold">{task.patientName}</span>
                                <span className="text-sm text-muted-foreground">Room {task.room}</span>
                              </div>
                              <div className="text-sm font-medium">{task.title}</div>
                              {task.description && (
                                <div className="text-sm text-muted-foreground mt-1">{task.description}</div>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                {overdue ? (
                                  <div className="flex items-center text-red-600 text-xs">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Overdue by {Math.floor((Date.now() - new Date(task.dueAt).getTime()) / 60000)} minutes
                                  </div>
                                ) : (
                                  <div className="flex items-center text-muted-foreground text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Due {format(new Date(task.dueAt), 'h:mm a')}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                nurseTasksApi.updateStatus(task.taskId, 'completed', user?.userId);
                                loadDashboardData();
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medications Due</CardTitle>
            </CardHeader>
            <CardContent>
              {dueMedications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No medications due now</p>
              ) : (
                <div className="space-y-3">
                  {dueMedications.map(med => (
                    <div key={med.administrationId} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold">{med.patientName}</span>
                            <span className="text-sm text-muted-foreground">Room {med.room}</span>
                            <Badge variant="outline">{format(parseISO(med.scheduledTime), 'h:mm a')}</Badge>
                          </div>
                          <div className="font-medium">{med.medicationName}</div>
                          <div className="text-sm text-muted-foreground">
                            {med.dose} • {med.route} • {med.frequency}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => navigate('/nurse/mar')}
                        >
                          <Pill className="h-4 w-4 mr-2" />
                          Administer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
