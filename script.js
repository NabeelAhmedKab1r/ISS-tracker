// Create the map with bounds and zoom limits
const map = L.map('map', {
    worldCopyJump: false,
    maxBounds: [
        [-90, -180],
        [90, 180]
    ],
    maxBoundsViscosity: 1.0,
    minZoom: 2,
    maxZoom: 6
}).setView([0, 0], 2);

// Base OpenStreetMap layer (no repeating)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    noWrap: true
}).addTo(map);

// 🌃 NASA Night Lights Overlay (limited zoom range)
const nightLayer = L.tileLayer(
    'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg',
    {
        opacity: 0.4,
        attribution: 'NASA Earth Observatory',
        noWrap: true,
        minZoom: 2,
        maxZoom: 6
    }
).addTo(map);

// ISS icon
const issIcon = L.icon({
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
    iconSize: [50, 32],
});

// Marker
const marker = L.marker([0, 0], { icon: issIcon }).addTo(map);

// Trail
let pathCoordinates = [];
let pathLine = L.polyline(pathCoordinates, {
    color: 'cyan',
    weight: 3
}).addTo(map);

// Update ISS position
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

// Run updates
updateISS();
setInterval(updateISS, 5000);
