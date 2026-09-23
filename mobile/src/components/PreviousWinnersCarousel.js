import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { t } from '../i18n';
import Avatar from './Avatar';

const POSITION_HI = {
  1: '1st विजेता',
  2: '2nd विजेता',
  3: '3rd विजेता',
  4: '4th विजेता',
  5: '5th विजेता',
  6: '6th विजेता',
};

export default function PreviousWinnersCarousel({ winners, locale, onPlayVideo }) {
  if (!winners?.length) return null;

  const getPositionLabel = (w) => {
    if (locale === 'hi') {
      return POSITION_HI[w.position] || `${w.position}th विजेता`;
    }
    return w.positionLabel || `${w.position}th Winner`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t(locale, 'previousWinners')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {winners.map((w, idx) => {
          const posLabel = getPositionLabel(w);
          return (
            <TouchableOpacity
              key={`${w.name}-${idx}`}
              style={styles.item}
              onPress={() => w.videoUrl && onPlayVideo && onPlayVideo(w.videoUrl, `${w.name} (${posLabel})`)}
              activeOpacity={w.videoUrl ? 0.7 : 1}
            >
              <Avatar uri={w.imageUrl} name={w.name} size={80} radius={12} />
              {w.videoUrl && (
                <View style={styles.playOverlay}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
              )}
              <Text style={styles.name} numberOfLines={1}>
                {w.name}
              </Text>
              <Text style={styles.position}>{posLabel}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 2 },
  title: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  row: { gap: 10, paddingRight: 4 },
  item: { width: 80 },
  playOverlay: {
    position: 'absolute',
    top: 30,
    left: 30,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: '#fff', fontSize: 10, marginLeft: 1 },
  name: { fontSize: 12, fontWeight: '600', color: colors.ink, marginTop: 4 },
  position: { fontSize: 11, color: colors.muted },
});
