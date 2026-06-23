import React from 'react';
import { Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';

// ── Stitch integration point ──────────────────────────────────────────────
// Replace JSX with Stitch FavoriteButton. Keep props as-is.
// ─────────────────────────────────────────────────────────────────────────

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'floating' | 'inline';
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  onToggle,
  size = 'md',
  variant = 'floating',
}) => {
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 28 : 22;

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.base,
        variant === 'floating' && styles.floating,
        pressed && styles.pressed,
      ]}
      hitSlop={8}
    >
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={iconSize}
        color={isFavorite ? Colors.favorite.active : Colors.favorite.inactive}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    padding: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floating: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: BorderRadius.round,
    width: 32,
    height: 32,
  },
  pressed: { transform: [{ scale: 0.88 }] },
});
