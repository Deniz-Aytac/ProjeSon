# Koordinat Mesafe Hesaplama Programı

Bu program, iki koordinat noktası arasındaki mesafeyi hesaplar.

## Özellikler

- **2D Koordinat Sistemi**: (x, y) koordinatları için mesafe hesaplama
- **3D Koordinat Sistemi**: (x, y, z) koordinatları için mesafe hesaplama
- Euclidean distance formülü kullanır
- Kullanıcı dostu arayüz

## Nasıl Çalıştırılır

1. Python'un bilgisayarınızda kurulu olduğundan emin olun
2. Terminal veya komut istemcisini açın
3. Program dosyasının bulunduğu dizine gidin
4. Aşağıdaki komutu çalıştırın:

```bash
python mesafe_hesaplama.py
```

## Kullanım

1. Program başladığında 2D veya 3D koordinat sistemi seçin
2. İlk noktanın koordinatlarını girin
3. İkinci noktanın koordinatlarını girin
4. Program otomatik olarak mesafeyi hesaplayıp sonucu gösterecek

## Örnek Kullanım

### 2D Örneği:
- Nokta 1: (3, 4)
- Nokta 2: (6, 8)
- Sonuç: 5.0000 birim

### 3D Örneği:
- Nokta 1: (1, 2, 3)
- Nokta 2: (4, 6, 9)
- Sonuç: 7.8102 birim

## Formül

- **2D**: √((x₂-x₁)² + (y₂-y₁)²)
- **3D**: √((x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²) 