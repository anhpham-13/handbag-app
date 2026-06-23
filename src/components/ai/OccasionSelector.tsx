import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Occasion } from '../../services/aiService';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius, FontWeight } from '../../constants/spacing';

// ── Stitch integration point ──────────────────────────────────────────────
// Replace JSX with Stitch OccasionSelector. Keep props as-is.
// ─────────────────────────────────────────────────────────────────────────

interface OccasionOption {
  value: Occasion;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const OCCASIONS: OccasionOption[] = [
  { value: 'work', label: 'Business Meeting', icon: 'briefcase-outline', description: 'Professional & polished' },
  { value: 'casual', label: 'Daily Casual', icon: 'sunny-outline', description: 'Relaxed & versatile' },
  { value: 'party', label: 'Party Night', icon: 'sparkles-outline', description: 'Bold & glamorous' },
  { value: 'travel', label: 'Travel', icon: 'airplane-outline', description: 'Practical & stylish' },
  { value: 'date', label: 'Date Night', icon: 'heart-outline', description: 'Elegant & romantic' },
  { value: 'luxury', label: 'Luxury Event', icon: 'diamond-outline', description: 'Statement & prestigious' },
];

interface OccasionSelectorProps {
  selected: Occasion | null;
  onSelect: (occasion: Occasion) => void;
}

export const OccasionSelector: React.FC<OccasionSelectorProps> = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Choose Your Occasion</Text>
      <View style={styles.grid}>
        {OCCASIONS.map(o => {
          const active = selected === o.value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onSelect(o.value)}
              style={({ pressed }) => [
                styles.card,
                active && styles.cardActive,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={[styles.iconBg, active && styles.iconBgActive]}>
                <Ionicons
                  name={o.icon}
                  size={24}
                  color={active ? Colors.text.inverse : Colors.secondary}
                />
              </View>
              <Text style={[styles.label, active && styles.labelActive]}>{o.label}</Text>
              <Text style={[styles.desc, active && styles.descActive]} numberOfLines={1}>
                {o.description}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  card: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  cardPressed: { opacity: 0.8 },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBgActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  labelActive: { color: Colors.text.inverse },
  desc: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    textAlign: 'center',
  },
  descActive: { color: 'rgba(255,255,255,0.7)' },
});
