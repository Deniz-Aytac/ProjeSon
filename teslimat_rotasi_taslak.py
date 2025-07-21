import math
from typing import List, Tuple

def gercek_dunya_mesafe(lat1, lon1, lat2, lon2):
    """
    İki GPS koordinatı arasındaki gerçek dünya mesafesini hesaplar.
    Haversine formülü kullanır.
    """
    R = 6371.0  # Dünya'nın yarıçapı (kilometre)
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

def en_yakin_nokta_bul(mevcut_lat, mevcut_lon, ziyaret_edilmeyen_noktalar):
    """
    Mevcut konumdan en yakın noktayı bulur.
    """
    en_yakin_mesafe = float('inf')
    en_yakin_nokta = None
    en_yakin_index = -1
    
    for i, (lat, lon, isim) in enumerate(ziyaret_edilmeyen_noktalar):
        mesafe = gercek_dunya_mesafe(mevcut_lat, mevcut_lon, lat, lon)
        if mesafe < en_yakin_mesafe:
            en_yakin_mesafe = mesafe
            en_yakin_nokta = (lat, lon, isim)
            en_yakin_index = i
    
    return en_yakin_nokta, en_yakin_mesafe, en_yakin_index

def teslimat_rotasi_olustur(baslangic_lat, baslangic_lon, varis_noktalari):
    """
    Nearest Neighbor algoritması ile teslimat rotası oluşturur.
    
    Parametreler:
    baslangic_lat, baslangic_lon: Başlangıç noktası koordinatları
    varis_noktalari: [(lat, lon, isim), ...] formatında varış noktaları
    
    Döndürür: (rota, toplam_mesafe, detaylar)
    """
    rota = []
    toplam_mesafe = 0
    detaylar = []
    
    # Başlangıç noktası
    mevcut_lat = baslangic_lat
    mevcut_lon = baslangic_lon
    mevcut_isim = "Başlangıç Noktası"
    
    # Ziyaret edilmeyen noktalar listesi
    ziyaret_edilmeyen = varis_noktalari.copy()
    
    rota.append((mevcut_lat, mevcut_lon, mevcut_isim))
    
    print(f"🚚 Teslimat rotası oluşturuluyor...")
    print(f"📍 Başlangıç: {mevcut_isim} ({mevcut_lat:.6f}, {mevcut_lon:.6f})")
    
    # Her nokta için en yakın noktayı bul ve git
    while ziyaret_edilmeyen:
        en_yakin_nokta, mesafe, index = en_yakin_nokta_bul(mevcut_lat, mevcut_lon, ziyaret_edilmeyen)
        
        if en_yakin_nokta:
            lat, lon, isim = en_yakin_nokta
            
            # Rotaya ekle
            rota.append((lat, lon, isim))
            toplam_mesafe += mesafe
            
            # Detayları kaydet
            detaylar.append({
                'from': mevcut_isim,
                'to': isim,
                'mesafe': mesafe,
                'koordinatlar': (lat, lon)
            })
            
            print(f"➡️  {mevcut_isim} → {isim}: {mesafe:.2f} km")
            
            # Mevcut konumu güncelle
            mevcut_lat, mevcut_lon, mevcut_isim = lat, lon, isim
            
            # Ziyaret edilen noktayı listeden çıkar
            ziyaret_edilmeyen.pop(index)
    
    return rota, toplam_mesafe, detaylar

def koordinat_formatini_kontrol(koordinat_str):
    """
    Koordinat formatını kontrol eder ve derece cinsinden değere çevirir.
    """
    try:
        return float(koordinat_str)
    except ValueError:
        koordinat_str = koordinat_str.strip().upper()
        
        yon = 1
        if koordinat_str.endswith('S') or koordinat_str.endswith('W'):
            yon = -1
            koordinat_str = koordinat_str[:-1]
        elif koordinat_str.endswith('N') or koordinat_str.endswith('E'):
            koordinat_str = koordinat_str[:-1]
        
        if '°' in koordinat_str:
            parts = koordinat_str.split('°')
            derece = float(parts[0])
            
            if len(parts) > 1 and parts[1]:
                dakika_part = parts[1]
                if "'" in dakika_part:
                    dakika_parts = dakika_part.split("'")
                    dakika = float(dakika_parts[0])
                    
                    if len(dakika_parts) > 1 and dakika_parts[1]:
                        saniye_part = dakika_parts[1].replace('"', '')
                        saniye = float(saniye_part)
                    else:
                        saniye = 0
                else:
                    dakika = float(dakika_part)
                    saniye = 0
            else:
                dakika = 0
                saniye = 0
            
            toplam_derece = derece + dakika/60 + saniye/3600
            return toplam_derece * yon
        
        return float(koordinat_str)

def main():
    print("=== Teslimat Rotası Oluşturma Programı ===")
    print("Nearest Neighbor algoritması ile en optimal teslimat rotası oluşturur.")
    print("Her adımda en yakın noktaya gider.\n")
    
    try:
        # Başlangıç noktası
        print("📍 BAŞLANGIÇ NOKTASI (A):")
        baslangic_lat = koordinat_formatini_kontrol(input("Enlem (Latitude): "))
        baslangic_lon = koordinat_formatini_kontrol(input("Boylam (Longitude): "))
        
        # Varış noktaları
        varis_noktalari = []
        nokta_sayisi = int(input("\nKaç tane varış noktası var? (B, C, D, ...): "))
        
        for i in range(nokta_sayisi):
            nokta_adi = chr(66 + i)  # B, C, D, ...
            print(f"\n📍 VARIŞ NOKTASI {nokta_adi}:")
            lat = koordinat_formatini_kontrol(input(f"Enlem (Latitude): "))
            lon = koordinat_formatini_kontrol(input(f"Boylam (Longitude): "))
            varis_noktalari.append((lat, lon, f"Nokta {nokta_adi}"))
        
        # Rotayı oluştur
        rota, toplam_mesafe, detaylar = teslimat_rotasi_olustur(
            baslangic_lat, baslangic_lon, varis_noktalari
        )
        
        # Sonuçları göster
        print(f"\n{'='*50}")
        print(f"🎯 OPTİMAL TESLİMAT ROTASI")
        print(f"{'='*50}")
        
        print(f"\n📋 ROTA SIRASI:")
        for i, (lat, lon, isim) in enumerate(rota):
            print(f"{i+1}. {isim} ({lat:.6f}, {lon:.6f})")
        
        print(f"\n📏 DETAYLI MESAFELER:")
        for detay in detaylar:
            print(f"   {detay['from']} → {detay['to']}: {detay['mesafe']:.2f} km")
        
        print(f"\n📊 ÖZET:")
        print(f"   Toplam Mesafe: {toplam_mesafe:.2f} km")
        print(f"   Toplam Mesafe: {toplam_mesafe * 0.621371:.2f} mil")
        print(f"   Ziyaret Edilen Nokta Sayısı: {len(rota) - 1}")
        
        # Yaklaşık süreler
        print(f"\n⏱️  YAKLAŞIK SÜRELER:")
        print(f"   Araçla (60 km/saat): {toplam_mesafe/60:.1f} saat")
        print(f"   Bisikletle (20 km/saat): {toplam_mesafe/20:.1f} saat")
        print(f"   Yürüyerek (5 km/saat): {toplam_mesafe/5:.1f} saat")
        
    except ValueError as e:
        print(f"❌ Hata: Geçersiz koordinat formatı! {e}")
    except Exception as e:
        print(f"❌ Beklenmeyen hata: {e}")

if __name__ == "__main__":
    main() 