import React, { useMemo } from 'react'
import * as THREE from 'three'

interface RoadNetworkProps {
  isNight: boolean
  platform: 'leetcode' | 'github'
}

/**
 * Procedural Road Network Component
 * Renders asphalt roads, lane markings, curbs, intersections, and luminous safety barriers.
 */
export const RoadNetwork: React.FC<RoadNetworkProps> = ({ isNight, platform }) => {
  const neonColor = platform === 'leetcode' ? '#f59e0b' : '#38bdf8'
  const asphaltColor = isNight ? '#0b1120' : '#1e293b'
  const curbColor = isNight ? '#1e293b' : '#334155'

  // Dashed Centerline Texture for East-West roads
  const dashedTexEW = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 32
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, 128, 32)
      // Solid white road edge lines on top and bottom
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
      ctx.fillRect(0, 1, 128, 2)
      ctx.fillRect(0, 29, 128, 2)
      // Yellow dashed centerline
      ctx.fillStyle = '#fbbf24'
      ctx.fillRect(16, 14, 48, 4) // dash
      // remainder is gap
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    return tex
  }, [])

  // Dashed Centerline Texture for North-South roads
  const dashedTexNS = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, 32, 128)
      // Solid white road edge lines on left and right
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
      ctx.fillRect(1, 0, 2, 128)
      ctx.fillRect(29, 0, 2, 128)
      // Yellow dashed centerline
      ctx.fillStyle = '#fbbf24'
      ctx.fillRect(14, 16, 4, 48) // dash
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.ClampToEdgeWrapping
    tex.wrapT = THREE.RepeatWrapping
    return tex
  }, [])

  // Crosswalk (Zebra) Texture
  const crosswalkTex = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, 64, 64)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(i * 16 + 2, 4, 10, 56)
      }
    }
    const tex = new THREE.CanvasTexture(canvas)
    return tex
  }, [])

  // Intersections where Left and Right roads meet Central, North, and South roads
  const intersections = [
    // Left road junctions
    { x: -65.5, z: -1.0 }, // West & Central
    { x: -65.5, z: -9.6 }, // West & North
    { x: -65.5, z: 9.6 },  // West & South
    // Right road junctions
    { x: 65.5, z: -1.0 },  // East & Central
    { x: 65.5, z: -9.6 },  // East & North
    { x: 65.5, z: 9.6 },   // East & South
  ]

  return (
    <group position={[0, 0.015, 0]}>
      {/* ============================================================ */}
      {/* 1. ASPHALT ROAD SURFACES */}
      {/* ============================================================ */}

      {/* Central Main Avenue (East-West) connecting through from West End to East End */}
      <mesh position={[0, 0, -1.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[146, 3.4]} />
        <meshStandardMaterial color={asphaltColor} roughness={0.65} metalness={0.15} />
      </mesh>

      {/* North Outer Avenue (East-West) */}
      <mesh position={[0, 0, -9.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[134, 3.0]} />
        <meshStandardMaterial color={asphaltColor} roughness={0.65} metalness={0.15} />
      </mesh>

      {/* South Outer Avenue (East-West) */}
      <mesh position={[0, 0, 9.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[134, 3.0]} />
        <meshStandardMaterial color={asphaltColor} roughness={0.65} metalness={0.15} />
      </mesh>

      {/* Left Road (West Boulevard, North-South) */}
      <mesh position={[-65.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.2, 22.2]} />
        <meshStandardMaterial color={asphaltColor} roughness={0.65} metalness={0.15} />
      </mesh>

      {/* Right Road (East Boulevard, North-South) */}
      <mesh position={[65.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.2, 22.2]} />
        <meshStandardMaterial color={asphaltColor} roughness={0.65} metalness={0.15} />
      </mesh>

      {/* West Turnaround Cul-de-sac at West End */}
      <mesh position={[-73.0, 0, -1.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.8, 32]} />
        <meshStandardMaterial color={asphaltColor} roughness={0.65} metalness={0.15} />
      </mesh>

      {/* East Turnaround Cul-de-sac at East End */}
      <mesh position={[73.0, 0, -1.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.8, 32]} />
        <meshStandardMaterial color={asphaltColor} roughness={0.65} metalness={0.15} />
      </mesh>

      {/* ============================================================ */}
      {/* 2. ROAD MARKINGS & STRIPING (Slightly elevated at Y=0.005) */}
      {/* ============================================================ */}

      {/* Central Avenue Stripes */}
      <mesh position={[0, 0.005, -1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[146, 3.2]} />
        <meshBasicMaterial
          map={(() => {
            const t = dashedTexEW.clone()
            t.repeat.set(36, 1)
            t.needsUpdate = true
            return t
          })()}
          transparent
          opacity={isNight ? 0.9 : 0.8}
        />
      </mesh>

      {/* North Avenue Stripes */}
      <mesh position={[0, 0.005, -9.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[134, 2.8]} />
        <meshBasicMaterial
          map={(() => {
            const t = dashedTexEW.clone()
            t.repeat.set(33, 1)
            t.needsUpdate = true
            return t
          })()}
          transparent
          opacity={isNight ? 0.85 : 0.75}
        />
      </mesh>

      {/* South Avenue Stripes */}
      <mesh position={[0, 0.005, 9.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[134, 2.8]} />
        <meshBasicMaterial
          map={(() => {
            const t = dashedTexEW.clone()
            t.repeat.set(33, 1)
            t.needsUpdate = true
            return t
          })()}
          transparent
          opacity={isNight ? 0.85 : 0.75}
        />
      </mesh>

      {/* Left Road Stripes */}
      <mesh position={[-65.5, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.0, 22.0]} />
        <meshBasicMaterial
          map={(() => {
            const t = dashedTexNS.clone()
            t.repeat.set(1, 6)
            t.needsUpdate = true
            return t
          })()}
          transparent
          opacity={isNight ? 0.9 : 0.8}
        />
      </mesh>

      {/* Right Road Stripes */}
      <mesh position={[65.5, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.0, 22.0]} />
        <meshBasicMaterial
          map={(() => {
            const t = dashedTexNS.clone()
            t.repeat.set(1, 6)
            t.needsUpdate = true
            return t
          })()}
          transparent
          opacity={isNight ? 0.9 : 0.8}
        />
      </mesh>

      {/* Crosswalk Zebra Markings at Intersections */}
      {intersections.map((pos, idx) => (
        <group key={idx}>
          {/* North entry crosswalk */}
          <mesh position={[pos.x, 0.006, pos.z - 2.0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.6, 0.8]} />
            <meshBasicMaterial map={crosswalkTex} transparent opacity={0.7} />
          </mesh>
          {/* South entry crosswalk */}
          <mesh position={[pos.x, 0.006, pos.z + 2.0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.6, 0.8]} />
            <meshBasicMaterial map={crosswalkTex} transparent opacity={0.7} />
          </mesh>
        </group>
      ))}

      {/* ============================================================ */}
      {/* 3. ROADSIDE CURBS & SIDEWALK BORDERS */}
      {/* ============================================================ */}

      {/* North Outer Curb */}
      <mesh position={[0, 0.04, -11.2]}>
        <boxGeometry args={[136, 0.08, 0.25]} />
        <meshStandardMaterial color={curbColor} roughness={0.8} />
      </mesh>

      {/* South Outer Curb */}
      <mesh position={[0, 0.04, 11.2]}>
        <boxGeometry args={[136, 0.08, 0.25]} />
        <meshStandardMaterial color={curbColor} roughness={0.8} />
      </mesh>

      {/* Left Far Outer Curb */}
      <mesh position={[-67.2, 0.04, 0]}>
        <boxGeometry args={[0.25, 0.08, 22.4]} />
        <meshStandardMaterial color={curbColor} roughness={0.8} />
      </mesh>

      {/* Right Far Outer Curb */}
      <mesh position={[67.2, 0.04, 0]}>
        <boxGeometry args={[0.25, 0.08, 22.4]} />
        <meshStandardMaterial color={curbColor} roughness={0.8} />
      </mesh>

      {/* ============================================================ */}
      {/* 4. END PLATFORM NEON SAFETY GUARDRAILS */}
      {/* ============================================================ */}

      {/* West Turnaround Guardrail */}
      <group position={[-75.5, 0.35, -1.0]}>
        <mesh>
          <boxGeometry args={[0.2, 0.6, 6.0]} />
          <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.8} />
        </mesh>
        {/* Glowing neon light strip */}
        <mesh position={[0.12, 0.15, 0]}>
          <boxGeometry args={[0.05, 0.1, 5.8]} />
          <meshBasicMaterial color={neonColor} />
        </mesh>
      </group>

      {/* East Turnaround Guardrail */}
      <group position={[75.5, 0.35, -1.0]}>
        <mesh>
          <boxGeometry args={[0.2, 0.6, 6.0]} />
          <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.8} />
        </mesh>
        {/* Glowing neon light strip */}
        <mesh position={[-0.12, 0.15, 0]}>
          <boxGeometry args={[0.05, 0.1, 5.8]} />
          <meshBasicMaterial color={neonColor} />
        </mesh>
      </group>
    </group>
  )
}
