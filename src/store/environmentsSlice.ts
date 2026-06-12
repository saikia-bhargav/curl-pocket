// Completely replaces the stub from Prompt 2.
// Full CRUD + AsyncStorage persistence via Zustand persist middleware.

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '@/utils';
import type { Environment, EnvVariable } from '@/types/environment';

const STORAGE_KEY = 'environments-store-v1';

// ── Seed data — shown on first launch ─────────────────────────────────────────

const makeSeedEnv = (
  id: string,
  name: string,
  color: string,
  isActive: boolean,
  variables: Omit<EnvVariable, 'id'>[],
): Environment => ({
  id,
  name,
  color,
  isActive,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  variables: variables.map(v => ({ ...v, id: generateId() })),
});

const SEED_ENVIRONMENTS: Environment[] = [
  makeSeedEnv('env-local', 'Local', '#00D2A8', false, [
    { key: 'baseUrl', value: 'http://localhost:3000', enabled: true, secret: false, description: 'Local dev server' },
    { key: 'token',   value: 'dev-token-abc123',      enabled: true, secret: true,  description: 'Dev auth token' },
  ]),
  makeSeedEnv('env-staging', 'Staging', '#F5C842', false, [
    { key: 'baseUrl',    value: 'https://staging-api.example.com', enabled: true, secret: false },
    { key: 'token',      value: '',                                enabled: true, secret: true,  description: 'Staging bearer token' },
    { key: 'apiVersion', value: 'v2',                             enabled: true, secret: false },
  ]),
  makeSeedEnv('env-production', 'Production', '#FF6B6B', true, [
    { key: 'baseUrl',    value: 'https://api.example.com', enabled: true, secret: false },
    { key: 'token',      value: '',                        enabled: true, secret: true,  description: 'Production bearer token' },
    { key: 'apiVersion', value: 'v1',                     enabled: true, secret: false },
  ]),
];

// ── State + Actions ────────────────────────────────────────────────────────────

interface EnvironmentsState {
  environments: Environment[];
  activeEnvironmentId: string | null;
}

interface EnvironmentsActions {
  // Environment CRUD
  addEnvironment:       (name: string, color: string) => string;  // returns new id
  updateEnvironment:    (id: string, partial: Partial<Pick<Environment, 'name' | 'color'>>) => void;
  deleteEnvironment:    (id: string) => void;
  duplicateEnvironment: (id: string) => void;
  setActive:            (id: string | null) => void;

  // Variable CRUD
  addVariable:      (envId: string) => void;
  updateVariable:   (envId: string, varId: string, partial: Partial<Omit<EnvVariable, 'id'>>) => void;
  deleteVariable:   (envId: string, varId: string) => void;
  reorderVariables: (envId: string, fromIndex: number, toIndex: number) => void;
}

// ── Store ──────────────────────────────────────────────────────────────────────

export const useEnvironmentsStore = create<EnvironmentsState & EnvironmentsActions>()(
  persist(
    immer((set) => ({
      environments: SEED_ENVIRONMENTS,
      activeEnvironmentId: 'env-production',

      // ── Environment CRUD ──────────────────────────────────────

      addEnvironment: (name, color) => {
        const id = generateId();
        set(state => {
          state.environments.push({
            id,
            name,
            color,
            variables: [],
            isActive: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        });
        return id;
      },

      updateEnvironment: (id, partial) => {
        set(state => {
          const env = state.environments.find(e => e.id === id);
          if (env !== undefined) {
            Object.assign(env, partial);
            env.updatedAt = Date.now();
          }
        });
      },

      deleteEnvironment: (id) => {
        set(state => {
          const idx = state.environments.findIndex(e => e.id === id);
          if (idx !== -1) {
            state.environments.splice(idx, 1);
          }
          if (state.activeEnvironmentId === id) {
            state.activeEnvironmentId = null;
          }
        });
      },

      duplicateEnvironment: (id) => {
        set(state => {
          const source = state.environments.find(e => e.id === id);
          if (source === undefined) { return; }
          state.environments.push({
            id: generateId(),
            name: `${source.name} (copy)`,
            color: source.color,
            isActive: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            variables: source.variables.map(v => ({ ...v, id: generateId() })),
          });
        });
      },

      setActive: (id) => {
        set(state => {
          state.activeEnvironmentId = id;
          state.environments.forEach(env => {
            env.isActive = env.id === id;
          });
        });
      },

      // ── Variable CRUD ─────────────────────────────────────────

      addVariable: (envId) => {
        set(state => {
          const env = state.environments.find(e => e.id === envId);
          if (env === undefined) { return; }
          env.variables.push({
            id: generateId(),
            key: '',
            value: '',
            enabled: true,
            secret: false,
          });
          env.updatedAt = Date.now();
        });
      },

      updateVariable: (envId, varId, partial) => {
        set(state => {
          const env = state.environments.find(e => e.id === envId);
          if (env === undefined) { return; }
          const variable = env.variables.find(v => v.id === varId);
          if (variable !== undefined) {
            Object.assign(variable, partial);
            env.updatedAt = Date.now();
          }
        });
      },

      deleteVariable: (envId, varId) => {
        set(state => {
          const env = state.environments.find(e => e.id === envId);
          if (env === undefined) { return; }
          const idx = env.variables.findIndex(v => v.id === varId);
          if (idx !== -1) {
            env.variables.splice(idx, 1);
            env.updatedAt = Date.now();
          }
        });
      },

      reorderVariables: (envId, fromIndex, toIndex) => {
        set(state => {
          const env = state.environments.find(e => e.id === envId);
          if (env === undefined) { return; }
          const [moved] = env.variables.splice(fromIndex, 1);
          if (moved !== undefined) {
            env.variables.splice(toIndex, 0, moved);
            env.updatedAt = Date.now();
          }
        });
      },
    })),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state): EnvironmentsState => ({
        environments: state.environments,
        activeEnvironmentId: state.activeEnvironmentId,
      }),
    },
  ),
);

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectAllEnvironments = (s: EnvironmentsState) =>
  s.environments;

export const selectActiveEnvironment = (
  s: EnvironmentsState & EnvironmentsActions,
) => s.environments.find(e => e.id === s.activeEnvironmentId) ?? null;

export const selectActiveVariables = (
  s: EnvironmentsState & EnvironmentsActions,
) => {
  const active = s.environments.find(e => e.id === s.activeEnvironmentId);
  return active?.variables.filter(v => v.enabled) ?? [];
};

export const selectEnvironmentById = (id: string) =>
  (s: EnvironmentsState) =>
    s.environments.find(e => e.id === id);

// Re-export the type so existing imports of `Environment` from this module continue to work
export type { Environment } from '@/types/environment';
