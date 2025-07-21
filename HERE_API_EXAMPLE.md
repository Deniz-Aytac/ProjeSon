# HERE API Kullanım Örneği

## 1. API Anahtarı Alma

### Adım 1: HERE Developer Portal'a Gidin
```
https://developer.here.com/
```

### Adım 2: Hesap Oluşturun
- "Get Started" butonuna tıklayın
- E-posta adresinizle kayıt olun
- E-posta doğrulamasını tamamlayın

### Adım 3: Yeni Uygulama Oluşturun
- Dashboard'da "Create App" butonuna tıklayın
- Uygulama adı: "Teslimat Rotası Uygulaması"
- Platform: "Web" seçin
- "Create" butonuna tıklayın

### Adım 4: API Anahtarınızı Alın
- Oluşturulan uygulamaya tıklayın
- "Credentials" sekmesine gidin
- "API Key" değerini kopyalayın

## 2. Projeye Entegrasyon

### Adım 1: API Anahtarını Ekleyin
```javascript
// script.js dosyasında
const HERE_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
```

### Adım 2: Trafik Verisi Alma
```javascript
// İki nokta arası trafik verisi
const trafficData = await getHereTrafficData(41.0082, 28.9784, 39.9334, 32.8597);
console.log('Trafik seviyesi:', trafficData.trafficLevel);
console.log('Jam Factor:', trafficData.jamFactor);
```

### Adım 3: Rota Hesaplama
```javascript
// Trafik dahil rota hesaplama
const routeData = await getHereRoute(41.0082, 28.9784, 39.9334, 32.8597);
console.log('Mesafe:', routeData.distance, 'km');
console.log('Süre:', routeData.duration, 'dakika');
console.log('Trafik gecikmesi:', routeData.trafficDelay, 'dakika');
```

### Adım 4: Adres Geocoding
```javascript
// Adres koordinata çevirme
const coordinates = await hereGeocode('İstanbul, Türkiye');
console.log('Koordinatlar:', coordinates.lat, coordinates.lon);
console.log('Adres:', coordinates.address);
```

## 3. Tam Kullanım Örneği

```javascript
// HERE API ile tam rota hesaplama örneği
async function calculateRouteWithHereAPI(startAddress, endAddress) {
    try {
        // 1. Adresleri koordinata çevir
        const startCoords = await hereGeocode(startAddress);
        const endCoords = await hereGeocode(endAddress);
        
        if (!startCoords || !endCoords) {
            throw new Error('Adres bulunamadı');
        }
        
        // 2. Trafik verisi al
        const trafficData = await getHereTrafficData(
            startCoords.lat, startCoords.lon,
            endCoords.lat, endCoords.lon
        );
        
        // 3. Rota hesapla
        const routeData = await getHereRoute(
            startCoords.lat, startCoords.lon,
            endCoords.lat, endCoords.lon
        );
        
        // 4. Sonuçları birleştir
        return {
            start: startCoords,
            end: endCoords,
            distance: routeData.distance,
            duration: routeData.duration,
            trafficLevel: trafficData.trafficLevel,
            trafficDelay: routeData.trafficDelay,
            jamFactor: trafficData.jamFactor
        };
        
    } catch (error) {
        console.error('HERE API hatası:', error);
        return null;
    }
}

// Kullanım
const result = await calculateRouteWithHereAPI('İstanbul', 'Ankara');
if (result) {
    console.log('Rota sonucu:', result);
}
```

## 4. API Limitleri ve Maliyet

### Ücretsiz Plan
- **Aylık 250,000 istek**
- **Traffic API**: 250,000 istek/ay
- **Routing API**: 250,000 istek/ay
- **Geocoding API**: 250,000 istek/ay

### Ücretli Planlar
- **Pay As You Go**: $5/1M istek
- **Enterprise**: Özel fiyatlandırma

## 5. Hata Yönetimi

```javascript
// HERE API hata yönetimi örneği
async function safeHereAPICall(apiFunction, ...args) {
    try {
        const result = await apiFunction(...args);
        return result;
    } catch (error) {
        console.warn('HERE API hatası:', error.message);
        
        // Hata durumunda alternatif hesaplama
        if (apiFunction === getHereRoute) {
            return {
                distance: calculateBasicDistance(...args),
                duration: calculateBasicDuration(...args),
                trafficLevel: 'unknown',
                trafficDelay: 0
            };
        }
        
        return null;
    }
}
```

## 6. Performans Optimizasyonu

### Önbellekleme
```javascript
const hereCache = new Map();

async function cachedHereAPICall(apiFunction, ...args) {
    const cacheKey = `${apiFunction.name}_${JSON.stringify(args)}`;
    
    if (hereCache.has(cacheKey)) {
        const cached = hereCache.get(cacheKey);
        // 5 dakika geçerli
        if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
            return cached.data;
        }
    }
    
    const result = await apiFunction(...args);
    hereCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
    });
    
    return result;
}
```

## 7. Test Etme

### Test Senaryoları
1. **Farklı şehirler**: İstanbul-Ankara, İzmir-Bursa
2. **Farklı saatler**: Sabah, öğle, akşam trafiği
3. **Hata durumları**: Geçersiz adres, API hatası
4. **Performans**: Çoklu istek, önbellekleme

### Test Kodu
```javascript
// Test fonksiyonu
async function testHereAPI() {
    const testCases = [
        ['İstanbul', 'Ankara'],
        ['İzmir', 'Bursa'],
        ['Antalya', 'Adana']
    ];
    
    for (const [start, end] of testCases) {
        console.log(`Test: ${start} -> ${end}`);
        const result = await calculateRouteWithHereAPI(start, end);
        console.log('Sonuç:', result);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 saniye bekle
    }
}
```

## 8. Güvenlik

### API Anahtarı Güvenliği
```javascript
// Güvenli API anahtarı kullanımı
const HERE_API_KEY = process.env.HERE_API_KEY || 'YOUR_API_KEY';

// Rate limiting
const rateLimiter = {
    lastCall: 0,
    minInterval: 100, // ms
    
    async throttle() {
        const now = Date.now();
        const timeSinceLastCall = now - this.lastCall;
        
        if (timeSinceLastCall < this.minInterval) {
            await new Promise(resolve => 
                setTimeout(resolve, this.minInterval - timeSinceLastCall)
            );
        }
        
        this.lastCall = Date.now();
    }
};
```

Bu rehber ile HERE API'yi projenize başarıyla entegre edebilirsiniz! 🚀 