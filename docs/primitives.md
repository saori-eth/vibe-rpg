Here is an example of spawning a simple box shape for an app:

```jsx
const box = app.create('prim', {
  type: 'box',
  position: [0, 0.5, 0],
  size: [1, 1, 1],
  color: 'blue',
  physics: 'static',
})
// note: can also modify props later eg `box.position.y += 0.5` or `box.color = 'green'`
app.add(box)
```

Note that all "prim" node shapes have an origin at the center of their volume. Additionally we should always treat the origin of the app as the "ground" which is why we lifted this box up half of it's height for good alignment.

You also have the ability to nest prims and there is a `group` node if needed:

```jsx
const parent = app.create('group')
parent.add(box)
app.add(parent)
```

These are the only available prim types that you can use and these are their default sizes and what each indice of the array corresponds to for each shape:

```jsx
const defaultSizes = {
  box: [1, 1, 1], // width, height, depth
  sphere: [0.5], // radius
  cylinder: [0.5, 0.5, 1], // radiusTop, radiusBtm, height
  cone: [0.5, 1], // radius, height
  torus: [0.4, 0.1], // radius, tubeRadius
  plane: [1, 1], // width, height
}
```

Most of the time, prims should probably be static physics colliders so that players dont walk through them, but if you want to animate movement you can make them kinematic:

```jsx
const box = app.create('prim', {
  type: 'box',
  size: [1, 1, 1],
  color: 'blue',
  physics: 'kinematic',
})
app.add(box)
app.on('update', delta => {
  // example box moving up!
  box.position.y += 3 * delta
})
```

If you need to make lots of repeating things you can construct one hierarchy and then clone it if needed:

```jsx
const chair = app.create('group')
group.add(chairBase)
group.add(chaseTop)
app.add(chair)
const chair2 = chair.clone(true) // true clones all children
chair2.position.set(3, 0, 0)
app.add(chair2)
```

All nodes have transforms, eg box.position (Vector3) box.quaternion (Quaternion) box.rotation (Euler) box.scale (Vector3) that have the same API as three.js eg box.position.set(x, y, z) or box.quaternion.slerp(target, 0.2)

You can also set bloom glow effects like this:

```jsx
box.emissive = '#ff0000' // red emissive color, usually same as `color`
box.emissiveIntensity = 10 // 0 is no bloom, ~5 is a good glow, ~10 is lots of glow
```

If you want to use randomization, prefer to use `prng` so that it is reproducable over the network:

```jsx
const num = prng(1) // 1 is a seed
const result = num(0, 100, 2) // min, max, decimalPlaces (defaults to 0)
// result is a number between 0 and 100 with 2 dp.
```

Creations should use real world scale in meters, keeping in mind that players will likely walk around/through/on things you make. Players in the world are human sized, around 1.6 meters tall but they can jump 1.5m high and about 5m in distance. Try not to make things too small, there is plenty of space.

Try to keep in mind z-fighting happens when two different colored surfaces overlap at exact coordinates.