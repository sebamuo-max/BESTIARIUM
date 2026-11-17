

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Float,
  OrbitControls,
  Sparkles,
  Environment
} from '@react-three/drei'

// ---------------------------------------------
// CONFIGURACIÓN DE RUNAS
// ---------------------------------------------

const sigils = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2

  return {
    id: i,
    angle,
    position: [
      Math.cos(angle) * 2.05,
      Math.sin(angle) * 2.05,
      Math.sin(angle * 2) * 0.12
    ]
  }
})

// ---------------------------------------------
// NÚCLEO MÁGICO
// ---------------------------------------------

function CrystalCore() {
  const coreRef = useRef()
  const materialRef = useRef()

  useFrame((state) => {
    const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5

    if (coreRef.current) {
      const scale = 0.9 + pulse * 0.13
      coreRef.current.scale.setScalar(scale)
    }

    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 1.2 + pulse * 2
    }
  })

  return (
    <group>
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.43, 1]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#d9aaff"
          emissive="#a64dff"
          emissiveIntensity={2}
          metalness={0.3}
          roughness={0.15}
        />
      </mesh>

      {/* Luz interior */}
      <pointLight
        color="#b96aff"
        intensity={3}
        distance={3}
      />
    </group>
  )
}

// ---------------------------------------------
// CRISTAL PRINCIPAL
// ---------------------------------------------

function Crystal() {
  const crystalRef = useRef()

  useFrame((state, delta) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.16
      crystalRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 0.45) * 0.07
    }
  })

  return (
    <Float
      speed={1.2}
      rotationIntensity={0.12}
      floatIntensity={0.25}
    >
      <group ref={crystalRef}>

        {/* Estructura exterior */}
        <mesh scale={[0.9, 1.35, 0.9]}>
          <octahedronGeometry args={[1.1, 1]} />
          <meshPhysicalMaterial
            color="#9565d2"
            metalness={0.35}
            roughness={0.12}
            transmission={0.22}
            thickness={1.5}
            clearcoat={1}
            clearcoatRoughness={0.08}
            emissive="#38115f"
            emissiveIntensity={0.7}
          />
        </mesh>

        {/* Líneas geométricas */}
        <mesh scale={[0.92, 1.37, 0.92]}>
          <octahedronGeometry args={[1.1, 1]} />
          <meshBasicMaterial
            color="#e5c18a"
            wireframe
            transparent
            opacity={0.24}
          />
        </mesh>

        {/* Cristal interior */}
        <mesh scale={[0.48, 0.75, 0.48]}>
          <octahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#a56de8"
            emissive="#6c27a8"
            emissiveIntensity={0.9}
            metalness={0.5}
            roughness={0.2}
            transparent
            opacity={0.8}
          />
        </mesh>

        <CrystalCore />

        {/* Fragmentos flotantes */}
        {[0, 1, 2, 3].map((i) => {
          const angle = (i / 4) * Math.PI * 2

          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * 1.15,
                Math.sin(angle) * 0.85,
                Math.sin(angle) * 0.35
              ]}
              scale={0.13}
              rotation={[angle, angle, 0]}
            >
              <octahedronGeometry args={[1, 0]} />
              <meshStandardMaterial
                color="#d6a7ff"
                emissive="#8b43d0"
                emissiveIntensity={1.5}
                metalness={0.5}
                roughness={0.2}
              />
            </mesh>
          )
        })}

      </group>
    </Float>
  )
}

// ---------------------------------------------
// ANILLOS ARCANOS
// ---------------------------------------------

function MagicRings() {
  const ringsRef = useRef()

  useFrame((state, delta) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.y += delta * 0.12
      ringsRef.current.rotation.z += delta * 0.07
    }
  })

  return (
    <group ref={ringsRef}>

      {/* Anillo dorado principal */}
      <mesh rotation={[Math.PI / 2.5, 0.2, 0]}>
        <torusGeometry args={[1.8, 0.018, 8, 120]} />
        <meshStandardMaterial
          color="#e4bd78"
          emissive="#c18a3c"
          emissiveIntensity={2}
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>

      {/* Anillo violeta */}
      <mesh rotation={[0.4, Math.PI / 2.5, 0.7]}>
        <torusGeometry args={[2.05, 0.012, 8, 120]} />
        <meshStandardMaterial
          color="#b78ae8"
          emissive="#873bc5"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Anillo secundario */}
      <mesh rotation={[1.1, 0.3, 0.8]}>
        <torusGeometry args={[1.55, 0.009, 8, 120]} />
        <meshBasicMaterial
          color="#e8d3a8"
          transparent
          opacity={0.65}
        />
      </mesh>

    </group>
  )
}

// ---------------------------------------------
// RUNAS ORBITALES
// ---------------------------------------------

function ArcaneSigils() {
  const sigilsRef = useRef()

  useFrame((state, delta) => {
    if (sigilsRef.current) {
      sigilsRef.current.rotation.z += delta * 0.045
      sigilsRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.12
    }
  })

  return (
    <group ref={sigilsRef}>
      {sigils.map((sigil) => (
        <group
          key={sigil.id}
          position={sigil.position}
          rotation={[0, 0, sigil.angle]}
        >

          {/* Símbolo central */}
          <mesh>
            <octahedronGeometry args={[0.09, 0]} />
            <meshStandardMaterial
              color="#f0d5a0"
              emissive="#d49b4c"
              emissiveIntensity={2.5}
            />
          </mesh>

          {/* Marca superior */}
          <mesh position={[0, 0.16, 0]}>
            <boxGeometry args={[0.025, 0.13, 0.025]} />
            <meshBasicMaterial color="#d6b578" />
          </mesh>

          {/* Círculo rúnico */}
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.16, 0.006, 6, 32]} />
            <meshBasicMaterial
              color="#d6a85d"
              transparent
              opacity={0.65}
            />
          </mesh>

        </group>
      ))}
    </group>
  )
}

// ---------------------------------------------
// PEDESTAL Y HALO DE ENERGÍA
// ---------------------------------------------

function CrystalPedestal() {
  const haloRef = useRef()

  useFrame((state) => {
    if (haloRef.current) {
      const pulse =
        Math.sin(state.clock.elapsedTime * 1.5) * 0.5 + 0.5

      haloRef.current.material.opacity = 0.2 + pulse * 0.2
    }
  })

  return (
    <group position={[0, -1.75, 0]}>

      {/* Base */}
      <mesh>
        <cylinderGeometry args={[0.65, 0.82, 0.22, 6]} />
        <meshStandardMaterial
          color="#29202e"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Borde dorado */}
      <mesh position={[0, 0.12, 0]}>
        <torusGeometry args={[0.68, 0.025, 8, 64]} />
        <meshStandardMaterial
          color="#d9ae68"
          emissive="#a87532"
          emissiveIntensity={1.2}
          metalness={0.8}
        />
      </mesh>

      {/* Halo luminoso */}
      <mesh
        ref={haloRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.16, 0]}
      >
        <ringGeometry args={[0.85, 1.25, 64]} />
        <meshBasicMaterial
          color="#a85bfa"
          transparent
          opacity={0.3}
          side={2}
        />
      </mesh>

    </group>
  )
}

// ---------------------------------------------
// ESCENA PRINCIPAL
// ---------------------------------------------

export default function CrystalScene() {
  return (
    <div
      className="scene-wrap"
      aria-label="Cristal mágico tridimensional interactivo"
    >
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >

        {/* Iluminación ambiental */}
        <ambientLight intensity={0.4} />

        <pointLight
          position={[3, 3, 4]}
          intensity={35}
          color="#f0c987"
        />

        <pointLight
          position={[-3, -2, -2]}
          intensity={28}
          color="#994de0"
        />

        <pointLight
          position={[0, 2, -3]}
          intensity={18}
          color="#659acb"
        />

        {/* Elementos principales */}
        <Crystal />
        <MagicRings />
        <ArcaneSigils />
        <CrystalPedestal />

        {/* Partículas doradas */}
        <Sparkles
          count={100}
          scale={5}
          size={2}
          speed={0.35}
          color="#e8c78f"
        />

        {/* Partículas violetas */}
        <Sparkles
          count={55}
          scale={3.5}
          size={3}
          speed={0.65}
          color="#bd86fa"
        />

        {/* Energía ambiental */}
        <Sparkles
          count={20}
          scale={[2.5, 3, 2.5]}
          size={5}
          speed={0.8}
          color="#8d65d9"
        />

        <Environment preset="night" />

        {/* Exploración interactiva */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={4.5}
          maxDistance={8}
          autoRotate={true}
          autoRotateSpeed={0.35}
          enableDamping={true}
          dampingFactor={0.05}
        />

      </Canvas>

      <span className="scene-hint">
        ARRASTRA PARA EXPLORAR
      </span>
    </div>
  )
}
