// Dünya: sahne + saha + stadyum + 25 insan + top + VAR çizim katmanları.
import * as THREE from 'three';
import { buildPitch } from './pitch.js';
import { buildStadium } from './stadium.js';
import { Humanoid } from './humanoid.js';
import { computeSkeleton, makeSkel } from '../sim/skeleton.js';
import { N_ENT, REF, AR1, AR2, BALL_R, POSE, PITCH, BOX_LINE_X } from '../sim/constants.js';
import { kitStyle } from './textures.js';

/** Klasik top: 12 siyah beşgen, beyaz altıgenler ve dikiş çizgileri (yüz başına renk). */
function ballMesh(q) {
  const geo = new THREE.IcosahedronGeometry(BALL_R, q === 'dusuk' ? 3 : 5);
  const phi = (1 + Math.sqrt(5)) / 2;
  const ico = [[0, 1, phi], [0, -1, phi], [0, 1, -phi], [0, -1, -phi], [1, phi, 0], [-1, phi, 0], [1, -phi, 0], [-1, -phi, 0], [phi, 0, 1], [-phi, 0, 1], [phi, 0, -1], [-phi, 0, -1]].map((v) => new THREE.Vector3(...v).normalize());
  // altıgen merkezleri: ikosahedronun yüz merkezleri
  const ig = new THREE.IcosahedronGeometry(1, 0);
  const ip = ig.attributes.position, hex = [];
  for (let i = 0; i < ip.count; i += 3) hex.push(new THREE.Vector3().fromBufferAttribute(ip, i).add(new THREE.Vector3().fromBufferAttribute(ip, i + 1)).add(new THREE.Vector3().fromBufferAttribute(ip, i + 2)).normalize());
  const p = geo.attributes.position;
  const col = new Float32Array(p.count * 3), nrm = new Float32Array(p.count * 3);
  const c = new THREE.Vector3(), v = new THREE.Vector3();
  for (let i = 0; i < p.count; i += 3) {
    c.set(0, 0, 0);
    for (let k = 0; k < 3; k++) c.add(v.fromBufferAttribute(p, i + k));
    c.normalize();
    let best = 9;
    for (const d of ico) best = Math.min(best, c.angleTo(d));
    let k1 = 9, k2 = 9;
    for (const d of hex) { const a = c.angleTo(d); if (a < k1) { k2 = k1; k1 = a; } else if (a < k2) k2 = a; }
    let r = 0.94, gg = 0.94, b = 0.92;
    if (best < 0.36) { r = 0.04; gg = 0.05; b = 0.08; }
    else if (k2 - k1 < 0.035 || Math.abs(best - 0.36) < 0.03) { r = gg = b = 0.55; }
    for (let k = 0; k < 3; k++) {
      col[(i + k) * 3] = r; col[(i + k) * 3 + 1] = gg; col[(i + k) * 3 + 2] = b;
      v.fromBufferAttribute(p, i + k).normalize();
      nrm[(i + k) * 3] = v.x; nrm[(i + k) * 3 + 1] = v.y; nrm[(i + k) * 3 + 2] = v.z;
    }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  const mat = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.38, clearcoat: q === 'yuksek' ? 0.7 : 0, clearcoatRoughness: 0.3 });
  return new THREE.Mesh(geo, mat);
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
    this.ball = ballMesh(q);
    this.ball.castShadow = q !== 'dusuk';
    this.root.add(this.ball);
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
    this.ballBlob.visible = q === 'dusuk';
    this.root.add(this.ballBlob);
    this.overlays = new Overlays(this.root);
    this.sbKey = '';
    if (setup) this.setTeams(setup);
  }

  setTeams(setup) {
    // setup: { kits: [k0, k1], squads: [s0, s1], teams: [t0, t1] }
    for (const h of this.humans) { this.root.remove(h.group); h.dispose(); }
    if (this.stadium) this.root.remove(this.stadium.group);
    for (const b of this.blobs || []) this.root.remove(b);
    this.humans = []; this.pickables = []; this.blobs = [];
    this.setup = setup;
    const q = this.quality;
    const teams = setup.teams || [{ id: 'ev', short: 'EV', kit: setup.kits[0] }, { id: 'dep', short: 'DEP', kit: setup.kits[1] }];
    this.stadium = buildStadium(q, { id: teams[0].id, kit: setup.kits[0] }, { id: teams[1].id, kit: setup.kits[1] });
    this.root.add(this.stadium.group);
    this.sbKey = '';
    this.teamNames = teams.map((t) => t.short || t.name || '');
    for (let i = 0; i < N_ENT; i++) {
      let opts;
      if (i < 22) {
        const t = i < 11 ? 0 : 1, idx = i % 11, k = setup.kits[t], p = setup.squads[t][idx];
        const gk = idx === 0;
        const st = kitStyle(teams[t].id, k);
        opts = {
          shirt: gk ? k.gk : k.shirt, second: gk ? '#111111' : st.second, shorts: gk ? '#1d1d1d' : k.shorts, socks: gk ? k.gk : k.socks,
          skin: p.skin, hair: p.hair, num: p.num, name: p.name, quality: q, kind: gk ? 'gk' : 'player', teamId: teams[t].id,
          crest: { c1: k.shirt, c2: st.second, txt: (teams[t].short || 'FK').slice(0, 2) }, seed: teams[t].id + i,
        };
      } else {
        opts = { shirt: '#c6ff00', second: '#111111', shorts: '#111111', socks: '#111111', skin: ['#e0ac69', '#c68642', '#f1c27d'][i - 22], hair: '#222', quality: q, kind: i === REF ? 'ref' : 'ar', seed: 'hakem' + i };
      }
      const h = new Humanoid(i, opts);
      this.root.add(h.group);
      this.humans.push(h);
      this.pickables.push(...h.meshes);
      if (q === 'dusuk') {
        const b = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), this.blobMat);
        b.rotation.x = -Math.PI / 2; b.position.y = 0.012;
        this.root.add(b);
        this.blobs.push(b);
      }
    }
  }

  /** Bir karedeki durumla tüm sahneyi güncelle. */
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
      this.ballBlob.scale.setScalar(Math.max(0.3, 1 - b[1] * 0.12));
    }
  }

  setCrowd(t, jump) {
    if (!this.stadium) return;
    const u = this.stadium.crowdMat.userData.uniforms;
    u.uTime.value = t; u.uJump.value += (jump - u.uJump.value) * 0.08;
    this.stadium.update(t);
  }

  /** Stadyumdaki dev ekran. */
  setScoreboard(score, minuteText, status) {
    if (!this.stadium) return;
    const key = `${score}|${minuteText}|${status}`;
    if (key === this.sbKey) return;
    this.sbKey = key;
    const { c, g, t } = this.stadium.scoreboard;
    const W = c.width, H = c.height;
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#08121e'); gr.addColorStop(1, '#02060b');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#22d36b'; g.lineWidth = 8; g.strokeRect(8, 8, W - 16, H - 16);
    const [a, b] = this.teamNames || ['EV', 'DEP'];
    g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold 86px Arial, sans-serif';
    g.fillText(a, W * 0.2, H * 0.36); g.fillText(b, W * 0.8, H * 0.36);
    g.font = '900 150px Arial, sans-serif';
    g.fillText(score, W * 0.5, H * 0.38);
    g.font = 'bold 64px monospace'; g.fillStyle = '#22d36b';
    g.fillText(minuteText, W * 0.5, H * 0.68);
    if (status) {
      g.fillStyle = status.includes('VAR') ? '#00e5ff' : '#ffd400';
      g.fillRect(W * 0.18, H * 0.78, W * 0.64, H * 0.15);
      g.fillStyle = '#001018'; g.font = 'bold 60px Arial, sans-serif';
      g.fillText(status, W * 0.5, H * 0.856);
    } else {
      g.fillStyle = '#8b98a5'; g.font = 'bold 40px Arial, sans-serif';
      g.fillText('VAR ODASI · REKLAMSIZ FUTBOL', W * 0.5, H * 0.86);
    }
    t.needsUpdate = true;
  }
}

// ------------------------------------------------------------------
// VAR çizim katmanları: ofsayt çizgileri, ceza sahası / kale çizgisi göstergeleri
// ------------------------------------------------------------------
export class Overlays {
  constructor(parent) {
    this.g = new THREE.Group();
    parent.add(this.g);
    const mk = (color, op) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false });
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
      grp.renderOrder = 10;
      this.g.add(grp);
      return grp;
    };
    this.attLine = makeLine(0xff3344);
    this.defLine = makeLine(0x2f8bff);
    this.truthAtt = makeLine(0xffffff);
    this.truthDef = makeLine(0x22d36b);
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
    this.markers = [0xff3344, 0x2f8bff, 0xffa000].map((c) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), new THREE.MeshBasicMaterial({ color: c, depthTest: false, toneMapped: false }));
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
