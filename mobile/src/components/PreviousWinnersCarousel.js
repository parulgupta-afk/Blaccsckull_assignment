import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from 'react-native';
import { colors } from '../theme/colors';
import { t } from '../i18n';
import Avatar from './Avatar';

export default function PreviousWinnersCarousel({ winners, locale }) {
  if (!winners?.length) return null;

  return (
    <View>
      <Text style={styles.title}>{t(locale, 'previousWinners')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {winners.map((w, idx) => (
          <TouchableOpacity
            key={`${w.name}-${idx}`}
            style={styles.item}
            onPress={() => w.videoUrl && Linking.openURL(w.videoUrl)}
            activeOpacity={w.videoUrl ? 0.7 : 1}
          >
            <Avatar uri={w.imageUrl} name={w.name} size={88} radius={12} />
            {w.videoUrl && (
              <View style={styles.playOverlay}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            )}
            <Text style={styles.name} numberOfLines={1}>
              {w.name}
            </Text>
            <Text style={styles.position}>{w.positionLabel}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 10 },
  row: { gap: 12 },
  item: { width: 88 },
  playOverlay: {
    position: 'absolute',
    top: 34,
    left: 34,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: '#fff', fontSize: 10 },
  name: { fontSize: 12, fontWeight: '600', color: colors.ink, marginTop: 6 },
  position: { fontSize: 11, color: colors.muted },
});
