import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

/**
 * Renders a photo, but falls back to an initials circle if the image URL
 * 404s, times out, or is otherwise unreachable -- so a broken/missing photo
 * never just renders as a blank gap, which is easy to mistake for "nothing
 * happened" or "no picture was ever there."
 */
export default function Avatar({ uri, name, size = 52, radius }) {
  const [failed, setFailed] = useState(false);
  const borderRadius = radius ?? size / 2; // default circular; pass radius for rounded-square use
  const dimensionStyle = { width: size, height: size, borderRadius };

  if (!uri || failed) {
    return (
      <View style={[styles.fallback, dimensionStyle]}>
        <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{getInitials(name) || '?'}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      resizeMode="cover"
      style={[styles.image, dimensionStyle]}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.chipBg },
  fallback: { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.primary, fontWeight: '700' },
});
