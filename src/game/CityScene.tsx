import React, { useMemo, useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import {
  ArrowLeft,
  Database,
  Trophy,
  TrendingUp,
  HelpCircle,
  Navigation,
  Sun,
  Moon,
  Code2,
  Calendar,
  Layers,
} from 'lucide-react'
import * as THREE from 'three'
import type { CityUserData, SubmissionCell } from '../services/api'
import { Car } from './Car'
import type { CollisionBox } from './Car'
import { RoadNetwork } from './RoadNetwork'
import { audioManager } from '../services/audio'

interface CitySceneProps {
  userData: CityUserData
  onBack: () => void
}

const SPACING_X = 2.4
const SPACING_Z = 2.0

/**
 * Maps problem solve/commit count to building dimensions, color, and labels.
 */
function getBuildingProps(count: number, platform: 'leetcode' | 'github'): {
  height: number
  width: number
  depth: number
  color: string
  label: string
} {
  if (count <= 0) {
    return {
      height: 0.05,
      width: 0.9,
      depth: 0.9,
      color: '#1e293b',
      label: 'Empty Lot',
    }
  } else if (count <= 2) {
    return {
      height: 1.5,
      width: 1.0,
      depth: 1.0,
      color: platform === 'leetcode' ? '#10b981' : '#10b981', // Emerald / Bronze Tier
      label: platform === 'leetcode' ? 'Bronze Tech Lab' : 'Small Building',
    }
  } else if (count <= 5) {
    return {
      height: 3.5,
      width: 1.1,
      depth: 1.1,
      color: platform === 'leetcode' ? '#0ea5e9' : '#3b82f6', // Sky Blue / Silver Tier
      label: platform === 'leetcode' ? 'Silver Engineering Hub' : 'Medium Building',
    }
  } else if (count <= 9) {
    return {
      height: 7.2,
      width: 1.25,
      depth: 1.25,
      color: platform === 'leetcode' ? '#8b5cf6' : '#8b5cf6', // Violet / Gold Tier
      label: platform === 'leetcode' ? 'Gold Algo High-Rise' : 'Skyscraper',
    }
  } else {
    return {
      height: 14.5,
      width: 1.45,
      depth: 1.45,
      color: platform === 'leetcode' ? '#f43f5e' : '#ec4899', // Rose/Pink Mega Tower
      label: platform === 'leetcode' ? 'Diamond Grand Citadel' : 'Mega Tower',
    }
  }
}

/**
 * Warning light on top of spires (Mega Towers)
 */
const WarningBeacon: React.FC<{ posY: number }> = ({ posY }) => {
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame((state) => {
    if (materialRef.current) {
      const pulse = Math.sin(state.clock.getElapsedTime() * 9) * 0.5 + 0.5
      materialRef.current.opacity = pulse > 0.4 ? 1.0 : 0.15
    }
  })

  return (
    <mesh position={[0, posY, 0]}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshBasicMaterial ref={materialRef} color="#ef4444" transparent />
    </mesh>
  )
}

interface BuildingProps {
  cell: SubmissionCell
  platform: 'leetcode' | 'github'
  isNight: boolean
  windowTexture: THREE.Texture
  isHovered: boolean
  onHover: (cell: SubmissionCell | null) => void
  onSelect: (cell: SubmissionCell) => void
}

/**
 * Procedural Building Mesh with architectural variations by tier
 */
const Building: React.FC<BuildingProps> = ({
  cell,
  platform,
  isNight,
  windowTexture,
  isHovered,
  onHover,
  onSelect,
}) => {
  const rand = useMemo(() => {
    const val = Math.sin(cell.x * 12.9898 + cell.z * 78.233) * 43758.5453
    return val - Math.floor(val)
  }, [cell.x, cell.z])

  const { height: baseHeight, width, depth, color } = getBuildingProps(cell.count, platform)

  const posX = (cell.x - 26) * SPACING_X
  const posZ = cell.z <= 2 ? cell.z * SPACING_Z - 7.0 : cell.z * SPACING_Z - 5.0
  const isPad = cell.count <= 0

  const height = isPad ? baseHeight : baseHeight * (0.85 + rand * 0.3)
  const posY = 0.08 + height / 2

  const tiledTexture = useMemo(() => {
    if (isPad) return null
    const tex = windowTexture.clone()
    tex.repeat.set(Math.max(1, Math.round(width * 2.5)), Math.max(1, Math.round(height * 0.8)))
    tex.needsUpdate = true
    return tex
  }, [windowTexture, width, height, isPad])

  const emissiveColor = isHovered
    ? '#38bdf8'
    : isNight
    ? '#ffeaa7'
    : '#000000'
  const emissiveIntensity = isHovered ? 2.5 : isNight ? 1.5 : 0.0

  const renderBuildingMesh = () => {
    if (isPad) return null

    // Mega Tower
    if (cell.count > 9) {
      const bottomHeight = height * 0.65
      const topHeight = height * 0.35
      const topWidth = width * 0.7
      const topDepth = depth * 0.7

      const bottomY = 0.08 + bottomHeight / 2
      const topY = 0.08 + bottomHeight + topHeight / 2
      const spireHeight = 2.2
      const spireY = 0.08 + bottomHeight + topHeight + spireHeight / 2
      const beaconY = spireHeight / 2

      return (
        <group>
          <mesh position={[posX, bottomY, posZ]} castShadow receiveShadow>
            <boxGeometry args={[width, bottomHeight, depth]} />
            <meshStandardMaterial
              color={color}
              roughness={0.15}
              metalness={0.85}
              emissiveMap={tiledTexture || undefined}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
          <mesh position={[posX, topY, posZ]} castShadow receiveShadow>
            <boxGeometry args={[topWidth, topHeight, topDepth]} />
            <meshStandardMaterial
              color={color}
              roughness={0.15}
              metalness={0.85}
              emissiveMap={tiledTexture || undefined}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
          <mesh position={[posX, spireY, posZ]} castShadow>
            <cylinderGeometry args={[0.015, 0.035, spireHeight, 8]} />
            <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.9} />
          </mesh>
          <group position={[posX, spireY, posZ]}>
            <WarningBeacon posY={beaconY} />
          </group>
        </group>
      )
    }

    // Skyscraper
    if (cell.count >= 6) {
      const bottomHeight = height * 0.75
      const topHeight = height * 0.25
      const topWidth = width * 0.75
      const topDepth = depth * 0.75

      const bottomY = 0.08 + bottomHeight / 2
      const topY = 0.08 + bottomHeight + topHeight / 2

      return (
        <group>
          <mesh position={[posX, bottomY, posZ]} castShadow receiveShadow>
            <boxGeometry args={[width, bottomHeight, depth]} />
            <meshStandardMaterial
              color={color}
              roughness={0.15}
              metalness={0.85}
              emissiveMap={tiledTexture || undefined}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
          <mesh position={[posX, topY, posZ]} castShadow receiveShadow>
            <boxGeometry args={[topWidth, topHeight, topDepth]} />
            <meshStandardMaterial
              color={color}
              roughness={0.15}
              metalness={0.85}
              emissiveMap={tiledTexture || undefined}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
          {/* Vertical neon facade strips */}
          <mesh position={[posX, bottomY, posZ + depth / 2 + 0.01]}>
            <boxGeometry args={[0.08, bottomHeight * 0.7, 0.01]} />
            <meshBasicMaterial color={isNight ? '#38bdf8' : '#0284c7'} />
          </mesh>
          <mesh position={[posX, bottomY, posZ - depth / 2 - 0.01]}>
            <boxGeometry args={[0.08, bottomHeight * 0.7, 0.01]} />
            <meshBasicMaterial color={isNight ? '#38bdf8' : '#0284c7'} />
          </mesh>
        </group>
      )
    }

    // Medium Building
    if (cell.count >= 3) {
      const hvacX = posX + (rand * 0.2 - 0.1)
      const hvacZ = posZ + (rand * 0.2 - 0.1)

      return (
        <group>
          <mesh position={[posX, posY, posZ]} castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial
              color={color}
              roughness={0.2}
              metalness={0.8}
              emissiveMap={tiledTexture || undefined}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
          {rand > 0.4 ? (
            <mesh position={[hvacX, posY + height / 2 + 0.15, hvacZ]} castShadow>
              <boxGeometry args={[0.3, 0.25, 0.3]} />
              <meshStandardMaterial color="#475569" roughness={0.6} metalness={0.4} />
            </mesh>
          ) : (
            <mesh position={[posX, posY + height / 2 + 0.05, posZ]}>
              <boxGeometry args={[width * 0.85, 0.1, depth * 0.85]} />
              <meshStandardMaterial color="#1e293b" roughness={0.7} />
            </mesh>
          )}
        </group>
      )
    }

    // Small Building
    return (
      <mesh position={[posX, posY, posZ]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.75}
          emissiveMap={tiledTexture || undefined}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
    )
  }

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(cell)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        onHover(null)
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(cell)
      }}
    >
      {/* Sidewalk Slab */}
      <mesh position={[posX, 0.04, posZ]} receiveShadow>
        <boxGeometry args={[1.4, 0.08, 1.4]} />
        <meshStandardMaterial
          color={isHovered ? '#4338ca' : isPad ? '#1e293b' : '#334155'}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      {renderBuildingMesh()}
    </group>
  )
}

/**
 * Illuminated Streetlight along the main Avenue
 */
const Streetlight: React.FC<{
  posX: number
  posZ: number
  isNorthSide: boolean
  isNight: boolean
}> = ({ posX, posZ, isNorthSide, isNight }) => {
  const rotationY = isNorthSide ? 0 : Math.PI

  return (
    <group position={[posX, 0.08, posZ]} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 2.7, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.8} />
      </mesh>
      <mesh position={[0.2, 2.7, 0]}>
        <boxGeometry args={[0.4, 0.06, 0.06]} />
        <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.8} />
      </mesh>
      <mesh position={[0.4, 2.65, 0]}>
        <boxGeometry args={[0.12, 0.08, 0.12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.4, 2.6, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color={isNight ? '#fef08a' : '#64748b'} />
      </mesh>
      <pointLight
        position={[0.4, 2.5, 0]}
        intensity={isNight ? 0.8 : 0.0}
        distance={7}
        color="#fef08a"
        castShadow={false}
      />
    </group>
  )
}

/**
 * FPS Counter
 */
const FPSCounter: React.FC = () => {
  const [fps, setFps] = useState(60)

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let frameId: number

    const tick = () => {
      frameCount++
      const now = performance.now()
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)))
        frameCount = 0
        lastTime = now
      }
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [])

  return (
    <div className="absolute top-3 right-16 sm:top-auto sm:bottom-6 sm:right-6 z-10 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-md backdrop-blur-md flex items-center gap-1.5 text-[11px] sm:text-xs font-mono select-none pointer-events-auto">
      <div
        className={`w-2 h-2 rounded-full ${
          fps >= 55 ? 'bg-emerald-500' : fps >= 30 ? 'bg-amber-500' : 'bg-rose-500'
        } animate-pulse`}
      />
      <span className="text-slate-400">FPS:</span>
      <span className="font-bold text-white">{fps}</span>
    </div>
  )
}

/**
 * Atmospheric Skybox Gradient Shader
 */
const SkyGradient: React.FC<{ isNight: boolean }> = ({ isNight }) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null)

  const dayHorizon = useMemo(() => new THREE.Color('#e0f2fe'), [])
  const dayMid = useMemo(() => new THREE.Color('#7dd3fc'), [])
  const dayZenith = useMemo(() => new THREE.Color('#0284c7'), [])

  const nightHorizon = useMemo(() => new THREE.Color('#020617'), [])
  const nightMid = useMemo(() => new THREE.Color('#0f172a'), [])
  const nightZenith = useMemo(() => new THREE.Color('#1e293b'), [])

  const uniforms = useMemo(
    () => ({
      colorHorizon: { value: new THREE.Color(isNight ? '#020617' : '#e0f2fe') },
      colorMid: { value: new THREE.Color(isNight ? '#0f172a' : '#7dd3fc') },
      colorZenith: { value: new THREE.Color(isNight ? '#1e293b' : '#0284c7') },
    }),
    []
  )

  useFrame((_, delta) => {
    if (shaderRef.current) {
      const dt = Math.min(delta, 0.1)
      const targetHorizon = isNight ? nightHorizon : dayHorizon
      const targetMid = isNight ? nightMid : dayMid
      const targetZenith = isNight ? nightZenith : dayZenith

      shaderRef.current.uniforms.colorHorizon.value.lerp(targetHorizon, 4.0 * dt)
      shaderRef.current.uniforms.colorMid.value.lerp(targetMid, 4.0 * dt)
      shaderRef.current.uniforms.colorZenith.value.lerp(targetZenith, 4.0 * dt)
    }
  })

  return (
    <mesh scale={[180, 180, 180]}>
      <sphereGeometry args={[1, 32, 16]} />
      <shaderMaterial
        ref={shaderRef}
        side={THREE.BackSide}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vPosition;
          void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 colorHorizon;
          uniform vec3 colorMid;
          uniform vec3 colorZenith;
          varying vec3 vPosition;
          void main() {
            float h = normalize(vPosition).y;
            vec3 finalColor;
            if (h < 0.0) {
              finalColor = colorHorizon;
            } else if (h < 0.4) {
              float t = h / 0.4;
              finalColor = mix(colorHorizon, colorMid, t);
            } else {
              float t = clamp((h - 0.4) / 0.6, 0.0, 1.0);
              finalColor = mix(colorMid, colorZenith, t);
            }
            gl_FragColor = vec4(finalColor, 1.0);
          }
        `}
      />
    </mesh>
  )
}

interface CloudData {
  id: number
  x: number
  y: number
  z: number
  scale: number
  speed: number
}

const Cloud: React.FC<{ data: CloudData; isNight: boolean }> = ({ data, isNight }) => {
  const ref = useRef<THREE.Group>(null)
  const posX = useRef(data.x)
  const currentOpacity = useRef(isNight ? 0.05 : 0.85)

  useFrame((_, delta) => {
    if (!ref.current) return
    const dt = Math.min(delta, 0.1)

    posX.current += data.speed * dt
    if (posX.current > 85) {
      posX.current = -85
    }
    ref.current.position.x = posX.current

    const targetOpacity = isNight ? 0.05 : 0.85
    currentOpacity.current = THREE.MathUtils.lerp(currentOpacity.current, targetOpacity, 4.0 * dt)

    ref.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
        if (mat) {
          mat.opacity = currentOpacity.current
        }
      }
    })
  })

  const initialOpacity = isNight ? 0.05 : 0.85

  return (
    <group ref={ref} position={[data.x, data.y, data.z]} scale={[data.scale, data.scale, data.scale]}>
      <mesh castShadow>
        <boxGeometry args={[4.5, 1.0, 3.2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} metalness={0.0} transparent opacity={initialOpacity} />
      </mesh>
      <mesh position={[-2.0, -0.1, 0.2]} castShadow>
        <boxGeometry args={[2.8, 0.8, 2.4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} metalness={0.0} transparent opacity={initialOpacity} />
      </mesh>
      <mesh position={[2.0, -0.15, -0.2]} castShadow>
        <boxGeometry args={[2.4, 0.7, 2.0]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} metalness={0.0} transparent opacity={initialOpacity} />
      </mesh>
    </group>
  )
}

const Clouds: React.FC<{ isNight: boolean }> = ({ isNight }) => {
  const cloudList = useMemo<CloudData[]>(() => {
    const list: CloudData[] = []
    const count = 12
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        x: Math.random() * 160 - 80,
        y: 22 + Math.random() * 12,
        z: Math.random() * 160 - 80,
        scale: 0.7 + Math.random() * 1.5,
        speed: 0.3 + Math.random() * 0.9,
      })
    }
    return list
  }, [])

  return (
    <group>
      {cloudList.map((data) => (
        <Cloud key={data.id} data={data} isNight={isNight} />
      ))}
    </group>
  )
}

/**
 * Procedural Starfield
 */
const ProceduralStars: React.FC<{ isNight: boolean; visible: boolean }> = ({ isNight, visible }) => {
  const pointsRef = useRef<THREE.Points>(null)

  const starTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)')
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.85)')
      gradient.addColorStop(0.5, 'rgba(224, 242, 254, 0.4)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 32, 32)
    }
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [])

  const [positions, colors] = useMemo(() => {
    const count = 1000
    const pos = new Float32Array(count * 3)
    const cols = new Float32Array(count * 3)

    const palette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#e0f2fe'),
      new THREE.Color('#fef08a'),
      new THREE.Color('#c7d2fe'),
    ]

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * 2.0 * Math.PI
      const phi = Math.random() * (Math.PI * 0.45)
      const r = 140 + Math.random() * 15

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.cos(phi)
      const z = r * Math.sin(phi) * Math.sin(theta)

      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z

      const baseColor = palette[Math.floor(Math.random() * palette.length)]
      const brightness = 0.6 + Math.random() * 0.4
      cols[i * 3] = baseColor.r * brightness
      cols[i * 3 + 1] = baseColor.g * brightness
      cols[i * 3 + 2] = baseColor.b * brightness
    }

    return [pos, cols]
  }, [])

  useFrame((state) => {
    if (!pointsRef.current || !isNight || !visible) return
    const time = state.clock.getElapsedTime()
    const material = pointsRef.current.material as THREE.PointsMaterial
    material.opacity = 0.75 + Math.sin(time * 1.8) * 0.2
  })

  return (
    <points ref={pointsRef} visible={isNight && visible}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={starTexture}
        size={2.8}
        sizeAttenuation={true}
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </points>
  )
}

/**
 * Cinematic Drone Sweep Camera
 */
const CinematicCamera: React.FC = () => {
  const { camera } = useThree()
  const currentLookTarget = useRef<THREE.Vector3 | null>(null)

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()
    const pathDuration = 12
    const pathIdx = Math.floor(time / pathDuration) % 3
    const localTime = time % pathDuration
    const dt = Math.min(delta, 0.1)

    const targetPos = new THREE.Vector3()
    const targetLook = new THREE.Vector3()

    if (pathIdx === 0) {
      // Avenue Glide
      const progress = localTime / pathDuration
      const startX = -65
      const endX = 65
      const x = startX + progress * (endX - startX)
      targetPos.set(x, 4.5, 6.5)
      targetLook.set(x + 18, 1.8, -1.0)
    } else if (pathIdx === 1) {
      // Orbit Overview
      const angle = localTime * 0.18
      const radiusX = 65
      const radiusZ = 38
      const x = Math.sin(angle) * radiusX
      const z = Math.cos(angle) * radiusZ
      targetPos.set(x, 22.0, z)
      targetLook.set(0, 3.0, 0)
    } else {
      // Skyline Sweep
      const progress = localTime / pathDuration
      const startX = 55
      const endX = -55
      const x = startX + progress * (endX - startX)
      const z = 26 - Math.sin(progress * Math.PI) * 10
      targetPos.set(x, 16.0 + Math.cos(progress * Math.PI) * 4.0, z)
      targetLook.set(x - 12, 3.5, -3.5)
    }

    camera.position.lerp(targetPos, 2.5 * dt)

    if (!currentLookTarget.current) {
      currentLookTarget.current = targetLook.clone()
    } else {
      currentLookTarget.current.lerp(targetLook, 2.5 * dt)
    }
    camera.lookAt(currentLookTarget.current)
  })

  return null
}

export const CityScene: React.FC<CitySceneProps> = ({ userData, onBack }) => {
  const [cameraMode, setCameraMode] = useState<'drive' | 'orbit' | 'cinematic'>('drive')
  const [isNight, setIsNight] = useState(true)
  const [cloudsVisible, setCloudsVisible] = useState(true)
  const [fogEnabled, setFogEnabled] = useState(true)
  const [starsVisible, setStarsVisible] = useState(true)
  const [uiHidden, setUiHidden] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [isMuted, setIsMuted] = useState(() => audioManager.getMuted())
  const [inspectedCell, setInspectedCell] = useState<SubmissionCell | null>(null)
  const [hoveredCell, setHoveredCell] = useState<SubmissionCell | null>(null)
  const [mobileStatsOpen, setMobileStatsOpen] = useState(false)

  useEffect(() => {
    audioManager.init('/music.mp3')
    audioManager.play()

    const timer = setTimeout(() => {
      setShowIntro(false)
    }, 4500)

    return () => {
      clearTimeout(timer)
      audioManager.pause()
    }
  }, [])

  const toggleMute = () => {
    const nextMute = !isMuted
    audioManager.setMute(nextMute)
    setIsMuted(nextMute)
  }

  // 64x64 window grid canvas texture
  const windowTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, 64, 64)

      ctx.fillStyle = '#ffffff'
      const size = 6
      const gap = 6
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          ctx.fillRect(gap + c * (size + gap), gap + r * (size + gap), size, size)
        }
      }
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    return texture
  }, [])

  const streetlightPositions = useMemo(() => {
    const list = []
    for (let x = 0; x <= 52; x += 4) {
      list.push((x - 26) * SPACING_X)
    }
    return list
  }, [])

  // Left and Right connecting boulevards streetlights
  const connectorStreetlights = useMemo(() => {
    const list: { x: number; z: number; isNorthSide: boolean }[] = []
    const zCoords = [-9.6, -5.0, -1.0, 4.0, 9.6]
    for (const z of zCoords) {
      list.push({ x: -67.2, z, isNorthSide: true })
      list.push({ x: 67.2, z, isNorthSide: false })
    }
    return list
  }, [])

  // Collision bounding boxes for vehicle (buildings, streetlights, guardrails, and barriers)
  const collisionBoxes = useMemo<CollisionBox[]>(() => {
    const boxes: CollisionBox[] = []

    // 1. All Active Buildings
    userData.grid.forEach((cell) => {
      if (cell.count <= 0) return

      const { height: baseHeight, width, depth } = getBuildingProps(cell.count, userData.platform)
      const posX = (cell.x - 26) * SPACING_X
      const posZ = cell.z <= 2 ? cell.z * SPACING_Z - 7.0 : cell.z * SPACING_Z - 5.0

      const val = Math.sin(cell.x * 12.9898 + cell.z * 78.233) * 43758.5453
      const rand = val - Math.floor(val)
      const height = baseHeight * (0.85 + rand * 0.3) + 0.08

      boxes.push({
        minX: posX - width / 2,
        maxX: posX + width / 2,
        minZ: posZ - depth / 2,
        maxZ: posZ + depth / 2,
        height,
      })
    })

    // 2. Central Avenue Streetlights (Both North and South sides)
    streetlightPositions.forEach((posX) => {
      // North streetlight (posZ = -2.2)
      boxes.push({
        minX: posX - 0.25,
        maxX: posX + 0.25,
        minZ: -2.2 - 0.25,
        maxZ: -2.2 + 0.25,
        height: 2.8,
      })
      // South streetlight (posZ = 0.2)
      boxes.push({
        minX: posX - 0.25,
        maxX: posX + 0.25,
        minZ: 0.2 - 0.25,
        maxZ: 0.2 + 0.25,
        height: 2.8,
      })
    })

    // 3. Boulevard Connector Streetlights (Left & Right Boulevards)
    connectorStreetlights.forEach((l) => {
      boxes.push({
        minX: l.x - 0.25,
        maxX: l.x + 0.25,
        minZ: l.z - 0.25,
        maxZ: l.z + 0.25,
        height: 2.8,
      })
    })

    // 4. End Platform Safety Guardrails (Turnaround loops at X = ±75.5)
    // West Guardrail: [-75.5, 0.35, -1.0], boxGeometry [0.2, 0.6, 6.0]
    boxes.push({
      minX: -75.7,
      maxX: -75.3,
      minZ: -4.0,
      maxZ: 2.0,
      height: 1.0,
    })
    // East Guardrail: [75.5, 0.35, -1.0], boxGeometry [0.2, 0.6, 6.0]
    boxes.push({
      minX: 75.3,
      maxX: 75.7,
      minZ: -4.0,
      maxZ: 2.0,
      height: 1.0,
    })

    // 5. Outer Avenue Curbs (North & South limits)
    boxes.push({
      minX: -68.0,
      maxX: 68.0,
      minZ: -11.35,
      maxZ: -11.05,
      height: 0.5,
    })
    boxes.push({
      minX: -68.0,
      maxX: 68.0,
      minZ: 11.05,
      maxZ: 11.35,
      height: 0.5,
    })

    return boxes
  }, [userData.grid, userData.platform, streetlightPositions, connectorStreetlights])

  const takeScreenshot = () => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    try {
      const dataUrl = canvas.toDataURL('image/png')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `coder-city-${userData.platform}-${userData.username}-${timestamp}.png`

      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to take screenshot:', err)
    }
  }

  const activeInspection = inspectedCell || hoveredCell

  return (
    <div className="relative w-full h-screen bg-slate-950 text-white font-sans overflow-hidden select-none">
      {/* 3D Canvas */}
      <div className="w-full h-full z-0">
        <Canvas
          shadows
          gl={{ preserveDrawingBuffer: true }}
          camera={{ position: [35, 30, 45], fov: 50 }}
        >
          <color attach="background" args={[isNight ? '#020617' : '#94a3b8']} />

          {fogEnabled && (
            <fog
              attach="fog"
              args={[isNight ? '#020617' : '#94a3b8', isNight ? 20 : 25, isNight ? 90 : 100]}
            />
          )}

          <ambientLight intensity={isNight ? 0.2 : 0.75} color={isNight ? '#93c5fd' : '#ffffff'} />

          <directionalLight
            castShadow
            position={[45, 55, 20]}
            intensity={isNight ? 0.2 : 1.3}
            color={isNight ? '#93c5fd' : '#fffbeb'}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={200}
            shadow-camera-left={-75}
            shadow-camera-right={75}
            shadow-camera-top={35}
            shadow-camera-bottom={-35}
            shadow-bias={-0.0004}
          />

          <pointLight
            position={[0, 18, 0]}
            intensity={isNight ? 0.8 : 0.1}
            color={userData.platform === 'leetcode' ? '#f59e0b' : '#8b5cf6'}
          />
          <pointLight position={[-35, 18, 15]} intensity={isNight ? 0.6 : 0.08} color="#3b82f6" />
          <pointLight position={[35, 18, -15]} intensity={isNight ? 0.6 : 0.08} color="#ec4899" />

          <SkyGradient isNight={isNight} />

          {cloudsVisible && <Clouds isNight={isNight} />}

          {isNight && <ProceduralStars isNight={isNight} visible={starsVisible} />}

          <Suspense fallback={null}>
            <Environment preset={isNight ? 'night' : 'sunset'} />
          </Suspense>

          {/* Building Matrix */}
          <group>
            {userData.grid.map((cell) => (
              <Building
                key={cell.date}
                cell={cell}
                platform={userData.platform}
                isNight={isNight}
                windowTexture={windowTexture}
                isHovered={hoveredCell?.date === cell.date || inspectedCell?.date === cell.date}
                onHover={setHoveredCell}
                onSelect={(selected) => setInspectedCell(selected)}
              />
            ))}
          </group>

          {/* Streetlights */}
          <group>
            {/* Central Avenue Streetlights */}
            {streetlightPositions.map((posX, idx) => (
              <React.Fragment key={idx}>
                <Streetlight posX={posX} posZ={-2.2} isNorthSide={true} isNight={isNight} />
                <Streetlight posX={posX} posZ={0.2} isNorthSide={false} isNight={isNight} />
              </React.Fragment>
            ))}
            {/* Left & Right Connector Boulevards Streetlights */}
            {connectorStreetlights.map((l, idx) => (
              <Streetlight
                key={`connector-${idx}`}
                posX={l.x}
                posZ={l.z}
                isNorthSide={l.isNorthSide}
                isNight={isNight}
              />
            ))}
          </group>

          {/* Connected Asphalt Road Network (Central Avenue, Left & Right Boulevards, North & South Outer Loops, Crosswalks) */}
          <RoadNetwork isNight={isNight} platform={userData.platform} />

          {/* Drivable Vehicle */}
          <Car
            collisionBoxes={collisionBoxes}
            isActive={cameraMode === 'drive' && !showIntro}
            isNight={isNight}
          />

          {/* Ground Plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[160, 160]} />
            <meshStandardMaterial color="#020617" roughness={0.9} metalness={0.1} />
          </mesh>

          {/* Street Blocks Grid Overlay */}
          <gridHelper
            args={[
              160,
              80,
              userData.platform === 'leetcode' ? '#f59e0b' : '#6366f1',
              '#1e293b',
            ]}
            position={[0, 0.01, 0]}
          />

          {/* Free Camera Controls */}
          {cameraMode === 'orbit' && !showIntro && (
            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              maxPolarAngle={Math.PI / 2 - 0.05}
              minDistance={8}
              maxDistance={125}
            />
          )}

          {/* Cinematic Flythrough */}
          {(cameraMode === 'cinematic' || showIntro) && <CinematicCamera />}
        </Canvas>
      </div>

      {uiHidden ? (
        <button
          onClick={() => setUiHidden(false)}
          className="absolute top-6 right-6 z-20 pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-slate-800 backdrop-blur-md active:scale-95 shadow-lg cursor-pointer"
        >
          <span>👁 Show HUD</span>
        </button>
      ) : (
        <>
          {/* Top Header HUD */}
          <div className="absolute top-0 inset-x-0 z-20 p-3 sm:p-5 pointer-events-none flex justify-between items-start">
            {/* Left Controls */}
            <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/85 border border-slate-800 text-slate-300 hover:text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:bg-slate-800 backdrop-blur-md active:scale-95 shadow-lg cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Exit</span>
              </button>

              <button
                onClick={toggleMute}
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-slate-900/85 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-all hover:bg-slate-800 backdrop-blur-md active:scale-95 shadow-lg cursor-pointer"
                title={isMuted ? 'Unmute Soundtrack' : 'Mute Soundtrack'}
              >
                {isMuted ? <span>🔇</span> : <span className="animate-pulse">🔊</span>}
              </button>
            </div>

            {/* Mobile Header Buttons (Compact for screens < 768px) */}
            <div className="pointer-events-auto flex md:hidden items-center gap-1.5">
              <button
                onClick={() => setIsNight(!isNight)}
                className="flex items-center justify-center w-8 h-8 bg-slate-900/85 border border-slate-800 text-white rounded-xl text-xs transition-all active:scale-95 shadow-lg cursor-pointer backdrop-blur-md"
                title={isNight ? 'Switch to Day' : 'Switch to Night'}
              >
                {isNight ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              </button>

              <button
                onClick={() => setMobileStatsOpen(!mobileStatsOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer backdrop-blur-md ${
                  mobileStatsOpen
                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/25'
                    : 'bg-slate-900/85 border border-slate-800 text-slate-200'
                }`}
              >
                <span>📊</span>
                <span>{mobileStatsOpen ? 'Close' : 'Stats'}</span>
              </button>
            </div>

            {/* Desktop City Info & Settings Card (Shown on md+ screens) */}
            <div className="pointer-events-auto hidden md:flex bg-slate-900/85 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md max-w-sm w-88 flex-col gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    {userData.platform === 'leetcode' ? '⚡ Coder City • LeetCode' : '🐙 Coder City • GitHub'}
                    {userData.isMock && (
                      <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                        DEMO
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400">371-Day Skyline</span>
                </div>
                <h2 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-indigo-400 to-pink-400 truncate">
                  @{userData.username}'s Coder City
                </h2>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-800 py-3 text-center">
                <div className="flex flex-col items-center">
                  <Database className="w-4 h-4 text-amber-400 mb-1" />
                  <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                    {userData.platform === 'leetcode' ? 'Problems' : 'Commits'}
                  </span>
                  <span className="text-sm font-bold text-white mt-0.5">
                    {userData.totalSubmissions}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400 mb-1" />
                  <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                    Streak
                  </span>
                  <span className="text-sm font-bold text-white mt-0.5">
                    {userData.currentStreak}d
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <Trophy className="w-4 h-4 text-pink-400 mb-1" />
                  <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                    Longest
                  </span>
                  <span className="text-sm font-bold text-white mt-0.5">
                    {userData.longestStreak}d
                  </span>
                </div>
              </div>

              {/* LeetCode Difficulty Solved Pills */}
              {userData.platform === 'leetcode' && userData.leetcodeStats && (
                <div className="grid grid-cols-3 gap-1.5 py-1">
                  <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg py-1 px-2 text-center">
                    <span className="text-[9px] text-emerald-400 font-bold block">Easy</span>
                    <span className="text-xs font-black text-white">
                      {userData.leetcodeStats.easySolved}
                    </span>
                  </div>
                  <div className="bg-amber-950/40 border border-amber-800/40 rounded-lg py-1 px-2 text-center">
                    <span className="text-[9px] text-amber-400 font-bold block">Medium</span>
                    <span className="text-xs font-black text-white">
                      {userData.leetcodeStats.mediumSolved}
                    </span>
                  </div>
                  <div className="bg-rose-950/40 border border-rose-800/40 rounded-lg py-1 px-2 text-center">
                    <span className="text-[9px] text-rose-400 font-bold block">Hard</span>
                    <span className="text-xs font-black text-white">
                      {userData.leetcodeStats.hardSolved}
                    </span>
                  </div>
                </div>
              )}

              {/* Controls Toggle Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCameraMode(cameraMode === 'drive' ? 'orbit' : 'drive')}
                  className={`h-9 rounded-xl text-[11px] font-bold transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer ${
                    cameraMode === 'drive'
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <Navigation
                    className={`w-3.5 h-3.5 ${cameraMode === 'drive' ? 'rotate-45' : ''} transition-transform`}
                  />
                  <span>{cameraMode === 'drive' ? 'Free Orbit Cam' : 'Drive Sports Car'}</span>
                </button>

                <button
                  onClick={() => setIsNight(!isNight)}
                  className="h-9 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[11px] font-bold border border-slate-700 transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isNight ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Day Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Night Mode</span>
                    </>
                  )}
                </button>
              </div>

              {/* Tips & Instructions */}
              <div className="text-[10px] text-slate-400 flex items-start gap-1.5 border-t border-slate-800/60 pt-2.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  {cameraMode === 'drive'
                    ? 'Drive with WASD / Arrows. Spacebar to brake. Click any building to inspect!'
                    : cameraMode === 'orbit'
                    ? 'Drag left-click to orbit, right-click to pan, scroll wheel to zoom.'
                    : 'Cinematic drone tour active sweeping through your city skyline.'}
                </span>
              </div>

              {/* Display & Actions Panel */}
              <div className="border-t border-slate-800/60 pt-2.5 flex flex-col gap-2">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest px-0.5">
                  Display & Tools
                </span>

                <div className="grid grid-cols-5 gap-1 text-[9px] font-bold">
                  <button
                    onClick={toggleMute}
                    className={`h-7 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      !isMuted
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                        : 'bg-slate-950/40 border border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{!isMuted ? '🔊' : '🔇'}</span>
                  </button>

                  <button
                    onClick={() => setCloudsVisible(!cloudsVisible)}
                    className={`h-7 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      cloudsVisible
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                        : 'bg-slate-950/40 border border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>☁</span>
                  </button>

                  <button
                    onClick={() => setFogEnabled(!fogEnabled)}
                    className={`h-7 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      fogEnabled
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                        : 'bg-slate-950/40 border border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>🌫</span>
                  </button>

                  <button
                    onClick={() => setStarsVisible(!starsVisible)}
                    className={`h-7 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      starsVisible
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                        : 'bg-slate-950/40 border border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>⭐</span>
                  </button>

                  <button
                    onClick={() =>
                      setCameraMode(cameraMode === 'cinematic' ? 'drive' : 'cinematic')
                    }
                    className={`h-7 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      cameraMode === 'cinematic'
                        ? 'bg-pink-600/30 border border-pink-500 text-pink-300 animate-pulse'
                        : 'bg-slate-950/40 border border-slate-800 text-slate-300'
                    }`}
                  >
                    <span>🎥</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={takeScreenshot}
                    className="h-7 rounded-lg flex items-center justify-center gap-1 bg-slate-950/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/50 text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    <span>📸 Snapshot PNG</span>
                  </button>
                  <button
                    onClick={() => setUiHidden(true)}
                    className="h-7 rounded-lg flex items-center justify-center gap-1 bg-slate-950/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/50 text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    <span>👁 Hide HUD</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Drawer/Modal when Stats is opened on mobile */}
            {mobileStatsOpen && (
              <div className="pointer-events-auto md:hidden fixed inset-x-3 top-14 max-h-[80vh] overflow-y-auto bg-slate-950/95 border border-slate-800 rounded-3xl p-4 shadow-2xl backdrop-blur-xl flex flex-col gap-3 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest">
                      {userData.platform === 'leetcode' ? '⚡ LeetCode City' : '🐙 GitHub City'}
                    </span>
                    <h2 className="text-base font-black text-white truncate max-w-[220px]">
                      @{userData.username}
                    </h2>
                  </div>
                  <button
                    onClick={() => setMobileStatsOpen(false)}
                    className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Mobile Stats 3-column */}
                <div className="grid grid-cols-3 gap-1.5 py-1 text-center">
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-[8px] text-slate-400 uppercase font-semibold block">Total</span>
                    <span className="text-sm font-black text-white">{userData.totalSubmissions}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-[8px] text-slate-400 uppercase font-semibold block">Streak</span>
                    <span className="text-sm font-black text-emerald-400">{userData.currentStreak}d</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-[8px] text-slate-400 uppercase font-semibold block">Longest</span>
                    <span className="text-sm font-black text-pink-400">{userData.longestStreak}d</span>
                  </div>
                </div>

                {/* LeetCode stats breakdown if available */}
                {userData.platform === 'leetcode' && userData.leetcodeStats && (
                  <div className="grid grid-cols-3 gap-1.5 py-0.5 text-center">
                    <div className="bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-800/40">
                      <span className="text-[8px] text-emerald-400 font-bold block">Easy</span>
                      <span className="text-xs font-black text-white">{userData.leetcodeStats.easySolved}</span>
                    </div>
                    <div className="bg-amber-950/40 p-1.5 rounded-lg border border-amber-800/40">
                      <span className="text-[8px] text-amber-400 font-bold block">Medium</span>
                      <span className="text-xs font-black text-white">{userData.leetcodeStats.mediumSolved}</span>
                    </div>
                    <div className="bg-rose-950/40 p-1.5 rounded-lg border border-rose-800/40">
                      <span className="text-[8px] text-rose-400 font-bold block">Hard</span>
                      <span className="text-xs font-black text-white">{userData.leetcodeStats.hardSolved}</span>
                    </div>
                  </div>
                )}

                {/* Camera & Day/Night mode toggles */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setCameraMode(cameraMode === 'drive' ? 'orbit' : 'drive')
                      setMobileStatsOpen(false)
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${
                      cameraMode === 'drive' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span>{cameraMode === 'drive' ? 'Orbit Cam' : 'Drive Car'}</span>
                  </button>

                  <button
                    onClick={() => setIsNight(!isNight)}
                    className="py-2 bg-slate-800 text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    {isNight ? <span>☀️ Day Mode</span> : <span>🌙 Night Mode</span>}
                  </button>
                </div>

                {/* Weather & Snapshot toggles */}
                <div className="grid grid-cols-4 gap-1 pt-1 text-[10px] font-bold">
                  <button
                    onClick={() => setCloudsVisible(!cloudsVisible)}
                    className={`py-1.5 rounded-lg border ${cloudsVisible ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    ☁ Clouds
                  </button>
                  <button
                    onClick={() => setFogEnabled(!fogEnabled)}
                    className={`py-1.5 rounded-lg border ${fogEnabled ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    🌫 Fog
                  </button>
                  <button
                    onClick={() => setStarsVisible(!starsVisible)}
                    className={`py-1.5 rounded-lg border ${starsVisible ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    ⭐ Stars
                  </button>
                  <button
                    onClick={() => setCameraMode(cameraMode === 'cinematic' ? 'drive' : 'cinematic')}
                    className={`py-1.5 rounded-lg border ${cameraMode === 'cinematic' ? 'bg-pink-600/30 border-pink-500 text-pink-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    🎥 Drone
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Building Inspection Floating Card (when hovering or selecting a building) */}
          {activeInspection && (
            <div className="absolute top-16 left-3 right-3 sm:right-auto sm:left-6 sm:top-24 z-30 pointer-events-auto bg-slate-900/95 border border-amber-500/50 rounded-2xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-md max-w-sm sm:max-w-xs animate-in fade-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{activeInspection.date}</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  Week {activeInspection.x + 1}
                </span>
              </div>

              <div className="mt-2.5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Activity:</span>
                  <span className="text-sm font-extrabold text-white">
                    {activeInspection.count}{' '}
                    {userData.platform === 'leetcode' ? 'Problems Solved' : 'Commits'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Structure:</span>
                  <span className="text-xs font-semibold text-amber-300 capitalize">
                    {getBuildingProps(activeInspection.count, userData.platform).label}
                  </span>
                </div>

                {activeInspection.breakdown && (
                  <div className="mt-1 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-bold">
                      {activeInspection.breakdown.easy} Easy
                    </span>
                    <span className="text-amber-400 font-bold">
                      {activeInspection.breakdown.medium} Med
                    </span>
                    <span className="text-rose-400 font-bold">
                      {activeInspection.breakdown.hard} Hard
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Building Class Legend */}
          <div className="absolute bottom-6 left-6 z-10 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md hidden md:flex flex-col gap-2 max-w-xs pointer-events-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Building Class Scale</span>
            </h3>
            <div className="flex flex-col gap-1.5 text-[11px] font-semibold">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-[#1e293b] border border-slate-700" />
                <span className="text-slate-400">Empty Lot (0 activity)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-[#10b981]" />
                <span className="text-slate-400">
                  Small Tech Lab (1–2 {userData.platform === 'leetcode' ? 'problems' : 'commits'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-[#0ea5e9]" />
                <span className="text-slate-400">
                  Engineering Hub (3–5 {userData.platform === 'leetcode' ? 'problems' : 'commits'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-[#8b5cf6]" />
                <span className="text-slate-400">
                  Algo Skyscraper (6–9 {userData.platform === 'leetcode' ? 'problems' : 'commits'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-[#f43f5e]" />
                <span className="text-slate-400">
                  Grand Citadel (10+ {userData.platform === 'leetcode' ? 'problems' : 'commits'})
                </span>
              </div>
            </div>
          </div>

          <FPSCounter />
        </>
      )}

      {/* Intro Logo Splash */}
      {showIntro && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none select-none"
          style={{
            animation: 'backdropIntro 4.5s cubic-bezier(0.25, 1, 0.5, 1) forwards',
          }}
        >
          <style>{`
            @keyframes logoIntro {
              0% { opacity: 0; transform: scale(0.85); filter: blur(10px); }
              20% { opacity: 1.0; transform: scale(1.0); filter: blur(0px) drop-shadow(0 0 35px rgba(245, 158, 11, 0.6)); }
              80% { opacity: 1.0; transform: scale(1.02); filter: blur(0px) drop-shadow(0 0 35px rgba(245, 158, 11, 0.6)); }
              100% { opacity: 0; transform: scale(1.06); filter: blur(8px); }
            }
            @keyframes backdropIntro {
              0% { background-color: rgba(2, 6, 23, 1.0); }
              60% { background-color: rgba(2, 6, 23, 0.9); }
              100% { background-color: rgba(2, 6, 23, 0.0); }
            }
          `}</style>
          <div
            className="flex flex-col items-center gap-3"
            style={{ animation: 'logoIntro 4.5s cubic-bezier(0.25, 1, 0.5, 1) forwards' }}
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-pink-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-amber-500/30">
              <Code2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-2">
              <span>CODER</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-500">
                CITY
              </span>
            </h1>
            <p className="text-sm font-semibold tracking-widest uppercase text-slate-400">
              {userData.platform === 'leetcode'
                ? '3D Procedural Skyline of Your Daily Problem Solves'
                : '3D Procedural Skyline of Your Daily Commits'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
