let hereMap;
let herePlatform;
let hereDefaultLayers;
let trafficLayer = null;
let startMarker = null;
let destinationMarkers = [];
let isStartSelected = false;
let hereUi = null;
let destinationCounter = 0;

const HERE_API_KEY = 'JB16qeqlQX_t6BzHcFBJWgxuGm9Pbvk-qBlpRC6IpAU';

// FontAwesome marker icon generator
function createDomIcon(html, className = '') {
    const dom = document.createElement('div');
    dom.innerHTML = html;
    dom.className = className;
    return new H.map.DomIcon(dom);
}

function getTruckIcon() {
    return createDomIcon('<i class="fas fa-truck" style="color:#e74c3c;font-size:28px;"></i>', 'start-marker');
}

function getHouseIcon() {
    return createDomIcon('<i class="fas fa-house" style="color:#27ae60;font-size:24px;"></i>', 'destination-marker');
}

function fillStartInputs(lat, lon) {
    const latInput = document.getElementById('startLat');
    const lonInput = document.getElementById('startLon');
    if (latInput && lonInput) {
        latInput.value = lat.toFixed(6);
        lonInput.value = lon.toFixed(6);
    }
}

// Benzersiz id üretici
function generateUniqueId() {
    const id = 'id_' + Math.random().toString(36).substr(2, 9);
    console.log('[ID ÜRETİLDİ]', id);
    return id;
}

// Yeni varış noktası input satırı oluşturur ve #destinations'a ekler
function addDestinationInput(lat = '', lon = '', forcedId = null, address = '') {
    destinationCounter++;
    const destId = String.fromCharCode(65 + destinationCounter); // B, C, D...
    const uniqueId = forcedId || generateUniqueId();
    console.log('[INPUT EKLENİYOR] markerId:', uniqueId);
    const destinationsDiv = document.getElementById('destinations');
    const wrapper = document.createElement('div');
    wrapper.className = 'destination-item';
    wrapper.setAttribute('data-marker-id', uniqueId);
    wrapper.innerHTML = `
        <div class="destination-inputs">
            <div class="input-group">
                <label for="lat${destId}">Enlem (Latitude):</label>
                <input type="number" id="lat${destId}" step="any" value="${lat}" placeholder="">
            </div>
            <div class="input-group">
                <label for="lon${destId}">Boylam (Longitude):</label>
                <input type="number" id="lon${destId}" step="any" value="${lon}" placeholder="">
            </div>
            <div class="input-group">
                <label for="address${destId}">Adres:</label>
                <input type="text" id="address${destId}" value="${address}" placeholder="Adres girin...">
                <button type="button" class="geocode-dest-btn" data-marker-id="${uniqueId}" style="margin-left:6px;">Koordinata Çevir</button>
            </div>
        </div>
        <button type="button" class="remove-destination-map" title="Tablo ve Haritadan Sil" style="margin-left:8px; background:#fed7d7; color:#c53030; border-radius:50%; width:30px; height:30px;">🗑️</button>
    `;
    // Hem inputu hem marker/balonu silen çöp kutusu
    wrapper.querySelector('.remove-destination-map').onclick = function () {
        const markerId = wrapper.getAttribute('data-marker-id');
        removeMarkerAndBubbleById(markerId);
        destinationsDiv.removeChild(wrapper);
    };
    destinationsDiv.appendChild(wrapper);

    // Adresten koordinata çevirme butonu event handler
    const geocodeBtn = wrapper.querySelector('.geocode-dest-btn');
    if (geocodeBtn) {
        geocodeBtn.addEventListener('click', async function () {
            const markerId = this.getAttribute('data-marker-id');
            const addressInput = wrapper.querySelector(`#address${destId}`);
            if (!addressInput || !addressInput.value) {
                alert('Lütfen bir adres girin.');
                return;
            }
            try {
                const { lat, lng } = await geocodeAddress(addressInput.value);
                // Inputları doldur
                wrapper.querySelector(`#lat${destId}`).value = lat.toFixed(6);
                wrapper.querySelector(`#lon${destId}`).value = lng.toFixed(6);
                // Haritada markerı güncelle veya ekle
                // Önce eski markerı sil
                removeMarkerAndBubbleById(markerId);
                // Marker ekle
                const siraNumarasi = Array.from(document.querySelectorAll('.destination-item')).findIndex(el => el.getAttribute('data-marker-id') === markerId) + 1;
                const destMarker = new H.map.DomMarker({ lat, lng }, { icon: getNumberedHouseIcon(siraNumarasi) });
                hereMap.addObject(destMarker);
                destinationMarkers.push(destMarker);
                const bubble = new H.ui.InfoBubble({ lat, lng }, {
                    content: `<b>Varış Noktası ${siraNumarasi}</b><br>Lat: ${lat.toFixed(6)}<br>Lon: ${lng.toFixed(6)}`
                });
                hereUi.addBubble(bubble);
                addBubbleWithMarker(bubble, destMarker, false, markerId);
            } catch (e) {
                alert('Adres bulunamadı!');
            }
        });
    }
    return uniqueId;
}

// Marker ve balonu id ile sil
function removeMarkerAndBubbleById(id) {
    console.log('[SİLME İSTENDİ] markerId:', id, window.infoBubbleMarkerPairs.map(p => p.id));
    const pair = window.infoBubbleMarkerPairs.find(p => p.id === id);
    if (pair) {
        console.log('[SİLİNİYOR] markerId:', id);
        // Marker'ı sil
        if (hereMap && pair.marker && hereMap.getObjects().includes(pair.marker)) {
            hereMap.removeObject(pair.marker);
        }
        if (pair.bubble) {
            try { hereUi.removeBubble(pair.bubble); } catch (e) { }
        }
        window.infoBubbleMarkerPairs = window.infoBubbleMarkerPairs.filter(p => p.id !== id);
    } else {
        console.warn('Silinecek marker bulunamadı, id:', id);
    }
    // Tüm markerları DOM ile senkronize et
    const domIds = Array.from(document.querySelectorAll('.destination-item')).map(el => el.getAttribute('data-marker-id'));
    destinationMarkers = destinationMarkers.filter(marker => {
        const pair = window.infoBubbleMarkerPairs.find(p => p.marker === marker);
        if (pair && !domIds.includes(pair.id)) {
            if (hereMap.getObjects().includes(marker)) hereMap.removeObject(marker);
            return false; // diziden çıkar
        }
        return true;
    });
    // Eğer rota çizgisi varsa ve bir varış noktası silindiyse, rotayı da kaldır
    if (window.routePolyline && hereMap.getObjects().includes(window.routePolyline)) {
        hereMap.removeObject(window.routePolyline);
        window.routePolyline = null;
    }
}

// InfoBubble ve marker eşleştirmesi için dizi
window.infoBubbleMarkerPairs = [];
window.infoBubbles = [];

function addBubbleWithMarker(bubble, marker, isStart = false, markerId = null) {
    console.log('[MARKER/BUBBLE EKLENİYOR] markerId:', markerId);
    window.infoBubbles.push(bubble);
    window.infoBubbleMarkerPairs.push({ bubble, marker, id: markerId });
    // Balonun DOM'una event listener ekle (X butonuna tıklanınca marker'ı sil)
    setTimeout(() => {
        const el = bubble.getElement();
        if (el) {
            const closeBtn = el.querySelector('.H_ib_close');
            if (closeBtn) {
                closeBtn.addEventListener('click', function () {
                    if (hereMap && marker && hereMap.getObjects().includes(marker)) {
                        hereMap.removeObject(marker);
                    }
                    if (isStart) {
                        startMarker = null;
                    } else {
                        destinationMarkers = destinationMarkers.filter(m => m !== marker);
                    }
                    window.infoBubbleMarkerPairs = window.infoBubbleMarkerPairs.filter(pair => pair.bubble !== bubble);
                });
            }
        }
    }, 100); // Balonun DOM'a eklenmesini bekle
}

function initHereMap() {
    herePlatform = new H.service.Platform({ apikey: HERE_API_KEY });
    hereDefaultLayers = herePlatform.createDefaultLayers();
    hereMap = new H.Map(
        document.getElementById('map'),
        hereDefaultLayers.vector.normal.map,
        {
            zoom: 10,
            center: { lat: 37.8746, lng: 32.4932 }, // Konya koordinatları
            pixelRatio: window.devicePixelRatio || 1
        }
    );
    window.addEventListener('resize', () => hereMap.getViewPort().resize());
    new H.mapevents.Behavior(new H.mapevents.MapEvents(hereMap));
    hereUi = H.ui.UI.createDefault(hereMap, hereDefaultLayers);

    hereMap.addEventListener('tap', function (evt) {
        const coord = hereMap.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);
        if (!isStartSelected) {
            if (startMarker) hereMap.removeObject(startMarker);
            startMarker = new H.map.DomMarker(coord, { icon: getTruckIcon() });
            hereMap.addObject(startMarker);
            isStartSelected = true;
            fillStartInputs(coord.lat, coord.lng);
            const bubble = new H.ui.InfoBubble(coord, {
                content: `<b>Başlangıç Noktası</b><br>Lat: ${coord.lat.toFixed(6)}<br>Lon: ${coord.lng.toFixed(6)}`
            });
            hereUi.addBubble(bubble);
            addBubbleWithMarker(bubble, startMarker, true, 'start');
        } else {
            // Her yeni marker için unique id üret
            const markerId = generateUniqueId();
            // Önce tabloya inputu ekle
            addDestinationInput(coord.lat.toFixed(6), coord.lng.toFixed(6), markerId);
            // Sıra numarasını belirle (kaçıncı varış noktası)
            const siraNumarasi = document.querySelectorAll('.destination-item').length;
            // Sıralı numaralı ev ikonu ile marker ekle
            const destMarker = new H.map.DomMarker(coord, { icon: getNumberedHouseIcon(siraNumarasi) });
            hereMap.addObject(destMarker);
            destinationMarkers.push(destMarker);
            const bubble = new H.ui.InfoBubble(coord, {
                content: `<b>Varış Noktası ${siraNumarasi}</b><br>Lat: ${coord.lat.toFixed(6)}<br>Lon: ${coord.lng.toFixed(6)}`
            });
            hereUi.addBubble(bubble);
            addBubbleWithMarker(bubble, destMarker, false, markerId);
        }
    });
}

function toggleHereTrafficLayer() {
    if (!trafficLayer) {
        trafficLayer = hereDefaultLayers.vector.normal.traffic;
        hereMap.addLayer(trafficLayer);
    } else {
        hereMap.removeLayer(trafficLayer);
        trafficLayer = null;
    }
}

// Harita tıklama eventini güncelle
function fillDestinationInputs(lat, lon, forcedId = null) {
    addDestinationInput(lat.toFixed(6), lon.toFixed(6), forcedId);
}

// Haversine mesafe hesaplama fonksiyonu
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const toRad = deg => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Nearest Neighbor algoritması
function nearestNeighborRoute(start, destinations) {
    const route = [start];
    const visited = new Array(destinations.length).fill(false);
    let current = start;
    let totalDistance = 0;
    let steps = [];
    for (let i = 0; i < destinations.length; i++) {
        let minDist = Infinity;
        let minIdx = -1;
        for (let j = 0; j < destinations.length; j++) {
            if (!visited[j]) {
                const dist = haversine(current.lat, current.lon, destinations[j].lat, destinations[j].lon);
                if (dist < minDist) {
                    minDist = dist;
                    minIdx = j;
                }
            }
        }
        if (minIdx !== -1) {
            visited[minIdx] = true;
            route.push(destinations[minIdx]);
            steps.push({ from: current, to: destinations[minIdx], distance: minDist });
            totalDistance += minDist;
            current = destinations[minIdx];
        }
    }
    return { route, totalDistance, steps };
}

// Formdan koordinatları topla
function getRouteInputs() {
    const startLat = parseFloat(document.getElementById('startLat').value);
    const startLon = parseFloat(document.getElementById('startLon').value);
    const start = { lat: startLat, lon: startLon, label: 'Başlangıç' };
    const destDivs = document.querySelectorAll('#destinations .destination-item');
    const destinations = [];
    destDivs.forEach((div, idx) => {
        const lat = parseFloat(div.querySelector('input[id^="lat"]').value);
        const lon = parseFloat(div.querySelector('input[id^="lon"]').value);
        destinations.push({ lat, lon, label: String.fromCharCode(66 + idx) }); // B, C, D...
    });
    return { start, destinations };
}

// Rotayı ekranda göster
function displayRoute(routeObj) {
    const seqDiv = document.getElementById('routeSequence');
    if (!seqDiv) return;
    let html = '<ol>';
    routeObj.route.forEach((pt, i) => {
        html += `<li>${pt.label} (${pt.lat.toFixed(6)}, ${pt.lon.toFixed(6)})`;
        if (i > 0) {
            html += ` <span style='color:#888;'>→</span> <span style='font-size:0.9em;'>${routeObj.steps[i - 1].distance.toFixed(2)} km</span>`;
        }
        html += '</li>';
    });
    html += '</ol>';
    html += `<div><b>Toplam Mesafe:</b> ${routeObj.totalDistance.toFixed(2)} km</div>`;
    seqDiv.innerHTML = html;
    // Sonuç panelini aç
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.style.display = '';
}

// Rotayı haritada çiz
function drawRouteOnMap(routeObj) {
    // Önce eski rotayı sil
    if (window.routePolyline) hereMap.removeObject(window.routePolyline);
    const lineString = new H.geo.LineString();
    routeObj.route.forEach(pt => lineString.pushPoint({ lat: pt.lat, lng: pt.lon }));
    const polyline = new H.map.Polyline(lineString, {
        style: { strokeColor: '#764ba2', lineWidth: 6 }
    });
    hereMap.addObject(polyline);
    window.routePolyline = polyline;
    // Haritayı rotaya odakla
    hereMap.getViewModel().setLookAtData({ bounds: polyline.getBoundingBox() });
}

// Rota özetini doldur
function displayRouteSummary(routeObj) {
    const summaryDiv = document.getElementById('routeSummary');
    if (!summaryDiv) return;
    const totalKm = routeObj.totalDistance;
    const totalMiles = totalKm * 0.621371;
    const visited = routeObj.route.length - 1;
    summaryDiv.innerHTML = `
        <div><b>Toplam Mesafe:</b> ${totalKm.toFixed(2)} km</div>
        <div><b>Toplam Mesafe:</b> ${totalMiles.toFixed(2)} mil</div>
        <div><b>Ziyaret Edilen Nokta:</b> ${visited}</div>
    `;
}

// Süre tahminlerini doldur
function displayTimeEstimates(routeObj) {
    const timeDiv = document.getElementById('timeEstimates');
    if (!timeDiv) return;
    const totalKm = routeObj.totalDistance;
    const carTime = totalKm / 82; // 82 km/saat
    const planeTime = totalKm / 800; // 800 km/saat
    timeDiv.innerHTML = `
        <div><b>Araçla (82 km/saat):</b> ${carTime.toFixed(1)} saat</div>
        <div><b>Uçakla (800 km/saat):</b> ${planeTime.toFixed(1)} saat</div>
    `;
}

// Rota sırasını doldur
function displayRouteSequence(routeObj) {
    const seqDiv = document.getElementById('routeSequence');
    if (!seqDiv) return;
    let html = '';
    routeObj.route.forEach((pt, i) => {
        html += `<div style="background:#f8fafc; border-radius:12px; padding:16px; margin-bottom:12px;">
            <b>${i + 1}. ${i === 0 ? '<span style=\'color:#4a67e8\'>Başlangıç Noktası</span>' : ''}</b>
            <div style="font-size:0.98em; color:#444;">Koordinatlar: ${pt.lat.toFixed(6)}, ${pt.lon.toFixed(6)}</div>
        </div>`;
    });
    seqDiv.innerHTML = html;
}

// Detaylı mesafeleri doldur
function displayDetailedDistances(routeObj) {
    const detDiv = document.getElementById('detailedDistances');
    if (!detDiv) return;
    let html = '';
    routeObj.steps.forEach((step, i) => {
        html += `<div style="background:#f8fafc; border-radius:12px; padding:16px; margin-bottom:12px;">
            <b>Adım ${i + 1}: ${step.from.label} →</b>
            <div style="color:#4a67e8; font-weight:600; font-size:1.1em;">${step.distance.toFixed(2)} km</div>
        </div>`;
    });
    detDiv.innerHTML = html;
}

// Her adımda tüm mesafeleri doldur
function displayAllDistancesPerStep(routeObj, allDistances) {
    const allDiv = document.getElementById('allDistancesPerStep');
    if (!allDiv) return;
    let html = '';
    allDistances.forEach((adim, i) => {
        // Başlangıç için özel isim, diğerleri için Varış Noktası X
        const fromLabel = i === 0 ? 'Başlangıç' : `Varış Noktası ${adim.from.varisIndex}`;
        html += `<div style="background:#f8fafc; border-radius:12px; padding:16px; margin-bottom:12px;">
            <b>Adım ${i + 1} (${fromLabel}):</b><br>`;
        adim.distances.forEach((d, j) => {
            // Hedef için de Varış Noktası X göster
            const toLabel = d.to && typeof d.to.varisIndex !== 'undefined' ? `Varış Noktası ${d.to.varisIndex}` : (d.to.label || '');
            html += `- <b>${fromLabel} → ${toLabel}:</b> <span style="color:#4a67e8;">${d.value.toFixed(2)} km</span> `;
            if (d.isNearest) html += `<span style="background:#c6f6d5; color:#22543d; padding:2px 8px; border-radius:12px; font-size:0.8em; font-weight:600; margin-left:8px;">EN YAKIN</span>`;
            html += '<br>';
        });
        html += '</div>';
    });
    allDiv.innerHTML = html;
}

// Her adımda tüm mesafeleri hesapla (en yakın olanı işaretle)
function calculateAllDistancesPerStep(start, destinations) {
    const steps = [];
    let current = { ...start, varisIndex: 0 }; // Başlangıç için index 0
    let remaining = destinations.map((d, i) => ({ ...d, varisIndex: i + 1 })); // Varış noktaları 1'den başlar
    for (let adim = 0; adim < destinations.length; adim++) {
        const distances = remaining.map((d, i) => {
            return {
                value: haversine(current.lat, current.lon, d.lat, d.lon),
                isNearest: false,
                to: d // Hangi noktaya ait olduğunu sakla
            };
        });
        // En yakını bul
        let minIdx = 0;
        let minVal = distances[0].value;
        for (let i = 1; i < distances.length; i++) {
            if (distances[i].value < minVal) {
                minVal = distances[i].value;
                minIdx = i;
            }
        }
        if (distances[minIdx]) distances[minIdx].isNearest = true;
        steps.push({ from: current, distances });
        // Sonraki adıma geç
        current = remaining[minIdx];
        remaining.splice(minIdx, 1);
    }
    return steps;
}

// Sonuç ekranını doldur ve göster
function showFullResults(routeObj, allDistances) {
    displayRouteSummary(routeObj);
    displayTimeEstimates(routeObj);
    displayRouteSequence(routeObj);
    displayDetailedDistances(routeObj);
    displayAllDistancesPerStep(routeObj, allDistances);
    // Sonuç panelini aç
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.style.display = '';
}

// Tümünü Temizle butonu işlevi
function clearAll() {
    // Tüm markerId'leri topla (başlangıç hariç)
    const allIds = Array.from(document.querySelectorAll('.destination-item')).map(el => el.getAttribute('data-marker-id'));
    allIds.forEach(id => removeMarkerAndBubbleById(id));
    // Başlangıç markerı ve balonunu da sil
    if (startMarker && hereMap.getObjects().includes(startMarker)) {
        hereMap.removeObject(startMarker);
        startMarker = null;
    }
    // Inputları temizle
    document.getElementById('startLat').value = '';
    document.getElementById('startLon').value = '';
    const destDiv = document.getElementById('destinations');
    destDiv.innerHTML = '';
    // Rotayı sil
    if (window.routePolyline) { hereMap.removeObject(window.routePolyline); window.routePolyline = null; }
    // InfoBubble ve eşleşmeleri temizle
    if (hereUi && typeof hereUi.getBubbles === 'function') {
        hereUi.getBubbles().forEach(bubble => hereUi.removeBubble(bubble));
    }
    window.infoBubbles = [];
    window.infoBubbleMarkerPairs = [];
    // Sonuç ekranını gizle
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.style.display = 'none';
    // Sayaçları ve state'i sıfırla
    destinationCounter = 0;
    isStartSelected = false;
}

function clearStartPoint() {
    document.getElementById('startLat').value = '';
    document.getElementById('startLon').value = '';
    if (startMarker && hereMap.getObjects().includes(startMarker)) {
        hereMap.removeObject(startMarker);
        startMarker = null;
    }
    // Başlangıç balonunu da sil
    if (window.infoBubbleMarkerPairs) {
        window.infoBubbleMarkerPairs = window.infoBubbleMarkerPairs.filter(pair => {
            if (pair.id === 'start') {
                if (pair.bubble) try { hereUi.removeBubble(pair.bubble); } catch (e) { }
                return false;
            }
            return true;
        });
    }
    isStartSelected = false;
}
document.getElementById('clearStartPoint').onclick = clearStartPoint;

// Gerçek yol ağına uygun rota çizimi (HERE Routing API)
async function drawRealRouteOnMap(routeObj) {
    // Önce eski rotayı sil
    if (window.routePolyline) hereMap.removeObject(window.routePolyline);
    let allLineString = new H.geo.LineString();
    for (let i = 0; i < routeObj.route.length - 1; i++) {
        const from = routeObj.route[i];
        const to = routeObj.route[i + 1];
        const url = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${from.lat},${from.lon}&destination=${to.lat},${to.lon}&return=polyline&apikey=${HERE_API_KEY}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.routes && data.routes[0] && data.routes[0].sections[0].polyline) {
                const polyline = data.routes[0].sections[0].polyline;
                const lineString = H.geo.LineString.fromFlexiblePolyline(polyline);
                // Her adımın polyline'ını ana rotaya ekle
                for (let j = 0; j < lineString.getPointCount(); j++) {
                    allLineString.pushPoint(lineString.extractPoint(j));
                }
            }
        } catch (e) {
            console.error('HERE Routing API hatası:', e);
        }
    }
    if (allLineString.getPointCount() > 1) {
        const routeLine = new H.map.Polyline(allLineString, { style: { strokeColor: 'blue', lineWidth: 5 } });
        hereMap.addObject(routeLine);
        window.routePolyline = routeLine;
        hereMap.getViewModel().setLookAtData({ bounds: routeLine.getBoundingBox() });
    }
}

// Rotadaki sıralamaya göre numaralı markerları güncelle
function updateNumberedMarkers(routeObj) {
    // Eski markerları sil
    destinationMarkers.forEach(m => hereMap.removeObject(m));
    destinationMarkers = [];
    // 1'den başlayarak numaralı marker ekle (ilk nokta başlangıçtır, atla)
    for (let i = 1; i < routeObj.route.length; i++) {
        const pt = routeObj.route[i];
        const marker = new H.map.DomMarker({ lat: pt.lat, lng: pt.lon }, { icon: getNumberedHouseIcon(i) });
        hereMap.addObject(marker);
        destinationMarkers.push(marker);
    }
}

// Rotayı Hesapla butonu eventini güncelle
// Sonuçları TXT olarak indir
function exportResultsAsTxt() {
    let txt = '';
    // Rota Özeti
    const summary = document.getElementById('routeSummary');
    if (summary) txt += '--- ROTA ÖZETİ ---\n' + summary.innerText + '\n\n';
    // Süre Tahminleri
    const times = document.getElementById('timeEstimates');
    if (times) txt += '--- SÜRE TAHMİNLERİ ---\n' + times.innerText + '\n\n';
    // Rota Sırası
    const seq = document.getElementById('routeSequence');
    if (seq) txt += '--- ROTA SIRASI ---\n' + seq.innerText + '\n\n';
    // Detaylı Mesafeler
    const det = document.getElementById('detailedDistances');
    if (det) txt += '--- DETAYLI MESAFELER ---\n' + det.innerText + '\n\n';
    // Her Adımda Tüm Mesafeler
    const all = document.getElementById('allDistancesPerStep');
    if (all) txt += '--- HER ADIMDA TÜM MESAFELER ---\n' + all.innerText + '\n\n';
    // Dosya olarak indir
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teslimat-rotasi-sonuc.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// Adresi HERE Geocoding API ile koordinata çevir
async function geocodeAddress(address) {
    const apiKey = HERE_API_KEY;
    const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(address)}&apiKey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.items && data.items.length > 0) {
        const { lat, lng } = data.items[0].position;
        return { lat, lng };
    } else {
        throw new Error("Adres bulunamadı.");
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const calcBtn = document.getElementById('calculateRoute');
    if (calcBtn) {
        calcBtn.addEventListener('click', async () => {
            const { start, destinations } = getRouteInputs();
            if (!start.lat || !start.lon || destinations.length === 0) {
                alert('Başlangıç ve en az bir varış noktası girin!');
                return;
            }
            const result = nearestNeighborRoute(start, destinations);
            const allDistances = calculateAllDistancesPerStep(start, destinations);
            showFullResults(result, allDistances);
            await drawRealRouteOnMap(result); // <-- Gerçek yol rotası çiz
            updateNumberedMarkers(result); // <-- Markerları rotaya göre numaralandır
        });
    }
    const clearBtn = document.getElementById('clearAll');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAll);
    }
    const exportBtn = document.getElementById('exportResults');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportResultsAsTxt);
    }
    const geocodeBtn = document.getElementById('geocodeBtn');
    if (geocodeBtn) {
        geocodeBtn.addEventListener('click', async () => {
            const address = document.getElementById('startAddress').value;
            if (!address) {
                alert("Lütfen bir adres girin.");
                return;
            }
            try {
                const { lat, lng } = await geocodeAddress(address);
                // Haritayı bu noktaya odakla
                if (window.hereMap) hereMap.setCenter({ lat, lng });
                // Başlangıç inputlarını doldur
                document.getElementById('startLat').value = lat.toFixed(6);
                document.getElementById('startLon').value = lng.toFixed(6);
                // Haritada başlangıç markerı olarak işaretle
                if (window.startMarker && hereMap.getObjects().includes(window.startMarker)) {
                    hereMap.removeObject(window.startMarker);
                }
                window.startMarker = new H.map.DomMarker({ lat, lng }, { icon: getTruckIcon() });
                hereMap.addObject(window.startMarker);
                window.isStartSelected = true;
                // Popup göster
                const bubble = new H.ui.InfoBubble({ lat, lng }, {
                    content: `<b>Başlangıç Noktası</b><br>Lat: ${lat.toFixed(6)}<br>Lon: ${lng.toFixed(6)}`
                });
                hereUi.addBubble(bubble);
                addBubbleWithMarker(bubble, window.startMarker, true, 'start');
                // alert(`Koordinatlar: ${lat.toFixed(6)}, ${lng.toFixed(6)}`); // İstersen kaldırabilirsin
            } catch (e) {
                alert("Adres bulunamadı!");
            }
        });
    }
    const addDestBtn = document.getElementById('addDestination');
    if (addDestBtn) {
        addDestBtn.addEventListener('click', () => {
            addDestinationInput();
        });
    }
    // FontAwesome yüklemesi
    if (!document.getElementById('fa-kit')) {
        const fa = document.createElement('link');
        fa.id = 'fa-kit';
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
        fa.onload = () => {
            initHereMap();
            setupTrafficButton();
        };
        document.head.appendChild(fa);
    } else {
        initHereMap();
        setupTrafficButton();
    }
});

function setupTrafficButton() {
    const trafficBtn = document.getElementById('showTraffic');
    if (trafficBtn) {
        trafficBtn.addEventListener('click', toggleHereTrafficLayer);
    }
}

// Sıralı numaralı ev ikonu
function getNumberedHouseIcon(number) {
    return createDomIcon(
        `<div style="position:relative;display:inline-block;">
            <i class='fas fa-house' style='color:#27ae60;font-size:24px;'></i>
            <span style='position:absolute;top:-10px;right:-10px;background:#fff;color:#333;border-radius:50%;padding:2px 6px;font-size:13px;font-weight:bold;border:1px solid #bbb;'>${number}</span>
        </div>`,
        'destination-marker'
    );
}
