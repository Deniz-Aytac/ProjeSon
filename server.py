from flask import Flask, request, jsonify
import sqlite3
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
DB_PATH = 'addresses.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Eski tabloyu sil ve yeni yapıyı oluştur
    c.execute('DROP TABLE IF EXISTS addresses')
    
    # Yeni tablo yapısı
    c.execute('''
        CREATE TABLE IF NOT EXISTS routes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_address TEXT,
            destination_addresses TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/save-route', methods=['POST'])
def save_route():
    data = request.get_json()
    start_address = data.get('start_address')
    destination_addresses = data.get('destination_addresses', [])
    
    if not start_address:
        return jsonify({'status': 'error', 'message': 'Başlangıç adresi eksik'}), 400
    
    # Varış adreslerini virgülle ayırarak tek bir string'e çevir
    dest_string = ', '.join(destination_addresses) if destination_addresses else ''
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('INSERT INTO routes (start_address, destination_addresses) VALUES (?, ?)', 
              (start_address, dest_string))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True) 