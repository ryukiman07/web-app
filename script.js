document.addEventListener("DOMContentLoaded", () => {
    const audioPlayer = document.getElementById("audioPlayer");
    const playlist = document.getElementById("playlist");

    // ✅ Google Drive API 設定（要変更）
    const API_KEY = "AIzaSyCbu0tiY1e6aEIGEDYp_7mgXJ8-95m-ZvM";  // ← 作成した APIキーを設定
    const FOLDER_ID = "1bUXZSgygkwjmeNUXPT9VOQn0D5B2vZP0";  // ← Google Drive のフォルダIDを設定

    // 🔹 Google Drive API を使ってフォルダ内のファイル一覧を取得
async function fetchDriveFiles() {
    const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType)`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("取得したデータ:", data);

        if (data.files && data.files.length > 0) {
            displayPlaylist(data.files);
        } else {
            console.warn("フォルダ内に音声ファイルが見つかりませんでした。");
        }
    } catch (error) {
        console.error("Google Drive API エラー:", error);
    }
}



    // 🔹 取得したファイルをプレイリストに追加
    function displayPlaylist(files) {
        playlist.innerHTML = "";

        const audioFiles = files.filter(file => file.mimeType.startsWith("audio/")); // 🎵 MP3などの音声ファイルだけ取得

        if (audioFiles.length === 0) {
            playlist.innerHTML = "<li>音声ファイルが見つかりません</li>";
            return;
        }

        audioFiles.forEach(file => {
            const li = document.createElement("li");
            li.textContent = file.name;
            li.addEventListener("click", () => playAudio(file.id));
            playlist.appendChild(li);
        });
    }

    function playAudio(fileId) {
        const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
        console.log("再生するURL:", url); // ✅ デバッグ用
        audioPlayer.src = url;

        audioPlayer.play()
            .then(() => console.log("再生開始"))
            .catch(error => console.error("再生エラー:", error));
    }



    // 🎵 初回ロード
    fetchDriveFiles();
});
