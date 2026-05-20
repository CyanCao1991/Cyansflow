import { Router, Request, Response } from 'express';
import { processService } from '../services/processService';
import { userRepository } from '../repositories/fileRepository';
import { User } from '../../shared/types';

const router = Router();

// 简单的用户获取（实际应用中应该使用身份验证）
function getCurrentUser(): User {
  return userRepository.getById('1')!; // 默认返回IT管理员用于演示
}

router.get('/', (_req: Request, res: Response) => {
  try {
    const processes = processService.getAllProcesses();
    res.json(processes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get processes' });
  }
});

router.get('/templates', (_req: Request, res: Response) => {
  try {
    const templates = processService.getAllTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const process = processService.getProcessById(req.params.id);
    if (!process) {
      res.status(404).json({ error: 'Process not found' });
      return;
    }
    res.json(process);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get process' });
  }
});

router.post('/from-template/:templateId', (req: Request, res: Response) => {
  try {
    const user = getCurrentUser();
    const process = processService.createProcessFromTemplate(req.params.templateId, user);
    res.status(201).json(process);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create process' });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const user = getCurrentUser();
    const process = processService.updateProcess(req.params.id, req.body, user);
    res.json(process);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update process' });
  }
});

router.post('/:id/nodes/:parentNodeId/sub', (req: Request, res: Response) => {
  try {
    const user = getCurrentUser();
    const process = processService.addSubNode(req.params.id, req.params.parentNodeId, req.body, user);
    res.json(process);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add sub node' });
  }
});

router.put('/:id/nodes/:nodeId', (req: Request, res: Response) => {
  try {
    const user = getCurrentUser();
    const process = processService.updateNode(req.params.id, req.params.nodeId, req.body, user);
    res.json(process);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update node' });
  }
});

router.post('/:id/submit', (req: Request, res: Response) => {
  try {
    const user = getCurrentUser();
    const process = processService.submitForApproval(req.params.id, user);
    res.json(process);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit for approval' });
  }
});

router.post('/:id/approve', (req: Request, res: Response) => {
  try {
    const user = getCurrentUser();
    const { comment } = req.body;
    const process = processService.approveProcess(req.params.id, user, comment);
    res.json(process);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve process' });
  }
});

router.post('/:id/reject', (req: Request, res: Response) => {
  try {
    const user = getCurrentUser();
    const { comment } = req.body;
    const process = processService.rejectProcess(req.params.id, user, comment);
    res.json(process);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject process' });
  }
});

router.get('/:id/versions', (req: Request, res: Response) => {
  try {
    const versions = processService.getVersionHistory(req.params.id);
    res.json(versions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get version history' });
  }
});

router.get('/:id/versions/:version', (req: Request, res: Response) => {
  try {
    const process = processService.getVersion(req.params.id, req.params.version);
    if (!process) {
      res.status(404).json({ error: 'Version not found' });
      return;
    }
    res.json(process);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get version' });
  }
});

router.get('/users', (_req: Request, res: Response) => {
  try {
    const users = userRepository.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
});

export default router;
