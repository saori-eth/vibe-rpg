/// <reference path="../../index.d.ts" />

// Hide the default block
const box = app.get("Block")
box.visible = false

// Configure sitting emote
app.configure([
	{
		key: 'emote',
		type: 'file',
		kind: 'emote',
		label: 'Emote'
	}
])

// Create a single chair
const chairGroup = app.create("group");

const SCALE = 1;
const DEG2RAD = Math.PI / 180;
const state = app.state;

// Wood colors
const COLOR_WOOD_LIGHT = "#d4a574";
const COLOR_WOOD_MED = "#a67c52";

// Chair seat
const seatY = 0.45 * SCALE;
const seat = app.create("prim", {
  type: "box",
  scale: [0.45 * SCALE, 0.05 * SCALE, 0.45 * SCALE],
  position: [0, seatY, 0],
  color: COLOR_WOOD_LIGHT,
  roughness: 0.9,
  physics: "static",
});

// Chair back
const back = app.create("prim", {
  type: "box",
  scale: [0.45 * SCALE, 0.5 * SCALE, 0.05 * SCALE],
  position: [0, seatY + 0.27 * SCALE, -0.22 * SCALE],
  color: COLOR_WOOD_LIGHT,
  roughness: 0.9,
  physics: "static",
});

// Chair legs
const legScale = [0.05 * SCALE, seatY, 0.05 * SCALE];
const legYOffset = seatY / 2;

const leg1 = app.create("prim", { 
  type: "box", 
  scale: legScale, 
  position: [0.2 * SCALE, legYOffset, 0.2 * SCALE], 
  color: COLOR_WOOD_MED, 
  roughness: 0.95,
  physics: "static" 
});

const leg2 = app.create("prim", { 
  type: "box", 
  scale: legScale, 
  position: [-0.2 * SCALE, legYOffset, 0.2 * SCALE], 
  color: COLOR_WOOD_MED, 
  roughness: 0.95,
  physics: "static" 
});

const leg3 = app.create("prim", { 
  type: "box", 
  scale: legScale, 
  position: [0.2 * SCALE, legYOffset, -0.2 * SCALE], 
  color: COLOR_WOOD_MED, 
  roughness: 0.95,
  physics: "static" 
});

const leg4 = app.create("prim", { 
  type: "box", 
  scale: legScale, 
  position: [-0.2 * SCALE, legYOffset, -0.2 * SCALE], 
  color: COLOR_WOOD_MED, 
  roughness: 0.95,
  physics: "static" 
});

// Add all parts to the chair group
chairGroup.add(seat);
chairGroup.add(back);
chairGroup.add(leg1);
chairGroup.add(leg2);
chairGroup.add(leg3);
chairGroup.add(leg4);

// Add the chair to the app
app.add(chairGroup);

// Sitting functionality
if (world.isServer) {
	state.playerId = null
	app.on('request', playerId => {
		if (state.playerId) return
		state.playerId = playerId
		app.send('playerId', playerId)
	})
	app.on('release', playerId => {
		if (state.playerId === playerId) {
			state.playerId = null
			app.send('playerId', null)
		}
	})
	world.on('leave', e => {
		if (state.playerId === e.player.networkId) {
			state.playerId = null
			app.send('playerId', null)
		}
	})
}

if (world.isClient) {
	const player = world.getPlayer()

	// Setup seat anchor - positioned on the seat
	const anchor = app.create('anchor', { id: 'seat' })
	anchor.position.set(0, seatY - 0.25, 0.05)
	anchor.rotation.y = Math.PI
	app.add(anchor)

	// Setup action button
	const action = app.create('action')
	action.position.y = 0.7
	action.label = 'Sit'
	action.onTrigger = () => {
		app.send('request', player.networkId)
	}
	app.add(action)

	if (state.playerId) {
		action.active = false
	}

	let control
	function sit() {
		if (control) return
		action.active = false
		control = app.control()
		player.applyEffect({
			anchor,
			emote: app.props.emote?.url,
			cancellable: true,
			onEnd: stand
		})
	}

	function stand() {
		if (!control) return
		control.release()
		control = null
		action.active = true
		app.send('release', player.networkId)
	}

	app.on('playerId', playerId => {
		state.playerId = playerId
		action.active = !playerId
		if (playerId === player.networkId) {
			sit()
		} else {
			stand()
		}
	})
}