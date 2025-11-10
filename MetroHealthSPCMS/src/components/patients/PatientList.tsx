import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '@/lib/api';
import type { PatientProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Users, AlertCircle, Activity } from 'lucide-react';
import { format } from 'date-fns';

export function PatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchTerm, patients]);

  const loadPatients = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await patientApi.getAll();
      if (response.success && response.data) {
        setPatients(response.data);
      } else {
        setError(response.error || 'Failed to load patients');
      }
    } catch (err) {
      setError('An error occurred while loading patients');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPatients = () => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = patients.filter(
      (patient) =>
        patient.firstName.toLowerCase().includes(term) ||
        patient.lastName.toLowerCase().includes(term) ||
        patient.mrn.toLowerCase().includes(term) ||
        patient.room?.toLowerCase().includes(term) ||
        patient.patientId.toLowerCase().includes(term)
    );
    setFilteredPatients(filtered);
  };

  const getStatusBadge = (status: PatientProfile['status']) => {
    const variants = {
      admitted: 'default',
      discharged: 'secondary',
      transferred: 'outline',
      emergency: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRiskLevelBadge = (riskLevel?: PatientProfile['riskLevel']) => {
    if (!riskLevel) return null;

    const config = {
      critical: { variant: 'destructive' as const, label: 'Critical' },
      high: { variant: 'destructive' as const, label: 'High Risk' },
      medium: { variant: 'default' as const, label: 'Monitoring' },
      low: { variant: 'secondary' as const, label: 'Stable' },
    };

    const { variant, label } = config[riskLevel];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleRowClick = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  const formatDOB = (dob: string) => {
    try {
      return format(new Date(dob), 'MM/dd/yyyy');
    } catch {
      return dob;
    }
  };

  const getPrimaryCareTeam = (patient: PatientProfile) => {
    const primaryProvider = patient.careTeam.find(
      (member) => member.role === 'provider' && member.isPrimary
    );
    const primaryNurse = patient.careTeam.find(
      (member) => member.role === 'nurse' && member.isPrimary
    );

    return (
      <div className="text-sm">
        {primaryProvider && (
          <div className="font-medium">{primaryProvider.name}</div>
        )}
        {primaryNurse && (
          <div className="text-muted-foreground">{primaryNurse.name}</div>
        )}
        {!primaryProvider && !primaryNurse && (
          <div className="text-muted-foreground">Not assigned</div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8" />
            Patient List
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all patients in the system
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Patients</CardDescription>
              <CardTitle className="text-3xl">{patients.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Admitted</CardDescription>
              <CardTitle className="text-3xl">
                {patients.filter((p) => p.status === 'admitted').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Critical</CardDescription>
              <CardTitle className="text-3xl text-destructive">
                {patients.filter((p) => p.riskLevel === 'critical').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>High Risk</CardDescription>
              <CardTitle className="text-3xl text-orange-600">
                {patients.filter((p) => p.riskLevel === 'high').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Search Patients</CardTitle>
            <CardDescription>
              Search by name, MRN, room number, or patient ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patient Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Patients ({filteredPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading patients...
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm
                  ? 'No patients found matching your search'
                  : 'No patients in the system'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>MRN</TableHead>
                      <TableHead>DOB</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Care Team</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow
                        key={patient.patientId}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(patient.patientId)}
                      >
                        <TableCell className="font-medium">
                          {patient.firstName} {patient.lastName}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {patient.mrn}
                        </TableCell>
                        <TableCell>{formatDOB(patient.dateOfBirth)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{patient.room || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(patient.status)}</TableCell>
                        <TableCell>{getRiskLevelBadge(patient.riskLevel)}</TableCell>
                        <TableCell>{getPrimaryCareTeam(patient)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(patient.patientId);
                            }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
