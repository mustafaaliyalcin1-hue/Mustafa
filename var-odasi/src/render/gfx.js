// WebGL çizici: tek tuval, birden çok görüntü alanı (bölünmüş ekran için scissor).
import * as THREE from 'three';

export class Gfx {
  constructor(canvas, quality) {
    this.canvas = canvas;
    this.quality = quality;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: quality !== 'dusuk', powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x070b10);
    this.renderer.autoClear = false;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a121c);
    this.scene.fog = new THREE.Fog(0x0a121c, 140, 320);
    const hemi = new THREE.HemisphereLight(0xdfe9ff, 0x2b3b22, 1.25);
    this.scene.add(hemi);
    this.sun = new THREE.DirectionalLight(0xfff4e0, 1.6);
    this.sun.position.set(-30, 70, -40);
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);
    this.fill = new THREE.DirectionalLight(0xbfd4ff, 0.55);
    this.fill.position.set(40, 50, 45);
    this.scene.add(this.fill);
    this.applyQuality(quality);
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  applyQuality(q) {
    this.quality = q;
    const dpr = window.devicePixelRatio || 1;
    this.pixelRatio = q === 'yuksek' ? Math.min(dpr, 2) : q === 'orta' ? Math.min(dpr, 1.35) : Math.min(dpr, 1) * 0.85;
    this.renderer.setPixelRatio(this.pixelRatio);
    const sh = q === 'yuksek';
    this.renderer.shadowMap.enabled = sh;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.sun.castShadow = sh;
    if (sh) {
      const c = this.sun.shadow.camera;
      c.left = -70; c.right = 70; c.top = 50; c.bottom = -50; c.near = 10; c.far = 200;
      this.sun.shadow.mapSize.set(2048, 2048);
      this.sun.shadow.bias = -0.0004;
      c.updateProjectionMatrix();
    }
    this.resize();
  }

  resize() {
    this.w = window.innerWidth; this.h = window.innerHeight;
    this.renderer.setSize(this.w, this.h, false);
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
  }

  clear() {
    this.renderer.setScissorTest(false);
    this.renderer.setViewport(0, 0, this.w, this.h);
    this.renderer.clear();
  }

  /** rect: CSS pikselinde {x, y, w, h} (sol üst köşeden). */
  renderView(camera, rect) {
    const r = this.renderer;
    const x = Math.round(rect.x), y = Math.round(this.h - rect.y - rect.h), w = Math.round(rect.w), h = Math.round(rect.h);
    if (w < 2 || h < 2) return;
    r.setScissorTest(true);
    r.setScissor(x, y, w, h);
    r.setViewport(x, y, w, h);
    r.setClearColor(0x0a121c);
    r.clear();
    r.render(this.scene, camera);
  }
}
