import { useLayoutEffect, useRef } from 'react'
import { Object3D, type InstancedMesh } from 'three'
import { SCREEN_CENTRE } from '../lib/geometry'
import { AISLE_X, PLATFORMS, ROOM } from './hallLayout'

const CARPET = '#1b1416'
const WALL = '#201719'
const CEILING = '#0c0a0b'

const depth = ROOM.backZ - ROOM.frontZ
const midZ = (ROOM.backZ + ROOM.frontZ) / 2

/** Floor, stepped rows, walls, ceiling and small warm lights. */
export function Room() {
  return (
    <group>
      {/* Main floor (row A stands on this) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, midZ]}>
        <planeGeometry args={[ROOM.halfWidth * 2, depth]} />
        <meshStandardMaterial color={CARPET} roughness={1} />
      </mesh>

      {/* Stadium steps: one solid block per row, as high as that row's floor */}
      {PLATFORMS.filter((p) => p.top > 0).map((p) => (
        <mesh key={p.row} position={[0, p.top / 2, (p.zFront + p.zBack) / 2]}>
          <boxGeometry args={[ROOM.halfWidth * 2, p.top, p.zBack - p.zFront]} />
          <meshStandardMaterial color={CARPET} roughness={1} />
        </mesh>
      ))}

      {/* Side walls */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * ROOM.halfWidth, ROOM.height / 2, midZ]}
          rotation-y={(-side * Math.PI) / 2}
        >
          <planeGeometry args={[depth, ROOM.height]} />
          <meshStandardMaterial color={WALL} roughness={0.95} />
        </mesh>
      ))}

      {/* Back wall, front (screen) wall and ceiling */}
      <mesh position={[0, ROOM.height / 2, ROOM.backZ]} rotation-y={Math.PI}>
        <planeGeometry args={[ROOM.halfWidth * 2, ROOM.height]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>
      <mesh position={[0, ROOM.height / 2, ROOM.frontZ]}>
        <planeGeometry args={[ROOM.halfWidth * 2, ROOM.height]} />
        <meshStandardMaterial color="#070607" roughness={1} />
      </mesh>
      <mesh position={[0, ROOM.height, midZ]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[ROOM.halfWidth * 2, depth]} />
        <meshStandardMaterial color={CEILING} roughness={1} />
      </mesh>

      <StepLights />
      <WallSconces />
    </group>
  )
}

/** Small warm lights on the front edge of every step, in each aisle. */
function StepLights() {
  const ref = useRef<InstancedMesh>(null)
  const risers = PLATFORMS.filter((p) => p.top > 0)
  const count = risers.length * AISLE_X.length

  useLayoutEffect(() => {
    const dummy = new Object3D()
    let i = 0
    for (const p of risers) {
      for (const x of AISLE_X) {
        dummy.position.set(x, p.top - 0.06, p.zFront - 0.011)
        dummy.updateMatrix()
        ref.current!.setMatrixAt(i++, dummy.matrix)
      }
    }
    ref.current!.instanceMatrix.needsUpdate = true
  }, [risers])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.35, 0.03, 0.02]} />
      <meshBasicMaterial color="#ffa65a" toneMapped={false} />
    </instancedMesh>
  )
}

/** Tall, dim warm light strips along both side walls. */
function WallSconces() {
  const ref = useRef<InstancedMesh>(null)
  const zs = [3.5, 7, 10.5, 14]
  const count = zs.length * 2

  useLayoutEffect(() => {
    const dummy = new Object3D()
    let i = 0
    for (const side of [-1, 1]) {
      for (const z of zs) {
        dummy.position.set(side * (ROOM.halfWidth - 0.03), SCREEN_CENTRE.y + 0.8, z)
        dummy.updateMatrix()
        ref.current!.setMatrixAt(i++, dummy.matrix)
      }
    }
    ref.current!.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.05, 0.9, 0.12]} />
      <meshBasicMaterial color="#c9844f" toneMapped={false} />
    </instancedMesh>
  )
}

/** Dim, warm room lighting plus light spilling from the screen onto the front rows. */
export function Lights() {
  return (
    <>
      <ambientLight color="#ffd9b8" intensity={0.25} />
      <hemisphereLight args={['#5a3e30', '#120a08', 0.7]} />
      {/* Screen spill: bright near the screen, fading with distance (inverse square) */}
      <pointLight
        position={[0, SCREEN_CENTRE.y - 0.5, 1.2]}
        color="#ffbf8a"
        intensity={70}
        decay={2}
      />
      {/* Soft wash from the wall lights */}
      {[-1, 1].map((side) => (
        <pointLight
          key={side}
          position={[side * (ROOM.halfWidth - 0.8), SCREEN_CENTRE.y + 0.8, 9]}
          color="#ffb070"
          intensity={14}
          decay={2}
        />
      ))}
      {/* Projector-booth glow from the back wall: lights the backs of the seats you look over */}
      <pointLight
        position={[0, ROOM.height - 1, ROOM.backZ - 0.5]}
        color="#ffcf9e"
        intensity={30}
        decay={2}
      />
    </>
  )
}
