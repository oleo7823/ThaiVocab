let vocabulary = [];
let currentLesson = null;

// 加载词典数据
function loadDictionary() {
    fetch('./data/Vocab.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('加载词典失败');
            }
            return response.text();
        })
        .then(data => {
            // 按行分割并过滤空行
            const rows = data.split('\n')
                .map(row => row.trim())
                .filter(row => row.length > 0);
                
            const headers = rows[0].split(',');
            vocabulary = [];
            
            for (let i = 1; i < rows.length; i++) {
                const values = rows[i].split(',');
                if (values.length === headers.length) {
                    const word = {};
                    headers.forEach((header, index) => {
                        word[header.trim()] = values[index]?.trim() || '';
                    });
                    vocabulary.push(word);
                }
            }
            
            initializeLessonList();
        })
        .catch(error => {
            console.error('加载词典出错:', error);
            alert('加载词典失败，请检查数据文件');
        });
}

// 初始化课程列表
function initializeLessonList() {
    const lessons = [...new Set(vocabulary.map(word => word.lesson))].sort();
    const lessonList = document.getElementById('lessonList');
    lessonList.innerHTML = '';
    
    lessons.forEach(lesson => {
        const button = document.createElement('button');
        button.className = 'lesson-button';
        button.textContent = lesson;
        button.onclick = () => showLessonWords(lesson);
        lessonList.appendChild(button);
    });
}

// 显示课程单词列表
function showLessonWords(lesson) {
    currentLesson = lesson;
    
    // 更新课程按钮状态
    document.querySelectorAll('.lesson-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === lesson) {
            btn.classList.add('active');
        }
    });
    
    // 显示该课程的单词列表
    const words = vocabulary.filter(word => word.lesson === lesson);
    const wordList = document.getElementById('wordList');
    wordList.innerHTML = '';
    
    words.forEach(word => {
        const div = document.createElement('div');
        div.className = 'word-item';
        div.textContent = word.thai;
        div.onclick = () => displayResults([word]);
        wordList.appendChild(div);
    });
}

// 搜索功能
function searchWord() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();
    const results = vocabulary.filter(word => 
        (word.thai || '').toLowerCase().includes(searchTerm) ||
        (word.trans_cn || '').toLowerCase().includes(searchTerm)
    );

    displayResults(results);
}

// 搜索建议功能
function showSearchSuggestions(searchTerm) {
    if (!searchTerm) {
        document.getElementById('searchSuggestions').style.display = 'none';
        return;
    }

    searchTerm = searchTerm.toLowerCase();
    const suggestions = vocabulary.filter(word => 
        (word.thai || '').toLowerCase().includes(searchTerm) ||
        (word.trans_cn || '').toLowerCase().includes(searchTerm)
    ).slice(0, 10);

    const suggestionsDiv = document.getElementById('searchSuggestions');
    suggestionsDiv.innerHTML = '';

    if (suggestions.length > 0) {
        suggestions.forEach(word => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                <span class="suggestion-thai">${word.thai}</span>
                <span class="suggestion-cn">${word.trans_cn}</span>
            `;
            div.onclick = () => {
                document.getElementById('searchInput').value = word.thai;
                displayResults([word]);
                suggestionsDiv.style.display = 'none';
            };
            suggestionsDiv.appendChild(div);
        });
        suggestionsDiv.style.display = 'block';
    } else {
        suggestionsDiv.style.display = 'none';
    }
}

// 显示结果
function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    results.forEach(word => {
        const wordCard = document.createElement('div');
        wordCard.className = 'word-card';

        const audioButton = word.sound ? 
            `<button class="audio-button" onclick="playAudio('${word.sound}')">播放音频</button>` : '';

        wordCard.innerHTML = `
            <div class="word-thai">${word.thai} ${word.pos ? `<span class="pos-tag">${word.pos}</span>` : ''} ${audioButton}</div>
            <div class="translations">
                <div>中文：${word.trans_cn || ''}</div>
                ${word.ipa ? `<div>国际音标：${word.ipa}</div>` : ''}
                ${word.ety ? `<div>词源：${word.ety}</div>` : ''}
            </div>
            ${word.sent ? `
                <div class="example-box">
                    <div>例句：</div>
                    <div class="thai-text">${word.sent}</div>
                    ${word.sent_cn ? `<div class="example-translations">中文：${word.sent_cn}</div>` : ''}
                </div>
            ` : ''}
        `;

        resultsDiv.appendChild(wordCard);
    });
}

// 播放音频
function playAudio(audioPath) {
    const audio = new Audio(audioPath);
    audio.play();
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    loadDictionary();
    
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');

    searchInput.addEventListener('input', (e) => {
        showSearchSuggestions(e.target.value);
    });

    // 点击页面其他地方时隐藏建议列表
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.style.display = 'none';
        }
    });

    document.getElementById('searchButton').addEventListener('click', searchWord);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchWord();
            searchSuggestions.style.display = 'none';
        }
    });
});
