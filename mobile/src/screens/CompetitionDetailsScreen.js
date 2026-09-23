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
import VideoModal from '../components/VideoModal';

export default function CompetitionDetailsScreen({ competitionId, isAuthenticated = true, onGoBack }) {
  const [locale, setLocale] = useState('en');
  const [isPicking, setIsPicking] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null); // { url, title }

  const { data: competition, isLoading, isError, error, refetch } = useCompetitionDetails(competitionId, locale);
  const activeCompetitionId = competition?.id || competitionId;
  const registerMutation = useRegisterCompetition(activeCompetitionId, locale);
  const submitMutation = useSubmitEntry(activeCompetitionId, locale);

  const handleUpload = async () => {
    setIsPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['video/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets?.[0];
      if (!file) return;

      const MAX_BYTES = 500 * 1024 * 1024;
      if (file.size && file.size > MAX_BYTES) {
        Alert.alert('File too large', 'Submission video must be under 500 MB.');
        return;
      }

      const mediaUrl = await uploadSubmissionMedia(file);
      submitMutation.mutate({ mediaUrl });
    } catch (err) {
      Alert.alert('Upload failed', err.message || 'Could not pick or upload file.');
    } finally {
      setIsPicking(false);
    }
  };

  const handlePlayVideo = (url, title) => {
    if (!url) return;
    setActiveVideo({ url, title });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError || !competition) {
    return (
      <SafeAreaView style={[styles.screen, styles.centered]}>
        <Text style={styles.errorText}>{error?.message || 'Could not load competition details.'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        {onGoBack ? (
          <TouchableOpacity onPress={onGoBack} style={styles.backBtn}>
            <Text style={styles.backText}>← {locale === 'hi' ? 'वापस' : 'Back'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <View style={styles.langToggle}>
          <TouchableOpacity
            style={[styles.langPill, locale === 'en' && styles.langPillActive]}
            onPress={() => setLocale('en')}
            activeOpacity={0.8}
          >
            <Text style={[styles.langText, locale === 'en' && styles.langTextActive]}>ENG</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langPill, locale === 'hi' && styles.langPillActive]}
            onPress={() => setLocale('hi')}
            activeOpacity={0.8}
          >
            <Text style={[styles.langText, locale === 'hi' && styles.langTextActive]}>हिंदी</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <CompetitionHeader competition={competition} locale={locale} />
        <JudgeCard judge={competition.judge} locale={locale} onPlayVideo={handlePlayVideo} />
        <CountdownBanner competition={competition} locale={locale} />
        <ImportantDatesGrid dates={competition.dates} locale={locale} />
        <PreviousWinnersCarousel winners={competition.previousWinners} locale={locale} onPlayVideo={handlePlayVideo} />
        <InfoTabs tabs={competition.tabs} locale={locale} />
        <RewardsList rewards={competition.rewards} currency={competition.currency} locale={locale} />
        {competition.disclaimer && (
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              ⓘ {locale === 'hi' ? 'निर्णय के लिए केवल शुल्क भुगतान करने वाले प्रतिभागियों की प्रविष्टियों पर ही विचार किया जाएगा।' : competition.disclaimer}
            </Text>
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

      <VideoModal
        visible={Boolean(activeVideo)}
        videoUrl={activeVideo?.url}
        title={activeVideo?.title}
        onClose={() => setActiveVideo(null)}
        locale={locale}
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
    paddingVertical: 10,
  },
  backBtn: {},
  backText: { fontSize: 14, fontWeight: '600', color: colors.ink },
  langToggle: { flexDirection: 'row', backgroundColor: colors.chipBg, borderRadius: 20, padding: 2 },
  langPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16 },
  langPillActive: { backgroundColor: colors.primary },
  langText: { fontSize: 11, color: colors.bodyText, fontWeight: '600' },
  langTextActive: { color: '#fff' },
  content: { paddingHorizontal: 16, paddingTop: 2, paddingBottom: 16, gap: 10 },
  disclaimerBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BDE4E0',
  },
  disclaimerText: { fontSize: 12, color: colors.ink, lineHeight: 18 },
});
