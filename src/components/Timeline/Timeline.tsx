import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Draggable } from 'components'

import {
  ITimelineFragment,
  TemplateFragmentData,
  TimelineKeys,
  TestTimelineData,
  SnapPoints,
  timelineRows,
} from './timelineTypes'

import { TimelineFragment } from './TimelineFragment'

import * as Utils from 'utils'

import './Timeline.scss'

function generateRandomFragment(): ITimelineFragment<TemplateFragmentData> {
  const start = Math.random() * 60 * 4 - 60 * 2
  const end = start + Math.random() * 60

  const randomId = Math.random()

  return {
    id: randomId,
    start,
    end,
    data: {
      label: Utils.getRandomWordPair(),
      key: Math.random().toString(),
    },
  }
}

function getEmptyTimeline() {
  return timelineRows.reduce((prev, key) => {
    return { ...prev, [key]: [] }
  }, {}) as TestTimelineData
}

function getEmptySnappoints() {
  return timelineRows.reduce((prev, key) => {
    return { ...prev, [key]: [] }
  }, {}) as SnapPoints
}

export function TimelineComponent() {
  // min timeline length in seconds
  const [timelineMinLength, setTimelineMinLength] = useState(60)

  const [elRect, setElRect] = useState<DOMRect>()

  const [timelineLength, setTimelineLength] = useState(timelineMinLength)

  // how many seconds visible within timeline
  const [timelineScale, setTimelineScale] = useState(60)
  //
  const [timelinePosition, setTimelinePosition] = useState(0)

  const componentRef = useRef(null)

  const [fragments, setFragments] =
    useState<TestTimelineData>(getEmptyTimeline())

  useEffect(() => {
    const newFragments: TestTimelineData = getEmptyTimeline()

    timelineRows.forEach((rowName) => {
      const fragments = new Array(4).fill(0).map(() => generateRandomFragment())
      newFragments[rowName] = fragments
    })

    setFragments(newFragments)
  }, [])

  useEffect(() => {
    if (!componentRef.current) {
      return
    }

    const el = componentRef.current as HTMLElement

    setElRect(el.getBoundingClientRect())
  }, [componentRef])

  const secondsToTimeMark = (_seconds: number) => {
    const sign = Math.sign(_seconds) < 0 ? '-' : ''
    _seconds = Math.abs(_seconds)
    const minutes = `${((_seconds / 60) | 0).toString()}`
    const seconds = `0${(_seconds % 60 | 0).toString()}`

    return `${sign}${minutes}:${seconds.slice(seconds.length - 2)}`
  }

  const timeToPixels = (time: number) => {
    if (!elRect) {
      return 0
    }
    const timelineWidth = elRect.width

    return (timelineWidth * ((time - timelinePosition) / timelineScale)) | 0
  }

  const pixelsToTime = (pixels: number) => {
    const timelineWidth = elRect!.width
    return (pixels / timelineWidth) * timelineScale + timelinePosition
  }

  const renderTimeHints = () => {
    if (!elRect) {
      return
    }

    const timelineStep = 10
    // const hintStep = elDimensions.width /
    const hintMarks: number[] = []

    const subMarks: number[] = []

    let currTime = Math.floor(timelinePosition / 10) * 10

    let subMarkCurrTime = Math.floor(timelinePosition / 10) * 10

    while (currTime < timelinePosition + timelineScale) {
      hintMarks.push(currTime)

      currTime += timelineStep
    }

    while (subMarkCurrTime < timelinePosition + timelineScale) {
      subMarks.push(subMarkCurrTime)
      subMarkCurrTime += timelineStep / 10
    }

    return (
      <>
        {subMarks.map((mark, i) => {
          const leftOffsed = timeToPixels(mark)
          return (
            <div
              className="subBullet"
              style={{ left: `${leftOffsed}px` }}
              key={`subBullet-${i}`}
            />
          )
        })}
        {hintMarks.map((mark, i) => {
          const leftOffsed = timeToPixels(mark)
          return (
            <div
              className="hint"
              style={{ left: `${leftOffsed}px` }}
              key={`hintBullet-${i}`}
            >
              <div className="hintText">{secondsToTimeMark(mark)}</div>
              <div className="hintBullet" />
            </div>
          )
        })}
      </>
    )
  }

  function handleTimelineScroll(ev: WheelEvent) {
    if (!elRect) {
      return
    }

    const delta = (10 * Math.sign(ev.deltaY)) / (elRect!.width / timelineScale)

    // @ts-ignore
    ev.active = true

    ev.preventDefault()
    ev.stopPropagation()

    if (ev.ctrlKey) {
      setTimelineScale((prevScale) => {
        const newScale = prevScale + delta

        // persist position under cursor
        setTimelinePosition((prevPosition) => {
          const mouseX = ev.clientX - elRect!.left
          return prevPosition - delta * (mouseX / elRect!.width)
        })

        return newScale
      })
    } else {
      setTimelinePosition((p) => p + delta)
    }
  }

  const timelineRef = useRef(null)

  useEffect(() => {
    if (!timelineRef.current || !elRect) {
      return
    }

    const el = timelineRef.current as HTMLElement

    el.addEventListener('wheel', handleTimelineScroll, true)

    return () => {
      el.removeEventListener('wheel', handleTimelineScroll)
    }
  }, [timelineRef, elRect])

  const [isMiddleDrag, setIsMiddleDrag] = useState(false)
  const [middleDragStartPos, setMiddleDragStartPos] = useState(0)
  const [timelineDragStartPosition, setTimelineDragStartPosition] = useState(0)

  const handleMiddleClick = (ev: React.MouseEvent) => {
    if (ev.button === 1) {
      setIsMiddleDrag(true)
      setMiddleDragStartPos(ev.clientX)
      setTimelineDragStartPosition(timelinePosition)
    }
  }

  const handleMouseMove = (ev: React.MouseEvent) => {
    if (!elRect) {
      return
    }

    if (isMiddleDrag) {
      const mouseDeltaTime =
        ((ev.clientX - middleDragStartPos) / elRect.width) * timelineScale

      setTimelinePosition(timelineDragStartPosition - mouseDeltaTime)
    }
  }

  const handleMiddleUp = (ev: React.MouseEvent) => {
    if (ev.button === 1) {
      setIsMiddleDrag(false)
    }
  }

  const handleFragmentDrag = (
    fragment: ITimelineFragment<TemplateFragmentData>,
    newTime: number,
    key: TimelineKeys
  ) => {
    setFragments((p) => {
      const newFragments = p[key].map((frag) => {
        if (frag.data.key !== fragment.data.key) {
          return frag
        }

        return {
          ...fragment,
          start: newTime,
          end: newTime + frag.end - frag.start,
        }
      })

      return {
        ...p,
        [key]: newFragments,
      }
    })
  }

  const generateSnapPoints = (
    exclude: ITimelineFragment<TemplateFragmentData>
  ) => {
    const newSnapPoints = getEmptySnappoints()

    timelineRows.forEach((key) => {
      fragments[key].forEach((frag) => {
        if (frag !== exclude) {
          newSnapPoints[key].push(frag.start, frag.end)
        }
      })
    })

    return newSnapPoints
  }

  return (
    <div className="TimelineContainer">
      Timeline
      <div className="hideScrollbar">Scrollable!</div>
      <div
        className="tracksContainer"
        onMouseDown={handleMiddleClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMiddleUp}
        ref={timelineRef}
      >
        <div className="timeHints" ref={componentRef}>
          {renderTimeHints()}
        </div>
        {elRect &&
          timelineRows.map((key) => {
            return (
              <React.Fragment key={key}>
                <button className="addTrackButton">+</button>
                <div className="trackRow">
                  {fragments[key].map((f) => (
                    <TimelineFragment
                      key={f.data.key}
                      shouldSnap
                      snapPoints={generateSnapPoints(f)}
                      fragment={f}
                      parentRect={elRect}
                      timelinePosition={timelinePosition}
                      timelineScale={timelineScale}
                      label={f.data.label}
                      onDragEnd={(newTime) =>
                        handleFragmentDrag(f, newTime, key)
                      }
                    />
                  ))}
                </div>
              </React.Fragment>
            )
          })}
      </div>
    </div>
  )
}
