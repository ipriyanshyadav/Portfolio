import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

const starCount = 300

function Stars() {
  const ref = useRef()

  const [positions] = useMemo(() => {
    const pos = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100
    }
    return [pos]
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.01
    }
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

function ShootingStars() {
  const groupRef = useRef()
  const starsRef = useRef([])

  const shootingStars = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      startX: (Math.random() - 0.5) * 50,
      startY: Math.random() * 20 + 10,
      speed: 0.5 + Math.random() * 0.5,
      offset: Math.random() * 5,
    }))
  }, [])

  useFrame((state) => {
    shootingStars.forEach((star, i) => {
      if (starsRef.current[i]) {
        const t = ((state.clock.elapsedTime * star.speed + star.offset) % 8) / 8
        starsRef.current[i].position.x = star.startX + t * 30
        starsRef.current[i].position.y = star.startY - t * 40
        starsRef.current[i].material.opacity = t < 0.8 ? 1 - t : 0
      }
    })
  })

  return (
    <>
      <Stars />
      {shootingStars.map((star, i) => (
        <mesh
          key={star.id}
          ref={(el) => (starsRef.current[i] = el)}
          position={[star.startX, star.startY, -10]}
        >
          <planeGeometry args={[0.1, 2]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={1}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  )
}

export default function ShootingStarsBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        background: '#000000',
      }}
    >
      <Canvas camera={{ position: [0, 0, 30], fov: 60 }} dpr={[1, 2]}>
        <ShootingStars />
      </Canvas>
    </div>
  )
}
