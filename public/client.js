// Journey Maps - Real-time collaborative drawing
// Using Ably for real-time communication (works with Vercel serverless)

const mapImage = document.getElementById('map-image');
const svg = document.querySelector('svg');
const userCountElement = document.getElementById('user-count');
const connectionStatus = document.getElementById('connection-status');

let lastPoint = null;
let userColor = generateColor();
let ably = null;
let channel = null;
let clientId = generateClientId();

// Color palette for users
const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

function generateColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function generateClientId() {
  return 'user_' + Math.random().toString(36).substr(2, 9);
}

// Initialize Ably connection
async function initRealtime() {
  // Using Ably's token authentication for client-side
  // For production, you'd want to set up token auth via your own endpoint
  // For demo purposes, we use an anonymous connection with a public demo key
  
  const ABLY_KEY = window.ABLY_KEY || 'demo'; // Set your Ably API key
  
  if (ABLY_KEY === 'demo') {
    // Fallback to local-only mode if no API key
    console.log('No Ably API key set - running in local-only mode');
    updateConnectionStatus('local', 'Local mode');
    setupLocalOnlyMode();
    return;
  }

  try {
    ably = new Ably.Realtime({
      key: ABLY_KEY,
      clientId: clientId
    });

    ably.connection.on('connected', () => {
      console.log('Connected to Ably');
      updateConnectionStatus('connected', 'Connected');
    });

    ably.connection.on('disconnected', () => {
      updateConnectionStatus('disconnected', 'Reconnecting...');
    });

    ably.connection.on('failed', () => {
      updateConnectionStatus('failed', 'Connection failed');
      setupLocalOnlyMode();
    });

    // Subscribe to the journey-maps channel
    channel = ably.channels.get('journey-maps');

    // Listen for lines drawn by others
    channel.subscribe('drawLine', (message) => {
      if (message.clientId !== clientId) {
        const data = message.data;
        drawLine(data.from.x, data.from.y, data.to.x, data.to.y, data.color);
      }
    });

    // Track presence (user count)
    await channel.presence.enter({ color: userColor });

    channel.presence.subscribe('enter', updateUserCount);
    channel.presence.subscribe('leave', updateUserCount);

    // Initial user count
    updateUserCount();

  } catch (error) {
    console.error('Failed to connect to Ably:', error);
    updateConnectionStatus('failed', 'Offline mode');
    setupLocalOnlyMode();
  }
}

function setupLocalOnlyMode() {
  // In local mode, drawing still works but isn't shared
  userCountElement.textContent = 'Drawing locally';
}

async function updateUserCount() {
  if (!channel) return;
  
  try {
    const members = await channel.presence.get();
    const count = members.length;
    userCountElement.textContent = count === 1 
      ? 'You are here' 
      : `${count} travelers drawing`;
  } catch (error) {
    console.error('Error getting presence:', error);
  }
}

function updateConnectionStatus(status, text) {
  if (connectionStatus) {
    connectionStatus.className = `status-${status}`;
    connectionStatus.textContent = text;
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
    
    // Broadcast to others
    if (channel) {
      channel.publish('drawLine', {
        from: lastPoint,
        to: { x, y },
        color: userColor
      });
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
document.addEventListener('DOMContentLoaded', initRealtime);
