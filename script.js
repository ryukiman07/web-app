document.addEventListener("DOMContentLoaded", () => {
    const audioPlayer = document.getElementById("audioPlayer");
    const playlist = document.getElementById("playlist");
    const shuffleBtn = document.getElementById("shuffleBtn");
    const loopBtn = document.getElementById("loopBtn");

    let originalPlaylist = [];
    let shuffledPlaylist = [];
    let currentIndex = 0;
    let isShuffled = false;
    let isLooping = false;

    const API_KEY = "AIzaSyCbu0tiY1e6aEIGEDYp_7mgXJ8-95m-ZvM";
    const FOLDER_ID = "1bUXZSgygkwjmeNUXPT9VOQn0D5B2vZP0";

    async function fetchDriveFiles() {
        const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}' in parents&fields=files(id,name,mimeType)&key=${API_KEY}`;
        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.files && data.files.length > 0) {
                originalPlaylist = data.files.filter(file => ["audio/mpeg", "audio/wav", "audio/ogg"].includes(file.mimeType));
                shuffledPlaylist = [...originalPlaylist];
                if (isShuffled) shuffledPlaylist = shuffleArray(shuffledPlaylist);
                displayPlaylist();
            } else {
                playlist.innerHTML = "<li>音声ファイルが見つかりません</li>";
            }
        } catch (error) {
            console.error("Google Drive API エラー:", error);
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function displayPlaylist() {
        playlist.innerHTML = "";
        shuffledPlaylist.forEach((file, index) => {
            const li = document.createElement("li");
            li.textContent = file.name;
            li.addEventListener("click", () => playAudio(index));
            playlist.appendChild(li);
        });
    }

    function playAudio(index) {
        currentIndex = index;
        const fileId = shuffledPlaylist[currentIndex].id;
        const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;

        audioPlayer.src = url;
        audioPlayer.play()
            .then(() => console.log("再生開始"))
            .catch(error => console.error("再生エラー:", error));
    }

    audioPlayer.addEventListener("ended", () => {
        if (isLooping) {
            playAudio(currentIndex);
        } else {
            currentIndex++;
            if (currentIndex < shuffledPlaylist.length) {
                playAudio(currentIndex);
            }
        }
    });

    shuffleBtn.addEventListener("click", () => {
        isShuffled = !isShuffled;
        shuffledPlaylist = isShuffled ? shuffleArray([...originalPlaylist]) : [...originalPlaylist];
        displayPlaylist();
        shuffleBtn.textContent = isShuffled ? "シャッフル: ON" : "シャッフル: OFF";
    });

    loopBtn.addEventListener("click", () => {
        isLooping = !isLooping;
        loopBtn.textContent = isLooping ? "ループ: ON" : "ループ: OFF";
    });

    fetchDriveFiles();
});
