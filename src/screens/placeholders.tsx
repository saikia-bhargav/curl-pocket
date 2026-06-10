// All placeholder screens in one file.
// Each will be replaced by a real screen in later prompts.
// They render the screen name so you can verify navigation works.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '@/theme';
import { RequestTabsBar } from '@/components/navigation/RequestTabsBar';
import { EnvironmentBadge } from '@/components/navigation/EnvironmentBadge';

// Shared placeholder layout
const Placeholder: React.FC<{ name: string }> = ({ name }) => (
  <SafeAreaView style={styles.root} edges={['top']}>
    <View style={styles.center}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.sub}>Placeholder — will be built in a later prompt</Text>
    </View>
  </SafeAreaView>
);

// Request builder gets the full header treatment:
// EnvironmentBadge in the header + RequestTabsBar below
export const RequestBuilderPlaceholder: React.FC = () => (
  <SafeAreaView style={styles.root} edges={['top']}>
    {/* Top header row */}
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Curl Pocket</Text>
      <EnvironmentBadge />
    </View>

    {/* Request tabs bar */}
    <RequestTabsBar />

    {/* Body */}
    <View style={styles.center}>
      <Text style={styles.name}>Request Builder</Text>
      <Text style={styles.sub}>Prompt 3 will replace this</Text>
    </View>
  </SafeAreaView>
);

export const ResponseDetailPlaceholder: React.FC = () => (
  <Placeholder name="Response Detail" />
);

export const CollectionsPlaceholder: React.FC = () => (
  <Placeholder name="Collections" />
);

export const CollectionDetailPlaceholder: React.FC = () => (
  <Placeholder name="Collection Detail" />
);

export const CollectionRequestPlaceholder: React.FC = () => (
  <Placeholder name="Collection Request" />
);

export const HistoryPlaceholder: React.FC = () => (
  <Placeholder name="History" />
);

export const HistoryDetailPlaceholder: React.FC = () => (
  <Placeholder name="History Detail" />
);

export const EnvironmentsPlaceholder: React.FC = () => (
  <Placeholder name="Environments" />
);

export const EnvironmentEditPlaceholder: React.FC = () => (
  <Placeholder name="Environment Edit" />
);

export const SettingsPlaceholder: React.FC = () => (
  <Placeholder name="Settings" />
);

export const AboutPlaceholder: React.FC = () => (
  <Placeholder name="About" />
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
  },
  headerTitle: {
    ...Typography.heading,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.xl,
  },
  name: {
    ...Typography.headingLg,
    textAlign: 'center',
  },
  sub: {
    ...Typography.bodySm,
    color: Colors.text.muted,
    textAlign: 'center',
  },
});
