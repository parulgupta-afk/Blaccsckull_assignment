import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { useCountdown } from '../hooks/useCountdown';
import { t } from '../i18n';

const pad = (n) => String(n).padStart(2, '0');

export default function CountdownBanner({ competition, locale }) {
  const { lifecycle, dates, serverTime } = competition;

  // Countdown target depends on the current phase: while registration is
  // open we count down to the registration deadline; once submissions are
  // open we count down to the submission close instead. This mirrors how a
  // real participant's attention shifts through the competition lifecycle.
  const target = lifecycle.phase === 'submission_open' ? dates.submissionEndsAt : dates.registrationDeadline;
  const label =
    lifecycle.phase === 'submission_open' ? t(locale, 'submissionEnds') : t(locale, 'registrationClosesIn');

  const { days, hours, minutes, seconds, isExpired } = useCountdown(target, serverTime);

  if (lifecycle.phase === 'judging' || lifecycle.phase === 'completed') return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>⏳</Text>
      <Text style={styles.label}>{label}</Text>
      {!isExpired ? (
        <Text style={styles.time}>
          {String(days).padStart(2, '0')}d : {pad(hours)}h : {pad(minutes)}m : {pad(seconds)}s
        </Text>
      ) : (
        <Text style={styles.time}>{t(locale, 'registrationClosed')}</Text>
      )}
      <Text style={styles.hurry}>⏱ {t(locale, 'hurryUp')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
    flexWrap: 'wrap',
  },
  icon: { fontSize: 14 },
  label: { fontSize: 12, color: colors.ink, flexShrink: 1 },
  time: { fontSize: 14, fontWeight: '700', color: colors.primary, marginLeft: 'auto' },
  hurry: { fontSize: 11, color: colors.primary },
});
