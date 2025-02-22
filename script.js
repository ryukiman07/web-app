document.addEventListener("DOMContentLoaded", async () => {
    const API_KEY = "AIzaSyCbu0tiY1e6aEIGEDYp_7mgXJ8-95m-ZvM";
    const FOLDER_ID = "1bUXZSgygkwjmeNUXPT9VOQn0D5B2vZP0";

    const audioPlayer = document.getElementById("audioPlayer");
    const playlist = document.getElementById("playlist");
    const shuffleButton = document.getElementById("shuffleBtn");
    const repeatButton = document.getElementById("repeatBtn");
    const sortAscButton = document.getElementById("sortAscBtn");
    const sortDescButton = document.getElementById("sortDescBtn");
    const folderSelect = document.getElementById("folderSelect"); // フォルダ選択ドロップダウン

    let files = [];
    let currentIndex = 0;
    let isShuffle = false;
    let isRepeat = false;
    let playedIndexes = [];
    let currentSort = "asc";
    let currentFolder = "";

    // **Audioフォルダ内のサブフォルダ一覧を取得**
    async function fetchFolders() {
        const url = `https://www.googleapis.com/drive/v3/files?q='${ROOT_AUDIO_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder'&fields=files(id,name)&key=${API_KEY}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.files && data.files.length > 0) {
                folderSelect.innerHTML = "";
                data.files.forEach(folder => {
                    const option = document.createElement("option");
                    option.value = folder.id;
                    option.textContent = folder.name;
                    folderSelect.appendChild(option);
                });
                currentFolder = data.files[0].id; // 最初のフォルダをデフォルトで選択
                folderSelect.value = currentFolder;
                fetchDriveFiles(currentFolder);
            } else {
                console.error("フォルダが見つかりません。");
            }
        } catch (error) {
            console.error("Google Drive API フォルダ取得エラー:", error);
        }
    }

    // **選択したフォルダ内の MP ファイルを取得**
    async function fetchDriveFiles(folderId) {
        currentFolder = folderId; // 選択されたフォルダを更新
        const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and mimeType contains 'audio/'&fields=files(id,name,mimeType)&key=${API_KEY}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            files = data.files || [];
            if (files.length > 0) {
                sortFiles("asc");
            } else {
                playlist.innerHTML = "<li>音声ファイルが見つかりません</li>";
            }
        } catch (error) {
            console.error("Google Drive API 音声ファイル取得エラー:", error);
        }
    }

    // **プレイリストを更新**
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

    // **ファイルをソート**
    function sortFiles(order) {
        files.sort((a, b) => {
            return order === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        });
        currentSort = order;
        updateSortButtonState();
        displayPlaylist();
    }

    // **ソートボタンの状態を更新**
    function updateSortButtonState() {
        sortAscButton.classList.toggle("active", currentSort === "asc");
        sortDescButton.classList.toggle("active", currentSort === "desc");
    }

    // **フォルダ選択変更時に MP ファイルを更新**
    folderSelect.addEventListener("change", (e) => {
        fetchDriveFiles(e.target.value);
    });

    // **音声を再生**
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

    // **現在の再生トラックを強調**
    function highlightCurrentTrack() {
        const items = playlist.getElementsByTagName("li");
        Array.from(items).forEach(li => li.classList.remove("active"));
        if (items[currentIndex]) {
            items[currentIndex].classList.add("active");
        }
    }

    // **次の曲を再生**
    function playNext() {
        if (isRepeat) {
            playAudio(currentIndex);
        } else if (isShuffle) {
            currentIndex = Math.floor(Math.random() * files.length);
            playAudio(currentIndex);
        } else {
            currentIndex = (currentIndex + 1) % files.length;
            playAudio(currentIndex);
        }
    }

    // **イベントリスナー**
    audioPlayer.addEventListener("ended", playNext);
    shuffleButton.addEventListener("click", () => {
        isShuffle = !isShuffle;
        isRepeat = false;
        shuffleButton.classList.toggle("active", isShuffle);
        repeatButton.classList.remove("active");
    });
    repeatButton.addEventListener("click", () => {
        isRepeat = !isRepeat;
        isShuffle = false;
        repeatButton.classList.toggle("active", isRepeat);
        shuffleButton.classList.remove("active");
    });

    await fetchFolders(); // 初期ロード時にフォルダを取得
});
