// firebase.js

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyAI2iwJ7eKu86zqC0uSZNo_yMCtqZMUR1g",
  authDomain: "random-data-43671.firebaseapp.com",
  databaseURL: "https://random-data-43671-default-rtdb.firebaseio.com",
  projectId: "random-data-43671",
  storageBucket: "random-data-43671.appspot.com",
  messagingSenderId: "286181256019",
  appId: "1:286181256019:web:70136a7e2610b04fbecfa6",
  measurementId: "G-BF756LJCGW"
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

export { database, ref, onValue };
