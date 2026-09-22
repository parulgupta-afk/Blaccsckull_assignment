import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { competitionApi } from '../api/competitionApi';

const ERROR_MESSAGES = {
  COMPETITION_FULL: 'This competition just filled up. Better luck next time!',
  REGISTRATION_CLOSED: 'Registration has closed for this competition.',
  ALREADY_REGISTERED: "You're already registered for this competition.",
  UNAUTHORIZED: 'Please log in to register.',
};

export function useRegisterCompetition(competitionId, locale) {
  const queryClient = useQueryClient();

  return useMutation({
    // In production this would only fire after a Razorpay checkout success
    // callback; wired here as a direct call to keep the flow demonstrable
    // (see README trade-offs) -- the backend still treats it as a
    // `pending_payment` hold, not an instant confirmation.
    mutationFn: () => competitionApi.register(competitionId),
    onSuccess: () => {
      // Re-fetch so spotsLeft / viewer.registrationStatus reflect the
      // server's authoritative post-write state rather than a guessed
      // optimistic update -- correctness over perceived speed here,
      // since this is exactly the value users are relying on.
      queryClient.invalidateQueries({ queryKey: ['competition', competitionId, locale] });
    },
    onError: (err) => {
      Alert.alert('Registration', ERROR_MESSAGES[err.code] || err.message);
    },
  });
}

export function useSubmitEntry(competitionId, locale) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mediaUrl) => competitionApi.submit(competitionId, mediaUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competition', competitionId, locale] });
    },
    onError: (err) => {
      Alert.alert('Submission', err.message);
    },
  });
}
