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

def tum_mesafeleri_hesapla(mevcut_lat, mevcut_lon, ziyaret_edilmeyen_noktalar):
    """
    Mevcut konumdan tüm ziyaret edilmeyen noktalara olan mesafeleri hesaplar.
    """
    mesafeler = []
    
    for i, (lat, lon, isim) in enumerate(ziyaret_edilmeyen_noktalar):
        mesafe = gercek_dunya_mesafe(mevcut_lat, mevcut_lon, lat, lon)
        mesafeler.append((i, lat, lon, isim, mesafe))
    
    # Mesafeye göre sırala (en yakından en uzağa)
    mesafeler.sort(key=lambda x: x[4])
    
    return mesafeler

def teslimat_rotasi_detayli(baslangic_lat, baslangic_lon, varis_noktalari):
    """
    Nearest Neighbor algoritması ile teslimat rotası oluşturur.
    Her adımda detaylı bilgi verir.
    """
    rota = []
    toplam_mesafe = 0
    detaylar = []
    mesafe_adim_listesi = []  # Her adımda tüm mesafeleri sakla
    mevcut_lat = baslangic_lat
    mevcut_lon = baslangic_lon
    mevcut_isim = "Başlangıç Noktası"
    ziyaret_edilmeyen = varis_noktalari.copy()
    rota.append((mevcut_lat, mevcut_lon, mevcut_isim))
    print(f"🚚 Teslimat rotası oluşturuluyor...")
    print(f"📍 Başlangıç: {mevcut_isim} ({mevcut_lat:.6f}, {mevcut_lon:.6f})")
    print(f"📦 Toplam {len(ziyaret_edilmeyen)} teslimat noktası var.\n")
    adim = 1
    while ziyaret_edilmeyen:
        print(f"🔄 ADIM {adim}: {mevcut_isim} konumundan en yakın noktayı arıyoruz...")
        mesafeler = tum_mesafeleri_hesapla(mevcut_lat, mevcut_lon, ziyaret_edilmeyen)
        print(f"📏 Mevcut konumdan tüm noktalara mesafeler:")
        adim_mesafeler = []
        for i, (index, lat, lon, isim, mesafe) in enumerate(mesafeler):
            if i == 0:
                print(f"   🎯 {isim}: {mesafe:.2f} km (EN YAKIN)")
            else:
                print(f"   📍 {isim}: {mesafe:.2f} km")
            adim_mesafeler.append((isim, mesafe))
        mesafe_adim_listesi.append({
            'adim': adim,
            'from': mevcut_isim,
            'mesafeler': adim_mesafeler
        })
        en_yakin_index, en_yakin_lat, en_yakin_lon, en_yakin_isim, en_yakin_mesafe = mesafeler[0]
        print(f"\n✅ Seçilen nokta: {en_yakin_isim} ({en_yakin_mesafe:.2f} km)")
        print(f"➡️  {mevcut_isim} → {en_yakin_isim}: {en_yakin_mesafe:.2f} km")
        rota.append((en_yakin_lat, en_yakin_lon, en_yakin_isim))
        toplam_mesafe += en_yakin_mesafe
        detaylar.append({
            'adim': adim,
            'from': mevcut_isim,
            'to': en_yakin_isim,
            'mesafe': en_yakin_mesafe,
            'koordinatlar': (en_yakin_lat, en_yakin_lon)
        })
        mevcut_lat, mevcut_lon, mevcut_isim = en_yakin_lat, en_yakin_lon, en_yakin_isim
        ziyaret_edilmeyen.pop(en_yakin_index)
        print(f"📍 Yeni konum: {mevcut_isim} ({mevcut_lat:.6f}, {mevcut_lon:.6f})")
        print(f"📦 Kalan teslimat noktası: {len(ziyaret_edilmeyen)}")
        print(f"📊 Toplam mesafe: {toplam_mesafe:.2f} km")
        print("-" * 60)
        adim += 1
    print(f"🎉 Tüm teslimatlar tamamlandı!")
    return rota, toplam_mesafe, detaylar, mesafe_adim_listesi

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
    print("=== Detaylı Teslimat Rotası Oluşturma Programı ===")
    print("Nearest Neighbor algoritması ile en optimal teslimat rotası oluşturur.")
    print("Her adımda en yakın noktayı bulur ve oraya gider.\n")
    
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
        
        print(f"\n{'='*70}")
        print(f"🚚 ALGORİTMA BAŞLIYOR")
        print(f"{'='*70}")
        
        # Rotayı oluştur
        rota, toplam_mesafe, detaylar, mesafe_adim_listesi = teslimat_rotasi_detayli(
            baslangic_lat, baslangic_lon, varis_noktalari
        )
        
        # Final sonuçları göster
        print(f"\n{'='*70}")
        print(f"🎯 FİNAL TESLİMAT ROTASI")
        print(f"{'='*70}")
        
        print(f"\n📋 ROTA SIRASI:")
        for i, (lat, lon, isim) in enumerate(rota):
            print(f"{i+1}. {isim} ({lat:.6f}, {lon:.6f})")
        
        print(f"\n📏 DETAYLI MESAFELER:")
        for detay in detaylar:
            print(f"   Adım {detay['adim']}: {detay['from']} → {detay['to']}: {detay['mesafe']:.2f} km")
        
        print(f"\n📏 HER ADIMDA TÜM NOKTALARIN MESAFELERİ:")
        for adim_detay in mesafe_adim_listesi:
            print(f"  Adım {adim_detay['adim']} ({adim_detay['from']}):")
            for isim, mesafe in adim_detay['mesafeler']:
                print(f"    - {isim}: {mesafe:.2f} km")
        
        print(f"\n📊 ÖZET:")
        print(f"   Toplam Mesafe: {toplam_mesafe:.2f} km")
        print(f"   Toplam Mesafe: {toplam_mesafe * 0.621371:.2f} mil")
        print(f"   Ziyaret Edilen Nokta Sayısı: {len(rota) - 1}")
        
        # Yaklaşık süreler
        print(f"\n⏱️  YAKLAŞIK SÜRELER:")
        print(f"   Araçla (60 km/saat): {toplam_mesafe/60:.1f} saat")
        
    except ValueError as e:
        print(f"❌ Hata: Geçersiz koordinat formatı! {e}")
    except Exception as e:
        print(f"❌ Beklenmeyen hata: {e}")

if __name__ == "__main__":
    main() 