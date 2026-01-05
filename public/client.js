// Journey Maps - Real-time collaborative drawing
// Using PartyKit for real-time communication

const mapImage = document.getElementById('map-image');
const svg = document.querySelector('svg');
const userCountElement = document.getElementById('user-count');

let socket;
let lastPoint = null;

// Color palette for users
const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];
let userColor = colors[Math.floor(Math.random() * colors.length)];

// PartyKit host
const PARTYKIT_HOST = window.location.hostname === "localhost" 
  ? "localhost:1999" 
  : "journey-maps.madihg.partykit.dev";

function connectToParty() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${PARTYKIT_HOST}/party/main`;
  
  socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    console.log("Connected to PartyKit");
  };
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === "drawLine") {
        // Drawing received from another user
        drawLine(data.from.x, data.from.y, data.to.x, data.to.y, data.color);
      } else if (data.type === "userCount") {
        // Update user count
        const count = data.count;
        userCountElement.textContent = count === 1 
          ? 'Born on a map' 
          : `${count} other(s) born on a map`;
      }
    } catch (e) {
      console.error("Error parsing message:", e);
    }
  };
  
  socket.onclose = () => {
    console.log("Disconnected from PartyKit, reconnecting...");
    setTimeout(connectToParty, 1000);
  };
  
  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
}

// Drawing functionality - click on image to draw
mapImage.addEventListener('click', function(e) {
  const rect = this.getBoundingClientRect();
  // Get click position relative to the image
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (lastPoint) {
    // Draw line from lastPoint to current point
    drawLine(lastPoint.x, lastPoint.y, x, y, userColor);
    
    // Broadcast to others via PartyKit
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "drawLine",
        from: lastPoint,
        to: { x, y },
        color: userColor
      }));
    }
  }
  
  // Update lastPoint
  lastPoint = { x, y };
});

function drawLine(x1, y1, x2, y2, color) {
  // Get the image's current position to align SVG lines
  const rect = mapImage.getBoundingClientRect();
  const containerRect = mapImage.parentElement.getBoundingClientRect();
  
  // Offset to align with image position within container
  const offsetX = rect.left - containerRect.left;
  const offsetY = rect.top - containerRect.top;
  
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1 + offsetX);
  line.setAttribute('y1', y1 + offsetY);
  line.setAttribute('x2', x2 + offsetX);
  line.setAttribute('y2', y2 + offsetY);
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', '3');
  line.setAttribute('stroke-linecap', 'round');
  svg.appendChild(line);
}

// Double-click to reset your path
mapImage.addEventListener('dblclick', function() {
  lastPoint = null;
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', connectToParty);
