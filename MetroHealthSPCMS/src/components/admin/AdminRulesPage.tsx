import { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Edit2, Save, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { defaultAlertRules, type AlertRule, type AlertSeverity, type AlertType } from '@/lib/alertRules';

export function AdminRulesPage() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
  const [editingRule, setEditingRule] = useState<Partial<AlertRule>>({});

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = () => {
    const storedRules = localStorage.getItem('alertRules');
    if (storedRules) {
      setRules(JSON.parse(storedRules));
    } else {
      // Initialize with default rules
      setRules(defaultAlertRules);
      localStorage.setItem('alertRules', JSON.stringify(defaultAlertRules));
    }
  };

  const saveRules = (updatedRules: AlertRule[]) => {
    setRules(updatedRules);
    localStorage.setItem('alertRules', JSON.stringify(updatedRules));
  };

  const toggleRuleEnabled = (ruleId: string) => {
    const updatedRules = rules.map((rule) =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );
    saveRules(updatedRules);
  };

  const deleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      const updatedRules = rules.filter((rule) => rule.id !== ruleId);
      saveRules(updatedRules);
    }
  };

  const openAddDialog = () => {
    setEditingRule({
      id: `custom-${Date.now()}`,
      name: '',
      description: '',
      type: 'custom',
      severity: 'warning',
      enabled: true,
    });
    setDialogMode('add');
  };

  const openEditDialog = (rule: AlertRule) => {
    setSelectedRule(rule);
    setEditingRule({ ...rule });
    setDialogMode('edit');
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedRule(null);
    setEditingRule({});
  };

  const saveRule = () => {
    if (!editingRule.name || !editingRule.description) {
      alert('Please fill in all required fields');
      return;
    }

    let updatedRules: AlertRule[];

    if (dialogMode === 'add') {
      // For custom rules added via UI, we create a simple always-true evaluation
      const newRule: AlertRule = {
        id: editingRule.id!,
        name: editingRule.name,
        description: editingRule.description,
        type: editingRule.type as AlertType,
        severity: editingRule.severity as AlertSeverity,
        enabled: editingRule.enabled ?? true,
        evaluate: () => false, // Custom rules from UI won't auto-trigger
        message: () => editingRule.description || '',
      };
      updatedRules = [...rules, newRule];
    } else {
      updatedRules = rules.map((rule) =>
        rule.id === selectedRule?.id
          ? {
              ...rule,
              name: editingRule.name!,
              description: editingRule.description!,
              type: editingRule.type as AlertType,
              severity: editingRule.severity as AlertSeverity,
            }
          : rule
      );
    }

    saveRules(updatedRules);
    closeDialog();
  };

  const resetToDefaults = () => {
    if (confirm('Reset all rules to defaults? This will remove any custom rules you\'ve created.')) {
      saveRules(defaultAlertRules);
    }
  };

  const getRulesByType = (type: AlertType) => {
    return rules.filter((rule) => rule.type === type);
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

  const RuleCard = ({ rule }: { rule: AlertRule }) => (
    <Card className={!rule.enabled ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{rule.name}</h3>
              {getSeverityBadge(rule.severity)}
              {rule.enabled ? (
                <Badge className="bg-green-100 text-green-800 border-green-300">Enabled</Badge>
              ) : (
                <Badge variant="outline">Disabled</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
            <div className="text-xs text-muted-foreground">
              Rule ID: {rule.id}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleRuleEnabled(rule.id)}
              title={rule.enabled ? 'Disable rule' : 'Enable rule'}
            >
              {rule.enabled ? (
                <ToggleRight className="h-5 w-5 text-green-600" />
              ) : (
                <ToggleLeft className="h-5 w-5" />
              )}
            </Button>
            
            {rule.type === 'custom' && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(rule)}
                  title="Edit rule"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteRule(rule.id)}
                  title="Delete rule"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const stats = {
    total: rules.length,
    enabled: rules.filter((r) => r.enabled).length,
    disabled: rules.filter((r) => !r.enabled).length,
    critical: rules.filter((r) => r.severity === 'critical').length,
    vital: rules.filter((r) => r.type === 'vital').length,
    sirs: rules.filter((r) => r.type === 'sirs').length,
    ews: rules.filter((r) => r.type === 'ews').length,
    custom: rules.filter((r) => r.type === 'custom').length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Clinical Alert Rules Configuration
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage SIRS, EWS, and custom clinical decision support rules
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Rule
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.enabled} enabled, {stats.disabled} disabled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vital Sign Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vital}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clinical Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sirs + stats.ews}</div>
            <p className="text-xs text-muted-foreground">
              {stats.sirs} SIRS, {stats.ews} EWS
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Custom Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.custom}</div>
          </CardContent>
        </Card>
      </div>

      {/* Rules Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Rules ({stats.total})</TabsTrigger>
          <TabsTrigger value="vital">Vital Signs ({stats.vital})</TabsTrigger>
          <TabsTrigger value="sirs">SIRS ({stats.sirs})</TabsTrigger>
          <TabsTrigger value="ews">EWS ({stats.ews})</TabsTrigger>
          <TabsTrigger value="custom">Custom ({stats.custom})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {rules.map((rule) => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
        </TabsContent>

        <TabsContent value="vital" className="space-y-3">
          {getRulesByType('vital').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No vital sign rules configured.
              </CardContent>
            </Card>
          ) : (
            getRulesByType('vital').map((rule) => <RuleCard key={rule.id} rule={rule} />)
          )}
        </TabsContent>

        <TabsContent value="sirs" className="space-y-3">
          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle>SIRS (Systemic Inflammatory Response Syndrome)</CardTitle>
              <CardDescription>
                Triggered when 2 or more criteria are met:
                <ul className="list-disc list-inside mt-2">
                  <li>Temperature &gt;38°C or &lt;36°C</li>
                  <li>Heart rate &gt;90 bpm</li>
                  <li>Respiratory rate &gt;20 breaths/min</li>
                  <li>WBC &gt;12,000 or &lt;4,000 cells/mm³ (if implemented)</li>
                </ul>
              </CardDescription>
            </CardHeader>
          </Card>
          {getRulesByType('sirs').map((rule) => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
        </TabsContent>

        <TabsContent value="ews" className="space-y-3">
          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle>EWS (Early Warning Score)</CardTitle>
              <CardDescription>
                Composite score based on vital sign deviations. Alert triggers when score ≥5.
                <div className="mt-2 text-sm">
                  <p className="font-medium">Scoring:</p>
                  <ul className="list-disc list-inside">
                    <li>HR: &lt;40 or &gt;130 = 3pts, 40-50 or 110-130 = 1pt</li>
                    <li>RR: &lt;8 or &gt;25 = 3pts, 8-11 or 21-24 = 1pt</li>
                    <li>Temp: &lt;35 or &gt;39 = 3pts, 35-36 or 38-39 = 1pt</li>
                    <li>SpO2: &lt;90 = 3pts, 90-93 = 2pts, 93-95 = 1pt</li>
                    <li>SBP: &lt;90 or &gt;220 = 3pts, 90-100 or 200-220 = 2pts</li>
                  </ul>
                </div>
              </CardDescription>
            </CardHeader>
          </Card>
          {getRulesByType('ews').map((rule) => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
        </TabsContent>

        <TabsContent value="custom" className="space-y-3">
          {getRulesByType('custom').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No custom rules configured.</p>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Rule
                </Button>
              </CardContent>
            </Card>
          ) : (
            getRulesByType('custom').map((rule) => <RuleCard key={rule.id} rule={rule} />)
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogMode !== null} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'add' ? 'Add Custom Rule' : 'Edit Rule'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'add'
                ? 'Create a new custom clinical alert rule'
                : 'Modify the rule configuration'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rule Name *</label>
              <Input
                value={editingRule.name || ''}
                onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                placeholder="e.g., Prolonged Tachycardia"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description *</label>
              <Textarea
                value={editingRule.description || ''}
                onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                placeholder="Describe when this rule should trigger..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Severity *</label>
                <Select
                  value={editingRule.severity}
                  onValueChange={(value) => setEditingRule({ ...editingRule, severity: value as AlertSeverity })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={editingRule.enabled ?? true}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingRule({ ...editingRule, enabled: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="enabled" className="text-sm font-medium">
                  Enable rule immediately
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={saveRule}>
              <Save className="h-4 w-4 mr-2" />
              {dialogMode === 'add' ? 'Create Rule' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
