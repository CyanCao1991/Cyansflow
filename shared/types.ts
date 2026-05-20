export interface User {
  id: string;
  name: string;
  email: string;
  role: 'it_admin' | 'process_owner' | 'business_user';
  department: string;
}

export interface ProcessNode {
  id: string;
  name: string;
  type: 'trunk' | 'sub';
  parentId?: string;
  department: string;
  owner: string;
  description: string;
  input: string;
  output: string;
  feishuTableLink?: string;
  feishuDocLink?: string;
  children: ProcessNode[];
}

export interface Process {
  id: string;
  code: string;
  name: string;
  version: string;
  status: 'draft' | 'pending_review' | 'approved';
  owner: string;
  department: string;
  createdAt: string;
  updatedAt: string;
  trunkNodes: ProcessNode[];
  isTemplate: boolean;
}

export interface ApprovalRecord {
  id: string;
  processId: string;
  version: string;
  submitter: string;
  reviewer: string;
  status: 'pending' | 'approved' | 'rejected';
  comment: string;
  createdAt: string;
}
