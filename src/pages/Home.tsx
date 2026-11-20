import React, { useState, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Play,
  AlertCircle,
  Database,
  Trophy,
  TrendingUp,
  Code2,
  Search,
} from 'lucide-react'
import * as THREE from 'three'
import { fetchCityData } from '../services/api'
import type { CityUserData, PlatformType } from '../services/api'

// Custom GitHub Icon
const GithubIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)

// Window grid canvas texture for background skyscrapers
const createBgWindowTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#020617'
    ctx.fillRect(0, 0, 64, 64)
    ctx.fillStyle = '#ffffff'
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.fillRect(8 + c * 14, 8 + r * 14, 8, 8)
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  return tex
}

interface BgBuildingItem {
  id: string
  x: number
  z: number
  baseHeight: number
  width: number
  depth: number
  color: string
  emissiveColor: string
  speed: number
  phase: number
  isMega: boolean
}

// Individual animated skyscraper with pulsing height wave and glowing windows
const AnimatedBgBuilding: React.FC<{
  item: BgBuildingItem
  windowTexture: THREE.Texture
}> = ({ item, windowTexture }) => {
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const beaconRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (!groupRef.current) return

    // Smooth sinusoidal wave animating building height
    const wave = Math.sin(time * item.speed + item.phase) * 0.5 + 0.5
    const scaleY = 0.55 + wave * 0.75
    groupRef.current.scale.y = scaleY
    groupRef.current.position.y = -3.2 + (item.baseHeight * scaleY) / 2

    // Pulsing emissive window glow
    if (matRef.current) {
      const glow = Math.sin(time * 2.2 + item.phase) * 0.5 + 0.5
      matRef.current.emissiveIntensity = 0.5 + glow * 1.2
    }

    // Blinking beacon on mega spires
    if (beaconRef.current) {
      const blink = Math.sin(time * 7.5 + item.phase) * 0.5 + 0.5
      beaconRef.current.opacity = blink > 0.4 ? 1.0 : 0.15
    }
  })

  return (
    <group ref={groupRef} position={[item.x, 0, item.z]}>
      {/* Main tower structure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[item.width, item.baseHeight, item.depth]} />
        <meshStandardMaterial
          ref={matRef}
          color={item.color}
          emissive={item.emissiveColor}
          emissiveIntensity={0.8}
          emissiveMap={windowTexture}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Rooftop spire & pulsing warning beacon on tall mega towers */}
      {item.isMega && (
        <group position={[0, item.baseHeight / 2, 0]}>
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.02, 0.04, 1.6, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 1.6, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial ref={beaconRef} color="#f43f5e" transparent opacity={0.9} />
          </mesh>
        </group>
      )}
    </group>
  )
}

// Floating ambient cyber light particles
function FloatingCyberParticles() {
  const pointsRef = useRef<THREE.Points>(null)
  const count = 120

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const spd = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 35
      pos[i * 3 + 1] = Math.random() * 15 - 3
      pos[i * 3 + 2] = (Math.random() - 0.5) * 35
      spd[i] = 0.4 + Math.random() * 0.8
    }
    return [pos, spd]
  }, [])

  useFrame((_, delta) => {
    if (!pointsRef.current) return
    const dt = Math.min(delta, 0.1)
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const array = posAttr.array as Float32Array

    for (let i = 0; i < count; i++) {
      array[i * 3 + 1] += speeds[i] * dt
      if (array[i * 3 + 1] > 14) {
        array[i * 3 + 1] = -3
      }
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.18}
        color="#fbbf24"
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Background 3D animated metropolis with turntable rotation and camera parallax
function BackgroundCity() {
  const groupRef = useRef<THREE.Group>(null)
  const windowTexture = useMemo(() => createBgWindowTexture(), [])

  // Procedural animated building grid
  const buildings = useMemo<BgBuildingItem[]>(() => {
    const items: BgBuildingItem[] = []
    const gridSize = 10
    const spacing = 2.6

    for (let x = -gridSize / 2; x < gridSize / 2; x++) {
      for (let z = -gridSize / 2; z < gridSize / 2; z++) {
        // Leave avenues / open spaces
        if (Math.abs(x) <= 1 && Math.abs(z) <= 1) continue
        if (Math.random() > 0.4) {
          const dist = Math.sqrt(x * x + z * z)
          const baseHeight = 2.0 + Math.random() * 5.5
          const isMega = baseHeight > 5.5
          const color = isMega
            ? '#ec4899'
            : baseHeight > 4.0
            ? '#8b5cf6'
            : baseHeight > 2.8
            ? '#0ea5e9'
            : '#10b981'
          const emissiveColor = isMega ? '#f43f5e' : baseHeight > 4.0 ? '#8b5cf6' : '#38bdf8'

          items.push({
            id: `${x}-${z}`,
            x: x * spacing,
            z: z * spacing,
            baseHeight,
            width: 1.3,
            depth: 1.3,
            color,
            emissiveColor,
            speed: 0.8 + Math.random() * 0.8,
            phase: dist * 0.8 + Math.random() * Math.PI,
            isMega,
          })
        }
      }
    }
    return items
  }, [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const time = state.clock.getElapsedTime()

    // Smooth turntable rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.04
    }

    // Subtle mouse parallax camera tilt
    const targetCamX = state.pointer.x * 2.2
    const targetCamY = 6 + state.pointer.y * 1.4
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetCamX, 2.0 * dt)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetCamY, 2.0 * dt)
    state.camera.lookAt(0, 1.2, 0)
  })

  return (
    <>
      <group ref={groupRef}>
        {buildings.map((item) => (
          <AnimatedBgBuilding key={item.id} item={item} windowTexture={windowTexture} />
        ))}
      </group>
      <FloatingCyberParticles />
    </>
  )
}

interface HomeProps {
  onGenerate: (data: CityUserData) => void
}

export const Home: React.FC<HomeProps> = ({ onGenerate }) => {
  const [platform, setPlatform] = useState<PlatformType>('leetcode')
  const [username, setUsername] = useState('')
  const [dataSource, setDataSource] = useState<'real' | 'demo'>('real')
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [cityData, setCityData] = useState<CityUserData | null>(null)

  const handleFetch = async (targetUsername?: string, forcedSource?: 'real' | 'demo') => {
    setError(null)
    setCityData(null)

    const finalName = (targetUsername || username).trim()
    const finalSource = forcedSource || dataSource

    if (finalSource === 'real' && !finalName) {
      setError(`Please enter a valid ${platform === 'leetcode' ? 'LeetCode' : 'GitHub'} username.`)
      return
    }

    setIsGenerating(true)

    try {
      const data = await fetchCityData(finalName || 'DemoMaster', platform, finalSource)
      setCityData(data)
    } catch (err: any) {
      setError(
        err.message ||
          `Failed to retrieve ${platform === 'leetcode' ? 'LeetCode' : 'GitHub'} submission data.`
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="relative w-full min-h-[100dvh] h-[100dvh] overflow-hidden bg-slate-950 text-white flex items-center justify-center font-sans">
      {/* 3D Wireframe Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 6, 15], fov: 55 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 15, 10]} intensity={1.5} color="#f59e0b" />
          <BackgroundCity />
        </Canvas>
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-h-[100dvh] overflow-y-auto py-4 sm:py-8 flex justify-center">
        <div
          className={`w-full ${cityData ? 'max-w-3xl' : 'max-w-lg'} px-3.5 sm:px-6 transition-all duration-500`}
        >
          <div className="bg-transparent border-0 rounded-3xl p-3 sm:p-6 md:p-8 flex flex-col items-center">
            {/* Header Title */}
            <div className="flex flex-col items-center text-center mb-6">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight flex items-center justify-center select-none">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.35)]">
                  CODER CITY
                </span>
              </h1>
            </div>

            {/* Platform Selector Tabs */}
            <div className="w-full grid grid-cols-2 gap-1.5 sm:gap-2 bg-slate-950/40 p-1 sm:p-1.5 rounded-2xl border-0 mb-4 sm:mb-6 backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  setPlatform('leetcode')
                  setCityData(null)
                  setError(null)
                }}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl font-bold text-[11px] sm:text-xs transition-all cursor-pointer ${
                  platform === 'leetcode'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>LeetCode Problems</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPlatform('github')
                  setCityData(null)
                  setError(null)
                }}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl font-bold text-[11px] sm:text-xs transition-all cursor-pointer ${
                  platform === 'github'
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GithubIcon className="w-4 h-4" />
                <span>GitHub Commits</span>
              </button>
            </div>

            {/* Input Form */}
            {!cityData ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleFetch()
                }}
                className="w-full flex flex-col gap-4"
              >
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                    {platform === 'leetcode' ? 'LeetCode Username' : 'GitHub Username'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full bg-slate-950/50 border border-slate-800/40 rounded-2xl py-3 sm:py-3.5 pl-3.5 sm:pl-4 pr-24 sm:pr-28 text-base text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all backdrop-blur-md"
                    />
                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 text-slate-950 font-bold text-xs flex items-center gap-1 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      {isGenerating ? (
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Search className="w-3.5 h-3.5" />
                          <span>Generate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Mode Selectors */}
                <div className="flex items-center justify-center pt-3">
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                      <input
                        type="radio"
                        name="source"
                        checked={dataSource === 'real'}
                        onChange={() => setDataSource('real')}
                        className="accent-amber-500"
                      />
                      <span>Live API</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                      <input
                        type="radio"
                        name="source"
                        checked={dataSource === 'demo'}
                        onChange={() => setDataSource('demo')}
                        className="accent-amber-500"
                      />
                      <span>Simulated Demo</span>
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </form>
            ) : (
              /* City Generated Preview Card */
              <div className="w-full flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                      City Blueprint Ready
                    </span>
                    <h2 className="text-2xl font-black text-white">@{cityData.username}</h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCityData(null)}
                    className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 transition-colors"
                  >
                    Change User
                  </button>
                </div>

                {/* Big Stats Row */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex flex-col items-center text-center">
                    <Database className="w-5 h-5 text-amber-400 mb-1" />
                    <span className="text-[8px] sm:text-[10px] text-slate-400 font-semibold uppercase">
                      {cityData.platform === 'leetcode' ? 'Problems Solved' : 'Total Commits'}
                    </span>
                    <span className="text-base sm:text-xl font-black text-white mt-0.5">
                      {cityData.totalSubmissions}
                    </span>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex flex-col items-center text-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400 mb-1" />
                    <span className="text-[8px] sm:text-[10px] text-slate-400 font-semibold uppercase">
                      Current Streak
                    </span>
                    <span className="text-base sm:text-xl font-black text-white mt-0.5">
                      {cityData.currentStreak} Days
                    </span>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex flex-col items-center text-center">
                    <Trophy className="w-5 h-5 text-pink-400 mb-1" />
                    <span className="text-[8px] sm:text-[10px] text-slate-400 font-semibold uppercase">
                      Longest Streak
                    </span>
                    <span className="text-base sm:text-xl font-black text-white mt-0.5">
                      {cityData.longestStreak} Days
                    </span>
                  </div>
                </div>

                {/* LeetCode Difficulty Solved stats if available */}
                {cityData.leetcodeStats && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-2.5 text-center">
                      <span className="text-[10px] text-emerald-400 font-bold block">Easy</span>
                      <span className="text-base font-extrabold text-white">
                        {cityData.leetcodeStats.easySolved}
                      </span>
                    </div>
                    <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-2.5 text-center">
                      <span className="text-[10px] text-amber-400 font-bold block">Medium</span>
                      <span className="text-base font-extrabold text-white">
                        {cityData.leetcodeStats.mediumSolved}
                      </span>
                    </div>
                    <div className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-2.5 text-center">
                      <span className="text-[10px] text-rose-400 font-bold block">Hard</span>
                      <span className="text-base font-extrabold text-white">
                        {cityData.leetcodeStats.hardSolved}
                      </span>
                    </div>
                  </div>
                )}

                {/* 2D Mini Heatmap Overview */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                    <span>371-Day Skyline Grid (53 Weeks × 7 Days)</span>
                    <span className="text-amber-400 font-mono">
                      {cityData.grid.filter((c) => c.count > 0).length} Active Days
                    </span>
                  </div>
                  <div className="flex gap-[3px] overflow-x-auto py-1">
                    {Array.from({ length: 53 }).map((_, weekIdx) => (
                      <div key={weekIdx} className="flex flex-col gap-[3px] shrink-0">
                        {cityData.grid.slice(weekIdx * 7, weekIdx * 7 + 7).map((day) => (
                          <div
                            key={day.date}
                            title={`${day.date}: ${day.count} solved`}
                            className={`w-2.5 h-2.5 rounded-[2px] transition-colors ${
                              day.count === 0
                                ? 'bg-slate-800/60'
                                : day.count <= 2
                                ? 'bg-emerald-500'
                                : day.count <= 5
                                ? 'bg-sky-500'
                                : day.count <= 9
                                ? 'bg-purple-500'
                                : 'bg-pink-500 shadow-sm shadow-pink-500/50'
                            }`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  type="button"
                  onClick={() => onGenerate(cityData)}
                  className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-600 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>Enter 3D City Simulation</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
