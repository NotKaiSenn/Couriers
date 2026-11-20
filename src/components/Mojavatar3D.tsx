import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MinecraftHead } from './MinecraftHead';

interface Mojavatar3DProps {
  mcId: string;
  skinUrl: string;
  avatarUrl?: string;
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

/**
 * Interactive 3D Chibi Mojavatar renderer powered by Three.js and real 64x64/64x32 Minecraft skins.
 */
export const Mojavatar3D: React.FC<Mojavatar3DProps> = ({
  mcId,
  skinUrl,
  avatarUrl,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  // Persist user drag/hover rotation cleanly without recreating WebGL context on skin swap
  const sceneRefs = useRef<{
    rootGroup: THREE.Group | null;
    rigGroup: THREE.Group | null;
    headPivot: THREE.Group | null;
    leftArmPivot: THREE.Group | null;
    rightArmPivot: THREE.Group | null;
    leftLegPivot: THREE.Group | null;
    rightLegPivot: THREE.Group | null;
    texture: THREE.CanvasTexture | null;
    characterMeshes: THREE.Object3D[];
    baseMat: THREE.MeshStandardMaterial | null;
    overlayMat: THREE.MeshStandardMaterial | null;
    targetYaw: number;
    targetPitch: number;
    popProgress: number;
  }>({
    rootGroup: null,
    rigGroup: null,
    headPivot: null,
    leftArmPivot: null,
    rightArmPivot: null,
    leftLegPivot: null,
    rightLegPivot: null,
    texture: null,
    characterMeshes: [],
    baseMat: null,
    overlayMat: null,
    targetYaw: 0.34,
    targetPitch: 0.08,
    popProgress: 0,
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

    // Pointer interaction: gentle tilt on hover, drag-to-spin 360°
    let isDragging = false;
    let lastX = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastX = e.clientX;
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

    const handlePointerUp = () => {
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

    let rafId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const refs = sceneRefs.current;

      // Smooth spring pop on member switch
      refs.popProgress = Math.min(1, refs.popProgress + 0.08);
      const easeOut = 1 - Math.pow(1 - refs.popProgress, 3);
      const s = 0.86 + 0.14 * easeOut;

      if (refs.rootGroup && refs.rigGroup) {
        refs.rootGroup.rotation.y +=
          (refs.targetYaw - refs.rootGroup.rotation.y) * 0.1;
        refs.rootGroup.rotation.x +=
          (refs.targetPitch - refs.rootGroup.rotation.x) * 0.1;
        refs.rigGroup.scale.setScalar(s);
        refs.rigGroup.position.y = Math.sin(t * 2.1) * 0.035;
      }

      if (refs.headPivot) {
        refs.headPivot.rotation.z = -0.04 + Math.sin(t * 1.4) * 0.025;
      }
      if (refs.rightArmPivot) {
        refs.rightArmPivot.rotation.x = -0.22 + Math.sin(t * 2.1) * 0.07;
        refs.rightArmPivot.rotation.z = -0.14 - Math.sin(t * 1.6) * 0.04;
      }
      if (refs.leftArmPivot) {
        refs.leftArmPivot.rotation.x = 0.18 - Math.sin(t * 2.1) * 0.07;
        refs.leftArmPivot.rotation.z = 0.12 + Math.sin(t * 1.6) * 0.03;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      mount.removeEventListener('pointerdown', handlePointerDown);
      mount.removeEventListener('pointermove', handlePointerMove);
      mount.removeEventListener('pointerup', handlePointerUp);
      mount.removeEventListener('pointerleave', handlePointerLeave);

      sceneRefs.current.characterMeshes.forEach((obj) => {
        if (obj instanceof THREE.Mesh) obj.geometry.dispose();
      });
      sceneRefs.current.baseMat?.dispose();
      sceneRefs.current.overlayMat?.dispose();
      sceneRefs.current.texture?.dispose();
      shadowReceiver.geometry.dispose();
      (shadowReceiver.material as THREE.Material).dispose();
      shadowPlane.geometry.dispose();
      (shadowPlane.material as THREE.Material).dispose();
      shadowTex.dispose();
      renderer.dispose();
    };
  }, []);

  // Load & rebuild chibi Mojavatar rig whenever skinUrl changes
  useEffect(() => {
    const rigGroup = sceneRefs.current.rigGroup;
    if (!rigGroup || webglFailed) return;

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = skinUrl;

    img.onload = () => {
      if (cancelled || !sceneRefs.current.rigGroup) return;

      const { canvas, isSlim, hasSecondLayer } = normalizeSkin(img);
      const texture = new THREE.CanvasTexture(canvas);
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = false;
      texture.needsUpdate = true;

      // Clear previous character meshes cleanly
      while (rigGroup.children.length > 0) {
        const child = rigGroup.children[0];
        rigGroup.remove(child);
      }
      sceneRefs.current.characterMeshes.forEach((obj) => {
        if (obj instanceof THREE.Mesh) obj.geometry.dispose();
      });
      sceneRefs.current.baseMat?.dispose();
      sceneRefs.current.overlayMat?.dispose();
      sceneRefs.current.texture?.dispose();

      const baseMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.72,
        metalness: 0.02,
      });

      const overlayMat = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.1,
        side: THREE.DoubleSide,
        roughness: 0.7,
        metalness: 0.02,
      });

      const createdMeshes: THREE.Object3D[] = [];
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
        createdMeshes.push(mesh);
      };

      // Chibi Mojavatar Proportions: large expressive head + compact torso & short limbs
      // 1. Head + Hat Overlay (centered around y = +0.50)
      const headPivot = new THREE.Group();
      headPivot.position.set(0, 0.02, 0);
      addPart(headPivot, 1.0, 1.0, 1.0, getBoxFaceRects(0, 0, 8, 8, 8), baseMat, 0, 0.5, 0);
      addPart(
        headPivot,
        1.11,
        1.11,
        1.11,
        getBoxFaceRects(32, 0, 8, 8, 8),
        overlayMat,
        0,
        0.5,
        0
      );
      rigGroup.add(headPivot);

      // 2. Chibi Torso (y: -0.60 .. +0.02)
      const torsoGroup = new THREE.Group();
      addPart(torsoGroup, 0.66, 0.62, 0.36, getBoxFaceRects(16, 16, 8, 12, 4), baseMat, 0, -0.29, 0);
      if (hasSecondLayer) {
        addPart(
          torsoGroup,
          0.72,
          0.68,
          0.42,
          getBoxFaceRects(16, 32, 8, 12, 4),
          overlayMat,
          0,
          -0.29,
          0
        );
      }
      rigGroup.add(torsoGroup);

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
        addPart(
          rightArmPivot,
          armW + 0.05,
          armH + 0.05,
          armD + 0.05,
          getBoxFaceRects(40, 32, armTexW, 12, 4),
          overlayMat,
          0,
          -armH / 2 + 0.04,
          0
        );
      }
      rigGroup.add(rightArmPivot);

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
        addPart(
          leftArmPivot,
          armW + 0.05,
          armH + 0.05,
          armD + 0.05,
          getBoxFaceRects(48, 48, armTexW, 12, 4),
          overlayMat,
          0,
          -armH / 2 + 0.04,
          0
        );
      }
      rigGroup.add(leftArmPivot);

      // 4. Short Chibi Legs (dynamic walking stride)
      const legW = 0.31;
      const legH = 0.44;
      const legD = 0.34;

      const rightLegPivot = new THREE.Group();
      rightLegPivot.position.set(-0.165, -0.59, 0);
      rightLegPivot.rotation.x = 0.22;
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
        addPart(
          rightLegPivot,
          legW + 0.05,
          legH + 0.05,
          legD + 0.05,
          getBoxFaceRects(0, 32, 4, 12, 4),
          overlayMat,
          0,
          -legH / 2,
          0
        );
      }
      rigGroup.add(rightLegPivot);

      const leftLegPivot = new THREE.Group();
      leftLegPivot.position.set(0.165, -0.59, 0);
      leftLegPivot.rotation.x = -0.22;
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
        addPart(
          leftLegPivot,
          legW + 0.05,
          legH + 0.05,
          legD + 0.05,
          getBoxFaceRects(0, 48, 4, 12, 4),
          overlayMat,
          0,
          -legH / 2,
          0
        );
      }
      rigGroup.add(leftLegPivot);

      sceneRefs.current.headPivot = headPivot;
      sceneRefs.current.leftArmPivot = leftArmPivot;
      sceneRefs.current.rightArmPivot = rightArmPivot;
      sceneRefs.current.leftLegPivot = leftLegPivot;
      sceneRefs.current.rightLegPivot = rightLegPivot;
      sceneRefs.current.texture = texture;
      sceneRefs.current.baseMat = baseMat;
      sceneRefs.current.overlayMat = overlayMat;
      sceneRefs.current.characterMeshes = createdMeshes;
      sceneRefs.current.popProgress = 0;
    };

    return () => {
      cancelled = true;
    };
  }, [skinUrl, webglFailed]);

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
      title="拖动可旋转查看 3D 角色"
      style={{ filter: 'drop-shadow(0 12px 16px rgba(24, 22, 42, 0.45))' }}
      className="h-full w-full cursor-grab select-none active:cursor-grabbing"
    />
  );
};
