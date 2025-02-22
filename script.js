document.addEventListener("DOMContentLoaded", () => {
    const audioPlayer = document.getElementById("audioPlayer");
    const playlist = document.getElementById("playlist");
    const shuffleButton = document.getElementById("shuffleBtn");
    const repeatButton = document.getElementById("repeatBtn");
    const sortAscButton = document.getElementById("sortAscBtn"); // 昇順ソートボタン
    const sortDescButton = document.getElementById("sortDescBtn"); // 降順ソートボタン

    let files = [];
    let currentIndex = 0;
    let isShuffle = false;
    let isRepeat = false;
    let playedIndexes = [];
    let currentSort = "asc"; // デフォルトで昇順

    const API_KEY = "AIzaSyCbu0tiY1e6aEIGEDYp_7mgXJ8-95m-ZvM";
    const FOLDER_ID = "1bUXZSgygkwjmeNUXPT9VOQn0D5B2vZP0";

    async function fetchDriveFiles() {
        const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}' in parents&fields=files(id,name,mimeType)&key=${API_KEY}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.files) {
                files = data.files.filter(file => file.mimeType.startsWith("audio/"));
                if (files.length > 0) {
                    sortFiles("asc"); // デフォルトで昇順ソート適用
                } else {
                    playlist.innerHTML = "<li>音声ファイルが見つかりません</li>";
                }
            } else {
                console.error("データ取得に失敗しました", data);
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
        highlightCurrentTrack();
    }

    function sortFiles(order) {
        files.sort((a, b) => {
            return order === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        });
        currentSort = order;
        updateSortButtonState();
        displayPlaylist();
    }

    function updateSortButtonState() {
        sortAscButton.classList.toggle("active", currentSort === "asc");
        sortDescButton.classList.toggle("active", currentSort === "desc");
    }

    sortAscButton.addEventListener("click", () => sortFiles("asc"));
    sortDescButton.addEventListener("click", () => sortFiles("desc"));

    function playAudio(index) {
        if (!files[index]) return;
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
            playAudio(currentIndex);
        } else if (isShuffle) {
            currentIndex = getNextShuffleIndex();
            playAudio(currentIndex);
        } else {
            currentIndex = (currentIndex + 1) % files.length;
            playAudio(currentIndex);
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
