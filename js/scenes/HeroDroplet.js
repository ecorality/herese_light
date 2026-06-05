import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

/**
 * HeroDroplet — The "Liquid Womb" 3D hero element.
 * A large iridescent sphere with simplex noise displacement,
 * mouse-reactive ripples, and floating botanical particles.
 */
export class HeroDroplet {
  constructor() {
    this.group = new THREE.Group();
    this.qualityTier = this._qualityTier();
    this.uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector3(0, 0, 0) },
      uRipple: { value: 0 },
      uColorShift: { value: 0 },
    };

    this._createDroplet();
    this._createBotanicals();
    this._createWombGreens();
    this._createAmbientParticles();
  }

  _qualityTier() {
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1180 || window.matchMedia('(pointer: coarse)').matches) return 'tablet';
    return 'desktop';
  }

  _createDroplet() {
    const outerDetail = this.qualityTier === 'mobile' ? 24 : this.qualityTier === 'tablet' ? 34 : 48;
    const innerDetail = this.qualityTier === 'mobile' ? 10 : this.qualityTier === 'tablet' ? 14 : 20;
    const geo = new THREE.IcosahedronGeometry(3.2, outerDetail);

    // Custom shader material for iridescent fluid
    const vertexShader = `
      uniform float uTime;
      uniform vec3 uMouse;
      uniform float uRipple;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      varying float vDisplacement;

      // 3D Simplex noise (compact)
      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
      float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod(i, 289.0);
        vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 1.0/7.0;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x2_ = x_ * ns.x + ns.yyyy;
        vec4 y2_ = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x2_) - abs(y2_);
        vec4 b0 = vec4(x2_.xy, y2_.xy);
        vec4 b1 = vec4(x2_.zw, y2_.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
      }

      void main() {
        vNormal = normal;
        vPosition = position;

        // Multi-octave noise displacement
        float t = uTime * 0.15;
        float noise1 = snoise(position * 0.8 + t) * 0.35;
        float noise2 = snoise(position * 1.6 + t * 1.3) * 0.15;
        float noise3 = snoise(position * 3.2 + t * 0.7) * 0.05;
        float displacement = noise1 + noise2 + noise3;

        // Mouse ripple effect
        float mouseDist = length(position - uMouse);
        float ripple = sin(mouseDist * 6.0 - uTime * 3.0) * exp(-mouseDist * 1.5) * uRipple * 0.3;
        displacement += ripple;

        vDisplacement = displacement;
        vec3 newPos = position + normal * displacement;
        vWorldPosition = (modelMatrix * vec4(newPos, 1.0)).xyz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform float uColorShift;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      varying float vDisplacement;

      void main() {
        // View direction for Fresnel
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float fresnel = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 3.0);

        // Iridescent color based on angle + displacement
        float angle = dot(normalize(vNormal), viewDir);
        float shift = angle * 3.14159 + uTime * 0.2 + vDisplacement * 2.0 + uColorShift;

        // Pantone Crimson womb palette
        vec3 color1 = vec3(0.682, 0.059, 0.212);
        vec3 color2 = vec3(0.863, 0.204, 0.231);
        vec3 color3 = vec3(0.745, 0.224, 0.310);
        vec3 color4 = vec3(0.325, 0.180, 0.231);

        vec3 iriColor = mix(color1, color2, sin(shift) * 0.5 + 0.5);
        iriColor = mix(iriColor, color3, sin(shift * 1.3 + 1.0) * 0.5 + 0.5);
        iriColor = mix(iriColor, color4, sin(shift * 0.7 + 2.0) * 0.3 + 0.3);

        // Subsurface scattering approximation
        float sss = pow(max(dot(normalize(vNormal), normalize(vec3(1.0, 1.0, 0.5))), 0.0), 2.0) * 0.28;
        vec3 sssColor = vec3(1.000, 0.745, 0.624) * sss;

        // Final composition
        vec3 baseColor = iriColor * 0.58 + sssColor;
        float alpha = 0.52 + fresnel * 0.28;

        // Inner glow
        float innerGlow = smoothstep(0.8, 0.0, length(vPosition.xy) / 3.2) * 0.1;
        baseColor += vec3(0.682, 0.059, 0.212) * innerGlow;

        float greenFleck = smoothstep(0.88, 1.0, sin(vPosition.x * 4.4 + uTime * 0.28) * sin(vPosition.y * 3.2 - uTime * 0.18) * 0.5 + 0.5);
        greenFleck *= smoothstep(2.9, 0.8, length(vPosition.xy));
        baseColor = mix(baseColor, vec3(0.17, 0.42, 0.20), greenFleck * 0.24);

        gl_FragColor = vec4(baseColor, alpha);
      }
    `;

    this.dropletMat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false,
    });

    this.droplet = new THREE.Mesh(geo, this.dropletMat);
    this.group.add(this.droplet);

    // Inner glow sphere
    const innerGeo = new THREE.IcosahedronGeometry(2.5, innerDetail);
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0xBE394F,
      emissive: 0xAE0F36,
      emissiveIntensity: 0.16,
      transparent: true,
      opacity: 0.08,
      roughness: 1,
      metalness: 0,
      depthWrite: false,
    });
    this.innerGlow = new THREE.Mesh(innerGeo, innerMat);
    this.group.add(this.innerGlow);
  }

  _createBotanicals() {
    // Floating botanical particles inside the droplet
    this.botanicals = [];
    const botanicalColors = [0xDC343B, 0x8F3D37, 0x464B65, 0x9C7E41, 0xBE394F, 0x005871, 0x2F6F45, 0x6B8E35, 0x9BCB76];
    const count = this.qualityTier === 'mobile' ? 18 : this.qualityTier === 'tablet' ? 22 : 25;
    const geometries = [
      new THREE.SphereGeometry(1, 8, 8),
      new THREE.TetrahedronGeometry(1, 0),
      new THREE.TorusGeometry(1, 0.3, 6, 8),
    ];
    const materials = botanicalColors.map((color) => new THREE.MeshPhysicalMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.18,
      transparent: true,
      opacity: 0.55,
      roughness: 0.4,
      metalness: 0.1,
      depthWrite: false,
    }));

    for (let i = 0; i < count; i++) {
      const size = 0.04 + Math.random() * 0.08;
      const type = Math.floor(Math.random() * 3);
      const mesh = new THREE.Mesh(geometries[type], materials[i % materials.length]);
      mesh.scale.setScalar(size);

      // Random orbital parameters
      const radius = 0.8 + Math.random() * 1.8;
      const speed = 0.1 + Math.random() * 0.3;
      const phase = Math.random() * Math.PI * 2;
      const tilt = (Math.random() - 0.5) * Math.PI;

      this.botanicals.push({ mesh, radius, speed, phase, tilt });
      this.group.add(mesh);
    }
  }

  _createWombGreens() {
    this.wombGreens = [];

    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0.18);
    leafShape.bezierCurveTo(0.18, 0.08, 0.2, -0.16, 0, -0.28);
    leafShape.bezierCurveTo(-0.2, -0.16, -0.18, 0.08, 0, 0.18);

    const leafGeo = new THREE.ShapeGeometry(leafShape, 18);
    const stemGeo = new THREE.CapsuleGeometry(0.012, 0.38, 4, 8);
    const greens = [
      { color: 0x2F6F45, emissive: 0x14391E },
      { color: 0x6B8E35, emissive: 0x263B15 },
      { color: 0x9BCB76, emissive: 0x385B22 },
    ];
    const leafMaterials = greens.map((matData) => new THREE.MeshPhysicalMaterial({
      color: matData.color,
      emissive: matData.emissive,
      emissiveIntensity: 0.22,
      transparent: true,
      opacity: 0.82,
      roughness: 0.68,
      metalness: 0.02,
      clearcoat: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false,
    }));
    const stemMat = new THREE.MeshPhysicalMaterial({
      color: 0x476B2C,
      emissive: 0x1C3314,
      emissiveIntensity: 0.08,
      transparent: true,
      opacity: 0.52,
      roughness: 0.76,
      depthWrite: false,
    });
    const sprigCount = this.qualityTier === 'mobile' ? 12 : this.qualityTier === 'tablet' ? 14 : 16;

    for (let i = 0; i < sprigCount; i++) {
      const leafMat = leafMaterials[i % leafMaterials.length];
      const sprig = new THREE.Group();
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.28;
      sprig.add(stem);

      for (let j = 0; j < 3; j++) {
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set((j - 1) * 0.13, 0.03 + j * 0.06, 0);
        leaf.rotation.z = (j - 1) * 0.68 + (i % 2 === 0 ? 0.18 : -0.18);
        leaf.rotation.y = (j % 2 === 0 ? 1 : -1) * 0.38;
        leaf.scale.setScalar(0.72 + j * 0.12);
        sprig.add(leaf);
      }

      sprig.userData = {
        radius: 0.68 + Math.random() * 1.22,
        speed: 0.08 + Math.random() * 0.18,
        phase: Math.random() * Math.PI * 2,
        tilt: (Math.random() - 0.5) * Math.PI,
        bob: 0.16 + Math.random() * 0.22,
      };
      sprig.scale.setScalar(0.92 + Math.random() * 0.52);

      this.wombGreens.push(sprig);
      this.group.add(sprig);
    }
  }

  _createAmbientParticles() {
    // Floating dust particles around the droplet
    const count = 200;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 4 + Math.random() * 6;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = 1.5 + Math.random() * 3;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      color: 0xEED4D9,
      size: 0.035,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geo, mat);
    this.group.add(this.particles);
  }

  /**
   * Update mouse position for ripple effects
   */
  updateMouse(mouseVec2) {
    // Map 2D mouse to 3D space on the droplet surface
    this.uniforms.uMouse.value.set(mouseVec2.x * 3, mouseVec2.y * 3, 0);
    this.uniforms.uRipple.value = THREE.MathUtils.lerp(
      this.uniforms.uRipple.value,
      Math.abs(mouseVec2.x) + Math.abs(mouseVec2.y) > 0.05 ? 1 : 0,
      0.05
    );
  }

  /**
   * Animate per frame
   */
  update(time) {
    this.uniforms.uTime.value = time;

    // Slow breathing rotation
    this.droplet.rotation.y = time * 0.05;
    this.droplet.rotation.x = Math.sin(time * 0.1) * 0.08;
    this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, this.uniforms.uMouse.value.x * 0.08, 0.04);
    this.group.rotation.x = THREE.MathUtils.lerp(this.group.rotation.x, -this.uniforms.uMouse.value.y * 0.05, 0.04);
    this.innerGlow.rotation.y = -time * 0.03;

    // Animate botanical particles in orbits
    for (const b of this.botanicals) {
      const angle = time * b.speed + b.phase;
      b.mesh.position.x = Math.cos(angle) * b.radius * Math.cos(b.tilt);
      b.mesh.position.y = Math.sin(angle) * b.radius * Math.sin(b.tilt) + Math.sin(time * 0.3 + b.phase) * 0.3;
      b.mesh.position.z = Math.sin(angle) * b.radius * Math.cos(b.tilt) * 0.6;
      b.mesh.rotation.x = time * 0.5;
      b.mesh.rotation.z = time * 0.3;
    }

    for (const sprig of this.wombGreens) {
      const angle = time * sprig.userData.speed + sprig.userData.phase;
      sprig.position.x = Math.cos(angle) * sprig.userData.radius * Math.cos(sprig.userData.tilt) * 0.72;
      sprig.position.y = Math.sin(angle) * sprig.userData.radius * 0.42 + Math.sin(time * 0.55 + sprig.userData.phase) * sprig.userData.bob;
      sprig.position.z = Math.sin(angle) * sprig.userData.radius * 0.54;
      sprig.rotation.x = Math.sin(time * 0.22 + sprig.userData.phase) * 0.36;
      sprig.rotation.y = angle * 0.45;
      sprig.rotation.z = Math.cos(time * 0.2 + sprig.userData.phase) * 0.24;
    }

    // Slowly rotate ambient particles
    this.particles.rotation.y = time * 0.02;
    this.particles.rotation.x = Math.sin(time * 0.05) * 0.1;
  }

  /**
   * Set visibility for scroll transitions
   */
  setOpacity(value) {
    this.dropletMat.opacity = value;
    this.dropletMat.uniforms.uTime.value *= value;
  }
}
