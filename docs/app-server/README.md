## @drama.haus/app-server

Hyperfy app development server and CLI. Spin up a local HTTP/WebSocket server to build, link, and hot‑reload Hyperfy apps from your filesystem. Includes a small CLI for common workflows.

## Quick start

### Using npx

```bash
npx @drama.haus/app-server           # starts the server (hot reload ON by default)
npx @drama.haus/app-server list      # runs the CLI 'list' command
```

### Local dev

```bash
git clone <your-fork-or-repo>
cd app-server
npm install

# start dev server
npm run dev
```

Server starts on `http://localhost:8080` and WebSocket on `ws://localhost:8080/`.

---

## Installation options

- Run ad‑hoc with npx (no install):
  ```bash
  npx @drama.haus/app-server
  ```
- Install on your local

```bash
# inside your existing project
npm i -D @drama.haus/app-server

# add an npm script in your project's package.json
# {
#   "scripts": {
#     "hyperfy:server": "npx @drama.haus/app-server",
#     "hyperfy:server:nohot": "npx @drama.haus/app-server --no-hot-reload"
#   }
# }

# run it
npm run hyperfy:server
```

The package ships a single binary entry that dispatches to:
- `server.js` when invoked with no positional args (or only flags)
- `cli.js` when invoked with a positional command (e.g., `list`, `deploy`)

---

## Hot reload

Hot reload is ON by default. The server watches:
- `apps/<appName>/index.js` (script changes)
- `apps/<appName>/links.json` (link/blueprint overrides changes)

Disable/enable:
- CLI flags: `--no-hot-reload` (off), `--hot-reload` (on)
- Env var: `HOT_RELOAD=false|0` (off), anything else or unset defaults to ON

Examples:
```bash
npx @drama.haus/app-server --no-hot-reload
HOT_RELOAD=false npx @drama.haus/app-server
```

---

## Project layout (generated at runtime)

```
apps/
  <appName>/
    index.js         # your app script
    blueprint.json   # defaults captured at link time (optional)
    links.json       # minimal overrides + linkage metadata
    assets/          # downloaded assets (e.g., glb, png, audio)
```

The server stores only minimal blueprint overrides in `links.json`, computed against `blueprint.json` defaults. Assets referenced via `asset://<hash>.<ext>` will be fetched from the connected client and saved under `assets/`.

---

## CLI usage

Run via npx or the installed binary. All commands talk to the local server at `HYPERFY_APP_SERVER_URL` (default `http://localhost:8080`).

```bash
npx @drama.haus/app-server create <appName>
npx @drama.haus/app-server list
npx @drama.haus/app-server deploy <appName>
npx @drama.haus/app-server update <appName> [scriptPath]
npx @drama.haus/app-server validate <appName>
npx @drama.haus/app-server reset [--force]
npx @drama.haus/app-server status
```

### Environment
- `HYPERFY_APP_SERVER_URL` — override server URL for CLI (default: `http://localhost:8080`)

### Common flows
- Create: generates `apps/<appName>/index.js` and basic structure
- Deploy: pushes the app to all connected clients via WebSocket
- Update: posts the current `index.js` to the server (useful without file watching)
- Validate: checks `index.js` integrity against a script hash stored in `config.json` (legacy helper)
- Reset: clears local `apps/` and server state (with confirmation unless `--force`)

---

## HTTP API (server)

Base URL: `http://localhost:8080`

### Health
- `GET /health` → `{ status, connectedClients, timestamp }`

### Apps
- `GET /api/apps` → list local apps and their assets
- `GET /api/apps/:appName` → get one app (404 if not found)
- `POST /api/apps/:appName` → create a new app
  - body: `{ name?, model?, position?, props? }`
- `POST /api/apps/:appName/script` → update script
  - body: `{ script: string }`
- `POST /api/apps/:appName/deploy` → deploy to all connected clients
  - body: `{ position?: [x,y,z] }`

### Linking
- `GET /api/linked-apps?worldUrl=<url>` → list apps linked to a world
- `GET /api/apps/is-linked?blueprintId=<id>&worldUrl=<url>` → `{ isLinked }`
- `POST /api/apps/:appName/link` → link to a world
  - body: `{ linkInfo: { worldUrl, assetsUrl?, blueprint: { id, name, version?, model?, script?, props? ... } } }`
- `POST /api/apps/:appName/unlink` → unlink from all worlds
- `POST /api/apps/:appName/deploy-linked` → deploy a linked app to its world
  - body: `{ linkInfo, script?, config? }`

### Reset
- `POST /api/reset` → clears server state and local `apps/`

Notes:
- The server persists linkage data in `apps/<appName>/links.json` as minimal overrides.
- On link, defaults are written to `blueprint.json` if not already present.

---

## WebSocket protocol

URL: `ws://localhost:8080/`

### Client → Server messages
- `{ type: 'auth', userId, authToken?, worldUrl }` — registers the connection for a world
- `{ type: 'ping' }` — heartbeat → server responds `{ type: 'pong' }`
- `{ type: 'asset_response', requestId, success, content?, error? }` — respond with asset data
- `{ type: 'request_model_content', requestId, modelUrl }` — ask server to send model file (by `asset://hash.ext`)
- `{ type: 'blueprint_modified', blueprint }` — notify server that a linked blueprint changed in the client
- `{ type: 'blueprint_response', requestId, success, blueprint?, error? }` — respond with current blueprint data

### Server → Client messages
- `{ type: 'auth_success', userId }`
- `{ type: 'apps_list', apps }` — initial list after auth
- `{ type: 'deploy_app', app }` — push app payload (script/model/props)
- `{ type: 'request_asset', requestId, assetUrl, assetType }` — request an asset; client replies with `asset_response`
- `{ type: 'request_blueprint', requestId, blueprintId, appName }` — request current blueprint; client replies with `blueprint_response`
- `{ type: 'model_content_response', requestId, success, content?, error? }` — base64 model content back to client
- `{ type: 'server_reset', message }`
- `{ type: 'app_linked' | 'app_unlinked', appName, linkInfo? }`
- `{ type: 'error', error }`

Asset URL convention: `asset://<sha256-hash>.<ext>` (e.g., `asset://d2ab...c3.js`). The server hashes local files and maps them for quick resolution.

---

## Programmatic usage and custom service handlers

You can embed the server in your own tooling and implement the HTTP/WS behavior by providing a "service handler" object. The server wires routes to the methods of the service you pass to `start(service)`.

### Minimal example

```js
// dev-server.js (in your project)
import { HyperfyAppServer } from '@drama.haus/app-server'

class MyServiceHandler {
  // HTTP routes
  async handleGetApps() { return { success: true, apps: [] } }
  async handleGetLinkedApps(worldUrl) { return { success: true, apps: [] } }
  async handleGetAppIsLinked(blueprintId, worldUrl) { return { success: true, isLinked: false } }
  async handleGetApp(appName) { return { success: false, error: 'Not found', statusCode: 404 } }
  async handleCreateApp(appName, body) { return { success: true, message: `Created ${appName}` } }
  async handleUpdateAppScript(appName, body) { return { success: true, message: `Updated ${appName}` } }
  async handleDeploy(appName, body) { return { success: true, message: `Deployed ${appName}` } }
  async handleDeployLinked(appName, body) { return { success: true, message: `Linked deploy ${appName}` } }
  async handleLink(appName, body) { return { success: true, message: `Linked ${appName}` } }
  async handleUnlink(appName) { return { success: true, message: `Unlinked ${appName}` } }
  async handleReset() { return { success: true, message: 'Reset complete' } }
}

async function main() {
  const port = process.env.PORT || 8080
  const server = new HyperfyAppServer(port, {
    hotReload: true, // or use env/flags
    fastifyOptions: { logger: false }
  })

  // Optional: subscribe to WebSocket events
  server.addConnectionHandler((ws, req) => {
    console.log('client connected')
  })
  server.addMessageHandler('ping', (ws, msg) => {
    // custom handling if desired (server auto-responds to ping already)
  })

  await server.start(new MyServiceHandler())
}

main()
```

Then add an npm script in your project:

```json
{
  "scripts": {
    "dev:hyperfy": "node dev-server.js"
  }
}
```

### Handler contract

If you provide your own handler, implement the methods the HTTP routes call:
- `handleGetApps()`
- `handleGetLinkedApps(worldUrl)`
- `handleGetAppIsLinked(blueprintId, worldUrl)`
- `handleGetApp(appName)`
- `handleCreateApp(appName, body)`
- `handleUpdateAppScript(appName, body)`
- `handleDeploy(appName, body)`
- `handleDeployLinked(appName, body)`
- `handleLink(appName, body)`
- `handleUnlink(appName)`
- `handleReset()`

Additionally, you can listen to WebSocket events by subscribing on the `HyperfyAppServer` instance:
- `connection`, `disconnect`, `websocket_error`
- Per-message type event names (e.g., `'auth'`, `'blueprint_modified'`, `'asset_response'`, `'request_model_content'`, `'blueprint_response'`)

Use `server.sendMessage(ws, payload)` or `server.broadcast(payload)` to push messages to clients.

Note: The packaged default handler (`HyperfyAppServerHandler`) provides a robust filesystem-based implementation with hot reload, asset hashing, blueprint diffing, and linking. If you need that behavior, prefer running the binary directly via npx or reusing the package as a CLI in your scripts. When you implement a custom handler, you are responsible for these behaviors.

---

## Development details

### Entry points
- `bin.js` — dispatcher; with no positional args runs `server.js`, otherwise forwards to `cli.js`
- `server.js` — Fastify HTTP + WebSocket server; emits/handles events via `EventEmitter`
- `cli.js` — HTTP client to the local server for app workflows

### Core classes
- `HyperfyAppServer` — transport/server: Fastify routes + WebSocket wiring
- `HyperfyAppServerHandler` — domain/service: filesystem, linking, deploy, hot reload, asset plumbing

### Environment variables
- `PORT` — HTTP/WebSocket port (default `8080`)
- `HOT_RELOAD` — `'false'|'0'` to disable, otherwise enabled by default
- `HYPERFY_APP_SERVER_URL` — CLI server URL

---

## Recipes

### Create and deploy an app
```bash
npx @drama.haus/app-server                     # start server
npx @drama.haus/app-server create myApp        # scaffold app
# edit apps/myApp/index.js
npx @drama.haus/app-server deploy myApp
```

### Link an existing blueprint via API
```bash
curl -X POST http://localhost:8080/api/apps/myApp/link \
  -H 'Content-Type: application/json' \
  -d '{
    "linkInfo": {
      "worldUrl": "https://example.world",
      "assetsUrl": "https://assets.example.world",
      "blueprint": {
        "id": "my-app-id",
        "name": "My App",
        "version": 1,
        "model": "asset://<hash>.glb",
        "script": "asset://<hash>.js",
        "props": { }
      }
    }
  }'
```

### Disable hot reload
```bash
npx @drama.haus/app-server --no-hot-reload
# or
HOT_RELOAD=false npx @drama.haus/app-server
```

---

## Contributing

1. Fork and clone the repo
2. Make changes
3. Run locally with `npm run dev`
4. Submit a PR

Please keep code readable and avoid reformatting unrelated areas. Linting is minimal; prefer clear naming and small functions.

---

## License

MIT


