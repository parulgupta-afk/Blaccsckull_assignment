import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Development/demo-only session bootstrap.
 *
 * A real app already has a login flow that puts a real user's JWT into
 * AsyncStorage; that's out of scope for this assignment. This exists so a
 * reviewer can run `npm run mint-token -- <userId>` on the backend, drop
 * the resulting JWT into `mobile/.env` as EXPO_PUBLIC_DEMO_AUTH_TOKEN, and
 * have the app authenticate itself -- without editing source or committing
 * a token to git.
 *
 * IMPORTANT: Expo inlines EXPO_PUBLIC_-prefixed vars into the JS bundle at
 * build time, so they are NOT secret once built. That's acceptable for a
 * short-lived development JWT pointed at your own local backend, but this
 * mechanism must never be used to ship a real user's credentials or a
 * production token. Production auth must use a real login flow.
 */
export async function bootstrapDevSession() {
  const demoToken = process.env.EXPO_PUBLIC_DEMO_AUTH_TOKEN;
  const demoCompetitionId = process.env.EXPO_PUBLIC_DEMO_COMPETITION_ID;

  if (demoToken) {
    await AsyncStorage.setItem('authToken', demoToken);
  }

  const storedToken = await AsyncStorage.getItem('authToken');

  return {
    hasToken: Boolean(storedToken),
    competitionId: demoCompetitionId || null,
  };
}
