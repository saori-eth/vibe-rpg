/// <reference path="../../index.d.ts" />

const box = app.get("Block")
box.visible = false


// World of Warcraft-style Tavern built with primitives

// Dimensions and common materials
const SCALE = 1.25; // Global upscale factor
const ROOM_WIDTH = 12 * SCALE; // x
const ROOM_DEPTH = 8 * SCALE;  // z
const ROOM_HEIGHT = 4 * SCALE; // y
const WALL_THICKNESS = 0.3 * SCALE;
const DOOR_WIDTH = 1.6 * SCALE;
const DOOR_HEIGHT = 2.4 * SCALE;

const COLOR_WOOD_DARK = "#6b4f2a";
const COLOR_WOOD_MED = "#7a5230";
const COLOR_WOOD_LIGHT = "#8b6a3a";
const COLOR_STONE = "#5c5c5c";
const COLOR_PLASTER = "#b7a888";
const COLOR_BRONZE = "#8a6a2b";
const COLOR_TERRACOTTA = "#b24a33";

const HALF_WIDTH = ROOM_WIDTH / 2;
const HALF_DEPTH = ROOM_DEPTH / 2;

const scene = app.create("group");
app.add(scene);

// Floor (static)
const floor = app.create("prim", {
  type: "box",
  scale: [ROOM_WIDTH, 0.2 * SCALE, ROOM_DEPTH],
  position: [0, 0.1 * SCALE, 0],
  color: COLOR_WOOD_DARK,
  roughness: 0.9,
  metalness: 0,
  physics: "static",
});
scene.add(floor);

// Ceiling beams for ambiance (no physics)
for (let i = -2; i <= 2; i++) {
  const beam = app.create("prim", {
    type: "box",
    scale: [ROOM_WIDTH, 0.15 * SCALE, 0.2 * SCALE],
    position: [0, ROOM_HEIGHT - 0.2 * SCALE, (i * ROOM_DEPTH) / 6],
    color: COLOR_WOOD_MED,
    roughness: 0.8,
  });
  scene.add(beam);
}

// Perimeter walls (static) with front door gap
const wallY = ROOM_HEIGHT;
const wallYPos = wallY / 2;

// Left & Right walls
const leftWall = app.create("prim", {
  type: "box",
  scale: [WALL_THICKNESS, wallY, ROOM_DEPTH + WALL_THICKNESS * 2],
  position: [-HALF_WIDTH - WALL_THICKNESS / 2, wallYPos, 0],
  color: COLOR_PLASTER,
  roughness: 1,
  physics: "static",
});
const rightWall = app.create("prim", {
  type: "box",
  scale: [WALL_THICKNESS, wallY, ROOM_DEPTH + WALL_THICKNESS * 2],
  position: [HALF_WIDTH + WALL_THICKNESS / 2, wallYPos, 0],
  color: COLOR_PLASTER,
  roughness: 1,
  physics: "static",
});
scene.add(leftWall);
scene.add(rightWall);

// Back wall (solid)
const backWall = app.create("prim", {
  type: "box",
  scale: [ROOM_WIDTH + WALL_THICKNESS * 2, wallY, WALL_THICKNESS],
  position: [0, wallYPos, HALF_DEPTH + WALL_THICKNESS / 2],
  color: COLOR_PLASTER,
  roughness: 1,
  physics: "static",
});
scene.add(backWall);

// Front wall with door gap and windows
const frontZ = -HALF_DEPTH - WALL_THICKNESS / 2;
const segmentWidth = (ROOM_WIDTH - DOOR_WIDTH) / 2;

// Window config (one per side)
const WINDOW_WIDTH = 1.2 * SCALE;
const WINDOW_HEIGHT = 1.0 * SCALE;
const WINDOW_CENTER_Y = 1.4 * SCALE;
const windowBottomY = WINDOW_CENTER_Y - WINDOW_HEIGHT / 2;
const windowTopY = WINDOW_CENTER_Y + WINDOW_HEIGHT / 2;

function buildFrontSideWithWindow(isRight) {
  const sideCenterX = (isRight ? 1 : -1) * (DOOR_WIDTH / 2 + segmentWidth / 2);
  // under-window band
  const under = app.create("prim", {
    type: "box",
    scale: [segmentWidth, windowBottomY, WALL_THICKNESS],
    position: [sideCenterX, windowBottomY / 2, frontZ],
    color: COLOR_PLASTER,
    roughness: 1,
    physics: "static",
  });
  scene.add(under);

  // over-window band (up to door height)
  const overHeight = DOOR_HEIGHT - windowTopY;
  const over = app.create("prim", {
    type: "box",
    scale: [segmentWidth, overHeight, WALL_THICKNESS],
    position: [sideCenterX, windowTopY + overHeight / 2, frontZ],
    color: COLOR_PLASTER,
    roughness: 1,
    physics: "static",
  });
  scene.add(over);

  // side bands around the window within the window Y band
  const sideBandWidth = (segmentWidth - WINDOW_WIDTH) / 2;
  const leftBandX = sideCenterX - (WINDOW_WIDTH / 2 + sideBandWidth / 2);
  const rightBandX = sideCenterX + (WINDOW_WIDTH / 2 + sideBandWidth / 2);

  const sideLeft = app.create("prim", {
    type: "box",
    scale: [sideBandWidth, WINDOW_HEIGHT, WALL_THICKNESS],
    position: [leftBandX, WINDOW_CENTER_Y, frontZ],
    color: COLOR_PLASTER,
    roughness: 1,
    physics: "static",
  });
  const sideRight = app.create("prim", {
    type: "box",
    scale: [sideBandWidth, WINDOW_HEIGHT, WALL_THICKNESS],
    position: [rightBandX, WINDOW_CENTER_Y, frontZ],
    color: COLOR_PLASTER,
    roughness: 1,
    physics: "static",
  });
  scene.add(sideLeft);
  scene.add(sideRight);

//   // glass pane (thin) centered in opening
//   const glass = app.create("prim", {
//     type: "box",
//     scale: [WINDOW_WIDTH, WINDOW_HEIGHT, Math.max(0.02, WALL_THICKNESS * 0.1)],
//     position: [sideCenterX, WINDOW_CENTER_Y, frontZ],
//     color: "#88aaff",
//     emissive: null,
//     metalness: 0,
//     roughness: 0.1,
//     transparent: true,
//     opacity: 0.35,
//     physics: "static",
//   });
//   scene.add(glass);
// }
}

buildFrontSideWithWindow(false);
buildFrontSideWithWindow(true);
// Upper front wall band above the doorway (full width)
const lintel = app.create("prim", {
  type: "box",
  scale: [ROOM_WIDTH + WALL_THICKNESS * 2, wallY - DOOR_HEIGHT, WALL_THICKNESS],
  position: [0, DOOR_HEIGHT + (wallY - DOOR_HEIGHT) / 2, frontZ],
  color: COLOR_PLASTER,
  roughness: 1,
  physics: "static",
});
scene.add(lintel);

// Timber accents (stylized tavern framing)
for (let i = -2; i <= 2; i++) {
  if (i === 0) continue; // Avoid a pillar in front of the doorway
  const post = app.create("prim", {
    type: "box",
    scale: [0.2 * SCALE, wallY, 0.2 * SCALE],
    position: [i * (ROOM_WIDTH / 5), wallYPos, -HALF_DEPTH + 0.15 * SCALE],
    color: COLOR_WOOD_LIGHT,
    roughness: 0.9,
    physics: "static",
  });
  scene.add(post);
}

// Front canopy with terracotta tiles
function addFrontCanopyRoof() {
  const canopy = app.create("group");
  scene.add(canopy);

  const canopyWidth = ROOM_WIDTH + 1.0 * SCALE; // slight side overhang
  const canopyDepth = 1.8 * SCALE; // how far it extends outward
  const slopeAngle = Math.PI / 8; // ~22.5 degrees

  // Anchor just below top of the front wall, slightly in front of it
  const yAnchor = wallY - 0.15 * SCALE;
  const zAnchor = frontZ - 0.06 * SCALE;

  // Group to guarantee pitch (slope) applies to all children
  const slopeGroup = app.create("group");
  slopeGroup.position.set(0, yAnchor, frontZ - 0.06 * SCALE);
  // Rotate whole canopy 180° and adjust pitch so tiles face outward
  slopeGroup.rotation.set(-slopeAngle, Math.PI, 0);
  canopy.add(slopeGroup);

  // Terracotta barrel tiles running along the slope direction
  const tileRadius = 0.07 * SCALE;
  const tileLength = canopyDepth; // along local Y after rotation
  const xSpacing = tileRadius * 1.9; // slight overlap
  const numTiles = Math.ceil(canopyWidth / xSpacing) + 2;
  const startX = -((numTiles - 1) * xSpacing) / 2;

  for (let i = 0; i < numTiles; i++) {
    const x = startX + i * xSpacing;
    const tile = app.create("prim", {
      type: "cylinder",
      scale: [tileRadius, tileLength, tileRadius],
      position: [x, -tileLength / 2, 0], // center so near end meets wall
      color: COLOR_TERRACOTTA,
      roughness: 0.6,
      metalness: 0.05,
      physics: "static",
    });
    slopeGroup.add(tile);
  }

  // Eave cap as a horizontal beam across width (box to avoid vertical cylinder look)
  const eaveCap = app.create("prim", {
    type: "box",
    scale: [canopyWidth + 0.2 * SCALE, 0.18 * SCALE, 0.18 * SCALE],
    position: [0, -tileLength, 0],
    color: COLOR_WOOD_DARK,
    roughness: 0.55,
    metalness: 0.05,
    physics: "static",
  });
  slopeGroup.add(eaveCap);

  // Back batten to trim where the canopy meets the wall (sloped)
  const backBatten = app.create("prim", {
    type: "box",
    scale: [canopyWidth, 0.06 * SCALE, 0.12 * SCALE],
    position: [0, -0.03 * SCALE, 0],
    color: COLOR_WOOD_DARK,
    roughness: 0.9,
    physics: "static",
  });
  slopeGroup.add(backBatten);

  // Wooden support brackets (skip doorway center)
  const bracketXs = [
    -HALF_WIDTH + 1.0 * SCALE,
    -DOOR_WIDTH / 2 - 0.8 * SCALE,
    DOOR_WIDTH / 2 + 0.8 * SCALE,
    HALF_WIDTH - 1.0 * SCALE,
  ];
  for (const bx of bracketXs) {
    // Vertical post near wall (world-aligned)
    const post = app.create("prim", {
      type: "box",
      scale: [0.12 * SCALE, 0.6 * SCALE, 0.12 * SCALE],
      position: [bx, yAnchor - 0.35 * SCALE, frontZ - 0.06 * SCALE],
      color: COLOR_WOOD_MED,
      roughness: 0.95,
      physics: "static",
    });
    canopy.add(post);

    // Parent group so pitch is guaranteed to apply to brace
    const braceGroup = app.create("group");
    braceGroup.position.set(bx, yAnchor - 0.05 * SCALE, zAnchor);
    braceGroup.rotation.set(-slopeAngle, Math.PI, 0);
    canopy.add(braceGroup);

    const braceLen = canopyDepth * 0.9;
    const brace = app.create("prim", {
      type: "box",
      scale: [0.1 * SCALE, braceLen, 0.1 * SCALE], // length along local Y
      position: [0, -braceLen / 2, 0],
      color: COLOR_WOOD_DARK,
      roughness: 0.95,
      physics: "static",
    });
    braceGroup.add(brace);
  }
}

addFrontCanopyRoof();

// Wall lanterns flanking the doorway
function addFrontLanterns() {
  const lanternY = 1.9 * SCALE;
  const offsetX = DOOR_WIDTH / 2 + 0.45 * SCALE;

  function lanternAt(x) {
    // Backplate
    const plate = app.create("prim", {
      type: "box",
      scale: [0.12 * SCALE, 0.25 * SCALE, 0.06 * SCALE],
      position: [x, lanternY, frontZ + 0.03 * SCALE],
      color: COLOR_WOOD_DARK,
      roughness: 0.9,
      physics: "static",
    });
    scene.add(plate);

    // Bracket arm
    const arm = app.create("prim", {
      type: "box",
      scale: [0.06 * SCALE, 0.06 * SCALE, 0.25 * SCALE],
      position: [x, lanternY - 0.02 * SCALE, frontZ - 0.15 * SCALE],
      color: COLOR_WOOD_MED,
      roughness: 0.95,
      physics: "static",
    });
    scene.add(arm);

    // Lantern body
    const cage = app.create("prim", {
      type: "cylinder",
      scale: [0.08 * SCALE, 0.18 * SCALE, 0.08 * SCALE],
      position: [x, lanternY - 0.02 * SCALE, frontZ - 0.28 * SCALE],
      rotation: [Math.PI / 2, 0, 0],
      color: COLOR_BRONZE,
      roughness: 0.7,
      metalness: 0.3,
    });
    scene.add(cage);

    // Glow orb
    const glow = app.create("prim", {
      type: "sphere",
      scale: [0.07 * SCALE, 0.07 * SCALE, 0.07 * SCALE],
      position: [x, lanternY - 0.02 * SCALE, frontZ - 0.28 * SCALE],
      color: "#ffdd99",
      emissive: "#ffbb66",
      emissiveIntensity: 1.3,
      transparent: true,
      opacity: 0.85,
    });
    scene.add(glow);
  }

  lanternAt(-offsetX);
  lanternAt(offsetX);
}

addFrontLanterns();

// Bar counter (static)
const barCounter = app.create("prim", {
  type: "box",
  scale: [0.6 * SCALE, 0.8 * SCALE, ROOM_DEPTH - 2 * SCALE],
  position: [HALF_WIDTH - 1.2 * SCALE, 0.55 * SCALE, 0],
  color: COLOR_WOOD_MED,
  roughness: 0.8,
  physics: "static",
});
scene.add(barCounter);

// Back bar shelf (static)
const barBack = app.create("prim", {
  type: "box",
  scale: [0.3 * SCALE, 2.2 * SCALE, ROOM_DEPTH - 2 * SCALE],
  position: [HALF_WIDTH - 0.2 * SCALE, 1.1 * SCALE, 0],
  color: COLOR_WOOD_DARK,
  roughness: 0.9,
  physics: "static",
});
scene.add(barBack);

// Simple barrel props near the bar
for (let i = -2; i <= 2; i += 2) {
  const barrel = app.create("prim", {
    type: "cylinder",
    scale: [0.45 * SCALE, 0.9 * SCALE, 0.45 * SCALE],
    position: [HALF_WIDTH - 2.2 * SCALE, 0.45 * SCALE, i * SCALE],
    color: COLOR_WOOD_DARK,
    roughness: 0.9,
    metalness: 0,
    physics: "static",
  });
  scene.add(barrel);
}

// Helper to create a table with four chairs
function createTableWithChairs(x, z, rotationY = 0) {
  const group = app.create("group");
  scene.add(group);

  // Table leg
  const leg = app.create("prim", {
    type: "cylinder",
    scale: [0.1 * SCALE, 0.9 * SCALE, 0.1 * SCALE],
    position: [0, 0.45 * SCALE, 0],
    color: COLOR_WOOD_MED,
    roughness: 0.9,
    physics: "static",
  });
  group.add(leg);

  // Table top
  const top = app.create("prim", {
    type: "cylinder",
    scale: [0.8 * SCALE, 0.06 * SCALE, 0.8 * SCALE],
    position: [0, 0.96 * SCALE, 0],
    color: COLOR_WOOD_LIGHT,
    roughness: 0.85,
    physics: "static",
  });
  group.add(top);

  // Chair factory
  function chair(px, pz, ry) {
    const c = app.create("group");
    group.add(c);
    const seatY = 0.45 * SCALE;
    const seat = app.create("prim", {
      type: "box",
      scale: [0.45 * SCALE, 0.05 * SCALE, 0.45 * SCALE],
      position: [0, seatY, 0],
      color: COLOR_WOOD_LIGHT,
      roughness: 0.9,
      physics: "static",
    });
    const back = app.create("prim", {
      type: "box",
      scale: [0.45 * SCALE, 0.5 * SCALE, 0.05 * SCALE],
      position: [0, seatY + 0.27 * SCALE, -0.22 * SCALE],
      color: COLOR_WOOD_LIGHT,
      roughness: 0.9,
      physics: "static",
    });
    // legs
    const legScale = [0.05 * SCALE, seatY, 0.05 * SCALE];
    const legYOffset = seatY / 2;
    const l1 = app.create("prim", { type: "box", scale: legScale, position: [0.2 * SCALE, legYOffset, 0.2 * SCALE], color: COLOR_WOOD_MED, physics: "static" });
    const l2 = app.create("prim", { type: "box", scale: legScale, position: [-0.2 * SCALE, legYOffset, 0.2 * SCALE], color: COLOR_WOOD_MED, physics: "static" });
    const l3 = app.create("prim", { type: "box", scale: legScale, position: [0.2 * SCALE, legYOffset, -0.2 * SCALE], color: COLOR_WOOD_MED, physics: "static" });
    const l4 = app.create("prim", { type: "box", scale: legScale, position: [-0.2 * SCALE, legYOffset, -0.2 * SCALE], color: COLOR_WOOD_MED, physics: "static" });
    c.add(seat); c.add(back); c.add(l1); c.add(l2); c.add(l3); c.add(l4);
    c.position.set(px, 0, pz);
    c.rotation.set(0, ry, 0);
    return c;
  }

  // Arrange four chairs around
  chair(0, -1.1 * SCALE, 0);
  chair(0, 1.1 * SCALE, Math.PI);
  chair(-1.1 * SCALE, 0, Math.PI / 2);
  chair(1.1 * SCALE, 0, -Math.PI / 2);

  group.position.set(x, 0, z);
  group.rotation.set(0, rotationY, 0);
  return group;
}

// Place tables
createTableWithChairs(-3 * SCALE, -1.5 * SCALE);
// Removed the table directly in front of the door to clear entry
// createTableWithChairs(0, -1.5 * SCALE, Math.PI / 8);
createTableWithChairs(3 * SCALE, -1.5 * SCALE, -Math.PI / 6);
createTableWithChairs(-2 * SCALE, 2.0 * SCALE, Math.PI / 4);
createTableWithChairs(2.5 * SCALE, 2.2 * SCALE, -Math.PI / 8);

// Fireplace (static) with emissive fire flicker
const hearthBase = app.create("prim", {
  type: "box",
  scale: [2.2 * SCALE, 0.3 * SCALE, 1.0 * SCALE],
  position: [0, 0.15 * SCALE, HALF_DEPTH - 0.6 * SCALE],
  color: COLOR_STONE,
  roughness: 1,
  physics: "static",
});
const chimney = app.create("prim", {
  type: "box",
  scale: [1.8 * SCALE, 2.5 * SCALE, 0.5 * SCALE],
  position: [0, 1.4 * SCALE, HALF_DEPTH - 0.25 * SCALE],
  color: COLOR_STONE,
  roughness: 1,
  physics: "static",
});
const fire = app.create("prim", {
  type: "sphere",
  scale: [0.5 * SCALE, 0.5 * SCALE, 0.5 * SCALE],
  position: [0, 0.5 * SCALE, HALF_DEPTH - 0.7 * SCALE],
  color: "#ff7a00",
  emissive: "#ff6a00",
  emissiveIntensity: 2.0,
  transparent: true,
  opacity: 0.8,
});
scene.add(hearthBase);
scene.add(chimney);
scene.add(fire);

// Simple chandelier (emissive orb) to mimic warm lighting
const chandelier = app.create("prim", {
  type: "sphere",
  scale: [0.25 * SCALE, 0.25 * SCALE, 0.25 * SCALE],
  position: [0, ROOM_HEIGHT - 0.6 * SCALE, 0],
  color: COLOR_BRONZE,
  emissive: "#ffbb66",
  emissiveIntensity: 1.2,
});
scene.add(chandelier);

// (Door trigger removed to ensure no invisible blocking volume at the entrance)

// Update loop: flicker fire and chandelier emissive intensity
app.on("update", (dt) => {
  const t = Date.now() * 0.002;
  const flicker = 1.5 + Math.sin(t * 2.3) * 0.5 + Math.sin(t * 3.7) * 0.3;
  fire.emissiveIntensity = 1.5 + Math.max(0, flicker);
  chandelier.emissiveIntensity = 0.9 + Math.sin(t * 1.2) * 0.3;
});