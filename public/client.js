// Journey Maps - Real-time collaborative drawing
// Using PartyKit for real-time communication

const mapImage = document.getElementById('map-image');
const svg = document.querySelector('svg');
const userCountElement = document.getElementById('user-count');
const connectionStatus = document.getElementById('connection-status');

let socket;
let lastPoint = null;

// Color palette for users
const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];
let userColor = colors[Math.floor(Math.random() * colors.length)];

// PartyKit host - update this after deploying your PartyKit server
const PARTYKIT_HOST = window.location.hostname === "localhost" 
  ? "localhost:1999" 
  : "journey-maps.madihg.partykit.dev";  // Update with your PartyKit URL after deploy

function connectToParty() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${PARTYKIT_HOST}/party/main`;
  
  socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    console.log("Connected to PartyKit");
    updateConnectionStatus('connected', 'Connected');
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
          ? 'You are here' 
          : `${count} travelers drawing`;
      }
    } catch (e) {
      console.error("Error parsing message:", e);
    }
  };
  
  socket.onclose = () => {
    console.log("Disconnected from PartyKit, reconnecting...");
    updateConnectionStatus('disconnected', 'Reconnecting...');
    setTimeout(connectToParty, 1000);
  };
  
  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    updateConnectionStatus('failed', 'Connection error');
  };
}

function updateConnectionStatus(status, text) {
  if (connectionStatus) {
    connectionStatus.className = `status-${status}`;
    connectionStatus.title = text;
  }
}

// Drawing functionality
mapImage.addEventListener('click', function(e) {
  const rect = this.getBoundingClientRect();
  // Calculate position as percentage of image size for responsive scaling
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;

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
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  // Use percentage-based coordinates
  line.setAttribute('x1', x1 + '%');
  line.setAttribute('y1', y1 + '%');
  line.setAttribute('x2', x2 + '%');
  line.setAttribute('y2', y2 + '%');
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', '2');
  line.setAttribute('stroke-linecap', 'round');
  svg.appendChild(line);
  
  // Add subtle animation
  line.style.opacity = '0';
  requestAnimationFrame(() => {
    line.style.transition = 'opacity 0.3s ease';
    line.style.opacity = '1';
  });
}

// Double-click to reset your path
mapImage.addEventListener('dblclick', function() {
  lastPoint = null;
  // Visual feedback
  const indicator = document.createElement('div');
  indicator.className = 'path-reset';
  indicator.textContent = 'New path started';
  document.body.appendChild(indicator);
  setTimeout(() => indicator.remove(), 1500);
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', connectToParty);
