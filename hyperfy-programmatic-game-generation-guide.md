# Hyperfy Programmatic Game Generation Guide

## Core Concepts for Procedural Game Development

### 1. Foundation: App-Based Architecture
When generating games programmatically in Hyperfy, think in terms of **Apps** - self-contained units that combine models and scripts. Each app runs in both client and server contexts, making them ideal building blocks for procedural content.

**Key Insight**: Design your generator to create modular apps that can communicate via the event system, allowing for complex behaviors from simple components.

### 2. Node System as Scene Graph
The node hierarchy is your primary tool for world construction. Every game element is a node with:
- Transform properties (position, rotation, scale)
- Parent-child relationships
- Type-specific behaviors

**Generation Strategy**:
```javascript
// Example: Procedural terrain generator
function generateTerrain(width, height) {
  const terrain = app.create('Group')
  for (let x = 0; x < width; x++) {
    for (let z = 0; z < height; z++) {
      const tile = app.create('Mesh', {
        mesh: 'cube',
        position: [x * 2, Math.random() * 0.5, z * 2]
      })
      terrain.add(tile)
    }
  }
  return terrain
}
```

### 3. Physics-Driven Gameplay
Leverage the built-in physics system for emergent gameplay:
- **RigidBody** nodes for physics objects
- **Collider** nodes for triggers and boundaries
- **Controller** nodes for AI/NPC movement

**Generation Pattern**: Create physics puzzles by procedurally placing RigidBody objects with different masses and Collider triggers that activate game events.

### 4. Multiplayer by Default
Design generators with networking in mind:
- Server generates authoritative world state
- Clients receive initial snapshot via `app.state`
- Use `app.send()` for synchronized events

**Critical Pattern**:
```javascript
// Server-side generation
if (world.isServer) {
  app.state.gameMap = generateMap()
  app.state.spawnPoints = generateSpawnPoints()
}

// Client-side initialization
if (world.isClient) {
  renderMap(app.state.gameMap)
}
```

### 5. Dynamic Property System
Use the props configuration for runtime customization:
```javascript
app.configure({
  mapSize: { type: 'range', min: 10, max: 100, initial: 50 },
  difficulty: { type: 'switch', options: ['easy', 'normal', 'hard'] },
  seed: { type: 'number', initial: Date.now() }
})
```

This allows users to modify generation parameters without code changes.

## Practical Game Generation Patterns

### Pattern 1: Procedural Level Generation
```javascript
function generateLevel() {
  const level = app.create('Group')
  
  // Generate platforms
  const platforms = generatePlatforms(props.platformCount)
  platforms.forEach(p => level.add(p))
  
  // Add physics
  platforms.forEach(p => {
    const body = app.create('RigidBody', { type: 'static' })
    const collider = app.create('Collider', { shape: 'box' })
    body.add(collider)
    p.add(body)
  })
  
  // Add collectibles
  const items = generateCollectibles(props.itemCount)
  items.forEach(item => {
    const trigger = app.create('Collider', { trigger: true })
    trigger.on('triggerenter', player => {
      if (player.isPlayer) collectItem(item)
    })
    item.add(trigger)
    level.add(item)
  })
  
  return level
}
```

### Pattern 2: Wave-Based Enemy Spawning
```javascript
function spawnWave(waveNumber) {
  const enemies = []
  const count = Math.floor(5 + waveNumber * 2)
  
  for (let i = 0; i < count; i++) {
    const enemy = app.create('Group')
    const mesh = app.create('Mesh', { mesh: 'sphere' })
    const controller = app.create('Controller')
    
    enemy.add(mesh)
    enemy.add(controller)
    
    // AI behavior
    enemy.update = () => {
      const player = world.getLocalPlayer()
      if (player) {
        const direction = player.position.clone().sub(enemy.position).normalize()
        controller.move(direction.multiplyScalar(0.1))
      }
    }
    
    enemies.push(enemy)
    world.add(enemy)
  }
  
  return enemies
}
```

### Pattern 3: Procedural Puzzle Rooms
```javascript
function generatePuzzleRoom(difficulty) {
  const room = app.create('Group')
  
  // Walls with collision
  const walls = generateWalls()
  walls.forEach(wall => {
    const collider = app.create('Collider', { shape: 'box' })
    wall.add(collider)
    room.add(wall)
  })
  
  // Interactive elements
  const buttons = []
  const doors = []
  
  for (let i = 0; i < difficulty; i++) {
    const button = app.create('Action', {
      prompt: `Button ${i + 1}`,
      distance: 3,
      hold: 1
    })
    
    button.on('action', player => {
      app.send('buttonPressed', { id: i, player: player.id })
    })
    
    buttons.push(button)
    room.add(button)
  }
  
  // Logic gates
  if (world.isServer) {
    let pressed = new Set()
    app.on('buttonPressed', data => {
      pressed.add(data.id)
      if (pressed.size === difficulty) {
        openDoors()
      }
    })
  }
  
  return room
}
```

## Advanced Generation Techniques

### 1. Seeded Random Generation
Use deterministic randomness for reproducible worlds:
```javascript
class SeededRandom {
  constructor(seed) {
    this.seed = seed
  }
  
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }
  
  range(min, max) {
    return min + this.next() * (max - min)
  }
}

const rng = new SeededRandom(props.seed)
```

### 2. LOD-Aware Generation
Generate content with performance in mind:
```javascript
function generateWithLOD(distance) {
  if (distance < 50) {
    return generateHighDetail()
  } else if (distance < 100) {
    return generateMediumDetail()
  } else {
    return generateLowDetail()
  }
}
```

### 3. Biome-Based World Generation
```javascript
const biomes = {
  forest: {
    trees: ['oak', 'pine', 'birch'],
    groundColor: 0x2d5016,
    fogDensity: 0.02
  },
  desert: {
    trees: ['cactus', 'deadTree'],
    groundColor: 0xc19a6b,
    fogDensity: 0.005
  }
}

function generateBiome(type, size) {
  const biome = biomes[type]
  const world = app.create('Group')
  
  // Terrain
  const ground = app.create('Mesh', {
    mesh: 'plane',
    scale: [size, 1, size],
    material: { color: biome.groundColor }
  })
  
  // Vegetation
  for (let i = 0; i < size * 2; i++) {
    const treeType = biome.trees[Math.floor(Math.random() * biome.trees.length)]
    const tree = generateTree(treeType)
    tree.position = [
      (Math.random() - 0.5) * size,
      0,
      (Math.random() - 0.5) * size
    ]
    world.add(tree)
  }
  
  return world
}
```

## Performance Optimization Strategies

### 1. Instance-Based Generation
Leverage Hyperfy's automatic instancing:
```javascript
// Good: Creates instances automatically
for (let i = 0; i < 1000; i++) {
  const cube = app.create('Mesh', { mesh: 'cube' })
  cube.position = [i * 2, 0, 0]
  world.add(cube)
}
```

### 2. Chunk-Based Loading
```javascript
class ChunkManager {
  constructor(chunkSize = 16) {
    this.chunks = new Map()
    this.chunkSize = chunkSize
  }
  
  getChunk(x, z) {
    const key = `${Math.floor(x / this.chunkSize)},${Math.floor(z / this.chunkSize)}`
    if (!this.chunks.has(key)) {
      this.chunks.set(key, this.generateChunk(x, z))
    }
    return this.chunks.get(key)
  }
  
  generateChunk(x, z) {
    // Generate chunk content
  }
}
```

### 3. Event-Driven Generation
Only generate content when needed:
```javascript
app.on('playerNearby', position => {
  if (!isGenerated(position)) {
    generateArea(position)
  }
})
```

## Networking Considerations

### 1. Server-Authoritative Generation
```javascript
if (world.isServer) {
  // Generate on server
  const dungeon = generateDungeon()
  app.state.dungeon = serializeDungeon(dungeon)
  
  // Send to clients
  app.on('enter', player => {
    app.send('dungeonData', app.state.dungeon, player.networkId)
  })
}

if (world.isClient) {
  app.on('dungeonData', data => {
    renderDungeon(deserializeDungeon(data))
  })
}
```

### 2. Predictive Generation
```javascript
// Client predicts next areas
const predictedChunks = predictNextChunks(player.position, player.velocity)
predictedChunks.forEach(chunk => {
  preloadChunk(chunk)
})
```

## Essential Utilities for Game Generation

### 1. Spatial Partitioning
```javascript
class SpatialGrid {
  constructor(cellSize) {
    this.cellSize = cellSize
    this.grid = new Map()
  }
  
  add(object, position) {
    const key = this.getKey(position)
    if (!this.grid.has(key)) {
      this.grid.set(key, new Set())
    }
    this.grid.get(key).add(object)
  }
  
  getNearby(position, radius) {
    const nearby = []
    const cells = this.getCellsInRadius(position, radius)
    cells.forEach(cell => {
      if (this.grid.has(cell)) {
        this.grid.get(cell).forEach(obj => nearby.push(obj))
      }
    })
    return nearby
  }
}
```

### 2. Procedural Animation
```javascript
function animateGeneration(nodes, duration = 1000) {
  const startTime = Date.now()
  
  app.on('update', () => {
    const progress = Math.min((Date.now() - startTime) / duration, 1)
    const eased = easeOutCubic(progress)
    
    nodes.forEach((node, i) => {
      const delay = i * 0.05
      const nodeProgress = Math.max(0, Math.min((progress - delay) / (1 - delay), 1))
      node.scale = [nodeProgress, nodeProgress, nodeProgress]
      node.position[1] = (1 - nodeProgress) * 5
    })
    
    if (progress >= 1) {
      app.off('update', arguments.callee)
    }
  })
}
```

## Testing Generated Content

### 1. Automated Validation
```javascript
function validateGeneration(world) {
  const checks = [
    () => world.children.length > 0,
    () => hasSpawnPoint(world),
    () => isTraversable(world),
    () => hasWinCondition(world)
  ]
  
  return checks.every(check => check())
}
```

### 2. Performance Profiling
```javascript
function profileGeneration(generator, iterations = 100) {
  const times = []
  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    generator()
    times.push(performance.now() - start)
  }
  
  return {
    average: times.reduce((a, b) => a + b) / times.length,
    max: Math.max(...times),
    min: Math.min(...times)
  }
}
```

## Conclusion

Hyperfy provides a robust foundation for programmatic game generation with its combination of:
- Flexible node system for world building
- Built-in physics and collision detection
- Networking infrastructure for multiplayer
- Property system for runtime configuration
- Rich interaction and control systems

The key to successful procedural generation in Hyperfy is to:
1. Design modular, reusable components
2. Leverage the server-client architecture appropriately
3. Use the event system for loose coupling
4. Optimize for performance with instancing and LOD
5. Test generated content for playability and performance

By combining these patterns and techniques, you can create sophisticated procedural game experiences that scale from simple puzzle games to complex multiplayer worlds.