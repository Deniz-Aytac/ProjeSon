import math

def gercek_dunya_mesafe(lat1, lon1, lat2, lon2):
    """
    İki GPS koordinatı arasındaki gerçek dünya mesafesini hesaplar.
    Haversine formülü kullanır.
    
    Parametreler:
    lat1, lon1: İlk noktanın enlem ve boylamı (derece cinsinden)
    lat2, lon2: İkinci noktanın enlem ve boylamı (derece cinsinden)
    
    Döndürür: Kilometre cinsinden mesafe
    """
    # Dünya'nın yarıçapı (kilometre)
    R = 6371.0
    
    # Dereceleri radyana çevir
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Koordinat farkları
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    # Haversine formülü
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    # Mesafe (kilometre)
    mesafe_km = R * c
    
    return mesafe_km

def koordinat_formatini_kontrol(koordinat_str):
    """
    Koordinat formatını kontrol eder ve derece cinsinden değere çevirir.
    Desteklenen formatlar:
    - 41.0082 (derece)
    - 41°00'29.5"N (derece, dakika, saniye)
    """
    try:
        # Eğer sadece sayı ise, derece olarak kabul et
        return float(koordinat_str)
    except ValueError:
        # Derece, dakika, saniye formatını kontrol et
        koordinat_str = koordinat_str.strip().upper()
        
        # N/S/E/W yönlerini kontrol et
        yon = 1
        if koordinat_str.endswith('S') or koordinat_str.endswith('W'):
            yon = -1
            koordinat_str = koordinat_str[:-1]
        elif koordinat_str.endswith('N') or koordinat_str.endswith('E'):
            koordinat_str = koordinat_str[:-1]
        
        # Derece, dakika, saniye formatını parse et
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
            
            # Dereceye çevir
            toplam_derece = derece + dakika/60 + saniye/3600
            return toplam_derece * yon
        
        return float(koordinat_str)

def main():
    print("=== Gerçek Dünya Mesafe Hesaplama Programı ===")
    print("Bu program iki GPS koordinatı arasındaki mesafeyi hesaplar.")
    print("Koordinatları aşağıdaki formatlardan birinde girebilirsiniz:")
    print("- 41.0082 (derece)")
    print("- 41°00'29.5\"N (derece, dakika, saniye)")
    print()
    
    print("İlk noktanın koordinatları:")
    try:
        lat1_str = input("Enlem (Latitude): ")
        lon1_str = input("Boylam (Longitude): ")
        
        lat1 = koordinat_formatini_kontrol(lat1_str)
        lon1 = koordinat_formatini_kontrol(lon1_str)
        
        print("\nİkinci noktanın koordinatları:")
        lat2_str = input("Enlem (Latitude): ")
        lon2_str = input("Boylam (Longitude): ")
        
        lat2 = koordinat_formatini_kontrol(lat2_str)
        lon2 = koordinat_formatini_kontrol(lon2_str)
        
        # Mesafeyi hesapla
        mesafe_km = gercek_dunya_mesafe(lat1, lon1, lat2, lon2)
        mesafe_mil = mesafe_km * 0.621371  # Kilometreyi mile çevir
        
        print(f"\n=== SONUÇ ===")
        print(f"Nokta 1: {lat1:.6f}°N, {lon1:.6f}°E")
        print(f"Nokta 2: {lat2:.6f}°N, {lon2:.6f}°E")
        print(f"Mesafe: {mesafe_km:.2f} km ({mesafe_mil:.2f} mil)")
        
        # Yaklaşık seyahat süreleri
        print(f"\n=== Yaklaşık Seyahat Süreleri ===")
        print(f"Araçla (60 km/saat): {mesafe_km/60:.1f} saat")
        print(f"Uçakla (800 km/saat): {mesafe_km/800:.1f} saat")
        
    except ValueError as e:
        print(f"Hata: Geçersiz koordinat formatı! {e}")
    except Exception as e:
        print(f"Beklenmeyen hata: {e}")

if __name__ == "__main__":
    main() 