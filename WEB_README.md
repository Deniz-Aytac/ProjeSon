# Teslimat Rotası Hesaplama Web Sitesi

Modern ve kullanıcı dostu web arayüzü ile teslimat rotası hesaplama uygulaması.

## 🚀 Özellikler

- **Modern Web Arayüzü**: Responsive tasarım
- **Nearest Neighbor Algoritması**: En optimal rota hesaplama
- **Gerçek Zamanlı Hesaplama**: Anında sonuçlar
- **Detaylı Raporlama**: Her adımda tüm mesafeler
- **Sonuç İndirme**: PDF formatında rapor
- **Mobil Uyumlu**: Tüm cihazlarda çalışır

## 📁 Dosya Yapısı

```
├── index.html          # Ana HTML dosyası
├── style.css           # CSS stilleri
├── script.js           # JavaScript kodu
└── WEB_README.md       # Bu dosya
```

## 🌐 Nasıl Kullanılır

### 1. Web Sitesini Açın
```bash
# Dosyaları bir web sunucusunda barındırın veya
# Doğrudan index.html dosyasını tarayıcıda açın
```

### 2. Başlangıç Noktasını Girin
- Enlem (Latitude) koordinatını girin
- Boylam (Longitude) koordinatını girin

### 3. Varış Noktalarını Ekleyin
- "Nokta Ekle" butonuna tıklayın
- Her nokta için koordinatları girin
- İstediğiniz kadar nokta ekleyebilirsiniz

### 4. Rotayı Hesaplayın
- "Rotayı Hesapla" butonuna tıklayın
- Sonuçlar anında görüntülenecek

## 🎯 Algoritma

### Nearest Neighbor (En Yakın Komşu)
1. **Başlangıç noktasından başla**
2. **En yakın noktayı bul**
3. **O noktaya git**
4. **Yeni konumdan tekrar hesapla**
5. **Tüm noktalar ziyaret edilene kadar devam et**

## 📊 Sonuçlar

### Rota Özeti
- Toplam mesafe (km ve mil)
- Ziyaret edilen nokta sayısı

### Süre Tahminleri
- Araçla seyahat süresi
- Uçakla seyahat süresi

### Detaylı Bilgiler
- Rota sırası
- Her adımın mesafesi
- Her adımda tüm noktalara olan mesafeler

## 🛠️ Teknik Detaylar

### Kullanılan Teknolojiler
- **HTML5**: Yapı
- **CSS3**: Stil ve animasyonlar
- **JavaScript (ES6+)**: Algoritma ve etkileşim
- **Haversine Formülü**: Mesafe hesaplama

### Algoritma Karmaşıklığı
- **Zaman**: O(n²)
- **Uzay**: O(n)

### Desteklenen Tarayıcılar
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📱 Mobil Uyumluluk

Web sitesi tamamen responsive tasarıma sahiptir:
- **Masaüstü**: İki sütunlu layout
- **Tablet**: Uyarlanabilir grid
- **Mobil**: Tek sütunlu layout

## 🎨 Tasarım Özellikleri

### Renk Paleti
- **Ana Renk**: #667eea (Mavi)
- **Başarı**: #48bb78 (Yeşil)
- **Arka Plan**: Gradient (Mavi-Mor)
- **Metin**: #4a5568 (Koyu Gri)

### Animasyonlar
- Hover efektleri
- Loading spinner
- Smooth scroll
- Button transitions

## 📈 Kullanım Örnekleri

### Örnek 1: İstanbul'dan Teslimat
```
Başlangıç: İstanbul (41.0082, 28.9784)
Nokta B: Ankara (39.9334, 32.8597)
Nokta C: İzmir (38.4192, 27.1287)
```

### Örnek 2: Çoklu Nokta Teslimatı
```
Başlangıç: Merkez Depo
Nokta B: Müşteri 1
Nokta C: Müşteri 2
Nokta D: Müşteri 3
Nokta E: Müşteri 4
```

## 🔧 Geliştirme

### Yeni Özellik Ekleme
1. HTML'de yeni element ekleyin
2. CSS'de stilleri tanımlayın
3. JavaScript'te fonksiyonaliteyi ekleyin

### Algoritma Değişikliği
`script.js` dosyasındaki `calculateNearestNeighborRoute` fonksiyonunu düzenleyin.

## 📄 Lisans

Bu proje açık kaynak kodludur ve eğitim amaçlı kullanılabilir.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin

---

**Not**: Bu web uygulaması, Python versiyonunun tam bir web portudur ve aynı algoritma mantığını kullanır. 