import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCc6xj21xQqgcZ6iuWLgD9Vu-g9d2dsxLo",
  authDomain: "finalyearproject-26df2.firebaseapp.com",
  projectId: "finalyearproject-26df2",
  storageBucket: "finalyearproject-26df2.appspot.com",
  messagingSenderId: "411744236352",
  appId: "1:411744236352:web:e7c8d4bdd32cb86ec840a5",
  measurementId: "G-RVBL31TB5K"
};

let app;

if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

const auth = firebase.auth();
const db = firebase.firestore(); 

export { db, auth };