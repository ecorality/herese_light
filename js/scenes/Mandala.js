import * as THREE from 'three';

/**
 * Mandala - Procedural mandala of glowing particles
 * representing the community of women who've joined the waitlist.
 */
export class Mandala {
  constructor() {
    this.group = new THREE.Group();
    this.group.position.y = -52.5;
    this.dotTexture = this._createDotTexture();

    this._createMandala();
  }

  _createDotTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.65, 'rgba(255,255,255,0.92)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  _createMandala() {
    this.rings = [];
    const ringCount = 6;
    const particlesPerRing = [24, 36, 48, 60, 72, 84];
    const ringColors = [0x532E3B, 0x464B65, 0x005871, 0xAE0F36, 0x8F3D37, 0x9C7E41];

    for (let r = 0; r < ringCount; r++) {
      const count = particlesPerRing[r];
      const radius = 1.5 + r * 1.2;
      const positions = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const mat = new THREE.PointsMaterial({
        color: ringColors[r],
        size: 0.1 + (ringCount - r) * 0.02,
        map: this.dotTexture,
        alphaMap: this.dotTexture,
        transparent: true,
        opacity: 0.74,
        blending: THREE.NormalBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });

      const points = new THREE.Points(geo, mat);
      this.rings.push({ points, radius, speed: 0.08 + r * 0.02, direction: r % 2 === 0 ? 1 : -1 });
      this.group.add(points);
    }

  }

  /**
   * Burst animation when user submits email
   */
  burst() {
    for (const ring of this.rings) {
      const positions = ring.points.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const angle = Math.atan2(positions[i + 2], positions[i]);
        const burstRadius = ring.radius * 1.3;
        positions[i] = Math.cos(angle) * burstRadius;
        positions[i + 2] = Math.sin(angle) * burstRadius;
      }
      ring.points.geometry.attributes.position.needsUpdate = true;
    }
  }

  /**
   * Animate per frame
   */
  update(time) {
    for (const ring of this.rings) {
      ring.points.rotation.y = time * ring.speed * ring.direction;
      ring.points.position.y = Math.sin(time * 0.3 + ring.radius) * 0.1;
    }
  }
}
