import * as THREE from 'three';

/**
 * VINELINE - A scroll-driven botanical vine that guides the user through
 * the lifecycle phases.
 */
export class LifecycleRibbon {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'VINELINE';
    this.group.position.y = -8.2;

    this.vinelineOpacity = 0.65;
    this._seed = 1287;
    this.leaves = [];
    this.tendrils = [];
    this.phaseMarkers = [];
    this.flowerClusters = [];
    this.pollenClouds = [];

    this._createMaterials();
    this._createRibbon();
    this._createBraidedStrands();
    this._createCanopy();
    this._createTendrils();
    this._createFoliage();
    this._createVineBlossoms();
    this._createPhaseBlooms();
    this._createPollenClouds();
    this._createSoilLayer();
  }

  _createMaterials() {
    this.phasePositions = [0.06, 0.19, 0.32, 0.46, 0.61, 0.76];
    this.phaseColors = [0xDC343B, 0x8F3D37, 0x6B55A3, 0x005871, 0x9C7E41, 0x532E3B];

    this.barkMat = new THREE.MeshPhysicalMaterial({
      color: 0x7D5125,
      emissive: 0x2A1908,
      emissiveIntensity: 0.08,
      roughness: 0.82,
      metalness: 0.02,
      clearcoat: 0.18,
      transparent: true,
      opacity: this.vinelineOpacity,
      depthWrite: false,
    });

    this.rootMat = new THREE.MeshPhysicalMaterial({
      color: 0x6A421F,
      emissive: 0x251306,
      emissiveIntensity: 0.07,
      roughness: 0.9,
      metalness: 0.02,
      clearcoat: 0.14,
      transparent: true,
      opacity: this.vinelineOpacity,
      depthWrite: false,
    });

    this.tendrilMat = new THREE.MeshPhysicalMaterial({
      color: 0x3F6F2A,
      emissive: 0x253B16,
      emissiveIntensity: 0.13,
      roughness: 0.72,
      metalness: 0.03,
      clearcoat: 0.26,
      transparent: true,
      opacity: this.vinelineOpacity,
      depthWrite: false,
    });

    this.leafMats = [
      new THREE.MeshPhysicalMaterial({
        color: 0x2F6F45,
        emissive: 0x142B1B,
        emissiveIntensity: 0.1,
        roughness: 0.58,
        metalness: 0.03,
        clearcoat: 0.3,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: this.vinelineOpacity,
        depthWrite: false,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0x6B8E35,
        emissive: 0x263515,
        emissiveIntensity: 0.095,
        roughness: 0.62,
        metalness: 0.02,
        clearcoat: 0.26,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: this.vinelineOpacity,
        depthWrite: false,
      }),
    ];
  }

  _createRibbon() {
    const points = [
      new THREE.Vector3(-0.24, 0, 0.2),
      new THREE.Vector3(1.17, -3.2, -0.9),
      new THREE.Vector3(-0.91, -6.4, 0.9),
      new THREE.Vector3(1.63, -9.7, -0.35),
      new THREE.Vector3(-1.37, -13.1, 1.15),
      new THREE.Vector3(0.98, -16.8, -1.1),
      new THREE.Vector3(2.08, -20.3, 0.5),
      new THREE.Vector3(-1.63, -24.2, 0.95),
      new THREE.Vector3(1.24, -28.1, -0.9),
      new THREE.Vector3(-0.72, -32.2, 0.65),
      new THREE.Vector3(0.72, -36.3, -0.35),
      new THREE.Vector3(0, -40.6, 0),
      new THREE.Vector3(1.37, -45.0, 0.72),
      new THREE.Vector3(-1.07, -49.4, -0.64),
      new THREE.Vector3(1.01, -54.2, 0.82),
      new THREE.Vector3(-1.2, -58.4, -0.3),
      new THREE.Vector3(0, -62.4, 0),
    ];

    this.curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.42);

    const vineGeo = new THREE.TubeGeometry(this.curve, 420, 0.145, 20, false);
    const glowGeo = new THREE.TubeGeometry(this.curve, 420, 0.38, 22, false);

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
        color = mix(color, warmBark, barkGrain * 0.42);
        color = mix(color, newLeaf, smoothstep(0.22, 0.75, t) * 0.28);
        color = mix(color, phaseColor(t), scrollGlow * 0.34);
        color *= 0.74 + livingPulse * 0.2 + scrollGlow * 0.36;

        gl_FragColor = vec4(color, 0.65);
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
        float alpha = 0.065 + pulse * 0.028 + breath * 0.022 + scrollGlow * 0.26;
        gl_FragColor = vec4(color, alpha * 0.65);
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
      depthWrite: false,
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
        emissiveIntensity: 0.09,
        roughness: 0.7,
        metalness: 0.03,
        clearcoat: 0.2,
        transparent: true,
        opacity: this.vinelineOpacity,
        depthWrite: false,
      }),
    ];

    for (let s = 0; s < 1; s++) {
      const points = [];
      const phase = (s / 3) * Math.PI * 2;

      for (let i = 0; i < 190; i++) {
        const t = i / 189;
        const base = this.curve.getPointAt(t);
        const wrap = t * Math.PI * 10 + phase;
        const radius = 0.1 + Math.sin(t * Math.PI * 5 + s) * 0.018;
        points.push(new THREE.Vector3(
          base.x + Math.cos(wrap) * radius,
          base.y + Math.sin(wrap * 0.5) * 0.035,
          base.z + Math.sin(wrap) * radius
        ));
      }

      const strandCurve = new THREE.CatmullRomCurve3(points);
      const strandGeo = new THREE.TubeGeometry(strandCurve, 190, 0.024, 7, false);
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

    const bloomColors = [
      0xF0A6B8,
      0x9B79C7,
      [0xD8A13E, 0xDC343B],
    ];
    const bloomOffsets = [
      [0, 0.58, 0.14, 0.68, 0],
      [-0.92, -0.08, 0.04, 0.52, -0.26],
      [0.92, -0.08, 0.04, 0.52, 0.26],
    ];

    bloomOffsets.forEach((entry, i) => {
      const [x, y, z, scale, rotationZ] = entry;
      const flower = this._createFlower(bloomColors[i], scale);
      flower.position.set(x, y, z);
      flower.rotation.z = rotationZ;
      flower.renderOrder = 30 + i;
      flower.traverse(child => {
        child.renderOrder = 30 + i;
      });
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
        opacity: 0.045,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    glow.position.z = -0.18;
    canopy.add(glow);

    this.canopy = canopy;
    this.group.add(canopy);
  }

  _createSoilLayer() {
    const origin = this.curve.getPointAt(1);
    const soilGroup = new THREE.Group();
    soilGroup.name = 'VINELINE footer soil';

    const soilMat = new THREE.MeshBasicMaterial({
      color: 0x6A421F,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x3D2412,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const mound = new THREE.Mesh(new THREE.CircleGeometry(1.45, 64), soilMat);
    mound.position.set(origin.x, origin.y + 0.02, origin.z - 0.08);
    mound.scale.set(2.95, 0.5, 1);
    soilGroup.add(mound);

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.25, 48), shadowMat);
    shadow.position.set(origin.x, origin.y - 0.12, origin.z - 0.1);
    shadow.scale.set(2.65, 0.36, 1);
    soilGroup.add(shadow);

    const soilGeo = new THREE.BufferGeometry();
    const soilPositions = [];
    const soilColors = [];
    const colors = [
      new THREE.Color(0x4B2C16),
      new THREE.Color(0x6A421F),
      new THREE.Color(0x8A5F2C),
      new THREE.Color(0x9C7E41),
    ];

    for (let i = 0; i < 1800; i++) {
      const radius = Math.pow(this._rand(), 0.6) * this._range(0.08, 3.85);
      const angle = this._range(0, Math.PI * 2);
      const moundLift = Math.sin(Math.min(1, radius / 3.85) * Math.PI) * 0.3;
      soilPositions.push(
        origin.x + Math.cos(angle) * radius,
        origin.y - this._range(0.02, 0.54) + moundLift,
        origin.z + Math.sin(angle) * radius * 0.3 + this._range(-0.1, 0.1)
      );

      const color = colors[i % colors.length];
      soilColors.push(color.r, color.g, color.b);
    }

    soilGeo.setAttribute('position', new THREE.Float32BufferAttribute(soilPositions, 3));
    soilGeo.setAttribute('color', new THREE.Float32BufferAttribute(soilColors, 3));

    const points = new THREE.Points(
      soilGeo,
      new THREE.PointsMaterial({
        size: 0.078,
        vertexColors: true,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
      })
    );
    soilGroup.add(points);

    this.group.add(soilGroup);
  }

  _createTendrils() {
    const anchors = [0.08, 0.13, 0.18, 0.24, 0.31, 0.38, 0.46, 0.54, 0.62, 0.7, 0.78, 0.86, 0.93];

    anchors.forEach((t, i) => {
      const sign = i % 2 === 0 ? 1 : -1;
      const base = this.curve.getPointAt(t);
      const curlTurns = 1.28 + (i % 5) * 0.3;
      const reach = 1.02 + (i % 4) * 0.32;
      const lift = 1.24 + (i % 5) * 0.22;
      const points = [];

      for (let j = 0; j < 58; j++) {
        const a = j / 57;
        let loop = a < 0.48 ? 0 : (a - 0.48) / 0.52;
        loop = loop * loop * (3 - 2 * loop);
        const angle = a * Math.PI * 2 * curlTurns + i * 0.7;
        points.push(new THREE.Vector3(
          base.x + sign * (a * reach + Math.sin(angle) * loop * 0.5),
          base.y + Math.sin(a * Math.PI) * 0.46 - a * lift + Math.cos(angle) * loop * 0.36,
          base.z + Math.sin(angle + i) * (0.22 + loop * 0.34)
        ));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const geo = new THREE.TubeGeometry(curve, 58, 0.018 + (i % 3) * 0.005, 6, false);
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

    for (let i = 0; i < 210; i++) {
      const t = 0.03 + (i / 209) * 0.94 + this._range(-0.011, 0.011);
      const point = this.curve.getPointAt(THREE.MathUtils.clamp(t, 0.02, 0.98));
      const tangent = this.curve.getTangentAt(THREE.MathUtils.clamp(t, 0.02, 0.98));
      const sign = i % 2 === 0 ? 1 : -1;
      const leaf = new THREE.Mesh(leafGeo, this.leafMats[i % this.leafMats.length]);

      leaf.position.set(
        point.x + sign * this._range(0.22, 1.12),
        point.y + this._range(-0.2, 0.34),
        point.z + this._range(-0.42, 0.46)
      );

      const scale = this._range(0.2, 0.6) * (i % 9 === 0 ? 1.34 : 1);
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

  _createVineBlossoms() {
    const buds = [0.055, 0.08, 0.105, 0.125, 0.15, 0.175, 0.215, 0.245, 0.27, 0.315, 0.345, 0.365, 0.415, 0.445, 0.47, 0.52, 0.545, 0.565, 0.61, 0.635, 0.655, 0.705, 0.725, 0.745, 0.79, 0.815, 0.835, 0.875, 0.915, 0.945];
    const accentColors = [0xDC343B, 0xBE6F58, 0xD8A13E, 0x6B55A3, 0x9BB56A, 0xF0C9BB];

    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0.52);
    leafShape.bezierCurveTo(0.38, 0.22, 0.35, -0.34, 0, -0.56);
    leafShape.bezierCurveTo(-0.35, -0.34, -0.38, 0.22, 0, 0.52);
    const leafGeo = new THREE.ShapeGeometry(leafShape, 14);

    buds.forEach((t, i) => {
      const point = this.curve.getPointAt(t);
      const tangent = this.curve.getTangentAt(t);
      const sign = i % 2 === 0 ? -1 : 1;
      const cluster = new THREE.Group();
      const color = accentColors[i % accentColors.length];

      cluster.position.set(
        point.x + sign * this._range(0.58, 1.32),
        point.y + this._range(-0.22, 0.24),
        point.z + this._range(-0.34, 0.48)
      );
      cluster.rotation.set(this._range(-0.18, 0.26), sign * this._range(0.3, 0.74), Math.atan2(tangent.y, tangent.x) + sign * 0.55);

      const blossomCount = 3 + (i % 3);
      for (let b = 0; b < blossomCount; b++) {
        const blossom = this._createFlower(color, this._range(0.16, 0.3));
        blossom.position.set(sign * this._range(0.02, 0.34), this._range(-0.18, 0.2), this._range(-0.08, 0.1));
        blossom.rotation.set(this._range(-0.28, 0.28), sign * this._range(0.18, 0.42), this._range(-0.45, 0.45));
        cluster.add(blossom);
      }

      for (let l = 0; l < 5; l++) {
        const leaf = new THREE.Mesh(leafGeo, this.leafMats[(i + l) % this.leafMats.length]);
        leaf.position.set(sign * this._range(0.12, 0.46), this._range(-0.28, 0.22), this._range(-0.12, 0.08));
        leaf.rotation.set(this._range(-0.32, 0.32), sign * this._range(0.35, 0.8), sign * this._range(0.7, 1.4));
        leaf.scale.setScalar(this._range(0.22, 0.42));
        cluster.add(leaf);
      }

      cluster.userData = {
        baseY: cluster.position.y,
        phase: this._range(0, Math.PI * 2),
        flutter: this._range(0.012, 0.032),
      };

      this.flowerClusters.push(cluster);
      this.group.add(cluster);
    });
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
        transparent: true,
        opacity: this.vinelineOpacity,
        depthWrite: false,
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
        opacity: 0.032,
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
    const colors = Array.isArray(color) ? color : [color];

    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0.34);
    petalShape.bezierCurveTo(0.26, 0.24, 0.3, -0.12, 0, -0.38);
    petalShape.bezierCurveTo(-0.3, -0.12, -0.26, 0.24, 0, 0.34);

    const petalGeo = new THREE.ShapeGeometry(petalShape, 16);
    const petalMats = colors.map(petalColor => new THREE.MeshPhysicalMaterial({
      color: petalColor,
      emissive: petalColor,
      emissiveIntensity: 0.12,
      roughness: 0.34,
      metalness: 0.03,
      clearcoat: 0.34,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: this.vinelineOpacity,
      depthWrite: false,
    }));

    const petalCount = 7;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeo, petalMats[i % petalMats.length]);
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
        transparent: true,
        opacity: this.vinelineOpacity,
        depthWrite: false,
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
        opacity: 0.18,
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
      marker.glow.material.opacity = 0.028 + active * 0.064;
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

    this.flowerClusters.forEach(cluster => {
      const sway = Math.sin(time * 0.8 + cluster.userData.phase) * cluster.userData.flutter;
      cluster.position.y = cluster.userData.baseY + sway * 2.1;
      cluster.rotation.z += sway * 0.012;
    });

    this.tendrils.forEach((tendril, i) => {
      tendril.rotation.z = Math.sin(time * 0.22 + i) * 0.018;
    });

    this.pollenClouds.forEach(cloud => {
      cloud.rotation.y += 0.0008;
      cloud.rotation.z = Math.sin(time * 0.2 + cloud.userData.phase) * 0.025;
      cloud.material.opacity = cloud.userData.baseOpacity + Math.sin(time * 0.8 + cloud.userData.phase) * 0.014;
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
