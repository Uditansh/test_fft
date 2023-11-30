// firebase.js

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAqPHhNS67MT5KN9Hbks-auAyAa277SqR8",
  authDomain: "fir-test-a54fd.firebaseapp.com",
  databaseURL: "https://fir-test-a54fd-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fir-test-a54fd",
  storageBucket: "fir-test-a54fd.appspot.com",
  messagingSenderId: "636326742951",
  appId: "1:636326742951:web:6d8d5abf815dde888d0482",
  measurementId: "G-HS048JNDEY"
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

export { database, ref, onValue };
