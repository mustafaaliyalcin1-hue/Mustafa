// Seyirciler: insan biçimli örnekli (instanced) modeller. Gölgelendiricide:
// ten / pantolon çeşitliliği, nefes alma, gol anında zıplama ve kol kaldırma.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

function tag(geo, part, arm) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const n = g.attributes.position.count;
  g.setAttribute('aPart', new THREE.Float32BufferAttribute(new Float32Array(n).fill(part), 1));
  g.setAttribute('aArm', new THREE.Float32BufferAttribute(new Float32Array(n).fill(arm), 1));
  if (g.attributes.uv) g.deleteAttribute('uv');
  return g;
}

/** Ayakta duran insan: -z yönüne (sahaya) bakar. */
export function personGeometry(detail) {
  // Uzaktan görülen binlerce kişi: düşük çokgenli ama orantılı siluet (~160 / ~70 üçgen)
  const s = detail ? 6 : 4;
  const parts = [];
  const torso = new THREE.CylinderGeometry(0.17, 0.15, 0.52, s, 1, !detail); torso.scale(1, 1, 0.65); torso.translate(0, 0.98, 0);
  parts.push(tag(torso, 0, 0));
  if (detail) {
    const sh = new THREE.SphereGeometry(0.17, s, 2, 0, Math.PI * 2, 0, Math.PI / 2); sh.scale(1, 0.45, 0.65); sh.translate(0, 1.24, 0);
    parts.push(tag(sh, 0, 0));
  }
  const head = new THREE.SphereGeometry(0.1, s, detail ? 4 : 3); head.scale(0.9, 1.08, 0.95); head.translate(0, 1.43, 0);
  parts.push(tag(head, 1, 0));
  if (detail) {
    const hair = new THREE.SphereGeometry(0.104, s, 2, 0, Math.PI * 2, 0, Math.PI * 0.45); hair.scale(0.92, 1.05, 0.97); hair.translate(0, 1.445, 0.006);
    parts.push(tag(hair, 2, 0));
  }
  for (const sx of [-1, 1]) {
    const arm = new THREE.CylinderGeometry(0.05, 0.042, 0.56, detail ? 5 : 3, 1, true); arm.translate(sx * 0.215, 0.95, 0);
    parts.push(tag(arm, 0, sx));
    if (detail) { const hand = new THREE.SphereGeometry(0.045, 4, 2); hand.translate(sx * 0.215, 0.65, 0); parts.push(tag(hand, 1, sx)); }
    const leg = new THREE.CylinderGeometry(0.075, 0.06, 0.74, detail ? 5 : 3, 1, true); leg.translate(sx * 0.085, 0.37, 0);
    parts.push(tag(leg, 2, 0));
  }
  return mergeGeometries(parts);
}

export function crowdMaterial() {
  const uniforms = { uTime: { value: 0 }, uJump: { value: 0 } };
  const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = uniforms.uTime;
    sh.uniforms.uJump = uniforms.uJump;
    sh.vertexShader = 'uniform float uTime; uniform float uJump; attribute float aPart; attribute float aArm;\n' + sh.vertexShader
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        float ph = float(gl_InstanceID) * 1.731;
        float hh = fract(sin(float(gl_InstanceID) * 12.9898) * 43758.5453);
        float ex = uJump * step(0.25, hh);
        if (abs(aArm) > 0.5) {
          float ang = ex * (2.3 + 0.5 * sin(uTime * 9.0 + ph)) + 0.06 * sin(uTime * 1.7 + ph);
          vec2 v = transformed.xy - vec2(aArm * 0.215, 1.22);
          float c = cos(ang * aArm), s = sin(ang * aArm);
          transformed.xy = vec2(aArm * 0.215, 1.22) + vec2(v.x * c - v.y * s, v.x * s + v.y * c);
        }
        transformed.y += max(0.0, sin(uTime * 7.5 + ph)) * ex * 0.32 + sin(uTime * 1.2 + ph) * 0.015;`)
      .replace('#include <color_vertex>', `#include <color_vertex>
        #ifdef USE_INSTANCING_COLOR
          float hc = fract(sin(float(gl_InstanceID) * 12.9898) * 43758.5453);
          vec3 skinC = mix(vec3(0.92, 0.7, 0.53), vec3(0.32, 0.2, 0.12), hc * hc);
          vec3 hairC = mix(vec3(0.05, 0.04, 0.03), vec3(0.45, 0.32, 0.18), fract(hc * 5.1));
          vec3 pantC = mix(vec3(0.06, 0.08, 0.14), vec3(0.28, 0.28, 0.3), fract(hc * 7.3));
          vColor = aPart < 0.5 ? instanceColor.rgb : (aPart < 1.5 ? skinC : (abs(position.y - 1.45) < 0.2 ? hairC : pantC));
        #endif`);
  };
  mat.userData.uniforms = uniforms;
  return mat;
}
