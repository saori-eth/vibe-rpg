// scripts exist inside apps, which are isolated from eachother but can communicate
// global variables: Vector3, Quaternion, Matrix4, Euler, fetch, num(min, max) (similar to Math.random)

// exposes variables to the UI
app.configure([
  {
    type: "text",
    key: "color",
    label: "Box Color",
    placeholder: "Enter a hex color",
    initial: "#ff0000",
  },
]);

// find node types here: docs/scripting/nodes/types/**.md
const group = app.create("group");
const box = app.create("prim", {
  type: "box",
  scale: [2, 1, 3],
  position: [0, 1, 0],
  color: props.color,
});
group.add(box);
app.add(group);

if (world.isServer) {
  // server-side code
  app.on("ping", () => {
    console.log("ping heard on server of original app");
    app.emit("cross-app-ping", {});
  });
  world.on("cross-app-pong", () => {
    app.send("end", {});
  });
}

if (world.isClient) {
  const localPlayer = world.getPlayer();
  world.on("enter", (player) => {
    console.log("player entered", player.playerId);
  });
  // client-side code
  app.on("end", () => {
    console.log("full loop ended");
  });
  app.send("ping", {});
}

app.on("update", (delta) => {
  // runs on both client and server
  // 'fixedUpdate' is better for physics
});
