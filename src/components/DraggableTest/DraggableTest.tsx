import React, { useState, useRef, useEffect } from 'react'
import * as Utils from 'utils'
import { CustomDragEvent, Draggable } from 'components'

export function DraggableTest() {
  const draggableRef1 = useRef(null)
  const draggableRef2 = useRef(null)
  const draggableRef3 = useRef(null)

  const fixHorizontal = (height: number, shouldTrack = true) => {
    const fixedCallback = (ev: CustomDragEvent) => {
      const newPos = [ev.newPosition[0], height] as Utils.Point

      const allRefs = [draggableRef1, draggableRef2, draggableRef3]

      if (shouldTrack) {
        allRefs.forEach((ref) => {
          const el = ref.current as HTMLElement | null

          if (!el) {
            return
          }

          el.style.left = `${newPos[0]}px`
        })
      }

      return newPos
    }
    return {
      onDragStart: fixedCallback,
      onDragEnd: fixedCallback,
      onDrag: fixedCallback,
    }
  }

  const [draggableBingPos, setDraggableBingPos] = useState<Utils.Point>([
    200, 200,
  ])

  useEffect(() => {
    setTimeout(() => setDraggableBingPos([600, 200]), 2000)
  }, [])

  return (
    <div className="appContainer">
      <div>react app</div>
      <Draggable initialPos={[200, 300]}>
        <div className="draggableBlock">Drag me!</div>
      </Draggable>

      <Draggable initialPos={draggableBingPos} {...fixHorizontal(200, false)}>
        <div className="draggableBlock">Drag horizontal</div>
      </Draggable>

      <Draggable
        ref={draggableRef1}
        initialPos={[200, 500]}
        {...fixHorizontal(500)}
      >
        <div className="draggableBlock">Draggable bind</div>
      </Draggable>

      <Draggable
        ref={draggableRef2}
        initialPos={[200, 700]}
        {...fixHorizontal(700)}
      >
        <div className="draggableBlock">Draggable bind 1</div>
      </Draggable>

      <Draggable
        ref={draggableRef3}
        initialPos={[200, 900]}
        {...fixHorizontal(900)}
      >
        <div className="draggableBlock">Draggable bind 2</div>
      </Draggable>
    </div>
  )
}
