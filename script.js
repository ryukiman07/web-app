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

    // 🗂 リスニングAとリスニングBのフォルダIDをリストで管理
    const FOLDERS = [
        { id: "1idIVURpdyjIPJ0ztJc-dYqsoonkjmCOv", name: "テーマ例文" },
        { id: "1FLU4OZ1F9Ezxnv7YUZ8NOgoHXCIExfT4", name: "東大英語過去問" }
    ];

    async function fetchDriveFiles() {
        files = [];

        for (const folder of FOLDERS) {
            const url = `https://www.googleapis.com/drive/v3/files?q='${folder.id}' in parents&fields=files(id,name,mimeType)&key=${API_KEY}`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                console.log(`フォルダ「${folder.name}」の取得データ:`, data);

                const folderFiles = data.files
                    .filter(file => ["audio/mpeg", "audio/wav", "audio/ogg"].includes(file.mimeType))
                    .map(file => ({ ...file, folderName: folder.name })); // フォルダ名を追加

                files = [...files, ...folderFiles];
            } catch (error) {
                console.error(`Google Drive API エラー（${folder.name}）:`, error);
            }
        }

        if (files.length > 0) {
            displayPlaylist();
        } else {
            playlist.innerHTML = "<li>音声ファイルが見つかりません</li>";
        }
    }

    function displayPlaylist() {
        playlist.innerHTML = "";

        let folderGroups = {};

        // 📂 フォルダごとにグループ化
        files.forEach((file, index) => {
            if (!folderGroups[file.folderName]) {
                folderGroups[file.folderName] = [];
            }
            folderGroups[file.folderName].push({ name: file.name, index });
        });

        // 🎵 プレイリストをフォルダごとに表示
        Object.keys(folderGroups).forEach(folderName => {
            const folderHeader = document.createElement("h3");
            folderHeader.textContent = folderName;
            playlist.appendChild(folderHeader);

            const ul = document.createElement("ul");
            folderGroups[folderName].forEach(item => {
                const li = document.createElement("li");
                li.textContent = item.name;
                li.dataset.index = item.index;
                li.addEventListener("click", () => playAudio(item.index, true));
                ul.appendChild(li);
            });

            playlist.appendChild(ul);
        });

        highlightCurrentTrack();
    }

    async function playAudio(index, isUserAction = false) {
        currentIndex = index;
        const file = files[currentIndex];
        const url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${API_KEY}`;

        console.log("再生するURL:", url);

        try {
            audioPlayer.pause();
            audioPlayer.src = "";

            const response = await fetch(url);
            if (!response.ok) throw new Error("音声ファイルの取得に失敗しました");
            const blob = await response.blob();
            const objectURL = URL.createObjectURL(blob);

            audioPlayer.src = objectURL;

            if (isUserAction) {
                await audioPlayer.play();
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
