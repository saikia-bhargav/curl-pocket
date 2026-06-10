import { StyleSheet, Platform } from 'react-native';
import { Colors } from './colors';

// JetBrains Mono ships as a bundled asset font.
// Declare the font family name that matches the asset registration.
// On Android the font file name IS the family name (no spaces).
// We fall back to a system monospace font if the custom font isn't loaded yet.
const MONO_FAMILY = Platform.select({
  android: 'JetBrainsMono-Regular',
  ios: 'JetBrainsMono-Regular',
  default: 'monospace',
});

const MONO_BOLD_FAMILY = Platform.select({
  android: 'JetBrainsMono-Bold',
  ios: 'JetBrainsMono-Bold',
  default: 'monospace',
});

export const Typography = StyleSheet.create({
  // ── Monospace variants ──────────────────────────────
  monoXs: {
    fontFamily: MONO_FAMILY,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.text.primary,
  },
  monoSm: {
    fontFamily: MONO_FAMILY,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.text.primary,
  },
  monoMd: {
    fontFamily: MONO_FAMILY,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.text.primary,
  },
  monoLg: {
    fontFamily: MONO_FAMILY,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.primary,
  },
  monoBold: {
    fontFamily: MONO_BOLD_FAMILY,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.text.primary,
  },

  // ── Sans-serif variants ─────────────────────────────
  label: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    color: Colors.text.muted,
  },
  bodyXs: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.text.secondary,
  },
  bodySm: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.text.primary,
  },
  bodyMd: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.text.primary,
  },
  bodyLg: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.primary,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    color: Colors.text.primary,
  },
  headingLg: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    color: Colors.text.primary,
  },
  caption: {
    fontSize: 11,
    lineHeight: 16,
    color: Colors.text.muted,
  },
});
