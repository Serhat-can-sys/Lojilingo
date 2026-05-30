// Google Apps Script'ten aldığın en güncel canlı yayın URL'si
const API_URL = "https://script.google.com/macros/s/AKfycbwKQTloKizPHBG0UmsQRhLzyMZbykDmAns0LQuztDyR-KkLScS4FPZrdKJdPhgbGnloDQ/exec";

async function apiCall(params) {
    const queryString = new URLSearchParams(params).toString();
    const fetchUrl = `${API_URL}?${queryString}`;
    
    try {
        const response = await fetch(fetchUrl);
        return await response.json();
    } catch (e) {
        console.error("API Hatası:", e);
        return { status: "error", message: "Sunucu bağlantı hatası oluştu." };
    }
}

// Uygulama içerisinden çağrılan merkezi API servisleri
const API = {
    login: (username, password) => apiCall({ action: 'login', username, password }),
    getCards: (username) => apiCall({ action: 'getCards', username }),
    saveSwipe: (username, word_id, direction) => apiCall({ action: 'swipe', username, word_id, direction })
};
