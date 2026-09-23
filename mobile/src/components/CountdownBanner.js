import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { useCountdown } from '../hooks/useCountdown';
import { t } from '../i18n';

const pad = (n) => String(n).padStart(2, '0');

export default function CountdownBanner({ competition, locale }) {
  const { lifecycle, dates, serverTime } = competition;

  // Accurately targets the actual Submission Ends date as requested
  const target = dates?.submissionEndsAt || dates?.registrationDeadline;
  const label = t(locale, 'submissionEnds');

  const { days, hours, minutes, seconds, isExpired } = useCountdown(target, serverTime);

  if (['judging', 'completed'].includes(lifecycle?.phase)) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>⏳</Text>
      <Text style={styles.label}>{label}</Text>
      {!isExpired ? (
        <Text style={styles.time}>
          {String(days).padStart(2, '0')}d : {pad(hours)}h : {pad(minutes)}m : {pad(seconds)}s
        </Text>
      ) : (
        <Text style={styles.time}>{t(locale, 'closed')}</Text>
      )}
      {!isExpired && <Text style={styles.hurry}>⏱ {t(locale, 'hurryUp')}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: '#BDE4E0',
  },
  icon: { fontSize: 14 },
  label: { fontSize: 12, fontWeight: '600', color: colors.ink, flexShrink: 1 },
  time: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDark,
    marginLeft: 'auto',
    letterSpacing: 0.5,
  },
  hurry: { fontSize: 11, fontWeight: '700', color: colors.primary },
});
