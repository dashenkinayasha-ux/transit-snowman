// --- КОНСТАНТЫ И НАСТРОЙКИ ---
const STORAGE_KEY = 'christmas_tree_word_cloud_words';
// Набор нецензурных слов для простого примера. ДОПОЛНИТЕ этот список!
const PROFANITY_WORDS = ['плохое', 'слово', 'мат', 'ругательство', 'f*ck', 'sh*t', 'блин']; 

/**
 * Загружает слова из LocalStorage
 */
function loadWords() {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
}

/**
 * Сохраняет слова в LocalStorage
 */
function saveWords(words) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

/**
 * Проверяет слово на нецензурную лексику.
 */
function isProfane(word) {
    const cleanWord = word.toLowerCase();
    // Проверяем, содержится ли слово в списке нецензурных
    return PROFANITY_WORDS.some(profane => cleanWord.includes(profane));
}

/**
 * Добавляет слово в массив и сохраняет.
 */
function addWord(word) {
    let words = loadWords();
    
    if (isProfane(word)) {
        alert('Это слово не подходит! Попробуйте другое. 🚫');
        return; 
    }
    
    // Добавление слова, если его еще нет
    if (!words.includes(word)) {
        words.push(word);
        saveWords(words);
        drawWordCloud();
        return true;
    } else {
        alert('Это слово уже есть! Попробуйте другое. ❄️');
        return false;
    }
}

/**
 * Удаляет слово из массива и сохраняет.
 */
function removeWord(word) {
    let words = loadWords();
    const newWords = words.filter(w => w !== word);
    saveWords(newWords);
    
    if (document.getElementById('word-list-editor')) {
        renderEditorList(newWords);
    }
    drawWordCloud();
}

/**
 * Преобразует массив слов в формат [['слово', вес], ...]
 */
function processWordsForCloud(words) {
    // Случайный вес от 4 до 10 для разнообразия размеров
    return words.map(word => [word, 4 + Math.random() * 6]);
}

/**
 * Отрисовывает облако слов в форме елки.
 */
function drawWordCloud() {
    const canvas = document.getElementById('word-cloud-canvas');
    if (!canvas) return; 
    
    const words = loadWords();
    const list = processWordsForCloud(words);
    
    // Очистка предыдущего облака
    WordCloud(canvas, { clearCanvas: true });

    // --- НАСТРОЙКА ФОРМЫ ЁЛКИ ---
    
    // 1. Попытка использовать PNG-маску (наиболее точная ёлка)
    const image = new Image();
    // Вам нужно сохранить файл 'elka_mask.png' (черная елка на прозрачном фоне)
    image.src = 'elka_mask.png'; 
    
    image.onload = function() {
        // Отрисовка с использованием PNG-маски
        WordCloud(canvas, {
            list: list,
            gridSize: 7, 
            weightFactor: 8,
            fontFamily: 'Comfortaa',
            color: '#BEE3DB', // Цвет слов (снег)
            backgroundColor: 'rgba(0,0,0,0)',
            rotateRatio: 0,
            mask: image, // Используем загруженное изображение как маску
            width: canvas.width,
            height: canvas.height
        });
    };
    
    image.onerror = function() {
        console.warn("Маска 'elka_mask.png' не найдена. Используется встроенная форма 'star' (звезда).");
        // 2. Альтернатива: Встроенная форма 'star' (звезда)
        WordCloud(canvas, {
            list: list,
            gridSize: 7, 
            weightFactor: 8,
            fontFamily: 'Comfortaa',
            color: '#BEE3DB',
            backgroundColor: 'rgba(0,0,0,0)',
            rotateRatio: 0,
            shape: 'star', // Форма звезды
            width: canvas.width,
            height: canvas.height
        });
    };
    // ----------------------------
}

// --- ЛОГИКА ДЛЯ index.html (ВВОД СЛОВ) ---
const wordForm = document.getElementById('word-form');
if (wordForm) {
    wordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const wordInput = document.getElementById('word-input');
        const word = wordInput.value.trim();
        
        if (word) {
            if (addWord(word)) {
                wordInput.value = '';
            }
        }
    });
    
    drawWordCloud(); // Запуск облака при загрузке страницы
}

// --- ЛОГИКА ДЛЯ editor.html (РЕДАКТОР) ---

/**
 * Отрисовывает список слов для редактирования.
 */
function renderEditorList(words) {
    const listElement = document.getElementById('word-list-editor');
    if (!listElement) return;

    listElement.innerHTML = '';
    
    words.forEach(word => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${word}</span>
            <button data-word="${word}">Удалить</button>
        `;
        listElement.appendChild(li);
    });

    // Добавление обработчиков удаления
    listElement.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            const wordToRemove = this.getAttribute('data-word');
            if (confirm(`Удалить слово "${wordToRemove}"?`)) {
                removeWord(wordToRemove);
            }
        });
    });
}

const editorList = document.getElementById('word-list-editor');
if (editorList) {
    const initialWords = loadWords();
    renderEditorList(initialWords);
}
