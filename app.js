let currentUser = "";
let cardsPool = [];
let currentIndex = 0;
let isAnimating = false;

// --- GİRİŞ SİSTEMİ ---
async function attemptLogin() {
    const userInp = document.getElementById('username').value.trim();
    const passInp = document.getElementById('password').value.trim();
    const errorTxt = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');

    if (!userInp || !passInp) {
        errorTxt.textContent = "Kullanıcı adı ve şifre boş bırakılamaz.";
        return;
    }

    btn.textContent = "Bağlanıyor...";
    errorTxt.textContent = "";

    const res = await API.login(userInp, passInp);

    if (res.status === "success") {
        currentUser = userInp;
        document.getElementById('display-user').textContent = currentUser;
        
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('app-screen').classList.add('active');
        
        loadCards();
    } else {
        errorTxt.textContent = res.message;
        btn.textContent = "Sisteme Giriş Yap";
    }
}

// --- VERİ YÜKLEME ---
async function loadCards() {
    const res = await API.getCards(currentUser);
    if (res.status === "success") {
        cardsPool = res.data;
        currentIndex = 0;
        renderCard();
    }
}

function renderCard() {
    const container = document.getElementById('card-container');
    
    if (currentIndex >= cardsPool.length) {
        container.innerHTML = `
            <div style="text-align:center; padding: 20px;">
                <h2 style="color:var(--primary-orange);">Tebrikler!</h2>
                <p style="margin-top:10px; color:var(--text-muted);">Öğrenilecek yeni kelime kalmadı.</p>
            </div>`;
        return;
    }

    const item = cardsPool[currentIndex];
    container.innerHTML = `
        <div class="card" id="active-card">
            <div>
                <span class="category-tag">${item.category || 'Genel'}</span>
                <h1 class="word-title">${item.word}</h1>
                <p class="pronunciation-text">[ ${item.pronunciation || ''} ]</p>
                <div class="meaning-text">${item.meaning}</div>
            </div>
            <div class="example-sentence">"${item.example_sentence}"</div>
        </div>
    `;
    
    setupTouch();
}

// --- SWIPE MEKANİĞİ ---
function setupTouch() {
    const card = document.getElementById('active-card');
    if (!card) return;

    let startX = 0, startY = 0, currentX = 0, currentY = 0;

    card.addEventListener('touchstart', e => {
        if (isAnimating) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        card.style.transition = 'none';
    }, {passive: true});

    card.addEventListener('touchmove', e => {
        if (isAnimating) return;
        currentX = e.touches[0].clientX - startX;
        currentY = e.touches[0].clientY - startY;
        const rotate = currentX / 15;
        card.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotate}deg)`;
    }, {passive: true});

    card.addEventListener('touchend', () => {
        if (isAnimating) return;
        if (Math.abs(currentX) > 100) {
            triggerSwipe(currentX > 0 ? 'right' : 'left');
        } else if (Math.abs(currentY) > 100) {
            triggerSwipe(currentY > 0 ? 'down' : 'up');
        } else {
            card.style.transition = 'transform 0.3s ease';
            card.style.transform = 'translate(0px, 0px) rotate(0deg)';
        }
    });
}

function triggerSwipe(direction) {
    if (isAnimating) return;
    const card = document.getElementById('active-card');
    if (!card) return;

    isAnimating = true;
    const item = cardsPool[currentIndex];
    
    API.saveSwipe(currentUser, item.id, direction);

    const x = direction === 'right' ? 1000 : direction === 'left' ? -1000 : 0;
    const y = direction === 'down' ? 1000 : direction === 'up' ? -1000 : 0;
    
    card.style.transition = 'transform 0.4s ease, opacity 0.3s';
    card.style.transform = `translate(${x}px, ${y}px) rotate(${x/10}deg)`;
    card.style.opacity = '0';

    setTimeout(() => {
        currentIndex++;
        isAnimating = false;
        renderCard();
    }, 350);
}
