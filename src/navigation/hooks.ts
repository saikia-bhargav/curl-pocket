// Typed navigation hooks — import these in screens instead of
// using the raw useNavigation / useRoute hooks.

import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootTabParamList } from './types';

// Generic typed navigation hook — works from any screen
export function useAppNavigation() {
  return useNavigation<NavigationProp<RootTabParamList>>();
}

// Re-export useRoute for convenience (screens add their own generic)
export { useRoute };
