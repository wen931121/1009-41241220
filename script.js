const riceImageCount = 19; // 飯糰圖片數量
const animalImageCount = 19; // 動物圖片數量
let isRiceGame = true; // 初始遊戲為飯糰卡片
const imageContainer = document.getElementById('imageContainer');
const timerDisplay = document.getElementById('timer');
const gameTimeDisplay = document.getElementById('gameTime');
const gridSizeSelect = document.getElementById('gridSize');
const countdownTimeSelect = document.getElementById('countdownTime'); // 倒數時間選單
const restartButton = document.createElement('button'); // 動態創建重新開始按鈕
restartButton.textContent = '重新開始';
restartButton.style.display = 'none'; // 初始狀態下按鈕隱藏
document.body.appendChild(restartButton); // 把按鈕添加到頁面中

let deck = [];
let flippedCards = [];
let lockBoard = false;
let gameTime = 0;
let gameTimerInterval;
let matchedCards = 0;

// 取得音效元素
const successSound = document.getElementById('successSound');
const failureSound = document.getElementById('failureSound');

// 根據選擇的網格大小來生成牌組
function createDeck(isRice) {
    const gridSize = parseInt(gridSizeSelect.value);
    const totalCards = gridSize * gridSize;
    const totalPairs = totalCards / 2;

    deck = [];
    const frontImage = isRice ? 'images/rice1.png' : 'images/animal1.png';
    const backImageCount = isRice ? riceImageCount : animalImageCount;

    for (let i = 0; i < totalPairs; i++) {
        const backImage = isRice ? `images/rice${(i % backImageCount) + 2}.png` : `images/animal${(i % backImageCount) + 2}.png`;
        deck.push({ front: frontImage, back: backImage });
        deck.push({ front: frontImage, back: backImage });
    }

    shuffle(deck);
    imageContainer.innerHTML = '';  // 清空畫面

    deck.forEach((card, index) => {
        const flipContainer = document.createElement('div');
        flipContainer.classList.add('flip-container');
        flipContainer.id = `flip${index}`;

        const flipper = document.createElement('div');
        flipper.classList.add('flipper');

        const front = document.createElement('div');
        front.classList.add('front');
        const frontImg = document.createElement('img');
        frontImg.src = card.front;
        frontImg.alt = `Image Front`;
        front.appendChild(frontImg);

        const back = document.createElement('div');
        back.classList.add('back');
        const backImg = document.createElement('img');
        backImg.src = card.back;
        backImg.alt = `Image Back`;
        back.appendChild(backImg);

        flipper.appendChild(front);
        flipper.appendChild(back);
        flipContainer.appendChild(flipper);
        imageContainer.appendChild(flipContainer);

        // 監聽卡片翻轉
        flipContainer.addEventListener('click', function() {
            if (lockBoard || this.classList.contains('matched') || flippedCards.includes(this)) return; // 防止同一張牌連續點擊

            this.classList.add('flipped');
            flippedCards.push(this);

            if (flippedCards.length === 2) {
                lockBoard = true;

                const card1 = flippedCards[0].querySelector('.back img').src;
                const card2 = flippedCards[1].querySelector('.back img').src;

                // 確保點擊的兩張牌是不同的牌
                if (card1 === card2 && flippedCards[0] !== flippedCards[1]) {
                    successSound.play(); // 配對成功
                    flippedCards.forEach(card => card.classList.add('matched')); // 觸發動畫

                    // 等待 1 秒後執行其他操作（隱藏卡片）
                    setTimeout(() => {
                        matchedCards++; // 增加匹配數量
                        resetBoard();
                        checkGameOver();
                    }, 1000); // 設定延時為 1 秒，等待動畫結束
                } else {
                    failureSound.play(); // 配對失敗
                    setTimeout(() => {
                        flippedCards.forEach(card => card.classList.remove('flipped'));
                        resetBoard();
                    }, 1000);
                }
            }
        });
    });

    updateGridLayout(gridSize);
}

// 設置網格布局
function updateGridLayout(gridSize) {
    imageContainer.style.gridTemplateColumns = `repeat(${gridSize}, 120px)`;
}

// 重置翻轉的卡片
function resetBoard() {
    flippedCards = [];
    lockBoard = false;
}

// 檢查遊戲是否結束
function checkGameOver() {
    if (matchedCards === deck.length / 2) {
        clearInterval(gameTimerInterval);
        alert("遊戲結束！總共用了 " + gameTime + " 秒！");
        restartButton.style.display = 'block'; // 顯示重新開始按鈕
    }
}

// 重新開始遊戲時重置遊戲時間
function resetGameTime() {
    gameTime = 0;
    gameTimeDisplay.textContent = `遊戲時間：${gameTime}秒`;
    clearInterval(gameTimerInterval);
}

// 開始遊戲
document.getElementById('startGame').addEventListener('click', () => {
    document.querySelectorAll('.flip-container').forEach(container => {
        container.classList.add('flipped');
    });

    let countdown = parseInt(countdownTimeSelect.value);
    timerDisplay.textContent = `倒計時：${countdown}秒`;

    const countdownInterval = setInterval(() => {
        countdown--;
        timerDisplay.textContent = `倒計時：${countdown}秒`;

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            timerDisplay.textContent = '';
            gameTimerDisplay();
            document.querySelectorAll('.flip-container').forEach(container => {
                container.classList.remove('flipped');
            });
        }
    }, 1000);
});

// 顯示遊戲時間
function gameTimerDisplay() {
    gameTime = 0;
    gameTimeDisplay.textContent = `遊戲時間：${gameTime}秒`;

    gameTimerInterval = setInterval(() => {
        gameTime++;
        gameTimeDisplay.textContent = `遊戲時間：${gameTime}秒`;
    }, 1000);
}

// 切換遊戲
document.getElementById('toggleGame').addEventListener('click', () => {
    resetGameTime(); // 重置遊戲時間
    isRiceGame = !isRiceGame;
    createDeck(isRiceGame);
    const buttonText = isRiceGame ? '切換到動物卡片' : '切換到飯糰卡片';
    document.getElementById('toggleGame').innerText = buttonText;
    restartButton.style.display = 'none'; // 隱藏重新開始按鈕
});

// 當網格大小選擇改變時，重新生成牌組並更新網格布局
gridSizeSelect.addEventListener('change', () => {
    resetGameTime(); // 重置遊戲時間
    createDeck(isRiceGame);
    restartButton.style.display = 'none'; // 隱藏重新開始按鈕
});

// 倒數時間選擇改變時重置遊戲
countdownTimeSelect.addEventListener('change', () => {
    resetGameTime(); // 重置遊戲時間
    gameTimeDisplay.textContent = `遊戲時間：${gameTime}秒`;
    restartButton.style.display = 'none'; // 隱藏重新開始按鈕
});

// 重新開始按鈕點擊事件
restartButton.addEventListener('click', () => {
    resetGameTime();
    matchedCards = 0;
    createDeck(isRiceGame);
    restartButton.style.display = 'none'; // 隱藏重新開始按鈕
});

// 洗牌函數
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // 交換元素
    }
}

// 初始生成飯糰牌組
createDeck(isRiceGame);
