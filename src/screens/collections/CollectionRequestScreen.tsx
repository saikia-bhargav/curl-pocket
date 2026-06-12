import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import { useCollectionsStore } from '@/store/collectionsSlice';
import { useTabsStore } from '@/store/tabsSlice';
import { MethodBadge } from '@/components/atoms/MethodBadge';
import { HTTP_METHODS } from '@/constants';
import type { HttpMethod } from '@/types/request';
import type { CollectionRequestScreenProps } from '@/navigation/types';

export const CollectionRequestScreen: React.FC<CollectionRequestScreenProps> = ({ route, navigation }) => {
  const { collectionId, requestId } = route.params;

  const request = useCollectionsStore(s => requestId ? s.requests[requestId] : null);
  const collectionFolders = useCollectionsStore(s => 
    Object.values(s.folders).filter(f => f.collectionId === collectionId)
  );

  const addRequest = useCollectionsStore(s => s.addRequest);
  const updateRequest = useCollectionsStore(s => s.updateRequest);
  const deleteRequest = useCollectionsStore(s => s.deleteRequest);

  const [name, setName] = useState(request?.name || 'New Request');
  const [method, setMethod] = useState<HttpMethod>(request?.method || 'GET');
  const [url, setUrl] = useState(request?.url || '');
  const [folderId, setFolderId] = useState<string | undefined>(request?.folderId);

  // Keep state synced if external changes happen
  useEffect(() => {
    if (request) {
      setName(request.name || '');
      setMethod(request.method);
      setUrl(request.url);
      setFolderId(request.folderId);
    }
  }, [request]);

  const handleSave = () => {
    if (request && requestId) {
      updateRequest(requestId, { name, method, url, folderId });
    } else {
      addRequest(collectionId, {
        id: '', // Will be overridden
        method,
        url,
        name,
        params: [],
        headers: [],
        body: { type: 'none', raw: '', language: 'json', formData: [], urlEncoded: [] },
        auth: { type: 'none' },
        testScript: '',
      }, folderId);
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (requestId) {
      Alert.alert('Delete Request', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          deleteRequest(requestId);
          navigation.goBack();
        }}
      ]);
    }
  };

  const handleTestRequest = () => {
    if (request) {
      useTabsStore.getState().addTabWithData({
        method: request.method,
        title: request.name || request.url || 'New Request',
        url: request.url,
      });
      navigation.navigate('RequestTab', { screen: 'RequestBuilder' });
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="close" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{requestId ? 'Edit Request' : 'New Request'}</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveBtn}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Get User Profile"
          placeholderTextColor={Colors.text.muted}
          style={styles.input}
        />

        <Text style={styles.label}>Method</Text>
        <View style={styles.methodRow}>
          {HTTP_METHODS.slice(0, 5).map(m => (
            <TouchableOpacity
              key={m}
              onPress={() => setMethod(m)}
              style={[styles.methodBtn, method === m && styles.methodBtnActive]}>
              <MethodBadge method={m} size="sm" />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>URL</Text>
        <TextInput
          value={url}
          onChangeText={setUrl}
          placeholder="https://api.example.com/..."
          placeholderTextColor={Colors.text.muted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={styles.input}
        />
        
        {collectionFolders.length > 0 && (
          <>
            <Text style={styles.label}>Location</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.folderRow}>
              <TouchableOpacity
                onPress={() => setFolderId(undefined)}
                style={[styles.folderChip, folderId === undefined && styles.folderChipActive]}>
                <Icon name="folder-outline" size={16} color={folderId === undefined ? Colors.accent.primary : Colors.text.muted} />
                <Text style={[styles.folderChipText, folderId === undefined && styles.folderChipTextActive]}>Root</Text>
              </TouchableOpacity>
              
              {collectionFolders.map(f => (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setFolderId(f.id)}
                  style={[styles.folderChip, folderId === f.id && styles.folderChipActive]}>
                  <Icon name="folder-outline" size={16} color={folderId === f.id ? Colors.accent.primary : Colors.text.muted} />
                  <Text style={[styles.folderChipText, folderId === f.id && styles.folderChipTextActive]} numberOfLines={1}>
                    {f.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
        
        {requestId && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.testBtn} onPress={handleTestRequest}>
              <Icon name="play" size={20} color={Colors.accent.primary} />
              <Text style={styles.testText}>Test Request in Builder</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Icon name="delete" size={20} color={Colors.status.error} />
              <Text style={styles.deleteText}>Delete Request</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: Colors.background.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: { ...Typography.heading },
  saveBtn: {
    ...Typography.bodyMd,
    color: Colors.accent.primary,
    fontWeight: '600',
    padding: Spacing.xs,
  },
  form: { padding: Spacing.lg, gap: Spacing.md },
  label: { ...Typography.label },
  input: {
    ...Typography.bodyMd,
    height: 48,
    backgroundColor: Colors.background.elevated,
    borderRadius: 4,
    paddingHorizontal: Spacing.md,
    color: Colors.text.primary,
  },
  methodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  methodBtn: {
    padding: Spacing.xs,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  methodBtnActive: {
    borderColor: Colors.accent.primary,
    backgroundColor: Colors.background.surface,
  },
  folderRow: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.background.elevated,
    borderWidth: 1,
    borderColor: 'transparent',
    maxWidth: 200,
  },
  folderChipActive: {
    backgroundColor: Colors.accent.dim,
    borderColor: Colors.accent.border,
  },
  folderChipText: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
  },
  folderChipTextActive: {
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  actionsContainer: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent.primary,
    borderRadius: 4,
    backgroundColor: 'rgba(158, 203, 255, 0.05)',
  },
  testText: {
    ...Typography.bodyMd,
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.status.errorDim,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 59, 59, 0.05)',
  },
  deleteText: {
    ...Typography.bodyMd,
    color: Colors.status.error,
    fontWeight: '600',
  },
});
