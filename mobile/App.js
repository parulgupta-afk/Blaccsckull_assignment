import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CompetitionDetailsScreen from './src/screens/CompetitionDetailsScreen';

const queryClient = new QueryClient();

// A real app wires this via React Navigation (route param = competitionId,
// auth state from context). Hardcoded here so the screen is runnable
// standalone against the seeded competition.
const DEMO_COMPETITION_ID = 'REPLACE_WITH_SEEDED_COMPETITION_ID';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <CompetitionDetailsScreen competitionId={DEMO_COMPETITION_ID} isAuthenticated />
    </QueryClientProvider>
  );
}
