// Biometric login (fingerprint / Face ID) for the native app.
// Stores last session credentials securely in the device keychain.
import { Capacitor } from "@capacitor/core";

const SERVER = "com.zonoir.app";
const USERNAME_KEY = "zonoir.bio.user";

export const isNative = () => Capacitor.isNativePlatform();

export async function isBiometricAvailable(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const { NativeBiometric } = await import("capacitor-native-biometric");
    const result = await NativeBiometric.isAvailable();
    return result.isAvailable;
  } catch {
    return false;
  }
}

export async function saveBiometricCredentials(email: string, password: string) {
  if (!isNative()) return;
  const { NativeBiometric } = await import("capacitor-native-biometric");
  const { Preferences } = await import("@capacitor/preferences");
  await NativeBiometric.setCredentials({
    username: email,
    password,
    server: SERVER,
  });
  await Preferences.set({ key: USERNAME_KEY, value: email });
}

export async function loadBiometricCredentials(): Promise<{
  email: string;
  password: string;
} | null> {
  if (!isNative()) return null;
  try {
    const { NativeBiometric } = await import("capacitor-native-biometric");
    await NativeBiometric.verifyIdentity({
      reason: "Sign in to Zonoir",
      title: "Unlock Zonoir",
      subtitle: "Use your fingerprint or face to continue",
    });
    const creds = await NativeBiometric.getCredentials({ server: SERVER });
    return { email: creds.username, password: creds.password };
  } catch {
    return null;
  }
}

export async function clearBiometricCredentials() {
  if (!isNative()) return;
  try {
    const { NativeBiometric } = await import("capacitor-native-biometric");
    await NativeBiometric.deleteCredentials({ server: SERVER });
  } catch {
    /* noop */
  }
}
