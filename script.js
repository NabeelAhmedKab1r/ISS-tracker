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

let followISS = true;
let previousPosition = null;

const followBtn = document.getElementById("follow-btn");

followBtn.addEventListener("click", () => {
    followISS = !followISS;
    followBtn.textContent = followISS ? "Follow ISS: ON" : "Follow ISS: OFF";
    followBtn.classList.toggle("off", !followISS);

    if (followISS) {
        visibilityCircle.addTo(map);
    } else {
        map.removeLayer(visibilityCircle);
    }
});


// Base OpenStreetMap layer (no repeating)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    noWrap: true
}).addTo(map);

// 🌃 NASA Night Lights Overlay
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

// Rotatable ISS icon
const issIcon = L.icon({
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
    iconSize: [50, 32],
    iconAnchor: [25, 16]
});

// Marker with rotation support
const marker = L.marker([0, 0], {
    icon: issIcon,
    rotationAngle: 0
}).addTo(map);

// Trail line
let pathCoordinates = [];
let pathLine = L.polyline(pathCoordinates, {
    color: 'cyan',
    weight: 3
}).addTo(map);

//  Visibility circle
let visibilityCircle = L.circle([0, 0], {
    radius: 1200000,
    color: '#00eaff',
    weight: 1,
    opacity: 0.5,
    fillOpacity: 0.03
}).addTo(map);


// Calculate direction angle between two points
function getBearing(lat1, lon1, lat2, lon2) {
    const toRad = deg => deg * Math.PI / 180;
    const toDeg = rad => rad * 180 / Math.PI;

    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x =
        Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
        Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

    return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Update ISS position
async function updateISS() {
    try {
        const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        const data = await response.json();

        const lat = data.latitude;
        const lon = data.longitude;
        const newPosition = [lat, lon];

        marker.setLatLng(newPosition);
        visibilityCircle.setLatLng(newPosition);

        // Rotate ISS icon in movement direction
        if (previousPosition) {
            const bearing = getBearing(
                previousPosition[0],
                previousPosition[1],
                lat,
                lon
            );
            marker.setRotationAngle(bearing);
        }

        previousPosition = newPosition;

        if (followISS) {
            map.setView(newPosition, 3);
        }

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
