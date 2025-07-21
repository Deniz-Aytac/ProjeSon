import math

def mesafe_hesapla_2d(x1, y1, x2, y2):
    """
    2D koordinat sisteminde iki nokta arasındaki mesafeyi hesaplar.
    Euclidean distance formülü kullanır: √((x2-x1)² + (y2-y1)²)
    """
    return math.sqrt((x2 - x1)**2 + (y2 - y1)**2)

def mesafe_hesapla_3d(x1, y1, z1, x2, y2, z2):
    """
    3D koordinat sisteminde iki nokta arasındaki mesafeyi hesaplar.
    Euclidean distance formülü kullanır: √((x2-x1)² + (y2-y1)² + (z2-z1)²)
    """
    return math.sqrt((x2 - x1)**2 + (y2 - y1)**2 + (z2 - z1)**2)

def main():
    print("=== Koordinat Mesafe Hesaplama Programı ===")
    print("1. 2D koordinat (x, y)")
    print("2. 3D koordinat (x, y, z)")
    
    secim = input("Hangi koordinat sistemini kullanmak istiyorsunuz? (1/2): ")
    
    if secim == "1":
        print("\n2D koordinat sistemi seçildi.")
        print("İlk noktanın koordinatlarını girin:")
        x1 = float(input("x1: "))
        y1 = float(input("y1: "))
        
        print("İkinci noktanın koordinatlarını girin:")
        x2 = float(input("x2: "))
        y2 = float(input("y2: "))
        
        mesafe = mesafe_hesapla_2d(x1, y1, x2, y2)
        print(f"\nSonuç:")
        print(f"Nokta 1: ({x1}, {y1})")
        print(f"Nokta 2: ({x2}, {y2})")
        print(f"Mesafe: {mesafe:.4f} birim")
        
    elif secim == "2":
        print("\n3D koordinat sistemi seçildi.")
        print("İlk noktanın koordinatlarını girin:")
        x1 = float(input("x1: "))
        y1 = float(input("y1: "))
        z1 = float(input("z1: "))
        
        print("İkinci noktanın koordinatlarını girin:")
        x2 = float(input("x2: "))
        y2 = float(input("y2: "))
        z2 = float(input("z2: "))
        
        mesafe = mesafe_hesapla_3d(x1, y1, z1, x2, y2, z2)
        print(f"\nSonuç:")
        print(f"Nokta 1: ({x1}, {y1}, {z1})")
        print(f"Nokta 2: ({x2}, {y2}, {z2})")
        print(f"Mesafe: {mesafe:.4f} birim")
        
    else:
        print("Geçersiz seçim! Lütfen 1 veya 2 girin.")

if __name__ == "__main__":
    main() 