import { Process, User } from '../../shared/types';

const API_BASE = '/api/processes';

export async function fetchTemplates(): Promise<Process[]> {
  const res = await fetch(`${API_BASE}/templates`);
  return res.json();
}

export async function fetchProcesses(): Promise<Process[]> {
  const res = await fetch(API_BASE);
  return res.json();
}

export async function fetchProcess(id: string): Promise<Process> {
  const res = await fetch(`${API_BASE}/${id}`);
  return res.json();
}

export async function createProcessFromTemplate(templateId: string): Promise<Process> {
  const res = await fetch(`${API_BASE}/from-template/${templateId}`, { method: 'POST' });
  return res.json();
}

export async function updateProcess(id: string, data: Partial<Process>): Promise<Process> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function addSubNode(processId: string, parentNodeId: string, data: any): Promise<Process> {
  const res = await fetch(`${API_BASE}/${processId}/nodes/${parentNodeId}/sub`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateNode(processId: string, nodeId: string, data: any): Promise<Process> {
  const res = await fetch(`${API_BASE}/${processId}/nodes/${nodeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function submitProcess(processId: string): Promise<Process> {
  const res = await fetch(`${API_BASE}/${processId}/submit`, { method: 'POST' });
  return res.json();
}

export async function approveProcess(processId: string, comment: string): Promise<Process> {
  const res = await fetch(`${API_BASE}/${processId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment }),
  });
  return res.json();
}

export async function rejectProcess(processId: string, comment: string): Promise<Process> {
  const res = await fetch(`${API_BASE}/${processId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment }),
  });
  return res.json();
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/users`);
  return res.json();
}
