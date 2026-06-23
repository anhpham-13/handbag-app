import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, FontWeight } from '../../constants/spacing';

// ── Stitch integration point ──────────────────────────────────────────────
// Replace this component's JSX with your Stitch AppHeader component.
// Keep the props interface intact so navigation logic is preserved.
// ─────────────────────────────────────────────────────────────────────────

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  subtitle?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack,
  onBack,
  rightIcon,
  onRightPress,
  subtitle,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && (
          <Pressable onPress={onBack} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </Pressable>
        )}
      </View>

      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>

      <View style={styles.right}>
        {rightIcon && (
          <Pressable onPress={onRightPress} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name={rightIcon} size={24} color={Colors.text.primary} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: 56,
  },
  left: { width: 40 },
  center: { flex: 1, alignItems: 'center' },
  right: { width: 40, alignItems: 'flex-end' },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    marginTop: 1,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  iconBtn: {
    padding: Spacing.xs,
  },
});
