import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Handbag } from '../types/handbag';
import {
  AIStyleInput,
  AIRecommendation,
  ImageStyleResult,
  getAIRecommendation,
  analyzeImageStyle,
} from '../services/aiService';
import { getHandbags } from '../services/handbagApi';
import { Colors } from '../constants/colors';
import { Spacing, FontSize, BorderRadius, FontWeight } from '../constants/spacing';
import { StyleQuiz } from '../components/ai/StyleQuiz';
import { RecommendationCard } from '../components/ai/RecommendationCard';
import { formatCurrency } from '../utils/formatCurrency';
import { ProductImage } from '../components/product/ProductImage';

// ── Stitch integration point ──────────────────────────────────────────────
// Replace JSX layout with Stitch AIStylistScreen.
// getMockRecommendation / analyzeImageStyle are pure functions in
// aiService.ts — swap them for real Gemini calls without touching this file.
// ─────────────────────────────────────────────────────────────────────────

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type Tab = 'quiz' | 'image';

export const AIStylistScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const tabBarHeight = useBottomTabBarHeight();
  const [activeTab, setActiveTab] = useState<Tab>('quiz');

  // Style Quiz state
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizResult, setQuizResult] = useState<AIRecommendation | null>(null);

  // Image Search state
  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);
  const [imageLoading, setImageLoading]     = useState(false);
  const [imageResult, setImageResult]       = useState<ImageStyleResult | null>(null);

  const handleQuizSubmit = useCallback(async (input: AIStyleInput) => {
    setQuizLoading(true);
    setQuizResult(null);
    try {
      const handbags = await getHandbags();
      const result = await getAIRecommendation(input, handbags);
      setQuizResult(result);
    } catch (error) {
      console.error('Failed to submit style quiz:', error);
    } finally {
      setQuizLoading(false);
    }
  }, []);

  const handleProductPress = useCallback(
    (handbag: Handbag) => navigation.navigate('ProductDetail', { handbagId: handbag.id }),
    [navigation]
  );

  const pickImage = useCallback(async (fromCamera: boolean) => {
    try {
      const { status } = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          fromCamera ? 'Camera access is needed to take a photo.' : 'Gallery access is needed to pick a photo.'
        );
        return;
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        setTimeout(() => {
          setPickedImageUri(uri);
          setImageResult(null);
        }, 150);
      }
    } catch (error) {
      console.error('Error selecting or capturing image:', error);
      Alert.alert(
        'Error',
        fromCamera
          ? 'Failed to access the camera. Please make sure the camera is available on this device.'
          : 'Failed to access the photo library.'
      );
    }
  }, []);

  const handleAnalyse = useCallback(async () => {
    if (!pickedImageUri) return;
    setImageLoading(true);
    setImageResult(null);
    try {
      const handbags = await getHandbags();
      const result = await analyzeImageStyle(pickedImageUri, handbags);
      setImageResult(result);
    } catch (error) {
      console.error('Failed to analyze image style:', error);
    } finally {
      setImageLoading(false);
    }
  }, [pickedImageUri]);

  const handleReset = useCallback(() => {
    setPickedImageUri(null);
    setImageResult(null);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Personal Stylist</Text>
        <Text style={styles.headerSub}>Find your perfect look with AI recommendations</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TabButton
          label="Style Quiz"
          icon="sparkles-outline"
          active={activeTab === 'quiz'}
          onPress={() => setActiveTab('quiz')}
        />
        <TabButton
          label="Image Search"
          icon="camera-outline"
          active={activeTab === 'image'}
          onPress={() => setActiveTab('image')}
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 8 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === 'quiz' ? (
          <View style={styles.section}>
            <StyleQuiz onSubmit={handleQuizSubmit} loading={quizLoading} />
            {quizLoading && <LoadingAI label="Analysing your style…" />}
            {quizResult && !quizLoading && (
              <RecommendationCard
                recommendation={quizResult}
                onProductPress={handleProductPress}
              />
            )}
          </View>
        ) : (
          <View style={styles.section}>
            {/* Upload area */}
            {!pickedImageUri ? (
              <View style={styles.uploadArea}>
                <View style={styles.uploadIconWrap}>
                  <Ionicons name="image-outline" size={40} color={Colors.text.muted} />
                </View>
                <Text style={styles.uploadTitle}>Upload an outfit or handbag photo</Text>
                <Text style={styles.uploadSub}>Our AI will detect the style and find similar bags for you</Text>
                <View style={styles.uploadBtns}>
                  <Pressable style={styles.uploadBtn} onPress={() => pickImage(false)}>
                    <Ionicons name="images-outline" size={18} color={Colors.primary} />
                    <Text style={styles.uploadBtnText}>Choose Photo</Text>
                  </Pressable>
                  <Pressable style={[styles.uploadBtn, styles.uploadBtnFilled]} onPress={() => pickImage(true)}>
                    <Ionicons name="camera-outline" size={18} color="#fff" />
                    <Text style={[styles.uploadBtnText, { color: '#fff' }]}>Take Photo</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.previewArea}>
                <Image key={pickedImageUri} source={pickedImageUri} style={styles.previewImage} contentFit="cover" />
                <Pressable style={styles.changePhotoBtn} onPress={handleReset} hitSlop={8}>
                  <Ionicons name="close-circle" size={22} color={Colors.text.inverse} />
                </Pressable>
              </View>
            )}

            {/* Analyse button */}
            {pickedImageUri && !imageResult && (
              <Pressable
                style={({ pressed }) => [styles.analyseBtn, pressed && { opacity: 0.85 }, imageLoading && styles.analyseBtnDisabled]}
                onPress={handleAnalyse}
                disabled={imageLoading}
              >
                {imageLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="sparkles" size={16} color="#fff" />
                )}
                <Text style={styles.analyseBtnText}>
                  {imageLoading ? 'Analysing…' : 'Find Similar Styles'}
                </Text>
              </Pressable>
            )}

            {imageLoading && <LoadingAI label="Scanning image for style cues…" />}

            {/* Results */}
            {imageResult && !imageLoading && (
              <ImageResultCard result={imageResult} onProductPress={handleProductPress} />
            )}

            {imageResult && !imageLoading && (
              <Pressable style={({ pressed }) => [styles.analyseBtn, styles.analyseBtnOutline, pressed && { opacity: 0.8 }]} onPress={handleReset}>
                <Ionicons name="refresh-outline" size={16} color={Colors.primary} />
                <Text style={[styles.analyseBtnText, { color: Colors.primary }]}>Try Another Photo</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────

const TabButton: React.FC<{
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}> = ({ label, icon, active, onPress }) => (
  <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
    <Ionicons name={icon} size={16} color={active ? Colors.text.primary : Colors.text.muted} />
    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
  </Pressable>
);

const LoadingAI: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.loadingAI}>
    <Ionicons name="sparkles" size={20} color={Colors.text.primary} />
    <Text style={styles.loadingText}>{label}</Text>
  </View>
);

const CONFIDENCE_COLOR = { high: '#10b981', medium: Colors.secondary, low: Colors.text.muted };

const ImageResultCard: React.FC<{
  result: ImageStyleResult;
  onProductPress: (h: Handbag) => void;
}> = ({ result, onProductPress }) => (
  <View style={styles.resultCard}>
    {/* Detected style header */}
    <View style={styles.resultHeader}>
      <Ionicons name="sparkles" size={16} color={Colors.secondary} />
      <Text style={styles.resultTitle}>Style Detected</Text>
      <View style={[styles.confidenceBadge, { backgroundColor: CONFIDENCE_COLOR[result.confidence] + '20' }]}>
        <View style={[styles.confidenceDot, { backgroundColor: CONFIDENCE_COLOR[result.confidence] }]} />
        <Text style={[styles.confidenceText, { color: CONFIDENCE_COLOR[result.confidence] }]}>
          {result.confidence} match
        </Text>
      </View>
    </View>

    <Text style={styles.detectedStyle}>{result.detectedStyle}</Text>

    {/* Colour tags */}
    <View style={styles.tagsSection}>
      <Text style={styles.tagsSectionLabel}>Detected Colours</Text>
      <View style={styles.colorRow}>
        {result.detectedColors.map(c => (
          <View key={c} style={styles.colorTag}>
            <Text style={styles.colorTagText}>{c}</Text>
          </View>
        ))}
      </View>
    </View>

    {/* Category */}
    <View style={styles.tagsSection}>
      <Text style={styles.tagsSectionLabel}>Suggested Category</Text>
      <Text style={styles.tagValue}>{result.detectedCategory}</Text>
    </View>

    {/* Matching products */}
    {result.matchingHandbags.length > 0 && (
      <View style={styles.tagsSection}>
        <Text style={styles.tagsSectionLabel}>Similar Styles For You</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {result.matchingHandbags.map(h => (
            <Pressable key={h.id} onPress={() => onProductPress(h)} style={styles.miniCard}>
              <View style={styles.miniImage}>
                <ProductImage uri={h.uri} resizeMode="cover" />
              </View>
              <Text style={styles.miniName} numberOfLines={2}>{h.handbagName}</Text>
              <Text style={styles.miniPrice}>{formatCurrency(h.cost)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    lineHeight: 30,
  },
  headerSub: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabLabel: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
    fontWeight: FontWeight.medium,
  },
  tabLabelActive: {
    color: Colors.text.primary,
    fontWeight: FontWeight.semibold,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },
  section: { padding: Spacing.md, gap: Spacing.lg },

  // Upload area
  uploadArea: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  uploadIconWrap: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  uploadTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  uploadSub: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  uploadBtns: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  uploadBtnFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  uploadBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },

  // Preview
  previewArea: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: BorderRadius.lg,
    position: 'relative',
    height: 260,
    backgroundColor: Colors.surfaceAlt,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.lg,
  },
  changePhotoBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: BorderRadius.round,
    padding: 2,
  },

  // Analyse button
  analyseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.md,
  },
  analyseBtnDisabled: { opacity: 0.65 },
  analyseBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  analyseBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#fff',
    letterSpacing: 0.3,
  },

  // Loading
  loadingAI: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
  },
  loadingText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },

  // Result card
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  resultTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    flex: 1,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
  },
  confidenceDot: { width: 5, height: 5, borderRadius: 3 },
  confidenceText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  detectedStyle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    letterSpacing: 0.3,
  },
  tagsSection: { gap: Spacing.xs },
  tagsSectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tagValue: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    fontWeight: FontWeight.medium,
  },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  colorTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  colorTagText: { fontSize: FontSize.xs, color: Colors.text.secondary },
  miniCard: { width: 120, marginRight: Spacing.sm, gap: 4 },
  miniImage: {
    width: '100%',
    height: 100,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceAlt,
  },
  miniName: { fontSize: FontSize.xs, color: Colors.text.primary, lineHeight: 16, height: 32 },
  miniPrice: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text.primary },
});
