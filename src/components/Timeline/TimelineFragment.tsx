import React, { useEffect, useRef, useState } from 'react'

import { ITimelineFragment, SnapPoints, timelineRows } from './timelineTypes'

import './TimelineFragment.scss'

const emptyImage = document.createElement('img')

export interface TimelineFragmentProps<T> {
  parentRect: DOMRect
  fragment: ITimelineFragment<T>
  timelinePosition: number
  timelineScale: number
  label: string
  snapPoints?: SnapPoints
  onDragEnd?: (newTime: number) => void
  shouldSnap?: boolean
  // snapDistance in px
  snapDistance?: number
}

export function TimelineFragment<T>(props: TimelineFragmentProps<T>) {
  const {
    parentRect,
    fragment,
    label,
    timelinePosition,
    timelineScale,
    snapPoints,
    shouldSnap = false,
    snapDistance = 30,
  } = props

  const wrapperRef = useRef(null)

  const fragmentRef = useRef(null)

  const timeToPixels = (time: number) => {
    const timelineWidth = parentRect.width

    return (timelineWidth * ((time - timelinePosition) / timelineScale)) | 0
  }

  const pixelsToDuration = (pixels: number) => {
    const timelineWidth = parentRect.width

    return (pixels / timelineWidth) * timelineScale
  }

  const pixelsToTime = (pixels: number) => {
    const timelineWidth = parentRect.width

    return (pixels / timelineWidth) * timelineScale + timelinePosition
  }

  const [mouseDragStart, setMouseDragStart] = useState(0)

  const [dragging, setDragging] = useState(false)

  function onDragStart(ev: React.MouseEvent) {
    if (!wrapperRef?.current || !fragmentRef?.current || dragging) {
      return
    }

    setDragging(true)

    const wrapperEl = wrapperRef.current as HTMLElement
    const fragmentEl = fragmentRef.current as HTMLElement

    fragmentEl.classList.add('elevated')

    setMouseDragStart(ev.clientX)
  }

  function findSnapPoint(
    startTime: number,
    endTime: number
  ): number | undefined {
    if (!snapPoints) {
      return undefined
    }

    const snapDistanceTime = pixelsToDuration(snapDistance)

    let closestSnapPoint: number | undefined = undefined

    timelineRows.forEach((key) => {
      snapPoints[key].forEach((snapPoint) => {
        if (Math.abs(snapPoint - startTime) <= snapDistanceTime) {
          closestSnapPoint = timeToPixels(snapPoint)
        }

        if (Math.abs(snapPoint - endTime) <= snapDistanceTime) {
          closestSnapPoint = timeToPixels(snapPoint - endTime + startTime)
        }
      })
    })

    return closestSnapPoint
  }

  // modifiers key press not regestered on drag end
  let ctrlKeyPressed = false

  function onDrag(ev: React.MouseEvent) {
    if (!wrapperRef?.current || !fragmentRef?.current || !dragging) {
      return
    }

    const wrapperEl = wrapperRef.current as HTMLElement
    const fragmentEl = fragmentRef.current as HTMLElement

    if (ev.clientX == 0 && ev.clientY == 0) {
      return
    }
    let newPosition = ev.clientX - mouseDragStart + startPosition

    const newPositionTime = pixelsToTime(newPosition)

    let endPositionTime = newPositionTime - fragment.start + fragment.end

    if (shouldSnap && ev.ctrlKey) {
      ctrlKeyPressed = true
      const snapPoint = findSnapPoint(newPositionTime, endPositionTime)
      if (snapPoint !== undefined) {
        newPosition = snapPoint
      }
    } else {
      ctrlKeyPressed = false
    }

    wrapperEl.style.left = `${newPosition}px`
  }

  function onDragEnd(ev: React.MouseEvent) {
    if (!wrapperRef?.current || !fragmentRef?.current || !dragging) {
      return
    }

    setDragging(false)

    const wrapperEl = wrapperRef.current as HTMLElement
    const fragmentEl = fragmentRef.current as HTMLElement

    fragmentEl.classList.remove('elevated')

    if (props.onDragEnd) {
      let newPosition = ev.clientX - mouseDragStart + startPosition

      const newPositionTime = pixelsToTime(newPosition)

      let endPositionTime = newPositionTime - fragment.start + fragment.end

      if (shouldSnap && ctrlKeyPressed) {
        console.log('end')
        console.log(ev)
        const snapPoint = findSnapPoint(newPositionTime, endPositionTime)
        if (snapPoint !== undefined) {
          newPosition = snapPoint
        }
      }

      const newTime = pixelsToTime(newPosition)

      props.onDragEnd(newTime)
    }
  }

  const startPosition = timeToPixels(fragment.start)
  const width = timeToPixels(fragment.end) - startPosition

  return (
    <>
      {dragging && (
        <div
          className="dragWrapper"
          onMouseMove={onDrag}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
        />
      )}
      <div
        ref={wrapperRef}
        onMouseDown={onDragStart}
        style={{ left: startPosition, width: width }}
        className="timelineFragmentWrapper"
        title={label}
      >
        <div ref={fragmentRef} className="timelineFragment">
          {label}
        </div>
      </div>
    </>
  )
}
