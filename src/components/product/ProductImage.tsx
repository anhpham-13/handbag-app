import React, { useState } from 'react';
import { Image, View, StyleSheet, ImageStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { BorderRadius } from '../../constants/spacing';

interface ProductImageProps {
  uri: string;
  style?: ImageStyle;
  containerStyle?: object;
  resizeMode?: 'cover' | 'contain' | 'stretch';
}

export const ProductImage: React.FC<ProductImageProps> = ({
  uri,
  style,
  containerStyle,
  resizeMode = 'cover',
}) => {
  const [error, setError] = useState(false);

  if (error || !uri) {
    return (
      <View style={[styles.placeholder, containerStyle]}>
        <Ionicons name="bag-handle-outline" size={40} color={Colors.text.light} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.image, style]}
      resizeMode={resizeMode}
      onError={() => setError(true)}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
});
