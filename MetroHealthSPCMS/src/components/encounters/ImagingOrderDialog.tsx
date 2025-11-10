import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { imagingOrdersApi } from '@/lib/api';
import type { ImagingOrder, OrderPriority } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ImagingOrderDialogProps {
  encounterId: string;
  patientId: string;
  onClose: () => void;
  onOrderCreated: () => void;
}

export function ImagingOrderDialog({
  encounterId,
  patientId,
  onClose,
  onOrderCreated,
}: ImagingOrderDialogProps) {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    studyType: '',
    bodyPart: '',
    laterality: '' as ImagingOrder['laterality'] | '',
    indication: '',
    clinicalHistory: '',
    instructions: '',
    priority: 'routine' as OrderPriority,
  });

  const handleSubmit = async () => {
    if (!formData.studyType || !formData.bodyPart || !formData.indication) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const order: ImagingOrder = {
        orderId: `img-${Date.now()}`,
        encounterId,
        patientId,
        orderedBy: user?.userId || '',
        orderedByName: user?.name || '',
        orderedAt: new Date().toISOString(),
        status: 'ordered',
        studyType: formData.studyType,
        bodyPart: formData.bodyPart,
        laterality: formData.laterality || undefined,
        indication: formData.indication,
        clinicalHistory: formData.clinicalHistory || undefined,
        instructions: formData.instructions || undefined,
        priority: formData.priority,
      };

      await imagingOrdersApi.create(order);
      onOrderCreated();
    } catch (error) {
      console.error('Error creating imaging order:', error);
      alert('Failed to create imaging order');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Imaging Order</DialogTitle>
          <DialogDescription>
            Order imaging studies
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Study Type *</label>
              <Input
                value={formData.studyType}
                onChange={(e) => setFormData({ ...formData, studyType: e.target.value })}
                placeholder="e.g., X-Ray, CT, MRI"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Body Part *</label>
              <Input
                value={formData.bodyPart}
                onChange={(e) => setFormData({ ...formData, bodyPart: e.target.value })}
                placeholder="e.g., Chest, Knee, Brain"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Laterality</label>
            <Select value={formData.laterality || 'none'} onValueChange={(value) => setFormData({ ...formData, laterality: value === 'none' ? '' : value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not applicable</SelectItem>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="bilateral">Bilateral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Indication *</label>
            <Input
              value={formData.indication}
              onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
              placeholder="e.g., Rule out pneumonia"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Clinical History</label>
            <Textarea
              value={formData.clinicalHistory}
              onChange={(e) => setFormData({ ...formData, clinicalHistory: e.target.value })}
              placeholder="Relevant clinical history..."
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Special Instructions</label>
            <Textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Special instructions or protocols..."
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Priority</label>
            <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Creating...' : 'Create Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
