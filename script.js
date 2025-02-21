document.addEventListener("DOMContentLoaded", () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage();

    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const audioPlayer = document.getElementById("audioPlayer");
    const playlist = document.getElementById("playlist");
    const uploadAudio = document.getElementById("uploadAudio");
    const uploadBtn = document.getElementById("uploadBtn");
    const shuffleBtn = document.getElementById("shuffleBtn");
    const loopBtn = document.getElementById("loopBtn");
    const speedSelect = document.getElementById("speedSelect");

    let audioFiles = [];
    let currentIndex = 0;
    let isShuffling = false;
    let isLooping = false;

    // 🔐 Googleログイン
    loginBtn.addEventListener("click", () => {
        auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    });

    // 🔑 ログアウト
    logoutBtn.addEventListener("click", () => {
        auth.signOut();
    });

    // 🔄 認証状態を監視
    auth.onAuthStateChanged(user => {
        if (user) {
            loginBtn.style.display = "none";
            logoutBtn.style.display = "block";
            loadPlaylist();
        } else {
            loginBtn.style.display = "block";
            logoutBtn.style.display = "none";
            playlist.innerHTML = "";
        }
    });

    // 📂 音声アップロード
    uploadBtn.addEventListener("click", () => {
        const file = uploadAudio.files[0];
        if (file) {
            const storageRef = storage.ref(`audio/${file.name}`);
            storageRef.put(file).then(snapshot => {
                storageRef.getDownloadURL().then(url => {
                    db.collection("audios").add({
                        name: file.name,
                        url: url
                    });
                    loadPlaylist();
                });
            });
        }
    });

    // 🎵 プレイリスト読み込み
    function loadPlaylist() {
        db.collection("audios").get().then(snapshot => {
            playlist.innerHTML = "";
            audioFiles = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                audioFiles.push(data.url);
                const li = document.createElement("li");
                li.textContent = data.name;
                li.addEventListener("click", () => playAudio(audioFiles.indexOf(data.url)));
                playlist.appendChild(li);
            });
        });
    }

    // ▶️ 音声再生
    function playAudio(index) {
        currentIndex = index;
        audioPlayer.src = audioFiles[currentIndex];
        audioPlayer.play();
    }

    // 🔀 シャッフル
    shuffleBtn.addEventListener("click", () => {
        isShuffling = !isShuffling;
        audioFiles.sort(() => (isShuffling ? Math.random() - 0.5 : 1));
    });

    // 🔁 ループ
    loopBtn.addEventListener("click", () => {
        isLooping = !isLooping;
        audioPlayer.loop = isLooping;
    });

    // ⏩ 速度変更
    speedSelect.addEventListener("change", () => {
        audioPlayer.playbackRate = parseFloat(speedSelect.value);
    });
});
