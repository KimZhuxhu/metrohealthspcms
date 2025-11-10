import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { procedureOrdersApi } from '@/lib/api';
import type { ProcedureOrder, OrderPriority } from '@/types';
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

interface ProcedureOrderDialogProps {
  encounterId: string;
  patientId: string;
  onClose: () => void;
  onOrderCreated: () => void;
}

export function ProcedureOrderDialog({
  encounterId,
  patientId,
  onClose,
  onOrderCreated,
}: ProcedureOrderDialogProps) {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    procedureName: '',
    procedureCode: '',
    indication: '',
    instructions: '',
    priority: 'routine' as OrderPriority,
  });

  const handleSubmit = async () => {
    if (!formData.procedureName || !formData.indication) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const order: ProcedureOrder = {
        orderId: `proc-${Date.now()}`,
        encounterId,
        patientId,
        orderedBy: user?.userId || '',
        orderedByName: user?.name || '',
        orderedAt: new Date().toISOString(),
        status: 'ordered',
        procedureName: formData.procedureName,
        procedureCode: formData.procedureCode || undefined,
        indication: formData.indication,
        instructions: formData.instructions || undefined,
        priority: formData.priority,
      };

      await procedureOrdersApi.create(order);
      onOrderCreated();
    } catch (error) {
      console.error('Error creating procedure order:', error);
      alert('Failed to create procedure order');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Procedure Order</DialogTitle>
          <DialogDescription>
            Order procedures
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Procedure Name *</label>
              <Input
                value={formData.procedureName}
                onChange={(e) => setFormData({ ...formData, procedureName: e.target.value })}
                placeholder="e.g., Colonoscopy, Biopsy"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Procedure Code (CPT)</label>
              <Input
                value={formData.procedureCode}
                onChange={(e) => setFormData({ ...formData, procedureCode: e.target.value })}
                placeholder="e.g., 45378"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Indication *</label>
            <Input
              value={formData.indication}
              onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
              placeholder="e.g., Screening, diagnostic"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Special Instructions</label>
            <Textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Preparation instructions, special considerations..."
              rows={4}
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
