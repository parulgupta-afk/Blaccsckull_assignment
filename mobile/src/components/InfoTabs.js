import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { t } from '../i18n';

const TABS = ['about', 'judgingParameters', 'rulesAndEligibility'];
const PREVIEW_LIMIT = 220;

export default function InfoTabs({ tabs, locale }) {
  const [active, setActive] = useState('about');
  const [expanded, setExpanded] = useState(false);
  const content = tabs?.[active] || '';

  const isLong = content.length > PREVIEW_LIMIT;

  let displayText = content;
  if (isLong && !expanded) {
    const spaceIndex = content.lastIndexOf(' ', PREVIEW_LIMIT);
    const cutoff = spaceIndex > 150 ? spaceIndex : PREVIEW_LIMIT;
    displayText = `${content.slice(0, cutoff)}…`;
  }

  return (
    <View style={styles.card}>
      <View style={styles.tabRow}>
        {TABS.map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => {
              setActive(key);
              setExpanded(false);
            }}
            style={styles.tabBtn}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabLabel, active === key && styles.tabLabelActive]}>
              {t(locale, key)}
            </Text>
            {active === key && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.body}>{displayText}</Text>
      {isLong && (
        <TouchableOpacity
          onPress={() => setExpanded((e) => !e)}
          style={styles.moreBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.viewMore}>
            {t(locale, expanded ? 'viewLess' : 'viewMore')} {expanded ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 6,
    marginBottom: 8,
  },
  tabBtn: { alignItems: 'flex-start' },
  tabLabel: { fontSize: 12, color: colors.muted, fontWeight: '500' },
  tabLabelActive: { color: colors.primary, fontWeight: '700' },
  tabUnderline: {
    height: 2.5,
    backgroundColor: colors.primary,
    width: '100%',
    marginTop: 5,
    borderRadius: 1.5,
  },
  body: { fontSize: 13, color: colors.bodyText, lineHeight: 20 },
  moreBtn: { alignSelf: 'flex-start', marginTop: 6, paddingVertical: 2 },
  viewMore: { fontSize: 12, color: colors.primary, fontWeight: '700' },
});
