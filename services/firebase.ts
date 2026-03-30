
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

// ملاحظة: لقد قمت بتحديث Sender ID و Web Push Certificate بناءً على البيانات المرسلة.
// لكن لا يزال هناك حقول ناقصة (apiKey, appId, projectId) ضرورية لتسجيل الدخول.
// تجد هذه البيانات في: Firebase Console > Project Settings > General > Your apps.

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE", // مطلوب: انسخه من صفحة General
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // مطلوب
  projectId: "YOUR_PROJECT_ID", // مطلوب
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "114917491518", // تم التحديث من البيانات المرسلة
  appId: "YOUR_APP_ID" // مطلوب: انسخه من صفحة General
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Messaging (Optional - initialized because keys were provided)
// This handles push notifications
let messaging;
try {
  if (typeof window !== 'undefined') {
    messaging = getMessaging(app);
  }
} catch (e) {
  console.warn("Messaging not supported in this environment (requires HTTPS or localhost)");
}

// Configure Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Web Push Certificate (VAPID Key) - تم استخراجه من البيانات المرسلة
export const vapidKey = "BLSnwm2ykneuGiczbykNXMQ6Thjj1UHNabDoxxymsjXZ0ZaaYohKGiIpNS6Rv5ANiL19zWzLfW2qa_fbx5DGVkg";

export { auth, googleProvider, facebookProvider, messaging };
