import type {
  CollectionFolder,
  CollectionRequest,
  CollectionNode,
} from '@/types/collection';

export function buildCollectionTree(
  collectionId: string,
  allFolders: Record<string, CollectionFolder>,
  allRequests: Record<string, CollectionRequest>
): CollectionNode[] {
  const folders = Object.values(allFolders).filter(f => f.collectionId === collectionId);
  const requests = Object.values(allRequests).filter(r => r.collectionId === collectionId);

  // Map to hold nodes by their ID for easy access
  const nodeMap = new Map<string, CollectionNode>();

  // Initialize folder nodes
  for (const folder of folders) {
    nodeMap.set(folder.id, {
      id: folder.id,
      type: 'folder',
      node: folder,
      children: [],
    });
  }

  // Initialize request nodes
  for (const request of requests) {
    nodeMap.set(request.id, {
      id: request.id,
      type: 'request',
      node: request,
    });
  }

  const rootNodes: CollectionNode[] = [];

  // Build the tree
  for (const folder of folders) {
    const node = nodeMap.get(folder.id)!;
    if (folder.parentId && nodeMap.has(folder.parentId)) {
      nodeMap.get(folder.parentId)!.children!.push(node);
    } else {
      rootNodes.push(node);
    }
  }

  for (const request of requests) {
    const node = nodeMap.get(request.id)!;
    if (request.folderId && nodeMap.has(request.folderId)) {
      nodeMap.get(request.folderId)!.children!.push(node);
    } else {
      rootNodes.push(node);
    }
  }

  // Sort: folders first (alphabetical), then requests (alphabetical)
  const sortNodes = (nodes: CollectionNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      const nameA = a.node.name || (a.type === 'request' ? (a.node as any).url : '') || '';
      const nameB = b.node.name || (b.type === 'request' ? (b.node as any).url : '') || '';
      return nameA.localeCompare(nameB);
    });
    for (const node of nodes) {
      if (node.type === 'folder' && node.children) {
        sortNodes(node.children);
      }
    }
  };

  sortNodes(rootNodes);
  return rootNodes;
}

export function countCollectionItems(
  collectionId: string,
  allFolders: Record<string, CollectionFolder>,
  allRequests: Record<string, CollectionRequest>
): number {
  const fCount = Object.values(allFolders).filter(f => f.collectionId === collectionId).length;
  const rCount = Object.values(allRequests).filter(r => r.collectionId === collectionId).length;
  return fCount + rCount;
}
