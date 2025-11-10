import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, Bell, CheckCircle, AlertTriangle, Info, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Alert, AlertSeverity, AlertType } from '@/lib/alertRules';
import { format } from 'date-fns';

interface AlertsListProps {
  patientId?: string; // If provided, show only alerts for this patient
}

export function AlertsList({ patientId: propPatientId }: AlertsListProps) {
  const { patientId: routePatientId } = useParams<{ patientId: string }>();
  const patientId = propPatientId || routePatientId;
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('active');
  const [severityFilter, setSeverityFilter] = useState<'all' | AlertSeverity>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | AlertType>('all');

  // Dialog state
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [dialogMode, setDialogMode] = useState<'acknowledge' | 'resolve' | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadAlerts();
  }, [patientId]);

  useEffect(() => {
    applyFilters();
  }, [alerts, statusFilter, severityFilter, typeFilter]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      // Load alerts from localStorage
      const storedAlerts = localStorage.getItem('alerts');
      let allAlerts: Alert[] = storedAlerts ? JSON.parse(storedAlerts) : [];

      // Filter by patient if patientId is provided
      if (patientId) {
        allAlerts = allAlerts.filter((alert) => alert.patientId === patientId);
      }

      // Sort by timestamp (newest first)
      allAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setAlerts(allAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...alerts];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((alert) => alert.status === statusFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter((alert) => alert.severity === severityFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((alert) => alert.type === typeFilter);
    }

    setFilteredAlerts(filtered);
  };

  const updateAlert = (alertId: string, updates: Partial<Alert>) => {
    const updatedAlerts = alerts.map((alert) =>
      alert.id === alertId ? { ...alert, ...updates } : alert
    );
    
    setAlerts(updatedAlerts);
    localStorage.setItem('alerts', JSON.stringify(updatedAlerts));
  };

  const handleAcknowledge = (alert: Alert) => {
    setSelectedAlert(alert);
    setDialogMode('acknowledge');
    setNotes('');
  };

  const handleResolve = (alert: Alert) => {
    setSelectedAlert(alert);
    setDialogMode('resolve');
    setNotes('');
  };

  const confirmAction = () => {
    if (!selectedAlert || !dialogMode) return;

    const timestamp = new Date().toISOString();
    const userName = user?.name || 'Unknown User';

    if (dialogMode === 'acknowledge') {
      updateAlert(selectedAlert.id, {
        status: 'acknowledged',
        acknowledgedBy: userName,
        acknowledgedAt: timestamp,
        notes: notes || selectedAlert.notes,
      });
    } else if (dialogMode === 'resolve') {
      updateAlert(selectedAlert.id, {
        status: 'resolved',
        resolvedBy: userName,
        resolvedAt: timestamp,
        notes: notes || selectedAlert.notes,
      });
    }

    setSelectedAlert(null);
    setDialogMode(null);
    setNotes('');
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Warning</Badge>;
      case 'info':
        return <Badge variant="secondary">Info</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: Alert['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Active</Badge>;
      case 'acknowledged':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Acknowledged</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Resolved</Badge>;
    }
  };

  const getTypeBadge = (type: AlertType) => {
    const labels: Record<AlertType, string> = {
      vital: 'Vital Sign',
      sirs: 'SIRS',
      ews: 'EWS',
      custom: 'Custom Rule',
    };
    return <Badge variant="outline">{labels[type]}</Badge>;
  };

  const stats = {
    total: filteredAlerts.length,
    active: filteredAlerts.filter((a) => a.status === 'active').length,
    acknowledged: filteredAlerts.filter((a) => a.status === 'acknowledged').length,
    critical: filteredAlerts.filter((a) => a.severity === 'critical' && a.status === 'active').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Loading alerts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Acknowledged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.acknowledged}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Severity</label>
              <Select value={severityFilter} onValueChange={(value: any) => setSeverityFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="vital">Vital Sign</SelectItem>
                  <SelectItem value="sirs">SIRS</SelectItem>
                  <SelectItem value="ews">EWS</SelectItem>
                  <SelectItem value="custom">Custom Rule</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No alerts found matching the current filters.
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`${
                alert.status === 'active' && alert.severity === 'critical'
                  ? 'border-red-500 border-2'
                  : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSeverityBadge(alert.severity)}
                        {getTypeBadge(alert.type)}
                        {getStatusBadge(alert.status)}
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{alert.ruleName}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm')}
                        </span>
                        {alert.acknowledgedBy && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Acknowledged by {alert.acknowledgedBy}
                          </span>
                        )}
                        {alert.resolvedBy && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Resolved by {alert.resolvedBy}
                          </span>
                        )}
                      </div>

                      {alert.notes && (
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          <p className="font-medium mb-1">Notes:</p>
                          <p>{alert.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {alert.status === 'active' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledge(alert)}
                        >
                          Acknowledge
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleResolve(alert)}
                        >
                          Resolve
                        </Button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleResolve(alert)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Action Dialog */}
      <Dialog open={dialogMode !== null} onOpenChange={() => setDialogMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'acknowledge' ? 'Acknowledge Alert' : 'Resolve Alert'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'acknowledge'
                ? 'Acknowledge that you have seen this alert. Add optional notes.'
                : 'Mark this alert as resolved. Add optional resolution notes.'}
            </DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded">
                <p className="font-semibold">{selectedAlert.ruleName}</p>
                <p className="text-sm text-muted-foreground">{selectedAlert.message}</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any relevant notes..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>
              Cancel
            </Button>
            <Button onClick={confirmAction}>
              {dialogMode === 'acknowledge' ? 'Acknowledge' : 'Resolve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
