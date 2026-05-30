// Google Apps Script Canlı Dağıtım URL'niz tam entegre edilmiştir.
const SHEET_API_ENDPOINT = "https://script.google.com/macros/s/AKfycbwKQTloKizPHBG0UmsQRhLzyMZbykDmAns0LQuztDyR-KkLScS4FPZrdKJdPhgbGnloDQ/exec";

/**
 * Google Sheets verilerini JSON olarak çeken asenkron motor fonksiyon.
 * @returns {Promise<Array>} Lojistik kelime nesnelerinden oluşan dizi.
 */
async function getLogisticsCardsFromServer() {
    try {
        const response = await fetch(SHEET_API_ENDPOINT, {
            method: 'GET',
            redirect: 'follow'
        });
        
        if (!response.ok) {
            throw new Error(`Ağ hatası kodu: ${response.status}`);
        }
        
        const cardRecords = await response.json();
        return cardRecords;
    } catch (networkError) {
        console.error("Google Sheets bağlantısı başarısız oldu:", networkError);
        return [];
    }
}

