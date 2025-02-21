import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

// Firebase 設定
const firebaseConfig = {
    apiKey: "AIzaSyC3uRy3VW5_9WKVdceKt4BI2BZRYz1CWoc",
    authDomain: "web-app-dad25.firebaseapp.com",
    projectId: "web-app-dad25",
    storageBucket: "web-app-dad25.appspot.com",
    messagingSenderId: "1091131765465",
    appId: "1:1091131765465:web:cc8df36374229dec1e04c8",
    measurementId: "G-T7M2LTKP2Q"
};

// Firebase 初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 他のスクリプトでも使えるように `export`
export { auth, db, storage };
