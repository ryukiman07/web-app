document.addEventListener("DOMContentLoaded", () => {
    const audioPlayer = document.getElementById("audioPlayer");
    const playlist = document.getElementById("playlist");
    const shuffleButton = document.getElementById("shuffleBtn");
    const repeatButton = document.getElementById("repeatBtn");

    let files = [];
    let currentIndex = 0;
    let isShuffle = false;
    let isRepeat = false;
    let playedIndexes = [];

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
            li.addEventListener("click", () => {
                playAudio(index, true); // ユーザー操作で再生
            });
            playlist.appendChild(li);
        });

        highlightCurrentTrack();
    }

    async function playAudio(index, isUserAction = false) {
        currentIndex = index;
        const file = files[currentIndex];
        const url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${API_KEY}`;

        console.log("再生するURL:", url);

        try {
            audioPlayer.pause(); // 競合を防ぐ
            audioPlayer.src = "";

            // Blob URL を生成
            const response = await fetch(url);
            if (!response.ok) throw new Error("音声ファイルの取得に失敗しました");
            const blob = await response.blob();
            const objectURL = URL.createObjectURL(blob);

            audioPlayer.src = objectURL;

            if (isUserAction) {
                await audioPlayer.play(); // ユーザー操作での再生
            } else {
                console.log("再生はユーザーの操作が必要です");
            }

            highlightCurrentTrack();
        } catch (error) {
            console.error("再生エラー:", error);
        }
    }

    function highlightCurrentTrack() {
        const items = playlist.getElementsByTagName("li");
        Array.from(items).forEach(li => li.classList.remove("active"));
        if (items[currentIndex]) {
            items[currentIndex].classList.add("active");
        }
    }

    function getNextShuffleIndex() {
        if (playedIndexes.length >= files.length) {
            playedIndexes = [];
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
            playAudio(currentIndex, false);
        } else if (isShuffle) {
            currentIndex = getNextShuffleIndex();
            playAudio(currentIndex, false);
        } else {
            currentIndex = (currentIndex + 1) % files.length;
            playAudio(currentIndex, false);
        }
    }

    audioPlayer.addEventListener("ended", playNext);

    shuffleButton.addEventListener("click", () => {
        isShuffle = !isShuffle;
        isRepeat = false;
        shuffleButton.classList.toggle("active", isShuffle);
        repeatButton.classList.remove("active");

        if (isShuffle) {
            playedIndexes = [];
        }
    });

    repeatButton.addEventListener("click", () => {
        isRepeat = !isRepeat;
        isShuffle = false;
        repeatButton.classList.toggle("active", isRepeat);
        shuffleButton.classList.remove("active");
    });

    fetchDriveFiles();
});
