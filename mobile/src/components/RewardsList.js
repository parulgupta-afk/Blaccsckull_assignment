import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { t } from '../i18n';

const MEDAL_ICON = { 1: '🏆', 2: '🥈', 3: '🥉' };

const POSITION_LABEL_HI = {
  1: '1st विजेता',
  2: '2nd विजेता',
  3: '3rd विजेता',
  4: '4th विजेता',
  5: '5th विजेता',
  6: '6th विजेता',
};

export default function RewardsList({ rewards, currency, locale }) {
  const getRewardLabel = (r) => {
    if (locale === 'hi') {
      return POSITION_LABEL_HI[r.position] || `${r.position}th विजेता`;
    }
    return r.label || `${r.position}th Winner`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t(locale, 'rewards')}</Text>
        <Text style={styles.subtitle}>{t(locale, 'allPositions')}</Text>
      </View>
      {rewards.map((r) => (
        <View key={r.position} style={styles.row}>
          <Text style={styles.icon}>{MEDAL_ICON[r.position] || '⭐'}</Text>
          <Text style={styles.label}>{getRewardLabel(r)}</Text>
          <Text style={styles.amount}>
            {currency === 'INR' ? '₹' : currency} {r.amount}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.border },
  headerRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 8 },
  title: { fontSize: 14, fontWeight: '700', color: colors.ink },
  subtitle: { fontSize: 11, color: colors.muted },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderTopWidth: 1, borderTopColor: colors.border },
  icon: { fontSize: 15, width: 24 },
  label: { flex: 1, fontSize: 13, color: colors.ink },
  amount: { fontSize: 13, fontWeight: '700', color: colors.ink },
});
