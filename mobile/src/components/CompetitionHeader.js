import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { t } from '../i18n';

const TAG_TRANSLATIONS = {
  Dance: { en: 'Dance', hi: 'शास्त्रीय नृत्य' },
  'Multi-Win': { en: 'Multi-Win', hi: 'मल्टी-विन' },
};

export default function CompetitionHeader({ competition, locale }) {
  const { title, tags, winnersGetCertificate, prizePool, entryFee, capacity } = competition;
  const spotsPct = Math.min(capacity.confirmedParticipants / capacity.maxParticipants, 1);

  const getTagLabel = (tag) => {
    return TAG_TRANSLATIONS[tag]?.[locale] || tag;
  };

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {['confirmed', 'submitted'].includes(competition.viewer.registrationStatus) && (
          <View style={styles.registeredBadge}>
            <Text style={styles.registeredBadgeText}>✓ {t(locale, 'registered')}</Text>
          </View>
        )}
      </View>

      <View style={styles.tagRow}>
        {tags.map((tag) => (
          <View key={tag} style={styles.chip}>
            <Text style={styles.chipText}>{getTagLabel(tag)}</Text>
          </View>
        ))}
        {winnersGetCertificate && (
          <Text style={styles.certNote}>🏆 {t(locale, 'winnersGetCertificate')}</Text>
        )}
      </View>

      <View style={styles.metricsRow}>
        <View>
          <Text style={styles.metricLabel}>{t(locale, 'prizePool')}</Text>
          <Text style={styles.metricValue}>₹ {prizePool}</Text>
        </View>
        <View>
          <Text style={styles.metricLabel}>{t(locale, 'entryFee')}</Text>
          <Text style={styles.metricValue}>₹ {entryFee}</Text>
        </View>
        <View style={styles.spotsCol}>
          <Text style={styles.spotsLabel}>
            {capacity.isFull ? t(locale, 'full') : t(locale, 'spotsLeft', { count: capacity.spotsLeft })}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${spotsPct * 100}%` }]} />
          </View>
          <Text style={styles.spotsSub}>
            {t(locale, 'spotsBooked', { booked: capacity.confirmedParticipants, max: capacity.maxParticipants })}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.border },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 18, fontWeight: '700', color: colors.ink, flexShrink: 1 },
  registeredBadge: { backgroundColor: colors.primarySoft, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  registeredBadgeText: { color: colors.primary, fontWeight: '600', fontSize: 11 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  chip: { backgroundColor: colors.chipBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  chipText: { fontSize: 11, color: colors.bodyText, fontWeight: '600' },
  certNote: { fontSize: 11, color: colors.bodyText, fontWeight: '500' },
  metricsRow: { flexDirection: 'row', marginTop: 12, gap: 16, alignItems: 'center' },
  metricLabel: { fontSize: 11, color: colors.muted, fontWeight: '500' },
  metricValue: { fontSize: 16, fontWeight: '700', color: colors.primary },
  spotsCol: { flex: 1 },
  spotsLabel: { fontSize: 12, fontWeight: '700', color: colors.ink, marginBottom: 5 },
  progressTrack: { height: 6, backgroundColor: '#CFE5E3', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  spotsSub: { fontSize: 10, color: colors.muted, marginTop: 3 },
});
