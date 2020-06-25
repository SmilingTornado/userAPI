'use strict'

const firebase = require('firebase')
const firebaseConfig = {
  apiKey: "AIzaSyB4ged-UUFs6C9Q1pAQTD9pdF3jZuEMBhc",
  authDomain: "test-7d1f0.firebaseapp.com",
  databaseURL: "https://test-7d1f0.firebaseio.com",
  projectId: "test-7d1f0",
  storageBucket: "test-7d1f0.appspot.com",
  messagingSenderId: "830480326843",
  appId: "1:830480326843:web:53c53cf7a011c13348c99e",
  measurementId: "G-MMHL5V8Y0T"
};

let initFirebaseAdmin
let initFirestore
let initFirebaseAuth

const initFirebase = () => {
  if ( !initFirebaseAdmin ) {
    initFirebaseAdmin = firebase.initializeApp(firebaseConfig)
  }
}

const firestore = () => {
  initFirebase()

  if ( !initFirestore ) {
    initFirestore = firebase.firestore()
  }

  return initFirestore
}

const firebase_auth = () => {
  initFirebase()

  if ( !initFirebaseAuth ) {
    initFirebaseAuth = firebase.auth()
  }

  return initFirebaseAuth
}

module.exports =  firestore();
