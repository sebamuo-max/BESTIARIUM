import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Float,
  OrbitControls,
  Sparkles,
  Environment,
  MeshReflectorMaterial,
  Text
} from '@react-three/drei'
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise
} from '@react-three/postprocessing'
import { DoubleSide } from 'three'

// ---------------------------------------------
// AJUSTES RÁPIDOS
// ---------------------------------------------

// Paleta (cambia aquí para probar otro color: verde enfermizo, rojo sangre...)
const PALETTE = {
  bg: '#06050a',
  crystal: '#4b3a8c',
  crystalEmissive: '#2a1566',
  glow: '#9c6bff',
  glowLight: '#a77aff',
  rune: '#b7a6ff',
  torch: '#ff8a3d'
}

// Las runas usan una fuente con soporte de Futhark.
// Descarga NotoSansRunic-Regular.ttf y colócala en /public/fonts/
// Si no quieres usar runas aún, pon USE_RUNES en false.
const USE_RUNES = false
const RUNE_FONT = '/fonts/NotoSansRunic-Regular.ttf'
const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ']

// ---------------------------------------------
// UTILIDADES
// ---------------------------------------------

// Pulso irregular: mezcla de frecuencias, se siente vivo y no mecánico
const flickerAt = (t) =>
  0.6 +
  Math.sin(t * 2.1) * 0.2 +
  Math.sin(t * 5.3) * 0.1 +
  Math.sin(t * 11.7) * 0.05

// ---------------------------------------------
// CONFIGURACIÓN DE RUNAS
// ---------------------------------------------

const sigils = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2

  return {
    id: i,
    angle,
    rune: RUNES[i],
    position: [
      Math.cos(angle) * 2.05,
      Math.sin(angle) * 2.05,
      Math.sin(angle * 2) * 0.12
    ]
  }
})

// Racimo de cristales: [posición base, rotación, altura, radio]
const BASE_Y = -0.95
const cluster = [
  { pos: [0.55, BASE_Y, 0.15], rot: [0, 0, -0.35], h: 1.1, r: 0.22 },
  { pos: [-0.5, BASE_Y, 0.2], rot: [0, 0, 0.4], h: 1.3, r: 0.26 },
  { pos: [0.15, BASE_Y, -0.5], rot: [-0.4, 0, 0], h: 0.9, r: 0.2 },
  { pos: [-0.2, BASE_Y, 0.55], rot: [0.45, 0, 0], h: 0.8, r: 0.18 }
]

// ---------------------------------------------
// CRISTAL NATURAL (prisma hexagonal + punta)
// El origen está en la base del cristal.
// ---------------------------------------------

function Shard({ h, r, children, ...props }) {
  const coneH = h * 0.38

  return (
    <group {...props}>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[r, r * 1.08, h, 6]} />
        <meshPhysicalMaterial
          color={PALETTE.crystal}
          emissive={PALETTE.crystalEmissive}
          emissiveIntensity={0.7}
          metalness={0.3}
          roughness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transparent
          opacity={0.82}
          flatShading
        />
      </mesh>

      <mesh position={[0, h + coneH / 2, 0]}>
        <coneGeometry args={[r, coneH, 6]} />
        <meshPhysicalMaterial
          color={PALETTE.crystal}
          emissive={PALETTE.crystalEmissive}
          emissiveIntensity={0.9}
          metalness={0.3}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transparent
          opacity={0.85}
          flatShading
        />
      </mesh>

      {children}
    </group>
  )
}

// ---------------------------------------------
// NÚCLEO MÁGICO
// ---------------------------------------------

function CrystalCore() {
  const coreRef = useRef()
  const materialRef = useRef()
  const lightRef = useRef()

  useFrame((state) => {
    const flicker = flickerAt(state.clock.elapsedTime)

    if (coreRef.current) {
      coreRef.current.scale.setScalar(0.88 + flicker * 0.16)
    }

    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 1 + flicker * 3
    }

    if (lightRef.current) {
      lightRef.current.intensity = 1.5 + flicker * 4
    }
  })

  return (
    <group position={[0, 0.1, 0]}>
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.36, 1]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#e5d8ff"
          emissive={PALETTE.glow}
          emissiveIntensity={2}
          metalness={0.4}
          roughness={0.12}
          toneMapped={false}
        />
      </mesh>

      {/* Luz interior atada al pulso */}
      <pointLight
        ref={lightRef}
        color={PALETTE.glowLight}
        intensity={3}
        distance={4}
      />
    </group>
  )
}

// ---------------------------------------------
// RACIMO DE CRISTALES
// ---------------------------------------------

function Crystal() {
  const crystalRef = useRef()

  useFrame((state, delta) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.16
      crystalRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 0.45) * 0.05
    }
  })

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.22}>
      <group ref={crystalRef}>

        {/* Cristal principal */}
        <Shard h={1.9} r={0.5} position={[0, BASE_Y, 0]} />

        {/* Cristales secundarios */}
        {cluster.map((s, i) => (
          <Shard
            key={i}
            h={s.h}
            r={s.r}
            position={s.pos}
            rotation={s.rot}
          />
        ))}

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
              scale={0.11}
              rotation={[angle, angle, 0]}
            >
              <octahedronGeometry args={[1, 0]} />
              <meshStandardMaterial
                color="#9d90d8"
                emissive="#6a4fd0"
                emissiveIntensity={1.4}
                metalness={0.55}
                roughness={0.2}
                flatShading
              />
            </mesh>
          )
        })}

      </group>
    </Float>
  )
}

// ---------------------------------------------
// ANILLOS ARCANOS (metal desgastado)
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

      {/* Anillo de metal viejo */}
      <mesh rotation={[Math.PI / 2.5, 0.2, 0]}>
        <torusGeometry args={[1.8, 0.022, 8, 120]} />
        <meshStandardMaterial
          color="#6d6a80"
          emissive="#3d3680"
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.55}
        />
      </mesh>

      {/* Anillo violeta */}
      <mesh rotation={[0.4, Math.PI / 2.5, 0.7]}>
        <torusGeometry args={[2.05, 0.012, 8, 120]} />
        <meshStandardMaterial
          color="#7e66c8"
          emissive="#8758e8"
          emissiveIntensity={1.6}
          metalness={0.65}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>

      {/* Anillo secundario azul */}
      <mesh rotation={[1.1, 0.3, 0.8]}>
        <torusGeometry args={[1.55, 0.008, 8, 120]} />
        <meshBasicMaterial
          color="#6aa8e8"
          transparent
          opacity={0.55}
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
          rotation={[0, 0, sigil.angle - Math.PI / 2]}
        >

          {/* Círculo rúnico */}
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.17, 0.006, 6, 32]} />
            <meshBasicMaterial
              color="#7f8cd8"
              transparent
              opacity={0.65}
            />
          </mesh>

          {USE_RUNES ? (
            <Suspense fallback={null}>
              <Text
                font={RUNE_FONT}
                fontSize={0.2}
                anchorX="center"
                anchorY="middle"
              >
                {sigil.rune}
                <meshBasicMaterial
                  color={PALETTE.rune}
                  toneMapped={false}
                />
              </Text>
            </Suspense>
          ) : (
            <mesh>
              <octahedronGeometry args={[0.07, 0]} />
              <meshStandardMaterial
                color="#e0d9ff"
                emissive="#a78bfa"
                emissiveIntensity={2}
              />
            </mesh>
          )}

        </group>
      ))}
    </group>
  )
}

// ---------------------------------------------
// PEDESTAL DE PIEDRA CON GARRAS DE HIERRO
// ---------------------------------------------

const GROUND_Y = -2.05

function CrystalPedestal() {
  const haloRef = useRef()

  useFrame((state) => {
    if (haloRef.current) {
      const flicker = flickerAt(state.clock.elapsedTime)
      haloRef.current.material.opacity = 0.1 + flicker * 0.18
    }
  })

  const stone = {
    color: '#1c1a22',
    metalness: 0,
    roughness: 0.95,
    flatShading: true
  }

  const iron = {
    color: '#1a1a1f',
    metalness: 1,
    roughness: 0.55
  }

  return (
    <group position={[0, GROUND_Y, 0]}>

      {/* Escalones de piedra */}
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[1.1, 1.2, 0.18, 6]} />
        <meshStandardMaterial {...stone} />
      </mesh>

      <mesh position={[0, 0.27, 0]}>
        <cylinderGeometry args={[0.85, 0.95, 0.18, 6]} />
        <meshStandardMaterial {...stone} color="#201e28" />
      </mesh>

      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.6, 0.72, 0.2, 6]} />
        <meshStandardMaterial {...stone} color="#252230" />
      </mesh>

      {/* Borde violeta tenue */}
      <mesh position={[0, 0.57, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.016, 6, 6]} />
        <meshStandardMaterial
          color="#7e66c8"
          emissive="#7954d6"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>

      {/* Garras de hierro */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2
        const radius = 0.68

        return (
          <group
            key={i}
            position={[Math.cos(a) * radius, 1.0, Math.sin(a) * radius]}
            rotation={[0, -a, 0]}
          >
            {/* Inclinada hacia el centro */}
            <mesh rotation={[0, 0, 0.2]}>
              <coneGeometry args={[0.05, 0.9, 5]} />
              <meshStandardMaterial {...iron} />
            </mesh>
          </group>
        )
      })}

      {/* Banda de hierro hexagonal */}
      <mesh position={[0, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.04, 6, 6]} />
        <meshStandardMaterial {...iron} />
      </mesh>

      {/* Halo luminoso en el suelo */}
      <mesh
        ref={haloRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <ringGeometry args={[1.25, 1.9, 64]} />
        <meshBasicMaterial
          color="#8a73f0"
          transparent
          opacity={0.2}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>

    </group>
  )
}

// ---------------------------------------------
// SUELO OSCURO REFLECTANTE
// ---------------------------------------------

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GROUND_Y - 0.01, 0]}>
      <planeGeometry args={[30, 30]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={512}
        mixBlur={1}
        mixStrength={6}
        roughness={1}
        depthScale={1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#0b0a10"
        metalness={0.6}
        mirror={0}
      />
    </mesh>
  )
}

// ---------------------------------------------
// LUZ DE ANTORCHA (cálida, parpadeante)
// ---------------------------------------------

function TorchLight() {
  const ref = useRef()

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime + 40
      ref.current.intensity = 8 + flickerAt(t * 1.3) * 5
    }
  })

  return (
    <pointLight
      ref={ref}
      position={[-4, 0.5, 2]}
      intensity={10}
      color={PALETTE.torch}
      distance={9}
    />
  )
}

// ---------------------------------------------
// BRASAS ASCENDENTES
// ---------------------------------------------

function Embers({ count = 40 }) {
  const pointsRef = useRef()

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 5
      positions[i * 3 + 1] = Math.random() * 5 - 2
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5
      speeds[i] = 0.15 + Math.random() * 0.3
    }

    return { positions, speeds }
  }, [count])

  useFrame((state, delta) => {
    if (!pointsRef.current) return

    const attr = pointsRef.current.geometry.attributes.position

    for (let i = 0; i < count; i++) {
      let y = attr.array[i * 3 + 1] + speeds[i] * delta
      const t = state.clock.elapsedTime

      attr.array[i * 3] += Math.sin(t * 0.8 + i) * delta * 0.05

      if (y > 3) y = -2

      attr.array[i * 3 + 1] = y
    }

    attr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ff9a4d"
        size={0.04}
        transparent
        opacity={0.8}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
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
        gl={{ antialias: true }}
      >

        {/* Atmósfera */}
        <color attach="background" args={[PALETTE.bg]} />
        <fog attach="fog" args={[PALETTE.bg, 5, 13]} />

        {/* Iluminación: poca luz ambiental, contraste fuerte */}
        <ambientLight intensity={0.08} />

        <pointLight
          position={[3, 3, 4]}
          intensity={10}
          color="#c4b5fd"
        />

        <pointLight
          position={[-3, -2, -2]}
          intensity={9}
          color="#8659e8"
        />

        <pointLight
          position={[0, 2, -3]}
          intensity={6}
          color="#72baff"
        />

        <TorchLight />

        {/* Elementos principales */}
        <Crystal />
        <MagicRings />
        <ArcaneSigils />
        <CrystalPedestal />
        <Floor />

        {/* Brasas cálidas */}
        <Embers count={40} />

        {/* Pocas partículas mágicas, lentas */}
        <Sparkles
          count={30}
          scale={5}
          size={2}
          speed={0.25}
          color="#9aa8e8"
        />

        <Sparkles
          count={18}
          scale={3.5}
          size={3}
          speed={0.4}
          color="#a07cf0"
        />

        <Environment preset="night" environmentIntensity={0.25} />

        {/* Exploración interactiva */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={4.5}
          maxDistance={8}
          maxPolarAngle={Math.PI / 1.9}
          autoRotate={true}
          autoRotateSpeed={0.35}
          enableDamping={true}
          dampingFactor={0.05}
        />

        {/* Postprocesado: bloom + viñeta + grano */}
        <EffectComposer>
          <Bloom
            intensity={1.1}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.2}
            mipmapBlur
          />
          <Vignette offset={0.25} darkness={0.9} />
          <Noise opacity={0.05} />
        </EffectComposer>

      </Canvas>

      <span className="scene-hint">
        ARRASTRA PARA EXPLORAR
      </span>
    </div>
  )
}