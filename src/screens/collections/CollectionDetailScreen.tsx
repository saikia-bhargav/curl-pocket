import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import { useCollectionsStore } from '@/store/collectionsSlice';
import { useTabsStore } from '@/store/tabsSlice';
import { buildCollectionTree } from '@/utils/collectionTree';
import { CollectionTree } from '@/components/collections';
import type { CollectionDetailScreenProps } from '@/navigation/types';

export const CollectionDetailScreen: React.FC<CollectionDetailScreenProps> = ({ route, navigation }) => {
  const { collectionId } = route.params;

  const collection = useCollectionsStore(s => s.collections[collectionId]);
  const folders = useCollectionsStore(s => s.folders);
  const requests = useCollectionsStore(s => s.requests);
  const updateCollection = useCollectionsStore(s => s.updateCollection);
  const deleteCollection = useCollectionsStore(s => s.deleteCollection);
  const addFolder = useCollectionsStore(s => s.addFolder);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('');

  const treeNodes = useMemo(() => {
    return buildCollectionTree(collectionId, folders, requests);
  }, [collectionId, folders, requests]);

  if (!collection) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Collection not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: Spacing.md }}>
            <Text style={{ color: Colors.accent.primary }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveName = () => {
    if (editName.trim() && editName.trim() !== collection.name) {
      updateCollection(collectionId, { name: editName.trim() });
    }
    setIsEditingName(false);
  };

  const handleNodePress = (node: any) => {
    if (node.type === 'request') {
      navigation.navigate('CollectionRequest', {
        collectionId,
        requestId: node.id,
      });
    }
  };

  const handleDeleteCollection = () => {
    Alert.alert('Delete Collection', 'Are you sure you want to delete this collection and all its requests?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        deleteCollection(collectionId);
        navigation.goBack();
      }},
    ]);
  };

  const handleAddFolder = () => {
    setFolderName('');
    setShowFolderModal(true);
  };

  const handleSaveFolder = () => {
    if (folderName.trim()) {
      addFolder(collectionId, folderName.trim());
    }
    setShowFolderModal(false);
  };

  const handleAddRequest = () => {
    navigation.navigate('CollectionRequest', { collectionId });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="arrow-left" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          {isEditingName ? (
            <TextInput
              value={editName}
              onChangeText={setEditName}
              onBlur={handleSaveName}
              onSubmitEditing={handleSaveName}
              autoFocus
              style={styles.headerInput}
              returnKeyType="done"
            />
          ) : (
            <TouchableOpacity onPress={() => { setEditName(collection.name); setIsEditingName(true); }}>
              <Text style={styles.headerTitle} numberOfLines={1}>{collection.name}</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'Collection Runner was skipped for now.')} style={styles.headerBtn}>
          <Icon name="play" size={24} color={Colors.accent.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDeleteCollection} style={styles.headerBtn}>
          <Icon name="delete" size={24} color={Colors.status.error} />
        </TouchableOpacity>
      </View>

      {/* ── Tree View ── */}
      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}>
        {treeNodes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="folder-open-outline" size={48} color={Colors.text.muted} />
            <Text style={styles.emptySubtitle}>This collection is empty.</Text>
            <Text style={styles.emptySubtitle}>Tap the FAB to add requests or folders.</Text>
          </View>
        ) : (
          <CollectionTree
            nodes={treeNodes}
            onNodePress={handleNodePress}
            level={0}
          />
        )}
      </ScrollView>

      {/* ── FAB ── */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fabSecondary} onPress={handleAddFolder} activeOpacity={0.8}>
          <Icon name="folder-plus-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fabPrimary} onPress={handleAddRequest} activeOpacity={0.8}>
          <Icon name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Folder Modal ── */}
      <Modal visible={showFolderModal} transparent animationType="fade" onRequestClose={() => setShowFolderModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>New Folder</Text>
            <TextInput
              value={folderName}
              onChangeText={setFolderName}
              placeholder="Folder Name"
              placeholderTextColor={Colors.text.muted}
              style={styles.modalInput}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowFolderModal(false)} style={styles.modalBtn}>
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveFolder} style={styles.modalBtn}>
                <Text style={styles.modalBtnTextSave}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.background.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
  },
  backBtn: {
    marginRight: Spacing.md,
  },
  headerTitleContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  headerBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  headerTitle: {
    ...Typography.heading,
  },
  headerInput: {
    ...Typography.heading,
    color: Colors.text.primary,
    padding: 0,
    margin: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent.primary,
  },
  scroll: {
    flex: 1,
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    ...Typography.bodyLg,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    ...Typography.bodySm,
    color: Colors.text.muted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  fabContainer: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  fabPrimary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  fabSecondary: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalContainer: {
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
  },
  modalTitle: {
    ...Typography.heading,
    marginBottom: Spacing.md,
  },
  modalInput: {
    ...Typography.bodyMd,
    height: 44,
    backgroundColor: Colors.background.elevated,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  modalBtn: {
    padding: Spacing.sm,
  },
  modalBtnTextCancel: {
    ...Typography.bodyMd,
    color: Colors.text.secondary,
  },
  modalBtnTextSave: {
    ...Typography.bodyMd,
    color: Colors.accent.primary,
    fontWeight: '600',
  },
});
