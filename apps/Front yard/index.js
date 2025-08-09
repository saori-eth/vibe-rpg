/// <reference path="../../index.d.ts" />

const box = app.get("Block")
box.visible = false

// Farm-style Front Yard with fence and garden entrance

// Using tavern dimensions as reference
const SCALE = 1.25;
const YARD_WIDTH = 20 * SCALE; // Wider than tavern for spacious front yard
const YARD_DEPTH = 16 * SCALE; // Front yard extends in front of building
const FENCE_HEIGHT = 1.2 * SCALE;
const GATE_WIDTH = 2.4 * SCALE;
const POST_SIZE = 0.15 * SCALE;

// Farm colors
const COLOR_FENCE_WOOD = "#8b6532";
const COLOR_FENCE_POST = "#6b4f2a";
const COLOR_GRASS = "#4a7c3c";
const COLOR_DIRT = "#7a5230";
const COLOR_STONE_PATH = "#8a8a7a";
const COLOR_FLOWERS_RED = "#d63031";
const COLOR_FLOWERS_YELLOW = "#fdcb6e";
const COLOR_FLOWERS_PURPLE = "#6c5ce7";
const COLOR_LEAVES = "#27ae60";
const COLOR_TREE_TRUNK = "#5d4e37";

const scene = app.create("group");
app.add(scene);

// Ground/grass base
const ground = app.create("prim", {
  type: "box",
  scale: [YARD_WIDTH, 0.1 * SCALE, YARD_DEPTH],
  position: [0, 0.05 * SCALE, 0],
  color: COLOR_GRASS,
  roughness: 1,
  metalness: 0,
  physics: "static",
});
scene.add(ground);

// Stone path from gate to building
const pathSegments = 5;
for (let i = 0; i < pathSegments; i++) {
  const stone = app.create("prim", {
    type: "box",
    scale: [GATE_WIDTH * 0.8, 0.02 * SCALE, YARD_DEPTH / pathSegments * 0.8],
    position: [0, 0.11 * SCALE, -YARD_DEPTH/2 + (i + 0.5) * (YARD_DEPTH/pathSegments)],
    color: COLOR_STONE_PATH,
    roughness: 0.9,
    physics: "static",
  });
  scene.add(stone);
}

// Fence posts and rails
function createFenceSection(startX, startZ, endX, endZ) {
  const dx = endX - startX;
  const dz = endZ - startZ;
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);
  
  // Posts at intervals
  const postCount = Math.floor(length / (2 * SCALE)) + 1;
  for (let i = 0; i < postCount; i++) {
    const t = i / (postCount - 1);
    const post = app.create("prim", {
      type: "box",
      scale: [POST_SIZE, FENCE_HEIGHT, POST_SIZE],
      position: [
        startX + dx * t,
        FENCE_HEIGHT / 2,
        startZ + dz * t
      ],
      color: COLOR_FENCE_POST,
      roughness: 0.9,
      physics: "static",
    });
    scene.add(post);
  }
  
  // Horizontal rails
  const railY1 = FENCE_HEIGHT * 0.3;
  const railY2 = FENCE_HEIGHT * 0.7;
  
  for (let railY of [railY1, railY2]) {
    const rail = app.create("prim", {
      type: "box",
      scale: [length, POST_SIZE * 0.6, POST_SIZE * 0.4],
      position: [
        (startX + endX) / 2,
        railY,
        (startZ + endZ) / 2
      ],
      color: COLOR_FENCE_WOOD,
      roughness: 0.9,
      physics: "static",
    });
    scene.add(rail);
    // Apply yaw after adding so activation doesn't recompose before this change
    rail.rotation.set(0, angle, 0)
  }
}

// Build fence perimeter (leaving gap for gate)
const halfWidth = YARD_WIDTH / 2;
const halfDepth = YARD_DEPTH / 2;
const gateHalfWidth = GATE_WIDTH / 2;

// Left fence section (front)
createFenceSection(-halfWidth, -halfDepth, -gateHalfWidth, -halfDepth);
// Right fence section (front)
createFenceSection(gateHalfWidth, -halfDepth, halfWidth, -halfDepth);
// Left side fence  
createFenceSection(-halfWidth, -halfDepth, -halfWidth, halfDepth);
// Right side fence
createFenceSection(halfWidth, -halfDepth, halfWidth, halfDepth);
// Back fence with exit gap (same size as front gate)
createFenceSection(-halfWidth, halfDepth, -gateHalfWidth, halfDepth);
createFenceSection(gateHalfWidth, halfDepth, halfWidth, halfDepth);

// Rear exit posts (no gates, just taller posts)
const rearPost1 = app.create("prim", {
  type: "box",
  scale: [POST_SIZE * 1.2, FENCE_HEIGHT * 1.4, POST_SIZE * 1.2],
  position: [-gateHalfWidth, FENCE_HEIGHT * 1.4 / 2, halfDepth],
  color: COLOR_FENCE_POST,
  roughness: 0.9,
  physics: "static",
});
const rearPost2 = app.create("prim", {
  type: "box",
  scale: [POST_SIZE * 1.2, FENCE_HEIGHT * 1.4, POST_SIZE * 1.2],
  position: [gateHalfWidth, FENCE_HEIGHT * 1.4 / 2, halfDepth],
  color: COLOR_FENCE_POST,
  roughness: 0.9,
  physics: "static",
});
scene.add(rearPost1);
scene.add(rearPost2);

// Decorative gate (taller)
const gatePost1 = app.create("prim", {
  type: "box",
  scale: [POST_SIZE * 1.5, FENCE_HEIGHT * 1.8, POST_SIZE * 1.5],
  position: [-gateHalfWidth, FENCE_HEIGHT * 1.8 / 2, -halfDepth],
  color: COLOR_FENCE_POST,
  roughness: 0.9,
  physics: "static",
});
const gatePost2 = app.create("prim", {
  type: "box",
  scale: [POST_SIZE * 1.5, FENCE_HEIGHT * 1.8, POST_SIZE * 1.5],
  position: [gateHalfWidth, FENCE_HEIGHT * 1.8 / 2, -halfDepth],
  color: COLOR_FENCE_POST,
  roughness: 0.9,
  physics: "static",
});
scene.add(gatePost1);
scene.add(gatePost2);

// Gate doors (open, welcoming)
const gateDoor1 = app.create("group");
const gateDoor2 = app.create("group");

// Left gate door
for (let i = 0; i < 4; i++) {
  const slat = app.create("prim", {
    type: "box",
    scale: [GATE_WIDTH/2 * 0.9, POST_SIZE * 0.5, POST_SIZE * 0.3],
    position: [-GATE_WIDTH/4, FENCE_HEIGHT * 0.2 + i * FENCE_HEIGHT * 0.2, 0],
    color: COLOR_FENCE_WOOD,
    roughness: 0.9,
    physics: "static",
  });
  gateDoor1.add(slat);
}
gateDoor1.position.set(-gateHalfWidth, 0, -halfDepth);
gateDoor1.rotation.set(0, -Math.PI/4, 0); // Open outward
scene.add(gateDoor1);

// Right gate door
for (let i = 0; i < 4; i++) {
  const slat = app.create("prim", {
    type: "box",
    scale: [GATE_WIDTH/2 * 0.9, POST_SIZE * 0.5, POST_SIZE * 0.3],
    position: [GATE_WIDTH/4, FENCE_HEIGHT * 0.2 + i * FENCE_HEIGHT * 0.2, 0],
    color: COLOR_FENCE_WOOD,
    roughness: 0.9,
    physics: "static",
  });
  gateDoor2.add(slat);
}
gateDoor2.position.set(gateHalfWidth, 0, -halfDepth);
gateDoor2.rotation.set(0, Math.PI/4, 0); // Open outward
scene.add(gateDoor2);

// Archway sign above gate (adjusted for taller posts)
const archBeam = app.create("prim", {
  type: "box",
  scale: [GATE_WIDTH + POST_SIZE * 3, POST_SIZE * 2, POST_SIZE],
  position: [0, FENCE_HEIGHT * 1.8, -halfDepth],
  color: COLOR_FENCE_POST,
  roughness: 0.9,
  physics: "static",
});
scene.add(archBeam);

// Garden beds along fence sides
function createGardenBed(x, z, width, depth) {
  // Bed border
  const border = app.create("prim", {
    type: "box",
    scale: [width, 0.2 * SCALE, depth],
    position: [x, 0.1 * SCALE, z],
    color: COLOR_FENCE_POST,
    roughness: 1,
    physics: "static",
  });
  scene.add(border);
  
  // Soil
  const soil = app.create("prim", {
    type: "box",
    scale: [width * 0.9, 0.15 * SCALE, depth * 0.9],
    position: [x, 0.15 * SCALE, z],
    color: COLOR_DIRT,
    roughness: 1,
    physics: "static",
  });
  scene.add(soil);
}

// Garden beds along sides
createGardenBed(-halfWidth + 1.5 * SCALE, 0, 2 * SCALE, 6 * SCALE);
createGardenBed(halfWidth - 1.5 * SCALE, 0, 2 * SCALE, 6 * SCALE);
createGardenBed(-halfWidth + 1.5 * SCALE, -halfDepth + 3 * SCALE, 2 * SCALE, 4 * SCALE);
createGardenBed(halfWidth - 1.5 * SCALE, -halfDepth + 3 * SCALE, 2 * SCALE, 4 * SCALE);

// Plant flowers in garden beds
function createFlowerCluster(x, z, color) {
  const cluster = app.create("group");
  
  // Random flower placement in cluster
  for (let i = 0; i < 5; i++) {
    const offsetX = (Math.random() - 0.5) * 0.5 * SCALE;
    const offsetZ = (Math.random() - 0.5) * 0.5 * SCALE;
    
    // Stem
    const stem = app.create("prim", {
      type: "cylinder",
      scale: [0.02 * SCALE, 0.3 * SCALE, 0.02 * SCALE],
      position: [offsetX, 0.15 * SCALE, offsetZ],
      color: COLOR_LEAVES,
      roughness: 0.9,
    });
    cluster.add(stem);
    
    // Flower
    const flower = app.create("prim", {
      type: "sphere",
      scale: [0.08 * SCALE, 0.08 * SCALE, 0.08 * SCALE],
      position: [offsetX, 0.3 * SCALE, offsetZ],
      color: color,
      roughness: 0.7,
      emissive: color,
      emissiveIntensity: 0.2,
    });
    cluster.add(flower);
  }
  
  cluster.position.set(x, 0.1 * SCALE, z);
  scene.add(cluster);
}

// Add flowers to garden beds
const flowerColors = [COLOR_FLOWERS_RED, COLOR_FLOWERS_YELLOW, COLOR_FLOWERS_PURPLE];
for (let side of [-1, 1]) {
  for (let i = 0; i < 4; i++) {
    const x = side * (halfWidth - 1.5 * SCALE);
    const z = -halfDepth + 2 * SCALE + i * 2 * SCALE;
    createFlowerCluster(x, z, flowerColors[i % 3]);
  }
}

// Bushes near entrance
function createBush(x, z, scale = 1) {
  const bush = app.create("group");
  
  // Multiple spheres for bushy appearance
  const positions = [
    [0, 0, 0],
    [0.2, 0, 0.1],
    [-0.2, 0, 0.1],
    [0, 0.1, -0.1],
    [0.1, 0.1, 0.1],
    [-0.1, 0.1, -0.1],
  ];
  
  positions.forEach(([dx, dy, dz]) => {
    const part = app.create("prim", {
      type: "sphere",
      scale: [0.4 * SCALE * scale, 0.35 * SCALE * scale, 0.4 * SCALE * scale],
      position: [dx * SCALE * scale, dy * SCALE * scale, dz * SCALE * scale],
      color: COLOR_LEAVES,
      roughness: 0.9,
    });
    bush.add(part);
  });
  
  bush.position.set(x, 0.3 * SCALE * scale, z);
  scene.add(bush);
}

// Bushes flanking the entrance path
createBush(-gateHalfWidth - 1 * SCALE, -halfDepth + 1 * SCALE, 1.2);
createBush(gateHalfWidth + 1 * SCALE, -halfDepth + 1 * SCALE, 1.2);
createBush(-2 * SCALE, -halfDepth + 4 * SCALE, 0.9);
createBush(2 * SCALE, -halfDepth + 4 * SCALE, 0.9);

// Small decorative trees
function createTree(x, z) {
  const tree = app.create("group");
  
  // Trunk
  const trunk = app.create("prim", {
    type: "cylinder",
    scale: [0.2 * SCALE, 1.5 * SCALE, 0.2 * SCALE],
    position: [0, 0.75 * SCALE, 0],
    color: COLOR_TREE_TRUNK,
    roughness: 0.95,
    physics: "static",
  });
  tree.add(trunk);
  
  // Foliage layers
  const foliageLevels = [
    { y: 1.2 * SCALE, scale: 1.0 },
    { y: 1.6 * SCALE, scale: 0.8 },
    { y: 1.9 * SCALE, scale: 0.6 },
  ];
  
  foliageLevels.forEach(({ y, scale }) => {
    const foliage = app.create("prim", {
      type: "sphere",
      scale: [0.8 * SCALE * scale, 0.6 * SCALE * scale, 0.8 * SCALE * scale],
      position: [0, y, 0],
      color: COLOR_LEAVES,
      roughness: 0.9,
    });
    tree.add(foliage);
  });
  
  tree.position.set(x, 0, z);
  scene.add(tree);
}

// Trees in corners
createTree(-halfWidth + 2 * SCALE, halfDepth - 2 * SCALE);
createTree(halfWidth - 2 * SCALE, halfDepth - 2 * SCALE);

// Farm decorations
// Barrel planters
function createBarrelPlanter(x, z) {
  const barrel = app.create("prim", {
    type: "cylinder",
    scale: [0.3 * SCALE, 0.4 * SCALE, 0.3 * SCALE],
    position: [x, 0.2 * SCALE, z],
    color: COLOR_FENCE_POST,
    roughness: 0.95,
    physics: "static",
  });
  scene.add(barrel);
  
  // Soil in barrel
  const soil = app.create("prim", {
    type: "cylinder",
    scale: [0.28 * SCALE, 0.05 * SCALE, 0.28 * SCALE],
    position: [x, 0.37 * SCALE, z],
    color: COLOR_DIRT,
    roughness: 1,
  });
  scene.add(soil);
  
  // Plant in barrel
  createFlowerCluster(x, z + 0.05 * SCALE, COLOR_FLOWERS_YELLOW);
}

// Barrel planters along path
createBarrelPlanter(-3 * SCALE, -2 * SCALE);
createBarrelPlanter(3 * SCALE, -2 * SCALE);
createBarrelPlanter(-3 * SCALE, 2 * SCALE);
createBarrelPlanter(3 * SCALE, 2 * SCALE);

// Small hay bales for farm ambiance
function createHayBale(x, z, rotation = 0) {
  const bale = app.create("prim", {
    type: "box",
    scale: [0.8 * SCALE, 0.5 * SCALE, 0.6 * SCALE],
    position: [x, 0.25 * SCALE, z],
    rotation: [0, rotation, 0],
    color: "#d4a574",
    roughness: 1,
    physics: "static",
  });
  scene.add(bale);
}

// Hay bales in corner
createHayBale(-halfWidth + 3.5 * SCALE, halfDepth - 3.5 * SCALE, Math.PI/8);
createHayBale(-halfWidth + 3 * SCALE, halfDepth - 2.5 * SCALE, -Math.PI/12);

// Wooden wagon wheel decoration
function createWagonWheel(x, z) {
  const wheel = app.create("group");
  
  // Wheel rim
  const rim = app.create("prim", {
    type: "torus",
    scale: [0.5 * SCALE, 0.5 * SCALE, 0.1 * SCALE],
    position: [0, 0, 0],
    rotation: [Math.PI/2, 0, 0],
    color: COLOR_FENCE_WOOD,
    roughness: 0.95,
    physics: "static",
  });
  wheel.add(rim);
  
  // Spokes
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const spoke = app.create("prim", {
      type: "box",
      scale: [0.05 * SCALE, 0.5 * SCALE, 0.03 * SCALE],
      position: [0, 0, 0],
      rotation: [0, 0, angle],
      color: COLOR_FENCE_WOOD,
      roughness: 0.95,
      physics: "static",
    });
    wheel.add(spoke);
  }
  
  // Center hub
  const hub = app.create("prim", {
    type: "cylinder",
    scale: [0.08 * SCALE, 0.12 * SCALE, 0.08 * SCALE],
    position: [0, 0, 0],
    rotation: [Math.PI/2, 0, 0],
    color: COLOR_FENCE_POST,
    roughness: 0.9,
    physics: "static",
  });
  wheel.add(hub);
  
  wheel.position.set(x, 0.5 * SCALE, z);
  wheel.rotation.set(0, 0, Math.PI/12); // Lean against fence
  scene.add(wheel);
}

// Wagon wheel leaning against fence
createWagonWheel(halfWidth - 0.3 * SCALE, halfDepth - 4 * SCALE);

// Ambient animated elements
const butterfly = app.create("prim", {
  type: "sphere",
  scale: [0.05 * SCALE, 0.03 * SCALE, 0.05 * SCALE],
  position: [0, 1.5 * SCALE, 0],
  color: COLOR_FLOWERS_YELLOW,
  emissive: COLOR_FLOWERS_YELLOW,
  emissiveIntensity: 0.5,
});
scene.add(butterfly);

// Animation loop
app.on("update", (dt) => {
  const t = Date.now() * 0.001;
  
  // Butterfly flight pattern
  butterfly.position.x = Math.sin(t * 0.8) * 4 * SCALE;
  butterfly.position.y = 1.5 * SCALE + Math.sin(t * 2) * 0.3 * SCALE;
  butterfly.position.z = Math.cos(t * 0.6) * 3 * SCALE;
  
  // Gentle sway for flowers (simulate wind)
  scene.children.forEach(child => {
    if (child.children && child.children.length > 0) {
      // Check if it's a flower cluster
      child.children.forEach(part => {
        if (part.scale && part.scale.x < 0.1 * SCALE) {
          part.rotation.z = Math.sin(t * 1.5 + part.position.x) * 0.05;
        }
      });
    }
  });
});