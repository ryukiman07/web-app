document.addEventListener("DOMContentLoaded", () => {
    const audioPlayer = document.getElementById("audioPlayer");
    const playlist = document.getElementById("playlist");
    const shuffleBtn = document.getElementById("shuffleBtn");

    let audioFiles = []; // 再生順を管理する配列
    let shuffledFiles = []; // シャッフル後の配列
    let currentIndex = 0;

    // 🔹 Google Drive API でファイル一覧を取得
    async function fetchDriveFiles() {
        const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}' in parents&fields=files(id,name,mimeType)&key=${API_KEY}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            console.log("取得したデータ:", data);

            if (data.files && data.files.length > 0) {
                audioFiles = data.files.filter(file => ["audio/mpeg", "audio/wav", "audio/ogg"].includes(file.mimeType));
                shuffledFiles = [...audioFiles]; // 初期状態は通常の再生順
                displayPlaylist(audioFiles);
            } else {
                console.warn("フォルダ内に音声ファイルが見つかりませんでした。");
            }
        } catch (error) {
            console.error("Google Drive API エラー:", error);
        }
    }

    // 🔹 プレイリストを表示
    function displayPlaylist(files) {
        playlist.innerHTML = "";

        if (files.length === 0) {
            playlist.innerHTML = "<li>音声ファイルが見つかりません</li>";
            return;
        }

        files.forEach((file, index) => {
            const li = document.createElement("li");
            li.textContent = file.name;
            li.addEventListener("click", () => playAudio(index, shuffledFiles));
            playlist.appendChild(li);
        });
    }

    // 🔹 指定されたファイルを再生
    function playAudio(index, fileList) {
        currentIndex = index;
        const fileId = fileList[currentIndex].id;
        const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;

        console.log("再生するURL:", url);
        audioPlayer.src = url;
        audioPlayer.play()
            .then(() => console.log("再生開始"))
            .catch(error => console.error("再生エラー:", error));
    }

    // 🔹 シャッフル機能
    shuffleBtn.addEventListener("click", () => {
        shuffledFiles = [...audioFiles].sort(() => Math.random() - 0.5); // シャッフル
        console.log("シャッフル後の順番:", shuffledFiles.map(f => f.name));
        currentIndex = 0; // 最初の音声から再生
        playAudio(currentIndex, shuffledFiles); // シャッフル後の最初の音声を再生
    });

    // 🔹 次の曲を自動再生
    audioPlayer.addEventListener("ended", () => {
        if (currentIndex < shuffledFiles.length - 1) {
            currentIndex++;
            playAudio(currentIndex, shuffledFiles);
        }
    });

    // 🎵 初回ロード
    fetchDriveFiles();
});
