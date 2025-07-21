# Gerçek Dünya Mesafe Hesaplama Programı

Bu program, iki GPS koordinatı arasındaki gerçek dünya mesafesini hesaplar.

## Özellikler

- **Haversine Formülü**: Dünya'nın küresel yapısını dikkate alan doğru mesafe hesaplama
- **Çoklu Format Desteği**: Farklı koordinat formatlarını destekler
- **Gerçek Dünya Uygulamaları**: GPS, harita, navigasyon için uygun
- **Seyahat Süreleri**: Farklı ulaşım araçları için yaklaşık süreler

## Desteklenen Koordinat Formatları

### 1. Derece Formatı (En Yaygın)
```
Enlem: 41.0082
Boylam: 28.9784
```

### 2. Derece, Dakika, Saniye Formatı
```
Enlem: 41°00'29.5"N
Boylam: 28°58'42.2"E
```

## Nasıl Kullanılır

1. Programı çalıştırın:
```bash
python gercek_dunya_mesafe.py
```

2. İlk noktanın koordinatlarını girin
3. İkinci noktanın koordinatlarını girin
4. Program otomatik olarak mesafeyi hesaplayacak

## Örnek Kullanım

### İstanbul - Ankara Arası
```
İlk nokta:
Enlem: 41.0082
Boylam: 28.9784

İkinci nokta:
Enlem: 39.9334
Boylam: 32.8597

Sonuç: ~350 km
```

### New York - Los Angeles Arası
```
İlk nokta:
Enlem: 40.7128
Boylam: -74.0060

İkinci nokta:
Enlem: 34.0522
Boylam: -118.2437

Sonuç: ~3935 km
```

## Kullanım Alanları

- **Seyahat Planlama**: İki şehir arası mesafe
- **GPS Navigasyon**: Rota hesaplama
- **Harita Uygulamaları**: Mesafe ölçümü
- **Lojistik**: Teslimat mesafeleri
- **Spor**: Koşu, bisiklet rotaları

## Teknik Detaylar

- **Algoritma**: Haversine Formülü
- **Dünya Yarıçapı**: 6,371 km
- **Hassasiyet**: ±0.5% (küresel yaklaşım)
- **Birim**: Kilometre ve Mil

## Koordinat Bulma

Koordinatları şu kaynaklardan bulabilirsiniz:
- Google Maps (sağ tık → "Burada ne var?")
- GPS cihazları
- Harita uygulamaları
- Wikipedia (şehir sayfalarında) 