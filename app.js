// Uygulama Durum Yönetimi (State)
let globalCardPool = [];
let currentActiveIndex = 0;
let interactionInProgress = false;

// DOM Elementleri
const stackContainer = document.getElementById('card-container');
const themeSwitcher = document.getElementById('theme-toggle');

// Sistemi Başlat
async function runApplication() {
    globalCardPool = await getLogisticsCardsFromServer();
    if (globalCardPool.length > 0) {
        displayCardAtCurrentIndex();
    } else {
        document.getElementById('status-message').innerHTML = `
            <p style="color:#8c0d10; font-weight:700;">Veri yüklenemedi!</p>
            <p style="font-size:0.85rem; margin-top:5px;">Lütfen Apps Script izinlerini kontrol edin.</p>
        `;
    }
}

// Aktif İndesteki Kartı Ekrana Çizen Fonksiyon
function displayCardAtCurrentIndex() {
    if (currentActiveIndex >= globalCardPool.length) {
        stackContainer.innerHTML = `
            <div class="fallback-screen" style="animation: spin 0s; text-align:center; padding:20px;">
                <span style="font-size:3.5rem;">🎉</span>
                <h3 style="margin-top:10px; font-weight:900;">Tüm Kartları Bitirdiniz!</h3>
                <p style="font-size:0.9rem; color:var(--text-secondary); margin-top:6px;">Lojistik operasyon terimlerine tam hakimsiniz.</p>
                <button onclick="restartSession()" style="margin-top:20px; background:var(--color-orange); color:white; border:none; padding:10px 20px; border-radius:50px; font-weight:700;">Yeniden Başla</button>
            </div>
        `;
        return;
    }

    const item = globalCardPool[currentActiveIndex];
    stackContainer.innerHTML = `
        <div class="card" id="active-swipe-card">
            <div class="card-top">
                <span class="category-tag">${item.category || 'Genel'}</span>
                <span class="difficulty-tag">⚡ ${item.difficulty || 'Normal'}</span>
            </div>
            <div class="card-middle">
                <h1 class="word-title">${item.word}</h1>
                <p class="pronunciation-text">[ ${item.pronunciation || '...'} ]</p>
                <button class="audio-trigger-btn" onclick="triggerSpeechSynthesis('${item.word.replace(/'/g, "\\'")}')">
                    🔊 Dinle
                </button>
                <p class="meaning-text">${item.meaning}</p>
            </div>
            <div class="card-bottom">
                <h4 class="example-caption">Örnek Lojistik Cümlesi</h4>
                <p class="example-sentence">"${item.example_sentence || 'Örnek cümle bulunmuyor.'}"</p>
            </div>
        </div>
    `;

    bindMobileTouchMechanics();
}

// Tarayıcı Doğal Ses Sentezi Motoru (Web Speech API)
function triggerSpeechSynthesis(rawText) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Önceki sesleri kes
        const phrase = new SpeechSynthesisUtterance(rawText);
        phrase.lang = 'en-US';
        phrase.rate = 0.85; // Net anlaşılması için hafif yavaşlatılmış hız
        phrase.pitch = 1.0;
        window.speechSynthesis.speak(phrase);
    }
}

// Mobil Swipe Dokunmatik Mekaniği Yönetimi
function bindMobileTouchMechanics() {
    const targetCard = document.getElementById('active-swipe-card');
    if (!targetCard) return;

    let coordX = 0; let coordY = 0;
    let deltaX = 0; let deltaY = 0;

    targetCard.addEventListener('touchstart', (event) => {
        if (interactionInProgress) return;
        coordX = event.touches[0].clientX;
        coordY = event.touches[0].clientY;
        targetCard.style.transition = 'none';
    }, { passive: true });

    targetCard.addEventListener('touchmove', (event) => {
        if (interactionInProgress) return;
        deltaX = event.touches[0].clientX - coordX;
        deltaY = event.touches[0].clientY - coordY;

        // Kartı parmakla beraber hareket ettir (Premium Tinder Hissiyatı)
        const rotationAngle = deltaX / 15;
        targetCard.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) rotate(${rotationAngle}deg)`;
        
        // Sınır durumlarına göre görsel kenarlık renk geri bildirimi verilebilir
        if(deltaX > 40) targetCard.style.borderColor = 'var(--action-right)';
        else if(deltaX < -40) targetCard.style.borderColor = 'var(--action-left)';
        else if(deltaY < -40) targetCard.style.borderColor = 'var(--action-up)';
        else if(deltaY > 40) targetCard.style.borderColor = 'var(--action-down)';
        else targetCard.style.borderColor = 'rgba(255, 255, 255, 0.05)';
    }, { passive: true });

    targetCard.addEventListener('touchend', () => {
        if (interactionInProgress) return;
        
        const horizontalThreshold = 110;
        const verticalThreshold = 110;

        if (deltaX > horizontalThreshold) {
            executeSwipeAnimation('right');
        } else if (deltaX < -horizontalThreshold) {
            executeSwipeAnimation('left');
        } else if (deltaY < -verticalThreshold) {
            executeSwipeAnimation('up');
        } else if (deltaY > verticalThreshold) {
            executeSwipeAnimation('down');
        } else {
            // Eşik geçilemediyse kartı orijinal konumuna geri esnet
            targetCard.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.3s';
            targetCard.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
            targetCard.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            deltaX = 0; deltaY = 0;
        }
    });
}

// Butonlara Basıldığında Tetiklenen Swipe Arayüzü
function triggerSwipe(chosenDirection) {
    if (interactionInProgress) return;
    executeSwipeAnimation(chosenDirection);
}

// Kart Fırlatma ve Animasyon Motoru
function executeSwipeAnimation(vector) {
    const targetCard = document.getElementById('active-swipe-card');
    if (!targetCard) return;

    interactionInProgress = true;
    targetCard.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s';
    
    const viewportWidth = window.innerWidth * 1.3;
    const viewportHeight = window.innerHeight * 1.3;

    switch (vector) {
        case 'right':
            targetCard.style.transform = `translate3d(${viewportWidth}px, 0, 0) rotate(35deg)`;
            break;
        case 'left':
            targetCard.style.transform = `translate3d(-${viewportWidth}px, 0, 0) rotate(-35deg)`;
            break;
        case 'up':
            targetCard.style.transform = `translate3d(0, -${viewportHeight}px, 0)`;
            break;
        case 'down':
            targetCard.style.transform = `translate3d(0, ${viewportHeight}px, 0)`;
            break;
    }
    
    targetCard.style.opacity = '0';

    setTimeout(() => {
        currentActiveIndex++;
        interactionInProgress = false;
        displayCardAtCurrentIndex();
    }, 350);
}

// Sıfırlama Mekanizması
function restartSession() {
    currentActiveIndex = 0;
    displayCardAtCurrentIndex();
}

// Dark/Light Mode Geçiş Algoritması
themeSwitcher.onclick = () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        themeSwitcher.textContent = '🌙';
    } else {
        themeSwitcher.textContent = '☀️';
    }
};

// Uygulamayı Boot Et
runApplication();

