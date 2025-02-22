document.addEventListener("DOMContentLoaded", () => {
    const audioPlayer = document.getElementById("audioPlayer");
    const playlist = document.getElementById("playlist");

    let files = [];
    let folderFiles = {}; // フォルダごとのファイルリスト
    let currentIndex = {};
    let isShuffle = {}; // フォルダごとのシャッフル状態
    let isRepeat = {};  // フォルダごとのリピート状態
    let playedIndexes = {}; // フォルダごとの再生履歴

    const API_KEY = "AIzaSyCbu0tiY1e6aEIGEDYp_7mgXJ8-95m-ZvM";

    // 🗂 フォルダリスト（IDを適宜変更）
    const FOLDERS = [
        { id: "1idIVURpdyjIPJ0ztJc-dYqsoonkjmCOv", name: "テーマ例文" },
        { id: "1FLU4OZ1F9Ezxnv7YUZ8NOgoHXCIExfT4", name: "東大英語過去問" }
    ];

    async function fetchDriveFiles() {
        files = [];
        folderFiles = {};
        currentIndex = {};
        isShuffle = {};
        isRepeat = {};
        playedIndexes = {};

        for (const folder of FOLDERS) {
            const url = `https://www.googleapis.com/drive/v3/files?q='${folder.id}' in parents&fields=files(id,name,mimeType)&key=${API_KEY}`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                console.log(`フォルダ「${folder.name}」の取得データ:`, data);

                folderFiles[folder.name] = data.files
                    .filter(file => ["audio/mpeg", "audio/wav", "audio/ogg"].includes(file.mimeType))
                    .map(file => ({ ...file, folderName: folder.name }));

                files = [...files, ...folderFiles[folder.name]];
                currentIndex[folder.name] = 0;
                isShuffle[folder.name] = false;
                isRepeat[folder.name] = false;
                playedIndexes[folder.name] = [];
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

        Object.keys(folderFiles).forEach(folderName => {
            if (folderFiles[folderName].length === 0) return;

            // 📂 フォルダタイトル
            const folderHeader = document.createElement("h3");
            folderHeader.textContent = folderName;
            playlist.appendChild(folderHeader);

            // 🔀 フォルダごとのシャッフル・リピートボタン
            const controlsDiv = document.createElement("div");
            const shuffleButton = document.createElement("button");
            shuffleButton.textContent = "🔀 シャッフル";
            shuffleButton.addEventListener("click", () => toggleShuffle(folderName));
            controlsDiv.appendChild(shuffleButton);

            const repeatButton = document.createElement("button");
            repeatButton.textContent = "🔁 リピート";
            repeatButton.addEventListener("click", () => toggleRepeat(folderName));
            controlsDiv.appendChild(repeatButton);

            playlist.appendChild(controlsDiv);

            // 🎵 プレイリスト作成
            const ul = document.createElement("ul");
            folderFiles[folderName].forEach((file, index) => {
                const li = document.createElement("li");
                li.textContent = file.name;
                li.dataset.index = index;
                li.addEventListener("click", () => playAudio(folderName, index, true));
                ul.appendChild(li);
            });

            playlist.appendChild(ul);
        });
    }

    async function playAudio(folderName, index, isUserAction = false) {
        currentIndex[folderName] = index;
        const file = folderFiles[folderName][index];
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

            highlightCurrentTrack(folderName);
        } catch (error) {
            console.error("再生エラー:", error);
        }
    }

    function highlightCurrentTrack(folderName) {
        const items = playlist.getElementsByTagName("li");
        Array.from(items).forEach(li => li.classList.remove("active"));
        if (items[currentIndex[folderName]]) {
            items[currentIndex[folderName]].classList.add("active");
        }
    }

    function getNextShuffleIndex(folderName) {
        if (playedIndexes[folderName].length >= folderFiles[folderName].length) {
            playedIndexes[folderName] = [];
        }

        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * folderFiles[folderName].length);
        } while (playedIndexes[folderName].includes(nextIndex) && playedIndexes[folderName].length < folderFiles[folderName].length);

        playedIndexes[folderName].push(nextIndex);
        return nextIndex;
    }

    function playNext(folderName) {
        if (isRepeat[folderName]) {
            playAudio(folderName, currentIndex[folderName], false);
        } else if (isShuffle[folderName]) {
            currentIndex[folderName] = getNextShuffleIndex(folderName);
            playAudio(folderName, currentIndex[folderName], false);
        } else {
            currentIndex[folderName] = (currentIndex[folderName] + 1) % folderFiles[folderName].length;
            playAudio(folderName, currentIndex[folderName], false);
        }
    }

    function toggleShuffle(folderName) {
        isShuffle[folderName] = !isShuffle[folderName];
        isRepeat[folderName] = false;
        playedIndexes[folderName] = [];

        console.log(`シャッフル(${folderName}): ${isShuffle[folderName]}`);
    }

    function toggleRepeat(folderName) {
        isRepeat[folderName] = !isRepeat[folderName];
        isShuffle[folderName] = false;

        console.log(`リピート(${folderName}): ${isRepeat[folderName]}`);
    }

    audioPlayer.addEventListener("ended", () => {
        Object.keys(folderFiles).forEach(folderName => {
            if (folderFiles[folderName].length > 0) {
                playNext(folderName);
            }
        });
    });

    fetchDriveFiles();
});
