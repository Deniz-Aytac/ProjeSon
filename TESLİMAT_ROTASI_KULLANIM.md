# Teslimat Rotası Oluşturma Programı

Bu program, **Nearest Neighbor (En Yakın Komşu)** algoritması kullanarak optimal teslimat rotası oluşturur.

## 🎯 Algoritma Nasıl Çalışır

1. **Başlangıç noktasından başla** (A noktası)
2. **En yakın noktayı bul** (B veya C'den hangisi daha yakınsa)
3. **O noktaya git** ve teslimatı yap
4. **Kalan noktalardan en yakın olanı bul**
5. **Tüm noktalar ziyaret edilene kadar devam et**

## 🚀 Kullanım

```bash
python teslimat_rotasi.py
```

## 📍 Örnek Senaryo

### Giriş Verileri:
- **A (Başlangıç)**: İstanbul - `41.0082, 28.9784`
- **B (Varış 1)**: Ankara - `39.9334, 32.8597`
- **C (Varış 2)**: İzmir - `38.4192, 27.1287`

### Algoritma Çalışması:
1. **A → C**: İstanbul'dan İzmir'e (daha yakın)
2. **C → B**: İzmir'den Ankara'ya
3. **Toplam Rota**: A → C → B

## 📊 Çıktı Örneği

```
=== Teslimat Rotası Oluşturma Programı ===
Nearest Neighbor algoritması ile en optimal teslimat rotası oluşturur.
Her adımda en yakın noktaya gider.

📍 BAŞLANGIÇ NOKTASI (A):
Enlem (Latitude): 41.0082
Boylam (Longitude): 28.9784

Kaç tane varış noktası var? (B, C, D, ...): 2

📍 VARIŞ NOKTASI B:
Enlem (Latitude): 39.9334
Boylam (Longitude): 32.8597

📍 VARIŞ NOKTASI C:
Enlem (Latitude): 38.4192
Boylam (Longitude): 27.1287

🚚 Teslimat rotası oluşturuluyor...
📍 Başlangıç: Başlangıç Noktası (41.008200, 28.978400)
➡️  Başlangıç Noktası → Nokta C: 325.45 km
➡️  Nokta C → Nokta B: 450.23 km

==================================================
🎯 OPTİMAL TESLİMAT ROTASI
==================================================

📋 ROTA SIRASI:
1. Başlangıç Noktası (41.008200, 28.978400)
2. Nokta C (38.419200, 27.128700)
3. Nokta B (39.933400, 32.859700)

📏 DETAYLI MESAFELER:
   Başlangıç Noktası → Nokta C: 325.45 km
   Nokta C → Nokta B: 450.23 km

📊 ÖZET:
   Toplam Mesafe: 775.68 km
   Toplam Mesafe: 481.98 mil
   Ziyaret Edilen Nokta Sayısı: 2

⏱️  YAKLAŞIK SÜRELER:
   Araçla (60 km/saat): 12.9 saat
   Bisikletle (20 km/saat): 38.8 saat
   Yürüyerek (5 km/saat): 155.1 saat
```

## 🔧 Algoritma Avantajları

### ✅ Artıları:
- **Hızlı hesaplama**: O(n²) karmaşıklık
- **Basit uygulama**: Anlaşılır algoritma
- **Gerçek zamanlı**: Anında sonuç
- **Pratik**: Teslimat şirketleri tarafından kullanılır

### ⚠️ Eksileri:
- **Optimal değil**: Her zaman en kısa rotayı bulmaz
- **Yerel optimum**: Bazen daha iyi rotalar kaçırılabilir

## 🎯 Kullanım Alanları

- **Teslimat şirketleri**: Paket dağıtımı
- **Pizza/kurye servisleri**: Sipariş teslimatı
- **Posta servisleri**: Mektup dağıtımı
- **Lojistik firmaları**: Kargo teslimatı
- **Servis teknisyenleri**: Bakım ziyaretleri

## 📱 Gerçek Dünya Uygulamaları

- **Amazon**: Teslimat rotaları
- **Uber Eats**: Yemek teslimatı
- **DHL/FedEx**: Kargo dağıtımı
- **Google Maps**: Rota optimizasyonu
- **Tesla**: Otonom araç rotaları

## 🔍 Algoritma Detayları

### Nearest Neighbor Algoritması:
```
1. Başlangıç noktasını seç
2. Ziyaret edilmeyen noktalar arasından en yakın olanı bul
3. O noktaya git ve ziyaret edildi olarak işaretle
4. Tüm noktalar ziyaret edilene kadar 2-3 adımlarını tekrarla
```

### Zaman Karmaşıklığı: O(n²)
### Uzay Karmaşıklığı: O(n)

Bu algoritma, gerçek dünya teslimat problemlerinde yaygın olarak kullanılır ve pratik sonuçlar verir! 🚚 