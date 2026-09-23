import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { t } from '../i18n';

const formatDate = (iso, locale) => {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  });
  const timePart = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  return { datePart, timePart };
};

function DateCell({ icon, label, iso, locale }) {
  const { datePart, timePart } = formatDate(iso, locale);
  return (
    <View style={styles.cell}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{datePart}</Text>
        <Text style={styles.time}>{timePart}</Text>
      </View>
    </View>
  );
}

export default function ImportantDatesGrid({ dates, locale }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t(locale, 'importantDates')}</Text>
      <View style={styles.grid}>
        <DateCell icon="📅" label={t(locale, 'registerBefore')} iso={dates.registrationDeadline} locale={locale} />
        <DateCell icon="📨" label={t(locale, 'submissionStarts')} iso={dates.submissionStartsAt} locale={locale} />
        <DateCell icon="⬆️" label={t(locale, 'submissionEnds')} iso={dates.submissionEndsAt} locale={locale} />
        <DateCell icon="🏆" label={t(locale, 'resultDate')} iso={dates.resultDate} locale={locale} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { flexDirection: 'row', gap: 8, width: '46%' },
  icon: { fontSize: 16 },
  textWrap: { flex: 1 },
  label: { fontSize: 11, color: colors.muted },
  value: { fontSize: 13, fontWeight: '700', color: colors.ink, marginTop: 1 },
  time: { fontSize: 11, color: colors.bodyText },
});
