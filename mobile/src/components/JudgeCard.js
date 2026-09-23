import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { t } from '../i18n';
import Avatar from './Avatar';

export default function JudgeCard({ judge, locale, onPlayVideo }) {
  return (
    <View style={styles.card}>
      <Avatar uri={judge.photoUrl} name={judge.name} size={48} />
      <View style={styles.info}>
        <Text style={styles.role}>{t(locale, 'judge')}</Text>
        <Text style={styles.name}>{judge.name}</Text>
        <Text style={styles.subtitle}>{judge.title}</Text>
        <Text style={styles.subtitle}>{judge.experienceLabel}</Text>
      </View>
      {judge.introVideoUrl && (
        <TouchableOpacity
          style={styles.videoBtn}
          onPress={() => onPlayVideo && onPlayVideo(judge.introVideoUrl, `${judge.name} - ${t(locale, 'introVideo')}`)}
          activeOpacity={0.8}
        >
          <View style={styles.playCircle}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
          <Text style={styles.videoLabel}>{t(locale, 'introVideo')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  info: { flex: 1 },
  role: { fontSize: 11, color: colors.muted },
  name: { fontSize: 14, fontWeight: '700', color: colors.ink },
  subtitle: { fontSize: 12, color: colors.bodyText },
  videoBtn: { alignItems: 'center', width: 68 },
  playCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { fontSize: 13, color: colors.primary, marginLeft: 2 },
  videoLabel: { fontSize: 10, color: colors.primary, fontWeight: '600', marginTop: 3 },
});
