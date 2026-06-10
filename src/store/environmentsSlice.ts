// Minimal environments slice needed by the EnvironmentBadge.
// Will be expanded significantly in Prompt 8.

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface Environment {
  id: string;
  name: string;
  color: string;
  variableCount: number;
  isActive: boolean;
}

interface EnvironmentsState {
  environments: Environment[];
  activeEnvironmentId: string | null;
}

interface EnvironmentsActions {
  setActive: (id: string | null) => void;
  // Full CRUD actions added in Prompt 8
}

export const useEnvironmentsStore = create<
  EnvironmentsState & EnvironmentsActions
>()(
  immer(set => ({
    environments: [
      {
        id: 'env-local',
        name: 'Local',
        color: '#00D2A8',
        variableCount: 3,
        isActive: false,
      },
      {
        id: 'env-staging',
        name: 'Staging',
        color: '#F5C842',
        variableCount: 5,
        isActive: false,
      },
      {
        id: 'env-prod',
        name: 'Production',
        color: '#FF6B6B',
        variableCount: 5,
        isActive: true,
      },
    ],
    activeEnvironmentId: 'env-prod',

    setActive: (id: string | null) => {
      set(state => {
        state.activeEnvironmentId = id;
        state.environments.forEach(env => {
          env.isActive = env.id === id;
        });
      });
    },
  })),
);

export const selectActiveEnvironment = (
  s: EnvironmentsState & EnvironmentsActions,
) => s.environments.find(e => e.id === s.activeEnvironmentId) ?? null;
