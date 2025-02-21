document.addEventListener("DOMContentLoaded", () => {
    const audioPlayer = document.getElementById("audioPlayer");
    const playlist = document.getElementById("playlist");
    const shuffleButton = document.getElementById("shuffleBtn"); // シャッフル切替ボタン
    const repeatButton = document.getElementById("repeatBtn");   // リピート切替ボタン

    let files = [];
    let currentIndex = 0;
    let isShuffle = false;  // シャッフルモード
    let isRepeat = false;   // リピートモード
    let playedIndexes = []; // シャッフル時の再生履歴（重複防止用）

    const API_KEY = "AIzaSyCbu0tiY1e6aEIGEDYp_7mgXJ8-95m-ZvM";
    const FOLDER_ID = "1bUXZSgygkwjmeNUXPT9VOQn0D5B2vZP0";

    async function fetchDriveFiles() {
        const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}' in parents&fields=files(id,name,mimeType)&key=${API_KEY}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            console.log("取得したデータ:", data);

            files = data.files.filter(file => ["audio/mpeg", "audio/wav", "audio/ogg"].includes(file.mimeType));
            if (files.length > 0) {
                displayPlaylist();
                playAudio(0); // 最初の曲を自動再生
            } else {
                playlist.innerHTML = "<li>音声ファイルが見つかりません</li>";
            }
        } catch (error) {
            console.error("Google Drive API エラー:", error);
        }
    }

    function displayPlaylist() {
        playlist.innerHTML = "";

        files.forEach((file, index) => {
            const li = document.createElement("li");
            li.textContent = file.name;
            li.dataset.index = index;
            li.addEventListener("click", () => playAudio(index));
            playlist.appendChild(li);
        });

        highlightCurrentTrack(); // 初期状態でハイライト更新
    }

    function playAudio(index) {
        currentIndex = index;
        const file = files[currentIndex];
        const url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${API_KEY}`;

        console.log("再生するURL:", url);
        audioPlayer.src = url;
        audioPlayer.play()
            .then(() => {
                highlightCurrentTrack();
                console.log("再生開始");
            })
            .catch(error => console.error("再生エラー:", error));
    }

    function highlightCurrentTrack() {
        const items = playlist.getElementsByTagName("li");
        Array.from(items).forEach(li => li.classList.remove("active")); // すべてのハイライトを削除
        if (items[currentIndex]) {
            items[currentIndex].classList.add("active"); // 再生中のトラックをハイライト
        }
    }

    function getNextShuffleIndex() {
        // 未再生の曲があれば、その中からランダムに選ぶ
        if (playedIndexes.length >= files.length) {
            playedIndexes = []; // 全曲再生済みならリセット
        }

        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * files.length);
        } while (playedIndexes.includes(nextIndex) && playedIndexes.length < files.length);

        playedIndexes.push(nextIndex);
        return nextIndex;
    }

    function playNext() {
        if (isRepeat) {
            // リピートモードなら同じ曲を再生
            playAudio(currentIndex);
        } else if (isShuffle) {
            // シャッフルモードならランダムな曲を選択
            currentIndex = getNextShuffleIndex();
            playAudio(currentIndex);
        } else {
            // 通常モードなら次の曲へ（最後の曲なら最初に戻る）
            currentIndex = (currentIndex + 1) % files.length;
            playAudio(currentIndex);
        }
    }

    // 再生終了時の動作
    audioPlayer.addEventListener("ended", playNext);

    // 🔀 シャッフルボタンの動作
    shuffleButton.addEventListener("click", () => {
        isShuffle = !isShuffle; // シャッフルのオン/オフを切り替え
        isRepeat = false; // リピートをオフにする
        shuffleButton.classList.toggle("active", isShuffle);
        repeatButton.classList.remove("active"); // リピートの選択を解除

        if (isShuffle) {
            playedIndexes = []; // シャッフル開始時に履歴をリセット
        }
    });

    // 🔁 リピートボタンの動作
    repeatButton.addEventListener("click", () => {
        isRepeat = !isRepeat; // リピートのオン/オフを切り替え
        isShuffle = false; // シャッフルをオフにする
        repeatButton.classList.toggle("active", isRepeat);
        shuffleButton.classList.remove("active"); // シャッフルの選択を解除
    });

    fetchDriveFiles();
});
