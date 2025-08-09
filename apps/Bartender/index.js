/// <reference path="../../index.d.ts" />

const box = app.get("Block")
box.visible = false

console.log('Bartender NPC')

// Bartender NPC using server-authoritative Controller + client prim model
// Based on Pig.js but with bartender-specific behavior and appearance

const SEND_RATE = 0.33
const DEG2RAD = Math.PI / 180

// Server: own the controller, drive idle/walk/serve actions, replicate state
if (world.isServer) {
  const state = app.state

  // Controller - taller for human NPC
  const ctrl = app.create('controller', {
    radius: 0.3,
    height: 1.4,
    tag: 'bartender'
  })
  ctrl.position.copy?.(app.position)  // Spawn at app.position
  world.add(ctrl)

  // Extract Y rotation from quaternion
  const euler = new Euler()
  euler.setFromQuaternion(app.quaternion)
  const fixedRotation = euler.y  // Use app's Y rotation as fixed facing direction

  // Replication helpers
  let lastSend = 0

  // Actions: return a (delta)=> boolean finished
  const actions = [
    // Idle (standing behind bar)
    () => {
      let time = num(2, 5, 3)
      return (delta) => {
        state.ry = fixedRotation  // Always face same direction
        state.e = 0 // idle
        time -= delta
        return time <= 0
      }
    },
    // Cleaning/wiping motion
    () => {
      let time = num(2, 4, 3)
      return (delta) => {
        state.ry = fixedRotation  // Always face same direction
        state.e = 3 // cleaning animation
        time -= delta
        return time <= 0
      }
    },
    // Serving/pouring gesture
    () => {
      let time = num(1.5, 3, 2)
      return (delta) => {
        state.ry = fixedRotation  // Always face same direction
        state.e = 2 // serving animation
        time -= delta
        return time <= 0
      }
    },
  ]

  function getAction() { 
    // Weighted random - bartender idles, cleans, or serves
    const r = Math.random()
    if (r < 0.5) return actions[0]()      // 50% idle
    else if (r < 0.8) return actions[1]()  // 30% cleaning
    else return actions[2]()               // 20% serving
  }
  let action = getAction()

  // Initialize state at bar position
  state.px = ctrl.position.x
  state.py = ctrl.position.y
  state.pz = ctrl.position.z
  state.ry = 0
  state.e = 0
  state.ready = true
  app.send('init', state)

  app.on('fixedUpdate', (delta) => {
    const finished = action(delta)
    if (finished) action = getAction()

    // Replicate at ~3 Hz
    lastSend += delta
    if (lastSend > SEND_RATE) {
      lastSend = 0
      app.send('change', [state.px, state.py, state.pz, state.ry, state.e])
    }
  })
}

// Client: build humanoid bartender, buffer-lerp to server state, and animate
if (world.isClient) {
  if (app.state.ready) {
    init(app.state)
  } else {
    app.on('init', init)
  }

  function init(state) {
    // Root follows replicated pos/rot
    const root = app.create('group')
    root.position.set(state.px, state.py, state.pz)
    root.rotation.y = state.ry
    world.add(root)

    // Model group (anim offsets applied here)
    const model = app.create('group')
    root.add(model)

    // Build bartender parts (humanoid figure)
    const SKIN = '#f4d1ae'
    const HAIR = '#4a3728'
    const SHIRT = '#ffffff'
    const VEST = '#2c1810'
    const PANTS = '#1a1a1a'
    const SHOES = '#0a0a0a'
    const BLACK = '#000000'

    // Body parts - adjusted to be on ground
    const torso = app.create('prim', {
      type: 'box',
      scale: [0.4, 0.6, 0.25],
      position: [0, 1.0, 0],
      color: VEST,
      roughness: 0.8,
    })
    
    const shirt = app.create('prim', {
      type: 'box',
      scale: [0.38, 0.58, 0.24],
      position: [0, 1.0, 0],
      color: SHIRT,
      roughness: 0.9,
    })
    
    const head = app.create('prim', {
      type: 'sphere',
      scale: [0.18, 0.22, 0.18],
      position: [0, 1.45, 0],
      color: SKIN,
      roughness: 0.85,
    })
    
    const hair = app.create('prim', {
      type: 'sphere',
      scale: [0.19, 0.15, 0.19],
      position: [0, 1.55, 0],
      color: HAIR,
      roughness: 0.9,
    })
    
    // Arms - positioned from shoulder, pivoting at top
    const armL = app.create('group')
    armL.position.set(0.25, 1.25, 0)
    const armLMesh = app.create('prim', {
      type: 'box',
      scale: [0.1, 0.5, 0.1],
      position: [0, -0.25, 0],  // Offset down from pivot
      color: SHIRT,
      roughness: 0.9,
    })
    armL.add(armLMesh)
    
    const armR = app.create('group')
    armR.position.set(-0.25, 1.25, 0)
    const armRMesh = app.create('prim', {
      type: 'box',
      scale: [0.1, 0.5, 0.1],
      position: [0, -0.25, 0],  // Offset down from pivot
      color: SHIRT,
      roughness: 0.9,
    })
    armR.add(armRMesh)
    
    const handL = app.create('prim', {
      type: 'sphere',
      scale: [0.08, 0.08, 0.08],
      position: [0, -0.5, 0],  // At end of arm
      color: SKIN,
      roughness: 0.85,
    })
    armL.add(handL)
    
    const handR = app.create('prim', {
      type: 'sphere',
      scale: [0.08, 0.08, 0.08],
      position: [0, -0.5, 0],  // At end of arm
      color: SKIN,
      roughness: 0.85,
    })
    armR.add(handR)
    
    // Legs - positioned from hip, pivoting at top
    const legL = app.create('group')
    legL.position.set(0.12, 0.7, 0)
    const legLMesh = app.create('prim', {
      type: 'box',
      scale: [0.12, 0.6, 0.12],
      position: [0, -0.3, 0],  // Offset down from pivot
      color: PANTS,
      roughness: 0.85,
    })
    legL.add(legLMesh)
    
    const legR = app.create('group')
    legR.position.set(-0.12, 0.7, 0)
    const legRMesh = app.create('prim', {
      type: 'box',
      scale: [0.12, 0.6, 0.12],
      position: [0, -0.3, 0],  // Offset down from pivot
      color: PANTS,
      roughness: 0.85,
    })
    legR.add(legRMesh)
    
    const footL = app.create('prim', {
      type: 'box',
      scale: [0.12, 0.08, 0.2],
      position: [0, -0.65, 0.04],  // At end of leg
      color: SHOES,
      roughness: 0.7,
    })
    legL.add(footL)
    
    const footR = app.create('prim', {
      type: 'box',
      scale: [0.12, 0.08, 0.2],
      position: [0, -0.65, 0.04],  // At end of leg
      color: SHOES,
      roughness: 0.7,
    })
    legR.add(footR)
    
    // Face features - eyes closer to head surface
    const eyeL = app.create('prim', { 
      type: 'sphere', 
      scale: [0.02, 0.02, 0.02], 
      position: [0.05, 1.48, 0.15], 
      color: BLACK 
    })
    const eyeR = app.create('prim', { 
      type: 'sphere', 
      scale: [0.02, 0.02, 0.02], 
      position: [-0.05, 1.48, 0.15], 
      color: BLACK 
    })
    
    // Optional: Bar towel (attached to hand)
    const towel = app.create('prim', {
      type: 'box',
      scale: [0.15, 0.02, 0.1],
      position: [0, -0.5, 0.1],  // Relative to arm
      color: '#e8e8e8',
      roughness: 0.95,
    })
    armR.add(towel)

    // Add all parts to model
    model.add(torso)
    model.add(shirt)
    model.add(head)
    model.add(hair)
    model.add(armL)
    model.add(armR)
    model.add(legL)
    model.add(legR)
    model.add(eyeL)
    model.add(eyeR)

    // Buffering for smooth movement
    const position = new BufferedLerpVector3(root.position, SEND_RATE * 1.2)

    // Apply incoming state
    app.on('change', ([px, py, pz, ry, e]) => {
      position.push([px, py, pz])
      root.rotation.y = ry
      // e: 0 idle, 2 serving, 3 cleaning
      model.userData = { action: e }
    })

    // Animate based on action
    let t = 0
    app.on('update', (delta) => {
      position.update(delta)
      t += delta
      const action = model.userData?.action ?? 0
      
      // Serving animation (pouring motion)
      if (action === 2) {
        armR.rotation.x = -0.8
        armR.rotation.z = 0.3
        towel.visible = false
        // Pouring motion
        const pour = Math.sin(t * 2) * 0.2
        armR.rotation.x = -0.8 + pour
      }
      // Cleaning animation (wiping motion)
      else if (action === 3) {
        armR.rotation.x = -0.4
        const wipe = Math.sin(t * 4) * 0.3
        armR.rotation.y = wipe
        towel.visible = true
      }
      // Idle animation
      else {
        // Reset positions
        armL.rotation.x = 0
        armL.rotation.z = 0
        armR.rotation.x = 0
        armR.rotation.y = 0
        armR.rotation.z = 0
        legL.rotation.x = 0
        legR.rotation.x = 0
        towel.visible = true
        // Gentle breathing
        const breathe = Math.sin(t * 2) * 0.01
        torso.scale.y = 0.6 + breathe
        shirt.scale.y = 0.58 + breathe
        model.position.y = breathe * 0.5
      }
    })
  }
}