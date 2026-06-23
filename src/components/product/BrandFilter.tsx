import React, { useRef } from 'react';
import { ScrollView, Pressable, Text, StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius, FontWeight } from '../../constants/spacing';
import { BRANDS } from '../../constants/brands';

// ── Stitch integration point ──────────────────────────────────────────────
// Replace JSX with Stitch BrandFilter. Keep props as-is.
// ─────────────────────────────────────────────────────────────────────────

interface BrandFilterProps {
  selectedBrand: string;
  onSelect: (brand: string) => void;
  brands?: string[];
}

export const BrandFilter: React.FC<BrandFilterProps> = ({
  selectedBrand,
  onSelect,
  brands = BRANDS,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
    >
      {brands.map(brand => {
        const active = brand === selectedBrand;
        return (
          <Pressable
            key={brand}
            onPress={() => onSelect(brand)}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && styles.chipPressed,
            ]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {brand}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.round,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipPressed: { opacity: 0.75 },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.text.secondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  labelActive: {
    color: Colors.text.inverse,
  },
});
