import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CompetitionDetailsScreen from './src/screens/CompetitionDetailsScreen';

const queryClient = new QueryClient();

// A real app wires this via React Navigation (route param = competitionId,
// auth state from context). Hardcoded here so the screen is runnable
// standalone against the seeded competition.
const DEMO_COMPETITION_ID = '6ab1f2a0b91b19bc597a7b01';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <CompetitionDetailsScreen competitionId={DEMO_COMPETITION_ID} isAuthenticated />
    </QueryClientProvider>
  );
}
