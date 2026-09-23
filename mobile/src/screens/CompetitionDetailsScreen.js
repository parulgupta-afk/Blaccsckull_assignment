import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { colors } from '../theme/colors';
import { useCompetitionDetails } from '../hooks/useCompetitionDetails';
import { useRegisterCompetition, useSubmitEntry } from '../hooks/useRegisterCompetition';
import { uploadSubmissionMedia } from '../utils/uploadMedia';

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
  const [isPicking, setIsPicking] = useState(false);
  const { data: competition, isLoading, isError, error, refetch } = useCompetitionDetails(competitionId, locale);
  // Once the backend responds, register/submit target the *canonical*
  // competition id it actually resolved (competition.id) rather than the
  // prop we asked for -- these can differ when the backend's own fallback
  // (e.g. an invalid/missing EXPO_PUBLIC_DEMO_COMPETITION_ID) served a
  // different competition than the one originally requested.
  const activeCompetitionId = competition?.id || competitionId;
  const registerMutation = useRegisterCompetition(activeCompetitionId, locale);
  const submitMutation = useSubmitEntry(activeCompetitionId, locale);

  // Real file picker + validation; the network upload itself is a
  // clearly-labeled stub (see src/utils/uploadMedia.js) since it needs
  // object-storage credentials that can't be committed here. Picker
  // cancellation and validation errors are surfaced to the user instead
  // of failing silently.
  const handleUpload = async () => {
    setIsPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['video/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets?.[0];
      const mediaUrl = await uploadSubmissionMedia(file);
      submitMutation.mutate(mediaUrl);
    } catch (err) {
      Alert.alert('Upload', err.message || 'Something went wrong selecting your file.');
    } finally {
      setIsPicking(false);
    }
  };

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
        isRegistering={registerMutation.isPending || submitMutation.isPending || isPicking}
        onRegister={() => registerMutation.mutate()}
        onUpload={handleUpload}
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
