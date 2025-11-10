import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { labOrdersApi } from '@/lib/api';
import type { LabOrder, OrderPriority } from '@/types';
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

interface LabOrderDialogProps {
  encounterId: string;
  patientId: string;
  onClose: () => void;
  onOrderCreated: () => void;
}

export function LabOrderDialog({
  encounterId,
  patientId,
  onClose,
  onOrderCreated,
}: LabOrderDialogProps) {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    testName: '',
    testCode: '',
    indication: '',
    instructions: '',
    priority: 'routine' as OrderPriority,
  });

  const handleSubmit = async () => {
    if (!formData.testName || !formData.indication) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const order: LabOrder = {
        orderId: `lab-${Date.now()}`,
        encounterId,
        patientId,
        orderedBy: user?.userId || '',
        orderedByName: user?.name || '',
        orderedAt: new Date().toISOString(),
        status: 'ordered',
        testName: formData.testName,
        testCode: formData.testCode || undefined,
        indication: formData.indication,
        instructions: formData.instructions || undefined,
        priority: formData.priority,
      };

      await labOrdersApi.create(order);
      onOrderCreated();
    } catch (error) {
      console.error('Error creating lab order:', error);
      alert('Failed to create lab order');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Lab Order</DialogTitle>
          <DialogDescription>
            Order laboratory tests
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Test Name *</label>
              <Input
                value={formData.testName}
                onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                placeholder="e.g., Complete Blood Count (CBC)"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Test Code</label>
              <Input
                value={formData.testCode}
                onChange={(e) => setFormData({ ...formData, testCode: e.target.value })}
                placeholder="e.g., CBC"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Indication *</label>
            <Input
              value={formData.indication}
              onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
              placeholder="e.g., Anemia workup"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Special Instructions</label>
            <Textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Any special collection or handling instructions..."
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
