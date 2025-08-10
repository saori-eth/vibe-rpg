/// <reference path="../../index.d.ts" />

// Remove the default block completely to avoid invisible collisions
const box = app.get("Block")
box.visible = false

// Forest chunk size (tileable square)
const CHUNK_SIZE = 40;
const HALF_CHUNK = CHUNK_SIZE / 2;

// Nature colors
const COLOR_BARK = "#4a3426";
const COLOR_BARK_DARK = "#2e1f11";
const COLOR_LEAVES_GREEN = "#2d5016";
const COLOR_LEAVES_LIGHT = "#3a6618";
const COLOR_LEAVES_DARK = "#1e3810";
const COLOR_SHRUB = "#2a4a1a";
const COLOR_PINE = "#1a3a1a";

// Helper function to create a deciduous tree
function createTree(x, z, height, radius, trunkWidth) {
  const group = app.create("group");
  
  // Trunk
  const trunk = app.create("prim", {
    type: "cylinder",
    scale: [trunkWidth, height * 0.6, trunkWidth],
    position: [0, height * 0.3, 0],
    color: COLOR_BARK,
    roughness: 0.95,
    physics: "static",
  });
  group.add(trunk);
  
  // Canopy (3 spheres for natural look)
  const canopy1 = app.create("prim", {
    type: "sphere",
    scale: [radius, radius * 0.8, radius],
    position: [0, height * 0.7, 0],
    color: COLOR_LEAVES_GREEN,
    roughness: 0.9,
    physics: "static",
  });
  group.add(canopy1);
  
  const canopy2 = app.create("prim", {
    type: "sphere",
    scale: [radius * 0.7, radius * 0.7, radius * 0.7],
    position: [radius * 0.3, height * 0.65, radius * 0.2],
    color: COLOR_LEAVES_LIGHT,
    roughness: 0.9,
    physics: "static",
  });
  group.add(canopy2);
  
  const canopy3 = app.create("prim", {
    type: "sphere",
    scale: [radius * 0.6, radius * 0.6, radius * 0.6],
    position: [-radius * 0.25, height * 0.68, -radius * 0.15],
    color: COLOR_LEAVES_DARK,
    roughness: 0.9,
    physics: "static",
  });
  group.add(canopy3);
  
  group.position.set(x, 0, z);
  app.add(group);
  return group;
}

// Helper function to create a pine tree
function createPineTree(x, z, height, baseRadius) {
  const group = app.create("group");
  
  // Trunk
  const trunk = app.create("prim", {
    type: "cylinder",
    scale: [baseRadius * 0.3, height * 0.3, baseRadius * 0.3],
    position: [0, height * 0.15, 0],
    color: COLOR_BARK_DARK,
    roughness: 0.95,
    physics: "static",
  });
  group.add(trunk);
  
  // Pine layers (cones)
  for (let i = 0; i < 3; i++) {
    const layerHeight = height * (0.3 + i * 0.25);
    const layerRadius = baseRadius * (1 - i * 0.25);  // Changed from 0.3 to 0.25 for better visibility
    
    const layer = app.create("prim", {
      type: "cone",
      scale: [layerRadius, height * 0.35, layerRadius],
      position: [0, layerHeight, 0],
      color: COLOR_PINE,
      roughness: 0.9,
      physics: "static",
    });
    group.add(layer);
  }
  
  group.position.set(x, 0, z);
  app.add(group);
  return group;
}

// Helper function to create shrubs
function createShrub(x, z, scale) {
  const group = app.create("group");
  
  // Multiple small spheres for bushy appearance
  const positions = [
    [0, 0.3, 0],
    [0.15, 0.25, 0.1],
    [-0.12, 0.28, -0.08],
    [0.08, 0.35, -0.12],
    [-0.1, 0.22, 0.15]
  ];
  
  positions.forEach(pos => {
    const bush = app.create("prim", {
      type: "sphere",
      scale: [scale * 0.4, scale * 0.35, scale * 0.4],
      position: pos.map(p => p * scale),
      color: COLOR_SHRUB,
      roughness: 0.95,
      physics: "static",
    });
    group.add(bush);
  });
  
  group.position.set(x, 0, z);
  app.add(group);
  return group;
}

// Create varied trees in the chunk (4x scale)
// Large oak-style tree
createTree(-12, -12, 18, 7.2, 1.6);

// Medium deciduous trees
createTree(10, -8, 14, 5.2, 1.2);
createTree(-4, 12, 15.2, 5.6, 1.4);
createTree(14, 14, 12.8, 4.8, 1.12);

// Small deciduous tree
createTree(2, -14, 10, 3.6, 0.8);

// Pine trees
createPineTree(-14, 4, 16, 6);
createPineTree(6, 6, 14, 4.8);
createPineTree(-6, -4, 12, 4.4);

// Small pine
createPineTree(16, -2, 10, 3.6);

// Shrubs scattered around
createShrub(-8, -16, 3.2);
createShrub(0, -8, 2.4);
createShrub(8, 0, 2.8);
createShrub(-16, -4, 2.6);
createShrub(12, -14, 2);
createShrub(-2, 16, 2.8);
createShrub(16, 8, 2.4);
createShrub(-12, 14, 2.2);
createShrub(4, -18, 2.4);
createShrub(-18, 10, 2.8);

// Add a rock
const rock1 = app.create("prim", {
  type: "sphere",
  scale: [2.4, 1.6, 2],
  position: [-10, 0.8, 6],
  color: "#4a4a4a",
  roughness: 1,
  physics: "static",
});
app.add(rock1);

const rock2 = app.create("prim", {
  type: "sphere",
  scale: [1.6, 1.2, 1.4],
  position: [11.2, 0.6, -6],
  color: "#3a3a3a",
  roughness: 1,
  physics: "static",
});
app.add(rock2);