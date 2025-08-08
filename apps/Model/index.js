// Massive Forest Generator - 10,000 trees and shrubs
class MassiveForest {
  constructor() {
    this.treeCount = 7000
    this.shrubCount = 3000
    this.forestRadius = 500
    this.gridSize = 100 // For spatial optimization
    this.cellSize = this.forestRadius * 2 / this.gridSize
  }
  
  // Fast random position generator with grid-based distribution
  getGridPosition(index, total, radius) {
    // Use golden ratio for better distribution
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    const theta = index * goldenAngle
    const r = Math.sqrt(index / total) * radius
    
    // Add small random offset for natural look
    const jitter = 2
    return [
      Math.cos(theta) * r + (Math.random() - 0.5) * jitter,
      0,
      Math.sin(theta) * r + (Math.random() - 0.5) * jitter
    ]
  }
  
  // Create simple optimized tree
  createSimpleTree(type, position) {
    const scale = 0.8 + Math.random() * 0.4
    
    // Tree trunk with built-in physics
    const trunkHeight = (8 + Math.random() * 4) * scale
    const trunkRadius = (0.5 + Math.random() * 0.3) * scale
    const trunk = app.create('prim', {
      type: 'cylinder',
      size: [trunkRadius, trunkRadius, trunkHeight],
      color: '#3e2a1f',
      physics: 'static'
    })
    trunk.position.x = position[0]
    trunk.position.y = position[1] + trunkHeight / 2
    trunk.position.z = position[2]
    app.add(trunk)
    
    if (type === 'pine') {
      // Simple pine - single cone
      const coneHeight = (10 + Math.random() * 5) * scale
      const coneRadius = (4 + Math.random() * 2) * scale
      const cone = app.create('prim', {
        type: 'cone',
        size: [coneRadius, coneHeight],
        color: '#1a4d0c'
      })
      cone.position.x = position[0]
      cone.position.y = position[1] + trunkHeight + coneHeight / 2
      cone.position.z = position[2]
      app.add(cone)
    } else if (type === 'oak') {
      // Simple oak - single sphere
      const canopyRadius = (6 + Math.random() * 3) * scale
      const canopy = app.create('prim', {
        type: 'sphere',
        size: [canopyRadius],
        color: '#2d5016'
      })
      canopy.position.x = position[0]
      canopy.position.y = position[1] + trunkHeight + canopyRadius * 0.8
      canopy.position.z = position[2]
      app.add(canopy)
    } else {
      // Birch variant - cylinder canopy
      const canopyHeight = (6 + Math.random() * 2) * scale
      const canopyRadius = (3 + Math.random() * 1) * scale
      const canopy = app.create('prim', {
        type: 'cylinder',
        size: [canopyRadius, canopyRadius, canopyHeight],
        color: '#4a7c2e'
      })
      canopy.position.x = position[0]
      canopy.position.y = position[1] + trunkHeight + canopyHeight / 2
      canopy.position.z = position[2]
      app.add(canopy)
    }
  }
  
  // Create detailed shrub with multiple spheres
  createSimpleShrub(position) {
    const baseSize = 0.6 + Math.random() * 0.4
    
    // Main bush body with built-in physics
    const mainRadius = baseSize * 0.8
    const mainBush = app.create('prim', {
      type: 'sphere',
      size: [mainRadius],
      color: '#2d4a1c',
      physics: 'static'
    })
    mainBush.position.x = position[0]
    mainBush.position.y = position[1] + mainRadius * 0.7
    mainBush.position.z = position[2]
    app.add(mainBush)
    
    // Add 2-3 smaller spheres for detail (no physics on these for performance)
    const numDetails = 2 + Math.floor(Math.random() * 2)
    for (let i = 0; i < numDetails; i++) {
      const detailRadius = mainRadius * (0.5 + Math.random() * 0.3)
      const angle = (Math.PI * 2 * i) / numDetails
      const offset = mainRadius * 0.6
      
      const detail = app.create('prim', {
        type: 'sphere',
        size: [detailRadius],
        color: '#3a5f2a'
      })
      detail.position.x = position[0] + Math.cos(angle) * offset
      detail.position.y = position[1] + detailRadius * 0.6
      detail.position.z = position[2] + Math.sin(angle) * offset
      app.add(detail)
    }
  }
  
  // Generate the massive forest
  generate() {
    console.log('Generating massive forest with 10,000 objects...')
    
    // Generate trees in batches for better performance
    const treeTypes = ['pine', 'oak', 'birch']
    const batchSize = 100
    
    // Trees
    for (let batch = 0; batch < Math.ceil(this.treeCount / batchSize); batch++) {
      const start = batch * batchSize
      const end = Math.min(start + batchSize, this.treeCount)
      
      for (let i = start; i < end; i++) {
        const treeType = treeTypes[Math.floor(Math.random() * treeTypes.length)]
        const position = this.getGridPosition(i, this.treeCount, this.forestRadius)
        this.createSimpleTree(treeType, position)
      }
    }
    
    // Shrubs
    for (let batch = 0; batch < Math.ceil(this.shrubCount / batchSize); batch++) {
      const start = batch * batchSize
      const end = Math.min(start + batchSize, this.shrubCount)
      
      for (let i = start; i < end; i++) {
        const position = this.getGridPosition(
          i + this.treeCount, 
          this.treeCount + this.shrubCount, 
          this.forestRadius * 0.95
        )
        this.createSimpleShrub(position)
      }
    }
    
    // Add some atmospheric particles for scale
    this.createAtmosphere()
    
    console.log('Forest generation complete!')
  }
  
  // Add atmospheric effects
  createAtmosphere() {
    // Subtle fog particles
    const fog = app.create('particles', {
      shape: ['box', 1000, 50, 1000, 1, 'volume', false],
      rate: 5,
      max: 100,
      life: '20~30',
      speed: '0.02~0.05',
      size: '10~20',
      color: '#ffffff',
      alpha: '0.05~0.15',
      space: 'world'
    })
    fog.position.x = 0
    fog.position.y = 10
    fog.position.z = 0
    app.add(fog)
    
    // Distant birds
    const birds = app.create('particles', {
      shape: ['sphere', 300, 0],
      rate: 2,
      max: 20,
      life: '30~60',
      speed: '5~10',
      size: '0.5~1',
      color: '#000000',
      alpha: '0.8',
      space: 'world'
    })
    birds.position.x = 0
    birds.position.y = 100
    birds.position.z = 0
    birds.velocityOrbital = new Vector3(0, 1, 0)
    app.add(birds)
    
    // Sunlight rays
    const sunlight = app.create('particles', {
      shape: ['cone', 100, 0.5, 15],
      rate: 3,
      max: 50,
      life: '10~20',
      speed: '0.5~1',
      size: '5~15',
      color: '#fff8dc',
      alpha: '0.1~0.2',
      emissive: '0.5',
      blending: 'additive',
      space: 'world',
      direction: 0.1
    })
    sunlight.position.x = 0
    sunlight.position.y = 150
    sunlight.position.z = 0
    sunlight.force = new Vector3(0, -2, 0)
    app.add(sunlight)
  }
}

// Initialize and generate the massive forest
const forest = new MassiveForest()
forest.generate()

// Note: Physics is already enabled on individual prims using the physics: 'static' property