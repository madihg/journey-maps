// PartyKit connection
let socket;
let userColor = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`;

// PartyKit host
const PARTYKIT_HOST = window.location.hostname === "localhost" 
  ? "localhost:1999" 
  : "journeymaps.madihg.partykit.dev";

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
      
      if (data.type === "draw") {
        // Convert normalized coordinates back to local screen coordinates
        const localX = data.nx * windowWidth;
        const localY = data.ny * windowHeight;
        const localPX = data.npx * windowWidth;
        const localPY = data.npy * windowHeight;
        
        stroke(data.color);
        strokeWeight(Math.max(5, windowWidth * 0.008)); // Responsive stroke
        line(localX, localY, localPX, localPY);
      } else if (data.type === "userCount") {
        document.getElementById('user-count').textContent = `${data.count} other(s) born on a map`;
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

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.position(0, 0);
  cnv.style('z-index', '2');
  clear(); // Transparent background
  
  connectToParty();
}

function draw() {
  // Empty draw loop needed for p5.js
}

// Handle both mouse and touch
function mouseDragged() {
  sendDrawing(mouseX, mouseY, pmouseX, pmouseY);
  return false; // Prevent default
}

function touchMoved() {
  if (touches.length > 0) {
    sendDrawing(touches[0].x, touches[0].y, pmouseX, pmouseY);
  }
  return false; // Prevent scrolling
}

function sendDrawing(x, y, px, py) {
  // Normalize coordinates to 0-1 range for cross-device sync
  const nx = x / windowWidth;
  const ny = y / windowHeight;
  const npx = px / windowWidth;
  const npy = py / windowHeight;
  
  if (socket && socket.readyState === WebSocket.OPEN) {
    let data = {
      type: "draw",
      nx: nx,
      ny: ny,
      npx: npx,
      npy: npy,
      color: userColor
    };
    socket.send(JSON.stringify(data));
  }
  
  // Draw locally for immediate feedback
  stroke(userColor);
  strokeWeight(Math.max(5, windowWidth * 0.008)); // Responsive stroke
  line(x, y, px, py);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  clear(); // Clear on resize (drawings will be lost locally but that's ok)
}

// Prevent touch scrolling on the canvas
document.addEventListener('touchmove', function(e) {
  if (e.target.tagName === 'CANVAS') {
    e.preventDefault();
  }
}, { passive: false });
