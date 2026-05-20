import { AssetMap, AssetNode, AssetEdge, AssetNodeType, NODE_TYPE_COLORS } from '../types';

const ASSET_MAP_STORAGE_KEY = 'bpflow_asset_maps';

export const generateId = () => `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
export const generateNodeId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
export const generateEdgeId = () => `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const getAssetMaps = (): AssetMap[] => {
  try {
    const stored = localStorage.getItem(ASSET_MAP_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load asset maps:', error);
  }
  return [];
};

export const saveAssetMaps = (maps: AssetMap[]): void => {
  try {
    localStorage.setItem(ASSET_MAP_STORAGE_KEY, JSON.stringify(maps));
  } catch (error) {
    console.error('Failed to save asset maps:', error);
  }
};

export const getAssetMapsByProject = (projectId: string): AssetMap[] => {
  const maps = getAssetMaps();
  return maps.filter(map => map.projectId === projectId);
};

export const createAssetMap = (projectId: string, name: string, description?: string): AssetMap => {
  const newMap: AssetMap = {
    id: generateId(),
    projectId,
    name,
    description,
    nodes: [
      // 默认添加几个示例节点
      {
        id: generateNodeId(),
        type: 'process',
        label: '开始',
        description: '流程开始节点',
        x: 100,
        y: 200,
      },
      {
        id: generateNodeId(),
        type: 'system',
        label: '业务系统',
        description: '核心业务处理系统',
        x: 350,
        y: 200,
      },
      {
        id: generateNodeId(),
        type: 'milestone',
        label: '完成',
        description: '流程完成里程碑',
        x: 600,
        y: 200,
      },
    ],
    edges: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const maps = getAssetMaps();
  maps.push(newMap);
  saveAssetMaps(maps);

  return newMap;
};

export const updateAssetMap = (mapId: string, updates: Partial<AssetMap>): AssetMap | null => {
  const maps = getAssetMaps();
  const index = maps.findIndex(m => m.id === mapId);

  if (index === -1) {
    return null;
  }

  maps[index] = {
    ...maps[index],
    ...updates,
    updatedAt: Date.now(),
  };

  saveAssetMaps(maps);
  return maps[index];
};

export const deleteAssetMap = (mapId: string): boolean => {
  const maps = getAssetMaps();
  const filtered = maps.filter(m => m.id !== mapId);

  if (filtered.length === maps.length) {
    return false;
  }

  saveAssetMaps(filtered);
  return true;
};

export const addNode = (mapId: string, node: Omit<AssetNode, 'id'>): AssetNode => {
  const maps = getAssetMaps();
  const mapIndex = maps.findIndex(m => m.id === mapId);

  if (mapIndex === -1) {
    throw new Error('Asset map not found');
  }

  const newNode: AssetNode = {
    ...node,
    id: generateNodeId(),
  };

  maps[mapIndex].nodes.push(newNode);
  maps[mapIndex].updatedAt = Date.now();
  saveAssetMaps(maps);

  return newNode;
};

export const updateNode = (mapId: string, nodeId: string, updates: Partial<AssetNode>): AssetNode | null => {
  const maps = getAssetMaps();
  const mapIndex = maps.findIndex(m => m.id === mapId);

  if (mapIndex === -1) {
    return null;
  }

  const nodeIndex = maps[mapIndex].nodes.findIndex(n => n.id === nodeId);
  if (nodeIndex === -1) {
    return null;
  }

  maps[mapIndex].nodes[nodeIndex] = {
    ...maps[mapIndex].nodes[nodeIndex],
    ...updates,
  };
  maps[mapIndex].updatedAt = Date.now();
  saveAssetMaps(maps);

  return maps[mapIndex].nodes[nodeIndex];
};

export const deleteNode = (mapId: string, nodeId: string): boolean => {
  const maps = getAssetMaps();
  const mapIndex = maps.findIndex(m => m.id === mapId);

  if (mapIndex === -1) {
    return false;
  }

  const nodeIndex = maps[mapIndex].nodes.findIndex(n => n.id === nodeId);
  if (nodeIndex === -1) {
    return false;
  }

  // 删除节点同时删除相关的边
  maps[mapIndex].edges = maps[mapIndex].edges.filter(
    e => e.source !== nodeId && e.target !== nodeId
  );
  maps[mapIndex].nodes.splice(nodeIndex, 1);
  maps[mapIndex].updatedAt = Date.now();
  saveAssetMaps(maps);

  return true;
};

export const addEdge = (mapId: string, edge: Omit<AssetEdge, 'id'>): AssetEdge => {
  const maps = getAssetMaps();
  const mapIndex = maps.findIndex(m => m.id === mapId);

  if (mapIndex === -1) {
    throw new Error('Asset map not found');
  }

  const newEdge: AssetEdge = {
    ...edge,
    id: generateEdgeId(),
  };

  maps[mapIndex].edges.push(newEdge);
  maps[mapIndex].updatedAt = Date.now();
  saveAssetMaps(maps);

  return newEdge;
};

export const deleteEdge = (mapId: string, edgeId: string): boolean => {
  const maps = getAssetMaps();
  const mapIndex = maps.findIndex(m => m.id === mapId);

  if (mapIndex === -1) {
    return false;
  }

  const edgeIndex = maps[mapIndex].edges.findIndex(e => e.id === edgeId);
  if (edgeIndex === -1) {
    return false;
  }

  maps[mapIndex].edges.splice(edgeIndex, 1);
  maps[mapIndex].updatedAt = Date.now();
  saveAssetMaps(maps);

  return true;
};

export const duplicateAssetMap = (mapId: string, newName?: string): AssetMap | null => {
  const maps = getAssetMaps();
  const original = maps.find(m => m.id === mapId);

  if (!original) {
    return null;
  }

  const duplicated: AssetMap = {
    id: generateId(),
    projectId: original.projectId,
    name: newName || `${original.name} (副本)`,
    description: original.description,
    nodes: original.nodes.map(n => ({
      ...n,
      id: generateNodeId(),
    })),
    edges: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // 复制边，需要重新映射节点ID
  const nodeIdMap = new Map(
    original.nodes.map((n, i) => [n.id, duplicated.nodes[i].id])
  );
  duplicated.edges = original.edges.map(e => ({
    ...e,
    id: generateEdgeId(),
    source: nodeIdMap.get(e.source) || e.source,
    target: nodeIdMap.get(e.target) || e.target,
  }));

  maps.push(duplicated);
  saveAssetMaps(maps);

  return duplicated;
};
