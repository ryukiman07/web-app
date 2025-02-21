document.addEventListener("DOMContentLoaded", () => {
    const audioPlayer = document.getElementById("audioPlayer");
    const playlist = document.getElementById("playlist");

    // ✅ Google Drive API 設定（要変更）
    const API_KEY = "AIzaSyCbu0tiY1e6aEIGEDYp_7mgXJ8-95m-ZvM";  // ← 作成した APIキーを設定
    const FOLDER_ID = "1bUXZSgygkwjmeNUXPT9VOQn0D5B2vZP0";  // ← Google Drive のフォルダIDを設定

    // 🔹 Google Drive API を使ってフォルダ内のファイル一覧を取得
    async function fetchDriveFiles() {
        const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${API_KEY}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            console.log("取得したデータ:", data);
            displayPlaylist(data.files);
        } catch (error) {
            console.error("Google Drive API エラー:", error);
        }
    }

    // 🔹 取得したファイルをプレイリストに追加
    function displayPlaylist(files) {
        playlist.innerHTML = "";
        files.forEach(file => {
            const li = document.createElement("li");
            li.textContent = file.name;
            li.addEventListener("click", () => playAudio(file.id));
            playlist.appendChild(li);
        });
    }

    // ▶️ 音声再生（Google Drive から取得）
    function playAudio(fileId) {
        audioPlayer.src = `https://drive.google.com/uc?export=download&id=${fileId}`;
        audioPlayer.play();
    }

    // 🎵 初回ロード
    fetchDriveFiles();
});
