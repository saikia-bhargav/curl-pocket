// Environment data model used across the app.

export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  secret: boolean;       // if true, mask value in UI
  description?: string;
}

export interface Environment {
  id: string;
  name: string;
  color: string;         // one of ENV_COLORS
  variables: EnvVariable[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Preset colors users can assign to environments
export const ENV_COLORS = [
  '#00D2A8',  // teal    — Local / Dev
  '#F5C842',  // amber   — Staging
  '#FF6B6B',  // red     — Production
  '#6C63FF',  // purple
  '#FF9F7F',  // peach
  '#A39DFF',  // lavender
  '#60D394',  // green
  '#7A7F8E',  // gray
] as const;

export type EnvColor = typeof ENV_COLORS[number];
