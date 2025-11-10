import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pill,
  TestTube,
  Image as ImageIcon,
  Activity,
  CheckCircle,
  XCircle,
  Edit,
  AlertCircle,
  Clock,
  User,
  FileText,
  Ban,
} from 'lucide-react';
import { format } from 'date-fns';
import type {
  MedicationOrder,
  LabOrder,
  ImagingOrder,
  ProcedureOrder,
} from '@/types';

interface OrderReviewProps {}

const OrderReview: React.FC<OrderReviewProps> = () => {
  const [medicationOrders, setMedicationOrders] = useState<MedicationOrder[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [imagingOrders, setImagingOrders] = useState<ImagingOrder[]>([]);
  const [procedureOrders, setProcedureOrders] = useState<ProcedureOrder[]>([]);
  const [selectedTab, setSelectedTab] = useState('medications');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [showDiscontinueDialog, setShowDiscontinueDialog] = useState(false);
  const [signaturePassword, setSignaturePassword] = useState('');
  const [discontinueReason, setDiscontinueReason] = useState('');
  const [modifiedOrder, setModifiedOrder] = useState<any>(null);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    // Mock data - replace with actual API calls
    const mockMedicationOrders: MedicationOrder[] = [
      {
        orderId: 'MED001',
        encounterId: 'ENC001',
        patientId: 'P001',
        orderedBy: 'U001',
        orderedByName: 'Dr. Sarah Johnson',
        orderedAt: '2025-11-09T08:00:00',
        status: 'draft',
        medicationName: 'Lisinopril',
        dose: '10 mg',
        route: 'oral',
        frequency: 'Once daily',
        duration: '30 days',
        quantity: '30 tablets',
        refills: 2,
        indication: 'Hypertension',
        instructions: 'Take in the morning with food',
        priority: 'routine',
      },
      {
        orderId: 'MED002',
        encounterId: 'ENC002',
        patientId: 'P002',
        orderedBy: 'U001',
        orderedByName: 'Dr. Sarah Johnson',
        orderedAt: '2025-11-09T07:30:00',
        status: 'ordered',
        medicationName: 'Azithromycin',
        dose: '500 mg',
        route: 'oral',
        frequency: 'Once daily',
        duration: '5 days',
        quantity: '5 tablets',
        indication: 'Community-acquired pneumonia',
        instructions: 'Take with plenty of water',
        priority: 'urgent',
      },
      {
        orderId: 'MED003',
        encounterId: 'ENC003',
        patientId: 'P003',
        orderedBy: 'U001',
        orderedByName: 'Dr. Sarah Johnson',
        orderedAt: '2025-11-08T16:00:00',
        status: 'draft',
        medicationName: 'Insulin Glargine',
        dose: '20 units',
        route: 'SC',
        frequency: 'Once daily at bedtime',
        indication: 'Type 2 Diabetes Mellitus',
        instructions: 'Inject subcutaneously in abdomen or thigh',
        priority: 'routine',
      },
    ];

    const mockLabOrders: LabOrder[] = [
      {
        orderId: 'LAB001',
        encounterId: 'ENC001',
        patientId: 'P001',
        orderedBy: 'U001',
        orderedByName: 'Dr. Sarah Johnson',
        orderedAt: '2025-11-09T08:15:00',
        status: 'draft',
        testName: 'Lipid Panel',
        testCode: 'LIPID',
        priority: 'routine',
        indication: 'Annual wellness exam',
        instructions: 'Fasting required - NPO after midnight',
        specimenType: 'Blood - Venipuncture',
      },
      {
        orderId: 'LAB002',
        encounterId: 'ENC002',
        patientId: 'P002',
        orderedBy: 'U001',
        orderedByName: 'Dr. Sarah Johnson',
        orderedAt: '2025-11-09T07:45:00',
        status: 'ordered',
        testName: 'Blood Culture',
        testCode: 'BLDCX',
        priority: 'stat',
        indication: 'Suspected sepsis',
        instructions: 'Collect before antibiotic administration',
        specimenType: 'Blood - Venipuncture',
      },
    ];

    const mockImagingOrders: ImagingOrder[] = [
      {
        orderId: 'IMG001',
        encounterId: 'ENC001',
        patientId: 'P001',
        orderedBy: 'U001',
        orderedByName: 'Dr. Sarah Johnson',
        orderedAt: '2025-11-09T08:20:00',
        status: 'draft',
        studyType: 'Echocardiogram',
        bodyPart: 'Heart',
        priority: 'urgent',
        indication: 'Chest pain, rule out cardiac etiology',
        clinicalHistory: '65 y/o male with atypical chest pain, elevated troponin',
        instructions: 'Transthoracic echo with Doppler',
      },
      {
        orderId: 'IMG002',
        encounterId: 'ENC004',
        patientId: 'P004',
        orderedBy: 'U001',
        orderedByName: 'Dr. Sarah Johnson',
        orderedAt: '2025-11-09T09:00:00',
        status: 'draft',
        studyType: 'CT Chest',
        bodyPart: 'Chest',
        priority: 'stat',
        indication: 'Acute asthma exacerbation, rule out PE',
        clinicalHistory: '35 y/o female with severe asthma exacerbation and hypoxia',
        instructions: 'CT chest with IV contrast - PE protocol',
      },
    ];

    const mockProcedureOrders: ProcedureOrder[] = [
      {
        orderId: 'PROC001',
        encounterId: 'ENC005',
        patientId: 'P005',
        orderedBy: 'U001',
        orderedByName: 'Dr. Sarah Johnson',
        orderedAt: '2025-11-09T08:30:00',
        status: 'draft',
        procedureName: 'Paracentesis',
        procedureCode: 'PARA',
        priority: 'urgent',
        indication: 'Ascites, therapeutic drainage',
        instructions: 'Ultrasound-guided, remove up to 5L',
      },
    ];

    setMedicationOrders(mockMedicationOrders);
    setLabOrders(mockLabOrders);
    setImagingOrders(mockImagingOrders);
    setProcedureOrders(mockProcedureOrders);
  };

  const handleSignOrder = (order: any, type: string) => {
    setSelectedOrder({ ...order, type });
    setSignaturePassword('');
    setShowSignDialog(true);
  };

  const handleModifyOrder = (order: any, type: string) => {
    setSelectedOrder({ ...order, type });
    setModifiedOrder({ ...order });
    setShowModifyDialog(true);
  };

  const handleDiscontinueOrder = (order: any, type: string) => {
    setSelectedOrder({ ...order, type });
    setDiscontinueReason('');
    setShowDiscontinueDialog(true);
  };

  const confirmSign = () => {
    if (!signaturePassword) {
      alert('Please enter your password to sign');
      return;
    }
    console.log('Signing order:', selectedOrder);
    // TODO: Call API to sign order
    setShowSignDialog(false);
    setSelectedOrder(null);
  };

  const confirmModify = () => {
    console.log('Modifying order:', modifiedOrder);
    // TODO: Call API to modify order
    setShowModifyDialog(false);
    setSelectedOrder(null);
    setModifiedOrder(null);
  };

  const confirmDiscontinue = () => {
    if (!discontinueReason) {
      alert('Please enter a reason for discontinuation');
      return;
    }
    console.log('Discontinuing order:', selectedOrder, 'Reason:', discontinueReason);
    // TODO: Call API to discontinue order
    setShowDiscontinueDialog(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'ordered':
        return 'bg-blue-500 text-white';
      case 'in-progress':
        return 'bg-yellow-500 text-black';
      case 'draft':
        return 'bg-gray-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'stat':
        return 'bg-red-600 text-white';
      case 'urgent':
        return 'bg-orange-500 text-white';
      case 'routine':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const draftMedCount = medicationOrders.filter((o) => o.status === 'draft').length;
  const draftLabCount = labOrders.filter((o) => o.status === 'draft').length;
  const draftImagingCount = imagingOrders.filter((o) => o.status === 'draft').length;
  const draftProcedureCount = procedureOrders.filter((o) => o.status === 'draft').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Review & Signature</h1>
          <p className="text-gray-600 mt-1">Sign, modify, or discontinue pending orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Order History
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Medication Orders</p>
                <p className="text-2xl font-bold text-gray-900">{draftMedCount}</p>
                <p className="text-xs text-gray-500">Pending signature</p>
              </div>
              <Pill className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lab Orders</p>
                <p className="text-2xl font-bold text-gray-900">{draftLabCount}</p>
                <p className="text-xs text-gray-500">Pending signature</p>
              </div>
              <TestTube className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Imaging Orders</p>
                <p className="text-2xl font-bold text-gray-900">{draftImagingCount}</p>
                <p className="text-xs text-gray-500">Pending signature</p>
              </div>
              <ImageIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Procedure Orders</p>
                <p className="text-2xl font-bold text-gray-900">{draftProcedureCount}</p>
                <p className="text-xs text-gray-500">Pending signature</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="medications">
            Medications
            {draftMedCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {draftMedCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="labs">
            Labs
            {draftLabCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {draftLabCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="imaging">
            Imaging
            {draftImagingCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {draftImagingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="procedures">
            Procedures
            {draftProcedureCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {draftProcedureCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Medication Orders Tab */}
        <TabsContent value="medications" className="space-y-4">
          <div className="grid gap-4">
            {medicationOrders.map((order) => (
              <Card key={order.orderId} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.medicationName}
                        </h3>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.toUpperCase()}
                        </Badge>
                        <Badge className={getPriorityColor(order.priority)}>
                          {order.priority.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Dose</p>
                          <p className="text-sm text-gray-600">{order.dose}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Route</p>
                          <p className="text-sm text-gray-600 uppercase">{order.route}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Frequency</p>
                          <p className="text-sm text-gray-600">{order.frequency}</p>
                        </div>
                        {order.duration && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Duration</p>
                            <p className="text-sm text-gray-600">{order.duration}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Indication</p>
                          <p className="text-sm text-gray-600">{order.indication}</p>
                        </div>
                        {order.instructions && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Instructions</p>
                            <p className="text-sm text-gray-600">{order.instructions}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{order.orderedByName}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{format(new Date(order.orderedAt), 'MMM d, h:mm a')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {order.status === 'draft' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSignOrder(order, 'medication')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Sign Order
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModifyOrder(order, 'medication')}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modify
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDiscontinueOrder(order, 'medication')}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Discontinue
                          </Button>
                        </>
                      )}
                      {order.status === 'ordered' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDiscontinueOrder(order, 'medication')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {medicationOrders.length === 0 && (
            <div className="text-center py-12">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No medication orders</p>
            </div>
          )}
        </TabsContent>

        {/* Lab Orders Tab */}
        <TabsContent value="labs" className="space-y-4">
          <div className="grid gap-4">
            {labOrders.map((order) => (
              <Card key={order.orderId} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{order.testName}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.toUpperCase()}
                        </Badge>
                        <Badge className={getPriorityColor(order.priority)}>
                          {order.priority.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Indication</p>
                          <p className="text-sm text-gray-600">{order.indication}</p>
                        </div>
                        {order.instructions && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Instructions</p>
                            <p className="text-sm text-gray-600">{order.instructions}</p>
                          </div>
                        )}
                        {order.specimenType && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Specimen Type</p>
                            <p className="text-sm text-gray-600">{order.specimenType}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{order.orderedByName}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{format(new Date(order.orderedAt), 'MMM d, h:mm a')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {order.status === 'draft' && (
                        <>
                          <Button size="sm" onClick={() => handleSignOrder(order, 'lab')}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Sign Order
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModifyOrder(order, 'lab')}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modify
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDiscontinueOrder(order, 'lab')}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Discontinue
                          </Button>
                        </>
                      )}
                      {order.status === 'ordered' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDiscontinueOrder(order, 'lab')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {labOrders.length === 0 && (
            <div className="text-center py-12">
              <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No lab orders</p>
            </div>
          )}
        </TabsContent>

        {/* Imaging Orders Tab */}
        <TabsContent value="imaging" className="space-y-4">
          <div className="grid gap-4">
            {imagingOrders.map((order) => (
              <Card key={order.orderId} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.studyType}
                        </h3>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.toUpperCase()}
                        </Badge>
                        <Badge className={getPriorityColor(order.priority)}>
                          {order.priority.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Body Part</p>
                          <p className="text-sm text-gray-600">{order.bodyPart}</p>
                        </div>
                        {order.laterality && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Laterality</p>
                            <p className="text-sm text-gray-600 capitalize">{order.laterality}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-700">Indication</p>
                          <p className="text-sm text-gray-600">{order.indication}</p>
                        </div>
                        {order.clinicalHistory && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Clinical History</p>
                            <p className="text-sm text-gray-600">{order.clinicalHistory}</p>
                          </div>
                        )}
                        {order.instructions && (
                          <div className="col-span-2">
                            <p className="text-sm font-medium text-gray-700">Instructions</p>
                            <p className="text-sm text-gray-600">{order.instructions}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{order.orderedByName}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{format(new Date(order.orderedAt), 'MMM d, h:mm a')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {order.status === 'draft' && (
                        <>
                          <Button size="sm" onClick={() => handleSignOrder(order, 'imaging')}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Sign Order
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModifyOrder(order, 'imaging')}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modify
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDiscontinueOrder(order, 'imaging')}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Discontinue
                          </Button>
                        </>
                      )}
                      {order.status === 'ordered' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDiscontinueOrder(order, 'imaging')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {imagingOrders.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No imaging orders</p>
            </div>
          )}
        </TabsContent>

        {/* Procedure Orders Tab */}
        <TabsContent value="procedures" className="space-y-4">
          <div className="grid gap-4">
            {procedureOrders.map((order) => (
              <Card key={order.orderId} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.procedureName}
                        </h3>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.toUpperCase()}
                        </Badge>
                        <Badge className={getPriorityColor(order.priority)}>
                          {order.priority.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Indication</p>
                          <p className="text-sm text-gray-600">{order.indication}</p>
                        </div>
                        {order.instructions && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Instructions</p>
                            <p className="text-sm text-gray-600">{order.instructions}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{order.orderedByName}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{format(new Date(order.orderedAt), 'MMM d, h:mm a')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {order.status === 'draft' && (
                        <>
                          <Button size="sm" onClick={() => handleSignOrder(order, 'procedure')}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Sign Order
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModifyOrder(order, 'procedure')}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modify
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDiscontinueOrder(order, 'procedure')}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Discontinue
                          </Button>
                        </>
                      )}
                      {order.status === 'ordered' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDiscontinueOrder(order, 'procedure')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {procedureOrders.length === 0 && (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No procedure orders</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Sign Order Dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Order</DialogTitle>
            <DialogDescription>
              Enter your password to electronically sign this order
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">
                  {selectedOrder.medicationName ||
                    selectedOrder.testName ||
                    selectedOrder.studyType ||
                    selectedOrder.procedureName}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedOrder.type === 'medication' && `${selectedOrder.dose} ${selectedOrder.route}`}
                  {selectedOrder.type === 'lab' && selectedOrder.indication}
                  {selectedOrder.type === 'imaging' && selectedOrder.bodyPart}
                  {selectedOrder.type === 'procedure' && selectedOrder.indication}
                </p>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={signaturePassword}
                  onChange={(e) => setSignaturePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1"
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-900">
                  By signing this order, you are authorizing its execution and taking clinical
                  responsibility for the care provided.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSign}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Sign Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modify Order Dialog */}
      <Dialog open={showModifyDialog} onOpenChange={setShowModifyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modify Order</DialogTitle>
            <DialogDescription>Make changes to the order details</DialogDescription>
          </DialogHeader>

          {modifiedOrder && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Medication specific fields */}
              {modifiedOrder.type === 'medication' && (
                <>
                  <div>
                    <Label>Medication Name</Label>
                    <Input
                      value={modifiedOrder.medicationName}
                      onChange={(e) =>
                        setModifiedOrder({ ...modifiedOrder, medicationName: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Dose</Label>
                      <Input
                        value={modifiedOrder.dose}
                        onChange={(e) =>
                          setModifiedOrder({ ...modifiedOrder, dose: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Route</Label>
                      <Select
                        value={modifiedOrder.route}
                        onValueChange={(value) =>
                          setModifiedOrder({ ...modifiedOrder, route: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oral">Oral</SelectItem>
                          <SelectItem value="IV">IV</SelectItem>
                          <SelectItem value="IM">IM</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="topical">Topical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Frequency</Label>
                    <Input
                      value={modifiedOrder.frequency}
                      onChange={(e) =>
                        setModifiedOrder({ ...modifiedOrder, frequency: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              {/* Common fields */}
              <div>
                <Label>Priority</Label>
                <Select
                  value={modifiedOrder.priority}
                  onValueChange={(value) =>
                    setModifiedOrder({ ...modifiedOrder, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="stat">STAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Indication</Label>
                <Textarea
                  value={modifiedOrder.indication}
                  onChange={(e) =>
                    setModifiedOrder({ ...modifiedOrder, indication: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div>
                <Label>Instructions</Label>
                <Textarea
                  value={modifiedOrder.instructions || ''}
                  onChange={(e) =>
                    setModifiedOrder({ ...modifiedOrder, instructions: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModifyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmModify}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discontinue Order Dialog */}
      <Dialog open={showDiscontinueDialog} onOpenChange={setShowDiscontinueDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Discontinue Order</DialogTitle>
            <DialogDescription>
              Provide a reason for discontinuing this order
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">
                      {selectedOrder.medicationName ||
                        selectedOrder.testName ||
                        selectedOrder.studyType ||
                        selectedOrder.procedureName}
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      This action will permanently discontinue this order
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="reason">Reason for Discontinuation *</Label>
                <Textarea
                  id="reason"
                  value={discontinueReason}
                  onChange={(e) => setDiscontinueReason(e.target.value)}
                  placeholder="Enter reason for discontinuation..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiscontinueDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDiscontinue}>
              <Ban className="h-4 w-4 mr-2" />
              Discontinue Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderReview;
