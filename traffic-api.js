// TRAFİK VERİSİ API ENTEGRASYONLARI

class TrafficDataManager {
    constructor() {
        this.apis = {
            google: null,
            tomtom: null,
            here: null
        };
        this.currentApi = 'google';
        this.trafficEnabled = false;
    }

    // Google Maps Traffic API
    async initGoogleTraffic(apiKey) {
        if (typeof google === 'undefined') {
            console.warn('Google Maps API yüklenmedi');
            return false;
        }

        try {
            this.apis.google = {
                directionsService: new google.maps.DirectionsService(),
                directionsRenderer: new google.maps.DirectionsRenderer()
            };
            return true;
        } catch (error) {
            console.error('Google Traffic API hatası:', error);
            return false;
        }
    }

    // TomTom Traffic API
    async initTomTomTraffic(apiKey) {
        this.apis.tomtom = {
            apiKey: apiKey,
            baseUrl: 'https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json'
        };
    }

    // HERE Traffic API
    async initHereTraffic(apiKey) {
        this.apis.here = {
            apiKey: apiKey,
            baseUrl: 'https://traffic.ls.hereapi.com/traffic/6.2/flow.json'
        };
    }

    // Trafik verisi al
    async getTrafficData(startLat, startLon, endLat, endLon) {
        if (!this.trafficEnabled) {
            return this.getBaseTrafficData();
        }

        switch (this.currentApi) {
            case 'google':
                return await this.getGoogleTrafficData(startLat, startLon, endLat, endLon);
            case 'tomtom':
                return await this.getTomTomTrafficData(startLat, startLon, endLat, endLon);
            case 'here':
                return await this.getHereTrafficData(startLat, startLon, endLat, endLon);
            default:
                return this.getBaseTrafficData();
        }
    }

    // Google Traffic Data
    async getGoogleTrafficData(startLat, startLon, endLat, endLon) {
        if (!this.apis.google) return this.getBaseTrafficData();

        try {
            const request = {
                origin: { lat: startLat, lng: startLon },
                destination: { lat: endLat, lng: endLon },
                travelMode: google.maps.TravelMode.DRIVING,
                drivingOptions: {
                    departureTime: new Date(),
                    trafficModel: google.maps.TrafficModel.BEST_GUESS
                }
            };

            return new Promise((resolve, reject) => {
                this.apis.google.directionsService.route(request, (result, status) => {
                    if (status === 'OK') {
                        const route = result.routes[0];
                        const leg = route.legs[0];

                        resolve({
                            distance: leg.distance.value / 1000, // km
                            duration: leg.duration_in_traffic.value / 60, // dakika
                            trafficLevel: this.analyzeGoogleTraffic(route),
                            confidence: 0.9
                        });
                    } else {
                        reject(new Error('Google Traffic verisi alınamadı'));
                    }
                });
            });
        } catch (error) {
            console.error('Google Traffic hatası:', error);
            return this.getBaseTrafficData();
        }
    }

    // TomTom Traffic Data
    async getTomTomTrafficData(startLat, startLon, endLat, endLon) {
        if (!this.apis.tomtom) return this.getBaseTrafficData();

        try {
            const url = `${this.apis.tomtom.baseUrl}?key=${this.apis.tomtom.apiKey}&point=${startLat},${startLon}&point=${endLat},${endLon}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.flowSegmentData) {
                const flowData = data.flowSegmentData;
                return {
                    distance: flowData.length / 1000, // km
                    duration: this.calculateDurationFromFlow(flowData),
                    trafficLevel: this.analyzeTomTomTraffic(flowData),
                    confidence: 0.8
                };
            }
        } catch (error) {
            console.error('TomTom Traffic hatası:', error);
        }

        return this.getBaseTrafficData();
    }

    // HERE Traffic Data
    async getHereTrafficData(startLat, startLon, endLat, endLon) {
        if (!this.apis.here) return this.getBaseTrafficData();

        try {
            const bbox = this.calculateBoundingBox(startLat, startLon, endLat, endLon);
            const url = `${this.apis.here.baseUrl}?apiKey=${this.apis.here.apiKey}&bbox=${bbox}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.RWS && data.RWS[0]) {
                const rws = data.RWS[0];
                return {
                    distance: this.calculateDistance(startLat, startLon, endLat, endLon),
                    duration: this.calculateDurationFromHere(rws),
                    trafficLevel: this.analyzeHereTraffic(rws),
                    confidence: 0.85
                };
            }
        } catch (error) {
            console.error('HERE Traffic hatası:', error);
        }

        return this.getBaseTrafficData();
    }

    // Temel trafik verisi (API yoksa)
    getBaseTrafficData() {
        const trafficLevels = ['light', 'medium', 'heavy'];
        const randomLevel = trafficLevels[Math.floor(Math.random() * trafficLevels.length)];
        const baseDistance = this.calculateDistance(startLat, startLon, endLat, endLon);

        let trafficFactor = 1;
        switch (randomLevel) {
            case 'light': trafficFactor = 1.1; break;
            case 'medium': trafficFactor = 1.3; break;
            case 'heavy': trafficFactor = 1.6; break;
        }

        return {
            distance: baseDistance * trafficFactor,
            duration: (baseDistance * trafficFactor / 60) * 60, // dakika
            trafficLevel: randomLevel,
            confidence: 0.5
        };
    }

    // Yardımcı fonksiyonlar
    analyzeGoogleTraffic(route) {
        // Google route verilerinden trafik seviyesi analizi
        const congestionLevels = route.legs[0].via_waypoint || [];
        if (congestionLevels.length > 5) return 'heavy';
        if (congestionLevels.length > 2) return 'medium';
        return 'light';
    }

    analyzeTomTomTraffic(flowData) {
        const currentSpeed = flowData.currentSpeed;
        const freeFlowSpeed = flowData.freeFlowSpeed;
        const ratio = currentSpeed / freeFlowSpeed;

        if (ratio < 0.6) return 'heavy';
        if (ratio < 0.8) return 'medium';
        return 'light';
    }

    analyzeHereTraffic(rws) {
        const jamFactor = rws.jamFactor || 0;
        if (jamFactor > 0.7) return 'heavy';
        if (jamFactor > 0.4) return 'medium';
        return 'light';
    }

    calculateDurationFromFlow(flowData) {
        const currentSpeed = flowData.currentSpeed || 50; // km/saat
        const distance = flowData.length / 1000; // km
        return (distance / currentSpeed) * 60; // dakika
    }

    calculateDurationFromHere(rws) {
        const jamFactor = rws.jamFactor || 0;
        const baseSpeed = 60; // km/saat
        const adjustedSpeed = baseSpeed * (1 - jamFactor * 0.5);
        const distance = this.calculateDistance(startLat, startLon, endLat, endLon);
        return (distance / adjustedSpeed) * 60; // dakika
    }

    calculateBoundingBox(startLat, startLon, endLat, endLon) {
        const minLat = Math.min(startLat, endLat);
        const maxLat = Math.max(startLat, endLat);
        const minLon = Math.min(startLon, endLon);
        const maxLon = Math.max(startLon, endLon);
        return `${minLat},${minLon},${maxLat},${maxLon}`;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Dünya yarıçapı (km)
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    // API değiştir
    setApi(apiName) {
        if (this.apis[apiName]) {
            this.currentApi = apiName;
            console.log(`Trafik API'si ${apiName} olarak değiştirildi`);
        }
    }

    // Trafik verilerini aç/kapat
    setTrafficEnabled(enabled) {
        this.trafficEnabled = enabled;
    }
}

// Global instance
window.trafficManager = new TrafficDataManager(); 