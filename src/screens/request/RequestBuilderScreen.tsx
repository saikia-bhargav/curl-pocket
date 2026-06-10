import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '@/theme';
import { RequestTabsBar } from '@/components/navigation/RequestTabsBar';
import { EnvironmentBadge } from '@/components/navigation/EnvironmentBadge';
import { UrlBar } from '@/components/request/UrlBar';
import { PanelTabBar } from '@/components/request/PanelTabBar';
import { KeyValuePanel } from '@/components/request/panels/KeyValuePanel';
import { BodyPanel } from '@/components/request/panels/BodyPanel';
import { AuthPanel } from '@/components/request/panels/AuthPanel';
import { PreReqPanel } from '@/components/request/panels/PreReqPanel';
import { TestsPanel } from '@/components/request/panels/TestsPanel';
import { ResponseSheet } from '@/components/request/ResponseSheet';
import {
  useTabsStore,
  selectActiveTab,
  selectActiveTabId,
} from '@/store/tabsSlice';
import { sendRequest } from '@/services/httpService';
import { generateId } from '@/utils';
import type { HttpMethod, KeyValuePair, RequestBody, RequestAuth } from '@/types/request';
import type { ApiResponse } from '@/types/request';
import type { PanelTab } from '@/components/request/PanelTabBar';

const INITIAL_BODY: RequestBody = {
  type: 'none',
  raw: '',
  language: 'json',
  formData: [],
  urlEncoded: [],
};

const INITIAL_AUTH: RequestAuth = { type: 'none' };

export const RequestBuilderScreen: React.FC = () => {
  // ── Tab store ─────────────────────────────────────────────────
  const activeStoreTab = useTabsStore(selectActiveTab);
  const activeTabId    = useTabsStore(selectActiveTabId);
  const updateTab      = useTabsStore(s => s.updateTab);

  // ── Local request state ───────────────────────────────────────
  const [method, setMethod]   = useState<HttpMethod>(activeStoreTab?.method ?? 'GET');
  const [url, setUrl]         = useState(activeStoreTab?.url ?? '');
  const [params, setParams]   = useState<KeyValuePair[]>([]);
  const [headers, setHeaders] = useState<KeyValuePair[]>([]);
  const [requestBody, setRequestBody] = useState<RequestBody>(INITIAL_BODY);
  const [auth, setAuth]        = useState<RequestAuth>(INITIAL_AUTH);
  const [preReq, setPreReq]    = useState('');
  const [testScript, setTestScript] = useState('');

  // ── UI state ──────────────────────────────────────────────────
  const [activePanel, setActivePanel] = useState(0);
  const [loading, setLoading]         = useState(false);
  const [response, setResponse]       = useState<ApiResponse | null>(null);
  const [responseVisible, setResponseVisible] = useState(false);

  // ── Method change ─────────────────────────────────────────────
  const handleMethodChange = useCallback(
    (m: HttpMethod) => {
      setMethod(m);
      if (activeTabId) {
        updateTab(activeTabId, { method: m, isDirty: true });
      }
    },
    [activeTabId, updateTab],
  );

  // ── URL change ────────────────────────────────────────────────
  const handleUrlChange = useCallback(
    (u: string) => {
      setUrl(u);
      if (activeTabId) {
        updateTab(activeTabId, { url: u, isDirty: true });
      }
    },
    [activeTabId, updateTab],
  );

  // ── Send ──────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      Alert.alert('URL required', 'Please enter a request URL before sending.');
      return;
    }

    // Ensure URL has a scheme
    const fullUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    setLoading(true);
    try {
      const res = await sendRequest({
        id:         activeTabId ?? generateId(),
        method,
        url:        fullUrl,
        params,
        headers,
        body:       requestBody,
        auth,
        testScript,
        name:       activeStoreTab?.title,
      });

      setResponse(res);
      setResponseVisible(true);

      // Update tab title to URL hostname
      if (activeTabId) {
        let hostname = fullUrl;
        try { hostname = new URL(fullUrl).hostname; } catch { /* keep raw */ }
        updateTab(activeTabId, { url: fullUrl, title: hostname, isDirty: false });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Request failed', msg);
    } finally {
      setLoading(false);
    }
  }, [
    url, method, params, headers, requestBody, auth, testScript,
    activeTabId, activeStoreTab, updateTab,
  ]);

  // ── Retry (passed to ResponseSheet) ──────────────────────────
  const handleRetry = useCallback(() => {
    setResponseVisible(false);
    // Small delay so sheet animates out before re-sending
    setTimeout(() => { void handleSend(); }, 300);
  }, [handleSend]);

  // ── Panel tab definitions with live counts ────────────────────
  const panelTabs = useMemo<PanelTab[]>(
    () => [
      {
        key: 'params',
        label: 'Params',
        count: params.filter(p => p.enabled && p.key.trim()).length,
      },
      {
        key: 'headers',
        label: 'Headers',
        count: headers.filter(h => h.enabled && h.key.trim()).length,
      },
      { key: 'body',   label: 'Body' },
      { key: 'auth',   label: 'Auth' },
      { key: 'prereq', label: 'Pre-req' },
      { key: 'tests',  label: 'Tests' },
    ],
    [params, headers],
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* ── App header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Curl Pocket</Text>
        <EnvironmentBadge />
      </View>

      {/* ── Browser-style request tabs ─────────────────────────── */}
      <RequestTabsBar />

      {/* ── URL bar ────────────────────────────────────────────── */}
      <UrlBar
        method={method}
        url={url}
        loading={loading}
        onMethodChange={handleMethodChange}
        onUrlChange={handleUrlChange}
        onSend={handleSend}
      />

      {/* ── Panel tab bar ──────────────────────────────────────── */}
      <PanelTabBar
        tabs={panelTabs}
        activeIndex={activePanel}
        onTabChange={setActivePanel}
      />

      {/* ── Panel content ──────────────────────────────────────── */}
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          style={styles.panelContainer}
          behavior="padding"
          keyboardVerticalOffset={0}>
          {activePanel === 0 && (
            <KeyValuePanel
              items={params}
              onChange={setParams}
              keyPlaceholder="Parameter"
              valuePlaceholder="Value"
              emptyTitle="No query params"
              emptySubtitle="Tap + to add a query parameter"
            />
          )}
          {activePanel === 1 && (
            <KeyValuePanel
              items={headers}
              onChange={setHeaders}
              keyPlaceholder="Header name"
              valuePlaceholder="Header value"
              emptyTitle="No headers"
              emptySubtitle="Tap + to add a request header"
            />
          )}
          {activePanel === 2 && (
            <BodyPanel body={requestBody} onChange={setRequestBody} />
          )}
          {activePanel === 3 && (
            <AuthPanel auth={auth} onChange={setAuth} />
          )}
          {activePanel === 4 && (
            <PreReqPanel value={preReq} onChange={setPreReq} />
          )}
          {activePanel === 5 && (
            <TestsPanel value={testScript} onChange={setTestScript} />
          )}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.panelContainer}>
          {activePanel === 0 && (
            <KeyValuePanel
              items={params}
              onChange={setParams}
              keyPlaceholder="Parameter"
              valuePlaceholder="Value"
              emptyTitle="No query params"
              emptySubtitle="Tap + to add a query parameter"
            />
          )}
          {activePanel === 1 && (
            <KeyValuePanel
              items={headers}
              onChange={setHeaders}
              keyPlaceholder="Header name"
              valuePlaceholder="Header value"
              emptyTitle="No headers"
              emptySubtitle="Tap + to add a request header"
            />
          )}
          {activePanel === 2 && (
            <BodyPanel body={requestBody} onChange={setRequestBody} />
          )}
          {activePanel === 3 && (
            <AuthPanel auth={auth} onChange={setAuth} />
          )}
          {activePanel === 4 && (
            <PreReqPanel value={preReq} onChange={setPreReq} />
          )}
          {activePanel === 5 && (
            <TestsPanel value={testScript} onChange={setTestScript} />
          )}
        </View>
      )}

      {/* ── Response sheet (appears on send) ───────────────────── */}
      {response !== null && (
        <ResponseSheet
          visible={responseVisible}
          response={response}
          onClose={() => setResponseVisible(false)}
          onRetry={handleRetry}
        />
      )}
    </SafeAreaView>
  );
};

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
  panelContainer: {
    flex: 1,
  },
});
