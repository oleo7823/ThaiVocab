let vocabulary = [];
let currentLesson = null;

// 加载词典数据
// 修改数据加载和处理
function loadDictionary() {
    fetch('./data/Vocab.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('加载词典失败');
            }
            return response.text();
        })
        .then(data => {
            console.log('原始数据:', data); // 调试用
            
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
            
            console.log('处理后的数据:', vocabulary); // 调试用
            initializeLessonList();
        })
        .catch(error => {
            console.error('加载词典出错:', error);
            alert('加载词典失败，请检查数据文件');
        });
}

// 修改课程列表初始化
function initializeLessonList() {
    const lessons = [...new Set(vocabulary.map(word => word.lesson))].sort();
    const lessonList = document.getElementById('lessonList');
    lessonList.innerHTML = ''; // 清空现有内容
    
    console.log('可用课程:', lessons); // 调试用
    
    lessons.forEach(lesson => {
        const button = document.createElement('button');
        button.className = 'lesson-button';
        button.textContent = lesson;
        button.onclick = () => showLessonWords(lesson);
        lessonList.appendChild(button);
    });
}

// 修改单词列表显示
function showLessonWords(lesson) {
    console.log('显示课程:', lesson); // 调试用
    
    const words = vocabulary.filter(word => word.lesson === lesson);
    console.log('该课程单词:', words); // 调试用
    
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

// 修改搜索建议显示
function showSearchSuggestions(searchTerm) {
    if (!searchTerm) {
        document.getElementById('searchSuggestions').style.display = 'none';
        return;
    }

    searchTerm = searchTerm.toLowerCase();
    const suggestions = vocabulary.filter(word => 
        word.thai.toLowerCase().includes(searchTerm) ||
        word.trans_cn.toLowerCase().includes(searchTerm)
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
        div.textContent = word.word;
        div.onclick = () => displayResults([word]);
        wordList.appendChild(div);
    });
}

// 搜索功能
function searchWord() {
    const searchTerm = searchInput.value.toLowerCase();
    const results = vocabulary.filter(word => 
        (word.word || '').toLowerCase().includes(searchTerm) ||
        (word.trans_cn || '').toLowerCase().includes(searchTerm) ||
        (word.trans_en || '').toLowerCase().includes(searchTerm) ||
        (word.trans_ja || '').toLowerCase().includes(searchTerm) ||
        (word.trans_fr || '').toLowerCase().includes(searchTerm)
    );

    displayResults(results);
}

// 显示结果
// 在 displayResults 函数中修改显示文本
function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    results.forEach(word => {
        const wordCard = document.createElement('div');
        wordCard.className = 'word-card';

        const audioButton = word.sound ? 
            `<button class="audio-button" onclick="playAudio('${word.sound}')">播放音频</button>` : '';

        wordCard.innerHTML = `
            <div class="word-thai">${word.thai} ${audioButton}</div>
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
// 添加搜索建议功能
function showSearchSuggestions(searchTerm) {
    if (!searchTerm) {
        document.getElementById('searchSuggestions').style.display = 'none';
        return;
    }

    const suggestions = vocabulary.filter(word => 
        word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.trans_cn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.trans_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.trans_ja.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.trans_fr.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);

    const suggestionsDiv = document.getElementById('searchSuggestions');
    suggestionsDiv.innerHTML = '';

    if (suggestions.length > 0) {
        suggestions.forEach(word => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                <span class="suggestion-tibetan">${word.word}</span>
                <div class="suggestion-translations">
                    <div class="suggestion-left">
                        <span class="suggestion-cn">${word.trans_cn || ''}</span>
                        <span class="suggestion-en">${word.trans_en || ''}</span>
                    </div>
                    <div class="suggestion-right">
                        <span class="suggestion-ja">${word.trans_ja || ''}</span>
                        <span class="suggestion-fr">${word.trans_fr || ''}</span>
                    </div>
                </div>
            `;
            div.onclick = () => {
                document.getElementById('searchInput').value = word.word;
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

// 修改事件监听部分
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