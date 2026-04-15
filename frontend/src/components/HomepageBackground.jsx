import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Real constellation data [name, [[x,y,z], ...nodes], [[a,b], ...edges]]
const CONSTELLATIONS = [
  {
    nodes: [
      [-22, 10, -20], [-18, 14, -20], [-14, 11, -20],
      [-10, 15, -20], [-6, 12, -20], [-2, 16, -20],
    ],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5]],
  },
  {
    nodes: [
      [8, 12, -20], [12, 8, -20], [16, 11, -20],
      [20, 7, -20], [18, 4, -20], [14, 5, -20],
    ],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,1]],
  },
  {
    nodes: [
      [-24, -8, -20], [-20, -5, -20], [-16, -9, -20],
      [-12, -5, -20], [-8, -8, -20],
    ],
    edges: [[0,1],[1,2],[2,3],[3,4]],
  },
  {
    nodes: [
      [6, -6, -20], [10, -3, -20], [14, -7, -20],
      [12, -11, -20], [8, -11, -20],
    ],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,0]],
  },
  {
    nodes: [
      [-4, -2, -20], [0, 2, -20], [4, -1, -20],
      [2, -5, -20], [-2, -5, -20],
    ],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,0],[0,2]],
  },
]

// Realistic star field with varying brightness
function StarField() {
  const ref = useRef()
  const count = 3500

  const { positions, opacities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const opacities = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      // distribute on a sphere shell for realism
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 80 + Math.random() * 40
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
      opacities[i] = 0.3 + Math.random() * 0.7
    }
    return { positions, opacities }
  }, [])

  // twinkle offsets per star
  const twinkleOffsets = useMemo(() => new Float32Array(count).map(() => Math.random() * Math.PI * 2), [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    // very slow rotation like real sky
    ref.current.rotation.y = t * 0.003
    ref.current.rotation.x = t * 0.001
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.22}
        sizeAttenuation
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Brighter foreground stars that twinkle individually
function TwinkleStars() {
  const meshRefs = useRef([])
  const count = 120

  const stars = useMemo(() => Array.from({ length: count }, () => ({
    pos: new THREE.Vector3(
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 60,
      -10 - Math.random() * 30
    ),
    offset: Math.random() * Math.PI * 2,
    speed: 0.8 + Math.random() * 1.5,
    baseSize: 0.03 + Math.random() * 0.08,
  })), [])

  useFrame(({ clock }) => {
    stars.forEach((star, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh) return
      const t = clock.elapsedTime * star.speed + star.offset
      const scale = star.baseSize * (0.6 + Math.abs(Math.sin(t)) * 0.8)
      mesh.scale.setScalar(scale)
      mesh.material.opacity = 0.15 + Math.abs(Math.sin(t)) * 0.3
    })
  })

  return (
    <>
      {stars.map((star, i) => (
        <mesh key={i} ref={el => meshRefs.current[i] = el} position={star.pos}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial color="#ffffff" transparent blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </>
  )
}

// Constellation lines + star nodes
function Constellations() {
  const groupRef = useRef()

  const { lineGeo, dotPositions } = useMemo(() => {
    const linePoints = []
    const dotPos = []

    CONSTELLATIONS.forEach(({ nodes, edges }) => {
      edges.forEach(([a, b]) => {
        linePoints.push(new THREE.Vector3(...nodes[a]))
        linePoints.push(new THREE.Vector3(...nodes[b]))
      })
      nodes.forEach(n => dotPos.push(...n))
    })

    return {
      lineGeo: new THREE.BufferGeometry().setFromPoints(linePoints),
      dotPositions: new Float32Array(dotPos),
    }
  }, [])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.003
      groupRef.current.rotation.x = clock.elapsedTime * 0.001
    }
  })

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial
          color="#a0c8ff"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dotPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#c8e0ff"
          size={0.25}
          sizeAttenuation
          transparent
          opacity={0.25}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

// Shooting stars
function ShootingStars() {
  const MAX = 6
  const streaks = useRef(Array.from({ length: MAX }, () => ({ active: false, t: 0, next: Math.random() * 4 })))
  const meshRefs = useRef([])

  const makeStart = () => new THREE.Vector3(
    (Math.random() - 0.5) * 80,
    10 + Math.random() * 20,
    -5 - Math.random() * 15
  )
  const makeDir = () => new THREE.Vector3(
    -(0.4 + Math.random() * 0.6),
    -(0.3 + Math.random() * 0.4),
    0
  ).normalize()

  useFrame(({ clock }, delta) => {
    streaks.current.forEach((s, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh) return

      if (!s.active) {
        s.next -= delta
        if (s.next <= 0) {
          s.active = true
          s.t = 0
          s.start = makeStart()
          s.dir = makeDir()
          s.length = 3 + Math.random() * 5
          s.speed = 18 + Math.random() * 14
          mesh.visible = true
        }
        return
      }

      s.t += delta
      const dist = s.t * s.speed
      const head = s.start.clone().addScaledVector(s.dir, dist)
      mesh.position.copy(head)

      // orient along direction
      const angle = Math.atan2(s.dir.y, s.dir.x)
      mesh.rotation.z = angle

      // fade in/out
      const life = s.t / (s.length / s.speed)
      mesh.material.opacity = life < 0.1
        ? life / 0.1
        : life > 0.7
          ? 1 - (life - 0.7) / 0.3
          : 1

      if (life >= 1) {
        s.active = false
        s.next = 1.5 + Math.random() * 5
        mesh.visible = false
      }
    })
  })

  return (
    <>
      {Array.from({ length: MAX }, (_, i) => (
        <mesh key={i} ref={el => meshRefs.current[i] = el} visible={false}>
          <planeGeometry args={[4, 0.04]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}

// Subtle nebula glow blobs
function Nebula() {
  const blobs = useMemo(() => [
    { pos: [-20, 8, -40], color: '#000000', scale: 18 },
    { pos: [18, -6, -40], color: '#000000', scale: 14 },
    { pos: [-5, -14, -40], color: '#000000', scale: 12 },
  ], [])

  return (
    <>
      {blobs.map((b, i) => (
        <mesh key={i} position={b.pos}>
          <sphereGeometry args={[b.scale, 16, 16]} />
          <meshBasicMaterial color={b.color} transparent opacity={0} side={THREE.BackSide} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <Nebula />
      <StarField />
      <TwinkleStars />
      <Constellations />
      <ShootingStars />
    </>
  )
}

export default function HomepageBackground() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 20], fov: 75 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
