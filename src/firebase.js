import firebase from 'firebase';

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyAqkxqM8-GIdYk2kvJqFi4R4BJ1oGZ-Ek0",
    authDomain: "instagram-clone-8e627.firebaseapp.com",
    databaseURL: "https://instagram-clone-8e627.firebaseio.com",
    projectId: "instagram-clone-8e627",
    storageBucket: "instagram-clone-8e627.appspot.com",
    messagingSenderId: "281201280660",
    appId: "1:281201280660:web:ecb27425198049f5fb9681"
})

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export {db, auth, storage};