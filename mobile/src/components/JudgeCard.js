import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { colors } from '../theme/colors';
import { t } from '../i18n';

export default function JudgeCard({ judge, locale }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: judge.photoUrl }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.role}>{t(locale, 'judge')}</Text>
        <Text style={styles.name}>{judge.name}</Text>
        <Text style={styles.subtitle}>{judge.title}</Text>
        <Text style={styles.subtitle}>{judge.experienceLabel}</Text>
      </View>
      {judge.introVideoUrl && (
        <TouchableOpacity style={styles.videoBtn} onPress={() => Linking.openURL(judge.introVideoUrl)}>
          <Text style={styles.playIcon}>▶</Text>
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
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.chipBg },
  info: { flex: 1 },
  role: { fontSize: 11, color: colors.muted },
  name: { fontSize: 15, fontWeight: '700', color: colors.ink },
  subtitle: { fontSize: 12, color: colors.bodyText },
  videoBtn: { alignItems: 'center', width: 64 },
  playIcon: { fontSize: 18, color: colors.primary },
  videoLabel: { fontSize: 10, color: colors.primary, marginTop: 2 },
});
