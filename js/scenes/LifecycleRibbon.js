import * as THREE from 'three';

/**
 * VINELINE - A scroll-driven botanical vine that guides the user through
 * the lifecycle phases.
 */
export class LifecycleRibbon {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'VINELINE';
    this.group.position.y = -10;

    this._seed = 1287;
    this.leaves = [];
    this.tendrils = [];
    this.phaseMarkers = [];
    this.pollenClouds = [];

    this._createMaterials();
    this._createRibbon();
    this._createBraidedStrands();
    this._createCanopy();
    this._createTendrils();
    this._createFoliage();
    this._createPhaseBlooms();
    this._createPollenClouds();
    this._createRootSystem();
  }

  _createMaterials() {
    this.phasePositions = [0.06, 0.19, 0.32, 0.46, 0.61, 0.76];
    this.phaseColors = [0xDC343B, 0x8F3D37, 0x6B55A3, 0x005871, 0x9C7E41, 0x532E3B];

    this.barkMat = new THREE.MeshPhysicalMaterial({
      color: 0x7D5125,
      roughness: 0.82,
      metalness: 0.02,
      clearcoat: 0.12,
    });

    this.rootMat = new THREE.MeshPhysicalMaterial({
      color: 0x6A421F,
      roughness: 0.9,
      metalness: 0.02,
      clearcoat: 0.08,
    });

    this.tendrilMat = new THREE.MeshPhysicalMaterial({
      color: 0x476B2C,
      emissive: 0x253B16,
      emissiveIntensity: 0.08,
      roughness: 0.72,
      metalness: 0.03,
      clearcoat: 0.18,
    });

    this.leafMats = [
      new THREE.MeshPhysicalMaterial({
        color: 0x2F6F45,
        emissive: 0x142B1B,
        emissiveIntensity: 0.06,
        roughness: 0.66,
        metalness: 0.03,
        clearcoat: 0.2,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0x6B8E35,
        emissive: 0x263515,
        emissiveIntensity: 0.06,
        roughness: 0.7,
        metalness: 0.02,
        clearcoat: 0.16,
        side: THREE.DoubleSide,
      }),
    ];
  }

  _createRibbon() {
    const points = [
      new THREE.Vector3(-0.18, 0, 0.2),
      new THREE.Vector3(0.9, -3.2, -0.9),
      new THREE.Vector3(-0.7, -6.4, 0.9),
      new THREE.Vector3(1.25, -9.7, -0.35),
      new THREE.Vector3(-1.05, -13.1, 1.15),
      new THREE.Vector3(0.75, -16.8, -1.1),
      new THREE.Vector3(1.6, -20.3, 0.5),
      new THREE.Vector3(-1.25, -24.2, 0.95),
      new THREE.Vector3(0.95, -28.1, -0.9),
      new THREE.Vector3(-0.55, -32.2, 0.65),
      new THREE.Vector3(0.55, -36.3, -0.35),
      new THREE.Vector3(0, -40.6, 0),
      new THREE.Vector3(1.05, -45.0, 0.72),
      new THREE.Vector3(-0.82, -49.4, -0.64),
      new THREE.Vector3(0.78, -54.2, 0.82),
      new THREE.Vector3(-0.92, -58.4, -0.3),
      new THREE.Vector3(0, -62.4, 0),
    ];

    this.curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.42);

    const vineGeo = new THREE.TubeGeometry(this.curve, 420, 0.13, 18, false);
    const glowGeo = new THREE.TubeGeometry(this.curve, 420, 0.36, 20, false);

    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vPos;

      void main() {
        vUv = uv;
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const vineFragmentShader = `
      uniform float uTime;
      uniform float uScroll;
      varying vec2 vUv;

      vec3 phaseColor(float t) {
        vec3 menarche  = vec3(0.863, 0.204, 0.231);
        vec3 periods   = vec3(0.561, 0.239, 0.216);
        vec3 pcos      = vec3(0.420, 0.333, 0.640);
        vec3 peri      = vec3(0.000, 0.345, 0.443);
        vec3 menopause = vec3(0.612, 0.494, 0.255);
        vec3 lunasync  = vec3(0.325, 0.180, 0.231);

        if (t < 0.167)      return mix(menarche, periods, t / 0.167);
        else if (t < 0.333) return mix(periods, pcos, (t - 0.167) / 0.167);
        else if (t < 0.5)   return mix(pcos, peri, (t - 0.333) / 0.167);
        else if (t < 0.667) return mix(peri, menopause, (t - 0.5) / 0.167);
        else if (t < 0.833) return mix(menopause, lunasync, (t - 0.667) / 0.167);
        return lunasync;
      }

      void main() {
        float t = vUv.x;
        float barkGrain = sin(t * 92.0 + vUv.y * 18.0 + uTime * 0.2) * 0.5 + 0.5;
        float livingPulse = sin(t * 34.0 - uTime * 2.4) * 0.5 + 0.5;
        float scrollGlow = smoothstep(0.22, 0.0, abs(t - uScroll));

        vec3 rootBark = vec3(0.22, 0.13, 0.06);
        vec3 warmBark = vec3(0.40, 0.25, 0.10);
        vec3 deepLeaf = vec3(0.08, 0.28, 0.11);
        vec3 newLeaf = vec3(0.30, 0.48, 0.18);

        vec3 color = mix(rootBark, deepLeaf, smoothstep(0.05, 0.92, t));
        color = mix(color, warmBark, barkGrain * 0.32);
        color = mix(color, newLeaf, smoothstep(0.22, 0.75, t) * 0.22);
        color = mix(color, phaseColor(t), scrollGlow * 0.28);
        color *= 0.82 + livingPulse * 0.14 + scrollGlow * 0.28;

        gl_FragColor = vec4(color, 0.96);
      }
    `;

    const glowFragmentShader = `
      uniform float uTime;
      uniform float uScroll;
      varying vec2 vUv;

      vec3 phaseColor(float t) {
        vec3 menarche  = vec3(0.863, 0.204, 0.231);
        vec3 periods   = vec3(0.561, 0.239, 0.216);
        vec3 pcos      = vec3(0.420, 0.333, 0.640);
        vec3 peri      = vec3(0.000, 0.345, 0.443);
        vec3 menopause = vec3(0.612, 0.494, 0.255);
        vec3 lunasync  = vec3(0.325, 0.180, 0.231);

        if (t < 0.167)      return mix(menarche, periods, t / 0.167);
        else if (t < 0.333) return mix(periods, pcos, (t - 0.167) / 0.167);
        else if (t < 0.5)   return mix(pcos, peri, (t - 0.333) / 0.167);
        else if (t < 0.667) return mix(peri, menopause, (t - 0.5) / 0.167);
        else if (t < 0.833) return mix(menopause, lunasync, (t - 0.667) / 0.167);
        return lunasync;
      }

      void main() {
        float t = vUv.x;
        float pulse = sin(t * 42.0 - uTime * 2.8) * 0.5 + 0.5;
        float scrollGlow = smoothstep(0.24, 0.0, abs(t - uScroll));
        float breath = sin(uTime * 0.8 + t * 8.0) * 0.5 + 0.5;
        vec3 color = mix(vec3(0.55, 0.68, 0.28), phaseColor(t), 0.62 + scrollGlow * 0.34);
        float alpha = 0.055 + pulse * 0.025 + breath * 0.018 + scrollGlow * 0.24;
        gl_FragColor = vec4(color, alpha);
      }
    `;

    this.ribbonUniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
    };

    this.vineMat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: vineFragmentShader,
      uniforms: this.ribbonUniforms,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: true,
    });

    this.glowMat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: glowFragmentShader,
      uniforms: this.ribbonUniforms,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.ribbon = new THREE.Mesh(vineGeo, this.vineMat);
    this.ribbonGlow = new THREE.Mesh(glowGeo, this.glowMat);
    this.group.add(this.ribbonGlow);
    this.group.add(this.ribbon);
  }

  _createBraidedStrands() {
    const strandMats = [
      this.rootMat,
      this.tendrilMat,
      new THREE.MeshPhysicalMaterial({
        color: 0x8A5F2C,
        emissive: 0x2A1908,
        emissiveIntensity: 0.05,
        roughness: 0.78,
        metalness: 0.03,
        clearcoat: 0.12,
      }),
    ];

    for (let s = 0; s < 3; s++) {
      const points = [];
      const phase = (s / 3) * Math.PI * 2;

      for (let i = 0; i < 190; i++) {
        const t = i / 189;
        const base = this.curve.getPointAt(t);
        const wrap = t * Math.PI * 14 + phase;
        const radius = 0.15 + Math.sin(t * Math.PI * 5 + s) * 0.025;
        points.push(new THREE.Vector3(
          base.x + Math.cos(wrap) * radius,
          base.y + Math.sin(wrap * 0.5) * 0.035,
          base.z + Math.sin(wrap) * radius
        ));
      }

      const strandCurve = new THREE.CatmullRomCurve3(points);
      const strandGeo = new THREE.TubeGeometry(strandCurve, 260, 0.035, 8, false);
      this.group.add(new THREE.Mesh(strandGeo, strandMats[s]));
    }
  }

  _createCanopy() {
    const start = this.curve.getPointAt(0);
    const canopy = new THREE.Group();
    canopy.position.copy(start);
    canopy.position.x -= 0.12;
    canopy.position.y -= 0.75;
    canopy.position.z += 0.2;
    canopy.rotation.set(-0.12, -0.28, 0.08);

    const bloomColors = [0xDC343B, 0xBE394F, 0x8F3D37, 0x9C7E41, 0x6B55A3];
    const bloomOffsets = [
      [0, 0.18, 0.1, 0.92],
      [-0.5, -0.05, 0.0, 0.56],
      [0.48, -0.02, -0.06, 0.52],
      [-0.22, 0.58, -0.08, 0.42],
      [0.28, 0.48, 0.08, 0.38],
    ];

    bloomOffsets.forEach((entry, i) => {
      const [x, y, z, scale] = entry;
      const flower = this._createFlower(bloomColors[i], scale);
      flower.position.set(x, y, z);
      flower.rotation.z = (i - 2) * 0.16;
      canopy.add(flower);
    });

    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0.7);
    leafShape.bezierCurveTo(0.56, 0.34, 0.5, -0.48, 0, -0.78);
    leafShape.bezierCurveTo(-0.5, -0.48, -0.56, 0.34, 0, 0.7);
    const leafGeo = new THREE.ShapeGeometry(leafShape, 18);

    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const radius = 0.55 + (i % 4) * 0.18;
      const leaf = new THREE.Mesh(leafGeo, this.leafMats[i % this.leafMats.length]);
      leaf.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.58, -0.12 + Math.sin(angle) * 0.1);
      leaf.rotation.set(this._range(-0.35, 0.35), this._range(-0.25, 0.25), angle - Math.PI * 0.5);
      leaf.scale.setScalar(0.34 + (i % 5) * 0.035);
      canopy.add(leaf);
    }

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(1.25, 28, 18),
      new THREE.MeshBasicMaterial({
        color: 0xDC343B,
        transparent: true,
        opacity: 0.085,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    glow.position.z = -0.18;
    canopy.add(glow);

    this.canopy = canopy;
    this.group.add(canopy);
  }

  _createRootSystem() {
    const origin = this.curve.getPointAt(1);
    const rootGroup = new THREE.Group();
    rootGroup.name = 'VINELINE dense roots';

    const rootHairMat = new THREE.MeshPhysicalMaterial({
      color: 0x5A3517,
      roughness: 0.92,
      metalness: 0.02,
      clearcoat: 0.04,
    });

    const rootCount = 48;

    for (let i = 0; i < rootCount; i++) {
      const sign = i % 2 === 0 ? 1 : -1;
      const fan = i / Math.max(1, rootCount - 1);
      const spread = 1.25 + (i % 8) * 0.28 + fan * 1.35;
      const depth = 0.74 + (i % 6) * 0.075 + fan * 0.42;
      const phase = this._range(0, Math.PI * 2);
      const points = [];

      for (let j = 0; j < 34; j++) {
        const a = j / 33;
        const ease = a * a * (3 - 2 * a);
        const taperWobble = 1 - a * 0.35;
        const wobble = Math.sin(a * Math.PI * (2.8 + i * 0.08) + phase) * 0.34 * taperWobble;
        points.push(new THREE.Vector3(
          origin.x + sign * (ease * spread + wobble),
          origin.y - ease * depth - Math.sin(a * Math.PI) * 0.1 - a * a * 0.16,
          origin.z + Math.cos(a * Math.PI * 1.8 + phase) * (0.26 + a * 0.42)
        ));
      }

      const rootCurve = new THREE.CatmullRomCurve3(points);
      const rootRadius = Math.max(0.028, 0.086 - i * 0.001);
      const rootGeo = new THREE.TubeGeometry(rootCurve, 86, rootRadius, 9, false);
      rootGroup.add(new THREE.Mesh(rootGeo, i % 3 === 0 ? rootHairMat : this.rootMat));

      const branchCount = i % 3 === 0 ? 4 : 3;
      for (let b = 0; b < branchCount; b++) {
        const t = this._range(0.38, 0.82);
        const start = rootCurve.getPointAt(t);
        const branchSign = b % 2 === 0 ? sign : -sign;
        const branchPoints = [];
        const branchReach = this._range(0.55, 1.45) * (1 - t * 0.25);
        const branchDrop = this._range(0.18, 0.48);
        const branchPhase = this._range(0, Math.PI * 2);

        for (let j = 0; j < 18; j++) {
          const a = j / 17;
          const ease = a * a * (3 - 2 * a);
          branchPoints.push(new THREE.Vector3(
            start.x + branchSign * (ease * branchReach + Math.sin(a * Math.PI * 2.4 + branchPhase) * 0.13),
            start.y - ease * branchDrop - Math.sin(a * Math.PI) * 0.045,
            start.z + Math.cos(a * Math.PI * 2 + branchPhase) * 0.18
          ));
        }

        const branchCurve = new THREE.CatmullRomCurve3(branchPoints);
        const branchGeo = new THREE.TubeGeometry(branchCurve, 30, 0.018 + (i % 4) * 0.002, 6, false);
        rootGroup.add(new THREE.Mesh(branchGeo, rootHairMat));
      }
    }

    const centerRootCount = 30;
    for (let i = 0; i < centerRootCount; i++) {
      const side = (i - (centerRootCount - 1) / 2) / ((centerRootCount - 1) / 2);
      const phase = this._range(0, Math.PI * 2);
      const depth = this._range(1.0, 1.85);
      const reach = side * this._range(0.35, 1.05);
      const points = [];

      for (let j = 0; j < 30; j++) {
        const a = j / 29;
        const ease = a * a * (3 - 2 * a);
        const split = Math.sin(a * Math.PI * 2.2 + phase) * 0.12 * (1 - a * 0.25);
        points.push(new THREE.Vector3(
          origin.x + reach * ease + split,
          origin.y - ease * depth - Math.sin(a * Math.PI) * 0.08 - a * a * 0.18,
          origin.z + Math.cos(a * Math.PI * 1.4 + phase) * (0.12 + a * 0.22)
        ));
      }

      const centerCurve = new THREE.CatmullRomCurve3(points);
      const centerGeo = new THREE.TubeGeometry(centerCurve, 70, Math.max(0.022, 0.058 - i * 0.0007), 8, false);
      rootGroup.add(new THREE.Mesh(centerGeo, i % 2 === 0 ? this.rootMat : rootHairMat));

      const feederCount = i % 4 === 0 ? 3 : 2;
      for (let b = 0; b < feederCount; b++) {
        const t = this._range(0.46, 0.88);
        const start = centerCurve.getPointAt(t);
        const feederSide = (b % 2 === 0 ? 1 : -1) * (side < 0 ? -1 : 1);
        const feederPoints = [];
        const feederReach = this._range(0.24, 0.72) * (1 - t * 0.18);
        const feederDrop = this._range(0.16, 0.42);
        const feederPhase = this._range(0, Math.PI * 2);

        for (let j = 0; j < 16; j++) {
          const a = j / 15;
          const ease = a * a * (3 - 2 * a);
          feederPoints.push(new THREE.Vector3(
            start.x + feederSide * (ease * feederReach + Math.sin(a * Math.PI * 2 + feederPhase) * 0.07),
            start.y - ease * feederDrop,
            start.z + Math.cos(a * Math.PI * 2 + feederPhase) * 0.12
          ));
        }

        const feederCurve = new THREE.CatmullRomCurve3(feederPoints);
        const feederGeo = new THREE.TubeGeometry(feederCurve, 24, 0.014 + (i % 3) * 0.002, 6, false);
        rootGroup.add(new THREE.Mesh(feederGeo, rootHairMat));
      }
    }

    const soilGeo = new THREE.BufferGeometry();
    const soilPositions = [];
    for (let i = 0; i < 1650; i++) {
      const centerBias = i < 520;
      const radius = centerBias
        ? Math.pow(this._rand(), 1.4) * this._range(0.08, 2.2)
        : Math.pow(this._rand(), 0.62) * this._range(0.25, 5.4);
      const angle = this._range(0, Math.PI * 2);
      const mound = Math.sin(Math.min(1, radius / 5.4) * Math.PI) * 0.24;
      soilPositions.push(
        origin.x + Math.cos(angle) * radius,
        origin.y - this._range(0.82, 1.78) + mound,
        origin.z + Math.sin(angle) * radius * 0.38
      );
    }
    soilGeo.setAttribute('position', new THREE.Float32BufferAttribute(soilPositions, 3));
    const soilMat = new THREE.PointsMaterial({
      color: 0x5A3517,
      size: 0.058,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
    });
    rootGroup.add(new THREE.Points(soilGeo, soilMat));
    this.group.add(rootGroup);
  }

  _createTendrils() {
    const anchors = [0.1, 0.17, 0.25, 0.33, 0.43, 0.52, 0.61, 0.7, 0.79, 0.88, 0.95];

    anchors.forEach((t, i) => {
      const sign = i % 2 === 0 ? 1 : -1;
      const base = this.curve.getPointAt(t);
      const curlTurns = 1.35 + (i % 4) * 0.34;
      const reach = 1.5 + (i % 3) * 0.45;
      const lift = 1.9 + (i % 4) * 0.35;
      const points = [];

      for (let j = 0; j < 58; j++) {
        const a = j / 57;
        let loop = a < 0.48 ? 0 : (a - 0.48) / 0.52;
        loop = loop * loop * (3 - 2 * loop);
        const angle = a * Math.PI * 2 * curlTurns + i * 0.7;
        points.push(new THREE.Vector3(
          base.x + sign * (a * reach + Math.sin(angle) * loop * 0.76),
          base.y + Math.sin(a * Math.PI) * 0.6 - a * lift + Math.cos(angle) * loop * 0.54,
          base.z + Math.sin(angle + i) * (0.25 + loop * 0.48)
        ));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const geo = new THREE.TubeGeometry(curve, 96, 0.032 + (i % 3) * 0.008, 8, false);
      const mesh = new THREE.Mesh(geo, this.tendrilMat);
      mesh.userData = { phase: i * 0.55, baseScale: 1 };
      this.tendrils.push(mesh);
      this.group.add(mesh);
    });
  }

  _createFoliage() {
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0.62);
    leafShape.bezierCurveTo(0.48, 0.28, 0.44, -0.42, 0, -0.7);
    leafShape.bezierCurveTo(-0.44, -0.42, -0.48, 0.28, 0, 0.62);

    const leafGeo = new THREE.ShapeGeometry(leafShape, 18);

    for (let i = 0; i < 64; i++) {
      const t = 0.04 + (i / 63) * 0.9 + this._range(-0.008, 0.008);
      const point = this.curve.getPointAt(THREE.MathUtils.clamp(t, 0.02, 0.98));
      const tangent = this.curve.getTangentAt(THREE.MathUtils.clamp(t, 0.02, 0.98));
      const sign = i % 2 === 0 ? 1 : -1;
      const leaf = new THREE.Mesh(leafGeo, this.leafMats[i % this.leafMats.length]);

      leaf.position.set(
        point.x + sign * this._range(0.32, 0.82),
        point.y + this._range(-0.2, 0.34),
        point.z + this._range(-0.3, 0.38)
      );

      const scale = this._range(0.28, 0.62) * (i % 7 === 0 ? 1.25 : 1);
      leaf.scale.set(scale * this._range(0.78, 1.2), scale, scale);
      leaf.rotation.set(
        this._range(-0.45, 0.45),
        sign * this._range(0.35, 0.95),
        Math.atan2(tangent.y, tangent.x) + sign * this._range(0.68, 1.18)
      );

      leaf.userData = {
        baseY: leaf.position.y,
        phase: this._range(0, Math.PI * 2),
        flutter: this._range(0.015, 0.045),
      };

      this.leaves.push(leaf);
      this.group.add(leaf);
    }
  }

  _createPhaseBlooms() {
    this.phasePositions.forEach((t, i) => {
      const sign = i % 2 === 0 ? -1 : 1;
      const point = this.curve.getPointAt(t);
      const color = this.phaseColors[i];
      const marker = this._createFlower(color, 0.42 + (i % 3) * 0.08);

      marker.position.set(
        point.x + sign * (0.72 + (i % 3) * 0.22),
        point.y - 0.1,
        point.z + (i % 2 === 0 ? 0.5 : -0.25)
      );
      marker.rotation.set(0.25, sign * 0.58, sign * 0.18);

      const berryGeo = new THREE.SphereGeometry(0.18, 18, 14);
      const berryMat = new THREE.MeshPhysicalMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.22,
        roughness: 0.34,
        metalness: 0.08,
        clearcoat: 0.5,
      });

      const berryCluster = new THREE.Group();
      for (let b = 0; b < 3; b++) {
        const berry = new THREE.Mesh(berryGeo, berryMat);
        berry.position.set(sign * (0.1 + b * 0.16), -0.35 - b * 0.07, (b - 1) * 0.08);
        berry.scale.setScalar(0.75 + b * 0.12);
        berryCluster.add(berry);
      }
      marker.add(berryCluster);

      const glowGeo = new THREE.SphereGeometry(0.56, 24, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.08,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      marker.add(glow);

      this.phaseMarkers.push({
        group: marker,
        glow,
        t,
        baseY: marker.position.y,
        baseScale: marker.scale.x,
        phase: i * 0.8,
      });

      this.group.add(marker);
    });
  }

  _createFlower(color, scale) {
    const group = new THREE.Group();

    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0.34);
    petalShape.bezierCurveTo(0.26, 0.24, 0.3, -0.12, 0, -0.38);
    petalShape.bezierCurveTo(-0.3, -0.12, -0.26, 0.24, 0, 0.34);

    const petalGeo = new THREE.ShapeGeometry(petalShape, 16);
    const petalMat = new THREE.MeshPhysicalMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.08,
      roughness: 0.42,
      metalness: 0.03,
      clearcoat: 0.24,
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.set(Math.cos(angle) * 0.13, Math.sin(angle) * 0.13, 0);
      petal.rotation.z = angle - Math.PI * 0.5;
      petal.scale.setScalar(scale);
      group.add(petal);
    }

    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.09 * scale * 2, 16, 12),
      new THREE.MeshPhysicalMaterial({
        color: 0xD8A13E,
        emissive: 0x9C5B18,
        emissiveIntensity: 0.16,
        roughness: 0.38,
        clearcoat: 0.36,
      })
    );
    center.position.z = 0.02;
    group.add(center);

    return group;
  }

  _createPollenClouds() {
    this.phasePositions.forEach((t, i) => {
      const anchor = this.curve.getPointAt(t);
      const color = this.phaseColors[i];
      const positions = [];
      const side = i % 2 === 0 ? -1 : 1;

      for (let p = 0; p < 120; p++) {
        const radius = Math.pow(this._rand(), 0.52) * this._range(0.2, 2.1);
        const angle = this._range(0, Math.PI * 2);
        positions.push(
          anchor.x + side * 0.5 + Math.cos(angle) * radius * 0.82,
          anchor.y + this._range(-1.4, 1.45),
          anchor.z + Math.sin(angle) * radius * 0.5 + this._range(-0.3, 0.3)
        );
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

      const mat = new THREE.PointsMaterial({
        color,
        size: 0.07 + (i % 3) * 0.014,
        transparent: true,
        opacity: 0.46,
        depthWrite: false,
      });

      const cloud = new THREE.Points(geo, mat);
      cloud.userData = { phase: i * 0.65, baseOpacity: mat.opacity };
      this.pollenClouds.push(cloud);
      this.group.add(cloud);
    });
  }

  updateScroll(progress) {
    const clamped = THREE.MathUtils.clamp(progress, 0, 1);
    this.ribbonUniforms.uScroll.value = clamped;

    this.phaseMarkers.forEach(marker => {
      const distance = Math.abs(marker.t - clamped);
      const active = 1 - THREE.MathUtils.smoothstep(distance, 0.03, 0.16);
      marker.glow.material.opacity = 0.07 + active * 0.16;
      marker.group.scale.setScalar(1 + active * 0.22);
    });
  }

  update(time) {
    this.ribbonUniforms.uTime.value = time;

    this.leaves.forEach(leaf => {
      const sway = Math.sin(time * 1.4 + leaf.userData.phase) * leaf.userData.flutter;
      leaf.position.y = leaf.userData.baseY + sway * 2.2;
      leaf.rotation.z += sway * 0.018;
    });

    this.phaseMarkers.forEach(marker => {
      marker.group.position.y = marker.baseY + Math.sin(time * 0.72 + marker.phase) * 0.11;
      marker.group.rotation.z += Math.sin(time * 0.5 + marker.phase) * 0.0016;
    });

    this.tendrils.forEach((tendril, i) => {
      tendril.rotation.z = Math.sin(time * 0.22 + i) * 0.018;
    });

    this.pollenClouds.forEach(cloud => {
      cloud.rotation.y += 0.0008;
      cloud.rotation.z = Math.sin(time * 0.2 + cloud.userData.phase) * 0.025;
      cloud.material.opacity = cloud.userData.baseOpacity + Math.sin(time * 0.8 + cloud.userData.phase) * 0.035;
    });
  }

  _rand() {
    this._seed = (this._seed * 1664525 + 1013904223) >>> 0;
    return this._seed / 4294967296;
  }

  _range(min, max) {
    return min + (max - min) * this._rand();
  }
}
