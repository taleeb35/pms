// Native camera capture for medical document uploads.
// Returns a File you can pass directly into existing upload flows.
import { Capacitor } from "@capacitor/core";

export const isNative = () => Capacitor.isNativePlatform();

export async function captureFromCamera(): Promise<File | null> {
  if (!isNative()) return null;
  try {
    const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      saveToGallery: false,
    });
    if (!photo.base64String) return null;
    const byteString = atob(photo.base64String);
    const buf = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) buf[i] = byteString.charCodeAt(i);
    const ext = photo.format || "jpeg";
    return new File([buf], `capture-${Date.now()}.${ext}`, {
      type: `image/${ext}`,
    });
  } catch (e) {
    console.warn("Camera capture cancelled or failed:", e);
    return null;
  }
}
