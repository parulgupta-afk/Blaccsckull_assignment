import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { colors } from '../theme/colors';
import { useCompetitionDetails } from '../hooks/useCompetitionDetails';
import { useRegisterCompetition, useSubmitEntry } from '../hooks/useRegisterCompetition';

import CompetitionHeader from '../components/CompetitionHeader';
import JudgeCard from '../components/JudgeCard';
import CountdownBanner from '../components/CountdownBanner';
import ImportantDatesGrid from '../components/ImportantDatesGrid';
import PreviousWinnersCarousel from '../components/PreviousWinnersCarousel';
import InfoTabs from '../components/InfoTabs';
import RewardsList from '../components/RewardsList';
import BottomActionBar from '../components/BottomActionBar';

export default function CompetitionDetailsScreen({ competitionId, isAuthenticated = true, onGoBack }) {
  const [locale, setLocale] = useState('en');
  const { data: competition, isLoading, isError, error, refetch } = useCompetitionDetails(competitionId, locale);
  const registerMutation = useRegisterCompetition(competitionId, locale);
  const submitMutation = useSubmitEntry(competitionId, locale);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError || !competition) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error?.message || 'Competition not found.'}</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onGoBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Go back</Text>
        </TouchableOpacity>
        <View style={styles.langToggle}>
          <TouchableOpacity onPress={() => setLocale('en')} style={[styles.langPill, locale === 'en' && styles.langPillActive]}>
            <Text style={[styles.langText, locale === 'en' && styles.langTextActive]}>ENG</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLocale('hi')} style={[styles.langPill, locale === 'hi' && styles.langPillActive]}>
            <Text style={[styles.langText, locale === 'hi' && styles.langTextActive]}>हिंदी</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <CompetitionHeader competition={competition} locale={locale} />
        <JudgeCard judge={competition.judge} locale={locale} />
        <CountdownBanner competition={competition} locale={locale} />
        <ImportantDatesGrid dates={competition.dates} locale={locale} />
        <PreviousWinnersCarousel winners={competition.previousWinners} locale={locale} />
        <InfoTabs tabs={competition.tabs} locale={locale} />
        <RewardsList rewards={competition.rewards} currency={competition.currency} locale={locale} />
        {competition.disclaimer && (
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>ⓘ {competition.disclaimer}</Text>
          </View>
        )}
      </ScrollView>

      <BottomActionBar
        competition={competition}
        locale={locale}
        isAuthenticated={isAuthenticated}
        isRegistering={registerMutation.isPending || submitMutation.isPending}
        onRegister={() => registerMutation.mutate()}
        // A real flow opens a document/video picker, uploads to storage,
        // then submits the resulting URL. Stubbed with a fixed URL to keep
        // this screen's business-logic wiring demonstrable end-to-end.
        onUpload={() => submitMutation.mutate('https://example.com/submissions/demo.mp4')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { color: colors.danger },
  retryBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.primary, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {},
  backText: { fontSize: 15, fontWeight: '600', color: colors.ink },
  langToggle: { flexDirection: 'row', backgroundColor: colors.chipBg, borderRadius: 20, padding: 2 },
  langPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18 },
  langPillActive: { backgroundColor: colors.primary },
  langText: { fontSize: 12, color: colors.bodyText, fontWeight: '600' },
  langTextActive: { color: '#fff' },
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 14 },
  disclaimerBox: { backgroundColor: colors.primarySoft, borderRadius: 10, padding: 12 },
  disclaimerText: { fontSize: 12, color: colors.ink },
});
