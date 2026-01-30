// Create map centered at Earth view
const map = L.map('map').setView([0, 0], 2);

// Add map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Create ISS icon
const issIcon = L.icon({
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
    iconSize: [50, 32],
});

// Add marker
const marker = L.marker([0, 0], { icon: issIcon }).addTo(map);

// Function to get ISS location
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





// Update every 5 seconds
updateISS();
setInterval(updateISS, 5000);
