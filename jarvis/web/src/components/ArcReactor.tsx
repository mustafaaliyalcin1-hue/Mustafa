/**
 * Merkezdeki 3D ARK REAKTÖRÜ
 * ---------------------------------------------------------------
 * Tek bir r3f sahnesi; durum değiştikçe hedef değerlere yumuşakça (lerp) geçer:
 *  - idle      : nefes alan çekirdek, yavaş dönen halkalar, yüzen partiküller
 *  - listening : küre büyür, mikrofon sesine göre titreşir, halkalar hızlanır
 *  - thinking  : halkalar ters yönlere döner, sinir ağı noktaları ve veri akışı belirir
 *  - speaking  : küre etrafında ses dalgası halkası
 *  - success   : yeşile döner     - error : kırmızı + titreme
 */
import { Canvas, extend, useFrame, type ThreeElement } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { audioLevel, isLowPerf, useJarvis } from '../core/store'
import type { AssistantState } from '../core/types'

// <line> JSX'te SVG ile çakıştığı için THREE.Line'ı <line_> adıyla kaydediyoruz
extend({ Line_: THREE.Line })
declare module '@react-three/fiber' {
  interface ThreeElements {
    line_: ThreeElement<typeof THREE.Line>
  }
}

const COLORS: Record<AssistantState, string> = {
  booting: '#3ee8ff',
  idle: '#3ee8ff',
  listening: '#5ff3ff',
  thinking: '#4d9dff',
  speaking: '#3ee8ff',
  success: '#39ff9a',
  error: '#ff3b4e',
}

/** Fresnel parıltılı küre kabuğu için küçük shader */
const glowVert = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position,1.0);
    vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`
const glowFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uPower; uniform float uTime;
  varying vec3 vN; varying vec3 vV;
  void main(){
    float f = pow(1.0 - max(dot(vN, vV), 0.0), uPower);
    float scan = 0.85 + 0.15 * sin(gl_FragCoord.y * 0.6 + uTime * 6.0);
    gl_FragColor = vec4(uColor * f * 1.6 * scan, f);
  }`

function makeCircle(r: number, seg = 128) {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0))
  }
  return new THREE.BufferGeometry().setFromPoints(pts)
}

function Reactor({ state, low }: { state: AssistantState; low: boolean }) {
  const group = useRef<THREE.Group>(null!)
  const core = useRef<THREE.Mesh>(null!)
  const coreMat = useRef<THREE.MeshBasicMaterial>(null!)
  const ico = useRef<THREE.LineSegments>(null!)
  const glow = useRef<THREE.ShaderMaterial>(null!)
  const rings = useRef<THREE.Group[]>([])
  const wave = useRef<THREE.Line>(null!)
  const neural = useRef<THREE.Group>(null!)
  const particles = useRef<THREE.Points>(null!)
  const color = useMemo(() => new THREE.Color(COLORS.idle), [])
  const v = useRef({ scale: 1, speed: 0.3, neural: 0, wave: 0, shake: 0 })

  // ---- geometriler (bir kez oluşturulur)
  const haloTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const g = c.getContext('2d')!
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128)
    grd.addColorStop(0, 'rgba(255,255,255,1)')
    grd.addColorStop(0.25, 'rgba(255,255,255,0.45)')
    grd.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, 256, 256)
    return new THREE.CanvasTexture(c)
  }, [])
  const halo = useRef<THREE.SpriteMaterial>(null!)
  const icoGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.78, 1)), [])
  const ringDefs = useMemo(
    () => [
      { r: 1.25, tilt: [0.3, 0, 0], dash: [0.18, 0.08], dir: 1 },
      { r: 1.45, tilt: [-0.5, 0.4, 0], dash: [0.5, 0.15], dir: -1 },
      { r: 1.7, tilt: [1.1, 0.2, 0], dash: [0.04, 0.06], dir: 1 },
      { r: 1.95, tilt: [0.1, -0.7, 0], dash: [1.2, 0.3], dir: -1 },
      { r: 2.25, tilt: [0, 0, 0], dash: [0.02, 0.1], dir: 1 },
    ],
    [],
  )
  const ringGeos = useMemo(
    () =>
      ringDefs.map((d) => {
        const g = makeCircle(d.r, 256)
        const l = new THREE.Line(g)
        l.computeLineDistances()
        return l.geometry
      }),
    [ringDefs],
  )
  const waveGeo = useMemo(() => makeCircle(1.55, 160), [])

  // Sinir ağı: küre yüzeyinde rastgele noktalar + yakın noktalar arası çizgiler
  const neuralGeo = useMemo(() => {
    const n = low ? 36 : 90
    const nodes: THREE.Vector3[] = []
    for (let i = 0; i < n; i++) {
      const u = Math.random() * 2 - 1
      const t = Math.random() * Math.PI * 2
      const s = Math.sqrt(1 - u * u)
      nodes.push(new THREE.Vector3(s * Math.cos(t), s * Math.sin(t), u).multiplyScalar(2.05 + Math.random() * 0.35))
    }
    const lines: number[] = []
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) if (nodes[i].distanceTo(nodes[j]) < 0.95) lines.push(...nodes[i].toArray(), ...nodes[j].toArray())
    const lg = new THREE.BufferGeometry()
    lg.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3))
    const pg = new THREE.BufferGeometry().setFromPoints(nodes)
    return { lg, pg }
  }, [low])

  // Yüzen partiküller
  const partGeo = useMemo(() => {
    const n = low ? 160 : 700
    const pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const r = 2.5 + Math.random() * 4
      const a = Math.random() * Math.PI * 2
      pos[i * 3] = Math.cos(a) * r
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6
      pos[i * 3 + 2] = Math.sin(a) * r - 1
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [low])

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    const k = Math.min(1, dt * 4)
    const mic = audioLevel.mic
    const voice = audioLevel.voice
    // ---- hedef değerler duruma göre
    let tScale = 1 + Math.sin(t * 1.4) * 0.035 // nefes
    let tSpeed = 0.25
    let tNeural = 0
    let tWave = 0
    let tShake = 0
    if (state === 'listening') {
      tScale = 1.22 + mic * 0.45
      tSpeed = 1.2 + mic * 2
    } else if (state === 'thinking') {
      tScale = 1.05 + Math.sin(t * 4) * 0.02
      tSpeed = 1.8
      tNeural = 1
    } else if (state === 'speaking') {
      tScale = 1.08 + voice * 0.12
      tSpeed = 0.6
      tWave = 1
    } else if (state === 'success') {
      tScale = 1.15
      tSpeed = 0.8
    } else if (state === 'error') {
      tShake = 1
      tSpeed = 0.1
    } else if (state === 'booting') {
      tScale = 0.001
    }
    const vv = v.current
    vv.scale += (tScale - vv.scale) * k
    vv.speed += (tSpeed - vv.speed) * k
    vv.neural += (tNeural - vv.neural) * k
    vv.wave += (tWave - vv.wave) * k
    vv.shake += (tShake - vv.shake) * k

    color.lerp(new THREE.Color(COLORS[state]), k)

    group.current.scale.setScalar(vv.scale)
    group.current.position.x = (Math.random() - 0.5) * 0.12 * vv.shake
    group.current.position.y = (Math.random() - 0.5) * 0.12 * vv.shake
    group.current.rotation.y = Math.sin(t * 0.2) * 0.25

    core.current.scale.setScalar(0.42 + Math.sin(t * 2.2) * 0.03 + mic * 0.15 + voice * 0.1)
    coreMat.current.color.copy(color)
    halo.current.color.copy(color)
    halo.current.opacity = 0.55 + Math.sin(t * 2.2) * 0.1 + mic * 0.3 + voice * 0.3
    ico.current.rotation.x += dt * vv.speed * 0.5
    ico.current.rotation.y += dt * vv.speed * 0.8
    ;(ico.current.material as THREE.LineBasicMaterial).color.copy(color)
    glow.current.uniforms.uColor.value.copy(color)
    glow.current.uniforms.uTime.value = t

    // Halkalar: düşünürken ters yönlere hızlı döner
    rings.current.forEach((r, i) => {
      if (!r) return
      const d = ringDefs[i]
      const dir = state === 'thinking' ? (i % 2 ? -1 : 1) * 1.6 : d.dir
      r.rotation.z += dt * vv.speed * dir * (0.4 + i * 0.12)
      const m = (r.children[0] as THREE.Line).material as THREE.LineDashedMaterial
      m.color.copy(color)
    })

    // Ses dalgası halkası (konuşurken)
    const wpos = waveGeo.attributes.position as THREE.BufferAttribute
    const seg = wpos.count - 1
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2
      const amp = vv.wave * (0.05 + voice * 0.28)
      const rr = 1.55 + amp * Math.sin(a * 9 + t * 9) * Math.cos(a * 4 - t * 5) + amp * 0.4 * Math.sin(a * 23 + t * 17)
      wpos.setXYZ(i, Math.cos(a) * rr, Math.sin(a) * rr, 0)
    }
    wpos.needsUpdate = true
    ;(wave.current.material as THREE.LineBasicMaterial).opacity = vv.wave
    ;(wave.current.material as THREE.LineBasicMaterial).color.copy(color)

    // Sinir ağı (düşünürken)
    neural.current.visible = vv.neural > 0.02
    neural.current.rotation.y += dt * 0.6
    neural.current.rotation.x = Math.sin(t * 0.5) * 0.3
    neural.current.children.forEach((c) => {
      const m = (c as THREE.Mesh).material as THREE.Material & { opacity: number }
      m.opacity = vv.neural * (c.type === 'Points' ? 0.95 : 0.25 + Math.sin(t * 8) * 0.1)
    })

    // Partiküller yavaşça yükselir
    const pp = partGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pp.count; i++) {
      let y = pp.getY(i) + dt * (0.08 + (i % 7) * 0.02) * (1 + vv.speed * 0.5)
      if (y > 3) y = -3
      pp.setY(i, y)
    }
    pp.needsUpdate = true
    particles.current.rotation.y += dt * 0.03
  })

  return (
    <>
      <group ref={group}>
        {/* Parlak çekirdek */}
        <mesh ref={core}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial ref={coreMat} color={COLORS.idle} toneMapped={false} />
        </mesh>
        {/* Yumuşak ışıma */}
        <sprite scale={2.6}>
          <spriteMaterial ref={halo} map={haloTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
        {/* Tel kafes kristal */}
        <lineSegments ref={ico} geometry={icoGeo}>
          <lineBasicMaterial color={COLORS.idle} transparent opacity={0.7} />
        </lineSegments>
        {/* Fresnel ışıma kabuğu */}
        <mesh scale={1.05}>
          <sphereGeometry args={[1, 48, 48]} />
          <shaderMaterial
            ref={glow}
            vertexShader={glowVert}
            fragmentShader={glowFrag}
            uniforms={{ uColor: { value: new THREE.Color(COLORS.idle) }, uPower: { value: 2.4 }, uTime: { value: 0 } }}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        {/* Dönen kesikli halkalar */}
        {ringDefs.map((d, i) => (
          <group key={i} rotation={d.tilt as [number, number, number]}>
            <group ref={(el) => void (rings.current[i] = el!)}>
              <line_ geometry={ringGeos[i]}>
                <lineDashedMaterial color={COLORS.idle} dashSize={d.dash[0]} gapSize={d.dash[1]} transparent opacity={0.85 - i * 0.1} />
              </line_>
            </group>
          </group>
        ))}
        {/* Ses dalgası */}
        <line_ ref={wave} geometry={waveGeo}>
          <lineBasicMaterial color={COLORS.idle} transparent opacity={0} />
        </line_>
        {/* Sinir ağı */}
        <group ref={neural}>
          <lineSegments geometry={neuralGeo.lg}>
            <lineBasicMaterial color="#4d9dff" transparent opacity={0} blending={THREE.AdditiveBlending} />
          </lineSegments>
          <points geometry={neuralGeo.pg}>
            <pointsMaterial color="#a8f4ff" size={0.07} transparent opacity={0} />
          </points>
        </group>
      </group>
      <points ref={particles} geometry={partGeo}>
        <pointsMaterial color="#3ee8ff" size={0.025} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </>
  )
}

export default function ArcReactor() {
  const state = useJarvis((s) => s.state)
  const low = useJarvis((s) => isLowPerf(s))
  return (
    <Canvas camera={{ position: [0, 0, 6.2], fov: 50 }} dpr={low ? 1 : [1, 2]} gl={{ antialias: !low, alpha: true }}>
      <Reactor state={state} low={low} />
    </Canvas>
  )
}
