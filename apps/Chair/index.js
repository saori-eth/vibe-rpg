/// <reference path="../../index.d.ts" />

// Hide the default block
const box = app.get("Block")
box.visible = false

// Create a single chair
const chairGroup = app.create("group");

const SCALE = 1;

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