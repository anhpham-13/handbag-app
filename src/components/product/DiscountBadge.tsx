import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/spacing';
import { formatPercent } from '../../utils/formatPercent';

// ── Stitch integration point ──────────────────────────────────────────────
// Replace JSX with Stitch DiscountBadge. Keep props as-is.
// ─────────────────────────────────────────────────────────────────────────

interface DiscountBadgeProps {
  percentOff: number;
  size?: 'sm' | 'md';
}

export const DiscountBadge: React.FC<DiscountBadgeProps> = ({ percentOff, size = 'sm' }) => {
  // Don't render if no discount
  if (!percentOff || percentOff <= 0) return null;

  return (
    <View style={[styles.badge, size === 'md' && styles.badgeMd]}>
      <Text style={[styles.label, size === 'md' && styles.labelMd]}>
        -{formatPercent(percentOff)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.discount,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  badgeMd: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  label: {
    color: Colors.text.inverse,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  labelMd: {
    fontSize: FontSize.sm,
  },
});
