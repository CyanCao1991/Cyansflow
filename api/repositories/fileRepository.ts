import fs from 'fs';
import path from 'path';
import { User, Process, ApprovalRecord } from '../../shared/types';

const DATA_DIR = path.join(process.cwd(), 'data');

function readJson<T>(filePath: string): T[] {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data) as T[];
  } catch {
    return [];
  }
}

function writeJson<T>(filePath: string, data: T[]): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export const userRepository = {
  getAll: (): User[] => readJson<User>(path.join(DATA_DIR, 'users.json')),
  getById: (id: string): User | undefined => userRepository.getAll().find(u => u.id === id),
};

export const processRepository = {
  getAll: (): Process[] => readJson<Process>(path.join(DATA_DIR, 'processes.json')),
  getById: (id: string): Process | undefined => processRepository.getAll().find(p => p.id === id),
  save: (processes: Process[]): void => writeJson<Process>(path.join(DATA_DIR, 'processes.json'), processes),
  add: (process: Process): void => {
    const processes = processRepository.getAll();
    processes.push(process);
    processRepository.save(processes);
  },
  update: (id: string, process: Process): void => {
    const processes = processRepository.getAll();
    const index = processes.findIndex(p => p.id === id);
    if (index !== -1) {
      processes[index] = process;
      processRepository.save(processes);
    }
  },
};

export const templateRepository = {
  getAll: (): Process[] => readJson<Process>(path.join(DATA_DIR, 'templates.json')),
  getById: (id: string): Process | undefined => templateRepository.getAll().find(p => p.id === id),
  save: (templates: Process[]): void => writeJson<Process>(path.join(DATA_DIR, 'templates.json'), templates),
  add: (template: Process): void => {
    const templates = templateRepository.getAll();
    templates.push(template);
    templateRepository.save(templates);
  },
};

export const approvalRepository = {
  getAll: (): ApprovalRecord[] => readJson<ApprovalRecord>(path.join(DATA_DIR, 'approval_records.json')),
  getByProcessId: (processId: string): ApprovalRecord[] => approvalRepository.getAll().filter(a => a.processId === processId),
  save: (approvals: ApprovalRecord[]): void => writeJson<ApprovalRecord>(path.join(DATA_DIR, 'approval_records.json'), approvals),
  add: (approval: ApprovalRecord): void => {
    const approvals = approvalRepository.getAll();
    approvals.push(approval);
    approvalRepository.save(approvals);
  },
};

export const versionRepository = {
  save: (processId: string, version: string, process: Process): void => {
    const versionFile = path.join(DATA_DIR, 'versions', `${processId}_v${version}.json`);
    fs.writeFileSync(versionFile, JSON.stringify(process, null, 2));
  },
  get: (processId: string, version: string): Process | null => {
    const versionFile = path.join(DATA_DIR, 'versions', `${processId}_v${version}.json`);
    try {
      const data = fs.readFileSync(versionFile, 'utf8');
      return JSON.parse(data) as Process;
    } catch {
      return null;
    }
  },
  list: (processId: string): string[] => {
    const versionsDir = path.join(DATA_DIR, 'versions');
    try {
      const files = fs.readdirSync(versionsDir);
      return files.filter(f => f.startsWith(`${processId}_v`)).map(f => f.replace(`${processId}_v`, '').replace('.json', ''));
    } catch {
      return [];
    }
  },
};
