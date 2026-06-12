// All navigation param lists in one place.
// Every screen that accepts params must be typed here.

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// ── Root tab param list ────────────────────────────────────────
export type RootTabParamList = {
  RequestTab:      NavigatorScreenParams<RequestStackParamList>;
  CollectionsTab:  NavigatorScreenParams<CollectionsStackParamList>;
  HistoryTab:      NavigatorScreenParams<HistoryStackParamList>;
  EnvironmentsTab: NavigatorScreenParams<EnvironmentsStackParamList>;
  SettingsTab:     NavigatorScreenParams<SettingsStackParamList>;
};

// ── Request stack ──────────────────────────────────────────────
export type RequestStackParamList = {
  RequestBuilder:  undefined;
  ResponseDetail:  { responseId: string };
};

// ── Collections stack ──────────────────────────────────────────
export type CollectionsStackParamList = {
  Collections:       undefined;
  CollectionDetail:  { collectionId: string };
  CollectionRequest: { collectionId: string; requestId?: string };
};

// ── History stack ──────────────────────────────────────────────
export type HistoryStackParamList = {
  History:       undefined;
  HistoryDetail: { entryId: string };
};

// ── Environments stack ─────────────────────────────────────────
export type EnvironmentsStackParamList = {
  Environments:    undefined;
  EnvironmentEdit: { environmentId: string };
};

// ── Settings stack ─────────────────────────────────────────────
export type SettingsStackParamList = {
  Settings: undefined;
  About:    undefined;
};

// ── Composite screen prop helpers ──────────────────────────────
// Use these in screen components for correctly typed navigation + route props.

export type RequestBuilderScreenProps = CompositeScreenProps<
  NativeStackScreenProps<RequestStackParamList, 'RequestBuilder'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type CollectionsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<CollectionsStackParamList, 'Collections'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type CollectionDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<CollectionsStackParamList, 'CollectionDetail'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type CollectionRequestScreenProps = CompositeScreenProps<
  NativeStackScreenProps<CollectionsStackParamList, 'CollectionRequest'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type HistoryScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HistoryStackParamList, 'History'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type HistoryDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HistoryStackParamList, 'HistoryDetail'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type EnvironmentsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<EnvironmentsStackParamList, 'Environments'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type EnvironmentEditScreenProps = CompositeScreenProps<
  NativeStackScreenProps<EnvironmentsStackParamList, 'EnvironmentEdit'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type SettingsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<SettingsStackParamList, 'Settings'>,
  BottomTabScreenProps<RootTabParamList>
>;
