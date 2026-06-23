import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/spacing';

// ── Stitch integration point ──────────────────────────────────────────────
// Replace JSX with Stitch GenderBadge component. Keep props as-is.
// ─────────────────────────────────────────────────────────────────────────

interface GenderBadgeProps {
  gender: 'Female' | 'Male' | 'Unisex';
  size?: 'sm' | 'md';
}

const GENDER_CONFIG = {
  Female: {
    icon: 'female' as const,
    label: 'Female',
    color: Colors.gender.female,
    bg: Colors.gender.femaleBg,
  },
  Male: {
    icon: 'male' as const,
    label: 'Male',
    color: Colors.gender.male,
    bg: Colors.gender.maleBg,
  },
  Unisex: {
    icon: 'male-female' as const,
    label: 'Unisex',
    color: Colors.gender.unisex,
    bg: Colors.gender.unisexBg,
  },
};

export const GenderBadge: React.FC<GenderBadgeProps> = ({ gender, size = 'sm' }) => {
  const config = GENDER_CONFIG[gender] ?? GENDER_CONFIG.Unisex;
  const iconSize = size === 'sm' ? 10 : 13;
  const fontSize = size === 'sm' ? FontSize.xs : FontSize.sm;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Ionicons name={config.icon} size={iconSize} color={config.color} />
      <Text style={[styles.label, { color: config.color, fontSize }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
