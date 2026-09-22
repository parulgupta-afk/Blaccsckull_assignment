import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { t } from '../i18n';

const TABS = ['about', 'judgingParameters', 'rulesAndEligibility'];

export default function InfoTabs({ tabs, locale }) {
  const [active, setActive] = useState('about');
  const [expanded, setExpanded] = useState(false);
  const content = tabs[active];
  const isLong = content && content.length > 140;
  const displayText = isLong && !expanded ? `${content.slice(0, 140)}…` : content;

  return (
    <View style={styles.card}>
      <View style={styles.tabRow}>
        {TABS.map((key) => (
          <TouchableOpacity key={key} onPress={() => { setActive(key); setExpanded(false); }} style={styles.tabBtn}>
            <Text style={[styles.tabLabel, active === key && styles.tabLabelActive]}>{t(locale, key)}</Text>
            {active === key && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.body}>{displayText}</Text>
      {isLong && (
        <TouchableOpacity onPress={() => setExpanded((e) => !e)}>
          <Text style={styles.viewMore}>{t(locale, expanded ? 'viewLess' : 'viewMore')} ⌄</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  tabRow: { flexDirection: 'row', gap: 20, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8, marginBottom: 12 },
  tabBtn: { alignItems: 'flex-start' },
  tabLabel: { fontSize: 12, color: colors.muted },
  tabLabelActive: { color: colors.primary, fontWeight: '700' },
  tabUnderline: { height: 2, backgroundColor: colors.primary, width: '100%', marginTop: 6, borderRadius: 1 },
  body: { fontSize: 13, color: colors.bodyText, lineHeight: 19 },
  viewMore: { fontSize: 12, color: colors.primary, fontWeight: '600', marginTop: 8 },
});
