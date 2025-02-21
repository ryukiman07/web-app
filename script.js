document.addEventListener("DOMContentLoaded", () => {
    const audioPlayer = document.getElementById("audioPlayer");
    const playlist = document.getElementById("playlist");
    let shuffledPlaylist = [];
    let currentIndex = 0;

    // ✅ Google Drive API 設定（要変更）
    const API_KEY = "AIzaSyCbu0tiY1e6aEIGEDYp_7mgXJ8-95m-ZvM";
    const FOLDER_ID = "1bUXZSgygkwjmeNUXPT9VOQn0D5B2vZP0";

    // 🔹 Google Drive API を使ってフォルダ内のファイル一覧を取得
    async function fetchDriveFiles() {
        const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}' in parents&fields=files(id,name,mimeType)&key=${API_KEY}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            console.log("取得したデータ:", data);

            if (data.files && data.files.length > 0) {
                const audioFiles = data.files.filter(file => ["audio/mpeg", "audio/wav", "audio/ogg"].includes(file.mimeType));
                shuffledPlaylist = shuffleArray(audioFiles);
                displayPlaylist(shuffledPlaylist);
            } else {
                console.warn("フォルダ内に音声ファイルが見つかりませんでした。");
            }
        } catch (error) {
            console.error("Google Drive API エラー:", error);
        }
    }

    // 🔹 配列をシャッフルする関数（Fisher-Yates アルゴリズムを使用）
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 🔹 取得したファイルをプレイリストに追加
    function displayPlaylist(files) {
        playlist.innerHTML = "";

        if (files.length === 0) {
            playlist.innerHTML = "<li>音声ファイルが見つかりません</li>";
            return;
        }

        files.forEach((file, index) => {
            const li = document.createElement("li");
            li.textContent = file.name;
            li.addEventListener("click", () => playAudio(index));
            playlist.appendChild(li);
        });
    }

    // 🎵 Google Drive のファイルを再生する
    function playAudio(index) {
        if (index >= shuffledPlaylist.length) return;

        currentIndex = index;
        const fileId = shuffledPlaylist[currentIndex].id;
        const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;

        console.log("再生するURL:", url); // ✅ デバッグ用
        audioPlayer.src = url;
        audioPlayer.play()
            .then(() => console.log("再生開始"))
            .catch(error => console.error("再生エラー:", error));
    }

    // 🎵 自動再生（現在の曲が終わったら次の曲を再生）
    audioPlayer.addEventListener("ended", () => {
        currentIndex++;
        if (currentIndex < shuffledPlaylist.length) {
            playAudio(currentIndex);
        }
    });

    // 🎵 初回ロード
    fetchDriveFiles();
});
