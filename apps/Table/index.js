/// <reference path="../../index.d.ts" />

const box = app.get("Block")
box.visible = false

const SCALE = 1.0;
const COLOR_WOOD_MED = "#8B6B47";
const COLOR_WOOD_LIGHT = "#A0826D";

const group = app.create("group");

const leg = app.create("prim", {
  type: "cylinder",
  scale: [0.1 * SCALE, 0.6 * SCALE, 0.1 * SCALE],
  position: [0, 0.3 * SCALE, 0],
  color: COLOR_WOOD_MED,
  roughness: 0.9,
  physics: "static",
});
group.add(leg);

const top = app.create("prim", {
  type: "cylinder",
  scale: [0.8 * SCALE, 0.06 * SCALE, 0.8 * SCALE],
  position: [0, 0.63 * SCALE, 0],
  color: COLOR_WOOD_LIGHT,
  roughness: 0.85,
  physics: "static",
});
group.add(top);

app.add(group);
