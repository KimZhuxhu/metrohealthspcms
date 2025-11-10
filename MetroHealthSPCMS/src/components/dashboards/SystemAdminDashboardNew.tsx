import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Users,
  Activity,
  FileText,
  Shield,
  BarChart3,
  Building2,
  Bed,
  Clock,
  TrendingUp,
  AlertTriangle,
  Database,
  Server,
  Wifi,
  HardDrive,
  Eye,
  DollarSign,
  CheckCircle2,
  Pill,
  TestTube,
  Stethoscope,
  Heart,
} from 'lucide-react';

export function SystemAdminDashboardNew() {
  const { user, logout } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  // Mock data for department capacity
  const departmentMetrics = [
    {
      id: 'emergency',
      name: 'Emergency Department',
      currentCensus: 42,
      capacity: 50,
      avgWaitTime: 23,
      avgLOS: 4.2,
      status: 'normal',
    },
    {
      id: 'icu',
      name: 'Intensive Care Unit',
      currentCensus: 18,
      capacity: 20,
      avgWaitTime: 0,
      avgLOS: 5.8,
      status: 'warning',
    },
    {
      id: 'medical',
      name: 'Medical Ward',
      currentCensus: 87,
      capacity: 100,
      avgWaitTime: 12,
      avgLOS: 6.5,
      status: 'normal',
    },
    {
      id: 'surgical',
      name: 'Surgical Ward',
      currentCensus: 65,
      capacity: 75,
      avgWaitTime: 8,
      avgLOS: 7.2,
      status: 'normal',
    },
    {
      id: 'pediatrics',
      name: 'Pediatrics',
      currentCensus: 32,
      capacity: 40,
      avgWaitTime: 15,
      avgLOS: 3.9,
      status: 'normal',
    },
    {
      id: 'maternity',
      name: 'Maternity',
      currentCensus: 24,
      capacity: 25,
      avgWaitTime: 5,
      avgLOS: 2.8,
      status: 'critical',
    },
  ];

  // Mock quality metrics
  const qualityMetrics = [
    { metric: 'Hand Hygiene Compliance', value: 94.2, target: 95, unit: '%', status: 'warning' },
    { metric: 'Medication Error Rate', value: 0.8, target: 1.0, unit: 'per 1000', status: 'good' },
    { metric: 'Fall Prevention Compliance', value: 97.5, target: 95, unit: '%', status: 'good' },
    { metric: 'Patient Satisfaction', value: 88.3, target: 90, unit: '%', status: 'warning' },
    { metric: 'Readmission Rate (30-day)', value: 12.4, target: 15, unit: '%', status: 'good' },
    { metric: 'Sepsis Bundle Compliance', value: 91.7, target: 90, unit: '%', status: 'good' },
  ];

  // Mock system status
  const systemStatus = [
    { system: 'EHR Database', status: 'online', uptime: 99.8, latency: 45 },
    { system: 'Medication System', status: 'online', uptime: 99.9, latency: 32 },
    { system: 'Lab Interface', status: 'online', uptime: 98.5, latency: 78 },
    { system: 'Imaging PACS', status: 'degraded', uptime: 97.2, latency: 156 },
    { system: 'Billing System', status: 'online', uptime: 99.5, latency: 52 },
    { system: 'Backup Server', status: 'online', uptime: 100, latency: 12 },
  ];

  // Mock clinical oversight data
  const oversightData = {
    medications: {
      administered: 1247,
      missed: 23,
      delayed: 56,
      errors: 3,
    },
    labs: {
      ordered: 432,
      completed: 389,
      pending: 43,
      critical: 12,
    },
    imaging: {
      ordered: 156,
      completed: 134,
      pending: 22,
      urgent: 8,
    },
    vitals: {
      recorded: 3421,
      alerts: 87,
      critical: 15,
      overdue: 34,
    },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'good':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getOccupancyPercentage = (current: number, capacity: number) => {
    return Math.round((current / capacity) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">System Administration Dashboard</h1>
              <p className="text-sm text-muted-foreground">Metro Health SPCMS</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
            <span className="text-sm font-medium">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Building2 className="h-4 w-4 mr-2" />
              Departments
            </TabsTrigger>
            <TabsTrigger value="oversight">
              <Eye className="h-4 w-4 mr-2" />
              Clinical Oversight
            </TabsTrigger>
            <TabsTrigger value="quality">
              <TrendingUp className="h-4 w-4 mr-2" />
              Quality Metrics
            </TabsTrigger>
            <TabsTrigger value="systems">
              <Server className="h-4 w-4 mr-2" />
              System Status
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Census</CardTitle>
                  <Bed className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">268</div>
                  <p className="text-xs text-muted-foreground">
                    {getOccupancyPercentage(268, 310)}% facility occupancy
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Length of Stay</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5.4 days</div>
                  <p className="text-xs text-green-600">↓ 0.3 days from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">243</div>
                  <p className="text-xs text-muted-foreground">156 currently logged in</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">99.2%</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
            </div>

            {/* Department Overview Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {departmentMetrics.map((dept) => (
                <Card key={dept.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{dept.name}</CardTitle>
                      <Badge className={getStatusColor(dept.status)}>
                        {dept.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Occupancy</span>
                        <span className="font-medium">
                          {dept.currentCensus}/{dept.capacity} beds
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            getOccupancyPercentage(dept.currentCensus, dept.capacity) > 90
                              ? 'bg-red-500'
                              : getOccupancyPercentage(dept.currentCensus, dept.capacity) > 75
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                          }`}
                          style={{
                            width: `${getOccupancyPercentage(dept.currentCensus, dept.capacity)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getOccupancyPercentage(dept.currentCensus, dept.capacity)}% occupied
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Avg Wait</p>
                        <p className="font-medium">{dept.avgWaitTime} min</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Avg LOS</p>
                        <p className="font-medium">{dept.avgLOS} days</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Financial Indicators (Placeholder) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Overview (Placeholder)
                </CardTitle>
                <CardDescription>Monthly financial performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Revenue (MTD)</p>
                    <p className="text-2xl font-bold">$2.4M</p>
                    <p className="text-xs text-green-600">↑ 8.2% from last month</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Operating Costs</p>
                    <p className="text-2xl font-bold">$1.8M</p>
                    <p className="text-xs text-orange-600">↑ 3.1% from last month</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Net Margin</p>
                    <p className="text-2xl font-bold">25%</p>
                    <p className="text-xs text-green-600">↑ 2.3% from target</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">A/R Days</p>
                    <p className="text-2xl font-bold">42</p>
                    <p className="text-xs text-green-600">↓ 5 days from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Capacity & Metrics</CardTitle>
                <CardDescription>Real-time department status and performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentMetrics.map((dept) => (
                    <div
                      key={dept.id}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedDepartment(dept.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{dept.name}</h3>
                        </div>
                        <Badge className={getStatusColor(dept.status)}>{dept.status.toUpperCase()}</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Current Census</p>
                          <p className="text-lg font-bold">
                            {dept.currentCensus}/{dept.capacity}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getOccupancyPercentage(dept.currentCensus, dept.capacity)}% occupied
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Available Beds</p>
                          <p className="text-lg font-bold">{dept.capacity - dept.currentCensus}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Avg Wait Time</p>
                          <p className="text-lg font-bold">{dept.avgWaitTime} min</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Avg Length of Stay</p>
                          <p className="text-lg font-bold">{dept.avgLOS} days</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              getOccupancyPercentage(dept.currentCensus, dept.capacity) > 90
                                ? 'bg-red-500'
                                : getOccupancyPercentage(dept.currentCensus, dept.capacity) > 75
                                ? 'bg-orange-500'
                                : 'bg-green-500'
                            }`}
                            style={{
                              width: `${getOccupancyPercentage(dept.currentCensus, dept.capacity)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clinical Oversight Tab */}
          <TabsContent value="oversight" className="space-y-6">
            {/* Warning Banner */}
            <Card className="border-orange-300 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-orange-900">Administrative Oversight - Read Only</h3>
                    <p className="text-sm text-orange-700 mt-1">
                      You are viewing clinical data for administrative oversight purposes only. You cannot edit,
                      create, or modify any clinical information.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clinical Data Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-orange-600" />
                      Medications
                    </div>
                  </CardTitle>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Eye className="h-3 w-3 mr-1" />
                    View Only
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Administered</span>
                      <span className="font-medium">{oversightData.medications.administered}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Missed</span>
                      <span className="font-medium text-red-600">{oversightData.medications.missed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delayed</span>
                      <span className="font-medium text-orange-600">{oversightData.medications.delayed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Errors</span>
                      <span className="font-medium text-red-600">{oversightData.medications.errors}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <TestTube className="h-4 w-4 text-orange-600" />
                      Laboratory
                    </div>
                  </CardTitle>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Eye className="h-3 w-3 mr-1" />
                    View Only
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ordered</span>
                      <span className="font-medium">{oversightData.labs.ordered}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="font-medium text-green-600">{oversightData.labs.completed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pending</span>
                      <span className="font-medium text-orange-600">{oversightData.labs.pending}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Critical</span>
                      <span className="font-medium text-red-600">{oversightData.labs.critical}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-orange-600" />
                      Imaging
                    </div>
                  </CardTitle>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Eye className="h-3 w-3 mr-1" />
                    View Only
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ordered</span>
                      <span className="font-medium">{oversightData.imaging.ordered}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="font-medium text-green-600">{oversightData.imaging.completed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pending</span>
                      <span className="font-medium text-orange-600">{oversightData.imaging.pending}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Urgent</span>
                      <span className="font-medium text-red-600">{oversightData.imaging.urgent}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-orange-600" />
                      Vital Signs
                    </div>
                  </CardTitle>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Eye className="h-3 w-3 mr-1" />
                    View Only
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Recorded</span>
                      <span className="font-medium">{oversightData.vitals.recorded}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Alerts</span>
                      <span className="font-medium text-orange-600">{oversightData.vitals.alerts}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Critical</span>
                      <span className="font-medium text-red-600">{oversightData.vitals.critical}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Overdue</span>
                      <span className="font-medium text-red-600">{oversightData.vitals.overdue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compliance Reports */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Compliance Reports</CardTitle>
                    <CardDescription>Generate administrative oversight and compliance reports</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Eye className="h-3 w-3 mr-1" />
                    View Only Access
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <div className="flex items-start gap-3 text-left">
                      <FileText className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Medication Administration Report</p>
                        <p className="text-sm text-muted-foreground">View administration records and compliance</p>
                      </div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <div className="flex items-start gap-3 text-left">
                      <FileText className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Laboratory Results Report</p>
                        <p className="text-sm text-muted-foreground">Review lab orders and critical values</p>
                      </div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <div className="flex items-start gap-3 text-left">
                      <FileText className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Imaging Studies Report</p>
                        <p className="text-sm text-muted-foreground">Monitor imaging orders and completion</p>
                      </div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <div className="flex items-start gap-3 text-left">
                      <FileText className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Vital Signs Compliance</p>
                        <p className="text-sm text-muted-foreground">Track vital signs documentation and alerts</p>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quality Metrics Tab */}
          <TabsContent value="quality" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Quality Metrics</CardTitle>
                <CardDescription>Performance indicators and quality benchmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {qualityMetrics.map((metric, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{metric.metric}</h3>
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status === 'good' ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          {metric.value}
                          {metric.unit}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Current</p>
                          <p className="font-medium">
                            {metric.value}
                            {metric.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Target</p>
                          <p className="font-medium">
                            {metric.target}
                            {metric.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Variance</p>
                          <p
                            className={`font-medium ${
                              metric.value >= metric.target ? 'text-green-600' : 'text-orange-600'
                            }`}
                          >
                            {metric.value >= metric.target ? '+' : ''}
                            {(metric.value - metric.target).toFixed(1)}
                            {metric.unit}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              metric.value >= metric.target ? 'bg-green-500' : 'bg-orange-500'
                            }`}
                            style={{
                              width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Status Tab */}
          <TabsContent value="systems" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Database</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Online</div>
                  <p className="text-xs text-muted-foreground">99.8% uptime</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Network</CardTitle>
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Stable</div>
                  <p className="text-xs text-muted-foreground">12ms latency</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">68%</div>
                  <p className="text-xs text-muted-foreground">2.1 TB available</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Technology System Status</CardTitle>
                <CardDescription>Real-time monitoring of integrated systems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemStatus.map((system, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            system.status === 'online'
                              ? 'bg-green-500'
                              : system.status === 'degraded'
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                          }`}
                        />
                        <div>
                          <p className="font-medium">{system.system}</p>
                          <p className="text-sm text-muted-foreground">
                            Uptime: {system.uptime}% | Latency: {system.latency}ms
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={system.status === 'online' ? 'default' : 'destructive'}
                        className={
                          system.status === 'online'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : system.status === 'degraded'
                            ? 'bg-orange-100 text-orange-800 border-orange-300'
                            : ''
                        }
                      >
                        {system.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Activity Log */}
            <Card>
              <CardHeader>
                <CardTitle>Recent System Activity</CardTitle>
                <CardDescription>Latest administrative and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 border-b pb-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Daily backup completed successfully</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 border-b pb-3">
                    <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">New user created: Dr. Jane Smith (Provider)</p>
                      <p className="text-xs text-muted-foreground">3 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 border-b pb-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">PACS system performance degradation detected</p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 border-b pb-3">
                    <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Security policy updated: Password complexity requirements</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Monthly compliance report generated</p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Admin Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Administrative Tools</CardTitle>
            <CardDescription>System configuration and management functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button variant="outline" className="justify-start h-auto py-3">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">User Management</p>
                    <p className="text-xs text-muted-foreground">Manage users & roles</p>
                  </div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">System Settings</p>
                    <p className="text-xs text-muted-foreground">Configure parameters</p>
                  </div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Audit Logs</p>
                    <p className="text-xs text-muted-foreground">View system activity</p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
