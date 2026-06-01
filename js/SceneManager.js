import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

/**
 * SceneManager — Manages the Three.js renderer, camera, lighting,
 * post-processing, and dynamic environment transitions.
 */
export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.scrollProgress = 0;
    this.mouse = new THREE.Vector2(0, 0);
    this.targetMouse = new THREE.Vector2(0, 0);

    this._initRenderer();
    this._initScene();
    this._initCamera();
    this._initLighting();
    this._initPostProcessing();
    this._initListeners();
    this.resize();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this._getPixelRatio());
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  _getPixelRatio() {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;

    if (width <= 480) return Math.min(dpr, 1.15);
    if (width <= 768) return Math.min(dpr, 1.25);
    if (width <= 1180) return Math.min(dpr, 1.5);
    return Math.min(dpr, 1.75);
  }

  _initScene() {
    this.scene = new THREE.Scene();

    this.backgroundStops = [
      new THREE.Color(0xFFBE9F), // Pantone 162 C peach
      new THREE.Color(0xF9D4C5),
      new THREE.Color(0xEED4D9),
      new THREE.Color(0xE8D3EF),
      new THREE.Color(0xD5EEF0),
      new THREE.Color(0xE1EFCE), // Pantone 9580 C green
      new THREE.Color(0xF3E7EA),
    ];
    this.activeBg = this.backgroundStops[0].clone();
    this.scene.fog = new THREE.FogExp2(this.activeBg, 0.008);
    this.scene.background = this.activeBg.clone();

    this._initLiveBotanicals();
    this._initDimensionalBotanicals();
  }

  _initLiveBotanicals() {
    // Minimalistic SVG line-like elements
    const leafLineSvg = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 10 C80 40, 90 80, 50 90 C10 80, 20 40, 50 10 Z' fill='none' stroke='%23ffffff' stroke-width='3'/%3E%3Cpath d='M50 15 L50 85' fill='none' stroke='%23ffffff' stroke-width='2'/%3E%3C/svg%3E`;
    const flowerLineSvg = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='30' r='18' fill='none' stroke='%23ffffff' stroke-width='3'/%3E%3Ccircle cx='50' cy='70' r='18' fill='none' stroke='%23ffffff' stroke-width='3'/%3E%3Ccircle cx='30' cy='50' r='18' fill='none' stroke='%23ffffff' stroke-width='3'/%3E%3Ccircle cx='70' cy='50' r='18' fill='none' stroke='%23ffffff' stroke-width='3'/%3E%3Ccircle cx='50' cy='50' r='6' fill='none' stroke='%23ffffff' stroke-width='3'/%3E%3C/svg%3E`;
    const vineLineSvg = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 100 Q 20 60 70 30 T 40 0' fill='none' stroke='%23ffffff' stroke-width='3'/%3E%3C/svg%3E`;

    const tl = new THREE.TextureLoader();
    const leafTex = tl.load(leafLineSvg);
    const flowerTex = tl.load(flowerLineSvg);
    const vineTex = tl.load(vineLineSvg);

    this.botanicals = new THREE.Group();

    const createMesh = (tex, colorStr, opacityVal, count, scaleX, scaleY) => {
      const geo = new THREE.PlaneGeometry(scaleX, scaleY);
      for (let i = 0; i < count; i++) {
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          color: colorStr,
          transparent: true,
          opacity: opacityVal,
          depthWrite: false,
          side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 20 - 5);
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        mesh.userData = {
          rx: (Math.random() - 0.5) * 0.015,
          ry: (Math.random() - 0.5) * 0.015,
          vy: -Math.random() * 0.01 - 0.005,
          vx: (Math.random() - 0.5) * 0.008
        };
        this.botanicals.add(mesh);
      }
    };

    // Leafy green botanicals
    createMesh(leafTex, 0x2F6F45, 0.32, 110, 0.8, 0.8);
    createMesh(flowerTex, 0x6FA85D, 0.24, 70, 0.6, 0.6);
    createMesh(vineTex, 0x9BCB76, 0.26, 80, 0.7, 1.4);

    this.scene.add(this.botanicals);
  }

  _initDimensionalBotanicals() {
    this.dimensionalBotanicals = new THREE.Group();

    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0.75);
    leafShape.bezierCurveTo(0.7, 0.35, 0.58, -0.45, 0, -0.82);
    leafShape.bezierCurveTo(-0.58, -0.45, -0.7, 0.35, 0, 0.75);

    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0.62);
    petalShape.bezierCurveTo(0.46, 0.44, 0.54, -0.24, 0, -0.7);
    petalShape.bezierCurveTo(-0.54, -0.24, -0.46, 0.44, 0, 0.62);

    const leafGeo = new THREE.ExtrudeGeometry(leafShape, { depth: 0.04, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2 });
    const petalGeo = new THREE.ExtrudeGeometry(petalShape, { depth: 0.035, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2 });
    const berryGeo = new THREE.SphereGeometry(0.16, 16, 12);
    const seedGeo = new THREE.CapsuleGeometry(0.09, 0.42, 6, 12);
    const ringGeo = new THREE.TorusGeometry(0.22, 0.025, 8, 24);
    const geometries = [leafGeo, petalGeo, berryGeo, seedGeo, ringGeo];
    const colors = [0x2F6F45, 0x3F8F4A, 0x5FA85D, 0x79B56B, 0x9BCB76, 0xC8E6A0, 0xE1EFCE, 0x1F5E3B];

    for (let i = 0; i < 140; i++) {
      const color = colors[i % colors.length];
      const mat = new THREE.MeshPhysicalMaterial({
        color,
        emissive: color,
        emissiveIntensity: i % 5 === 0 ? 0.16 : 0.08,
        transparent: true,
        opacity: i % 5 === 0 ? 0.42 : 0.32,
        roughness: 0.72,
        metalness: 0.04,
        clearcoat: 0.2,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(geometries[i % geometries.length], mat);
      const scale = 0.28 + Math.random() * 0.62;
      mesh.scale.setScalar(scale);
      mesh.position.set(
        (Math.random() - 0.5) * 34,
        Math.random() * 135 - 82,
        -16 + Math.random() * 18
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      mesh.userData = {
        baseX: mesh.position.x,
        phase: Math.random() * Math.PI * 2,
        drift: 0.35 + Math.random() * 0.85,
        vy: -0.006 - Math.random() * 0.014,
        rx: (Math.random() - 0.5) * 0.012,
        ry: (Math.random() - 0.5) * 0.014,
        rz: (Math.random() - 0.5) * 0.01,
      };
      this.dimensionalBotanicals.add(mesh);
    }

    this.scene.add(this.dimensionalBotanicals);
  }

  _initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      0.1,
      200
    );
    this.camera.position.set(0, 0, 12);
    this.camera.lookAt(0, 0, 0);
  }

  _initLighting() {
    // Primrose ambient
    this.ambientLight = new THREE.AmbientLight(0xEED4D9, 0.42);
    this.scene.add(this.ambientLight);

    // Primrose key light
    this.keyLight = new THREE.DirectionalLight(0xEED4D9, 0.55);
    this.keyLight.position.set(5, 8, 10);
    this.scene.add(this.keyLight);

    // Lyons Blue fill light
    this.fillLight = new THREE.DirectionalLight(0x005871, 0.16);
    this.fillLight.position.set(-5, -3, 8);
    this.scene.add(this.fillLight);

    // Fig rim light
    this.rimLight = new THREE.PointLight(0x532E3B, 0.28, 50);
    this.rimLight.position.set(0, 5, -5);
    this.scene.add(this.rimLight);
  }

  _initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      0.08,  // strength
      0.32,  // radius
      0.96   // threshold
    );
    this.composer.addPass(this.bloomPass);
  }

  _initListeners() {
    window.addEventListener('mousemove', (e) => {
      this.targetMouse.x = (e.clientX / this.width) * 2 - 1;
      this.targetMouse.y = -(e.clientY / this.height) * 2 + 1;
    });
  }

  /**
   * Add a 3D object group to the scene
   */
  add(object) {
    this.scene.add(object);
  }

  /**
   * Handle window resize - Self-optimizing for Mobile, 4:3, and Widescreen
   */
  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const aspect = this.width / this.height;
    this.camera.aspect = aspect;

    // Self-optimization logic for different window sizes
    if (this.width <= 768) {
      this.camera.fov = aspect < 0.78 ? 76 : 70;
    } else if (aspect < 0.8) {
      // Mobile / Portrait: increase FOV so 3D objects fit horizontally
      this.camera.fov = 75;
    } else if (this.width <= 1180 && aspect < 1.1) {
      this.camera.fov = 68;
    } else if (aspect > 2.0) {
      // Ultrawide / Widescreen: decrease FOV to prevent horizontal stretching/zooming out
      this.camera.fov = 45;
    } else {
      // Standard 16:9 or 4:3: smoothly interpolate FOV based on aspect ratio
      // 4:3 (~1.33) -> FOV ~65 | 16:9 (~1.77) -> FOV ~55
      this.camera.fov = 60 + (1.5 - aspect) * 15;
    }

    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(this._getPixelRatio());
    this.renderer.setSize(this.width, this.height);
    this.composer?.setPixelRatio?.(this._getPixelRatio());
    this.composer.setSize(this.width, this.height);
  }

  /**
   * Update scroll-driven environment transitions
   */
  updateScroll(progress) {
    this.scrollProgress = progress;

    const clampedProgress = THREE.MathUtils.clamp(progress, 0, 1);
    const scaled = clampedProgress * (this.backgroundStops.length - 1);
    const index = Math.min(Math.floor(scaled), this.backgroundStops.length - 2);
    const localProgress = scaled - index;
    const bgColor = this.backgroundStops[index].clone().lerp(this.backgroundStops[index + 1], localProgress);
    this.scene.background.copy(bgColor);
    this.scene.fog.color.copy(bgColor);
    this.scene.fog.density = 0.007 + clampedProgress * 0.006;

    // Shift lights
    const lightIntensity = 0.78 - clampedProgress * 0.28;
    this.keyLight.intensity = Math.max(0.2, lightIntensity);
    this.fillLight.intensity = 0.16 + clampedProgress * 0.12;
    this.rimLight.intensity = 0.28 + clampedProgress * 0.18;

    // Keep a visible, colored glow without washing the ribbon white.
    this.bloomPass.strength = 0.12 + clampedProgress * 0.08;
  }

  /**
   * Render frame
   */
  render(time) {
    // Smooth mouse lerp
    this.mouse.lerp(this.targetMouse, 0.05);

    // Animate botanicals
    if (this.botanicals) {
      this.botanicals.children.forEach(mesh => {
        mesh.position.y += mesh.userData.vy;
        mesh.position.x += mesh.userData.vx + Math.sin(time + mesh.position.y) * 0.005;
        mesh.rotation.x += mesh.userData.rx;
        mesh.rotation.y += mesh.userData.ry;

        if (mesh.position.y < -40) {
          mesh.position.y = 40;
          mesh.position.x = (Math.random() - 0.5) * 40;
        }
      });
    }

    if (this.dimensionalBotanicals) {
      this.dimensionalBotanicals.children.forEach(mesh => {
        const phase = mesh.userData.phase;
        mesh.position.y += mesh.userData.vy;
        mesh.position.x = mesh.userData.baseX + Math.sin(time * mesh.userData.drift + phase) * 1.4 + this.mouse.x * 0.55;
        mesh.position.z += Math.cos(time * mesh.userData.drift + phase) * 0.002;
        mesh.rotation.x += mesh.userData.rx + this.mouse.y * 0.0008;
        mesh.rotation.y += mesh.userData.ry + this.mouse.x * 0.001;
        mesh.rotation.z += mesh.userData.rz;

        if (mesh.position.y < this.camera.position.y - 52) {
          mesh.position.y = this.camera.position.y + 48 + Math.random() * 16;
          mesh.userData.baseX = (Math.random() - 0.5) * 34;
          mesh.position.z = -16 + Math.random() * 18;
        }
      });
    }

    this.composer.render();
  }
}
