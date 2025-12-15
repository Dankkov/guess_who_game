// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И КОНСТАНТЫ =====
let currentLanguage = 'ru';
let playerName = '';
let roomCode = '';
let isHost = false;
let currentPage = '';
let gameMode = 'classic';
let gameState = null;

// Карты игры
const gameCards = [
    { id: 1, name: 'Лучницы', enName: 'Archers', image: 'images/cards/1.png' },
    { id: 2, name: 'Дракончик', enName: 'Baby Dragon', image: 'images/cards/2.png' },
    { id: 3, name: 'Шар', enName: 'Balloon', image: 'images/cards/3.png' },
    { id: 4, name: 'Варвары', enName: 'Barbarians', image: 'images/cards/4.png' },
    { id: 5, name: 'Бревно', enName: 'The Log', image: 'images/cards/5.png' },
    { id: 6, name: 'Мега Рыцарь', enName: 'Mega Knight', image: 'images/cards/6.png' },
    { id: 7, name: 'Ведьма', enName: 'Witch', image: 'images/cards/7.png' },
    { id: 8, name: 'Принц', enName: 'Prince', image: 'images/cards/8.png' }
];

// Звуки
const sounds = {
    click: 'sounds/click.wav',
    join: 'sounds/join.wav',
    start: 'sounds/start.wav',
    vote: 'sounds/vote.wav',
    win: 'sounds/win.wav',
    lose: 'sounds/lose.wav'
};

// ===== ОСНОВНЫЕ ФУНКЦИИ =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Документ загружен');
    init();
});

function init() {
    currentPage = window.location.pathname.split('/').pop() || 'index.html';
    console.log('📄 Текущая страница:', currentPage);
    
    loadSavedData();
    setupEventHandlers();
    applyLanguage();
    updateFlagIcon();
    initPage();
    
    // Очистка старых комнат
    cleanupOldRooms();
}

function loadSavedData() {
    currentLanguage = localStorage.getItem('guessWhoLanguage') || 'ru';
    playerName = localStorage.getItem('guessWhoPlayerName') || '';
    roomCode = localStorage.getItem('guessWhoRoomCode') || '';
    gameMode = localStorage.getItem('guessWhoGameMode') || 'classic';
    isHost = localStorage.getItem('guessWhoIsHost') === 'true';
    
    console.log('📁 Загружены данные:', { playerName, roomCode, isHost, gameMode });
}

function saveData() {
    localStorage.setItem('guessWhoLanguage', currentLanguage);
    localStorage.setItem('guessWhoGameMode', gameMode);
    if (playerName) localStorage.setItem('guessWhoPlayerName', playerName);
    if (roomCode) localStorage.setItem('guessWhoRoomCode', roomCode);
    localStorage.setItem('guessWhoIsHost', isHost.toString());
}

// ===== ЗВУКИ =====
function playSound(soundName) {
    try {
        const audio = new Audio(sounds[soundName]);
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Звук не воспроизведен:', e));
    } catch (e) {
        console.log('Ошибка воспроизведения звука:', e);
    }
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
function setupEventHandlers() {
    console.log('⚙️ Настройка обработчиков событий');
    
    // Все кнопки воспроизводят звук клика
    document.querySelectorAll('button, a').forEach(btn => {
        btn.addEventListener('click', () => playSound('click'));
    });
    
    // Кнопка языка
    const langBtn = document.getElementById('langBtn');
    if (langBtn) langBtn.addEventListener('click', handleLanguageToggle);
    
    // Кнопка правил
    const rulesBtn = document.getElementById('rulesBtn');
    if (rulesBtn) rulesBtn.addEventListener('click', () => openModal('rulesModal'));
    
    // Создание комнаты
    const createRoomBtn = document.getElementById('createRoomBtn');
    if (createRoomBtn) createRoomBtn.addEventListener('click', createRoom);
    
    // Присоединение к комнате
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    if (joinRoomBtn) joinRoomBtn.addEventListener('click', joinRoom);
    
    // Кнопка "Назад" в лобби
    const backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.addEventListener('click', () => window.location.href = 'index.html');
    
    // Копирование кода комнаты
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    if (copyCodeBtn) copyCodeBtn.addEventListener('click', copyRoomCode);
    
    // Приглашение друга
    const inviteBtn = document.getElementById('inviteBtn');
    if (inviteBtn) inviteBtn.addEventListener('click', () => openModal('inviteModal'));
    
    // Копирование ссылки приглашения
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    if (copyLinkBtn) copyLinkBtn.addEventListener('click', copyInviteLink);
    
    // Начало игры
    const startGameBtn = document.getElementById('startGameBtn');
    if (startGameBtn) startGameBtn.addEventListener('click', startGame);
    
    // Завершение игры в play.html
    const endGameBtn = document.getElementById('endGameBtn');
    if (endGameBtn) endGameBtn.addEventListener('click', endGame);
    
    // Закрытие модальных окон
    document.querySelectorAll('.close-modal, .btn-clear').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Выбор режима игры
    document.querySelectorAll('.mode-option').forEach(option => {
        option.addEventListener('click', function() {
            selectGameMode(this);
        });
    });
    
    // Игровые кнопки
    const closeRoleBtn2 = document.getElementById('closeRoleBtn2');
    if (closeRoleBtn2) closeRoleBtn2.addEventListener('click', closeRoleModal);
    
    const guessCardBtn = document.getElementById('guessCardBtn');
    if (guessCardBtn) guessCardBtn.addEventListener('click', function() {
        openModal('guessModal');
        setupGuessCards();
    });
    
    const backToLobbyBtn = document.getElementById('backToLobbyBtn');
    if (backToLobbyBtn) backToLobbyBtn.addEventListener('click', () => window.location.href = 'game.html');
    
    const closeGuessBtn = document.getElementById('closeGuessBtn');
    if (closeGuessBtn) closeGuessBtn.addEventListener('click', () => closeModal('guessModal'));
    
    // Закрытие окон ошибок
    const closeErrorBtn2 = document.getElementById('closeErrorBtn2');
    if (closeErrorBtn2) closeErrorBtn2.addEventListener('click', () => closeModal('errorModal'));
    
    const closeLobbyErrorBtn2 = document.getElementById('closeLobbyErrorBtn2');
    if (closeLobbyErrorBtn2) closeLobbyErrorBtn2.addEventListener('click', () => closeModal('lobbyErrorModal'));
    
    // Приглашение - закрытие
    const closeInviteBtn2 = document.getElementById('closeInviteBtn2');
    if (closeInviteBtn2) closeInviteBtn2.addEventListener('click', () => closeModal('inviteModal'));
}

function handleLanguageToggle() {
    currentLanguage = currentLanguage === 'ru' ? 'en' : 'ru';
    applyLanguage();
    saveData();
    updateFlagIcon();
    playSound('click');
}

// ===== ИНИЦИАЛИЗАЦИЯ СТРАНИЦ =====
function initPage() {
    console.log('🔄 Инициализация страницы:', currentPage);
    
    switch(currentPage) {
        case 'index.html':
            initIndexPage();
            break;
        case 'game.html':
            initGamePage();
            break;
        case 'play.html':
            initPlayPage();
            break;
    }
}

function initIndexPage() {
    console.log('🏠 Инициализация главной страницы');
    
    const nameInput = document.getElementById('playerName');
    const codeInput = document.getElementById('roomCode');
    
    if (nameInput && playerName) nameInput.value = playerName;
    if (codeInput && roomCode) codeInput.value = roomCode;
    
    // Проверяем ссылку приглашения
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode && codeInput) {
        const code = joinCode.toUpperCase();
        codeInput.value = code;
        roomCode = code;
        saveData();
        console.log('🔗 Код из ссылки установлен:', code);
        
        // Если имя уже введено - сразу пытаемся присоединиться
        if (playerName && playerName.length >= 1) {
            console.log('🔄 Авто-присоединение...');
            setTimeout(() => {
                joinRoom();
            }, 300);
        }
    }
    
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            playerName = this.value.trim();
            saveData();
        });
    }
    
    if (codeInput) {
        codeInput.addEventListener('input', function() {
            roomCode = this.value.toUpperCase();
            saveData();
        });
        
        // Enter для присоединения
        codeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                joinRoom();
            }
        });
    }
}

function initGamePage() {
    console.log('🎮 Инициализация лобби');
    
    // Если хост, создаем комнату если ее нет
    if (isHost) {
        console.log('👑 Вы - хост, проверяем комнату...');
        if (!roomCode) {
            roomCode = generateUniqueRoomCode();
            console.log('🔑 Сгенерирован код комнаты:', roomCode);
            saveData();
            createRoomInStorage();
        } else {
            const roomData = getRoomData();
            if (!roomData) {
                console.log('⚠️ Комната не найдена, создаем новую');
                createRoomInStorage();
            } else {
                console.log('✅ Комната найдена:', roomData);
            }
        }
    } else {
        console.log('👤 Вы - игрок, проверяем комнату...');
        const roomData = getRoomData();
        if (!roomData) {
            console.error('❌ Комната не найдена! Перенаправляем на главную');
            showLobbyError(getTranslation('roomNotFound'));
            setTimeout(() => window.location.href = 'index.html', 2000);
            return;
        }
    }
    
    // Отображение кода комнаты
    const roomCodeDisplay = document.getElementById('roomCodeDisplay');
    if (roomCodeDisplay) {
        roomCodeDisplay.textContent = roomCode || 'XXXX';
        console.log('📋 Код комнаты отображен:', roomCode);
    }
    
    // Обновление ссылки приглашения
    updateInviteLink();
    
    // Устанавливаем выбранный режим
    document.querySelectorAll('.mode-option').forEach(option => {
        if (option.getAttribute('data-mode') === gameMode) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Загружаем список игроков сразу
    updatePlayersList();
    
    // Обновляем каждые 2 секунды
    setInterval(updatePlayersList, 2000);
}

function initPlayPage() {
    console.log('🎲 Инициализация игровой страницы');
    
    const savedGameState = localStorage.getItem(`guessWhoGameState_${roomCode}`);
    if (savedGameState) {
        try {
            gameState = JSON.parse(savedGameState);
            console.log('📊 Состояние игры загружено:', gameState);
        } catch (e) {
            console.error('❌ Ошибка парсинга состояния игры');
            window.location.href = 'game.html';
            return;
        }
    } else {
        console.error('❌ Состояние игры не найдено');
        window.location.href = 'game.html';
        return;
    }
    
    showPlayerRole();
    
    const endGameBtn = document.getElementById('endGameBtn');
    if (endGameBtn) {
        endGameBtn.classList.toggle('hidden', !isHost);
    }
}

// ===== ФУНКЦИИ ЯЗЫКА =====
function updateFlagIcon() {
    const flagIcon = document.getElementById('flagIcon');
    const langText = document.getElementById('langText');
    
    if (flagIcon && langText) {
        if (currentLanguage === 'ru') {
            flagIcon.src = 'images/flags/russia.png';
            flagIcon.alt = 'Ru';
            langText.textContent = 'Ru';
        } else {
            flagIcon.src = 'images/flags/usa.png';
            flagIcon.alt = 'US';
            langText.textContent = 'Eng';
        }
    }
}

function applyLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(key);
        if (translation) {
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
}

function getTranslation(key) {
    const translations = {
        ru: {
            'rules': 'Правила',
            'subtitle': 'Увлекательная игра шпион по мотивам игры Clash Royale для 3-6 игроков.',
            'nameHint': '1-12 символов, только буквы и цифры',
            'createRoom': 'Создать комнату',
            'or': 'или',
            'join': 'Присоединиться',
            'channel': 'Наш канал',
            'support': 'Поддержать проект',
            'idea': 'Предложить идею',
            'techSupport': 'Тех.поддержка',
            'disclaimer': 'Этот контент не является официальным продуктом компании Supercell и не поддерживается ею. Для получения дополнительной информации посетите официальный сайт Supercell:',
            'rulesTitle': 'Правила игры',
            'rulesText': `❓Правила:\n\n🎯 Цель участников:\n- Мирные: Вычислить шпиона и исключить его, путем голосования.\n- Шпион: Понять и назвать карту или остаться неизганным до момента исключения другого игрока.\n\n➡️ Ход игры\n1. Всем (кроме Шпиона) показывается карта (Одна и та же или нет, в зависимости от режима)\n2. Игроки по очереди называют факт о данной им карте. (Шпион придумывает, пытаясь остаться в игре)\n3. Важно: Не называйте карту прямо!\n\n🏆 Как определяется победа?\n>> Если исключили не шпиона, а игрока - мирные проиграли. Также, если шпион отгадывает карту, то также - мирные терпят неудачу.\n>> Если шпиона исключают из игры путем голосования — мирные победили. Также, мирные побеждают, если шпион не угадывает/не правильно называет карту.`,
            'clear': 'Ясно',
            'error': 'Ошибка',
            'nameError': '❗️Имя должно содержать 1-12 символов.',
            'back': 'Назад',
            'lobby': 'Лобби',
            'lobbyCode': 'Код лобби:',
            'players': 'Игроки',
            'host': 'Хост',
            'invite': 'Пригласить друга',
            'startGame': 'Начать игру!',
            'endGame': 'Завершить игру',
            'inviteFriend': 'Пригласить друга',
            'inviteText': 'Скопируйте ссылку ниже и отправьте другу:',
            'copy': 'Копировать',
            'inviteHint': 'Или просто сообщите код комнаты',
            'done': 'Готово',
            'warning': 'Внимание',
            'gameMode': 'Режим игры:',
            'youAre': 'Вы - Игрок',
            'yourCard': '>> Карта:',
            'yourTask': 'Ваша задача:',
            'task1': 'Найти предателя',
            'task2': 'Обсуждайте с другими игроками подозрительных',
            'task3': 'Голосуйте и исключайте подозреваемых',
            'spyTask1': 'Влиться в компанию остальных игроков',
            'spyTask2': 'Претворяться обычным игроком и угадать загаданную карту',
            'remember': 'Запомнил карту',
            'discussion': 'Обсуждение!',
            'discussionText': 'Обсуждение длится 3 минуты. За это время последовательно каждый игрок называет факт о выданной карте.',
            'timeLeft': 'Осталось времени',
            'cardHint': 'Не называйте карту прямо!',
            'votingTime': 'Время голосования!',
            'votingText': 'Выберите ниже подозрительного вам игрока из представленных.',
            'voteTimeLeft': 'Осталось на голосование',
            'guessCard': 'Угадать карту',
            'readyCount': 'Запомнили карту:',
            'votedFor': 'Вы проголосовали за пользователя',
            'waitingVote': 'Ожидайте конца голосования...',
            'guessCardTitle': 'Угадать карту',
            'guessInstruction': 'Выберите карту, которая, по вашему мнению, у игроков:',
            'backToLobby': 'Вернуться в лобби',
            'playersReady': 'Игроков готово:',
            'countdown': 'Начало игры через:',
            'minPlayers': '❗️Для игры нужно минимум 3 игрока',
            'maxPlayers': '❗️Максимальное количество игроков - 6',
            'noRoomCode': 'Введите код лобби!',
            'hostOnly': '❗️Только хост может начать игру',
            'roomFull': '❗️Комната заполнена (максимум 6 игроков)',
            'roomNotFound': '❌ Такого лобби не существует',
            'kickPlayer': 'Исключить'
        },
        en: {
            'rules': 'Rules',
            'subtitle': 'Exciting spy game based on Clash Royale for 3-6 players',
            'nameHint': '1-12 characters, letters and numbers only',
            'createRoom': 'Create Room',
            'or': 'or',
            'join': 'Join',
            'channel': 'Our Channel',
            'support': 'Support Project',
            'idea': 'Suggest Idea',
            'techSupport': 'Tech Support',
            'disclaimer': 'This content is not an official product of Supercell and is not endorsed by it.',
            'rulesTitle': 'Game Rules',
            'rulesText': `❓Rules:\n\n🎯 Goals:\n- Innocents: Find and eliminate the spy through voting.\n- Spy: Guess the correct card or remain undetected until another player is eliminated.\n\n➡️ Game Flow\n1. All players (except the Spy) are shown a card\n2. Players take turns stating facts about their card.\n3. Important: Do not name the card directly!\n\n🏆 How to win?\n>> If an innocent player is eliminated instead of the spy - innocents lose.\n>> If the spy is eliminated through voting - innocents win.`,
            'clear': 'Clear',
            'error': 'Error',
            'nameError': '❗️Name must contain 1-12 characters.',
            'back': 'Back',
            'lobby': 'Lobby',
            'lobbyCode': 'Lobby Code:',
            'players': 'Players',
            'host': 'Host',
            'invite': 'Invite Friend',
            'startGame': 'Start Game!',
            'endGame': 'End Game',
            'inviteFriend': 'Invite Friend',
            'inviteText': 'Copy the link below and send to a friend:',
            'copy': 'Copy',
            'inviteHint': 'Or just share the room code',
            'done': 'Done',
            'warning': 'Warning',
            'gameMode': 'Game Mode:',
            'youAre': 'You are',
            'yourCard': '>> Card:',
            'yourTask': 'Your task:',
            'task1': 'Find the traitor',
            'task2': 'Discuss suspicious players with others',
            'task3': 'Vote and eliminate suspects',
            'spyTask1': 'Blend in with the other players',
            'spyTask2': 'Pretend to be a regular player and guess the hidden card',
            'remember': 'Remember Card',
            'discussion': 'Discussion!',
            'discussionText': 'Discussion lasts 3 minutes.',
            'timeLeft': 'Time left',
            'cardHint': 'Don\'t name the card directly!',
            'votingTime': 'Voting Time!',
            'votingText': 'Choose a suspicious player from the list below.',
            'voteTimeLeft': 'Time left to vote',
            'guessCard': 'Guess Card',
            'readyCount': 'Remembered card:',
            'votedFor': 'You voted for player',
            'waitingVote': 'Waiting for voting to end...',
            'guessCardTitle': 'Guess the Card',
            'guessInstruction': 'Select the card you think the players have:',
            'backToLobby': 'Back to Lobby',
            'playersReady': 'Players ready:',
            'countdown': 'Game starts in:',
            'minPlayers': '❗️Minimum 3 players required',
            'maxPlayers': '❗️Maximum 6 players allowed',
            'noRoomCode': 'Enter room code!',
            'hostOnly': '❗️Only host can start the game',
            'roomFull': '❗️Room is full (maximum 6 players)',
            'roomNotFound': '❌ Room not found',
            'kickPlayer': 'Kick'
        }
    };
    
    return translations[currentLanguage]?.[key] || key;
}

// ===== МОДАЛЬНЫЕ ОКНА =====
function openModal(modalId) {
    console.log('📂 Открытие модального окна:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    console.log('📂 Закрытие модального окна:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ===== ФУНКЦИИ КОМНАТ И ЛОББИ =====
function generateUniqueRoomCode() {
    console.log('🔑 Генерация уникального кода комнаты...');
    
    const existingCodes = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('guessWhoRoom_')) {
            const code = key.replace('guessWhoRoom_', '');
            existingCodes.push(code);
        }
    }
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let attempts = 0;
    let code;
    
    do {
        code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        attempts++;
        
        if (attempts > 100) {
            return 'ERR' + Math.floor(Math.random() * 1000);
        }
    } while (existingCodes.includes(code));
    
    console.log('✅ Уникальный код сгенерирован:', code);
    return code;
}

function validateName(name) {
    if (!name || name.length < 1 || name.length > 12) {
        return false;
    }
    const regex = /^[a-zA-Zа-яА-ЯёЁ0-9]+$/;
    return regex.test(name);
}

function createRoom() {
    console.log('🏗️ Создание комнаты');
    const nameInput = document.getElementById('playerName');
    if (!nameInput) return;
    
    playerName = nameInput.value.trim();
    console.log('👤 Имя игрока:', playerName);
    
    if (!validateName(playerName)) {
        console.log('❌ Невалидное имя');
        openModal('errorModal');
        return;
    }
    
    roomCode = generateUniqueRoomCode();
    isHost = true;
    
    saveData();
    createRoomInStorage();
    
    console.log('➡️ Переход в лобби');
    window.location.href = 'game.html';
}

function createRoomInStorage() {
    console.log('💾 Создание комнаты в хранилище:', roomCode);
    
    const roomData = {
        code: roomCode,
        host: playerName,
        players: [{
            name: playerName,
            isHost: true,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            joinedAt: Date.now()
        }],
        gameMode: gameMode,
        createdAt: Date.now(),
        lastActivity: Date.now()
    };
    
    localStorage.setItem(`guessWhoRoom_${roomCode}`, JSON.stringify(roomData));
    console.log('✅ Комната создана');
}

function getRoomData() {
    if (!roomCode) return null;
    const data = localStorage.getItem(`guessWhoRoom_${roomCode}`);
    return data ? JSON.parse(data) : null;
}

function joinRoom() {
    console.log('🤝 Присоединение к комнате');
    
    const nameInput = document.getElementById('playerName');
    const codeInput = document.getElementById('roomCode');
    
    if (!nameInput || !codeInput) {
        console.error('❌ Поля не найдены');
        return;
    }
    
    playerName = nameInput.value.trim();
    roomCode = codeInput.value.toUpperCase().trim();
    
    console.log('📋 Данные:', { playerName, roomCode });
    
    if (!validateName(playerName)) {
        console.log('❌ Невалидное имя');
        openModal('errorModal');
        return;
    }
    
    if (!roomCode || roomCode.length !== 4) {
        console.log('❌ Невалидный код');
        showLobbyError(getTranslation('noRoomCode'));
        return;
    }
    
    const roomData = getRoomData();
    
    if (!roomData) {
        console.log('❌ Комната не найдена:', roomCode);
        showLobbyError(getTranslation('roomNotFound'));
        return;
    }
    
    // Проверка на заблокированного игрока
    const blockedPlayers = JSON.parse(localStorage.getItem(`guessWhoBlocked_${roomCode}`) || '[]');
    if (blockedPlayers.includes(playerName)) {
        console.log('🚫 Игрок заблокирован');
        showLobbyError('Вы были исключены из лобби!');
        return;
    }
    
    // Проверка на повторное имя
    const playerExists = roomData.players.some(p => p.name === playerName);
    if (playerExists) {
        console.log('⚠️ Игрок уже есть');
        showLobbyError('Игрок с таким именем уже есть!');
        return;
    }
    
    if (roomData.players.length >= 6) {
        console.log('🚫 Комната заполнена');
        showLobbyError(getTranslation('roomFull'));
        return;
    }
    
    isHost = false;
    saveData();
    
    // Добавляем игрока
    roomData.players.push({
        name: playerName,
        isHost: false,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        joinedAt: Date.now()
    });
    
    roomData.lastActivity = Date.now();
    localStorage.setItem(`guessWhoRoom_${roomCode}`, JSON.stringify(roomData));
    
    playSound('join');
    console.log('✅ Переход в лобби');
    window.location.href = 'game.html';
}

function selectGameMode(element) {
    if (!isHost) {
        showNotification('Только хост может менять режим!');
        return;
    }
    
    document.querySelectorAll('.mode-option').forEach(opt => {
        opt.classList.remove('active');
    });
    element.classList.add('active');
    gameMode = element.getAttribute('data-mode');
    
    const roomData = getRoomData();
    if (roomData) {
        roomData.gameMode = gameMode;
        localStorage.setItem(`guessWhoRoom_${roomCode}`, JSON.stringify(roomData));
    }
    
    saveData();
    playSound('click');
}

function showLobbyError(message) {
    console.log('🚨 Ошибка:', message);
    const errorText = document.getElementById('lobbyErrorText');
    if (errorText) {
        errorText.innerHTML = message;
        openModal('lobbyErrorModal');
    }
}

function updateInviteLink() {
    const inviteLink = document.getElementById('inviteLink');
    if (inviteLink && roomCode) {
        const currentUrl = window.location.origin + window.location.pathname.replace('game.html', '');
        inviteLink.value = `${currentUrl}index.html?join=${roomCode}`;
        console.log('🔗 Ссылка обновлена');
    }
}

function copyRoomCode() {
    const codeDisplay = document.getElementById('roomCodeDisplay');
    if (codeDisplay && codeDisplay.textContent && codeDisplay.textContent !== 'XXXX') {
        navigator.clipboard.writeText(codeDisplay.textContent)
            .then(() => showNotification('✅ Код скопирован!'))
            .catch(() => showNotification('❌ Ошибка копирования'));
    }
}

function copyInviteLink() {
    const inviteLink = document.getElementById('inviteLink');
    if (inviteLink && inviteLink.value) {
        navigator.clipboard.writeText(inviteLink.value)
            .then(() => showNotification('✅ Ссылка скопирована!'))
            .catch(() => showNotification('❌ Ошибка копирования'));
    }
}

function showNotification(message) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(to right, #4A90E2, #2c82c9);
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function updatePlayersList() {
    const playersList = document.getElementById('playersList');
    const playersCount = document.getElementById('playersCount');
    
    if (!playersList) return;
    
    const roomData = getRoomData();
    const players = roomData?.players || [];
    
    console.log('👥 Игроков:', players.length);
    
    playersList.innerHTML = '';
    
    if (players.length === 0) {
        playersList.innerHTML = `
            <div class="player-item">
                <span class="player-name">Ожидание игроков...</span>
                <span class="player-status">Игрок</span>
            </div>
        `;
    } else {
        players.forEach(player => {
            const playerItem = document.createElement('div');
            playerItem.className = player.isHost ? 'player-item host' : 'player-item';
            
            let kickButton = '';
            if (isHost && player.name !== playerName) {
                kickButton = `
                    <button class="kick-btn" title="${getTranslation('kickPlayer')}" onclick="kickPlayer('${player.name}')">
                        <i class="fas fa-user-slash"></i>
                    </button>
                `;
            }
            
            playerItem.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="player-name">
                        ${player.name} ${player.name === playerName ? '<span style="color: #4A90E2; font-weight: 600;">(Вы)</span>' : ''}
                    </span>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span class="player-status">${player.isHost ? getTranslation('host') : getTranslation('players')}</span>
                    ${kickButton}
                </div>
            `;
            playersList.appendChild(playerItem);
        });
    }
    
    if (playersCount) {
        playersCount.textContent = `${players.length}/6`;
    }
    
    if (players.length > 0 && roomData) {
        roomData.lastActivity = Date.now();
        localStorage.setItem(`guessWhoRoom_${roomCode}`, JSON.stringify(roomData));
    }
}

function kickPlayer(playerNameToKick) {
    console.log('🚫 Исключение:', playerNameToKick);
    
    if (!isHost) {
        showNotification('Только хост может исключать!');
        return;
    }
    
    if (confirm(`Исключить ${playerNameToKick}?`)) {
        const roomData = getRoomData();
        if (!roomData) return;
        
        roomData.players = roomData.players.filter(p => p.name !== playerNameToKick);
        localStorage.setItem(`guessWhoRoom_${roomCode}`, JSON.stringify(roomData));
        
        let blocked = JSON.parse(localStorage.getItem(`guessWhoBlocked_${roomCode}`) || '[]');
        blocked.push(playerNameToKick);
        localStorage.setItem(`guessWhoBlocked_${roomCode}`, JSON.stringify(blocked));
        
        showNotification(`Игрок ${playerNameToKick} исключен`);
        updatePlayersList();
    }
}

function startGame() {
    console.log('🎲 Начало игры');
    
    if (!isHost) {
        showLobbyError(getTranslation('hostOnly'));
        return;
    }
    
    const roomData = getRoomData();
    const players = roomData?.players || [];
    
    console.log('👥 Игроков для старта:', players.length);
    
    if (players.length < 3) {
        showLobbyError(getTranslation('minPlayers'));
        return;
    }
    
    if (players.length > 6) {
        showLobbyError(getTranslation('maxPlayers'));
        return;
    }
    
    // Выбираем карту и шпиона
    const shuffledCards = [...gameCards].sort(() => 0.5 - Math.random());
    const selectedCard = shuffledCards[0];
    const spyIndex = Math.floor(Math.random() * players.length);
    const spyName = players[spyIndex].name;
    
    console.log('🎴 Карта:', selectedCard.name);
    console.log('🕵️ Шпион:', spyName);
    
    // Состояние игры
    const gameStateForAll = {
        phase: 'role',
        timer: 180,
        voteTimer: 30,
        players: players,
        votes: {},
        correctCard: selectedCard.name,
        correctCardImage: selectedCard.image,
        readyPlayers: 0,
        totalPlayers: players.length,
        actualMode: gameMode,
        actualSpy: spyName,
        gameMode: gameMode,
        roomCode: roomCode,
        createdAt: Date.now()
    };
    
    localStorage.setItem(`guessWhoGameState_${roomCode}`, JSON.stringify(gameStateForAll));
    
    playSound('start');
    startCountdown();
}

function startCountdown() {
    console.log('⏱️ Отсчет');
    
    const countdownOverlay = document.createElement('div');
    countdownOverlay.id = 'countdownOverlay';
    countdownOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
    `;
    
    const countdownText = document.createElement('div');
    countdownText.id = 'countdownText';
    countdownText.style.cssText = `
        font-size: 8rem;
        font-weight: 800;
        color: #FFD700;
        text-shadow: 0 5px 30px rgba(0,0,0,0.5);
    `;
    
    countdownOverlay.appendChild(countdownText);
    document.body.appendChild(countdownOverlay);
    
    let count = 3;
    countdownText.textContent = count;
    
    const countdownInterval = setInterval(() => {
        count--;
        countdownText.textContent = count;
        
        if (count <= 0) {
            clearInterval(countdownInterval);
            countdownText.textContent = '🎮';
            
            setTimeout(() => {
                countdownOverlay.remove();
                console.log('➡️ Переход в игру');
                window.location.href = 'play.html';
            }, 1000);
        }
    }, 1000);
}

function endGame() {
    console.log('🛑 Завершение игры');
    
    if (!isHost) {
        showNotification('Только хост может завершить!');
        return;
    }
    
    if (confirm('Завершить игру досрочно?')) {
        localStorage.removeItem(`guessWhoRoom_${roomCode}`);
        localStorage.removeItem(`guessWhoGameState_${roomCode}`);
        localStorage.removeItem(`guessWhoBlocked_${roomCode}`);
        
        console.log('✅ Игра завершена');
        window.location.href = 'index.html';
    }
}

// ===== ИГРОВЫЕ ФУНКЦИИ =====
function showPlayerRole() {
    console.log('🎭 Показ роли');
    
    if (!gameState) {
        console.error('❌ Нет состояния');
        return;
    }
    
    gameState.isSpy = playerName === gameState.actualSpy;
    gameState.playerCard = gameState.isSpy ? '???' : gameState.correctCard;
    gameState.hasVoted = false;
    gameState.hasGuessed = false;
    gameState.readyPlayers = 0;
    
    console.log('🎭 Роль:', gameState.isSpy ? 'Шпион' : 'Игрок');
    
    const roleHeader = document.getElementById('roleHeader');
    const roleTaskText = document.getElementById('roleTaskText');
    const playerCardImage = document.getElementById('playerCardImage');
    const displayedCardName = document.getElementById('displayedCardName');
    const guessCardBtn = document.getElementById('guessCardBtn');
    
    if (!roleHeader || !roleTaskText) return;
    
    if (gameState.isSpy) {
        console.log('🕵️ Настройка для шпиона');
        roleHeader.innerHTML = `<h2>🥷 <span>Вы - Предатель!</span></h2>`;
        roleTaskText.innerHTML = `
            <li>Влиться в компанию остальных игроков</li>
            <li>Претворяться обычным игроком и угадать загаданную карту</li>
        `;
        if (playerCardImage) playerCardImage.style.display = 'none';
        if (displayedCardName) {
            displayedCardName.textContent = '???';
            displayedCardName.style.display = 'block';
        }
        if (guessCardBtn) guessCardBtn.classList.remove('hidden');
    } else {
        console.log('👤 Настройка для игрока');
        roleHeader.innerHTML = `<h2>👤 <span>Вы - Игрок</span></h2>`;
        roleTaskText.innerHTML = `
            <li>Найти предателя</li>
            <li>Обсуждайте с другими игроками подозрительных</li>
            <li>Голосуйте и исключайте подозреваемых</li>
        `;
        
        const card = gameCards.find(c => c.name === gameState.correctCard) || gameCards[0];
        
        if (displayedCardName) {
            displayedCardName.textContent = gameState.correctCard;
            displayedCardName.style.display = 'block';
            displayedCardName.style.marginTop = '15px';
            displayedCardName.style.fontSize = '1.8rem';
            displayedCardName.style.fontWeight = '700';
            displayedCardName.style.color = '#333';
        }
        
        if (playerCardImage) {
            const img = playerCardImage.querySelector('img');
            if (img) {
                img.src = gameState.correctCardImage || card.image;
                img.alt = gameState.correctCard;
                img.style.border = '4px solid #4A90E2';
                img.style.boxShadow = '0 10px 30px rgba(74, 144, 226, 0.3)';
            }
        }
        
        if (guessCardBtn) guessCardBtn.classList.add('hidden');
    }
    
    updateReadyCounter();
}

function updateReadyCounter() {
    const readyCounter = document.getElementById('readyCounter');
    if (readyCounter && gameState) {
        readyCounter.innerHTML = `Запомнили карту: ${gameState.readyPlayers || 0}/${gameState.totalPlayers || 0}`;
    }
}

function closeRoleModal() {
    console.log('✅ Закрытие окна роли');
    
    if (!gameState) return;
    
    gameState.readyPlayers = (gameState.readyPlayers || 0) + 1;
    localStorage.setItem(`guessWhoGameState_${roomCode}`, JSON.stringify(gameState));
    
    updateReadyCounter();
    
    const roleModal = document.getElementById('roleModal');
    if (roleModal) {
        roleModal.classList.remove('active');
        
        const discussionPage = document.getElementById('discussionPage');
        if (discussionPage) {
            discussionPage.classList.remove('hidden');
        }
        
        startGameTimer();
    }
}

function startGameTimer() {
    console.log('⏰ Запуск таймера');
    if (!gameState) return;
    
    gameState.phase = 'discussion';
    updateTimerDisplay();
    
    const timerInterval = setInterval(() => {
        gameState.timer--;
        updateTimerDisplay();
        
        if (gameState.timer <= 0) {
            clearInterval(timerInterval);
            startVotingPhase();
        }
    }, 1000);
}

function startVotingPhase() {
    console.log('🗳️ Голосование');
    if (!gameState) return;
    
    gameState.phase = 'voting';
    localStorage.setItem(`guessWhoGameState_${roomCode}`, JSON.stringify(gameState));
    
    const discussionPage = document.getElementById('discussionPage');
    const votingPage = document.getElementById('votingPage');
    
    if (discussionPage) discussionPage.classList.add('hidden');
    if (votingPage) {
        votingPage.classList.remove('hidden');
        setupVotingPlayers();
    }
    
    const voteInterval = setInterval(() => {
        gameState.voteTimer--;
        updateTimerDisplay();
        
        if (gameState.voteTimer <= 0) {
            clearInterval(voteInterval);
            checkVotingResults();
        }
    }, 1000);
}

function updateTimerDisplay() {
    if (!gameState) return;
    
    const gameTimer = document.getElementById('gameTimer');
    const voteTimer = document.getElementById('voteTimer');
    
    if (gameTimer) {
        const minutes = Math.floor(gameState.timer / 60);
        const seconds = gameState.timer % 60;
        gameTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    if (voteTimer) {
        const minutes = Math.floor(gameState.voteTimer / 60);
        const seconds = gameState.voteTimer % 60;
        voteTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function setupVotingPlayers() {
    const playersToVote = document.getElementById('playersToVote');
    if (!playersToVote || !gameState) return;
    
    playersToVote.innerHTML = '';
    
    gameState.players.forEach(player => {
        if (player.name !== playerName) {
            const btn = document.createElement('button');
            btn.className = 'player-vote-btn';
            btn.innerHTML = `<i class="fas fa-user"></i><span>${player.name}</span>`;
            
            btn.addEventListener('click', () => {
                voteForPlayer(player.name, btn);
                playSound('vote');
            });
            
            playersToVote.appendChild(btn);
        }
    });
}

function voteForPlayer(playerName, buttonElement) {
    if (!gameState || gameState.hasVoted) return;
    
    gameState.hasVoted = true;
    gameState.votes[playerName] = (gameState.votes[playerName] || 0) + 1;
    
    document.querySelectorAll('.player-vote-btn').forEach(btn => {
        btn.classList.remove('voted');
    });
    buttonElement.classList.add('voted');
    
    const voteStatus = document.getElementById('voteStatus');
    const votedPlayer = document.getElementById('votedPlayer');
    
    if (voteStatus) voteStatus.classList.remove('hidden');
    if (votedPlayer) votedPlayer.textContent = playerName;
    
    localStorage.setItem(`guessWhoGameState_${roomCode}`, JSON.stringify(gameState));
}

function setupGuessCards() {
    const cardsGrid = document.getElementById('cardsGrid');
    if (!cardsGrid || !gameState) return;
    
    cardsGrid.innerHTML = '';
    
    const shuffledCards = [...gameCards].sort(() => 0.5 - Math.random()).slice(0, 4);
    const correctCard = gameCards.find(c => c.name === gameState.correctCard);
    if (correctCard && !shuffledCards.some(c => c.name === correctCard.name)) {
        shuffledCards[0] = correctCard;
        shuffledCards.sort(() => 0.5 - Math.random());
    }
    
    shuffledCards.forEach(card => {
        const cardOption = document.createElement('div');
        cardOption.className = 'card-option';
        cardOption.innerHTML = `
            <div style="padding: 15px; text-align: center;">
                <img src="${card.image}" alt="${card.name}" style="width: 100px; height: 120px; object-fit: cover; border-radius: 10px; margin-bottom: 10px; border: 2px solid #e1e5eb;">
                <div style="font-weight: 700; font-size: 1em; color: #333;">${card.name}</div>
            </div>
        `;
        
        cardOption.addEventListener('click', () => selectCard(card, cardOption));
        cardsGrid.appendChild(cardOption);
    });
}

function selectCard(card, cardElement) {
    if (!gameState || gameState.hasGuessed) return;
    
    gameState.hasGuessed = true;
    
    document.querySelectorAll('.card-option').forEach(el => {
        el.classList.remove('selected');
    });
    
    cardElement.classList.add('selected');
    
    const isCorrect = card.name === gameState.correctCard;
    closeModal('guessModal');
    
    if (isCorrect) {
        endGameResult('spy', 'Предатель верно угадал карту.', 'win');
    } else {
        endGameResult('players', 'Предатель НЕ угадал карту.', 'lose');
    }
}

function checkVotingResults() {
    if (!gameState) return;
    
    const votedPlayers = Object.keys(gameState.votes);
    
    if (votedPlayers.length === 0) {
        endGameResult('players', 'Никто не исключен. Игроки победили!', 'win');
        return;
    }
    
    let excludedPlayer = votedPlayers[0];
    let maxVotes = gameState.votes[excludedPlayer];
    
    for (let i = 1; i < votedPlayers.length; i++) {
        const player = votedPlayers[i];
        if (gameState.votes[player] > maxVotes) {
            excludedPlayer = player;
            maxVotes = gameState.votes[player];
        }
    }
    
    if (excludedPlayer === gameState.actualSpy) {
        endGameResult('players', `Игроки исключили предателя ${excludedPlayer}!`, 'win');
    } else {
        endGameResult('spy', `Игроки исключили мирного ${excludedPlayer}. Предатель победил!`, 'lose');
    }
}

function endGameResult(winner, reason, soundType) {
    console.log('🏆 Результат:', winner, reason);
    
    if (gameState) {
        gameState.phase = 'ended';
        localStorage.setItem(`guessWhoGameState_${roomCode}`, JSON.stringify(gameState));
    }
    
    playSound(soundType === 'win' ? 'win' : 'lose');
    
    const resultModal = document.getElementById('resultModal');
    const resultTitle = document.getElementById('resultTitle');
    const resultReason = document.getElementById('resultReason');
    const resultHeader = document.getElementById('resultHeader');
    
    if (!resultModal || !resultTitle || !resultReason) return;
    
    if (winner === 'players') {
        resultTitle.textContent = '🏆 Победа ИГРОКОВ!';
        resultHeader.className = 'result-header win';
        resultReason.className = 'win-text';
    } else {
        resultTitle.textContent = '🏆 Победа ПРЕДАТЕЛЯ!';
        resultHeader.className = 'result-header lose';
        resultReason.className = 'lose-text';
    }
    
    resultReason.textContent = reason;
    resultModal.classList.remove('hidden');
}

// ===== ОЧИСТКА СТАРЫХ КОМНАТ =====
function cleanupOldRooms() {
    console.log('🧹 Очистка старых комнат');
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('guessWhoRoom_')) {
            try {
                const roomData = JSON.parse(localStorage.getItem(key));
                if (roomData && roomData.lastActivity) {
                    if (now - roomData.lastActivity > oneHour) {
                        localStorage.removeItem(key);
                        const code = roomData.code;
                        localStorage.removeItem(`guessWhoGameState_${code}`);
                        localStorage.removeItem(`guessWhoBlocked_${code}`);
                        console.log('🗑️ Удалена старая комната:', code);
                    }
                }
            } catch (e) {
                console.log('⚠️ Ошибка при очистке комнаты:', e);
            }
        }
    }
}

// Запускаем очистку при загрузке
cleanupOldRooms();
