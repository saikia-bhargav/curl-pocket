// A dev-only screen that renders every atom so you can visually verify
// the design system on the actual device. Wire it into App.tsx temporarily.

import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '@/theme';
import {
  MethodBadge,
  StatusBadge,
  MonoText,
  Divider,
  IconButton,
  SectionHeader,
  KeyValueRow,
  Badge,
  Chip,
  EmptyState,
  PrimaryButton,
} from '@/components';
import { generateId } from '@/utils';
import type { HttpMethod } from '@/types/request';

const HTTP_METHODS: HttpMethod[] = [
  'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS',
];

const STATUS_CODES = [200, 201, 204, 301, 400, 401, 404, 422, 500, 503];

export const ThemePreview: React.FC = () => {
  const [activeChip, setActiveChip] = useState('All');
  const [rows, setRows] = useState([
    { id: generateId(), key: 'Authorization', value: 'Bearer {{token}}', enabled: true },
    { id: generateId(), key: 'Content-Type', value: 'application/json', enabled: false },
  ]);

  const handleToggle = useCallback((id: string, enabled: boolean) => {
    setRows(prev =>
      prev.map(r => r.id === id ? { ...r, enabled } : r),
    );
  }, []);

  const handleKeyChange = useCallback((id: string, key: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, key } : r));
  }, []);

  const handleValueChange = useCallback((id: string, value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, value } : r));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  }, []);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">

        <Text style={styles.pageTitle}>Design system preview</Text>

        {/* Method badges */}
        <SectionHeader title="Method badges" />
        <View style={styles.row}>
          {HTTP_METHODS.map(m => (
            <MethodBadge key={m} method={m} size="md" />
          ))}
        </View>
        <View style={styles.row}>
          {HTTP_METHODS.map(m => (
            <MethodBadge key={m + '-sm'} method={m} size="sm" />
          ))}
        </View>

        <Divider style={{ marginVertical: Spacing.md }} />

        {/* Status badges */}
        <SectionHeader title="Status badges" />
        <View style={styles.wrap}>
          {STATUS_CODES.map(code => (
            <StatusBadge key={code} code={code} />
          ))}
        </View>

        <Divider style={{ marginVertical: Spacing.md }} />

        {/* Typography */}
        <SectionHeader title="Typography" />
        <View style={styles.section}>
          <MonoText size="lg">MonoText lg — GET /api/users</MonoText>
          <MonoText size="md">MonoText md — https://api.example.com</MonoText>
          <MonoText size="sm" color={Colors.text.secondary}>MonoText sm — secondary</MonoText>
          <MonoText size="xs" color={Colors.text.muted}>MonoText xs — muted</MonoText>
          <Text style={Typography.heading}>Heading — Request Builder</Text>
          <Text style={Typography.bodyMd}>Body md — Regular paragraph text</Text>
          <Text style={Typography.bodySm}>Body sm — Smaller body text</Text>
          <Text style={Typography.label}>Label — section title</Text>
          <Text style={Typography.caption}>Caption — timestamp, metadata</Text>
        </View>

        <Divider style={{ marginVertical: Spacing.md }} />

        {/* Chips */}
        <SectionHeader title="Filter chips" />
        <View style={styles.row}>
          {['All', '2xx', '3xx', '4xx', '5xx'].map(chip => (
            <Chip
              key={chip}
              label={chip}
              active={activeChip === chip}
              onPress={() => setActiveChip(chip)}
            />
          ))}
        </View>

        <Divider style={{ marginVertical: Spacing.md }} />

        {/* Badges */}
        <SectionHeader title="Count badges" />
        <View style={styles.row}>
          {[0, 1, 5, 12, 99, 150].map(n => (
            <Badge key={n} count={n} />
          ))}
        </View>

        <Divider style={{ marginVertical: Spacing.md }} />

        {/* Icon buttons */}
        <SectionHeader title="Icon buttons" />
        <View style={styles.row}>
          <IconButton icon="send" onPress={() => {}} color={Colors.accent.primary} />
          <IconButton icon="content-copy" onPress={() => {}} />
          <IconButton icon="delete-outline" onPress={() => {}} color={Colors.status.error} />
          <IconButton icon="share-variant" onPress={() => {}} label="Share" />
          <IconButton icon="refresh" onPress={() => {}} loading />
          <IconButton icon="cog" onPress={() => {}} disabled />
        </View>

        <Divider style={{ marginVertical: Spacing.md }} />

        {/* Buttons */}
        <SectionHeader title="Buttons" />
        <View style={styles.section}>
          <PrimaryButton label="Send request" onPress={() => {}} />
          <PrimaryButton label="Save to collection" onPress={() => {}} variant="secondary" />
          <PrimaryButton label="Delete" onPress={() => {}} variant="danger" />
          <PrimaryButton label="Loading..." onPress={() => {}} loading />
          <PrimaryButton label="Disabled" onPress={() => {}} disabled />
          <PrimaryButton label="Full width" onPress={() => {}} fullWidth />
        </View>

        <Divider style={{ marginVertical: Spacing.md }} />

        {/* Key-value rows */}
        <SectionHeader title="Key-value rows" />
        <View style={styles.section}>
          {rows.map(row => (
            <KeyValueRow
              key={row.id}
              item={row}
              onToggle={handleToggle}
              onKeyChange={handleKeyChange}
              onValueChange={handleValueChange}
              onDelete={handleDelete}
            />
          ))}
        </View>

        <Divider style={{ marginVertical: Spacing.md }} />

        {/* Empty state */}
        <SectionHeader title="Empty state" />
        <EmptyState
          icon="folder-open-outline"
          title="No collections yet"
          subtitle="Create a collection to organise your requests"
          action={<PrimaryButton label="New collection" onPress={() => {}} />}
          style={{ minHeight: 200 }}
        />

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.xxxl,
  },
  pageTitle: {
    ...Typography.headingLg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
});
