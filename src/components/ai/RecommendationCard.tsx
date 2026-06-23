import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AIRecommendation } from '../../services/aiService';
import { Handbag } from '../../types/handbag';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius, FontWeight } from '../../constants/spacing';
import { ProductImage } from '../product/ProductImage';
import { formatCurrency } from '../../utils/formatCurrency';

// ── Stitch integration point ──────────────────────────────────────────────
// Replace JSX with Stitch RecommendationCard. Keep props as-is.
// ─────────────────────────────────────────────────────────────────────────

interface RecommendationCardProps {
  recommendation: AIRecommendation;
  onProductPress: (handbag: Handbag) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onProductPress,
}) => {
  return (
    <View style={styles.container}>
      {/* AI badge */}
      <View style={styles.aiBadge}>
        <Ionicons name="sparkles" size={14} color={Colors.secondary} />
        <Text style={styles.aiBadgeText}>AI Recommendation</Text>
        <View style={[styles.confidence, styles[`confidence_${recommendation.confidence}`]]}>
          <Text style={styles.confidenceText}>{recommendation.confidence} match</Text>
        </View>
      </View>

      {/* Explanation */}
      <Text style={styles.explanation}>{recommendation.explanation}</Text>

      {/* Categories & Colors */}
      <View style={styles.tagsRow}>
        <Tag icon="bag-outline" label={recommendation.recommendedCategory} />
        {recommendation.recommendedColors.slice(0, 3).map(c => (
          <Tag key={c} icon="color-palette-outline" label={c} />
        ))}
      </View>

      {/* Matching products */}
      {recommendation.matchingHandbags.length > 0 && (
        <View style={styles.products}>
          <Text style={styles.productsTitle}>Matched Products</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroll}>
            {recommendation.matchingHandbags.map(h => (
              <Pressable key={h.id} onPress={() => onProductPress(h)} style={styles.productCard}>
                <View style={styles.productImage}>
                  <ProductImage uri={h.uri} resizeMode="cover" />
                </View>
                <Text style={styles.productBrand}>{h.brand}</Text>
                <Text style={styles.productName} numberOfLines={2}>{h.handbagName}</Text>
                <Text style={styles.productPrice}>{formatCurrency(h.cost)}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const Tag: React.FC<{ icon: keyof typeof Ionicons.glyphMap; label: string }> = ({ icon, label }) => (
  <View style={styles.tag}>
    <Ionicons name={icon} size={12} color={Colors.secondary} />
    <Text style={styles.tagText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  aiBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.secondary,
    flex: 1,
  },
  confidence: {
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
  },
  confidence_high: { backgroundColor: Colors.successBg },
  confidence_medium: { backgroundColor: '#FFF8E1' },
  confidence_low: { backgroundColor: Colors.surfaceAlt },
  confidenceText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.text.secondary },
  explanation: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.round,
  },
  tagText: { fontSize: FontSize.xs, color: Colors.text.secondary },
  products: { gap: Spacing.sm },
  productsTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  productScroll: { marginHorizontal: -Spacing.xs },
  productCard: {
    width: 130,
    marginHorizontal: Spacing.xs,
    gap: 4,
  },
  productImage: {
    width: '100%',
    height: 110,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceAlt,
  },
  productBrand: { fontSize: FontSize.xs, color: Colors.secondary, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  productName: { fontSize: FontSize.xs, color: Colors.text.primary, lineHeight: 16, height: 32 },
  productPrice: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text.primary },
});
