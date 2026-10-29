// Stadyum: tribünler, taraftarlar (instanced + gölgelendiricide zıplama), reklam yerine
// "reklamsız futbol" panoları, ışık kuleleri.
import * as THREE from 'three';

function boardTexture(text, bg, fg) {
  const cv = document.createElement('canvas');
  cv.width = 1024; cv.height = 64;
  const g = cv.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, 1024, 64);
  g.fillStyle = fg; g.font = 'bold 40px Arial, sans-serif'; g.textBaseline = 'middle';
  let x = 10;
  while (x < 1024) { g.fillText(text, x, 34); x += g.measureText(text).width + 60; }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildStadium(q, homeColor, awayColor) {
  const group = new THREE.Group();
  const concrete = new THREE.MeshLambertMaterial({ color: 0x3a3f47 });
  const seatA = new THREE.MeshLambertMaterial({ color: 0x23272e });

  // panolar
  const boards = [
    ['VAR ODASI  •  REKLAMSIZ FUTBOL  •  ADİL OYUN', '#0b0f14', '#22d36b'],
    ['FAIR PLAY  •  SAYGI  •  HAKEME SAYGI  •  KURGUSAL LİG', '#102030', '#ffffff'],
  ];
  const bmat = boards.map(([t, b, f]) => new THREE.MeshBasicMaterial({ map: boardTexture(t, b, f) }));
  const bgeo = new THREE.BoxGeometry(1, 0.9, 0.12);
  const addBoard = (x, z, len, rotY, mi) => {
    const m = new THREE.Mesh(bgeo, [concrete, concrete, concrete, concrete, bmat[mi], bmat[mi]]);
    m.scale.x = len; m.position.set(x, 0.45, z); m.rotation.y = rotY;
    const tex = bmat[mi].map; tex.wrapS = THREE.RepeatWrapping;
    group.add(m);
  };
  addBoard(0, -38.5, 110, 0, 0);
  addBoard(0, 38.5, 110, 0, 1);
  addBoard(-57.5, -20, 30, Math.PI / 2, 1);
  addBoard(-57.5, 20, 30, Math.PI / 2, 0);
  addBoard(57.5, -20, 30, Math.PI / 2, 0);
  addBoard(57.5, 20, 30, Math.PI / 2, 1);

  // tribün basamakları
  const rows = q === 'dusuk' ? 10 : 16;
  const stand = (cx, cz, len, rotY, depthDir) => {
    const g = new THREE.Group();
    for (let r = 0; r < rows; r++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(len, 0.8 + r * 0.8, 1.2), r % 2 ? seatA : concrete);
      step.position.set(0, (0.8 + r * 0.8) / 2, depthDir * (r * 1.2));
      g.add(step);
    }
    // çatı
    const roof = new THREE.Mesh(new THREE.BoxGeometry(len + 4, 0.5, rows * 1.2 + 4), new THREE.MeshLambertMaterial({ color: 0x1b1e23 }));
    roof.position.set(0, rows * 0.8 + 16, depthDir * (rows * 1.2) / 2 + depthDir * 2);
    g.add(roof);
    g.position.set(cx, 0, cz);
    g.rotation.y = rotY;
    group.add(g);
    return g;
  };
  stand(0, -42, 120, 0, -1);
  stand(0, 42, 120, 0, 1);
  stand(-62, 0, 70, Math.PI / 2, -1);
  stand(62, 0, 70, Math.PI / 2, 1);

  // seyirciler
  let crowd = null;
  const count = q === 'yuksek' ? 9000 : q === 'orta' ? 4500 : 1600;
  if (count > 0) {
    const geo = new THREE.BoxGeometry(0.45, 0.75, 0.3);
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const uniforms = { uTime: { value: 0 }, uJump: { value: 0 } };
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = uniforms.uTime;
      sh.uniforms.uJump = uniforms.uJump;
      sh.vertexShader = 'uniform float uTime; uniform float uJump;\n' + sh.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\n float ph = float(gl_InstanceID) * 1.731;\n transformed.y += (max(0.0, sin(uTime * 7.0 + ph)) * uJump + sin(uTime * 1.3 + ph) * 0.04) * 0.45;',
      );
    };
    crowd = new THREE.InstancedMesh(geo, mat, count);
    const m4 = new THREE.Matrix4();
    const col = new THREE.Color();
    const hc = new THREE.Color(homeColor), ac = new THREE.Color(awayColor);
    const neutral = [0x2b2f36, 0xdddddd, 0x444c55, 0x7a6a5a, 0x1e3d59, 0x5a2a2a];
    let seed = 99;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const sides = [
      { cx: 0, cz: -42, len: 116, rot: 0, dd: -1, w: 0.42 },
      { cx: 0, cz: 42, len: 116, rot: 0, dd: 1, w: 0.42 },
      { cx: -62, cz: 0, len: 66, rot: Math.PI / 2, dd: -1, w: 0.08, away: true },
      { cx: 62, cz: 0, len: 66, rot: Math.PI / 2, dd: 1, w: 0.08 },
    ];
    for (let i = 0; i < count; i++) {
      let r = rnd(), si = 0, acc = 0;
      for (let k = 0; k < sides.length; k++) { acc += sides[k].w; if (r <= acc) { si = k; break; } si = k; }
      const S = sides[si];
      const row = Math.floor(rnd() * rows);
      const along = (rnd() - 0.5) * S.len;
      const lx = along, lz = S.dd * (row * 1.2) + S.dd * 0.1, ly = 0.8 + row * 0.8 + 0.37;
      const c = Math.cos(S.rot), s = Math.sin(S.rot);
      const wx = S.cx + lx * c + lz * s, wz = S.cz - lx * s + lz * c;
      m4.makeRotationY(S.rot);
      m4.setPosition(wx, ly, wz);
      crowd.setMatrixAt(i, m4);
      const pr = rnd();
      if (S.away) col.copy(pr < 0.75 ? ac : new THREE.Color(neutral[(rnd() * neutral.length) | 0]));
      else col.copy(pr < 0.6 ? hc : pr < 0.7 ? ac : new THREE.Color(neutral[(rnd() * neutral.length) | 0]));
      col.multiplyScalar(0.55 + rnd() * 0.45);
      crowd.setColorAt(i, col);
    }
    crowd.instanceMatrix.needsUpdate = true;
    crowd.userData.uniforms = uniforms;
    group.add(crowd);
  }

  // ışık kuleleri
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 38, 8), concrete);
    pole.position.set(sx * 70, 19, sz * 52);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(7, 4, 0.6), new THREE.MeshBasicMaterial({ color: 0xfffbe6 }));
    panel.position.set(sx * 70, 39, sz * 52);
    panel.lookAt(0, 0, 0);
    group.add(pole, panel);
  }
  return { group, crowd };
}
