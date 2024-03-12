const socket = io();
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const mapContainer = document.getElementById('map-container');
const mapImage = document.getElementById('map-image');
const points = []; // Local storage of points

// Adjust canvas size to match the map image
canvas.width = mapImage.offsetWidth;
canvas.height = mapImage.offsetHeight;

mapContainer.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const point = { x: x / canvas.width, y: y / canvas.height }; // Normalize points

    points.push(point);
    drawLine();
    socket.emit('drawLine', point); // Send point to server
});

function drawLine() {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x * canvas.width, points[0].y * canvas.height);
    points.forEach(point => ctx.lineTo(point.x * canvas.width, point.y * canvas.height));
    ctx.stroke();
}

// Listen for line drawing from other users
socket.on('drawLine', (point) => {
    points.push(point);
    drawLine();
});
