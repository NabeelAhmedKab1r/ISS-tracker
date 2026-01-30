// Create the map with world bounds locked
const map = L.map('map', {
    worldCopyJump: false,
    maxBounds: [
        [-90, -180],
        [90, 180]
    ],
    maxBoundsViscosity: 1.0
}).setView([0, 0], 2);

// Base map layer (no wrap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    noWrap: true
}).addTo(map);

// 🌃 NASA Night Lights Overlay (also no wrap)
const nightLayer = L.tileLayer(
    'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg',
    {
        opacity: 0.4,
        attribution: 'NASA Earth Observatory',
        noWrap: true
    }
).addTo(map);

// Create ISS icon
const issIcon = L.icon({
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
    iconSize: [50, 32],
});

// Add ISS marker
const marker = L.marker([0, 0], { icon: issIcon }).addTo(map);

// Trail path storage
let pathCoordinates = [];
let pathLine = L.polyline(pathCoordinates, {
    color: 'cyan',
    weight: 3
}).addTo(map);

// Fetch ISS data and update map
async function updateISS() {
    try {
        const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        const data = await response.json();

        const lat = data.latitude;
        const lon = data.longitude;

        const newPosition = [lat, lon];

        marker.setLatLng(newPosition);
        map.setView(newPosition, 3);

        document.getElementById('lat').textContent = lat.toFixed(2);
        document.getElementById('lon').textContent = lon.toFixed(2);

        pathCoordinates.push(newPosition);
        if (pathCoordinates.length > 60) pathCoordinates.shift();
        pathLine.setLatLngs(pathCoordinates);

    } catch (error) {
        console.error("ISS fetch failed:", error);
    }
}

// Initial update
updateISS();

// Update every 5 seconds
setInterval(updateISS, 5000);
