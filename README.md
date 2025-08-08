## Hyperfy App Scripting with Claude Code — Starter Kit

Build, link, and hot‑reload Hyperfy apps from your local filesystem while coding with an AI assistant. This repo includes:

- A local Hyperfy app development server (HTTP + WebSocket) for hot reload and linking to live worlds
- Embedded docs for Hyperfy scripting APIs and the app server CLI
- A beginner‑friendly workflow designed for pair‑programming with Claude Code (or any LLM)

If you’re new, follow the Quick Start. If you’re an LLM, jump to LLM Prompting Guide.

### What you’ll accomplish
- Start the local Hyperfy app server
- Link a local app to a running world and hot‑reload script changes
- Write an `apps/<appName>/index.js` script that uses `app`, `world`, `props` and utilities


### Prerequisites
- Node.js 22.11+ installed
- A running Hyperfy world with dev features enabled and admin access
  - Set `PUBLIC_DEV_SERVER=true` in the client env (see `docs/hyperfy/App-server.md` for overview; full world docs are upstream)


## Quick Start (human TL;DR)

1) Install and open this repo

```bash
git clone https://github.com/peezy/threejs-vibe-coding-starter-kit.git
cd threejs-vibe-coding-starter-kit
npm install
```

2) Start the Hyperfy app server (hot reload ON)

```bash
npm run hyperfy:server
# or
npx @drama.haus/app-server
```

3) Start your world with dev features and become admin
- Ensure `PUBLIC_DEV_SERVER=true` when starting the client
- In‑world, use `/admin <code>` if your world requires an admin code (see `docs/hyperfy/commands.md`)

4) Link a local app from the world
- Open Sidebar → Dev Tools (gear icon). It should show Connected to `http://localhost:8080`
- Pick an app in the Apps pane → open its inspector → click the Link (chain) icon
- This creates `apps/<appName>/` on your machine and associates it with your world

5) Edit and hot‑reload
- Edit `apps/<appName>/index.js`
- The server watches the file and deploys to the linked world in ~1–2s

For details on the dev server, CLI, HTTP API, and WS protocol, see `docs/app-server/README.md`.


## Project layout created by the app server

```
apps/
  <appName>/
    index.js         # your app script
    blueprint.json   # defaults captured at link time (optional)
    links.json       # minimal overrides + linkage metadata
    assets/          # downloaded assets (e.g., glb, png, audio)
```

- Hot reload is ON by default. Disable with `--no-hot-reload` or `HOT_RELOAD=false`.
- Referenced assets may appear as `asset://<hash>.<ext>` and be fetched into `assets/`.


## Script anatomy (the 90‑second tour)

Hyperfy app scripts run both on the server and on each client. Use `world.isServer` / `world.isClient` to branch logic.

Minimal skeleton for `apps/<appName>/index.js`:

```js
// Optional UI config shown in the app’s inspector
app.configure([
  { key: 'title', type: 'text', label: 'Title', initial: 'Hello Hyperfy' },
  { key: 'size', type: 'range', label: 'Size', min: 0.5, max: 3, step: 0.1, initial: 1 }
])

// Example: create a dynamic mesh (see Nodes API)
if (world.isClient) {
  const cube = app.create('mesh')
  cube.scale.set(props.size, props.size, props.size)

  // Receive per‑frame updates only when needed
  app.on('update', (dt) => {
    cube.rotation.y += dt * 0.8
  })
}

// Simple client↔server message
if (world.isClient) {
  app.send('hello', { who: 'client' })
}

if (world.isServer) {
  app.on('hello', (data) => {
    // Broadcast current title to all clients
    app.send('set-title', { title: props.title })
  })
}

// Update title on clients
if (world.isClient) {
  app.on('set-title', ({ title }) => {
    // e.g., attach a text node or set UI (see Nodes API)
    // const text = app.create('text', { value: title })
  })
}
```

Core APIs you’ll use (see detailed docs below):
- `app`: instance lifecycle, events, node creation, cross‑env messaging
- `world`: players, events, physics raycast, world‑space nodes, utilities
- `props`: reactive values from `app.configure([...])`
- `utils`: helpers like `num(min,max,dp)` and selected `three.js` classes

Deep‑dive references in this repo:
- `docs/hyperfy/scripting/app/App.md`
- `docs/hyperfy/scripting/world/World.md`
- `docs/hyperfy/scripting/Networking.md`
- `docs/hyperfy/scripting/Utils.md`
- `docs/hyperfy/scripting/nodes/Node.md` and types
- `docs/hyperfy/scripting/app/Props.md`
- `docs/hyperfy/commands.md`


## Common tasks (with pointers)

- Create/find nodes: `app.create('mesh' | 'text' | ... )`, `app.get('NodeIdFromModel')`
  - See `docs/hyperfy/scripting/nodes/Node.md` and node types
- Configure UI: `app.configure([...])` → read via `props.key`
  - See `docs/hyperfy/scripting/app/Props.md`
- Per‑frame logic: `app.on('update' | 'fixedUpdate' | 'lateUpdate', cb)` and `app.off(...)`
  - See `docs/hyperfy/scripting/app/App.md`
- Networking: `app.send`, `app.on`, `app.emit`, `world.on`, `world.isServer`, `world.isClient`
  - See `docs/hyperfy/scripting/Networking.md`
- Players: `world.getPlayer()`, `world.getPlayers()`, teleport, voice levels, effects
  - See `docs/hyperfy/scripting/world/Player.md`
- Physics raycast and layers: `world.raycast`, `world.createLayerMask`
  - See `docs/hyperfy/scripting/world/World.md`
- Utilities: `num(min,max,dp)`, `Vector3/Quaternion/Euler/Matrix4`, `fetch()`
  - See `docs/hyperfy/scripting/Utils.md`
- Models and naming: Blender → GLB → nodes (use UpperCamelCase for object names)
  - See `docs/hyperfy/supported-files/models.md`


## Using the Dev Server CLI

Run via `npx @drama.haus/app-server` or `npm run hyperfy:server`. Selected commands:

```bash
npm run hyperfy:server create <appName>
npm run hyperfy:server list
npm run hyperfy:server deploy <appName>
npm run hyperfy:server update <appName> [scriptPath]
npm run hyperfy:server reset [--force]
```

Server defaults to `http://localhost:8080` (WS at `/`). Environment override: `HYPERFY_APP_SERVER_URL`. Full details: `docs/app-server/README.md`.


## LLM Prompting Guide (for Claude Code or similar)

When helping a user write a Hyperfy app script, gather this context first:
- World info: admin access, `PUBLIC_DEV_SERVER=true`, world URL if relevant
- App info: `appName`, whether model nodes already exist, any `asset://` references
- Desired behavior: server vs client behavior, events, per‑frame logic, interactions
- UI config: planned `app.configure([...])` fields and their types
- Networking: which events flow client→server, server→clients, or cross‑app
- Performance constraints: only subscribe to `update` when needed; call `app.off` when done

Ground rules for generated code:
- Always check `world.isServer` / `world.isClient` before using env‑specific APIs
- Prefer `num(min,max,dp)` over `Math.random()`
- Use `app.on`/`app.off` to manage event lifecycles; don’t leave hot update loops running
- Use `app.get('NodeId')` to reference nodes exported from a GLB; advise UpperCamelCase naming in Blender
- Use `app.configure([...])` + `props.key` for user‑tunable settings
- Use `app.emit` + `world.on` for same‑env cross‑app signals and `app.send`/`app.on` for cross‑env messages
- Keep scripts single‑file `index.js` unless you have a build step; rely on server hot reload

Starter prompt you can paste into Claude Code:

```text
You are coding a Hyperfy app script. Target file: apps/<appName>/index.js.
Environment: Hyperfy app server running locally with hot reload; world Dev Tools linked to this app.

Please generate a complete script that:
- Adds configurable props via app.configure([...]) for <list fields>
- On clients, creates or finds nodes <describe nodes> and applies behavior <describe>
- Uses app.on('update') only when necessary and cleans up with app.off when done
- Sends an event from client to server to <describe>, and broadcasts results to clients
- Uses utils.num(...) if randomness is needed
- Guards world.isServer / world.isClient appropriately

Also provide brief instructions where to click in Dev Tools to link and redeploy if needed.
```


## Troubleshooting
- Dev Tools shows Disconnected: ensure the server is running at `http://localhost:8080` (see `docs/app-server/README.md` → Health)
- No Dev Tools: ensure `PUBLIC_DEV_SERVER=true` and you’re admin (`/admin <code>`)
- Changes don’t apply: confirm you linked the app and are editing `apps/<appName>/index.js` on disk
- Too many updates: ensure you subscribe to `update` only when needed and call `app.off`
- Assets not found: check for `asset://<hash>.<ext>` resolution, see server docs on asset fetching


## Learn more
- Hyperfy overview and dev quick start: `docs/hyperfy/App-server.md`
- App server details (CLI, HTTP, WS, hot reload): `docs/app-server/README.md`
- Scripting reference:
  - `docs/hyperfy/scripting/app/App.md`
  - `docs/hyperfy/scripting/world/World.md`
  - `docs/hyperfy/scripting/Networking.md`
  - `docs/hyperfy/scripting/Utils.md`
  - `docs/hyperfy/scripting/nodes/Node.md` and types
  - `docs/hyperfy/scripting/app/Props.md`
  - `docs/hyperfy/supported-files/models.md`

