// Read-only rendering of a full ApiRequest.
// Used by HistoryDetailScreen.
// Tabs: Params | Headers | Body | Auth

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import { MonoText } from '@/components/atoms/MonoText';
import { MethodBadge } from '@/components/atoms/MethodBadge';
import { EmptyState } from '@/components/atoms/EmptyState';
import type { ApiRequest, KeyValuePair } from '@/types/request';

type RequestTab = 'params' | 'headers' | 'body' | 'auth';

interface Props {
  request: ApiRequest;
}

const Divider = () => <View style={divStyle.line} />;
const divStyle = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border.subtle,
    marginHorizontal: Spacing.lg,
  },
});

// ── KV row ───────────────────────────────────────────────────
const ReadOnlyKVRow: React.FC<{ item: KeyValuePair }> = ({ item }) => (
  <View style={[kv.row, !item.enabled && kv.disabled]}>
    <MonoText
      size="sm"
      color={item.enabled ? Colors.text.accent : Colors.text.muted}
      style={kv.key}
      numberOfLines={1}>
      {item.key}
    </MonoText>
    <View style={kv.sep} />
    <MonoText
      size="sm"
      color={item.enabled ? Colors.text.primary : Colors.text.muted}
      style={kv.value}
      numberOfLines={2}>
      {item.value}
    </MonoText>
  </View>
);

const kv = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  disabled: { opacity: 0.4 },
  key: { flex: 1, minWidth: 80 },
  sep: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: Colors.border.subtle,
  },
  value: { flex: 2 },
});

// ── Main component ───────────────────────────────────────────
export const RequestReadOnlyView: React.FC<Props> = ({ request }) => {
  const [activeTab, setActiveTab] = useState<RequestTab>('params');

  const tabs: { key: RequestTab; label: string; count?: number }[] = [
    { key: 'params',  label: 'Params',  count: request.params.filter(p => p.enabled).length },
    { key: 'headers', label: 'Headers', count: request.headers.filter(h => h.enabled).length },
    { key: 'body',    label: 'Body' },
    { key: 'auth',    label: 'Auth' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'params':
        return request.params.length === 0
          ? <EmptyState icon="equal" title="No params" style={s.emptyTab} />
          : <FlatList
              data={request.params}
              keyExtractor={i => i.id}
              renderItem={({ item }) => <ReadOnlyKVRow item={item} />}
              ItemSeparatorComponent={Divider}
              scrollEnabled={false}
            />;

      case 'headers':
        return request.headers.length === 0
          ? <EmptyState icon="format-list-bulleted" title="No headers" style={s.emptyTab} />
          : <FlatList
              data={request.headers}
              keyExtractor={i => i.id}
              renderItem={({ item }) => <ReadOnlyKVRow item={item} />}
              ItemSeparatorComponent={Divider}
              scrollEnabled={false}
            />;

      case 'body': {
        const isEmpty = request.body.type === 'none' || request.body.raw.trim() === '';
        if (isEmpty) {
          return <EmptyState icon="code-braces" title="No body" style={s.emptyTab} />;
        }
        return (
          <View style={s.bodyContainer}>
            <View style={s.pill}>
              <Text style={s.pillText}>{request.body.type}</Text>
              {request.body.type === 'raw' && (
                <Text style={s.pillText}> · {request.body.language}</Text>
              )}
            </View>
            <ScrollView horizontal style={s.bodyScroll} showsHorizontalScrollIndicator>
              <MonoText size="sm" style={s.bodyText}>{request.body.raw}</MonoText>
            </ScrollView>
          </View>
        );
      }

      case 'auth':
        if (request.auth.type === 'none') {
          return <EmptyState icon="shield-off-outline" title="No auth" style={s.emptyTab} />;
        }
        return (
          <View style={s.authContainer}>
            <View style={[s.pill, s.pillAccent]}>
              <Text style={[s.pillText, { color: Colors.accent.primary }]}>
                {request.auth.type}
              </Text>
            </View>
            {request.auth.bearer !== undefined && (
              <View style={s.authField}>
                <Text style={s.authLabel}>Token</Text>
                <MonoText size="sm" color={Colors.text.muted}>
                  {'•'.repeat(Math.min(request.auth.bearer.token.length, 32))}
                </MonoText>
              </View>
            )}
            {request.auth.basic !== undefined && (
              <>
                <View style={s.authField}>
                  <Text style={s.authLabel}>Username</Text>
                  <MonoText size="sm">{request.auth.basic.username}</MonoText>
                </View>
                <View style={s.authField}>
                  <Text style={s.authLabel}>Password</Text>
                  <MonoText size="sm" color={Colors.text.muted}>••••••••</MonoText>
                </View>
              </>
            )}
            {request.auth.apiKey !== undefined && (
              <>
                <View style={s.authField}>
                  <Text style={s.authLabel}>Key</Text>
                  <MonoText size="sm">{request.auth.apiKey.key}</MonoText>
                </View>
                <View style={s.authField}>
                  <Text style={s.authLabel}>Placement</Text>
                  <MonoText size="sm">{request.auth.apiKey.placement}</MonoText>
                </View>
              </>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      {/* URL row */}
      <View style={s.urlRow}>
        <MethodBadge method={request.method} size="md" />
        <MonoText size="sm" style={s.url} numberOfLines={3}>{request.url}</MonoText>
      </View>

      <View style={s.hairline} />

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabsRow}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[s.tab, isActive && s.tabActive]}>
              <Text style={[s.tabLabel, { color: isActive ? Colors.accent.primary : Colors.text.muted }]}>
                {tab.label}{tab.count !== undefined && tab.count > 0 ? ` (${tab.count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={s.hairline} />

      {/* Content */}
      <View>{renderContent()}</View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  url: { flex: 1 },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border.subtle,
  },
  tabsRow: {
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.accent.primary },
  tabLabel:  { ...Typography.bodySm, fontWeight: '500' },
  emptyTab:  { minHeight: 120 },
  bodyContainer: { padding: Spacing.md, gap: Spacing.sm },
  pill: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: Colors.background.elevated,
    borderRadius: Radius.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  pillAccent: { backgroundColor: Colors.accent.dim },
  pillText: { ...Typography.caption, color: Colors.text.accent },
  bodyScroll: {
    backgroundColor: Colors.background.elevated,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  bodyText: { lineHeight: 20 },
  authContainer: { padding: Spacing.md, gap: Spacing.sm },
  authField: { gap: 2 },
  authLabel: { ...Typography.label },
});
