// Basit insan modeli: kafa, gövde, kalça, kollar, bacaklar, ayaklar.
// Her parça iskelet.js'teki ölçüm geometrisiyle birebir aynı boyuttadır.
import * as THREE from 'three';
import { PARTS, J, TORSO_HALF, PELVIS_HALF, FOOT_HALF, partBox } from '../sim/skeleton.js';
import { lumi } from '../data/teams.js';

const UP = new THREE.Vector3(0, 1, 0);
const _v = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _m = new THREE.Matrix4();
const _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();

let GEO = null;
function geos(q) {
  if (GEO && GEO.q === q) return GEO;
  const seg = q === 'dusuk' ? 6 : 10;
  GEO = {
    q,
    sphere: new THREE.SphereGeometry(1, seg + 2, seg),
    cyl: new THREE.CylinderGeometry(1, 1, 1, seg, 1),
    box: new THREE.BoxGeometry(1, 1, 1),
    hair: new THREE.SphereGeometry(1, seg + 2, seg / 2, 0, Math.PI * 2, 0, Math.PI / 2),
  };
  return GEO;
}

function numberTexture(num, shirt, big) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const g = cv.getContext('2d');
  g.fillStyle = shirt; g.fillRect(0, 0, 128, 128);
  const fg = lumi(shirt) > 0.55 ? '#111' : '#fff';
  g.fillStyle = fg;
  g.strokeStyle = lumi(shirt) > 0.55 ? '#fff' : '#000';
  g.lineWidth = 3;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  if (big) {
    g.font = 'bold 84px Arial, sans-serif';
    g.strokeText(String(num), 64, 72); g.fillText(String(num), 64, 72);
  } else {
    g.font = 'bold 30px Arial, sans-serif';
    g.fillText(String(num), 88, 34);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * opts: { shirt, shorts, socks, skin, hair, num, boots, quality, official, kind }
 */
export class Humanoid {
  constructor(entId, opts) {
    const G = geos(opts.quality);
    this.entId = entId;
    this.group = new THREE.Group();
    this.meshes = [];
    const mat = (c) => new THREE.MeshLambertMaterial({ color: c });
    const shirtM = mat(opts.shirt), shortsM = mat(opts.shorts), sockM = mat(opts.socks), skinM = mat(opts.skin), bootM = mat(opts.boots || '#111111');
    const shadows = opts.quality === 'yuksek';
    let torsoMats = shirtM;
    if (opts.num) {
      const back = new THREE.MeshLambertMaterial({ map: numberTexture(opts.num, opts.shirt, true) });
      const front = new THREE.MeshLambertMaterial({ map: numberTexture(opts.num, opts.shirt, false) });
      // kutu yüzleri: +x, -x, +y, -y, +z(sırt), -z(göğüs)
      torsoMats = [shirtM, shirtM, shirtM, shirtM, back, front];
    }
    for (let i = 0; i < PARTS.length; i++) {
      const p = PARTS[i];
      let geo, m;
      if (p.kind === 'sphere') { geo = G.sphere; m = skinM; }
      else if (p.kind === 'cyl') {
        geo = G.cyl;
        if (p.cat === 'kol') m = p.a === J.SHL || p.a === J.SHR ? shirtM : skinM;
        else m = p.a === J.HIPL || p.a === J.HIPR ? skinM : sockM;
      } else if (p.kind === 'torso') { geo = G.box; m = torsoMats; }
      else if (p.kind === 'pelvis') { geo = G.box; m = shortsM; }
      else { geo = G.box; m = bootM; }
      const mesh = new THREE.Mesh(geo, m);
      mesh.matrixAutoUpdate = false;
      mesh.castShadow = shadows;
      mesh.userData = { ent: entId, part: i };
      this.group.add(mesh);
      this.meshes.push(mesh);
    }
    // saç
    this.hair = new THREE.Mesh(G.hair, mat(opts.hair || '#222'));
    this.hair.matrixAutoUpdate = false;
    this.group.add(this.hair);
    // şort parçası uyluğun üstünü örter
    this.shortL = new THREE.Mesh(G.cyl, shortsM); this.shortR = new THREE.Mesh(G.cyl, shortsM);
    for (const s of [this.shortL, this.shortR]) { s.matrixAutoUpdate = false; s.castShadow = shadows; s.userData = { ent: entId, part: s === this.shortL ? 9 : 10 }; this.group.add(s); }
    this.meshes.push(this.shortL, this.shortR);
    // sahne aksesuarları
    this.prop = null;
    if (opts.kind === 'ref') {
      this.card = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.12), new THREE.MeshBasicMaterial({ color: 0xffd400, side: THREE.DoubleSide }));
      this.card.visible = false;
      this.group.add(this.card);
    }
    if (opts.kind === 'ar') {
      const fg = new THREE.Group();
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.55, 5), mat('#dddddd'));
      stick.position.y = 0.27;
      const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.24), new THREE.MeshLambertMaterial({ color: 0xffd000, side: THREE.DoubleSide }));
      cloth.position.set(0.17, 0.42, 0);
      fg.add(stick, cloth);
      this.flag = fg;
      this.group.add(fg);
    }
    this.blob = null;
  }

  setCylinder(mesh, j, a, b, r) {
    _a.set(j[a * 3], j[a * 3 + 1], j[a * 3 + 2]);
    _b.set(j[b * 3], j[b * 3 + 1], j[b * 3 + 2]);
    _v.subVectors(_b, _a);
    const len = _v.length() || 1e-4;
    _v.divideScalar(len);
    _q.setFromUnitVectors(UP, _v);
    _s.set(r, len, r);
    _a.addScaledVector(_v, len / 2);
    mesh.matrix.compose(_a, _q, _s);
  }

  update(sk, pose, p1) {
    const j = sk.j;
    for (let i = 0; i < PARTS.length; i++) {
      const p = PARTS[i], mesh = this.meshes[i];
      if (p.kind === 'sphere') {
        _a.set(j[p.a * 3], j[p.a * 3 + 1], j[p.a * 3 + 2]);
        _q.identity(); _s.set(p.r, p.r, p.r);
        mesh.matrix.compose(_a, _q, _s);
      } else if (p.kind === 'cyl') {
        this.setCylinder(mesh, j, p.a, p.b, p.r);
      } else {
        const bx = partBox(sk, i, {});
        _x.set(bx.ax[0][0], bx.ax[0][1], bx.ax[0][2]);
        _y.set(bx.ax[1][0], bx.ax[1][1], bx.ax[1][2]);
        _z.set(bx.ax[2][0], bx.ax[2][1], bx.ax[2][2]);
        if (p.kind !== 'foot') _z.negate(); // gövde: sağ, yukarı, arka (sağ el kuralı)
        _m.makeBasis(_x, _y, _z);
        _m.scale(_s.set(bx.h[0] * 2, bx.h[1] * 2, bx.h[2] * 2));
        _m.setPosition(bx.c[0], bx.c[1], bx.c[2]);
        mesh.matrix.copy(_m);
      }
    }
    // şort: uyluğun üst %40'ı
    for (const [m, a, b] of [[this.shortL, J.HIPL, J.KNEEL], [this.shortR, J.HIPR, J.KNEER]]) {
      _a.set(j[a * 3], j[a * 3 + 1], j[a * 3 + 2]);
      _b.set(j[b * 3], j[b * 3 + 1], j[b * 3 + 2]);
      _v.subVectors(_b, _a);
      const len = _v.length() || 1e-4;
      _v.divideScalar(len);
      _q.setFromUnitVectors(UP, _v);
      _s.set(0.092, len * 0.42, 0.092);
      _a.addScaledVector(_v, len * 0.21 - 0.02);
      m.matrix.compose(_a, _q, _s);
    }
    // saç: kafanın üstü, gövde eksenine göre
    _a.set(j[J.HEAD * 3], j[J.HEAD * 3 + 1], j[J.HEAD * 3 + 2]);
    _x.set(sk.right[0], sk.right[1], sk.right[2]);
    _y.set(sk.up[0], sk.up[1], sk.up[2]);
    _z.set(-sk.fwd[0], -sk.fwd[1], -sk.fwd[2]);
    _m.makeBasis(_x, _y, _z);
    _m.scale(_s.set(0.118, 0.118, 0.118));
    _a.addScaledVector(_y, 0.012);
    _a.addScaledVector(_z, 0.01);
    _m.setPosition(_a);
    this.hair.matrix.copy(_m);

    if (this.card) {
      this.card.visible = pose === 7;
      if (this.card.visible) {
        this.card.material.color.set(p1 >= 2 ? 0xe00000 : 0xffd400);
        this.card.position.set(j[J.HANDR * 3], j[J.HANDR * 3 + 1] + 0.08, j[J.HANDR * 3 + 2]);
        this.card.rotation.set(0, -Math.atan2(sk.fwd[2], sk.fwd[0]) + Math.PI / 2, 0);
      }
    }
    if (this.flag) {
      _a.set(j[J.HANDR * 3], j[J.HANDR * 3 + 1], j[J.HANDR * 3 + 2]);
      _b.set(j[J.ELR * 3], j[J.ELR * 3 + 1], j[J.ELR * 3 + 2]);
      _v.subVectors(_a, _b).normalize();
      this.flag.position.copy(_a);
      this.flag.quaternion.setFromUnitVectors(UP, _v);
    }
  }
}
