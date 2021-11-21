import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDiqI2W9JL14vRBBoaEu5jGm0ndy8QSk7o",
  authDomain: "todo-459c9.firebaseapp.com",
  projectId: "todo-459c9",
  storageBucket: "todo-459c9.appspot.com",
  messagingSenderId: "130417580989",
  appId: "1:130417580989:web:bdbacc4e5c3139c6bb50d4",
};

// eslint-disable-next-line import/prefer-default-export
export const appConfig = initializeApp(firebaseConfig);
