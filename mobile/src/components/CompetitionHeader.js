import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { t } from '../i18n';

export default function CompetitionHeader({ competition, locale }) {
  const { title, tags, winnersGetCertificate, prizePool, currency, entryFee, capacity } = competition;
  const spotsPct = Math.min(capacity.confirmedParticipants / capacity.maxParticipants, 1);

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {competition.viewer.registrationStatus !== 'not_registered' && (
          <View style={styles.registeredBadge}>
            <Text style={styles.registeredBadgeText}>✓ {t(locale, 'registered')}</Text>
          </View>
        )}
      </View>

      <View style={styles.tagRow}>
        {tags.map((tag) => (
          <View key={tag} style={styles.chip}>
            <Text style={styles.chipText}>{tag}</Text>
          </View>
        ))}
        {winnersGetCertificate && <Text style={styles.certNote}>🏆 Winners get certificate</Text>}
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
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 19, fontWeight: '700', color: colors.ink, flexShrink: 1 },
  registeredBadge: { backgroundColor: colors.primarySoft, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  registeredBadgeText: { color: colors.primary, fontWeight: '600', fontSize: 12 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  chip: { backgroundColor: colors.chipBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  chipText: { fontSize: 12, color: colors.bodyText },
  certNote: { fontSize: 12, color: colors.bodyText },
  metricsRow: { flexDirection: 'row', marginTop: 16, gap: 20 },
  metricLabel: { fontSize: 12, color: colors.muted },
  metricValue: { fontSize: 16, fontWeight: '700', color: colors.primary },
  spotsCol: { flex: 1 },
  spotsLabel: { fontSize: 12, color: colors.bodyText, marginBottom: 6 },
  progressTrack: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: colors.primary },
  spotsSub: { fontSize: 11, color: colors.muted, marginTop: 4 },
});
