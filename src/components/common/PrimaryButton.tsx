import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius, FontWeight } from '../../constants/spacing';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  variant = 'filled',
  size = 'md',
  disabled,
  style,
  icon,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon}
      <Text style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`]]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  filled: {
    backgroundColor: Colors.primary,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  size_sm: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  size_md: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2 },
  size_lg: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.4 },
  label: { fontWeight: FontWeight.semibold, letterSpacing: 0.4 },
  label_filled: { color: Colors.text.inverse },
  label_outlined: { color: Colors.primary },
  label_ghost: { color: Colors.primary },
  labelSize_sm: { fontSize: FontSize.sm },
  labelSize_md: { fontSize: FontSize.md },
  labelSize_lg: { fontSize: FontSize.lg },
});
