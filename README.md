# Journey Maps

A collaborative real-time drawing experience on a world map. Trace your journey and see others' paths unfold in real-time.

## Features

- 🗺️ Draw on a world map by clicking to create connected paths
- 👥 See other users drawing in real-time
- 🎨 Each user gets a unique color
- ✨ Double-click to start a new path
- 🔮 Hidden easter egg... can you find it?

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (hosted on Vercel)
- **Real-time**: [PartyKit](https://partykit.io) for WebSocket connections
- **No database required**: State is ephemeral, drawings exist only in active sessions

## Deployment

This project requires two deployments:

### 1. Deploy PartyKit Server (real-time backend)

```bash
# Install dependencies
npm install

# Deploy to PartyKit
npm run deploy:partykit
```

After deploying, you'll get a URL like `journey-maps.YOUR_USERNAME.partykit.dev`

Update `public/client.js` with your PartyKit URL:
```javascript
const PARTYKIT_HOST = window.location.hostname === "localhost" 
  ? "localhost:1999" 
  : "journey-maps.YOUR_USERNAME.partykit.dev";  // <- Update this
```

### 2. Deploy Frontend to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/madihg/journey-maps)

Or manually:
1. Push to GitHub
2. Import the repo in Vercel
3. Deploy (it will use the `public/` folder)

## Local Development

```bash
# Install dependencies
npm install

# Start PartyKit dev server (runs on localhost:1999)
npm run dev

# Open public/index.html in your browser, or serve it:
npx serve public
```

## How It Works

1. Click on the map to place points
2. Each subsequent click draws a line from the previous point
3. Double-click to reset and start a new path
4. See other users' paths appear in real-time

## Project Structure

```
journey-maps/
├── party/
│   └── index.ts      # PartyKit server (handles real-time sync)
├── public/
│   ├── index.html    # Frontend
│   └── client.js     # Client-side WebSocket logic
├── partykit.json     # PartyKit configuration
├── vercel.json       # Vercel configuration
└── package.json
```

## License

MIT
