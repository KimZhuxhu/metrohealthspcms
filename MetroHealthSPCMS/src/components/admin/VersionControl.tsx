import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GitBranch, 
  GitCommit, 
  History, 
  RefreshCw,
  CheckCircle,
  FileText,
  Calendar,
  User,
  Plus,
  GitMerge
} from 'lucide-react';
import { format } from 'date-fns';

interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
  filesChanged: number;
  insertions: number;
  deletions: number;
}

interface GitBranchInfo {
  name: string;
  current: boolean;
  lastCommit: string;
}

interface GitStatus {
  branch: string;
  modified: string[];
  untracked: string[];
  staged: string[];
  ahead: number;
  behind: number;
}

export default function VersionControl() {
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [branches, setBranches] = useState<GitBranchInfo[]>([]);
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [commitDialogOpen, setCommitDialogOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [commitDescription, setCommitDescription] = useState('');

  useEffect(() => {
    loadGitData();
    const interval = setInterval(loadGitData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadGitData = async () => {
    // Simulated data - in a real app, you'd call Git commands via an API
    // For now, showing mock data structure
    
    const mockCommits: GitCommit[] = [
      {
        hash: '4dd1ca4',
        message: 'feat: Add comprehensive Nurse Dashboard & Workflow system',
        author: 'Developer',
        date: new Date().toISOString(),
        filesChanged: 7,
        insertions: 3925,
        deletions: 0,
      },
      {
        hash: 'abc123d',
        message: 'feat: Add Clinical Documentation (SOAP Notes) system',
        author: 'Developer',
        date: new Date(Date.now() - 86400000).toISOString(),
        filesChanged: 9,
        insertions: 2847,
        deletions: 12,
      },
      {
        hash: 'def456e',
        message: 'feat: Add Vitals Monitoring & Alert System',
        author: 'Developer',
        date: new Date(Date.now() - 172800000).toISOString(),
        filesChanged: 6,
        insertions: 1923,
        deletions: 5,
      },
      {
        hash: 'ghi789f',
        message: 'feat: Add Patient Management System',
        author: 'Developer',
        date: new Date(Date.now() - 259200000).toISOString(),
        filesChanged: 8,
        insertions: 2156,
        deletions: 8,
      },
    ];

    const mockBranches: GitBranchInfo[] = [
      { name: 'admin-role-restrictions', current: true, lastCommit: '4dd1ca4' },
      { name: 'main', current: false, lastCommit: 'ghi789f' },
      { name: 'feature/provider-dashboard', current: false, lastCommit: 'abc123d' },
    ];

    const mockStatus: GitStatus = {
      branch: 'admin-role-restrictions',
      modified: [],
      untracked: [],
      staged: [],
      ahead: 3,
      behind: 0,
    };

    setCommits(mockCommits);
    setBranches(mockBranches);
    setStatus(mockStatus);
    setLoading(false);
  };

  const handleCreateCommit = () => {
    setCommitDialogOpen(true);
  };

  const handleCommitSubmit = () => {
    // In a real app, this would execute git commands via an API
    console.log('Creating commit:', commitMessage, commitDescription);
    setCommitDialogOpen(false);
    setCommitMessage('');
    setCommitDescription('');
    loadGitData();
  };

  const getCommitType = (message: string) => {
    if (message.startsWith('feat:')) return { label: 'Feature', color: 'bg-blue-500' };
    if (message.startsWith('fix:')) return { label: 'Fix', color: 'bg-red-500' };
    if (message.startsWith('docs:')) return { label: 'Docs', color: 'bg-green-500' };
    if (message.startsWith('refactor:')) return { label: 'Refactor', color: 'bg-yellow-500' };
    if (message.startsWith('test:')) return { label: 'Test', color: 'bg-purple-500' };
    return { label: 'Other', color: 'bg-gray-500' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading version control data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Version Control</h1>
          <p className="text-muted-foreground">
            Track development progress and manage code changes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadGitData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateCommit}>
            <Plus className="h-4 w-4 mr-2" />
            Create Commit
          </Button>
        </div>
      </div>

      {/* Repository Status */}
      {status && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Branch</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status.branch}</div>
              <p className="text-xs text-muted-foreground">Active development branch</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modified Files</CardTitle>
              <FileText className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status.modified.length}</div>
              <p className="text-xs text-muted-foreground">Pending changes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commits Ahead</CardTitle>
              <GitCommit className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{status.ahead}</div>
              <p className="text-xs text-muted-foreground">Ready to push</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commits</CardTitle>
              <History className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{commits.length}</div>
              <p className="text-xs text-muted-foreground">In history</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="commits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="commits">
            <History className="h-4 w-4 mr-2" />
            Commit History
          </TabsTrigger>
          <TabsTrigger value="branches">
            <GitBranch className="h-4 w-4 mr-2" />
            Branches
          </TabsTrigger>
          <TabsTrigger value="changes">
            <FileText className="h-4 w-4 mr-2" />
            Working Changes
          </TabsTrigger>
        </TabsList>

        {/* Commit History Tab */}
        <TabsContent value="commits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Commits</CardTitle>
            </CardHeader>
            <CardContent>
              {commits.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No commits yet</p>
              ) : (
                <div className="space-y-4">
                  {commits.map((commit) => {
                    const commitType = getCommitType(commit.message);
                    
                    return (
                      <div key={commit.hash} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`px-2 py-1 rounded text-white text-xs font-medium ${commitType.color}`}>
                                {commitType.label}
                              </div>
                              <Badge variant="outline" className="font-mono text-xs">
                                {commit.hash}
                              </Badge>
                            </div>
                            <div className="font-medium text-base mb-1">
                              {commit.message.replace(/^(feat|fix|docs|refactor|test):\s*/, '')}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {commit.author}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(commit.date), 'MMM d, yyyy h:mm a')}
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {commit.filesChanged} files
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs mt-2">
                          <span className="text-green-600">+{commit.insertions} additions</span>
                          {commit.deletions > 0 && (
                            <span className="text-red-600">-{commit.deletions} deletions</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Repository Branches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {branches.map((branch) => (
                  <div
                    key={branch.name}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      branch.current ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <GitBranch className={`h-5 w-5 ${branch.current ? 'text-blue-600' : 'text-muted-foreground'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{branch.name}</span>
                          {branch.current && (
                            <Badge variant="default" className="bg-blue-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Last commit: {branch.lastCommit}
                        </div>
                      </div>
                    </div>
                    {!branch.current && (
                      <Button variant="outline" size="sm">
                        <GitMerge className="h-4 w-4 mr-2" />
                        Checkout
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Working Changes Tab */}
        <TabsContent value="changes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Working Directory</CardTitle>
            </CardHeader>
            <CardContent>
              {status && (status.modified.length === 0 && status.untracked.length === 0 && status.staged.length === 0) ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="font-medium">Working tree clean</p>
                  <p className="text-sm text-muted-foreground">No uncommitted changes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {status && status.staged.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2 text-green-600">Staged Changes ({status.staged.length})</h3>
                      <div className="space-y-1">
                        {status.staged.map((file, idx) => (
                          <div key={idx} className="text-sm font-mono text-green-600">+ {file}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {status && status.modified.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2 text-yellow-600">Modified Files ({status.modified.length})</h3>
                      <div className="space-y-1">
                        {status.modified.map((file, idx) => (
                          <div key={idx} className="text-sm font-mono text-yellow-600">M {file}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {status && status.untracked.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2 text-red-600">Untracked Files ({status.untracked.length})</h3>
                      <div className="space-y-1">
                        {status.untracked.map((file, idx) => (
                          <div key={idx} className="text-sm font-mono text-red-600">? {file}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button className="w-full mt-4" onClick={handleCreateCommit}>
                    <GitCommit className="h-4 w-4 mr-2" />
                    Stage and Commit Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Commit Dialog */}
      <Dialog open={commitDialogOpen} onOpenChange={setCommitDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Commit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="commitMessage">Commit Message *</Label>
              <Input
                id="commitMessage"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="feat: Add new feature..."
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use conventional commits: feat:, fix:, docs:, refactor:, test:
              </p>
            </div>

            <div>
              <Label htmlFor="commitDescription">Description (Optional)</Label>
              <Textarea
                id="commitDescription"
                value={commitDescription}
                onChange={(e) => setCommitDescription(e.target.value)}
                placeholder="Detailed description of changes..."
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Provide detailed context about the changes
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <div className="text-sm font-medium text-blue-900 mb-2">Preview:</div>
              <div className="font-mono text-sm text-blue-800">
                {commitMessage || '(empty message)'}
                {commitDescription && (
                  <>
                    <br /><br />
                    {commitDescription}
                  </>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCommitSubmit} disabled={!commitMessage}>
              <GitCommit className="h-4 w-4 mr-2" />
              Create Commit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
