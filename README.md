# Journey Maps

A collaborative real-time drawing experience on a world map. Trace your journey and see others' paths unfold in real-time.

![Journey Maps](https://static.vecteezy.com/system/resources/previews/010/158/604/non_2x/white-background-of-world-map-with-line-art-design-free-vector.jpg)

## Features

- 🗺️ Draw on a world map by clicking to create connected paths
- 👥 See other users drawing in real-time
- 🎨 Each user gets a unique color
- ✨ Double-click to start a new path
- 🔮 Hidden easter egg... can you find it?

## Getting Started

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/madihg/journey-maps)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/madihg/journey-maps.git
   cd journey-maps
   ```

2. Serve the public folder:
   ```bash
   npx serve public
   ```

3. Open `http://localhost:3000` in your browser

## Enabling Real-time Collaboration

The app uses [Ably](https://ably.com) for real-time features. Without configuration, it runs in local-only mode (your drawings won't sync with others).

### To enable real-time sync:

1. Sign up for a free Ably account at [ably.com/signup](https://ably.com/signup)
2. Create an app and get your API key
3. Add your API key in `public/index.html` before the client.js script:

```html
<script>window.ABLY_KEY = 'your-ably-api-key-here';</script>
```

> ⚠️ **Note**: For production, you should use Ably's [token authentication](https://ably.com/docs/auth/token) instead of exposing your API key. This typically involves a small serverless function.

### Ably Free Tier

Ably's free tier includes:
- 6 million messages/month
- 200 peak connections
- More than enough for this project!

## How It Works

- Click on the map to place points
- Each subsequent click draws a line from the previous point
- Double-click to reset and start a new path
- See other users' paths appear in real-time (when Ably is configured)

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Real-time**: [Ably](https://ably.com) (replaces socket.io for serverless compatibility)
- **Hosting**: [Vercel](https://vercel.com) (static deployment)
- **No database required**: State is ephemeral, drawings exist only in active sessions

## Why Ably instead of Socket.io?

Vercel is a serverless platform, which means traditional WebSocket servers (like socket.io) don't work because:
- Serverless functions are stateless and short-lived
- They can't maintain persistent WebSocket connections

Ably provides a managed real-time infrastructure that works perfectly with serverless deployments.

## License

MIT
