import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MinecraftHead } from './MinecraftHead';

interface Mojavatar3DProps {
  mcId: string;
  skinUrl: string;
  avatarUrl: string;
  preloadSkinUrls?: string[];
}

type FaceRect = [x: number, y: number, w: number, h: number];

/**
 * Computes the 6 Minecraft skin UV rectangles for a standard cuboid at (texX, texY).
 * Ordered to match Three.js BoxGeometry face indices: [+x, -x, +y, -y, +z, -z].
 */
function getBoxFaceRects(
  texX: number,
  texY: number,
  w: number,
  h: number,
  d: number
): [FaceRect, FaceRect, FaceRect, FaceRect, FaceRect, FaceRect] {
  return [
    [texX + d + w, texY + d, d, h], // +x (character left)
    [texX, texY + d, d, h],         // -x (character right)
    [texX + d, texY, w, d],         // +y (top)
    [texX + d + w, texY, w, d],     // -y (bottom)
    [texX + d, texY + d, w, h],     // +z (front)
    [texX + d + w + d, texY + d, w, h], // -z (back)
  ];
}

/**
 * Applies pixel-exact UV rectangles onto a Three.js BoxGeometry (flipY = false).
 */
function applyMinecraftUVs(
  geometry: THREE.BoxGeometry,
  faceRects: [FaceRect, FaceRect, FaceRect, FaceRect, FaceRect, FaceRect],
  texSize = 64
): THREE.BoxGeometry {
  const uvAttr = geometry.attributes.uv as THREE.BufferAttribute;
  const eps = 0.02 / texSize;

  faceRects.forEach(([px, py, pw, ph], faceIdx) => {
    const u0 = px / texSize + eps;
    const u1 = (px + pw) / texSize - eps;
    const v0 = py / texSize + eps;
    const v1 = (py + ph) / texSize - eps;

    // Bottom face (+y/-y ordering in BoxGeometry needs vertical flip on -y so front stays forward)
    const topV = faceIdx === 3 ? v1 : v0;
    const botV = faceIdx === 3 ? v0 : v1;

    const base = faceIdx * 4;
    uvAttr.setXY(base + 0, u0, topV);
    uvAttr.setXY(base + 1, u1, topV);
    uvAttr.setXY(base + 2, u0, botV);
    uvAttr.setXY(base + 3, u1, botV);
  });

  uvAttr.needsUpdate = true;
  return geometry;
}

/**
 * Builds a single merged solid-voxel BufferGeometry for a Minecraft skin overlay layer.
 * Every non-transparent texel on the 6 overlay faces becomes an extruded 3D pixel block.
 */
function createOverlayVoxelGeometry(
  imgData: ImageData,
  texX: number,
  texY: number,
  texW: number,
  texH: number,
  texD: number,
  w: number,
  h: number,
  d: number,
  thickness: number
): THREE.BufferGeometry | null {
  const faceRects = getBoxFaceRects(texX, texY, texW, texH, texD);
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const unitPos = unitBox.attributes.position as THREE.BufferAttribute;
  const unitNorm = unitBox.attributes.normal as THREE.BufferAttribute;
  const unitIdx = unitBox.index!;

  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const tmpColor = new THREE.Color();
  let vertOffset = 0;

  const pushVoxel = (
    cx: number,
    cy: number,
    cz: number,
    sx: number,
    sy: number,
    sz: number,
    r: number,
    g: number,
    b: number
  ) => {
    tmpColor.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
    for (let i = 0; i < unitPos.count; i++) {
      positions.push(
        cx + unitPos.getX(i) * sx,
        cy + unitPos.getY(i) * sy,
        cz + unitPos.getZ(i) * sz
      );
      normals.push(unitNorm.getX(i), unitNorm.getY(i), unitNorm.getZ(i));
      colors.push(tmpColor.r, tmpColor.g, tmpColor.b);
    }
    for (let i = 0; i < unitIdx.count; i++) {
      indices.push(vertOffset + unitIdx.getX(i));
    }
    vertOffset += unitPos.count;
  };

  const { data, width: imgW } = imgData;

  faceRects.forEach(([px, py, pw, ph], faceIdx) => {
    for (let iy = 0; iy < ph; iy++) {
      for (let ix = 0; ix < pw; ix++) {
        const idx = ((py + iy) * imgW + (px + ix)) * 4;
        const a = data[idx + 3];
        if (a <= 20) continue;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        if (faceIdx === 0) {
          // +x (character left)
          const cz = d / 2 - ((ix + 0.5) * d) / pw;
          const cy = h / 2 - ((iy + 0.5) * h) / ph;
          pushVoxel(w / 2 + thickness / 2, cy, cz, thickness, h / ph, d / pw, r, g, b);
        } else if (faceIdx === 1) {
          // -x (character right)
          const cz = -d / 2 + ((ix + 0.5) * d) / pw;
          const cy = h / 2 - ((iy + 0.5) * h) / ph;
          pushVoxel(-w / 2 - thickness / 2, cy, cz, thickness, h / ph, d / pw, r, g, b);
        } else if (faceIdx === 2) {
          // +y (top)
          const cx = -w / 2 + ((ix + 0.5) * w) / pw;
          const cz = -d / 2 + ((iy + 0.5) * d) / ph;
          pushVoxel(cx, h / 2 + thickness / 2, cz, w / pw, thickness, d / ph, r, g, b);
        } else if (faceIdx === 3) {
          // -y (bottom)
          const cx = -w / 2 + ((ix + 0.5) * w) / pw;
          const cz = -d / 2 + ((iy + 0.5) * d) / ph;
          pushVoxel(cx, -h / 2 - thickness / 2, cz, w / pw, thickness, d / ph, r, g, b);
        } else if (faceIdx === 4) {
          // +z (front)
          const cx = -w / 2 + ((ix + 0.5) * w) / pw;
          const cy = h / 2 - ((iy + 0.5) * h) / ph;
          pushVoxel(cx, cy, d / 2 + thickness / 2, w / pw, h / ph, thickness, r, g, b);
        } else {
          // -z (back)
          const cx = w / 2 - ((ix + 0.5) * w) / pw;
          const cy = h / 2 - ((iy + 0.5) * h) / ph;
          pushVoxel(cx, cy, -d / 2 - thickness / 2, w / pw, h / ph, thickness, r, g, b);
        }
      }
    }
  });

  unitBox.dispose();
  if (positions.length === 0) return null;

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geom.setIndex(indices);
  return geom;
}

/**
 * Mirrors a legacy 64x32 sub-region horizontally onto a 64x64 upgraded canvas.
 */
function copyMirroredRegion(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dx: number,
  dy: number
) {
  ctx.save();
  ctx.translate(dx + sw, dy);
  ctx.scale(-1, 1);
  ctx.drawImage(ctx.canvas, sx, sy, sw, sh, 0, 0, sw, sh);
  ctx.restore();
}

/**
 * Normalizes any 64x32 or 64x64 Minecraft skin onto a 64x64 canvas and detects slim (Alex) arms.
 */
function normalizeSkin(img: HTMLImageElement): {
  canvas: HTMLCanvasElement;
  isSlim: boolean;
  hasSecondLayer: boolean;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0);

  const isLegacy = img.height === 32;
  if (isLegacy) {
    // Mirror Right Leg (0,16) -> Left Leg (16,48)
    copyMirroredRegion(ctx, 4, 16, 4, 4, 20, 48);
    copyMirroredRegion(ctx, 8, 16, 4, 4, 24, 48);
    copyMirroredRegion(ctx, 0, 20, 4, 12, 24, 52);
    copyMirroredRegion(ctx, 4, 20, 4, 12, 20, 52);
    copyMirroredRegion(ctx, 8, 20, 4, 12, 16, 52);
    copyMirroredRegion(ctx, 12, 20, 4, 12, 28, 52);

    // Mirror Right Arm (40,16) -> Left Arm (32,48)
    copyMirroredRegion(ctx, 44, 16, 4, 4, 36, 48);
    copyMirroredRegion(ctx, 48, 16, 4, 4, 40, 48);
    copyMirroredRegion(ctx, 40, 20, 4, 12, 40, 52);
    copyMirroredRegion(ctx, 44, 20, 4, 12, 36, 52);
    copyMirroredRegion(ctx, 48, 20, 4, 12, 32, 52);
    copyMirroredRegion(ctx, 52, 20, 4, 12, 44, 52);
  }

  let isSlim = false;
  if (!isLegacy) {
    const pixel = ctx.getImageData(54, 20, 1, 1).data;
    const pixel2 = ctx.getImageData(55, 20, 1, 1).data;
    isSlim = pixel[3] === 0 && pixel2[3] === 0;
  }

  return { canvas, isSlim, hasSecondLayer: !isLegacy };
}

type ClickEmote = 'wave' | 'cheerJump' | 'headTilt' | 'happyDance';

const EMOTE_ORDER: ClickEmote[] = ['wave', 'cheerJump', 'headTilt', 'happyDance'];
const EMOTE_DURATION: Record<ClickEmote, number> = {
  wave: 1.05,
  cheerJump: 0.95,
  headTilt: 1.0,
  happyDance: 1.15,
};

interface NormalizedSkin {
  canvas: HTMLCanvasElement;
  imgData: ImageData;
  isSlim: boolean;
  hasSecondLayer: boolean;
}

interface BuiltCharacterRig {
  group: THREE.Group;
  headPivot: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  texture: THREE.CanvasTexture;
  baseMat: THREE.MeshStandardMaterial;
  overlayMat: THREE.MeshStandardMaterial;
  geometries: THREE.BufferGeometry[];
}

const skinDataCache = new Map<string, Promise<NormalizedSkin>>();

function loadNormalizedSkin(skinUrl: string): Promise<NormalizedSkin> {
  const cached = skinDataCache.get(skinUrl);
  if (cached) return cached;

  const promise = new Promise<NormalizedSkin>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const { canvas, isSlim, hasSecondLayer } = normalizeSkin(img);
      const imgData = canvas.getContext('2d')!.getImageData(0, 0, 64, 64);
      resolve({ canvas, imgData, isSlim, hasSecondLayer });
    };
    img.onerror = (err) => {
      skinDataCache.delete(skinUrl);
      reject(err);
    };
    img.src = skinUrl;
  });

  skinDataCache.set(skinUrl, promise);
  return promise;
}

function buildCharacterRig(skin: NormalizedSkin): BuiltCharacterRig {
  const { canvas, imgData, isSlim, hasSecondLayer } = skin;
  const group = new THREE.Group();

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.needsUpdate = true;

  const baseMat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.72,
    metalness: 0.02,
  });

  const overlayMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.72,
    metalness: 0.02,
  });

  const geometries: THREE.BufferGeometry[] = [];
  const addPart = (
    parent: THREE.Group,
    w: number,
    h: number,
    d: number,
    faceRects: [FaceRect, FaceRect, FaceRect, FaceRect, FaceRect, FaceRect],
    mat: THREE.Material,
    x: number,
    y: number,
    z: number
  ) => {
    const geom = applyMinecraftUVs(new THREE.BoxGeometry(w, h, d), faceRects);
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    geometries.push(geom);
  };

  const addOverlayVoxels = (
    parent: THREE.Group,
    texX: number,
    texY: number,
    texW: number,
    texH: number,
    texD: number,
    w: number,
    h: number,
    d: number,
    thickness: number,
    x: number,
    y: number,
    z: number
  ) => {
    const geom = createOverlayVoxelGeometry(
      imgData,
      texX,
      texY,
      texW,
      texH,
      texD,
      w,
      h,
      d,
      thickness
    );
    if (!geom) return;
    const mesh = new THREE.Mesh(geom, overlayMat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    geometries.push(geom);
  };

  // 1. Head + Hat Voxel Overlay (centered around y = +0.50)
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.02, 0);
  addPart(headPivot, 1.0, 1.0, 1.0, getBoxFaceRects(0, 0, 8, 8, 8), baseMat, 0, 0.5, 0);
  addOverlayVoxels(headPivot, 32, 0, 8, 8, 8, 1.0, 1.0, 1.0, 0.055, 0, 0.5, 0);
  group.add(headPivot);

  // 2. Chibi Torso (y: -0.60 .. +0.02)
  const torsoGroup = new THREE.Group();
  addPart(torsoGroup, 0.66, 0.62, 0.36, getBoxFaceRects(16, 16, 8, 12, 4), baseMat, 0, -0.29, 0);
  if (hasSecondLayer) {
    addOverlayVoxels(torsoGroup, 16, 32, 8, 12, 4, 0.66, 0.62, 0.36, 0.032, 0, -0.29, 0);
  }
  group.add(torsoGroup);

  // 3. Chibi Arms (supports both 3px slim Alex and 4px classic Steve)
  const armTexW = isSlim ? 3 : 4;
  const armW = isSlim ? 0.21 : 0.26;
  const armH = 0.56;
  const armD = 0.29;
  const armOffsetX = 0.33 + armW / 2;

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(-armOffsetX, -0.02, 0);
  addPart(
    rightArmPivot,
    armW,
    armH,
    armD,
    getBoxFaceRects(40, 16, armTexW, 12, 4),
    baseMat,
    0,
    -armH / 2 + 0.04,
    0
  );
  if (hasSecondLayer) {
    addOverlayVoxels(
      rightArmPivot,
      40,
      32,
      armTexW,
      12,
      4,
      armW,
      armH,
      armD,
      0.03,
      0,
      -armH / 2 + 0.04,
      0
    );
  }
  group.add(rightArmPivot);

  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(armOffsetX, -0.02, 0);
  addPart(
    leftArmPivot,
    armW,
    armH,
    armD,
    getBoxFaceRects(32, 48, armTexW, 12, 4),
    baseMat,
    0,
    -armH / 2 + 0.04,
    0
  );
  if (hasSecondLayer) {
    addOverlayVoxels(
      leftArmPivot,
      48,
      48,
      armTexW,
      12,
      4,
      armW,
      armH,
      armD,
      0.03,
      0,
      -armH / 2 + 0.04,
      0
    );
  }
  group.add(leftArmPivot);

  // 4. Short Chibi Legs
  const legW = 0.31;
  const legH = 0.44;
  const legD = 0.34;

  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(-0.165, -0.59, 0);
  rightLegPivot.rotation.x = 0;
  addPart(
    rightLegPivot,
    legW,
    legH,
    legD,
    getBoxFaceRects(0, 16, 4, 12, 4),
    baseMat,
    0,
    -legH / 2,
    0
  );
  if (hasSecondLayer) {
    addOverlayVoxels(
      rightLegPivot,
      0,
      32,
      4,
      12,
      4,
      legW,
      legH,
      legD,
      0.03,
      0,
      -legH / 2,
      0
    );
  }
  group.add(rightLegPivot);

  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(0.165, -0.59, 0);
  leftLegPivot.rotation.x = 0;
  addPart(
    leftLegPivot,
    legW,
    legH,
    legD,
    getBoxFaceRects(16, 48, 4, 12, 4),
    baseMat,
    0,
    -legH / 2,
    0
  );
  if (hasSecondLayer) {
    addOverlayVoxels(
      leftLegPivot,
      0,
      48,
      4,
      12,
      4,
      legW,
      legH,
      legD,
      0.03,
      0,
      -legH / 2,
      0
    );
  }
  group.add(leftLegPivot);

  return {
    group,
    headPivot,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot,
    rightLegPivot,
    texture,
    baseMat,
    overlayMat,
    geometries,
  };
}

/**
 * Interactive 3D Chibi Mojavatar renderer powered by Three.js and real 64x64/64x32 Minecraft skins.
 */
export const Mojavatar3D: React.FC<Mojavatar3DProps> = ({
  mcId,
  skinUrl,
  avatarUrl,
  preloadSkinUrls,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  // Persist user drag/hover rotation & prebuilt 3D rigs without recreating WebGL context on skin swap
  const sceneRefs = useRef<{
    rootGroup: THREE.Group | null;
    rigGroup: THREE.Group | null;
    shadowPlane: THREE.Mesh | null;
    headPivot: THREE.Group | null;
    leftArmPivot: THREE.Group | null;
    rightArmPivot: THREE.Group | null;
    leftLegPivot: THREE.Group | null;
    rightLegPivot: THREE.Group | null;
    rigCache: Map<string, BuiltCharacterRig>;
    buildingUrls: Set<string>;
    activeSkinUrl: string;
    desiredSkinUrl: string;
    targetYaw: number;
    targetPitch: number;
    popTime: number;
    activeEmote: ClickEmote | null;
    emoteTime: number;
    nextEmoteIdx: number;
    hasEnteredView: boolean;
  }>({
    rootGroup: null,
    rigGroup: null,
    shadowPlane: null,
    headPivot: null,
    leftArmPivot: null,
    rightArmPivot: null,
    leftLegPivot: null,
    rightLegPivot: null,
    rigCache: new Map(),
    buildingUrls: new Set(),
    activeSkinUrl: '',
    desiredSkinUrl: skinUrl,
    targetYaw: 0.34,
    targetPitch: 0.08,
    popTime: 0,
    activeEmote: null,
    emoteTime: 0,
    nextEmoteIdx: 0,
    hasEnteredView: false,
  });

  useEffect(() => {
    const mount = containerRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const width = mount.clientWidth || 320;
    const height = mount.clientHeight || 320;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 50);
    camera.position.set(0, 0.18, 5.45);
    camera.lookAt(0, 0.0, 0);

    // Balanced studio lighting for bright, vibrant chibi figurine shading + clear shadow
    const ambient = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfffaf5, 1.35);
    keyLight.position.set(2.2, 4.2, 3.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 512;
    keyLight.shadow.mapSize.height = 512;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 14;
    keyLight.shadow.camera.left = -2;
    keyLight.shadow.camera.right = 2;
    keyLight.shadow.camera.top = 2;
    keyLight.shadow.camera.bottom = -2;
    keyLight.shadow.bias = -0.002;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xb2bceb, 0.7);
    rimLight.position.set(-3.0, 1.6, -2.2);
    scene.add(rimLight);

    const rootGroup = new THREE.Group();
    rootGroup.rotation.y = sceneRefs.current.targetYaw;
    rootGroup.rotation.x = sceneRefs.current.targetPitch;
    scene.add(rootGroup);

    const rigGroup = new THREE.Group();
    rootGroup.add(rigGroup);

    // Real-time directional shadow receiver + soft ground contact shadow beneath chibi feet
    const shadowReceiver = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 3.2),
      new THREE.ShadowMaterial({ opacity: 0.42 })
    );
    shadowReceiver.rotation.x = -Math.PI / 2;
    shadowReceiver.position.y = -1.06;
    shadowReceiver.receiveShadow = true;
    scene.add(shadowReceiver);

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(64, 64, 6, 64, 64, 58);
    grad.addColorStop(0, 'rgba(20, 19, 34, 0.65)');
    grad.addColorStop(0.55, 'rgba(20, 19, 34, 0.34)');
    grad.addColorStop(1, 'rgba(20, 19, 34, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.55, 1.55),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.055;
    scene.add(shadowPlane);

    sceneRefs.current.rootGroup = rootGroup;
    sceneRefs.current.rigGroup = rigGroup;
    sceneRefs.current.shadowPlane = shadowPlane;

    let rafId = 0;
    let isNearViewport = false;
    let isRunning = false;
    let disposed = false;
    const clock = new THREE.Clock();
    const POP_DURATION = 0.72;

    const syncLoop = () => {
      const shouldRun = !disposed && isNearViewport && !document.hidden;
      if (shouldRun && !isRunning) {
        isRunning = true;
        clock.getDelta();
        rafId = requestAnimationFrame(animate);
      } else if (!shouldRun && isRunning) {
        isRunning = false;
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    // Pause WebGL rendering while scrolled off-screen or tab is hidden
    const visibilityIo = new IntersectionObserver(
      (entries) => {
        isNearViewport = entries.some((entry) => entry.isIntersecting);
        syncLoop();
      },
      { rootMargin: '120px 0px', threshold: 0 }
    );
    visibilityIo.observe(mount);

    const handleVisibilityChange = () => syncLoop();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Trigger Q-bouncy entrance when scrolling into view the first time
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && !sceneRefs.current.hasEnteredView) {
          sceneRefs.current.hasEnteredView = true;
          sceneRefs.current.popTime = 0;
        }
      },
      { threshold: 0.25 }
    );
    io.observe(mount);

    // Pointer interaction: gentle tilt on hover, drag-to-spin 360°, click-to-emote
    let isDragging = false;
    let lastX = 0;
    let downX = 0;
    let downY = 0;
    let downTime = 0;

    const triggerClickEmote = () => {
      const refs = sceneRefs.current;
      const emote = EMOTE_ORDER[refs.nextEmoteIdx % EMOTE_ORDER.length];
      refs.nextEmoteIdx += 1;
      refs.activeEmote = emote;
      refs.emoteTime = 0;
    };

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastX = e.clientX;
      downX = e.clientX;
      downY = e.clientY;
      downTime = performance.now();
      mount.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        sceneRefs.current.targetYaw += dx * 0.012;
      } else {
        const rect = mount.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        sceneRefs.current.targetYaw = 0.34 + nx * 0.28;
        sceneRefs.current.targetPitch = 0.08 + ny * 0.12;
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDragging) {
        const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
        const elapsed = performance.now() - downTime;
        if (dist < 6 && elapsed < 360) {
          triggerClickEmote();
        }
      }
      isDragging = false;
    };

    const handlePointerLeave = () => {
      if (!isDragging) {
        sceneRefs.current.targetYaw = 0.34;
        sceneRefs.current.targetPitch = 0.08;
      }
    };

    mount.addEventListener('pointerdown', handlePointerDown);
    mount.addEventListener('pointermove', handlePointerMove);
    mount.addEventListener('pointerup', handlePointerUp);
    mount.addEventListener('pointerleave', handlePointerLeave);

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || 320;
      const h = mount.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    function animate() {
      if (!isRunning || disposed) return;
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();
      const refs = sceneRefs.current;

      // 1. Q-bouncy squash-and-stretch pop-up entrance animation
      refs.popTime = Math.min(POP_DURATION, refs.popTime + dt);
      const p = refs.popTime / POP_DURATION;

      let scaleX = 1;
      let scaleY = 1;
      let scaleZ = 1;
      let jumpY = 0;
      let spinOffsetY = 0;
      let rigTiltZ = 0;

      // Base idle pose targets
      let headRotX = 0;
      let headRotY = 0;
      let headRotZ = -0.04 + Math.sin(t * 1.4) * 0.025;
      let rightArmX = -0.22 + Math.sin(t * 2.1) * 0.07;
      let rightArmZ = -0.14 - Math.sin(t * 1.6) * 0.04;
      let leftArmX = 0.18 - Math.sin(t * 2.1) * 0.07;
      let leftArmZ = 0.12 + Math.sin(t * 1.6) * 0.03;
      let rightLegX = 0;
      let leftLegX = 0;

      if (p < 1) {
        // Elastic spring pop from below with squash-and-stretch
        const rise = 1 - Math.pow(1 - Math.min(1, p / 0.45), 3);
        const hop = Math.sin(Math.min(1, p / 0.65) * Math.PI) * 0.28;
        const microHop =
          p > 0.65 ? Math.sin(((p - 0.65) / 0.35) * Math.PI) * 0.055 : 0;
        jumpY += -0.68 * (1 - rise) + hop + microHop;

        // Damped jelly oscillation for squash & stretch
        const jelly = Math.sin(p * Math.PI * 3.2) * Math.exp(-p * 3.8) * 0.24;
        const baseScale = Math.min(1, 0.22 + rise * 0.78);
        scaleY *= baseScale * (1 + jelly);
        scaleX *= baseScale * (1 - jelly * 0.65);
        scaleZ *= baseScale * (1 - jelly * 0.65);

        // Excited little arm lift during pop-in
        const armPop = Math.sin(p * Math.PI) * (1 - p);
        rightArmZ -= armPop * 0.65;
        leftArmZ += armPop * 0.65;
      }

      // 2. Click Emotes
      if (refs.activeEmote) {
        const dur = EMOTE_DURATION[refs.activeEmote];
        refs.emoteTime += dt;
        const ep = Math.min(1, refs.emoteTime / dur);
        // Smooth fade-in and fade-out envelope
        const env = Math.sin(Math.min(1, ep / 0.15) * (Math.PI / 2)) *
          Math.sin(Math.min(1, (1 - ep) / 0.2) * (Math.PI / 2));

        if (refs.activeEmote === 'wave') {
          // Friendly wave + slight lean + tiny joyful bounce
          const waveSwing = Math.sin(ep * Math.PI * 6.5) * 0.36;
          rightArmX = THREE.MathUtils.lerp(rightArmX, -0.35, env);
          rightArmZ = THREE.MathUtils.lerp(rightArmZ, -2.55 + waveSwing, env);
          leftArmZ = THREE.MathUtils.lerp(leftArmZ, 0.32, env);
          headRotZ = THREE.MathUtils.lerp(headRotZ, 0.16 + waveSwing * 0.12, env);
          headRotY = THREE.MathUtils.lerp(headRotY, -0.14, env);
          rigTiltZ += 0.06 * env;
          const b = Math.abs(Math.sin(ep * Math.PI * 2)) * 0.09 * env;
          jumpY += b;
          const sq = Math.sin(ep * Math.PI * 4) * 0.06 * env;
          scaleY *= 1 + sq;
          scaleX *= 1 - sq * 0.5;
          scaleZ *= 1 - sq * 0.5;
        } else if (refs.activeEmote === 'cheerJump') {
          // Anticipation squash -> 360° airborne cheer spin -> squishy landing
          if (ep < 0.18) {
            const c = Math.sin((ep / 0.18) * Math.PI);
            scaleY *= 1 - c * 0.18;
            scaleX *= 1 + c * 0.12;
            scaleZ *= 1 + c * 0.12;
            jumpY -= c * 0.08;
            rightArmX = THREE.MathUtils.lerp(rightArmX, 0.35, c);
            leftArmX = THREE.MathUtils.lerp(leftArmX, 0.35, c);
          } else if (ep < 0.78) {
            const air = (ep - 0.18) / 0.6;
            const arc = Math.sin(air * Math.PI);
            jumpY += arc * 0.48;
            spinOffsetY += air * Math.PI * 2;
            scaleY *= 1 + arc * 0.1;
            scaleX *= 1 - arc * 0.05;
            scaleZ *= 1 - arc * 0.05;
            rightArmZ = THREE.MathUtils.lerp(rightArmZ, -2.5, arc);
            leftArmZ = THREE.MathUtils.lerp(leftArmZ, 2.5, arc);
            rightLegX = THREE.MathUtils.lerp(rightLegX, 0.45 * Math.sin(air * Math.PI * 2), arc);
            leftLegX = THREE.MathUtils.lerp(leftLegX, -0.45 * Math.sin(air * Math.PI * 2), arc);
          } else {
            const land = (ep - 0.78) / 0.22;
            const j = Math.sin(land * Math.PI * 1.5) * (1 - land) * 0.18;
            scaleY *= 1 - j;
            scaleX *= 1 + j * 0.65;
            scaleZ *= 1 + j * 0.65;
          }
        } else if (refs.activeEmote === 'headTilt') {
          // Playful curious double head-tilt with jelly wobble
          const tiltWave = Math.sin(ep * Math.PI * 2);
          headRotZ = THREE.MathUtils.lerp(headRotZ, tiltWave * 0.36, env);
          headRotY = THREE.MathUtils.lerp(headRotY, -tiltWave * 0.22, env);
          headRotX = THREE.MathUtils.lerp(headRotX, -0.08, env);
          rightArmZ = THREE.MathUtils.lerp(rightArmZ, -0.52 - Math.abs(tiltWave) * 0.25, env);
          leftArmZ = THREE.MathUtils.lerp(leftArmZ, 0.52 + Math.abs(tiltWave) * 0.25, env);
          const wobble = Math.sin(ep * Math.PI * 5) * 0.07 * env;
          scaleY *= 1 + wobble;
          scaleX *= 1 - wobble * 0.55;
          scaleZ *= 1 - wobble * 0.55;
        } else if (refs.activeEmote === 'happyDance') {
          // Bouncy little marching dance with swinging arms & legs
          const beat = ep * Math.PI * 4;
          const step = Math.sin(beat);
          const bounce = Math.abs(Math.sin(beat));
          jumpY += bounce * 0.12 * env;
          rigTiltZ += step * 0.09 * env;
          headRotZ = THREE.MathUtils.lerp(headRotZ, -step * 0.18, env);
          rightArmX = THREE.MathUtils.lerp(rightArmX, step * 0.75, env);
          leftArmX = THREE.MathUtils.lerp(leftArmX, -step * 0.75, env);
          rightArmZ = THREE.MathUtils.lerp(rightArmZ, -0.35 - bounce * 0.25, env);
          leftArmZ = THREE.MathUtils.lerp(leftArmZ, 0.35 + bounce * 0.25, env);
          rightLegX = THREE.MathUtils.lerp(rightLegX, -step * 0.55, env);
          leftLegX = THREE.MathUtils.lerp(leftLegX, step * 0.55, env);
          const sq = (bounce - 0.45) * 0.12 * env;
          scaleY *= 1 + sq;
          scaleX *= 1 - sq * 0.5;
          scaleZ *= 1 - sq * 0.5;
        }

        if (ep >= 1) {
          refs.activeEmote = null;
          refs.emoteTime = 0;
        }
      }

      if (refs.rootGroup && refs.rigGroup) {
        refs.rootGroup.rotation.y +=
          (refs.targetYaw - refs.rootGroup.rotation.y) * 0.1;
        refs.rootGroup.rotation.x +=
          (refs.targetPitch - refs.rootGroup.rotation.x) * 0.1;

        refs.rigGroup.scale.set(scaleX, scaleY, scaleZ);
        refs.rigGroup.position.y = Math.sin(t * 2.1) * 0.035 + jumpY;
        refs.rigGroup.rotation.y = spinOffsetY;
        refs.rigGroup.rotation.z = rigTiltZ;
      }

      if (refs.shadowPlane) {
        const heightFactor = Math.max(0.45, 1 - Math.max(0, jumpY) * 0.7);
        const shadowScale = Math.min(1.15, scaleX) * heightFactor;
        refs.shadowPlane.scale.setScalar(Math.max(0.15, shadowScale));
      }

      if (refs.headPivot) {
        refs.headPivot.rotation.x = headRotX;
        refs.headPivot.rotation.y = headRotY;
        refs.headPivot.rotation.z = headRotZ;
      }
      if (refs.rightArmPivot) {
        refs.rightArmPivot.rotation.x = rightArmX;
        refs.rightArmPivot.rotation.z = rightArmZ;
      }
      if (refs.leftArmPivot) {
        refs.leftArmPivot.rotation.x = leftArmX;
        refs.leftArmPivot.rotation.z = leftArmZ;
      }
      if (refs.rightLegPivot) {
        refs.rightLegPivot.rotation.x = rightLegX;
      }
      if (refs.leftLegPivot) {
        refs.leftLegPivot.rotation.x = leftLegX;
      }

      renderer.render(scene, camera);
    }
    syncLoop();

    return () => {
      disposed = true;
      isRunning = false;
      cancelAnimationFrame(rafId);
      io.disconnect();
      visibilityIo.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      mount.removeEventListener('pointerdown', handlePointerDown);
      mount.removeEventListener('pointermove', handlePointerMove);
      mount.removeEventListener('pointerup', handlePointerUp);
      mount.removeEventListener('pointerleave', handlePointerLeave);

      sceneRefs.current.rigCache.forEach((rig) => {
        rig.geometries.forEach((g) => g.dispose());
        rig.baseMat.dispose();
        rig.overlayMat.dispose();
        rig.texture.dispose();
      });
      sceneRefs.current.rigCache.clear();
      sceneRefs.current.buildingUrls.clear();
      sceneRefs.current.activeSkinUrl = '';
      shadowReceiver.geometry.dispose();
      (shadowReceiver.material as THREE.Material).dispose();
      shadowPlane.geometry.dispose();
      (shadowPlane.material as THREE.Material).dispose();
      shadowTex.dispose();
      renderer.dispose();
    };
  }, []);

  // Activate a prebuilt rig instantaneously (0ms swap, no geometry rebuild)
  const activateRig = (url: string, rig: BuiltCharacterRig) => {
    const refs = sceneRefs.current;
    if (refs.activeSkinUrl && refs.activeSkinUrl !== url) {
      const prev = refs.rigCache.get(refs.activeSkinUrl);
      if (prev) prev.group.visible = false;
    }
    rig.group.visible = true;
    refs.activeSkinUrl = url;
    refs.headPivot = rig.headPivot;
    refs.leftArmPivot = rig.leftArmPivot;
    refs.rightArmPivot = rig.rightArmPivot;
    refs.leftLegPivot = rig.leftLegPivot;
    refs.rightLegPivot = rig.rightLegPivot;
    refs.popTime = 0;
    refs.activeEmote = null;
    refs.emoteTime = 0;
  };

  // Switch active chibi Mojavatar rig whenever skinUrl changes
  useEffect(() => {
    const refs = sceneRefs.current;
    const rigGroup = refs.rigGroup;
    refs.desiredSkinUrl = skinUrl;
    if (!rigGroup || webglFailed) return;

    const cached = refs.rigCache.get(skinUrl);
    if (cached) {
      if (refs.activeSkinUrl !== skinUrl) {
        activateRig(skinUrl, cached);
      }
      return;
    }

    let cancelled = false;
    refs.buildingUrls.add(skinUrl);
    loadNormalizedSkin(skinUrl)
      .then((skin) => {
        refs.buildingUrls.delete(skinUrl);
        if (cancelled || !refs.rigGroup) return;
        let rig = refs.rigCache.get(skinUrl);
        if (!rig) {
          rig = buildCharacterRig(skin);
          rig.group.visible = false;
          refs.rigGroup.add(rig.group);
          refs.rigCache.set(skinUrl, rig);
        }
        if (refs.desiredSkinUrl === skinUrl) {
          activateRig(skinUrl, rig);
        }
      })
      .catch(() => {
        refs.buildingUrls.delete(skinUrl);
      });

    return () => {
      cancelled = true;
    };
  }, [skinUrl, webglFailed]);

  // Background staggered preload of all member skins & 3D voxel rigs during idle time
  useEffect(() => {
    const refs = sceneRefs.current;
    if (!preloadSkinUrls?.length || !refs.rigGroup || webglFailed) return;

    let cancelled = false;
    const timers: number[] = [];
    const idleIds: number[] = [];
    const queue = preloadSkinUrls.filter(
      (url) => url !== skinUrl && !refs.rigCache.has(url) && !refs.buildingUrls.has(url)
    );

    const scheduleIdle = (fn: () => void) => {
      if ('requestIdleCallback' in window) {
        const id = window.requestIdleCallback(fn, { timeout: 1500 });
        idleIds.push(id);
      } else {
        fn();
      }
    };

    queue.forEach((url, idx) => {
      const timerId = window.setTimeout(() => {
        scheduleIdle(() => {
          if (cancelled || !refs.rigGroup || refs.rigCache.has(url) || refs.buildingUrls.has(url)) {
            return;
          }
          refs.buildingUrls.add(url);
          loadNormalizedSkin(url)
            .then((skin) => {
              refs.buildingUrls.delete(url);
              if (cancelled || !refs.rigGroup || refs.rigCache.has(url)) return;
              const rig = buildCharacterRig(skin);
              rig.group.visible = false;
              refs.rigGroup.add(rig.group);
              refs.rigCache.set(url, rig);
              if (refs.desiredSkinUrl === url) {
                activateRig(url, rig);
              }
            })
            .catch(() => {
              refs.buildingUrls.delete(url);
            });
        });
      }, 240 + idx * 120);
      timers.push(timerId);
    });

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
      if ('cancelIdleCallback' in window) {
        idleIds.forEach((id) => window.cancelIdleCallback(id));
      }
    };
  }, [preloadSkinUrls, webglFailed]);

  if (webglFailed) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <MinecraftHead seed={mcId} avatarUrl={avatarUrl} size={140} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      title="点击触发小动作，拖动可旋转查看 3D 角色"
      style={{ filter: 'drop-shadow(0 12px 16px rgba(24, 22, 42, 0.45))' }}
      className="h-full w-full cursor-pointer select-none active:cursor-grabbing"
    />
  );
};
