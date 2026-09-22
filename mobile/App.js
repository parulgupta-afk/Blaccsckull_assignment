import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CompetitionDetailsScreen from './src/screens/CompetitionDetailsScreen';
import { bootstrapDevSession } from './src/dev/devSession';
import { colors } from './src/theme/colors';

const queryClient = new QueryClient();

export default function App() {
  const [session, setSession] = useState(null); // null while resolving

  useEffect(() => {
    bootstrapDevSession().then(setSession);
  }, []);

  if (!session) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  // Fail loudly and helpfully rather than silently rendering a screen that
  // depends on an undefined competitionId (which previously happened when
  // DEMO_COMPETITION_ID was left as the literal placeholder string).
  if (!session.competitionId) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>Development setup needed</Text>
        <Text style={styles.body}>
          Set EXPO_PUBLIC_DEMO_COMPETITION_ID in mobile/.env to the competition _id printed by{'\n'}
          `npm run seed` in the backend, then restart Expo.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <CompetitionDetailsScreen competitionId={session.competitionId} isAuthenticated={session.hasToken} />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  title: { fontSize: 16, fontWeight: '700', color: colors.ink },
  body: { fontSize: 13, color: colors.bodyText, textAlign: 'center', lineHeight: 19 },
});
