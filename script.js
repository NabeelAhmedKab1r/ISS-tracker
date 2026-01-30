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
        const response = await fetch('https://api.open-notify.org/iss-now.json');
        const data = await response.json();

        const lat = parseFloat(data.iss_position.latitude);
        const lon = parseFloat(data.iss_position.longitude);

        const newPosition = [lat, lon];

        marker.setLatLng(newPosition);
        map.setView(newPosition, 3);

        document.getElementById('lat').textContent = lat.toFixed(2);
        document.getElementById('lon').textContent = lon.toFixed(2);

    } catch (error) {
        console.error("ISS fetch failed:", error);
    }
}


// Update every 5 seconds
updateISS();
setInterval(updateISS, 5000);
