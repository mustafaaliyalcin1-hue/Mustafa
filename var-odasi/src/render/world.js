// Dünya: sahne + saha + stadyum + 25 insan + top + VAR çizim katmanları.
import * as THREE from 'three';
import { buildPitch } from './pitch.js';
import { buildStadium } from './stadium.js';
import { Humanoid } from './humanoid.js';
import { computeSkeleton, makeSkel } from '../sim/skeleton.js';
import { N_ENT, REF, AR1, AR2, BALL_R, POSE, PITCH, BOX_LINE_X } from '../sim/constants.js';

function ballTexture() {
  const cv = document.createElement('canvas');
  cv.width = 256; cv.height = 128;
  const g = cv.getContext('2d');
  g.fillStyle = '#f5f5f5'; g.fillRect(0, 0, 256, 128);
  g.fillStyle = '#1a1a1a';
  const spots = [[30, 30], [95, 64], [160, 30], [225, 64], [60, 100], [128, 110], [190, 100], [128, 14]];
  for (const [x, y] of spots) {
    g.beginPath();
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; g.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); }
    g.fill();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export class World {
  constructor(gfx, setup) {
    this.gfx = gfx;
    this.scene = gfx.scene;
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.quality = gfx.quality;
    this.setup = null;
    this.humans = [];
    this.sk = makeSkel();
    this.st = {};
    this.pickables = [];
    const q = this.quality;
    this.pitch = buildPitch(q);
    this.root.add(this.pitch);
    // top
    this.ball = new THREE.Mesh(new THREE.SphereGeometry(BALL_R, 16, 12), new THREE.MeshLambertMaterial({ map: ballTexture() }));
    this.ball.castShadow = q === 'yuksek';
    this.root.add(this.ball);
    // basit gölgeler (düşük kalitede gerçek gölge yerine)
    const blobTex = (() => {
      const cv = document.createElement('canvas'); cv.width = cv.height = 64;
      const g = cv.getContext('2d');
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(cv);
    })();
    this.blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false });
    this.ballBlob = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), this.blobMat);
    this.ballBlob.rotation.x = -Math.PI / 2;
    this.root.add(this.ballBlob);
    this.overlays = new Overlays(this.root);
    if (setup) this.setTeams(setup);
  }

  setTeams(setup) {
    // setup: { kits: [k0, k1], squads: [s0, s1], homeColor, awayColor }
    for (const h of this.humans) this.root.remove(h.group);
    if (this.stadium) this.root.remove(this.stadium.group);
    for (const b of this.blobs || []) this.root.remove(b);
    this.humans = []; this.pickables = []; this.blobs = [];
    this.setup = setup;
    const q = this.quality;
    this.stadium = buildStadium(q, setup.kits[0].shirt, setup.kits[1].shirt);
    this.root.add(this.stadium.group);
    for (let i = 0; i < N_ENT; i++) {
      let opts;
      if (i < 22) {
        const t = i < 11 ? 0 : 1, idx = i % 11, k = setup.kits[t], p = setup.squads[t][idx];
        const gk = idx === 0;
        opts = { shirt: gk ? k.gk : k.shirt, shorts: gk ? '#222222' : k.shorts, socks: gk ? k.gk : k.socks, skin: p.skin, hair: p.hair, num: p.num, quality: q };
      } else {
        opts = { shirt: '#c6ff00', shorts: '#111111', socks: '#111111', skin: '#e0ac69', hair: '#222', quality: q, kind: i === REF ? 'ref' : 'ar' };
      }
      const h = new Humanoid(i, opts);
      this.root.add(h.group);
      this.humans.push(h);
      this.pickables.push(...h.meshes);
      if (q !== 'yuksek') {
        const b = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), this.blobMat);
        b.rotation.x = -Math.PI / 2; b.position.y = 0.012;
        this.root.add(b);
        this.blobs.push(b);
      }
    }
  }

  /** Bir karedeki durumla tüm sahneyi güncelle. sample(i, out) ve ball(out) verir. */
  apply(sampleEnt, sampleBall, showPlayers = true) {
    for (let i = 0; i < this.humans.length; i++) {
      const h = this.humans[i];
      const s = sampleEnt(i, this.st);
      const vis = showPlayers && s && s.pose !== POSE.HIDDEN;
      h.group.visible = vis;
      if (this.blobs[i]) this.blobs[i].visible = vis;
      if (!vis) continue;
      computeSkeleton(s, this.sk);
      h.update(this.sk, s.pose, s.p1);
      if (this.blobs[i]) { this.blobs[i].position.x = this.sk.j[0]; this.blobs[i].position.z = this.sk.j[2]; }
    }
    const b = sampleBall();
    if (b) {
      this.ball.visible = true;
      this.ball.position.set(b[0], b[1], b[2]);
      this.ball.rotation.set(b[3] * 0.7, b[3] * 0.3, 0);
      this.ballBlob.position.set(b[0], 0.011, b[2]);
      const k = Math.max(0.3, 1 - b[1] * 0.12);
      this.ballBlob.scale.setScalar(k);
    }
  }

  setCrowd(t, jump) {
    if (this.stadium && this.stadium.crowd) {
      const u = this.stadium.crowd.userData.uniforms;
      u.uTime.value = t; u.uJump.value = jump;
    }
  }
}

// ------------------------------------------------------------------
// VAR çizim katmanları: ofsayt çizgileri, ceza sahası / kale çizgisi göstergeleri
// ------------------------------------------------------------------
export class Overlays {
  constructor(parent) {
    this.g = new THREE.Group();
    this.g.renderOrder = 10;
    parent.add(this.g);
    const mk = (color, op) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide });
    const lineGeo = new THREE.BoxGeometry(0.035, 0.012, PITCH.W + 2);
    const wallGeo = new THREE.PlaneGeometry(PITCH.W + 2, 2.2);
    const makeLine = (color) => {
      const grp = new THREE.Group();
      const l = new THREE.Mesh(lineGeo, mk(color, 0.95));
      l.position.y = 0.02;
      const w = new THREE.Mesh(wallGeo, mk(color, 0.13));
      w.rotation.y = Math.PI / 2; w.position.y = 1.1;
      grp.add(l, w);
      grp.visible = false;
      this.g.add(grp);
      return grp;
    };
    this.attLine = makeLine(0xff3344);
    this.defLine = makeLine(0x2f8bff);
    this.truthAtt = makeLine(0xffffff);
    this.truthDef = makeLine(0x22d36b);
    // ceza sahası çizgisi göstergesi
    const stripGeo = new THREE.BoxGeometry(PITCH.LINE, 0.015, PITCH.BOX_HW * 2);
    this.box = [];
    for (const s of [1, -1]) {
      const grp = new THREE.Group();
      const st = new THREE.Mesh(stripGeo, mk(0xffe100, 0.95));
      st.position.set(s * (BOX_LINE_X + PITCH.LINE / 2), 0.012, 0);
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(PITCH.BOX_HW * 2, 1.4), mk(0xffe100, 0.16));
      wall.rotation.y = Math.PI / 2;
      wall.position.set(s * BOX_LINE_X, 0.7, 0);
      grp.add(st, wall);
      grp.visible = false;
      this.g.add(grp);
      this.box.push(grp);
    }
    // kale çizgisi göstergesi
    const glGeo = new THREE.BoxGeometry(PITCH.LINE, 0.015, PITCH.W);
    this.goal = [];
    for (const s of [1, -1]) {
      const grp = new THREE.Group();
      const st = new THREE.Mesh(glGeo, mk(0x00e5ff, 0.95));
      st.position.set(s * (PITCH.HL - PITCH.LINE / 2), 0.012, 0);
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(PITCH.W, 1.0), mk(0x00e5ff, 0.15));
      wall.rotation.y = Math.PI / 2;
      wall.position.set(s * PITCH.HL, 0.5, 0);
      grp.add(st, wall);
      grp.visible = false;
      this.g.add(grp);
      this.goal.push(grp);
    }
    // işaret küreleri
    this.markers = [0xff3344, 0x2f8bff, 0xffa000].map((c) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), new THREE.MeshBasicMaterial({ color: c, depthTest: false }));
      m.renderOrder = 20; m.visible = false; this.g.add(m); return m;
    });
  }
  setLine(which, x) {
    const l = this[which];
    if (x === null || x === undefined) { l.visible = false; return; }
    l.visible = true; l.position.x = x;
  }
  showBox(dir, on) { this.box[0].visible = on && dir > 0; this.box[1].visible = on && dir < 0; }
  showGoal(dir, on) { this.goal[0].visible = on && dir > 0; this.goal[1].visible = on && dir < 0; }
  marker(i, p) { const m = this.markers[i]; if (!p) { m.visible = false; return; } m.visible = true; m.position.set(p[0], p[1], p[2]); }
  clear() {
    for (const k of ['attLine', 'defLine', 'truthAtt', 'truthDef']) this[k].visible = false;
    for (const b of [...this.box, ...this.goal]) b.visible = false;
    for (const m of this.markers) m.visible = false;
  }
}

export { REF, AR1, AR2 };
