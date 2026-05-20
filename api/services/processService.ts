import { User, Process, ProcessNode, ApprovalRecord } from '../../shared/types';
import {
  processRepository,
  templateRepository,
  approvalRepository,
  versionRepository,
} from '../repositories/fileRepository';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function cloneProcessNode(node: ProcessNode): ProcessNode {
  return {
    ...node,
    id: generateId(),
    children: node.children.map(cloneProcessNode),
  };
}

export const processService = {
  getAllProcesses: (): Process[] => {
    return processRepository.getAll();
  },

  getProcessById: (id: string): Process | null => {
    return processRepository.getById(id) || null;
  },

  getAllTemplates: (): Process[] => {
    return templateRepository.getAll();
  },

  createProcessFromTemplate: (templateId: string, user: User): Process => {
    const template = templateRepository.getById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const newProcess: Process = {
      id: generateId(),
      code: `PROC-${Date.now().toString().slice(-6)}`,
      name: `${template.name} - ${user.name}`,
      version: 'V1.0',
      status: 'draft',
      owner: user.name,
      department: user.department,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isTemplate: false,
      trunkNodes: template.trunkNodes.map(node => ({
        ...cloneProcessNode(node),
        type: 'trunk',
        children: [],
      })),
    };

    processRepository.add(newProcess);
    versionRepository.save(newProcess.id, '1.0', newProcess);
    return newProcess;
  },

  updateProcess: (id: string, updatedProcess: Partial<Process>, user: User): Process => {
    const process = processRepository.getById(id);
    if (!process) {
      throw new Error('Process not found');
    }

    const mergedProcess: Process = {
      ...process,
      ...updatedProcess,
      id: process.id,
      updatedAt: new Date().toISOString(),
    };

    processRepository.update(id, mergedProcess);
    return mergedProcess;
  },

  addSubNode: (processId: string, parentNodeId: string, subNode: Omit<ProcessNode, 'id' | 'type' | 'children'>, user: User): Process => {
    const process = processRepository.getById(processId);
    if (!process) {
      throw new Error('Process not found');
    }

    const newSubNode: ProcessNode = {
      ...subNode,
      id: generateId(),
      type: 'sub',
      parentId: parentNodeId,
      children: [],
    };

    function addSubNodeToTree(nodes: ProcessNode[]): ProcessNode[] {
      return nodes.map(node => {
        if (node.id === parentNodeId) {
          return { ...node, children: [...node.children, newSubNode] };
        }
        return { ...node, children: addSubNodeToTree(node.children) };
      });
    }

    const updatedProcess: Process = {
      ...process,
      trunkNodes: addSubNodeToTree(process.trunkNodes),
      updatedAt: new Date().toISOString(),
    };

    processRepository.update(processId, updatedProcess);
    return updatedProcess;
  },

  updateNode: (processId: string, nodeId: string, updates: Partial<ProcessNode>, user: User): Process => {
    const process = processRepository.getById(processId);
    if (!process) {
      throw new Error('Process not found');
    }

    function updateNodeInTree(nodes: ProcessNode[]): ProcessNode[] {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, ...updates };
        }
        return { ...node, children: updateNodeInTree(node.children) };
      });
    }

    const updatedProcess: Process = {
      ...process,
      trunkNodes: updateNodeInTree(process.trunkNodes),
      updatedAt: new Date().toISOString(),
    };

    processRepository.update(processId, updatedProcess);
    return updatedProcess;
  },

  submitForApproval: (processId: string, user: User): Process => {
    const process = processRepository.getById(processId);
    if (!process) {
      throw new Error('Process not found');
    }

    const updatedProcess: Process = {
      ...process,
      status: 'pending_review',
      updatedAt: new Date().toISOString(),
    };

    processRepository.update(processId, updatedProcess);

    const approval: ApprovalRecord = {
      id: generateId(),
      processId: processId,
      version: process.version,
      submitter: user.name,
      reviewer: '',
      status: 'pending',
      comment: '',
      createdAt: new Date().toISOString(),
    };
    approvalRepository.add(approval);

    return updatedProcess;
  },

  approveProcess: (processId: string, user: User, comment: string): Process => {
    const process = processRepository.getById(processId);
    if (!process) {
      throw new Error('Process not found');
    }

    const versionNum = parseFloat(process.version.replace('V', ''));
    const newVersion = `V${(versionNum + 0.1).toFixed(1)}`;

    const updatedProcess: Process = {
      ...process,
      status: 'approved',
      version: newVersion,
      updatedAt: new Date().toISOString(),
    };

    processRepository.update(processId, updatedProcess);
    versionRepository.save(processId, newVersion.replace('V', ''), updatedProcess);

    const approvals = approvalRepository.getAll();
    const pendingApproval = approvals.find(a => a.processId === processId && a.status === 'pending');
    if (pendingApproval) {
      pendingApproval.status = 'approved';
      pendingApproval.reviewer = user.name;
      pendingApproval.comment = comment;
      approvalRepository.save(approvals);
    }

    return updatedProcess;
  },

  rejectProcess: (processId: string, user: User, comment: string): Process => {
    const process = processRepository.getById(processId);
    if (!process) {
      throw new Error('Process not found');
    }

    const updatedProcess: Process = {
      ...process,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    };

    processRepository.update(processId, updatedProcess);

    const approvals = approvalRepository.getAll();
    const pendingApproval = approvals.find(a => a.processId === processId && a.status === 'pending');
    if (pendingApproval) {
      pendingApproval.status = 'rejected';
      pendingApproval.reviewer = user.name;
      pendingApproval.comment = comment;
      approvalRepository.save(approvals);
    }

    return updatedProcess;
  },

  getVersionHistory: (processId: string): string[] => {
    return versionRepository.list(processId);
  },

  getVersion: (processId: string, version: string): Process | null => {
    return versionRepository.get(processId, version);
  },
};
