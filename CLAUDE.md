# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hyperfy app development starter kit that provides a local development environment for building 3D interactive virtual world applications. The project uses the Hyperfy framework to create apps that run both on server and client, with real-time networking, physics simulation, and WebXR support.

## Architecture

### Core Structure
- `apps/` - Contains individual Hyperfy applications
  - `apps/<appName>/index.js` - Main app script (runs on both server and client)
  - `apps/<appName>/blueprint.json` - App configuration and defaults
  - `apps/<appName>/links.json` - World linking metadata and overrides
  - `apps/<appName>/assets/` - Downloaded assets (GLB models, textures, audio)

### Development Server
- Local HTTP/WebSocket server at `http://localhost:8080`
- Hot reload enabled by default for `index.js` and `links.json` changes
- Real-time deployment to linked worlds via WebSocket

### Hyperfy App System
- Apps run in both server and client environments
- Use `world.isServer` / `world.isClient` to branch logic
- Core APIs: `app`, `world`, `props`, `utils`
- Component-based node system for 3D objects

## Common Development Commands

```bash
# Start the Hyperfy development server (hot reload enabled)
npm run hyperfy:server
# or
npx @drama.haus/app-server

# Disable hot reload
npm run hyperfy:server -- --no-hot-reload
HOT_RELOAD=false npm run hyperfy:server

# CLI commands (run against local server)
npx @drama.haus/app-server create <appName>
npx @drama.haus/app-server list
npx @drama.haus/app-server deploy <appName>
npx @drama.haus/app-server update <appName> [scriptPath]
npx @drama.haus/app-server reset [--force]
```

## Development Workflow

1. Start the local server: `npm run hyperfy:server`
2. In your Hyperfy world, enable dev features with `PUBLIC_DEV_SERVER=true`
3. Become admin: `/admin <code>` (if required)
4. Link apps via Dev Tools sidebar → pick app → inspector → Link icon
5. Edit `apps/<appName>/index.js` - changes auto-deploy in ~1-2 seconds

## App Script Patterns

### Environment Branching
Always check environment before using APIs:
```js
if (world.isServer) {
  // Server-only logic
}
if (world.isClient) {
  // Client-only logic
}
```

### Configuration & Props
```js
app.configure([
  { key: 'title', type: 'text', label: 'Title', initial: 'Hello' },
  { key: 'size', type: 'range', label: 'Size', min: 0.5, max: 3, initial: 1 }
])
// Access via props.title, props.size
```

### Event Management
```js
// Subscribe to updates only when needed
app.on('update', handleUpdate)
// Clean up when done
app.off('update', handleUpdate)
```

### Cross-Environment Messaging
```js
// Client to server
app.send('eventName', data)

// Server handling
app.on('eventName', (data) => {
  // Broadcast to all clients
  app.send('response', result)
})
```

### Node Creation and Management
```js
// Create 3D objects
const cube = app.create('mesh')
const text = app.create('text', { value: 'Hello' })

// Reference nodes from GLB models (use UpperCamelCase in Blender)
const modelNode = app.get('NodeId')
```

---

for tips on primitives, see `docs/primitives.md`

## Key Documentation Paths

- App scripting: `docs/hyperfy/scripting/app/App.md`
- World API: `docs/hyperfy/scripting/world/World.md` 
- Networking: `docs/hyperfy/scripting/Networking.md`
- Node types: `docs/hyperfy/scripting/nodes/Node.md`
- Props system: `docs/hyperfy/scripting/app/Props.md`
- Model formats: `docs/hyperfy/supported-files/models.md`
- Server details: `docs/app-server/README.md`

## Best Practices

- Use `utils.num(min, max, dp)` instead of `Math.random()`
- Clean up event listeners with `app.off()` to prevent memory leaks
- Subscribe to `update` events only when necessary for performance
- Use UpperCamelCase for object names in Blender for GLB exports
- Assets are referenced as `asset://<hash>.<ext>` and auto-downloaded
- Keep scripts in single `index.js` files unless you have a build process