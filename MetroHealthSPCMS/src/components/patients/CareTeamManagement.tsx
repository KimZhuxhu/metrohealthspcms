import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientApi, userApi } from '@/lib/api';
import type { PatientProfile, UserProfile, CareTeamMember } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Phone,
  Mail,
  Star,
  X,
  Stethoscope,
} from 'lucide-react';

export function CareTeamManagement() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'provider' | 'nurse'>('provider');
  const [isPrimary, setIsPrimary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patientId) {
      loadData();
    }
  }, [patientId]);

  const loadData = async () => {
    if (!patientId) return;

    setIsLoading(true);
    setError('');

    try {
      const [patientRes, usersRes] = await Promise.all([
        patientApi.getById(patientId),
        userApi.getAll(),
      ]);

      if (!patientRes.success || !patientRes.data) {
        setError(patientRes.error || 'Patient not found');
        return;
      }

      setPatient(patientRes.data);

      if (usersRes.success && usersRes.data) {
        // Filter to only providers and nurses
        const staffUsers = usersRes.data.filter(
          (u) => u.roles.includes('provider') || u.roles.includes('nurse')
        );
        setAllUsers(staffUsers);
      }
    } catch (err) {
      setError('Failed to load care team data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTeamMember = async () => {
    if (!patient || !selectedUserId) return;

    const selectedUser = allUsers.find((u) => u.userId === selectedUserId);
    if (!selectedUser) return;

    // Check if user is already in care team
    if (patient.careTeam.some((m) => m.userId === selectedUserId)) {
      setError('This user is already on the care team');
      return;
    }

    const newMember: CareTeamMember = {
      userId: selectedUser.userId,
      name: selectedUser.name,
      role: selectedRole,
      specialty: selectedUser.department,
      isPrimary,
    };

    // If setting as primary, remove primary from others with same role
    let updatedTeam = [...patient.careTeam];
    if (isPrimary) {
      updatedTeam = updatedTeam.map((m) =>
        m.role === selectedRole ? { ...m, isPrimary: false } : m
      );
    }

    updatedTeam.push(newMember);

    // Update patient (in real app, this would be an API call)
    const updatedPatient = { ...patient, careTeam: updatedTeam };
    setPatient(updatedPatient);

    // Update localStorage
    const patients: PatientProfile[] = JSON.parse(
      localStorage.getItem('metro_health_patients') || '[]'
    );
    const index = patients.findIndex((p) => p.patientId === patientId);
    if (index !== -1) {
      patients[index] = updatedPatient;
      localStorage.setItem('metro_health_patients', JSON.stringify(patients));
    }

    // Reset dialog
    setIsAddDialogOpen(false);
    setSelectedUserId('');
    setSelectedRole('provider');
    setIsPrimary(false);
    setError('');
  };

  const handleRemoveTeamMember = (userId: string) => {
    if (!patient) return;

    const updatedTeam = patient.careTeam.filter((m) => m.userId !== userId);
    const updatedPatient = { ...patient, careTeam: updatedTeam };
    setPatient(updatedPatient);

    // Update localStorage
    const patients: PatientProfile[] = JSON.parse(
      localStorage.getItem('metro_health_patients') || '[]'
    );
    const index = patients.findIndex((p) => p.patientId === patientId);
    if (index !== -1) {
      patients[index] = updatedPatient;
      localStorage.setItem('metro_health_patients', JSON.stringify(patients));
    }
  };

  const handleTogglePrimary = (userId: string, role: 'provider' | 'nurse') => {
    if (!patient) return;

    const updatedTeam = patient.careTeam.map((member) => {
      if (member.userId === userId) {
        return { ...member, isPrimary: !member.isPrimary };
      }
      // Remove primary from others with same role if setting this one as primary
      if (member.role === role && member.userId !== userId) {
        return { ...member, isPrimary: false };
      }
      return member;
    });

    const updatedPatient = { ...patient, careTeam: updatedTeam };
    setPatient(updatedPatient);

    // Update localStorage
    const patients: PatientProfile[] = JSON.parse(
      localStorage.getItem('metro_health_patients') || '[]'
    );
    const index = patients.findIndex((p) => p.patientId === patientId);
    if (index !== -1) {
      patients[index] = updatedPatient;
      localStorage.setItem('metro_health_patients', JSON.stringify(patients));
    }
  };

  const getUserContact = (userId: string) => {
    return allUsers.find((u) => u.userId === userId);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Users className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading care team...</p>
        </div>
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <X className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="text-lg font-semibold mb-2">{error}</h3>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!patient) return null;

  const providers = patient.careTeam.filter((m) => m.role === 'provider');
  const nurses = patient.careTeam.filter((m) => m.role === 'nurse');
  const otherStaff = patient.careTeam.filter(
    (m) => m.role !== 'provider' && m.role !== 'nurse'
  );

  const availableUsers = allUsers.filter(
    (u) =>
      !patient.careTeam.some((m) => m.userId === u.userId) &&
      (u.roles.includes('provider') || u.roles.includes('nurse'))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8" />
                Care Team Management
              </h1>
              <p className="text-muted-foreground mt-1">
                {patient.firstName} {patient.lastName} - MRN: {patient.mrn}
              </p>
            </div>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Providers Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Providers ({providers.length})
            </CardTitle>
            <CardDescription>Attending physicians and specialists</CardDescription>
          </CardHeader>
          <CardContent>
            {providers.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {providers.map((member) => {
                  const contact = getUserContact(member.userId);
                  return (
                    <Card key={member.userId}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={contact?.avatar} />
                              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{member.name}</p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {member.specialty || 'Provider'}
                              </p>
                            </div>
                          </div>
                          {member.isPrimary && (
                            <Badge variant="default" className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current" />
                              Primary
                            </Badge>
                          )}
                        </div>

                        {contact && (
                          <div className="space-y-2 mb-4">
                            {contact.email && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                {contact.email}
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                {contact.phone}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleTogglePrimary(member.userId, 'provider')
                            }
                          >
                            {member.isPrimary ? 'Remove Primary' : 'Set as Primary'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTeamMember(member.userId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No providers assigned
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nurses Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Nurses ({nurses.length})
            </CardTitle>
            <CardDescription>Primary and supporting nursing staff</CardDescription>
          </CardHeader>
          <CardContent>
            {nurses.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {nurses.map((member) => {
                  const contact = getUserContact(member.userId);
                  return (
                    <Card key={member.userId}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={contact?.avatar} />
                              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{member.name}</p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {member.specialty || 'Nurse'}
                              </p>
                            </div>
                          </div>
                          {member.isPrimary && (
                            <Badge variant="default" className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current" />
                              Primary
                            </Badge>
                          )}
                        </div>

                        {contact && (
                          <div className="space-y-2 mb-4">
                            {contact.email && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                {contact.email}
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                {contact.phone}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePrimary(member.userId, 'nurse')}
                          >
                            {member.isPrimary ? 'Remove Primary' : 'Set as Primary'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTeamMember(member.userId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No nurses assigned
              </div>
            )}
          </CardContent>
        </Card>

        {/* Other Staff Section */}
        {otherStaff.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Other Care Team Members ({otherStaff.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {otherStaff.map((member) => {
                  const contact = getUserContact(member.userId);
                  return (
                    <Card key={member.userId}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={contact?.avatar} />
                              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{member.name}</p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {member.role}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTeamMember(member.userId)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Team Member Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Care Team Member</DialogTitle>
              <DialogDescription>
                Assign a provider or nurse to this patient's care team
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="user-select">Select Staff Member</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger id="user-select">
                    <SelectValue placeholder="Choose a staff member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.userId} value={user.userId}>
                        {user.name} -{' '}
                        {user.roles.includes('provider') ? 'Provider' : 'Nurse'}
                        {user.department && ` (${user.department})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="role-select">Role</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(val) =>
                    setSelectedRole(val as 'provider' | 'nurse')
                  }
                >
                  <SelectTrigger id="role-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="provider">Provider</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="primary-checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="primary-checkbox" className="cursor-pointer">
                  Set as primary {selectedRole}
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTeamMember} disabled={!selectedUserId}>
                Add to Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
