// Gece gökyüzü: degrade kubbe, yıldızlar ve şehir ışığı haresi.
import * as THREE from 'three';

export function buildSky(q) {
  const g = new THREE.Group();
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(0x02050b) }, mid: { value: new THREE.Color(0x0b1626) }, hor: { value: new THREE.Color(0x2a2a3a) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 hor; varying vec3 vP;
      void main(){ float h = vP.y; vec3 c = h > 0.12 ? mix(mid, top, smoothstep(0.12, 0.7, h)) : mix(hor, mid, smoothstep(-0.05, 0.12, h));
      gl_FragColor = vec4(c, 1.0); }`,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(480, 32, 16), mat);
  dome.renderOrder = -10;
  g.add(dome);
  const n = q === 'dusuk' ? 500 : 1800;
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  let s = 31;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n; i++) {
    const th = r() * Math.PI * 2, ph = Math.acos(0.15 + 0.85 * r());
    pos[i * 3] = Math.sin(ph) * Math.cos(th) * 460; pos[i * 3 + 1] = Math.cos(ph) * 460; pos[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * 460;
    const b = 0.4 + r() * 0.6;
    col[i * 3] = b; col[i * 3 + 1] = b; col[i * 3 + 2] = b * (0.9 + r() * 0.2);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  sg.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.4, sizeAttenuation: false, vertexColors: true, fog: false, depthWrite: false, transparent: true, opacity: 0.9 }));
  g.add(stars);
  return g;
}
