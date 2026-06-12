import type { ApiRequest } from './request';

export interface Collection {
  id: string;
  name: string;
  color: string;
  createdAt: number;
  updatedAt: number;
}

export interface CollectionFolder {
  id: string;
  collectionId: string;
  parentId?: string; // null/undefined if it's at the root of the collection
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface CollectionRequest extends ApiRequest {
  collectionId: string;
  folderId?: string; // null/undefined if it's at the root of the collection
  createdAt: number;
  updatedAt: number;
}

// Tree representations (used by UI components after computing from flat state)
export type CollectionNodeType = 'folder' | 'request';

export interface CollectionNode {
  id: string;
  type: CollectionNodeType;
  node: CollectionFolder | CollectionRequest;
  children?: CollectionNode[]; // only populated if type === 'folder'
}
