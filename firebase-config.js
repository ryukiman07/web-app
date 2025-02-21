// Firebase の初期化が実行される前に firebase が定義されているか確認
if (typeof firebase === "undefined") {
    console.error("Firebase SDK がロードされていません。index.html の <script> タグを確認してください。");
} else {
    // Firebase 設定
    const firebaseConfig = {
        apiKey: "AIzaSyC3uRy3VW5_9WKVdceKt4BI2BZRYz1CWoc",
        authDomain: "web-app-dad25.firebaseapp.com",
        projectId: "web-app-dad25",
        messagingSenderId: "1091131765465",
        appId: "1:1091131765465:web:cc8df36374229dec1e04c8",
        measurementId: "G-T7M2LTKP2Q"
    };

    // Firebase 初期化
    firebase.initializeApp(firebaseConfig);

    // Firebase Authentication & Firestore
    const auth = firebase.auth();
    const db = firebase.firestore();

    // 他のスクリプトでも使えるように `window` に格納
    window.firebaseAuth = auth;
    window.firebaseDB = db;
}
