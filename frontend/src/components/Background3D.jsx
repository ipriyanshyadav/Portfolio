import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial, Float, MeshTransmissionMaterial, Environment } from '@react-three/drei'
import * as THREE from 'three'

const particleCount = 2000
const shapeCount = 12

function ParticleField() {
  const ref = useRef()

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const col = new Float32Array(particleCount * 3)
    const color = new THREE.Color()

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50

      color.setHSL(Math.random() * 0.2 + 0.5, 0.7, 0.6)
      col[i * 3] = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b
    }

    return [pos, col]
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.02
      ref.current.rotation.y = state.clock.elapsedTime * 0.03
    }
  })

  return (
    <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.04}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

function GlassShape({ position, geometry, speed, colorShift }) {
  const meshRef = useRef()
  const { viewport, mouse } = useThree()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed) * 0.3
      meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * speed * 0.8) * 0.3

      const targetX = (mouse.x * viewport.width * 0.3)
      const targetY = (mouse.y * viewport.height * 0.3)

      meshRef.current.position.x += (position[0] + targetX - meshRef.current.position.x) * 0.02
      meshRef.current.position.y += (position[1] + targetY - meshRef.current.position.y) * 0.02
    }
  })

  const hue = useRef(Math.random())

  useFrame((state) => {
    hue.current = (hue.current + 0.001) % 1
    if (meshRef.current?.material) {
      meshRef.current.material.color.setHSL(
        hue.current * 0.3 + colorShift,
        0.6,
        0.5
      )
      meshRef.current.material.emissive.setHSL(
        hue.current * 0.3 + colorShift,
        0.8,
        0.2
      )
    }
  })

  return (
    <Float speed={speed} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        {geometry}
        <MeshTransmissionMaterial
          transmission={0.95}
          thickness={0.5}
          roughness={0.05}
          chromaticAberration={0.03}
          backside={true}
          samples={4}
          resolution={256}
        />
      </mesh>
    </Float>
  )
}

function Scene() {
  const { mouse } = useThree()

  const shapes = useMemo(() => {
    const geometries = [
      <sphereGeometry args={[0.6, 32, 32]} />,
      <torusGeometry args={[0.4, 0.15, 16, 32]} />,
      <boxGeometry args={[0.7, 0.7, 0.7]} />,
      <octahedronGeometry args={[0.5]} />,
      <icosahedronGeometry args={[0.5]} />,
    ]

    return Array.from({ length: shapeCount }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6 - 3,
      ],
      geometry: geometries[i % geometries.length],
      speed: 0.5 + Math.random() * 0.5,
      colorShift: Math.random() * 0.3,
    }))
  }, [])

  return (
    <>
      <color attach="background" args={['#0a0a0f']} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#6366f1" />
      <pointLight position={[10, -10, 5]} intensity={0.3} color="#ec4899" />

      <ParticleField />

      {shapes.map((shape) => (
        <GlassShape key={shape.id} {...shape} />
      ))}

      <MouseParallax mouse={mouse} />
    </>
  )
}

function MouseParallax({ mouse }) {
  const groupRef = useRef()

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = mouse.y * 0.05
      groupRef.current.rotation.y = mouse.x * 0.05
    }
  })

  return <group ref={groupRef} />
}

export default function Background3D() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: -1,
      pointerEvents: 'none',
    }}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
