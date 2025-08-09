/// <reference path="../../index.d.ts" />

const box = app.get("Block")
box.visible = false

console.log('Pig')

// Pig NPC using server-authoritative Controller + client prim model
// Mirrors the pattern in `npc.js` but replaces VRM/emotes with primitive parts & simple anims

const SEND_RATE = 0.33
const MAX_DISTANCE = 8
const DEG2RAD = Math.PI / 180

// Server: own the controller, drive simple idle/walk actions, replicate state
if (world.isServer) {
  const state = app.state

  // Controller
  const ctrl = app.create('controller', {
    radius: 0.25,
    height: 0.6,
    tag: 'pig'
  })
  ctrl.position.copy?.(app.position)
  world.add(ctrl)

  // Replication helpers
  const vMove = new Vector3()
  const vDir = new Vector3(0, 0, -1)
  let lastSend = 0

  // Actions: return a (delta)=> boolean finished
  const actions = [
    // Idle
    () => {
      let time = num(1, 3, 2)
      return (delta) => {
        state.ry = state.ry ?? 0
        state.e = 0 // idle
        time -= delta
        return time <= 0
      }
    },
    // Walk or Run (run is just faster anim)
    () => {
      // Choose heading
      let angle = num(0, 360) * DEG2RAD
      // Direction vector from yaw (forward is +Z to match visual shim)
      const eul = new Euler(0, angle, 0, 'YXZ')
      const qua = new Quaternion().setFromEuler(eul)
      vDir.set(0, 0, 1).applyQuaternion(qua)

      // Geo-fence toward app.position if far
      if (app.position.distanceTo?.(ctrl.position) > MAX_DISTANCE) {
        vDir.subVectors?.(app.position, ctrl.position)
        vDir.y = 0
        vDir.normalize?.()
        const base = Math.atan2(vDir.x, vDir.z)
        const offset = (Math.random() - 0.5) * 120 * DEG2RAD
        angle = base + offset
        const e2 = new Euler(0, angle, 0, 'YXZ')
        const q2 = new Quaternion().setFromEuler(e2)
        vDir.set(0, 0, 1).applyQuaternion(q2)
      }

      let time = num(1, 4, 2)
      const run = num(0, 1) === 1
      const speed = run ? 2.2 : 1.2
      return (delta) => {
        state.ry = angle
        vMove.copy?.(vDir).multiplyScalar?.(delta * speed)
        vMove.y = -9.81
        ctrl.move(vMove)
        state.px = ctrl.position.x
        state.py = ctrl.position.y
        state.pz = ctrl.position.z
        state.e = run ? 2 : 1 // 1=walk, 2=run
        time -= delta
        return time <= 0
      }
    },
  ]

  function getAction() { return actions[num(0, actions.length - 1)]() }
  let action = getAction()

  // Initialize state and notify clients
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

// Client: build prim pig, buffer-lerp to server state, and animate parts
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

    // Add an orientation shim so the pig faces -Z like the movement dir
    const orient = app.create('group')
    orient.rotation.y = -Math.PI / 2
    root.add(orient)

    // Model group (anim offsets applied here)
    const model = app.create('group')
    orient.add(model)

    // Build pig parts (pure visuals)
    const PINK = '#f4a7b9'
    const DARK_PINK = '#e2899f'
    const BLACK = '#222'

    const body = app.create('prim', {
      type: 'sphere',
      scale: [0.45, 0.32, 0.3],
      position: [0, 0.35, 0],
      color: PINK,
      roughness: 0.9,
    })
    const head = app.create('prim', {
      type: 'sphere',
      scale: [0.25, 0.22, 0.22],
      position: [0.35, 0.40, 0],
      color: PINK,
      roughness: 0.9,
    })
    const snout = app.create('prim', {
      type: 'cylinder',
      scale: [0.07, 0.1, 0.07],
      position: [0.48, 0.38, 0],
      rotation: [0, 0, Math.PI / 2],
      color: DARK_PINK,
      roughness: 0.7,
    })
    const earL = app.create('prim', {
      type: 'cone',
      scale: [0.07, 0.12, 0.07],
      position: [0.28, 0.52, 0.12],
      color: PINK,
      roughness: 0.8,
    })
    const earR = app.create('prim', {
      type: 'cone',
      scale: [0.07, 0.12, 0.07],
      position: [0.28, 0.52, -0.12],
      color: PINK,
      roughness: 0.8,
    })
    function leg(px, pz) {
      return app.create('prim', {
        type: 'box',
        scale: [0.08, 0.28, 0.08],
        position: [px, 0.14, pz],
        color: PINK,
        roughness: 0.9,
      })
    }
    const legFL = leg(0.18, 0.12)
    const legFR = leg(0.18, -0.12)
    const legBL = leg(-0.18, 0.12)
    const legBR = leg(-0.18, -0.12)
    const tail = app.create('prim', {
      type: 'torus',
      scale: [0.08, 0.02, 0.08],
      position: [-0.42, 0.43, 0],
      rotation: [0, Math.PI / 2, 0],
      color: PINK,
      roughness: 0.6,
    })
    const eyeL = app.create('prim', { type: 'sphere', scale: [0.02, 0.02, 0.02], position: [0.38, 0.45, 0.08], color: BLACK })
    const eyeR = app.create('prim', { type: 'sphere', scale: [0.02, 0.02, 0.02], position: [0.38, 0.45, -0.08], color: BLACK })

    model.add(body)
    model.add(head)
    model.add(snout)
    model.add(earL)
    model.add(earR)
    model.add(legFL)
    model.add(legFR)
    model.add(legBL)
    model.add(legBR)
    model.add(tail)
    model.add(eyeL)
    model.add(eyeR)

    // Buffering as in npc.js
    const position = new BufferedLerpVector3(root.position, SEND_RATE * 1.2)

    // Apply incoming state
    app.on('change', ([px, py, pz, ry, e]) => {
      position.push([px, py, pz])
      root.rotation.y = ry
      // e: 0 idle, 1 walk, 2 run
      model.userData = { gait: e }
    })

    // Simple anims driven by gait
    let t = 0
    app.on('update', (delta) => {
      position.update(delta)
      t += delta
      const gait = model.userData?.gait ?? 0
      const isMoving = gait === 1 || gait === 2
      const freq = gait === 2 ? 8.0 : gait === 1 ? 6.0 : 2.0
      const amp = gait === 2 ? 0.35 : gait === 1 ? 0.25 : 0.05
      const wobble = Math.sin(t * (freq * 0.35)) * (amp * 0.2)
      const bob = Math.sin(t * freq) * (amp * 0.04)
      model.rotation.set(0, wobble, wobble * 0.6)
      body.position.y = 0.35 + bob
      head.position.y = 0.40 + bob
      tail.rotation.z = Math.sin(t * (freq * 1.2)) * (isMoving ? 0.6 : 0.2)
      const swing = Math.sin(t * freq) * amp
      // Model forward is +X, so swing legs around Z
      legFL.rotation.z = swing
      legBR.rotation.z = swing
      legFR.rotation.z = -swing
      legBL.rotation.z = -swing
    })
  }
}