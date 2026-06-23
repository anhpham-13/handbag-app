import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { Handbag } from '../types/handbag';
import { Colors } from '../constants/colors';
import { Spacing, FontSize, BorderRadius, FontWeight } from '../constants/spacing';
import { useFavorites } from '../hooks/useFavorites';
import { ProductCard } from '../components/product/ProductCard';
import { SearchBar } from '../components/product/SearchBar';
import { EmptyState } from '../components/common/EmptyState';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const {
    filteredFavorites,
    loading,
    isFavorite,
    removeSingle,
    removeSelected,
    removeAll,
    selectedIds,
    toggleSelectItem,
    searchTerm,
    setSearchTerm,
    favorites,
  } = useFavorites();

  const handleProductPress = useCallback(
    (handbag: Handbag) => navigation.navigate('ProductDetail', { handbagId: handbag.id }),
    [navigation]
  );

  const handleRemoveSingle = useCallback((id: string) => {
    Alert.alert(
      'Remove from Favorites',
      'Remove this handbag from your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeSingle(id) },
      ]
    );
  }, [removeSingle]);

  const handleRemoveSelected = useCallback(() => {
    Alert.alert(
      `Remove ${selectedIds.size} item${selectedIds.size > 1 ? 's' : ''}`,
      `Remove ${selectedIds.size} selected handbag${selectedIds.size > 1 ? 's' : ''} from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: removeSelected },
      ]
    );
  }, [selectedIds.size, removeSelected]);

  const handleRemoveAll = useCallback(() => {
    Alert.alert(
      'Remove All Favorites',
      `Remove all ${favorites.length} handbags from your favorites? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove All', style: 'destructive', onPress: removeAll },
      ]
    );
  }, [favorites.length, removeAll]);

  const renderItem = useCallback(
    ({ item, index }: { item: Handbag; index: number }) => {
      const isSelected = selectedIds.has(item.id);
      return (
        <View style={[styles.cardWrapper, index % 2 === 0 ? styles.cardLeft : styles.cardRight]}>
          {/* Checkbox always visible */}
          <Pressable
            style={styles.checkBtn}
            onPress={() => toggleSelectItem(item.id)}
            hitSlop={6}
          >
            <Ionicons
              name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
              size={26}
              color={isSelected ? Colors.secondary : 'rgba(255,255,255,0.9)'}
            />
          </Pressable>
          <ProductCard
            handbag={item}
            isFavorite={isFavorite(item.id)}
            onPress={() => handleProductPress(item)}
            onToggleFavorite={() => handleRemoveSingle(item.id)}
          />
        </View>
      );
    },
    [selectedIds, isFavorite, handleProductPress, handleRemoveSingle, toggleSelectItem]
  );

  const keyExtractor = useCallback((item: Handbag) => item.id, []);

  const hasSelected = selectedIds.size > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>My Favorites</Text>
        {favorites.length > 0 ? (
          <Pressable onPress={handleRemoveAll} style={styles.deleteAllBtn} hitSlop={4}>
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
            <Text style={styles.deleteAllText}>All</Text>
          </Pressable>
        ) : (
          <View style={styles.headerBtn} />
        )}
      </View>

      {/* ── Search ── */}
      {favorites.length > 0 && (
        <View style={styles.searchContainer}>
          <SearchBar value={searchTerm} onChangeText={setSearchTerm} placeholder="Search favorites…" />
        </View>
      )}

      {/* ── List ── */}
      {!loading && filteredFavorites.length === 0 ? (
        favorites.length === 0 ? (
          <EmptyState
            icon="heart-outline"
            title="No favorites yet"
            message="Tap the heart icon on any handbag to save it here."
            actionLabel="Browse Handbags"
            onAction={() => navigation.goBack()}
          />
        ) : (
          <EmptyState
            icon="search-outline"
            title="No matches"
            message={`No favorites match "${searchTerm}"`}
            actionLabel="Clear search"
            onAction={() => setSearchTerm('')}
          />
        )
      ) : (
        <FlatList
          data={filteredFavorites}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerStyle={[styles.listContent, hasSelected && styles.listContentWithBar]}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          initialNumToRender={6}
        />
      )}

      {/* ── Bottom delete bar ── */}
      {hasSelected && (
        <View style={styles.bottomBar}>
          <Pressable style={styles.deleteSelectedBtn} onPress={handleRemoveSelected}>
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={styles.deleteSelectedText}>Delete {selectedIds.size} item{selectedIds.size > 1 ? 's' : ''}</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  headerBtn: { padding: Spacing.xs, width: 56 },
  deleteAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.error,
    width: 56,
    justifyContent: 'center',
  },
  deleteAllText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.error,
  },

  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },

  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  listContentWithBar: {
    paddingBottom: 90,
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  cardLeft: { paddingLeft: 0 },
  cardRight: { paddingRight: 0 },
  checkBtn: {
    position: 'absolute',
    top: Spacing.xs + 2,
    left: Spacing.xs + 2,
    zIndex: 10,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteSelectedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.md,
  },
  deleteSelectedText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#fff',
    letterSpacing: 0.3,
  },
});
