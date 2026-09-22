import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { t } from '../i18n';

const MEDAL_ICON = { 1: '🏆', 2: '🥈', 3: '🥉' };

export default function RewardsList({ rewards, currency, locale }) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t(locale, 'rewards')}</Text>
        <Text style={styles.subtitle}>{t(locale, 'allPositions')}</Text>
      </View>
      {rewards.map((r) => (
        <View key={r.position} style={styles.row}>
          <Text style={styles.icon}>{MEDAL_ICON[r.position] || '⭐'}</Text>
          <Text style={styles.label}>{r.label}</Text>
          <Text style={styles.amount}>
            {currency === 'INR' ? '₹' : currency} {r.amount}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  headerRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 10 },
  title: { fontSize: 14, fontWeight: '700', color: colors.ink },
  subtitle: { fontSize: 11, color: colors.muted },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border },
  icon: { fontSize: 15, width: 24 },
  label: { flex: 1, fontSize: 13, color: colors.ink },
  amount: { fontSize: 13, fontWeight: '700', color: colors.ink },
});
