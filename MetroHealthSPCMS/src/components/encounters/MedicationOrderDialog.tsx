import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { medicationOrdersApi } from '@/lib/api';
import type { MedicationOrder, OrderPriority } from '@/types';
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

interface MedicationOrderDialogProps {
  encounterId: string;
  patientId: string;
  onClose: () => void;
  onOrderCreated: () => void;
}

export function MedicationOrderDialog({
  encounterId,
  patientId,
  onClose,
  onOrderCreated,
}: MedicationOrderDialogProps) {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    medicationName: '',
    dose: '',
    route: 'oral' as MedicationOrder['route'],
    frequency: '',
    duration: '',
    quantity: '',
    refills: '0',
    indication: '',
    instructions: '',
    priority: 'routine' as OrderPriority,
  });

  const handleSubmit = async () => {
    if (!formData.medicationName || !formData.dose || !formData.frequency || !formData.indication) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const order: MedicationOrder = {
        orderId: `med-${Date.now()}`,
        encounterId,
        patientId,
        orderedBy: user?.userId || '',
        orderedByName: user?.name || '',
        orderedAt: new Date().toISOString(),
        status: 'ordered',
        medicationName: formData.medicationName,
        dose: formData.dose,
        route: formData.route,
        frequency: formData.frequency,
        duration: formData.duration || undefined,
        quantity: formData.quantity || undefined,
        refills: parseInt(formData.refills) || 0,
        indication: formData.indication,
        instructions: formData.instructions || undefined,
        priority: formData.priority,
      };

      await medicationOrdersApi.create(order);
      onOrderCreated();
    } catch (error) {
      console.error('Error creating medication order:', error);
      alert('Failed to create medication order');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Medication Order</DialogTitle>
          <DialogDescription>
            Enter medication details and submit order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Medication Name *</label>
              <Input
                value={formData.medicationName}
                onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
                placeholder="e.g., Lisinopril"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Dose *</label>
              <Input
                value={formData.dose}
                onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
                placeholder="e.g., 10 mg"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Route *</label>
              <Select value={formData.route} onValueChange={(value: any) => setFormData({ ...formData, route: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oral">Oral</SelectItem>
                  <SelectItem value="IV">IV</SelectItem>
                  <SelectItem value="IM">IM</SelectItem>
                  <SelectItem value="SC">SC (Subcutaneous)</SelectItem>
                  <SelectItem value="topical">Topical</SelectItem>
                  <SelectItem value="inhalation">Inhalation</SelectItem>
                  <SelectItem value="rectal">Rectal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Frequency *</label>
              <Input
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                placeholder="e.g., Once daily, BID, TID"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Duration</label>
              <Input
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 30 days"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Quantity</label>
              <Input
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="e.g., 30 tablets"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Refills</label>
              <Input
                type="number"
                min="0"
                value={formData.refills}
                onChange={(e) => setFormData({ ...formData, refills: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Indication *</label>
            <Input
              value={formData.indication}
              onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
              placeholder="e.g., Hypertension"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Instructions</label>
            <Textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Special instructions for the patient..."
              rows={3}
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
