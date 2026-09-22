import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Expo (SDK 49+) automatically inlines any env var prefixed EXPO_PUBLIC_
 * from your .env file at build time -- no extra plugin needed. Set
 * EXPO_PUBLIC_API_BASE_URL in mobile/.env to your backend's reachable URL.
 *
 * "localhost" means something different depending on where the app is
 * actually running, which is the #1 cause of "the app can't reach my
 * server" confusion:
 *   - Web / iOS simulator on the same Mac as the backend -> localhost works
 *   - Android emulator                                    -> use 10.0.2.2
 *   - Expo Go on a physical phone                          -> use your
 *     computer's LAN IP (e.g. 192.168.1.42), NOT localhost -- the phone
 *     has no idea what "localhost" on your laptop means.
 *
 * If EXPO_PUBLIC_API_BASE_URL isn't set, we fall back to a best-effort
 * per-platform default and log a warning so this doesn't fail silently.
 */
function resolveApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) return process.env.EXPO_PUBLIC_API_BASE_URL;

  const fallback = Platform.OS === 'android' ? 'http://10.0.2.2:4000/api' : 'http://localhost:4000/api';
  console.warn(
    `[api] EXPO_PUBLIC_API_BASE_URL is not set -- falling back to ${fallback}. ` +
      'On a physical device this will NOT work; set EXPO_PUBLIC_API_BASE_URL in mobile/.env to your computer\'s LAN IP.'
  );
  return fallback;
}

const API_BASE_URL = resolveApiBaseUrl();

export const apiClient = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Backend responds with a consistent { ok, data } / { ok:false, code, message }
// envelope -- unwrap it once here so hooks/components just deal with data
// or a thrown Error carrying the server's `code`.
apiClient.interceptors.response.use(
  (res) => res.data.data,
  (err) => {
    const payload = err.response?.data;
    const wrapped = new Error(payload?.message || err.message);
    wrapped.code = payload?.code || 'NETWORK_ERROR';
    return Promise.reject(wrapped);
  }
);
