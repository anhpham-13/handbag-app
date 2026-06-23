import React from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/spacing';

// ── Stitch integration point ──────────────────────────────────────────────
// Replace JSX with Stitch SearchBar. Keep props as-is.
// ─────────────────────────────────────────────────────────────────────────

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search handbags…',
  onClear,
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={18} color={Colors.text.muted} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.text.muted}
        returnKeyType="search"
        clearButtonMode="never"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <Pressable onPress={onClear ?? (() => onChangeText(''))} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={Colors.text.muted} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 0,
    paddingVertical: Spacing.xs + 2,
    gap: Spacing.sm,
  },
  icon: { flexShrink: 0 },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    padding: 0,
    margin: 0,
  },
});
