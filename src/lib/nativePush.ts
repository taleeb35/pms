// Native Push Notifications via Capacitor + FCM (Android) / APNS (iOS).
// Safe no-op on web — only runs on a real native device.
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

export const isNative = () => Capacitor.isNativePlatform();

export async function registerNativePush(userId: string) {
  if (!isNative()) return;

  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const { Device } = await import("@capacitor/device");

    const perm = await PushNotifications.checkPermissions();
    let granted = perm.receive === "granted";
    if (!granted) {
      const req = await PushNotifications.requestPermissions();
      granted = req.receive === "granted";
    }
    if (!granted) return;

    await PushNotifications.register();

    PushNotifications.addListener("registration", async (token) => {
      const info = await Device.getInfo();
      await supabase.from("device_push_tokens").upsert(
        {
          user_id: userId,
          token: token.value,
          platform: info.platform === "ios" ? "ios" : "android",
          device_info: { model: info.model, osVersion: info.osVersion } as any,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "user_id,token" }
      );
    });

    PushNotifications.addListener("registrationError", (err) => {
      console.warn("Push registration error", err);
    });

    PushNotifications.addListener("pushNotificationReceived", (n) => {
      console.log("Push received in foreground", n);
    });
  } catch (e) {
    console.warn("Native push setup skipped:", e);
  }
}
