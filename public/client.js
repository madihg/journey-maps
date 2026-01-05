// PartyKit connection
let socket;
let userColor = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.8)`;
let lastPoint = null; // Store last click position

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
        const x = data.nx * windowWidth;
        const y = data.ny * windowHeight;
        
        // Draw dot
        fill(data.color);
        noStroke();
        ellipse(x, y, 10, 10);
        
        // Draw line if there's a previous point
        if (data.hasPrev) {
          const px = data.npx * windowWidth;
          const py = data.npy * windowHeight;
          stroke(data.color);
          strokeWeight(3);
          line(px, py, x, y);
        }
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

// Click to place dots and draw lines
function mousePressed() {
  // Ignore clicks on the input field
  if (mouseY > windowHeight - 60 && mouseX < 350) return;
  
  const x = mouseX;
  const y = mouseY;
  
  // Normalize coordinates to 0-1 range for cross-device sync
  const nx = x / windowWidth;
  const ny = y / windowHeight;
  
  // Draw dot locally
  fill(userColor);
  noStroke();
  ellipse(x, y, 10, 10);
  
  // Draw line from last point if exists
  if (lastPoint) {
    stroke(userColor);
    strokeWeight(3);
    line(lastPoint.x, lastPoint.y, x, y);
  }
  
  // Send to others
  if (socket && socket.readyState === WebSocket.OPEN) {
    let data = {
      type: "draw",
      nx: nx,
      ny: ny,
      npx: lastPoint ? lastPoint.x / windowWidth : null,
      npy: lastPoint ? lastPoint.y / windowHeight : null,
      hasPrev: lastPoint !== null,
      color: userColor
    };
    socket.send(JSON.stringify(data));
  }
  
  // Update last point
  lastPoint = { x, y };
}

// Double-click to reset path (start fresh)
function doubleClicked() {
  lastPoint = null;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  clear();
  lastPoint = null; // Reset on resize
}

// Touch support
function touchStarted() {
  if (touches.length > 0) {
    // Simulate mouse press at touch location
    mouseX = touches[0].x;
    mouseY = touches[0].y;
    mousePressed();
  }
  return false; // Prevent default
}
