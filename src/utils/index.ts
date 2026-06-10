import { customAlphabet } from 'nanoid/non-secure';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12);

export const generateId = (): string => nanoid();

export const formatBytes = (bytes: number, decimals: number = 1): string => {
  if (bytes === 0) { return '0 B'; }
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

export const formatDuration = (ms: number): string => {
  if (ms < 1000) { return `${ms}ms`; }
  return `${(ms / 1000).toFixed(2)}s`;
};