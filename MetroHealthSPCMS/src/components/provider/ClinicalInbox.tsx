import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  TestTube,
  Image as ImageIcon,
  MessageSquare,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  TrendingUp,
  TrendingDown,
  Eye,
  CheckCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import type { LabResult, ImagingStudy } from '@/types';

interface PatientMessage {
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
}

interface ConsultationRequest {
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
}

interface InboxLabResult extends LabResult {
  patientName: string;
  patientMRN: string;
  isNew: boolean;
  isCritical: boolean;
}

interface InboxImagingStudy extends ImagingStudy {
  patientName: string;
  patientMRN: string;
  isNew: boolean;
  isCritical: boolean;
}

const ClinicalInbox: React.FC = () => {
  const [labResults, setLabResults] = useState<InboxLabResult[]>([]);
  const [imagingStudies, setImagingStudies] = useState<InboxImagingStudy[]>([]);
  const [consultRequests, setConsultRequests] = useState<ConsultationRequest[]>([]);
  const [patientMessages, setPatientMessages] = useState<PatientMessage[]>([]);
  const [selectedTab, setSelectedTab] = useState('labs');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    loadInboxData();
    const interval = setInterval(loadInboxData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadInboxData = () => {
    // Mock data - replace with actual API calls
    const mockLabResults: InboxLabResult[] = [
      {
        labId: 'LAB001',
        patientId: 'P001',
        patientName: 'John Smith',
        patientMRN: 'MRN001234',
        testName: 'Troponin I',
        value: '2.5',
        unit: 'ng/mL',
        referenceRange: '<0.04',
        status: 'completed',
        orderedBy: 'U001',
        orderedDate: '2025-11-09T06:00:00',
        resultDate: '2025-11-09T08:30:00',
        abnormalFlag: 'critical',
        isNew: true,
        isCritical: true,
        notes: 'Critical value - patient with chest pain',
      },
      {
        labId: 'LAB002',
        patientId: 'P002',
        patientName: 'Maria Garcia',
        patientMRN: 'MRN002345',
        testName: 'Complete Blood Count',
        value: 'WBC 14.5',
        unit: 'K/uL',
        referenceRange: '4.0-11.0',
        status: 'completed',
        orderedBy: 'U001',
        orderedDate: '2025-11-08T18:00:00',
        resultDate: '2025-11-09T07:00:00',
        abnormalFlag: 'high',
        isNew: true,
        isCritical: false,
      },
      {
        labId: 'LAB003',
        patientId: 'P003',
        patientName: 'Robert Chen',
        patientMRN: 'MRN003456',
        testName: 'HbA1c',
        value: '8.2',
        unit: '%',
        referenceRange: '<5.7',
        status: 'completed',
        orderedBy: 'U001',
        orderedDate: '2025-11-08T10:00:00',
        resultDate: '2025-11-09T06:00:00',
        abnormalFlag: 'high',
        isNew: true,
        isCritical: false,
        notes: 'Trending higher than last visit (7.8%)',
      },
    ];

    const mockImagingStudies: InboxImagingStudy[] = [
      {
        studyId: 'IMG001',
        patientId: 'P001',
        patientName: 'John Smith',
        patientMRN: 'MRN001234',
        type: 'x-ray',
        bodyPart: 'Chest',
        description: 'Chest X-Ray PA and Lateral',
        orderedBy: 'U001',
        orderedDate: '2025-11-09T07:00:00',
        performedDate: '2025-11-09T08:00:00',
        status: 'completed',
        findings:
          'No acute cardiopulmonary abnormality. Heart size is normal. Lungs are clear. No pleural effusion or pneumothorax.',
        radiologist: 'Dr. James Wilson',
        urgency: 'stat',
        isNew: true,
        isCritical: false,
      },
      {
        studyId: 'IMG002',
        patientId: 'P004',
        patientName: 'Emily Williams',
        patientMRN: 'MRN004567',
        type: 'ct',
        bodyPart: 'Chest',
        description: 'CT Chest with Contrast',
        orderedBy: 'U001',
        orderedDate: '2025-11-08T20:00:00',
        performedDate: '2025-11-09T06:30:00',
        status: 'completed',
        findings:
          'Findings consistent with pulmonary embolism in the right lower lobe segmental arteries. Recommend anticoagulation.',
        radiologist: 'Dr. Sarah Martinez',
        urgency: 'stat',
        isNew: true,
        isCritical: true,
      },
    ];

    const mockConsultRequests: ConsultationRequest[] = [
      {
        requestId: 'CONS001',
        patientId: 'P005',
        patientName: 'David Brown',
        patientMRN: 'MRN005678',
        requestingProvider: 'Dr. Michael Chen',
        requestingDepartment: 'Emergency Medicine',
        consultationType: 'Cardiology',
        urgency: 'urgent',
        status: 'pending',
        reason: 'Atrial fibrillation with rapid ventricular response',
        clinicalInfo:
          '68 y/o male with new onset AFib RVR, HR 145, symptomatic with palpitations and SOB. No prior cardiac history.',
        requestedAt: '2025-11-09T08:45:00',
        dueDate: '2025-11-09T12:00:00',
      },
      {
        requestId: 'CONS002',
        patientId: 'P006',
        patientName: 'Lisa Anderson',
        patientMRN: 'MRN006789',
        requestingProvider: 'Dr. Jennifer Lee',
        requestingDepartment: 'Internal Medicine',
        consultationType: 'Nephrology',
        urgency: 'routine',
        status: 'pending',
        reason: 'Chronic kidney disease management',
        clinicalInfo: '58 y/o female with CKD stage 3, Cr 1.8, eGFR 35. Requesting optimization of medications.',
        requestedAt: '2025-11-08T14:00:00',
        dueDate: '2025-11-10T17:00:00',
      },
    ];

    const mockMessages: PatientMessage[] = [
      {
        messageId: 'MSG001',
        patientId: 'P007',
        patientName: 'Michael Taylor',
        patientMRN: 'MRN007890',
        subject: 'Question about new medication',
        message:
          'Hi Dr. Johnson, I started the new blood pressure medication you prescribed yesterday and I am experiencing some dizziness. Should I continue taking it?',
        priority: 'medium',
        status: 'unread',
        timestamp: '2025-11-09T07:30:00',
        responseRequired: true,
      },
      {
        messageId: 'MSG002',
        patientId: 'P008',
        patientName: 'Sarah Kim',
        patientMRN: 'MRN008901',
        subject: 'Lab results question',
        message: 'I received notification that my lab results are available. Can you please explain what they mean?',
        priority: 'low',
        status: 'unread',
        timestamp: '2025-11-09T06:15:00',
        responseRequired: true,
      },
    ];

    setLabResults(mockLabResults);
    setImagingStudies(mockImagingStudies);
    setConsultRequests(mockConsultRequests);
    setPatientMessages(mockMessages);
  };

  const handleReviewItem = (item: any, type: string) => {
    setSelectedItem({ ...item, type });
    setReviewNotes('');
    setShowDetailDialog(true);
  };

  const handleMarkReviewed = () => {
    // Update item status
    console.log('Marking as reviewed:', selectedItem);
    console.log('Review notes:', reviewNotes);
    setShowDetailDialog(false);
    setSelectedItem(null);
    setReviewNotes('');
    // TODO: Call API to update status
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'stat':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'low':
      case 'routine':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'responded':
      case 'accepted':
        return 'bg-green-500 text-white';
      case 'pending':
      case 'unread':
        return 'bg-orange-500 text-white';
      case 'read':
        return 'bg-blue-500 text-white';
      case 'declined':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const unreadMessagesCount = patientMessages.filter((m) => m.status === 'unread').length;
  const pendingConsultsCount = consultRequests.filter((c) => c.status === 'pending').length;
  const newLabsCount = labResults.filter((l) => l.isNew).length;
  const newImagingCount = imagingStudies.filter((i) => i.isNew).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clinical Inbox</h1>
          <p className="text-gray-600 mt-1">Review pending results and messages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Lab Results</p>
                <p className="text-2xl font-bold text-gray-900">{newLabsCount}</p>
              </div>
              <TestTube className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Imaging</p>
                <p className="text-2xl font-bold text-gray-900">{newImagingCount}</p>
              </div>
              <ImageIcon className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Consults</p>
                <p className="text-2xl font-bold text-gray-900">{pendingConsultsCount}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">{unreadMessagesCount}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="labs">
            Lab Results
            {newLabsCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {newLabsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="imaging">
            Imaging
            {newImagingCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {newImagingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="consults">
            Consults
            {pendingConsultsCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingConsultsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="messages">
            Messages
            {unreadMessagesCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadMessagesCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Lab Results Tab */}
        <TabsContent value="labs" className="space-y-4">
          <div className="grid gap-4">
            {labResults.map((lab) => (
              <Card
                key={lab.labId}
                className={`hover:shadow-lg transition-shadow ${
                  lab.isCritical ? 'border-red-500 border-2' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{lab.testName}</h3>
                        {lab.isNew && (
                          <Badge variant="default">NEW</Badge>
                        )}
                        {lab.abnormalFlag && (
                          <Badge
                            className={
                              lab.abnormalFlag === 'critical'
                                ? 'bg-red-600 text-white'
                                : 'bg-orange-500 text-white'
                            }
                          >
                            {lab.abnormalFlag === 'critical' ? (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                CRITICAL
                              </>
                            ) : (
                              <>
                                {lab.abnormalFlag === 'high' ? (
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                )}
                                {lab.abnormalFlag.toUpperCase()}
                              </>
                            )}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="font-medium">{lab.patientName}</span>
                        <span>•</span>
                        <span>MRN: {lab.patientMRN}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Result</p>
                          <p className="text-lg font-bold text-gray-900">
                            {lab.value} {lab.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Reference Range</p>
                          <p className="text-sm text-gray-600">{lab.referenceRange}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Result Date</p>
                          <p className="text-sm text-gray-600">
                            {lab.resultDate && format(new Date(lab.resultDate), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>

                      {lab.notes && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-sm text-yellow-900">{lab.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" onClick={() => handleReviewItem(lab, 'lab')}>
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        View Chart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {labResults.length === 0 && (
            <div className="text-center py-12">
              <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No lab results to review</p>
            </div>
          )}
        </TabsContent>

        {/* Imaging Tab */}
        <TabsContent value="imaging" className="space-y-4">
          <div className="grid gap-4">
            {imagingStudies.map((study) => (
              <Card
                key={study.studyId}
                className={`hover:shadow-lg transition-shadow ${
                  study.isCritical ? 'border-red-500 border-2' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {study.description}
                        </h3>
                        {study.isNew && <Badge variant="default">NEW</Badge>}
                        {study.isCritical && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            CRITICAL
                          </Badge>
                        )}
                        <Badge className={getPriorityColor(study.urgency || 'routine')}>
                          {study.urgency?.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="font-medium">{study.patientName}</span>
                        <span>•</span>
                        <span>MRN: {study.patientMRN}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Study Type</p>
                          <p className="text-sm text-gray-600 capitalize">{study.type}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Performed</p>
                          <p className="text-sm text-gray-600">
                            {study.performedDate &&
                              format(new Date(study.performedDate), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>

                      {study.radiologist && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">Radiologist</p>
                          <p className="text-sm text-gray-600">{study.radiologist}</p>
                        </div>
                      )}

                      {study.findings && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm font-medium text-blue-900 mb-1">Findings</p>
                          <p className="text-sm text-blue-800">{study.findings}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" onClick={() => handleReviewItem(study, 'imaging')}>
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                      <Button size="sm" variant="outline">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        View Images
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        View Chart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {imagingStudies.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No imaging studies to review</p>
            </div>
          )}
        </TabsContent>

        {/* Consultation Requests Tab */}
        <TabsContent value="consults" className="space-y-4">
          <div className="grid gap-4">
            {consultRequests.map((consult) => (
              <Card key={consult.requestId} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {consult.consultationType} Consult
                        </h3>
                        <Badge className={getPriorityColor(consult.urgency)}>
                          {consult.urgency.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(consult.status)}>
                          {consult.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="font-medium">{consult.patientName}</span>
                        <span>•</span>
                        <span>MRN: {consult.patientMRN}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Requesting Provider</p>
                          <p className="text-sm text-gray-600">{consult.requestingProvider}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Department</p>
                          <p className="text-sm text-gray-600">{consult.requestingDepartment}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Requested</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(consult.requestedAt), 'MMM d, h:mm a')}
                          </p>
                        </div>
                        {consult.dueDate && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Due By</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(consult.dueDate), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Reason</p>
                          <p className="text-sm text-gray-600">{consult.reason}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Clinical Information</p>
                          <p className="text-sm text-gray-600">{consult.clinicalInfo}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        View Chart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {consultRequests.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No consultation requests</p>
            </div>
          )}
        </TabsContent>

        {/* Patient Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <div className="grid gap-4">
            {patientMessages.map((message) => (
              <Card
                key={message.messageId}
                className={`hover:shadow-lg transition-shadow ${
                  message.status === 'unread' ? 'border-blue-500 border-2' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{message.subject}</h3>
                        {message.status === 'unread' && <Badge variant="default">NEW</Badge>}
                        <Badge className={getPriorityColor(message.priority)}>
                          {message.priority.toUpperCase()}
                        </Badge>
                        {message.responseRequired && (
                          <Badge variant="outline">Response Required</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{message.patientName}</span>
                        <span>•</span>
                        <span>MRN: {message.patientMRN}</span>
                        <span>•</span>
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(message.timestamp), 'MMM d, h:mm a')}</span>
                      </div>

                      <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                        <p className="text-sm text-gray-800">{message.message}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        View Chart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {patientMessages.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No patient messages</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review and Sign</DialogTitle>
            <DialogDescription>
              Review the {selectedItem?.type} results and add your notes
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">
                  {selectedItem.type === 'lab' && selectedItem.testName}
                  {selectedItem.type === 'imaging' && selectedItem.description}
                </h4>
                <p className="text-sm text-gray-600">
                  Patient: {selectedItem.patientName} (MRN: {selectedItem.patientMRN})
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes
                </label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter your review notes here..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkReviewed}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Reviewed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicalInbox;
