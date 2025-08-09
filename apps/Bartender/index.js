/// <reference path="../../index.d.ts" />

const box = app.get("Block")
box.visible = false

// Bartender NPC: server-authoritative controller + client-side prim humanoid with simple anims

const SEND_RATE = 0.33
const HOME = new Vector3(4.5, 0.01, 0) // behind the bar from Tavern script
const MAX_DISTANCE = 2.5 // bartender stays near HOME
const DEG2RAD = Math.PI / 180

// Server: controller with idle/patrol/serve actions
if (world.isServer) {
  const state = app.state

  const ctrl = app.create('controller', { radius: 0.3, height: 1.0, tag: 'bartender' })
  // Set initial position before adding (avoid teleport before controller is initialized)
  ctrl.position.set(HOME.x, HOME.y, HOME.z)
  world.add(ctrl)

  const vMove = new Vector3()
  const vDir = new Vector3(0, 0, 1)
  let lastSend = 0

  // actions: idle (wipe glass), pace (short walk), serve (face door)
  const actions = [
    // idle wipe
    () => {
      let time = num(2, 5, 2)
      return (delta) => {
        state.act = 'idle'
        state.ry = state.ry ?? 0
        // slowly face into the bar area (toward -X in Tavern)
        state.ry = -Math.PI / 2
        state.px = ctrl.position.x
        state.py = ctrl.position.y
        state.pz = ctrl.position.z
        time -= delta
        return time <= 0
      }
    },
    // short pace behind the bar
    () => {
      // pick a small offset around HOME
      const offset = (Math.random() - 0.5) * 2.0
      const target = new Vector3(HOME.x, HOME.y, HOME.z + offset)
      return (delta) => {
        state.act = 'walk'
        const to = target.clone().sub(ctrl.position)
        to.y = 0
        const dist = Math.max(0.0001, Math.hypot(to.x, to.z))
        const angle = Math.atan2(to.x, to.z)
        state.ry = angle
        vDir.set(0, 0, 1).applyEuler?.(new Euler(0, angle, 0, 'YXZ'))
        vMove.copy?.(vDir).multiplyScalar?.(delta * 1.0)
        vMove.y = -9.81
        ctrl.move(vMove)
        state.px = ctrl.position.x
        state.py = ctrl.position.y
        state.pz = ctrl.position.z
        return dist < 0.05
      }
    },
    // glance/serve toward door briefly
    () => {
      let time = num(1, 2, 2)
      // face toward door (Tavern door is at z negative, x ~ 0)
      const toDoorAngle = Math.atan2(0 - ctrl.position.x, -4 - ctrl.position.z) // approximate door in front
      return (delta) => {
        state.act = 'serve'
        state.ry = toDoorAngle
        state.px = ctrl.position.x
        state.py = ctrl.position.y
        state.pz = ctrl.position.z
        time -= delta
        return time <= 0
      }
    },
  ]

  function getAction() { return actions[num(0, actions.length - 1)]() }
  let action = getAction()

  // initial state
  state.px = ctrl.position.x
  state.py = ctrl.position.y
  state.pz = ctrl.position.z
  state.ry = -Math.PI / 2
  state.act = 'idle'
  state.ready = true
  app.send('init', state)

  app.on('fixedUpdate', (delta) => {
    // keep within bar bounds near HOME
    const dx = ctrl.position.x - HOME.x
    const dz = ctrl.position.z - HOME.z
    const dist = Math.hypot(dx, dz)
    if (dist > MAX_DISTANCE) {
      const angle = Math.atan2(HOME.x - ctrl.position.x, HOME.z - ctrl.position.z)
      vDir.set(0, 0, 1).applyEuler?.(new Euler(0, angle, 0, 'YXZ'))
      vMove.copy?.(vDir).multiplyScalar?.(delta * 1.5)
      vMove.y = -9.81
      ctrl.move(vMove)
      state.act = 'walk'
      state.ry = angle
      state.px = ctrl.position.x
      state.py = ctrl.position.y
      state.pz = ctrl.position.z
    } else {
      const finished = action(delta)
      if (finished) action = getAction()
    }

    // replicate
    lastSend += delta
    if (lastSend > SEND_RATE) {
      lastSend = 0
      app.send('change', [state.px, state.py, state.pz, state.ry, state.act])
    }
  })
}

// Client: build simple humanoid and animate per state
if (world.isClient) {
  if (app.state.ready) {
    init(app.state)
  } else {
    app.on('init', init)
  }

  function init(state) {
    const root = app.create('group')
    root.position.set(state.px, state.py, state.pz)
    root.rotation.y = state.ry
    world.add(root)

    const model = app.create('group')
    // Lower the visuals so shoes touch the ground
    // Shoes center is at y=0.35 with half-height 0.05 → bottom at ~0.30
    // Shift model down by 0.30 so bottom aligns to y=0 at the controller root
    model.position.set(0, -0.30, 0)
    root.add(model)

    // Colors
    const SHIRT = '#556b8e'
    const APRON = '#cfcfcf'
    const SKIN = '#f0c7a5'
    const PANTS = '#2f3540'
    const SHOES = '#221b13'

    // Body parts (very simple blocky humanoid)
    const torso = app.create('prim', { type: 'box', scale: [0.45, 0.6, 0.25], position: [0, 1.2, 0], color: SHIRT, roughness: 0.9 })
    const apron = app.create('prim', { type: 'box', scale: [0.46, 0.5, 0.02], position: [0, 1.1, 0.13], color: APRON, roughness: 0.95, transparent: true, opacity: 0.8 })
    const head = app.create('prim', { type: 'box', scale: [0.28, 0.3, 0.28], position: [0, 1.6, 0], color: SKIN, roughness: 0.8 })
    const hip = app.create('prim', { type: 'box', scale: [0.4, 0.25, 0.24], position: [0, 0.95, 0], color: PANTS })
    function arm(px) {
      // Hierarchical arm: shoulder group -> upper -> elbow group -> lower
      const shoulder = app.create('group')
      shoulder.position.set(px, 1.35, 0)
      const upper = app.create('prim', { type: 'box', scale: [0.12, 0.28, 0.12], position: [0, -0.14, 0], color: SHIRT })
      const elbow = app.create('group')
      elbow.position.set(0, -0.28, 0)
      const lower = app.create('prim', { type: 'box', scale: [0.1, 0.25, 0.1], position: [0, -0.125, 0], color: SKIN })
      shoulder.add(upper)
      shoulder.add(elbow)
      elbow.add(lower)
      return { root: shoulder, shoulder, upper, elbow, lower }
    }
    const leftArm = arm(-0.3)
    const rightArm = arm(0.3)
    function leg(px) {
      // Hierarchical leg: hip group -> upper -> knee group -> lower -> ankle group -> shoe
      const hip = app.create('group')
      hip.position.set(px, 0.95, 0)
      const upper = app.create('prim', { type: 'box', scale: [0.14, 0.35, 0.14], position: [0, -0.175, 0], color: PANTS })
      const knee = app.create('group')
      knee.position.set(0, -0.35, 0)
      const lower = app.create('prim', { type: 'box', scale: [0.13, 0.30, 0.13], position: [0, -0.15, 0], color: PANTS })
      const ankle = app.create('group')
      ankle.position.set(0, -0.30, 0)
      const shoe = app.create('prim', { type: 'box', scale: [0.16, 0.1, 0.22], position: [0, -0.05, 0.04], color: SHOES })
      hip.add(upper)
      hip.add(knee)
      knee.add(lower)
      knee.add(ankle)
      ankle.add(shoe)
      return { root: hip, hip, upper, knee, lower, ankle, shoe }
    }
    const leftLeg = leg(-0.16)
    const rightLeg = leg(0.16)

    model.add(torso)
    model.add(apron)
    model.add(head)
    model.add(hip)
    model.add(leftArm.root)
    model.add(rightArm.root)
    model.add(leftLeg.root)
    model.add(rightLeg.root)

    const position = new BufferedLerpVector3(root.position, SEND_RATE * 1.2)

    app.on('change', ([px, py, pz, ry, act]) => {
      position.push([px, py, pz])
      root.rotation.y = ry
      model.userData = { act }
    })

    let t = 0
    app.on('update', (dt) => {
      position.update(dt)
      t += dt
      const act = model.userData?.act || 'idle'
      // reset pose
      leftArm.shoulder.rotation.set(0, 0, 0)
      leftArm.elbow.rotation.set(0, 0, 0)
      rightArm.shoulder.rotation.set(0, 0, 0)
      rightArm.elbow.rotation.set(0, 0, 0)
      leftLeg.hip.rotation.set(0, 0, 0)
      leftLeg.knee.rotation.set(0, 0, 0)
      rightLeg.hip.rotation.set(0, 0, 0)
      rightLeg.knee.rotation.set(0, 0, 0)

      if (act === 'walk') {
        const freq = 5
        const amp = 0.45
        const swing = Math.sin(t * freq) * amp
        // legs: hip swings forward/back, knee adds slight counter-bend
        leftLeg.hip.rotation.x = swing
        rightLeg.hip.rotation.x = -swing
        leftLeg.knee.rotation.x = -swing * 0.5
        rightLeg.knee.rotation.x = swing * 0.5
        // arms: opposite to legs
        leftArm.shoulder.rotation.x = -swing * 0.5
        rightArm.shoulder.rotation.x = swing * 0.5
      } else if (act === 'serve') {
        // small wave/gesture
        rightArm.shoulder.rotation.x = Math.sin(t * 6) * 0.5 - 0.3
        rightArm.elbow.rotation.x = Math.cos(t * 6) * 0.4
      } else {
        // idle breathing
        const bob = Math.sin(t * 2) * 0.02
        torso.position.y = 1.2 + bob
        head.position.y = 1.6 + bob
      }
    })
  }
}
