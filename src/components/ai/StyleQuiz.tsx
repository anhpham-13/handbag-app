import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { AIStyleInput } from '../../services/aiService';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius, FontWeight } from '../../constants/spacing';
import { PrimaryButton } from '../common/PrimaryButton';

// ── Stitch integration point ──────────────────────────────────────────────
// Replace JSX with Stitch StyleQuiz component. Keep props as-is.
// ─────────────────────────────────────────────────────────────────────────

interface StyleQuizProps {
  onSubmit: (input: AIStyleInput) => void;
  loading?: boolean;
}

const OCCASIONS = ['Work', 'Casual', 'Party', 'Travel', 'Date', 'Luxury'];
const COLORS = ['All', 'Black', 'Brown', 'Beige', 'Red', 'Blue', 'Green', 'Gold', 'White'];
const STYLES = ['Classic', 'Bold', 'Minimal', 'Luxury', 'Trendy'];
const BUDGETS = [500, 1000, 2000, 5000, 10000];

export const StyleQuiz: React.FC<StyleQuizProps> = ({ onSubmit, loading }) => {
  const [occasion, setOccasion] = useState('');
  const [preferredColor, setPreferredColor] = useState('');
  const [budget, setBudget] = useState(2000);
  const [stylePreference, setStylePreference] = useState('');

  const canSubmit = occasion && preferredColor && stylePreference;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ occasion: occasion.toLowerCase(), preferredColor, budget, stylePreference });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Tell us your style</Text>
      <Text style={styles.subheading}>We'll find the perfect handbag for you</Text>

      <Section label="Occasion">
        <ChipGroup options={OCCASIONS} selected={occasion} onSelect={setOccasion} />
      </Section>

      <Section label="Preferred Colour">
        <ChipGroup options={COLORS} selected={preferredColor} onSelect={setPreferredColor} />
      </Section>

      <Section label="Style Preference">
        <ChipGroup options={STYLES} selected={stylePreference} onSelect={setStylePreference} />
      </Section>

      <Section label={`Budget: up to $${budget.toLocaleString()}`}>
        <View style={styles.budgetRow}>
          {BUDGETS.map(b => (
            <Pressable
              key={b}
              onPress={() => setBudget(b)}
              style={[styles.budgetChip, budget === b && styles.budgetActive]}
            >
              <Text style={[styles.budgetLabel, budget === b && styles.budgetLabelActive]}>
                ${b >= 1000 ? `${b / 1000}k` : b}
              </Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <PrimaryButton
        label={loading ? 'Finding matches…' : 'Get AI Recommendation'}
        onPress={handleSubmit}
        disabled={!canSubmit || loading}
        size="lg"
      />
    </View>
  );
};

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionLabel}>{label}</Text>
    {children}
  </View>
);

const ChipGroup: React.FC<{ options: string[]; selected: string; onSelect: (v: string) => void }> = ({
  options, selected, onSelect,
}) => (
  <View style={styles.chipRow}>
    {options.map(opt => (
      <Pressable
        key={opt}
        onPress={() => onSelect(opt)}
        style={[styles.chip, selected === opt && styles.chipActive]}
      >
        <Text style={[styles.chipLabel, selected === opt && styles.chipLabelActive]}>{opt}</Text>
      </Pressable>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { gap: Spacing.lg },
  heading: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  subheading: { fontSize: FontSize.sm, color: Colors.text.muted, marginTop: -Spacing.sm },
  section: { gap: Spacing.sm },
  sectionLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.round,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipLabel: { fontSize: FontSize.sm, color: Colors.text.secondary, fontWeight: FontWeight.medium },
  chipLabelActive: { color: Colors.text.inverse, fontWeight: FontWeight.semibold },
  budgetRow: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  budgetChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  budgetActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  budgetLabel: { fontSize: FontSize.sm, color: Colors.text.secondary, fontWeight: FontWeight.medium },
  budgetLabelActive: { color: Colors.text.inverse, fontWeight: FontWeight.semibold },
});
