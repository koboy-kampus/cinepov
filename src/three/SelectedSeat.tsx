import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  MathUtils,
  type Mesh,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
} from 'three'
import { getSeat } from '../data/hall'
import { seatPosition } from '../lib/geometry'
import { easeInOutCubic, flightTime } from '../lib/transition'
import { useBooking } from '../store/useBooking'
import { stageProgress, useStage } from '../store/useStage'
import { createGlowTexture } from './desertTexture'
import { createReclinerSeat, createStandardSeat } from './seatModels'

const MINT = '#6ee7a8'

/**
 * The selected seat, glowing mint, plus a soft mint pool of light on the
 * floor so it's easy to spot from above while the camera flies to it.
 */
export function SelectedSeat() {
  const seatId = useBooking((s) => s.selectedSeatId)
  const seat = seatId ? getSeat(seatId) : undefined

  const geometries = useMemo(
    () => ({ standard: createStandardSeat(), recliner: createReclinerSeat() }),
    [],
  )
  const glow = useMemo(() => createGlowTexture(256, '110, 231, 168'), [])
  useEffect(
    () => () => {
      geometries.standard.dispose()
      geometries.recliner.dispose()
      glow.dispose()
    },
    [geometries, glow],
  )

  // Strongest from above; fades out as we sit down, so the seat we're landing
  // in doesn't pass through the foreground as a big mint block.
  const glowMaterial = useRef<MeshBasicMaterial>(null)
  const seatMesh = useRef<Mesh>(null)
  useFrame(() => {
    if (!glowMaterial.current || !seatMesh.current) return
    const move = easeInOutCubic(flightTime(stageProgress.get(), useStage.getState().reduced))
    const fade = 1 - MathUtils.smoothstep(move, 0.45, 0.8)
    glowMaterial.current.opacity = fade
    ;(seatMesh.current.material as MeshStandardMaterial).opacity = fade
    seatMesh.current.visible = fade > 0
  })

  if (!seat) return null
  const { x, y, z } = seatPosition(seat)

  return (
    <group position={[x, y, z]}>
      {/* Slightly larger than the instanced seat underneath, so it fully covers it. */}
      <mesh ref={seatMesh} geometry={geometries[seat.type]} scale={1.02}>
        <meshStandardMaterial
          transparent
          color={MINT}
          emissive={MINT}
          emissiveIntensity={0.55}
          roughness={0.6}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0.05]} scale={1.9}>
        <planeGeometry />
        <meshBasicMaterial
          ref={glowMaterial}
          map={glow}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
