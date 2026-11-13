import { useEffect, useMemo } from 'react'
import { AdditiveBlending, BackSide } from 'three'
import { HALL } from '../data/hall'
import { SCREEN_CENTRE } from '../lib/geometry'
import { createDesertTexture, createGlowTexture } from './desertTexture'
import { SCREEN_ARC_ANGLE, SCREEN_RADIUS } from './hallLayout'

/**
 * The cinema screen: a thin slice of a cylinder whose centre point sits exactly
 * at SCREEN_CENTRE (the point all metrics measure to). The cylinder's axis is
 * SCREEN_RADIUS behind the audience side, so the edges curve towards the seats.
 */
export function Screen() {
  const picture = useMemo(() => createDesertTexture(), [])
  const glow = useMemo(() => createGlowTexture(), [])
  useEffect(
    () => () => {
      picture.dispose()
      glow.dispose()
    },
    [picture, glow],
  )

  return (
    <group>
      {/* Halo: a soft glow on the wall around the screen */}
      <mesh position={[SCREEN_CENTRE.x, SCREEN_CENTRE.y, -0.3]}>
        <planeGeometry args={[HALL.screenWidth * 1.25, HALL.screenHeight * 1.5]} />
        <meshBasicMaterial
          map={glow}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* The picture. θ = π points at -z from the axis, i.e. the centre of the screen. */}
      <mesh position={[SCREEN_CENTRE.x, SCREEN_CENTRE.y, SCREEN_CENTRE.z + SCREEN_RADIUS]}>
        <cylinderGeometry
          args={[
            SCREEN_RADIUS,
            SCREEN_RADIUS,
            HALL.screenHeight,
            48, // smooth curve
            1,
            true, // open ended: no top/bottom caps
            Math.PI - SCREEN_ARC_ANGLE / 2,
            SCREEN_ARC_ANGLE,
          ]}
        />
        {/* BackSide: we look at the inside of the cylinder. Unlit + no tone mapping = it glows. */}
        <meshBasicMaterial map={picture} side={BackSide} toneMapped={false} />
      </mesh>
    </group>
  )
}
