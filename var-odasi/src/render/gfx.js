// WebGL çizici: PBR, ACES ton eşleme, prosedürel ortam yansıması, gece projektör ışıkları,
// tek tuvalde birden çok görüntü alanı (bölünmüş ekran için scissor).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildSky } from './sky.js';

export class Gfx {
  constructor(canvas, quality) {
    this.canvas = canvas;
    this.quality = quality;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: quality !== 'dusuk', powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.autoClear = false;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0b1420, 180, 520);
    // ortam yansıması (internet gerekmez: sahnede üretilir)
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.32;
    pmrem.dispose();
    this.scene.add(buildSky(quality));
    this.hemi = new THREE.HemisphereLight(0xc8d8ff, 0x1d2a18, 0.55);
    this.scene.add(this.hemi);
    // dört köşe projektörü: biri gölge düşürür, diğerleri dolgu
    this.sun = new THREE.DirectionalLight(0xfff4e2, 2.6);
    this.sun.position.set(-50, 75, -45);
    this.scene.add(this.sun, this.sun.target);
    this.fills = [[50, 70, 45, 1.1], [55, 65, -50, 0.75], [-55, 65, 50, 0.75]].map(([x, y, z, i]) => {
      const l = new THREE.DirectionalLight(0xe8eeff, i);
      l.position.set(x, y, z);
      this.scene.add(l);
      return l;
    });
    this.applyQuality(quality);
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  applyQuality(q) {
    this.quality = q;
    const dpr = window.devicePixelRatio || 1;
    this.pixelRatio = q === 'yuksek' ? Math.min(dpr, 2) : q === 'orta' ? Math.min(dpr, 1.4) : Math.min(dpr, 1) * 0.85;
    this.renderer.setPixelRatio(this.pixelRatio);
    const sh = q !== 'dusuk';
    this.renderer.shadowMap.enabled = sh;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.sun.castShadow = sh;
    if (sh) {
      const c = this.sun.shadow.camera;
      c.left = -66; c.right = 66; c.top = 46; c.bottom = -46; c.near = 20; c.far = 220;
      const size = q === 'yuksek' ? 4096 : 2048;
      if (this.sun.shadow.map && this.sun.shadow.mapSize.x !== size) { this.sun.shadow.map.dispose(); this.sun.shadow.map = null; }
      this.sun.shadow.mapSize.set(size, size);
      this.sun.shadow.bias = -0.00025;
      this.sun.shadow.normalBias = 0.02;
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
    this.renderer.setClearColor(0x05080c);
    this.renderer.clear();
    // gölge haritası kare başına bir kez (bölünmüş ekranda 4 kez değil)
    this.renderer.shadowMap.needsUpdate = true;
  }

  /** rect: CSS pikselinde {x, y, w, h} (sol üst köşeden). */
  renderView(camera, rect) {
    const r = this.renderer;
    const x = Math.round(rect.x), y = Math.round(this.h - rect.y - rect.h), w = Math.round(rect.w), h = Math.round(rect.h);
    if (w < 2 || h < 2) return;
    r.setScissorTest(true);
    r.setScissor(x, y, w, h);
    r.setViewport(x, y, w, h);
    r.setClearColor(0x05080c);
    r.clear();
    r.render(this.scene, camera);
  }
}
