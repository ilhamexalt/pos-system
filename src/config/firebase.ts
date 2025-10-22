import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyDa1-fre9saYyXQdj2wqYEBImSUAjLYiR8',
  projectId: 'pos-system-eab23',
  storageBucket: 'pos-system-eab23.firebasestorage.app',
  messagingSenderId: '666726160059',
  appId: '1:666726160059:android:c9fa695c16f900c5c4fb9e',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

