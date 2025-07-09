// utils/guestToken.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const GUEST_SESSION_KEY = "guest_session_token";

export async function setGuestSessionToken(token: string) {
  await AsyncStorage.setItem(GUEST_SESSION_KEY, token);
}

export async function getGuestSessionToken(): Promise<string | null> {
  return await AsyncStorage.getItem(GUEST_SESSION_KEY);
}

export async function clearGuestSessionToken() {
  await AsyncStorage.removeItem(GUEST_SESSION_KEY);
}

// utils/guestSession.ts
let guestSessionInitiated = false;

export const markGuestSessionStarted = () => {
  guestSessionInitiated = true;
};

export const wasGuestSessionStarted = () => {
  return guestSessionInitiated;
};
