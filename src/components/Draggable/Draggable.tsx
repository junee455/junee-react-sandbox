import React, { forwardRef, useEffect, useRef, useState } from 'react'

import * as Utils from 'utils'

export type CustomDragEvent = {
  event: DragEvent
  newPosition: [number, number]
}

export type DraggablePivot = 'center'

type DraggableProps = React.PropsWithChildren<{
  initialPos?: Utils.Point
  pivot?: DraggablePivot
  onDragStart?: (ev: CustomDragEvent) => Utils.Point
  onDrag?: (ev: CustomDragEvent) => Utils.Point
  onDragEnd?: (ev: CustomDragEvent) => Utils.Point
}>

export const Draggable = forwardRef<any, DraggableProps>(function Draggable(
  props: DraggableProps,
  inputRef?: any
) {
  const {
    onDrag,
    onDragStart,
    onDragEnd,
    initialPos: initialPosProp,
    pivot,
  } = props

  const componentRef = useRef(null)

  const currentRef = inputRef || componentRef

  const [initialPos, setInitialPos] = useState(initialPosProp || [0, 0])

  useEffect(() => {
    setInitialPos(initialPosProp || [0, 0])
  }, [initialPosProp])

  useEffect(() => {
    if (!currentRef?.current) {
      return
    }

    const dragNdropEl = currentRef.current as HTMLElement

    const dragImg = document.createElement('img')

    let cursorStartCords = [0, 0]

    let elStartCords = [0, 0]

    const getPivotOffset = (el: HTMLElement): Utils.Point => {
      const elRect = el.getBoundingClientRect()

      let pivotOffset = [0, 0]

      if (pivot === 'center') {
        pivotOffset[0] += elRect.width / 2
        pivotOffset[1] += elRect.height / 2
      }

      return pivotOffset as Utils.Point
    }

    const getElPosition = (el: HTMLElement) => {
      const elRect = el.getBoundingClientRect()

      const elCenter = [elRect.x, elRect.y]

      const pivotOffset = getPivotOffset(el)

      elCenter[0] += pivotOffset[0]
      elCenter[1] += pivotOffset[1]

      return elCenter
    }

    const pivotOffset = getPivotOffset(dragNdropEl)

    setInitialPos([
      initialPos[0] - pivotOffset[0],
      initialPos[1] - pivotOffset[1],
    ])

    const positionElement = (el: HTMLElement, point: Utils.Point) => {
      const pivotOffset = getPivotOffset(el)

      el.style.left = `${point[0] - pivotOffset[0]}px`
      el.style.top = `${point[1] - pivotOffset[1]}px`
    }

    const getNewElPosition = (ev: DragEvent): Utils.Point => {
      const mouseDelta = [
        ev.clientX - cursorStartCords[0],
        ev.clientY - cursorStartCords[1],
      ]

      const newPos = [
        elStartCords[0] + mouseDelta[0],
        elStartCords[1] + mouseDelta[1],
      ] as Utils.Point

      return newPos
    }

    const processDragEv = (evName: string, event: DragEvent) => {
      const callbacks = {
        dragstart: onDragStart,
        drag: onDrag,
        dragend: onDragEnd,
      }

      const el = event.target as HTMLElement

      let newPosition = getNewElPosition(event)
      const callback = callbacks[evName as keyof typeof callbacks]

      if (callback) {
        newPosition = callback({
          event,
          newPosition,
        })
      }

      positionElement(el, newPosition)
    }

    dragNdropEl.addEventListener('dragstart', (ev) => {
      const el = ev.target as HTMLElement
      elStartCords = [...getElPosition(el)]
      cursorStartCords = [ev.clientX, ev.clientY]
      ev.dataTransfer?.setDragImage(dragImg, 0, 0)

      processDragEv('dragstart', ev)
    })

    dragNdropEl.addEventListener('drag', (ev) => {
      // strange bug on drag end
      if (ev.clientX === 0 && ev.clientY === 0) {
        return
      }
      processDragEv('drag', ev)
    })

    dragNdropEl.addEventListener('dragend', (ev) => {
      processDragEv('dragend', ev)
    })
  }, [currentRef])

  return (
    <div
      ref={currentRef}
      draggable
      className="draggable"
      style={{
        left: initialPos[0],
        top: initialPos[1],
      }}
    >
      {props.children}
    </div>
  )
})
