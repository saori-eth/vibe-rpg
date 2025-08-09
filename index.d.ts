/*
 Hyperfy App Runtime TypeScript bindings

 - Global variables: app, world, props, num
 - Node system: strongly-typed app.create(nodeName, props)
 - World helpers and Player API
 - Minimal THREE-like math types (Vector3, Quaternion, Euler, Matrix4)

 These are ambient declarations intended for editor IntelliSense and type-checking.
*/

// -----------------------------
// Math primitives (minimal)
// -----------------------------
interface Vector3 {
    x: number
    y: number
    z: number
    set(x: number, y: number, z: number): this
  }
  
  interface Quaternion {
    x: number
    y: number
    z: number
    w: number
    set(x: number, y: number, z: number, w: number): this
  }
  
  interface Euler {
    x: number
    y: number
    z: number
    order?: 'XYZ' | 'YXZ' | 'ZXY' | 'ZYX' | 'YZX' | 'XZY'
    set(x: number, y: number, z: number, order?: Euler['order']): this
  }
  
  interface Matrix4 {
    elements: number[]
  }
  
  type Vector3Like = Vector3 | [number, number, number]
  type EulerLike = Euler | [number, number, number]
  
  // -----------------------------
  // Base Node
  // -----------------------------
  interface BaseNode {
    // Identity
    id: string
  
    // Transform
    position: Vector3
    quaternion: Quaternion
    rotation: Euler
    scale: Vector3
    matrixWorld: Matrix4
  
    // Hierarchy
    parent: BaseNode | null
    children: BaseNode[]
  
    // Methods
    add<T extends BaseNode>(child: T): this
    remove<T extends BaseNode>(child: T): this
    traverse(visitor: (node: BaseNode) => void): void
  }
  
  // -----------------------------
  // Node specializations (Docs-driven)
  // -----------------------------
  // Group-like
  interface GroupNode extends BaseNode {}
  interface AnchorNode extends GroupNode {}
  
  // Media
  interface AudioNode extends BaseNode {
    src: string | null
    volume: number
    loop: boolean
    group: 'music' | 'sfx'
    spatial: boolean
    distanceModel: 'linear' | 'inverse' | 'expontential'
    refDistance: number
    maxDistance: number
    rolloffFactor: number
    coneInnerAngle: number
    coneOuterAngle: number
    coneOuterGain: number
    currentTime: number
    play(): void
    pause(): void
    stop(): void
  }
  
  interface VideoNode extends BaseNode {
    src: string | null
    linked?: number | string | boolean
    loop: boolean
    visible: boolean
    color: string
    lit: boolean
    doubleside: boolean
    castShadow: boolean
    receiveShadow: boolean
    aspect: number
    fit: 'none' | 'contain' | 'cover'
    width: number | null
    height: number | null
    geometry?: unknown
    volume: number
    group: 'music' | 'sfx'
    spatial: boolean
    distanceModel: 'linear' | 'inverse' | 'expontential'
    refDistance: number
    maxDistance: number
    rolloffFactor: number
    coneInnerAngle: number
    coneOuterAngle: number
    coneOuterGain: number
    readonly isPlaying: boolean
    currentTime: number
    play(): void
    pause(): void
    stop(): void
  }
  
  interface ImageNode extends BaseNode {
    src: string | null
    width: number | null
    height: number | null
    fit: 'none' | 'contain' | 'cover'
    color: string
    pivot:
      | 'top-left'
      | 'top-center'
      | 'top-right'
      | 'center-left'
      | 'center'
      | 'center-right'
      | 'bottom-left'
      | 'bottom-center'
      | 'bottom-right'
    lit: boolean
    doubleside: boolean
    castShadow: boolean
    receiveShadow: boolean
  }
  
  // Mesh family
  interface MeshNode extends BaseNode {
    castShadow: boolean
    receiveShadow: boolean
  }
  
  interface MaterialNode {
    textureX: number
    textureY: number
    color: string
    emissiveIntensity: number
  }
  
  interface SkinnedMeshNode extends BaseNode {
    anims: string[]
    castShadow: boolean
    receiveShadow: boolean
    play(opts: { name: string; fade?: number; loop?: boolean; speed?: number }): void
    stop(opts?: { fade?: number }): void
    getBone(name: string): {
      position: Vector3
      quaternion: Quaternion
      rotation: Euler
      scale: Vector3
      matrixWorld: Matrix4
    }
  }
  
  // Physics
  interface RigidBodyNode extends BaseNode {
    type: 'static' | 'kinematic' | 'dynamic'
    onContactStart?: (other: unknown) => void
    onContactEnd?: (other: unknown) => void
    onTriggerEnter?: (other: unknown) => void
    onTriggerLeave?: (other: unknown) => void
  }
  
  interface ColliderNode extends BaseNode {
    type: 'box' | 'sphere' | 'geometry'
    setSize(width: number, height: number, depth: number): void
    radius: number
    convex: boolean
    trigger: boolean
  }
  
  interface ControllerNode extends BaseNode {
    radius: number
    height: number
    layer: 'environment' | 'prop' | 'tool'
    tag?: string | null
    onContactStart?: (other: unknown) => void
    onContactEnd?: (other: unknown) => void
    readonly isGrounded: boolean
    move(vec3: Vector3Like): void
    teleport(vec3: Vector3Like): void
  }
  
  // LOD
  interface LODNode extends BaseNode {
    scaleAware: boolean
    insert(node: BaseNode, maxDistance: number): void
  }
  
  // Avatar
  interface AvatarNode extends BaseNode {
    src: string | null
    emote?: string | null
    visible: boolean
    getHeight(): number | null
    getBoneTransform(boneName: string): Matrix4 | null
  }
  
  // Particles
  type ParticleShape =
    | ['point']
    | ['sphere', radius: number, thickness?: number]
    | ['hemisphere', radius: number, thickness?: number]
    | ['cone', radius: number, thickness?: number, angle?: number]
    | ['box', width: number, height: number, depth: number, thickness?: number, origin?: 'volume' | 'edge', spherize?: number]
    | ['circle', radius: number, thickness?: number, spherize?: number]
    | ['rectangle', width: number, depth: number, thickness?: number, spherize?: number]
  
  interface ParticlesNode extends BaseNode {
    emitting: boolean
    shape: ParticleShape
    direction: number // 0..1
    rate: number
    bursts: { time: number; count: number }[]
    duration: number
    loop: boolean
    max: number
    timescale: number
    life: string
    speed: string
    size: string
    rotate: string
    color: string
    alpha: string
    emissive: string
    image: string | null
    spritesheet: [rows: number, columns: number, fps: number, loop: boolean] | null
    blending: 'normal' | 'additive'
    lit: boolean
    billboard: 'full' | 'y' | 'direction'
    space: 'local' | 'world'
    force: Vector3 | null
    velocityLinear: Vector3 | null
    velocityOrbital: Vector3 | null
    velocityRadial: number | null
    rateOverDistance?: number
    sizeOverLife?: string
    rotateOverLife?: string
    colorOverLife?: string
    alphaOverLife?: string
    emissiveOverLife?: string
    onEnd?: () => void
  }
  
  // Prim
  type PrimType = 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane'
  interface PrimNode extends BaseNode {
    type: PrimType
    size: number[]
    color: string
    emissive: string | null
    emissiveIntensity: number
    metalness: number
    roughness: number
    opacity: number
    transparent: boolean
    texture: string | null
    castShadow: boolean
    receiveShadow: boolean
    doubleside: boolean
    physics: null | 'static' | 'kinematic' | 'dynamic'
    mass: number
    linearDamping: number
    angularDamping: number
    staticFriction: number
    dynamicFriction: number
    restitution: number
    layer: string
    trigger: boolean
    tag: string | null
    onContactStart?: (other: unknown) => void
    onContactEnd?: (other: unknown) => void
    onTriggerEnter?: (other: unknown) => void
    onTriggerLeave?: (other: unknown) => void
  }
  
  // UI
  type UIPivot =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'center-left'
    | 'center'
    | 'center-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
  
  interface UINode extends BaseNode {
    space: 'world' | 'screen'
    width: number
    height: number
    size: number
    lit: boolean
    doubleside: boolean
    billboard: 'none' | 'full' | 'y'
    pivot: UIPivot
    offset: Vector3
    scaler: [minDistance: number, maxDistance: number, baseScale?: number] | null
    pointerEvents: boolean
    backgroundColor: string | null
    borderWidth?: number
    borderColor?: string
    borderRadius?: number
    padding: number
    flexDirection: 'column' | 'column-reverse' | 'row' | 'row-reverse'
    justifyContent: 'flex-start' | 'flex-end' | 'center'
    alignItems: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline'
    alignContent: 'flex-start' | 'flex-end' | 'stretch' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
    flexWrap: 'no-wrap' | 'wrap'
    gap: number
  }
  
  interface UIViewNode extends BaseNode {
    display: 'none' | 'flex'
    width: number
    height: number
    backgroundColor: string | null
    borderWidth?: number
    borderColor?: string
    borderRadius?: number
    margin: number
    padding: number
    flexDirection: 'column' | 'column-reverse' | 'row' | 'row-reverse'
    justifyContent: 'flex-start' | 'flex-end' | 'center'
    alignItems: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline'
    alignContent: 'flex-start' | 'flex-end' | 'stretch' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
    flexBasis: number | null
    flexGrow: number | null
    flexShrink: number | null
    flexWrap: 'no-wrap' | 'wrap'
    gap: number
  }
  
  interface UITextNode extends BaseNode {
    display: 'none' | 'flex'
    backgroundColor: string | null
    borderRadius?: number
    margin: number
    padding: number
    value: string
    fontSize: number
    color: string
    lineHeight: number
    textAlign: 'left' | 'center' | 'right'
    fontFamily: string
    fontWeight: 'normal' | 'bold' | number
  }
  
  interface UIImageNode extends BaseNode {
    display: 'flex' | 'none'
    src: string | null
    height: number | null
    objectFit: 'contain' | 'cover' | 'fill'
    backgroundColor?: string | null
    borderRadius?: number
    flexDirection?: 'column' | 'column-reverse' | 'row' | 'row-reverse'
    justifyContent?: 'flex-start' | 'flex-end' | 'center'
    alignItems?: 'flex-start' | 'flex-end' | 'stretch' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
    flexWrap?: 'no-wrap' | 'wrap'
    gap?: number
    margin?: number
    padding?: number
    borderWidth?: number
    borderColor?: string | null
    loadImage(src: string): Promise<void>
  }
  
  // Action
  interface ActionNode extends BaseNode {
    label: string
    distance: number
    duration: number
    onStart?: () => void
    onTrigger?: () => void
    onCancel?: () => void
  }
  
  // -----------------------------
  // Creation-time props (initializers)
  // -----------------------------
  type NodeInitBase = Partial<{
    id: string
    position: Vector3Like
    quaternion: Quaternion
    rotation: EulerLike
    scale: Vector3Like
  }>
  
  type AnchorInit = NodeInitBase
  type GroupInit = NodeInitBase
  type AudioInit = NodeInitBase &
    Partial<Pick<AudioNode, 'src' | 'volume' | 'loop' | 'group' | 'spatial' | 'distanceModel' | 'refDistance' | 'maxDistance' | 'rolloffFactor' | 'coneInnerAngle' | 'coneOuterAngle' | 'coneOuterGain'>>
  type VideoInit = NodeInitBase &
    Partial<Pick<VideoNode, 'src' | 'linked' | 'loop' | 'visible' | 'color' | 'lit' | 'doubleside' | 'castShadow' | 'receiveShadow' | 'aspect' | 'fit' | 'width' | 'height' | 'volume' | 'group' | 'spatial' | 'distanceModel' | 'refDistance' | 'maxDistance' | 'rolloffFactor' | 'coneInnerAngle' | 'coneOuterAngle' | 'coneOuterGain'>>
  type ImageInit = NodeInitBase &
    Partial<Pick<ImageNode, 'src' | 'width' | 'height' | 'fit' | 'color' | 'pivot' | 'lit' | 'doubleside' | 'castShadow' | 'receiveShadow'>>
  type MeshInit = NodeInitBase & Partial<Pick<MeshNode, 'castShadow' | 'receiveShadow'>>
  type SkinnedMeshInit = NodeInitBase & Partial<Pick<SkinnedMeshNode, 'castShadow' | 'receiveShadow'>>
  type RigidBodyInit = NodeInitBase & Partial<Pick<RigidBodyNode, 'type' | 'onContactStart' | 'onContactEnd' | 'onTriggerEnter' | 'onTriggerLeave'>>
  type ColliderInit = NodeInitBase & Partial<Pick<ColliderNode, 'type' | 'radius' | 'convex' | 'trigger'>>
  type ControllerInit = NodeInitBase & Partial<Pick<ControllerNode, 'radius' | 'height' | 'layer' | 'tag' | 'onContactStart' | 'onContactEnd'>>
  type LODInit = NodeInitBase & Partial<Pick<LODNode, 'scaleAware'>>
  type AvatarInit = NodeInitBase & Partial<Pick<AvatarNode, 'src' | 'emote' | 'visible'>>
  type ParticlesInit = NodeInitBase &
    Partial<Pick<
      ParticlesNode,
      | 'emitting'
      | 'shape'
      | 'direction'
      | 'rate'
      | 'bursts'
      | 'duration'
      | 'loop'
      | 'max'
      | 'timescale'
      | 'life'
      | 'speed'
      | 'size'
      | 'rotate'
      | 'color'
      | 'alpha'
      | 'emissive'
      | 'image'
      | 'spritesheet'
      | 'blending'
      | 'lit'
      | 'billboard'
      | 'space'
      | 'force'
      | 'velocityLinear'
      | 'velocityOrbital'
      | 'velocityRadial'
      | 'rateOverDistance'
      | 'sizeOverLife'
      | 'rotateOverLife'
      | 'colorOverLife'
      | 'alphaOverLife'
      | 'emissiveOverLife'
      | 'onEnd'
    >>
  type PrimInit = NodeInitBase &
    Partial<Pick<
      PrimNode,
      | 'type'
      | 'size'
      | 'color'
      | 'emissive'
      | 'emissiveIntensity'
      | 'metalness'
      | 'roughness'
      | 'opacity'
      | 'transparent'
      | 'texture'
      | 'castShadow'
      | 'receiveShadow'
      | 'doubleside'
      | 'physics'
      | 'mass'
      | 'linearDamping'
      | 'angularDamping'
      | 'staticFriction'
      | 'dynamicFriction'
      | 'restitution'
      | 'layer'
      | 'trigger'
      | 'tag'
      | 'onContactStart'
      | 'onContactEnd'
      | 'onTriggerEnter'
      | 'onTriggerLeave'
    >>
  type UIInit = NodeInitBase &
    Partial<Pick<
      UINode,
      | 'space'
      | 'width'
      | 'height'
      | 'size'
      | 'lit'
      | 'doubleside'
      | 'billboard'
      | 'pivot'
      | 'offset'
      | 'scaler'
      | 'pointerEvents'
      | 'backgroundColor'
      | 'borderWidth'
      | 'borderColor'
      | 'borderRadius'
      | 'padding'
      | 'flexDirection'
      | 'justifyContent'
      | 'alignItems'
      | 'alignContent'
      | 'flexWrap'
      | 'gap'
    >>
  type UIViewInit = NodeInitBase &
    Partial<Pick<
      UIViewNode,
      | 'display'
      | 'width'
      | 'height'
      | 'backgroundColor'
      | 'borderWidth'
      | 'borderColor'
      | 'borderRadius'
      | 'margin'
      | 'padding'
      | 'flexDirection'
      | 'justifyContent'
      | 'alignItems'
      | 'alignContent'
      | 'flexBasis'
      | 'flexGrow'
      | 'flexShrink'
      | 'flexWrap'
      | 'gap'
    >>
  type UITextInit = NodeInitBase &
    Partial<Pick<
      UITextNode,
      | 'display'
      | 'backgroundColor'
      | 'borderRadius'
      | 'margin'
      | 'padding'
      | 'value'
      | 'fontSize'
      | 'color'
      | 'lineHeight'
      | 'textAlign'
      | 'fontFamily'
      | 'fontWeight'
    >>
  type UIImageInit = NodeInitBase &
    Partial<Pick<
      UIImageNode,
      | 'display'
      | 'src'
      | 'height'
      | 'objectFit'
      | 'backgroundColor'
      | 'borderRadius'
      | 'flexDirection'
      | 'justifyContent'
      | 'alignItems'
      | 'flexWrap'
      | 'gap'
      | 'margin'
      | 'padding'
      | 'borderWidth'
      | 'borderColor'
    >>
  type ActionInit = NodeInitBase & Partial<Pick<ActionNode, 'label' | 'distance' | 'duration' | 'onStart' | 'onTrigger' | 'onCancel'>>
  
  // -----------------------------
  // Node name mapping
  // -----------------------------
  type NodeNameToType = {
    // Core/world
    group: GroupNode
    anchor: AnchorNode
    mesh: MeshNode
    skinnedmesh: SkinnedMeshNode
    lod: LODNode
    // Physics
    rigidbody: RigidBodyNode
    collider: ColliderNode
    controller: ControllerNode
    // Media
    audio: AudioNode
    video: VideoNode
    image: ImageNode
    avatar: AvatarNode
    particles: ParticlesNode
    prim: PrimNode
    action: ActionNode
    // UI
    ui: UINode
    uiview: UIViewNode
    uitext: UITextNode
    uiimage: UIImageNode
  }
  
  type NodeName = keyof NodeNameToType
  
  type NodeNameToInit = {
    group: GroupInit
    anchor: AnchorInit
    mesh: MeshInit
    skinnedmesh: SkinnedMeshInit
    lod: LODInit
    rigidbody: RigidBodyInit
    collider: ColliderInit
    controller: ControllerInit
    audio: AudioInit
    video: VideoInit
    image: ImageInit
    avatar: AvatarInit
    particles: ParticlesInit
    prim: PrimInit
    action: ActionInit
    ui: UIInit
    uiview: UIViewInit
    uitext: UITextInit
    uiimage: UIImageInit
  }
  
  // -----------------------------
  // Player API
  // -----------------------------
  interface Player {
    // properties
    id: string
    name: string
    local: boolean
    admin: boolean
    position: Vector3
    quaternion: Quaternion
    rotation: Euler
  
    // methods
    teleport(position: Vector3Like, rotationY?: number): void
    getBoneTransform(boneName: string): Matrix4 | null
    damage(amount: number): void
    heal(amount: number): void
    applyEffect(options: {
      anchor?: AnchorNode
      emote?: string
      snare?: number
      freeze?: boolean
      turn?: boolean
      duration?: number
      cancellable?: boolean
      onEnd?: () => void
    } | null): void
    screenshare(screenId: string): void
    setVoiceLevel(level: 'disabled' | 'spatial' | 'global' | null): void
  }
  
  // -----------------------------
  // World API
  // -----------------------------
  type LayerGroup = 'environment' | 'player' | (string & {})
  
  interface RaycastHit {
    point: Vector3
    normal: Vector3
    distance: number
    tag: string | null
    playerId: string | null
  }
  
  interface WorldAPI {
    // Identity / env
    readonly networkId: string
    readonly isServer: boolean
    readonly isClient: boolean
  
    // Scene management
    add(node: BaseNode): void
    remove(node: BaseNode): void
    attach(node: BaseNode): void
  
    // Events
    on(event: string, callback: (data?: any) => void): void
    off(event: string, callback: (data?: any) => void): void
  
    // Physics
    raycast(origin: Vector3, direction: Vector3, maxDistance?: number | null, layerMask?: number | null): RaycastHit | null
    createLayerMask(...groups: LayerGroup[]): number
  
    // Players
    getPlayer(playerId?: string): Player | null
    getPlayers(): Player[]
  
    // URL helpers
    getQueryParam(key: string): string | null
    setQueryParam(key: string, value?: string | null): void
    open(url: string, newTab?: boolean): void
  
    // Time
    getTime(): number
    getTimestamp(format?: string): string
  
    // Storage (optional)
    get?<T = unknown>(key: string): T | undefined
    set?<T = unknown>(key: string, value: T): void
  
    // Loader (subset)
    load(type: 'avatar' | 'model', url: string): Promise<BaseNode>
  }
  
  // -----------------------------
  // Control API
  // -----------------------------
  interface ControlButton {
    onPress?: () => void
    onRelease?: () => void
    down: boolean
    pressed: boolean
    released: boolean
    capture?: boolean
  }
  
  type ControlKeys =
    | 'keyA' | 'keyB' | 'keyC' | 'keyD' | 'keyE' | 'keyF' | 'keyG' | 'keyH' | 'keyI' | 'keyJ' | 'keyK' | 'keyL' | 'keyM' | 'keyN' | 'keyO' | 'keyP' | 'keyQ' | 'keyR' | 'keyS' | 'keyT' | 'keyU' | 'keyV' | 'keyW' | 'keyX' | 'keyY' | 'keyZ'
    | 'digit0' | 'digit1' | 'digit2' | 'digit3' | 'digit4' | 'digit5' | 'digit6' | 'digit7' | 'digit8' | 'digit9'
    | 'minus' | 'equal' | 'bracketLeft' | 'bracketRight' | 'backslash' | 'semicolon' | 'quote' | 'backquote' | 'comma' | 'period' | 'slash'
    | 'arrowUp' | 'arrowDown' | 'arrowLeft' | 'arrowRight' | 'home' | 'end' | 'pageUp' | 'pageDown'
    | 'tab' | 'capsLock' | 'shiftLeft' | 'shiftRight' | 'controlLeft' | 'controlRight' | 'altLeft' | 'altRight' | 'enter' | 'space' | 'backspace' | 'delete' | 'escape'
    | 'mouseLeft' | 'mouseRight' | 'metaLeft'
  
  interface ControlPointer {
    coords: Vector3
    position: Vector3
    delta: Vector3
    locked: boolean
    lock(): void
    unlock(): void
  }
  
  interface ControlScroll {
    value: number
    capture?: boolean
  }
  
  interface ControlCamera {
    position: Vector3
    quaternion: Quaternion
    rotation: Euler
    zoom: number
    write: boolean
  }
  
  interface ControlScreen {
    width: number
    height: number
  }
  
  type ControlAPI = {
    // dynamic key set
    [key in ControlKeys]: ControlButton
  } & {
    pointer: ControlPointer
    scrollDelta: ControlScroll
    camera: ControlCamera
    screen: ControlScreen
    release(): void
  }
  
  // -----------------------------
  // App API
  // -----------------------------
  type AppEventName = 'update' | 'fixedUpdate' | 'lateUpdate' | (string & {})
  
  interface AppAPI extends BaseNode {
    // Properties
    readonly instanceId: string
    readonly version: string
    state: Record<string, any>
    props: Record<string, any>
    keepActive: boolean
  
    // Events
    on(name: AppEventName, callback: (arg?: any) => void): void
    off(name: AppEventName, callback: (arg?: any) => void): void
  
    // Networking
    send(name: string, data?: any, skipNetworkId?: string | boolean): void
    emit(name: string, data?: any): void
  
    // Nodes
    get(id: string): BaseNode | null
    create<TName extends NodeName>(name: TName, props?: NodeNameToInit[TName]): NodeNameToType[TName]
  
    // Control
    control(options?: Partial<{ priority: number }>): ControlAPI
  
    // Props UI
    configure(fields: AppFieldSpec[]): void
  }
  
  // -----------------------------
  // App Props UI Spec
  // -----------------------------
  interface TextFieldSpec {
    type: 'text'
    key: string
    label: string
    placeholder?: string
    initial?: string
  }
  
  interface TextareaFieldSpec {
    type: 'textarea'
    key: string
    label: string
    placeholder?: string
    initial?: string
  }
  
  interface NumberFieldSpec {
    type: 'number'
    key: string
    label: string
    dp?: number
    min?: number
    max?: number
    step?: number
    initial?: number
  }
  
  interface RangeFieldSpec {
    type: 'range'
    key: string
    label: string
    min?: number
    max?: number
    step?: number
    initial?: number
  }
  
  interface ToggleFieldSpec {
    type: 'toggle'
    key: string
    label: string
    trueLabel?: string
    falseLabel?: string
    initial?: string | boolean
  }
  
  interface SwitchFieldSpec {
    type: 'switch'
    key: string
    label: string
    options: { label: string; value: string }[]
    initial?: string
  }
  
  interface FileFieldSpec {
    type: 'file'
    key: string
    label: string
    kind: 'avatar' | 'emote' | 'model' | 'texture' | 'hdr' | 'audio'
  }
  
  interface ColorFieldSpec {
    type: 'color'
    key: string
    label: string
    hint?: string
    initial?: string
  }
  
  interface ButtonFieldSpec {
    type: 'button'
    key: string
    label: string
    onClick: () => void
  }
  
  type AppFieldSpec =
    | TextFieldSpec
    | TextareaFieldSpec
    | NumberFieldSpec
    | RangeFieldSpec
    | ToggleFieldSpec
    | SwitchFieldSpec
    | FileFieldSpec
    | ColorFieldSpec
    | ButtonFieldSpec
  
  // -----------------------------
  // Global declarations
  // -----------------------------
  declare global {
    const app: AppAPI
    const world: WorldAPI
    const props: Record<string, any>
    function num(min: number, max: number, dp?: number): number
  }
  
  export {}
  
  
  