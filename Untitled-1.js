// HERE Maps entegrasyonu
let hereMap;
let herePlatform;
let hereDefaultLayers;
let hereMarkers = [];
let hereRouteLine = null;
let trafficLayer = null;

const HERE_API_KEY = 'g2nCyRwXnCP0I45DmNRQKRxXApT-v310foL57g0SqRY';

function initHereMap() {
    herePlatform = new H.service.Platform({ apikey: HERE_API_KEY });
    hereDefaultLayers = herePlatform.createDefaultLayers();
    hereMap = new H.Map(
        document.getElementById('map'),
        hereDefaultLayers.vector.normal.map,
        {
            zoom: 6,
            center: { lat: 39.92, lng: 32.85 }
        }
    );
    // Harita etkileşimi
    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(hereMap));
    var ui = H.ui.UI.createDefault(hereMap, hereDefaultLayers);
}

function toggleHereTrafficLayer() {
    var provider = hereMap.getBaseLayer().getProvider();
    if (!trafficLayer) {
        trafficLayer = new H.map.layer.TileLayer(
            provider.createTileLayer('base.traffic', 'normal.traffic'),
            { opacity: 0.6 }
        );
        hereMap.addLayer(trafficLayer);
    } else {
        hereMap.removeLayer(trafficLayer);
        trafficLayer = null;
    }
}

function addHereMarker(lat, lng, text = 'Başlangıç Noktası') {
    const marker = new H.map.Marker({ lat, lng });
    hereMap.addObject(marker);
    hereMarkers.push(marker);
    marker.setData(text);
    marker.addEventListener('tap', function (evt) {
        const bubble = new H.ui.InfoBubble(evt.target.getGeometry(), {
            content: evt.target.getData()
        });
        hereMap.getUi().addBubble(bubble);
    }, false);
}

function drawHereRouteOnMap(routeShape) {
    if (hereRouteLine) hereMap.removeObject(hereRouteLine);
    const lineString = new H.geo.LineString();
    routeShape.forEach(point => {
        const [lat, lon] = point.split(',');
        lineString.pushLatLngAlt(Number(lat), Number(lon), 0);
    });
    hereRouteLine = new H.map.Polyline(lineString, {
        style: { strokeColor: 'red', lineWidth: 5 }
    });
    hereMap.addObject(hereRouteLine);
    hereMap.getViewModel().setLookAtData({ bounds: hereRouteLine.getBoundingBox() });
}

async function calculateAndDrawRoute(startLat, startLon, endLat, endLon) {
    const url = `https://route.ls.hereapi.com/routing/7.2/calculateroute.json` +
        `?apiKey=${HERE_API_KEY}` +
        `&waypoint0=geo!${startLat},${startLon}` +
        `&waypoint1=geo!${endLat},${endLon}` +
        `&mode=fastest;car;traffic:enabled` +
        `&representation=display`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.response && data.response.route && data.response.route[0]) {
        const route = data.response.route[0];
        drawHereRouteOnMap(route.shape);
        // Trafik ve süre bilgisi:
        const summary = route.summary;
        alert(
            `Mesafe: ${(summary.distance / 1000).toFixed(2)} km\n` +
            `Trafikli Süre: ${(summary.trafficTime / 60).toFixed(1)} dk\n` +
            `Trafiksiz Süre: ${(summary.baseTime / 60).toFixed(1)} dk\n` +
            `Trafik Gecikmesi: ${((summary.trafficTime - summary.baseTime) / 60).toFixed(1)} dk`
        );
    }
}

// Sayfa yüklendiğinde başlat
window.addEventListener('DOMContentLoaded', () => {
    initHereMap();
    // Trafik katmanı butonuna bağla
    const trafficBtn = document.getElementById('showTraffic');
    if (trafficBtn) {
        trafficBtn.addEventListener('click', toggleHereTrafficLayer);
    }
}); 