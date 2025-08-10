/// <reference path="../../index.d.ts" />

// Remove the default block completely to avoid invisible collisions
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


// Enhanced Fireplace with particles and primitives
const hearthBase = app.create("prim", {
  type: "box",
  scale: [2.2 * SCALE, 0.3 * SCALE, 1.0 * SCALE],
  position: [0, 0.15 * SCALE, HALF_DEPTH - 0.6 * SCALE],
  color: COLOR_STONE,
  roughness: 1,
  physics: "static",
});

// Main chimney structure
const chimney = app.create("prim", {
  type: "box",
  scale: [1.8 * SCALE, 2.5 * SCALE, 0.5 * SCALE],
  position: [0, 1.4 * SCALE, HALF_DEPTH - 0.25 * SCALE],
  color: COLOR_STONE,
  roughness: 1,
  physics: "static",
});

// Fireplace opening (darker interior)
const fireplaceOpening = app.create("prim", {
  type: "box",
  scale: [1.2 * SCALE, 1.0 * SCALE, 0.4 * SCALE],
  position: [0, 0.65 * SCALE, HALF_DEPTH - 0.5 * SCALE],
  color: "#1a1a1a",
  roughness: 1,
  physics: "static",
});

// Mantel shelf
const mantel = app.create("prim", {
  type: "box",
  scale: [2.0 * SCALE, 0.12 * SCALE, 0.8 * SCALE],
  position: [0, 1.25 * SCALE, HALF_DEPTH - 0.4 * SCALE],
  color: COLOR_WOOD_DARK,
  roughness: 0.85,
  physics: "static",
});

// Side stones (left)
const sideStoneLeft = app.create("prim", {
  type: "box",
  scale: [0.3 * SCALE, 1.2 * SCALE, 0.25 * SCALE],
  position: [-0.75 * SCALE, 0.7 * SCALE, HALF_DEPTH - 0.55 * SCALE],
  color: COLOR_STONE,
  roughness: 1,
  physics: "static",
});

// Side stones (right)
const sideStoneRight = app.create("prim", {
  type: "box",
  scale: [0.3 * SCALE, 1.2 * SCALE, 0.25 * SCALE],
  position: [0.75 * SCALE, 0.7 * SCALE, HALF_DEPTH - 0.55 * SCALE],
  color: COLOR_STONE,
  roughness: 1,
  physics: "static",
});

// Ash bed
const ashBed = app.create("prim", {
  type: "box",
  scale: [1.0 * SCALE, 0.05 * SCALE, 0.6 * SCALE],
  position: [0, 0.32 * SCALE, HALF_DEPTH - 0.7 * SCALE],
  color: "#2a2a2a",
  roughness: 1,
  physics: "static",
});

// Fire grate
const grate1 = app.create("prim", {
  type: "box",
  scale: [0.8 * SCALE, 0.02 * SCALE, 0.02 * SCALE],
  position: [0, 0.35 * SCALE, HALF_DEPTH - 0.6 * SCALE],
  color: "#1a1a1a",
  metalness: 0.8,
  roughness: 0.3,
  physics: "static",
});

const grate2 = app.create("prim", {
  type: "box",
  scale: [0.8 * SCALE, 0.02 * SCALE, 0.02 * SCALE],
  position: [0, 0.35 * SCALE, HALF_DEPTH - 0.7 * SCALE],
  color: "#1a1a1a",
  metalness: 0.8,
  roughness: 0.3,
  physics: "static",
});

const grate3 = app.create("prim", {
  type: "box",
  scale: [0.8 * SCALE, 0.02 * SCALE, 0.02 * SCALE],
  position: [0, 0.35 * SCALE, HALF_DEPTH - 0.8 * SCALE],
  color: "#1a1a1a",
  metalness: 0.8,
  roughness: 0.3,
  physics: "static",
});

// Fire particles
const fireParticles = app.create("particles", {
  position: [0, 0.4 * SCALE, HALF_DEPTH - 0.7 * SCALE],
  shape: ["cone", 0.15 * SCALE, 0.8, 15],
  direction: 0.3,
  rate: 40,
  duration: 3,
  loop: true,
  max: 200,
  life: "0.5~1.2",
  speed: "0.8~1.5",
  size: "0.08~0.15",
  color: "#ff4400~#ffaa00",
  alpha: "0.8~1",
  emissive: "1~2",
  blending: "additive",
  space: "world",
  force: new Vector3(0, 2.5, 0),
  sizeOverLife: "0,0.5|0.3,1|0.7,0.8|1,0.2",
  alphaOverLife: "0,0|0.1,0.9|0.8,0.7|1,0",
  colorOverLife: "0,#ffffff|0.2,#ffff00|0.5,#ff6600|0.8,#ff0000|1,#330000",
});

// Smoke particles
const smokeParticles = app.create("particles", {
  position: [0, 0.8 * SCALE, HALF_DEPTH - 0.7 * SCALE],
  shape: ["cone", 0.1 * SCALE, 0.9, 10],
  direction: 0.5,
  rate: 8,
  duration: 5,
  loop: true,
  max: 50,
  life: "2~4",
  speed: "0.3~0.6",
  size: "0.15~0.3",
  color: "#222222~#444444",
  alpha: "0.3~0.5",
  blending: "normal",
  space: "world",
  force: new Vector3(0, 1.2, 0),
  velocityRadial: 0.1,
  sizeOverLife: "0,0.3|0.3,1|1,2",
  alphaOverLife: "0,0|0.1,0.4|0.7,0.2|1,0",
});

// Logs in the fireplace
const log1 = app.create("prim", {
  type: "cylinder",
  scale: [0.08 * SCALE, 0.6 * SCALE, 0.08 * SCALE],
  position: [-0.15 * SCALE, 0.25 * SCALE, HALF_DEPTH - 0.65 * SCALE],
  rotation: [0, 0, Math.PI / 2.5],
  color: "#3d2817",
  roughness: 0.9,
  physics: "static",
});

const log2 = app.create("prim", {
  type: "cylinder",
  scale: [0.07 * SCALE, 0.5 * SCALE, 0.07 * SCALE],
  position: [0.12 * SCALE, 0.25 * SCALE, HALF_DEPTH - 0.68 * SCALE],
  rotation: [0, 0, -Math.PI / 3],
  color: "#2e1f11",
  roughness: 0.95,
  physics: "static",
});

const log3 = app.create("prim", {
  type: "cylinder",
  scale: [0.06 * SCALE, 0.45 * SCALE, 0.06 * SCALE],
  position: [0, 0.22 * SCALE, HALF_DEPTH - 0.75 * SCALE],
  rotation: [Math.PI / 12, 0, Math.PI / 2],
  color: "#4a3426",
  roughness: 0.9,
  physics: "static",
});


scene.add(hearthBase);
scene.add(chimney);
scene.add(fireplaceOpening);
scene.add(mantel);
scene.add(sideStoneLeft);
scene.add(sideStoneRight);
scene.add(ashBed);
scene.add(grate1);
scene.add(grate2);
scene.add(grate3);
scene.add(log1);
scene.add(log2);
scene.add(log3);
scene.add(fireParticles);
scene.add(smokeParticles);

