
import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Float,
  OrbitControls,
  Sparkles,
  Environment
} from '@react-three/drei'

// Cristal principal
function Crystal() {
  const crystalRef = useRef()

  useFrame((state, delta) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.18
      crystalRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.08
    }
  })

  return (
    <Float speed={1.3} rotationIntensity={0.25} floatIntensity={0.65}>
      <group ref={crystalRef}>

        {/* Cuerpo principal del cristal */}
        <mesh>
          <icosahedronGeometry args={[1.25, 1]} />
          <meshPhysicalMaterial
            color="#9872c9"
            metalness={0.45}
            roughness={0.12}
            transmission={0.18}
            thickness={1.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive="#32134d"
            emissiveIntensity={0.45}
          />
        </mesh>

        {/* Estructura geométrica exterior */}
        <mesh scale={1.035}>
          <icosahedronGeometry args={[1.25, 1]} />
          <meshBasicMaterial
            color="#e7c58a"
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Núcleo luminoso */}
        <mesh scale={0.35}>
          <octahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#e4b8ff"
            transparent
            opacity={0.85}
          />
        </mesh>

      </group>
    </Float>
  )
}

// Anillos mágicos que rodean el cristal
function MagicRings() {
  const ringsRef = useRef()

  useFrame((state, delta) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.y += delta * 0.15
      ringsRef.current.rotation.z += delta * 0.08
    }
  })

  return (
    <group ref={ringsRef}>
      <mesh rotation={[Math.PI / 2.5, 0.2, 0]}>
        <torusGeometry args={[1.85, 0.012, 8, 100]} />
        <meshStandardMaterial
          color="#d7ad69"
          emissive="#b47b32"
          emissiveIntensity={1.5}
        />
      </mesh>

      <mesh rotation={[0.4, Math.PI / 2.5, 0.7]}>
        <torusGeometry args={[2.05, 0.008, 8, 100]} />
        <meshStandardMaterial
          color="#a982d1"
          emissive="#7541a8"
          emissiveIntensity={1.3}
        />
      </mesh>
    </group>
  )
}

// Escena principal
export default function CrystalScene() {
  return (
    <div
      className="scene-wrap"
      aria-label="Cristal mágico tridimensional interactivo"
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Iluminación */}
        <ambientLight intensity={0.65} />

        <pointLight
          position={[3, 3, 4]}
          intensity={30}
          color="#f1c47c"
        />

        <pointLight
          position={[-3, -2, -2]}
          intensity={22}
          color="#9862d1"
        />

        <pointLight
          position={[0, 2, -3]}
          intensity={15}
          color="#6b9bba"
        />

        {/* Elementos 3D */}
        <Crystal />
        <MagicRings />

        {/* Partículas mágicas */}
        <Sparkles
          count={90}
          scale={5}
          size={2.5}
          speed={0.4}
          color="#e6c58e"
        />

        <Sparkles
          count={35}
          scale={3.5}
          size={4}
          speed={0.7}
          color="#bd91ed"
        />

        <Environment preset="night" />

        {/* Controles de interacción */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3.5}
          maxDistance={7}
          autoRotate={true}
          autoRotateSpeed={0.5}
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
