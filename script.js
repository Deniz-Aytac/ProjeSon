// Google Maps API ile yeniden yazıldı, tüm işlevler korunarak
let map;
let startMarker = null;
let destinationMarkers = [];
let isStartSelected = false;
let destinationCounter = 0;
let trafficLayer = null;
const GOOGLE_API_KEY = 'AIzaSyD0vw2XCwtXihJl2lmTG9dlIGIM1b2O8zM';

function initGoogleMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.8746, lng: 32.4932 },
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
    });
    map.addListener('click', function (e) {
        if (!isStartSelected) {
            if (startMarker) startMarker.setMap(null);
            startMarker = new google.maps.Marker({
                position: e.latLng,
                map: map,
                icon: getTruckIcon(),
                title: 'Başlangıç Noktası'
            });
            isStartSelected = true;
            fillStartInputs(e.latLng.lat(), e.latLng.lng());
        } else {
            const markerId = generateUniqueId();
            addDestinationInput(e.latLng.lat().toFixed(6), e.latLng.lng().toFixed(6), markerId);
            const siraNumarasi = document.querySelectorAll('.destination-item').length;
            const destMarker = new google.maps.Marker({
                position: e.latLng,
                map: map,
                icon: getNumberedHouseIcon(siraNumarasi),
                title: `Varış Noktası ${siraNumarasi}`
            });
            destMarker._markerId = markerId;
            destinationMarkers.push(destMarker);
        }
    });
}

function getTruckIcon() {
    return {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new google.maps.Size(36, 36)
    };
}
function getNumberedHouseIcon(number) {
    return {
        url: 'images/elfatek.png', // veya .jpg/.svg uzantısı neyse ona göre
        scaledSize: new google.maps.Size(36, 36)
    };
}
function fillStartInputs(lat, lon) {
    const latInput = document.getElementById('startLat');
    const lonInput = document.getElementById('startLon');
    if (latInput && lonInput) {
        latInput.value = lat.toFixed(6);
        lonInput.value = lon.toFixed(6);
    }
    reverseGeocode(lat, lon).then(address => {
        const addrInput = document.getElementById('startAddress');
        if (addrInput) addrInput.value = address;
    });
}
function generateUniqueId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}
function addDestinationInput(lat = '', lon = '', forcedId = null, address = '') {
    destinationCounter++;
    const destId = String.fromCharCode(65 + destinationCounter);
    const uniqueId = forcedId || generateUniqueId();
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
    wrapper.querySelector('.remove-destination-map').onclick = function () {
        const markerId = wrapper.getAttribute('data-marker-id');
        removeMarkerById(markerId);
        destinationsDiv.removeChild(wrapper);
    };
    destinationsDiv.appendChild(wrapper);
    if (lat && lon && !address) {
        reverseGeocode(parseFloat(lat), parseFloat(lon)).then(addr => {
            const addrInput = wrapper.querySelector(`#address${destId}`);
            if (addrInput) addrInput.value = addr;
        });
    }
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
                wrapper.querySelector(`#lat${destId}`).value = lat.toFixed(6);
                wrapper.querySelector(`#lon${destId}`).value = lng.toFixed(6);
                removeMarkerById(markerId);
                const siraNumarasi = Array.from(document.querySelectorAll('.destination-item')).findIndex(el => el.getAttribute('data-marker-id') === markerId) + 1;
                const destMarker = new google.maps.Marker({
                    position: { lat, lng },
                    map: map,
                    icon: getNumberedHouseIcon(siraNumarasi),
                    title: `Varış Noktası ${siraNumarasi}`
                });
                destMarker._markerId = markerId;
                destinationMarkers.push(destMarker);
                reverseGeocode(lat, lng).then(addr => {
                    addressInput.value = addr;
                });
            } catch (e) {
                alert('Adres bulunamadı!');
            }
        });
    }
    return uniqueId;
}
function removeMarkerById(id) {
    destinationMarkers = destinationMarkers.filter(marker => {
        if (marker._markerId === id) {
            marker.setMap(null);
            clearRouteStepPolylines(); // Rota çizgilerini de sil
            return false;
        }
        return true;
    });
} function clearAll() {
    destinationMarkers.forEach(m => m.setMap(null));
    destinationMarkers = [];
    if (startMarker) { startMarker.setMap(null); startMarker = null; }
    document.getElementById('startLat').value = '';
    document.getElementById('startLon').value = '';
    document.getElementById('destinations').innerHTML = '';
    destinationCounter = 0;
    isStartSelected = false;
    document.getElementById('resultsSection').style.display = 'none';
    clearRouteStepPolylines(); // Rota çizgilerini de sil
}
function clearStartPoint() {
    document.getElementById('startLat').value = '';
    document.getElementById('startLon').value = '';
    if (startMarker) { startMarker.setMap(null); startMarker = null; }
    isStartSelected = false;
}
document.getElementById('clearStartPoint').onclick = clearStartPoint;

async function geocodeAddress(address) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
    } else {
        throw new Error('Adres bulunamadı.');
    }
}
async function reverseGeocode(lat, lng) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
    } else {
        return '';
    }
}
function getRouteInputs() {
    const startLat = parseFloat(document.getElementById('startLat').value);
    const startLon = parseFloat(document.getElementById('startLon').value);
    const start = { lat: startLat, lon: startLon, label: 'Başlangıç' };
    const destDivs = document.querySelectorAll('#destinations .destination-item');
    const destinations = [];
    destDivs.forEach((div, idx) => {
        const lat = parseFloat(div.querySelector('input[id^="lat"]').value);
        const lon = parseFloat(div.querySelector('input[id^="lon"]').value);
        destinations.push({ lat, lon, label: String.fromCharCode(66 + idx) });
    });
    return { start, destinations };
}
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = deg => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
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
function displayRouteSummary(routeObj) {
    const summaryDiv = document.getElementById('routeSummary');
    if (!summaryDiv) return;
    const totalKm = routeObj.totalDistance;
    const visited = routeObj.route.length - 1;
    summaryDiv.innerHTML = `
        <div><b>Toplam Mesafe:</b> ${totalKm.toFixed(2)} km</div>
        <div><b>Ziyaret Edilen Nokta:</b> ${visited}</div>
    `;
}

function getStepDurationWithDirectionsService(origin, destination) {
    return new Promise((resolve) => {
        const service = new google.maps.DirectionsService();
        service.route({
            origin: { lat: origin.lat, lng: origin.lon },
            destination: { lat: destination.lat, lng: destination.lon },
            travelMode: google.maps.TravelMode.DRIVING
        }, (result, status) => {
            if (status === 'OK' && result.routes[0] && result.routes[0].legs[0]) {
                resolve(result.routes[0].legs[0].duration.value); // saniye
            } else {
                resolve(0);
            }
        });
    });
}

function getStepDurationWithTrafficDirectionsService(origin, destination) {
    return new Promise((resolve) => {
        const service = new google.maps.DirectionsService();
        service.route({
            origin: { lat: origin.lat, lng: origin.lon },
            destination: { lat: destination.lat, lng: destination.lon },
            travelMode: google.maps.TravelMode.DRIVING,
            drivingOptions: {
                departureTime: new Date(),
                trafficModel: 'bestguess'
            }
        }, (result, status) => {
            if (status === 'OK' && result.routes[0] && result.routes[0].legs[0] && result.routes[0].legs[0].duration_in_traffic) {
                resolve(result.routes[0].legs[0].duration_in_traffic.value); // saniye
            } else {
                resolve(0);
            }
        });
    });
}

async function displayTimeEstimates(routeObj) {
    const timeDiv = document.getElementById('timeEstimates');
    if (!timeDiv) return;
    const totalKm = routeObj.totalDistance;
    const carTime = totalKm / 82;
    // Trafikli ve gerçek navigasyon süresi hesapla
    let trafficSeconds = 0;
    let navSeconds = 0;
    for (let i = 0; i < routeObj.route.length - 1; i++) {
        const from = routeObj.route[i];
        const to = routeObj.route[i + 1];
        try {
            const dur = await getStepDurationWithTrafficDirectionsService(from, to);
            if (dur) trafficSeconds += dur;
        } catch (e) { }
        try {
            const navDur = await getStepDurationWithDirectionsService(from, to);
            if (navDur) navSeconds += navDur;
        } catch (e) { }
    }
    let trafficHours = trafficSeconds / 3600;
    let navMinutes = navSeconds / 60;
    timeDiv.innerHTML = `
        <div><b>Araçla (82 km/saat):</b> ${carTime.toFixed(1)} saat</div>
        <div><b>Trafikli Tahmini Süre:</b> ${trafficHours > 0 ? trafficHours.toFixed(2) + ' saat' : 'Veri yok'}</div>
        <div><b>Gerçek Navigasyon Süresi:</b> ${navMinutes > 0 ? navMinutes.toFixed(0) + ' dk' : 'Veri yok'}</div>
    `;
}

async function displayRouteSequence(routeObj) {
    const seqDiv = document.getElementById('routeSequence');
    if (!seqDiv) return;
    let html = '';
    for (let i = 0; i < routeObj.route.length; i++) {
        const pt = routeObj.route[i];
        let address = '';
        try {
            address = await reverseGeocode(pt.lat, pt.lon);
        } catch (e) {
            address = '';
        }
        html += `<div style="background:#f8fafc; border-radius:12px; padding:16px; margin-bottom:12px;">
            <b>${i + 1}. ${i === 0 ? "<span style='color:#4a67e8'>Başlangıç Noktası</span>" : ""}</b>
            <div style="font-size:0.98em; color:#444;">Koordinatlar: ${pt.lat.toFixed(6)}, ${pt.lon.toFixed(6)}</div>
            <div style="font-size:0.95em; color:#888; margin-top:4px;">${address}</div>
        </div>`;
    }
    seqDiv.innerHTML = html;
}
function displayDetailedDistances(routeObj, allDistances) {
    const detDiv = document.getElementById('detailedDistances');
    if (!detDiv) return;
    let html = '';
    allDistances.forEach((adim, i) => {
        const fromLabel = i === 0 ? 'Başlangıç' : `Varış Noktası ${adim.from.varisIndex}`;
        const nearest = adim.distances.find(d => d.isNearest);
        if (nearest) {
            const toLabel = nearest.to && typeof nearest.to.varisIndex !== 'undefined'
                ? `Varış Noktası ${nearest.to.varisIndex}`
                : (nearest.to.label || '');
            html += `<div style="background:#f8fafc; border-radius:12px; padding:16px; margin-bottom:12px;">
                <b>${fromLabel} → ${toLabel}</b>
                <div style="color:#4a67e8; font-weight:600; font-size:1.1em;">${nearest.value.toFixed(2)} km</div>
            </div>`;
        }
    });
    detDiv.innerHTML = html;
}
function displayAllDistancesPerStep(routeObj, allDistances) {
    const allDiv = document.getElementById('allDistancesPerStep');
    if (!allDiv) return;
    let html = '';
    allDistances.forEach((adim, i) => {
        const fromLabel = i === 0 ? 'Başlangıç' : `Varış Noktası ${adim.from.varisIndex}`;
        html += `<div style=\"background:#f8fafc; border-radius:12px; padding:16px; margin-bottom:12px;\">\n            <b>Adım ${i + 1} (${fromLabel}):</b><br>`;
        adim.distances.forEach((d, j) => {
            const toLabel = d.to && typeof d.to.varisIndex !== 'undefined' ? `Varış Noktası ${d.to.varisIndex}` : (d.to.label || '');
            html += `- <b>${fromLabel} → ${toLabel}:</b> <span style=\"color:#4a67e8;\">${d.value.toFixed(2)} km</span> `;
            if (d.isNearest) html += `<span style=\"background:#c6f6d5; color:#22543d; padding:2px 8px; border-radius:12px; font-size:0.8em; font-weight:600; margin-left:8px;\">EN YAKIN</span>`;
            html += '<br>';
        });
        html += '</div>';
    });
    allDiv.innerHTML = html;
}
function calculateAllDistancesPerStep(start, destinations) {
    const steps = [];
    let current = { ...start, varisIndex: 0 };
    let remaining = destinations.map((d, i) => ({ ...d, varisIndex: i + 1 }));
    for (let adim = 0; adim < destinations.length; adim++) {
        const distances = remaining.map((d, i) => {
            return {
                value: haversine(current.lat, current.lon, d.lat, d.lon),
                isNearest: false,
                to: d
            };
        });
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
        current = remaining[minIdx];
        remaining.splice(minIdx, 1);
    }
    return steps;
}
async function showFullResults(routeObj, allDistances) {
    displayRouteSummary(routeObj);
    await displayTimeEstimates(routeObj);
    await displayRouteSequence(routeObj);
    displayDetailedDistances(routeObj, allDistances);
    displayAllDistancesPerStep(routeObj, allDistances);
    await drawRouteOnMapWithDirections(routeObj); // Haritada yol çizimi
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.style.display = '';
}
function exportResultsAsTxt() {
    let txt = '';
    const summary = document.getElementById('routeSummary');
    if (summary) txt += '--- ROTA ÖZETİ ---\n' + summary.innerText + '\n\n';
    const times = document.getElementById('timeEstimates');
    if (times) txt += '--- SÜRE TAHMİNLERİ ---\n' + times.innerText + '\n\n';
    const seq = document.getElementById('routeSequence');
    if (seq) txt += '--- ROTA SIRASI ---\n' + seq.innerText + '\n\n';
    const det = document.getElementById('detailedDistances');
    if (det) txt += '--- DETAYLI MESAFELER ---\n' + det.innerText + '\n\n';
    const all = document.getElementById('allDistancesPerStep');
    if (all) txt += '--- HER ADIMDA TÜM MESAFELER ---\n' + all.innerText + '\n\n';
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
let routeStepPolylines = [];

function clearRouteStepPolylines() {
    if (routeStepPolylines && Array.isArray(routeStepPolylines)) {
        routeStepPolylines.forEach(poly => poly.setMap(null));
    }
    routeStepPolylines = [];
}

async function drawRouteOnMapWithDirections(routeObj) {
    clearRouteStepPolylines();
    if (!window.directionsService) {
        window.directionsService = new google.maps.DirectionsService();
    }
    const points = routeObj.route;
    if (points.length < 2) return;
    // Renk paleti (adım sayısı kadar döner)
    const colors = [
        '#e74c3c', // kırmızı
        '#f39c12', // turuncu
        '#27ae60', // yeşil
        '#2980b9', // mavi
        '#8e44ad', // mor
        '#16a085', // teal
        '#d35400', // koyu turuncu
        '#2c3e50', // koyu mavi
        '#c0392b', // koyu kırmızı
        '#7f8c8d'  // gri
    ];
    for (let i = 0; i < points.length - 1; i++) {
        const from = points[i];
        const to = points[i + 1];
        const color = colors[i % colors.length];
        const request = {
            origin: { lat: from.lat, lng: from.lon },
            destination: { lat: to.lat, lng: to.lon },
            travelMode: google.maps.TravelMode.DRIVING
        };
        await new Promise(resolve => {
            window.directionsService.route(request, function (result, status) {
                if (status === 'OK' && result.routes[0] && result.routes[0].overview_path) {
                    const polyline = new google.maps.Polyline({
                        path: result.routes[0].overview_path,
                        strokeColor: color,
                        strokeOpacity: 0.9,
                        strokeWeight: 6,
                        map: map
                    });
                    routeStepPolylines.push(polyline);
                }
                resolve();
            });
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (typeof google === 'undefined' || !google.maps) {
        setTimeout(() => window.dispatchEvent(new Event('DOMContentLoaded')), 500);
        return;
    }
    initGoogleMap();
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
            await showFullResults(result, allDistances);
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
                alert('Lütfen bir adres girin.');
                return;
            }
            try {
                const { lat, lng } = await geocodeAddress(address);
                map.setCenter({ lat, lng });
                document.getElementById('startLat').value = lat.toFixed(6);
                document.getElementById('startLon').value = lng.toFixed(6);
                if (startMarker) startMarker.setMap(null);
                startMarker = new google.maps.Marker({
                    position: { lat, lng },
                    map: map,
                    icon: getTruckIcon(),
                    title: 'Başlangıç Noktası'
                });
                isStartSelected = true;
            } catch (e) {
                alert('Adres bulunamadı!');
            }
        });
    }
    const addDestBtn = document.getElementById('addDestination');
    if (addDestBtn) {
        addDestBtn.addEventListener('click', () => {
            addDestinationInput();
        });
    }
    const trafficBtn = document.getElementById('showTraffic');
    if (trafficBtn) {
        trafficBtn.addEventListener('change', function () {
            if (this.checked) {
                if (!trafficLayer) {
                    trafficLayer = new google.maps.TrafficLayer();
                }
                trafficLayer.setMap(map);
            } else {
                if (trafficLayer) trafficLayer.setMap(null);
            }
        });
    }
});
