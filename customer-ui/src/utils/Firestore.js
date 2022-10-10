import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  onAuthStateChanged,
  getAuth,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';

const firebaseConfig = {
  projectId: process.env.VUE_APP_PROJECT_ID,
  apiKey: process.env.VUE_APP_API_KEY,
  authDomain: process.env.VUE_APP_AUTH_DOMAIN
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function getDb() {
  return await getFirestore();
}

export async function logIn() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({prompt: 'select_account'});
  const user = await signInWithPopup(auth, provider);
  console.log(user);
}
