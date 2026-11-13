import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Color, Object3D, type BufferGeometry, type InstancedMesh } from 'three'
import { SEATS, type Seat, type SeatType } from '../data/hall'
import { isSeatTaken } from '../data/showtimes'
import { seatPosition } from '../lib/geometry'
import { useBooking } from '../store/useBooking'
import { createReclinerSeat, createStandardSeat } from './seatModels'

// Same palette as the 2D map.
const COLOURS = {
  standard: new Color('#8b1e2b'),
  recliner: new Color('#b23a48'),
  selected: new Color('#6ee7a8'),
}
const TAKEN_TINT = new Color('#141416')

/** All seats of one type in a single InstancedMesh, coloured per instance. */
function SeatGroup({
  type,
  createGeometry,
}: {
  type: SeatType
  createGeometry: () => BufferGeometry
}) {
  const ref = useRef<InstancedMesh>(null)
  const seats: Seat[] = useMemo(() => SEATS.filter((seat) => seat.type === type), [type])
  const geometry = useMemo(() => createGeometry(), [createGeometry])
  useEffect(() => () => geometry.dispose(), [geometry])

  const showtimeId = useBooking((s) => s.showtimeId)
  const selectedSeatId = useBooking((s) => s.selectedSeatId)

  // Positions never change: set them once.
  useLayoutEffect(() => {
    const dummy = new Object3D()
    seats.forEach((seat, i) => {
      const { x, y, z } = seatPosition(seat)
      dummy.position.set(x, y, z)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current!.instanceMatrix.needsUpdate = true
    ref.current!.computeBoundingSphere()
  }, [seats])

  // Colours follow the showtime (taken seats) and the selection.
  useLayoutEffect(() => {
    const colour = new Color()
    seats.forEach((seat, i) => {
      if (seat.id === selectedSeatId) colour.copy(COLOURS.selected)
      else if (isSeatTaken(showtimeId, seat.id)) colour.copy(COLOURS[type]).lerp(TAKEN_TINT, 0.75)
      else colour.copy(COLOURS[type])
      ref.current!.setColorAt(i, colour)
    })
    ref.current!.instanceColor!.needsUpdate = true
  }, [seats, type, showtimeId, selectedSeatId])

  return (
    <instancedMesh ref={ref} args={[geometry, undefined, seats.length]}>
      {/* White base colour: the per-instance colour does the tinting. Rough = velvet-ish. */}
      <meshStandardMaterial color="white" roughness={0.85} />
    </instancedMesh>
  )
}

export function Seats() {
  return (
    <>
      <SeatGroup type="standard" createGeometry={createStandardSeat} />
      <SeatGroup type="recliner" createGeometry={createReclinerSeat} />
    </>
  )
}
