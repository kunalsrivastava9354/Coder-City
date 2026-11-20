import React, { useRef, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export interface CollisionBox {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  height?: number
}

interface CarProps {
  collisionBoxes: CollisionBox[]
  isActive: boolean
  isNight?: boolean
}

// Physics & Tuning Constants
const MAX_SPEED = 12.0
const MAX_REVERSE_SPEED = -4.5
const ACCELERATION = 8.5
const DECELERATION = 5.0 // natural friction
const BRAKE_DECELERATION = 20.0
const TURN_SPEED = 2.4

export const Car: React.FC<CarProps> = ({ collisionBoxes, isActive, isNight = true }) => {
  const carRef = useRef<THREE.Group>(null)
  const { gl } = useThree()

  // Mobile device detection state
  const [isMobile, setIsMobile] = useState(false)

  // Kinematic state tracked in refs for 60fps performance without react re-renders
  const speed = useRef(0)
  const angle = useRef(Math.PI / 2) // Orient initially facing East along the Avenue
  const carPosition = useRef(new THREE.Vector3(-64.0, 0.22, -1.0)) // Place at the start of the Avenue (Week 1 / Day 1)
  const isFirstFrame = useRef(true)

  useEffect(() => {
    isFirstFrame.current = true
  }, [isActive])

  // Camera controls state tracked in refs
  const yawOffset = useRef(0)
  const pitch = useRef(0.45) // elevation angle in radians (~26 degrees)
  const distance = useRef(5.5) // camera follow distance
  const lastInputTime = useRef(0)

  // Keyboard controls state
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
  })

  // Mobile detection hook
  useEffect(() => {
    const checkMobile = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth <= 1024
      setIsMobile(hasTouch && isSmallScreen)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])



  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code
      if (code === 'KeyW' || code === 'ArrowUp') keys.current.forward = true
      if (code === 'KeyS' || code === 'ArrowDown') keys.current.backward = true
      if (code === 'KeyA' || code === 'ArrowLeft') keys.current.left = true
      if (code === 'KeyD' || code === 'ArrowRight') keys.current.right = true
      if (code === 'Space') keys.current.brake = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code
      if (code === 'KeyW' || code === 'ArrowUp') keys.current.forward = false
      if (code === 'KeyS' || code === 'ArrowDown') keys.current.backward = false
      if (code === 'KeyA' || code === 'ArrowLeft') keys.current.left = false
      if (code === 'KeyD' || code === 'ArrowRight') keys.current.right = false
      if (code === 'Space') keys.current.brake = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Camera pointer drag and wheel zoom listeners
  useEffect(() => {
    if (!isActive) return

    const dom = gl.domElement
    let isDragging = false
    let prevPointerX = 0
    let prevPointerY = 0

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return // Only drag on left click
      isDragging = true
      prevPointerX = e.clientX
      prevPointerY = e.clientY
      dom.setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return
      const dx = e.clientX - prevPointerX
      const dy = e.clientY - prevPointerY
      
      prevPointerX = e.clientX
      prevPointerY = e.clientY

      const sensitivity = 0.005
      yawOffset.current -= dx * sensitivity
      pitch.current = Math.max(0.05, Math.min(1.2, pitch.current + dy * sensitivity))
      lastInputTime.current = performance.now()
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (isDragging) {
        isDragging = false
        dom.releasePointerCapture(e.pointerId)
      }
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const zoomSensitivity = 0.005
      distance.current = Math.max(3.0, Math.min(15.0, distance.current + e.deltaY * zoomSensitivity))
      lastInputTime.current = performance.now()
    }

    dom.addEventListener('pointerdown', handlePointerDown)
    dom.addEventListener('pointermove', handlePointerMove)
    dom.addEventListener('pointerup', handlePointerUp)
    dom.addEventListener('pointercancel', handlePointerUp)
    dom.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      dom.removeEventListener('pointerdown', handlePointerDown)
      dom.removeEventListener('pointermove', handlePointerMove)
      dom.removeEventListener('pointerup', handlePointerUp)
      dom.removeEventListener('pointercancel', handlePointerUp)
      dom.removeEventListener('wheel', handleWheel)
    }
  }, [isActive, gl])

  // Point vs AABB collision check
  const checkPointCollides = (px: number, pz: number, radius: number): boolean => {
    const radSq = radius * radius
    for (let i = 0; i < collisionBoxes.length; i++) {
      const box = collisionBoxes[i]
      const closestX = Math.max(box.minX, Math.min(px, box.maxX))
      const closestZ = Math.max(box.minZ, Math.min(pz, box.maxZ))
      const dx = px - closestX
      const dz = pz - closestZ
      if (dx * dx + dz * dz < radSq) {
        return true
      }
    }
    return false
  }

  // Multi-point capsule check for the car (front bumper, center, and rear bumper)
  const checkCarCollides = (cx: number, cz: number, carAngle: number): boolean => {
    const dirX = Math.sin(carAngle)
    const dirZ = Math.cos(carAngle)
    const frontX = cx + dirX * 0.38
    const frontZ = cz + dirZ * 0.38
    const rearX = cx - dirX * 0.38
    const rearZ = cz - dirZ * 0.38
    const radius = 0.36

    return (
      checkPointCollides(frontX, frontZ, radius) ||
      checkPointCollides(rearX, rearZ, radius) ||
      checkPointCollides(cx, cz, radius)
    )
  }

  // Camera-building collision detection (only actual large buildings occlude camera)
  const checkCameraCollision = (x: number, y: number, z: number): boolean => {
    const cameraBuffer = 0.2
    for (let i = 0; i < collisionBoxes.length; i++) {
      const box = collisionBoxes[i]
      // Skip streetlights, curbs, or thin barriers for camera clipping
      if (box.maxX - box.minX < 0.8) continue

      const boxHeight = box.height || 10.0
      if (y > boxHeight + cameraBuffer) continue

      if (
        x > box.minX - cameraBuffer &&
        x < box.maxX + cameraBuffer &&
        z > box.minZ - cameraBuffer &&
        z < box.maxZ + cameraBuffer
      ) {
        return true
      }
    }
    return false
  }

  // Front wheels ref for rotation and steering animation
  const frontLeftWheelRef = useRef<THREE.Group>(null)
  const frontRightWheelRef = useRef<THREE.Group>(null)
  const rearLeftWheelRef = useRef<THREE.Group>(null)
  const rearRightWheelRef = useRef<THREE.Group>(null)

  // Unified Touch & Mouse controller event binder for mobile virtual controls
  const bindControl = (key: 'forward' | 'backward' | 'left' | 'right' | 'brake') => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault()
      keys.current[key] = true
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault()
      keys.current[key] = false
    },
    onTouchCancel: (e: React.TouchEvent) => {
      e.preventDefault()
      keys.current[key] = false
    },
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault()
      keys.current[key] = true
    },
    onMouseUp: (e: React.MouseEvent) => {
      e.preventDefault()
      keys.current[key] = false
    },
    onMouseLeave: (e: React.MouseEvent) => {
      e.preventDefault()
      keys.current[key] = false
    },
  })

  useFrame((state, delta) => {
    if (!carRef.current) return

    // Limit delta to prevent massive jumps on stutter
    const dt = Math.min(delta, 0.1)

    if (isActive) {
      // 1. Process Acceleration & Braking
      if (keys.current.forward) {
        speed.current = Math.min(speed.current + ACCELERATION * dt, MAX_SPEED)
      } else if (keys.current.backward) {
        speed.current = Math.max(speed.current - ACCELERATION * dt, MAX_REVERSE_SPEED)
      } else {
        // Friction deceleration
        if (speed.current > 0) {
          speed.current = Math.max(speed.current - DECELERATION * dt, 0)
        } else if (speed.current < 0) {
          speed.current = Math.min(speed.current + DECELERATION * dt, 0)
        }
      }

      if (keys.current.brake) {
        if (speed.current > 0) {
          speed.current = Math.max(speed.current - BRAKE_DECELERATION * dt, 0)
        } else if (speed.current < 0) {
          speed.current = Math.min(speed.current + BRAKE_DECELERATION * dt, 0)
        }
      }

      // 2. Process Steering (allowed while moving or stationary)
      const isMoving = Math.abs(speed.current) > 0.05
      const turnScale = isMoving ? Math.min(Math.max(Math.abs(speed.current) / 3.0, 0.4), 1.0) : 0.6
      const steerDir = speed.current < 0 ? -1 : 1

      if (keys.current.left) {
        angle.current += TURN_SPEED * turnScale * steerDir * dt
      }
      if (keys.current.right) {
        angle.current -= TURN_SPEED * turnScale * steerDir * dt
      }

      // 3. Movement with Instant Stop Collision Detection
      const dirX = Math.sin(angle.current)
      const dirZ = Math.cos(angle.current)
      const BOUND_LIMIT = 76.0

      if (Math.abs(speed.current) > 0.001) {
        const totalDist = speed.current * dt
        const stepSize = 0.12 // sub-step size to prevent tunneling through lightstands/obstacles
        const steps = Math.max(1, Math.ceil(Math.abs(totalDist) / stepSize))
        let stopped = false
        let finalX = carPosition.current.x
        let finalZ = carPosition.current.z

        for (let i = 1; i <= steps; i++) {
          const frac = i / steps
          const testX = carPosition.current.x + dirX * totalDist * frac
          const testZ = carPosition.current.z + dirZ * totalDist * frac

          const isOOB =
            Math.abs(testX) > BOUND_LIMIT ||
            Math.abs(testZ) > BOUND_LIMIT

          if (isOOB || checkCarCollides(testX, testZ, angle.current)) {
            stopped = true
            break
          }
          finalX = testX
          finalZ = testZ
        }

        if (stopped) {
          // Hard stop: immediately zero out speed and freeze position on impact
          speed.current = 0
          carPosition.current.set(finalX, carPosition.current.y, finalZ)
        } else {
          carPosition.current.set(finalX, carPosition.current.y, finalZ)
        }
      }

      // 4. Camera Follow Logic with Drag and Zoom Controls
      const now = performance.now()
      const idleTime = now - lastInputTime.current
      const isMovingFast = Math.abs(speed.current) > 0.5
      if (idleTime > 1500 && isMovingFast) {
        const angleNorm = Math.atan2(Math.sin(yawOffset.current), Math.cos(yawOffset.current))
        yawOffset.current = THREE.MathUtils.lerp(angleNorm, 0, 1.5 * dt)
        pitch.current = THREE.MathUtils.lerp(pitch.current, 0.45, 1.5 * dt)
      }

      const finalYaw = angle.current + Math.PI + yawOffset.current
      const dHorizontal = distance.current * Math.cos(pitch.current)
      const dVertical = distance.current * Math.sin(pitch.current)

      const targetCamX = carPosition.current.x + dHorizontal * Math.sin(finalYaw)
      const targetCamZ = carPosition.current.z + dHorizontal * Math.cos(finalYaw)
      const targetCamY = carPosition.current.y + dVertical

      let safeCamX = targetCamX
      let safeCamY = targetCamY
      let safeCamZ = targetCamZ

      const steps = 10
      for (let i = 1; i <= steps; i++) {
        const t = i / steps
        const testX = THREE.MathUtils.lerp(carPosition.current.x, targetCamX, t)
        const testY = THREE.MathUtils.lerp(carPosition.current.y + 0.6, targetCamY, t)
        const testZ = THREE.MathUtils.lerp(carPosition.current.z, targetCamZ, t)

        if (checkCameraCollision(testX, testY, testZ)) {
          const safeT = Math.max(0.15, (i - 1) / steps)
          safeCamX = THREE.MathUtils.lerp(carPosition.current.x, targetCamX, safeT)
          safeCamY = THREE.MathUtils.lerp(carPosition.current.y + 0.6, targetCamY, safeT)
          safeCamZ = THREE.MathUtils.lerp(carPosition.current.z, targetCamZ, safeT)
          break
        }
      }

      if (isFirstFrame.current) {
        state.camera.position.set(safeCamX, safeCamY, safeCamZ)
        state.camera.lookAt(carPosition.current.x, carPosition.current.y + 0.6, carPosition.current.z)
        isFirstFrame.current = false
      } else {
        state.camera.position.lerp(new THREE.Vector3(safeCamX, safeCamY, safeCamZ), 0.1)
        state.camera.lookAt(carPosition.current.x, carPosition.current.y + 0.6, carPosition.current.z)
      }
    }

    // Update car mesh group position & rotation
    carRef.current.position.copy(carPosition.current)
    carRef.current.rotation.y = angle.current

    // 5. Wheel Rotation & Steering Animation
    const wheelRotAmt = (speed.current / 0.3) * dt // wheel angular roll
    if (rearLeftWheelRef.current) rearLeftWheelRef.current.rotation.x += wheelRotAmt
    if (rearRightWheelRef.current) rearRightWheelRef.current.rotation.x += wheelRotAmt

    // Front wheels roll and steer around Y
    let steeringYaw = 0
    if (keys.current.left) steeringYaw = 0.38
    if (keys.current.right) steeringYaw = -0.38

    if (frontLeftWheelRef.current) {
      frontLeftWheelRef.current.rotation.x += wheelRotAmt
      frontLeftWheelRef.current.rotation.y = steeringYaw
    }
    if (frontRightWheelRef.current) {
      frontRightWheelRef.current.rotation.x += wheelRotAmt
      frontRightWheelRef.current.rotation.y = steeringYaw
    }
  })

  // Headlight targets pointing forward in local coordinates (positive Z)
  const headlightTargetLeft = useMemo(() => {
    const obj = new THREE.Object3D()
    obj.position.set(-0.25, 0, 10.0) // front left pointing forward
    return obj
  }, [])

  const headlightTargetRight = useMemo(() => {
    const obj = new THREE.Object3D()
    obj.position.set(0.25, 0, 10.0) // front right pointing forward
    return obj
  }, [])

  // Append headlight targets to group
  useEffect(() => {
    if (carRef.current) {
      carRef.current.add(headlightTargetLeft)
      carRef.current.add(headlightTargetRight)
    }
    return () => {
      if (carRef.current) {
        carRef.current.remove(headlightTargetLeft)
        carRef.current.remove(headlightTargetRight)
      }
    }
  }, [headlightTargetLeft, headlightTargetRight])

  return (
    <group ref={carRef}>
      {/* Low-Poly Car Chassis */}
      {/* Lower Body */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.22, 1.2]} />
        <meshStandardMaterial color="#f43f5e" roughness={0.1} metalness={0.9} /> {/* Cyberpunk Red */}
      </mesh>

      {/* Cabin Roof */}
      <mesh position={[0, 0.28, -0.08]} castShadow>
        <boxGeometry args={[0.58, 0.2, 0.65]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.7} />
      </mesh>

      {/* Glass Windows */}
      <mesh position={[0, 0.26, 0.22]}>
        <boxGeometry args={[0.56, 0.14, 0.04]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>

      {/* Headlights */}
      <mesh position={[-0.23, 0.08, 0.6]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={isNight ? "#fef08a" : "#64748b"} />
      </mesh>
      <mesh position={[0.23, 0.08, 0.6]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={isNight ? "#fef08a" : "#64748b"} />
      </mesh>

      {/* Spotlights for headlights cast forward */}
      <spotLight
        position={[-0.23, 0.08, 0.6]}
        angle={Math.PI / 5}
        penumbra={0.5}
        intensity={isNight ? 3.5 : 0.0}
        distance={20}
        color="#fef08a"
        target={headlightTargetLeft}
      />
      <spotLight
        position={[0.23, 0.08, 0.6]}
        angle={Math.PI / 5}
        penumbra={0.5}
        intensity={isNight ? 3.5 : 0.0}
        distance={20}
        color="#fef08a"
        target={headlightTargetRight}
      />

      {/* Tail Lights */}
      <mesh position={[-0.23, 0.08, -0.6]}>
        <boxGeometry args={[0.08, 0.05, 0.02]} />
        <meshBasicMaterial color={isNight ? "#ef4444" : "#7f1d1d"} />
      </mesh>
      <mesh position={[0.23, 0.08, -0.6]}>
        <boxGeometry args={[0.08, 0.05, 0.02]} />
        <meshBasicMaterial color={isNight ? "#ef4444" : "#7f1d1d"} />
      </mesh>

      {/* Wheels */}
      {/* Rear Left */}
      <group ref={rearLeftWheelRef} position={[-0.37, 0.0, -0.38]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.12, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
      </group>
      {/* Rear Right */}
      <group ref={rearRightWheelRef} position={[0.37, 0.0, -0.38]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.12, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
      </group>
      {/* Front Left */}
      <group ref={frontLeftWheelRef} position={[-0.37, 0.0, 0.38]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.12, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
      </group>
      {/* Front Right */}
      <group ref={frontRightWheelRef} position={[0.37, 0.0, 0.38]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.12, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
      </group>

      {/* Mobile Touch Driving HUD Portal */}
      {isMobile && isActive && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-x-0 bottom-0 z-50 pointer-events-none select-none flex justify-between items-end px-3 pb-5 sm:px-8 sm:pb-8"
          style={{
            paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 1.25rem))',
            paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0.75rem))',
            paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0.75rem))',
          }}
        >
          {/* Left Thumb: Steering D-Pad */}
          <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 bg-slate-950/80 p-1.5 sm:p-2 rounded-3xl border border-slate-800/80 backdrop-blur-lg shadow-2xl">
            <button
              {...bindControl('left')}
              className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/90 border-2 border-indigo-500/40 active:border-indigo-400 active:bg-indigo-600/40 text-indigo-300 active:text-white font-bold flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer touch-none select-none"
              aria-label="Steer Left"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider mt-0.5">Left</span>
            </button>

            <button
              {...bindControl('right')}
              className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/90 border-2 border-indigo-500/40 active:border-indigo-400 active:bg-indigo-600/40 text-indigo-300 active:text-white font-bold flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer touch-none select-none"
              aria-label="Steer Right"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider mt-0.5">Right</span>
            </button>
          </div>

          {/* Right Thumb: Drive, Reverse, and Brake Pedals */}
          <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
            {/* Handbrake / Quick Stop */}
            <button
              {...bindControl('brake')}
              className="w-11 h-20 sm:w-13 sm:h-24 rounded-2xl bg-slate-950/80 border border-slate-700/80 active:border-rose-500 active:bg-rose-950/60 text-slate-400 active:text-rose-300 font-bold flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer touch-none select-none backdrop-blur-md"
              aria-label="Brake"
            >
              <span className="text-base sm:text-lg">🛑</span>
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider mt-1 text-slate-400">Stop</span>
            </button>

            {/* Column of Gas & Reverse */}
            <div className="flex flex-col gap-1.5 sm:gap-2 bg-slate-950/80 p-1.5 sm:p-2 rounded-3xl border border-slate-800/80 backdrop-blur-lg shadow-2xl">
              {/* Accelerate / Gas */}
              <button
                {...bindControl('forward')}
                className="w-18 h-13 sm:w-22 sm:h-15 rounded-2xl bg-gradient-to-r from-amber-500/90 to-emerald-500/90 active:from-amber-400 active:to-emerald-400 text-slate-950 font-black flex items-center justify-center gap-1 shadow-xl shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer touch-none select-none"
                aria-label="Drive Forward"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Drive</span>
              </button>

              {/* Reverse */}
              <button
                {...bindControl('backward')}
                className="w-18 h-11 sm:w-22 sm:h-13 rounded-2xl bg-slate-900/90 border-2 border-pink-500/40 active:border-pink-400 active:bg-pink-600/30 text-pink-300 active:text-white font-bold flex items-center justify-center gap-1 shadow-lg transition-transform active:scale-95 cursor-pointer touch-none select-none"
                aria-label="Reverse"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Rev</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </group>
  )
}
