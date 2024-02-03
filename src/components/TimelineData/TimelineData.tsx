import { useEffect, useState } from 'react'
import './TimelineData.scss'

export const position = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'middle-center',
] as const

export type Position = (typeof position)[number]

export type TimelineFragment<ValueType> = {
  value: ValueType
  runtimeId: string
  bindedId?: string
}

export type AnimationValue = {
  name: string
  id: string
}

export type PictureValue = {
  position: Position
  src: string
}

export type SubtitleValue = {
  text: string
  position: Position
}

export type Timeline = {
  subtitle: TimelineFragment<SubtitleValue>[]
  animation: TimelineFragment<AnimationValue>[]
  picture: TimelineFragment<PictureValue>[]
  id: string
}

export type ProjectData = {
  timelines: Timeline[]
  name: string
  id?: string
}

export type TimelineKeys = Exclude<
  keyof ProjectData['timelines'][number],
  'name' | 'id'
>

export const timelineFragmentKeys = [
  'subtitle',
  'animation',
  'picture',
] as TimelineKeys[]

export function ProjectData(props: { timeline: Timeline }) {
  const { timeline } = props

  return (
    <div>
      {timelineFragmentKeys.map((key) => (
        <div key={`timelineKey-${key}`}>{timeline[key].length}</div>
      ))}
    </div>
  )
}

type TimelineFragmentTypes = SubtitleValue | AnimationValue | PictureValue

function getBlockType<ValueType extends Timeline[TimelineKeys]>(
  block: ValueType,
  name: TimelineKeys
) {}

const mockProjectData: ProjectData = {
  timelines: [
    {
      subtitle: [
        {
          value: {
            position: 'bottom-left',
            text: 'mock subtitle text',
          },
          runtimeId: 'subtitleRuntimeId',
        },
      ],
      animation: [
        {
          value: {
            name: 'mock animation',
            id: 'mock anim id',
          },
          runtimeId: 'animationRuntimeId',
        },
      ],
      picture: [
        {
          value: {
            src: 'mock src',
            position: 'bottom-left',
          },
          runtimeId: 'pictureRuntimeId',
        },
      ],
      id: '0',
    },
  ],
  name: 'Mock timeline',
}

function ActiveBlock(props: {
  fragment?: TimelineFragment<TimelineFragmentTypes>
  timelineKey?: TimelineKeys
}) {
  const { fragment, timelineKey } = props

  return (
    <div>
      {!fragment && <div>No fragment selected</div>}
      {!!fragment && (
        <div>
          <div>type: {timelineKey}</div>
        </div>
      )}
    </div>
  )
}

export function TimelineExample() {
  const mockTimeine = mockProjectData.timelines[0]

  const [selectedFragment, setSelectedFragment] = useState<{
    fragment: TimelineFragment<TimelineFragmentTypes>
    timelineKey: TimelineKeys
  }>()

  const selectFragment = (
    fragment: TimelineFragment<TimelineFragmentTypes>,
    timelineKey: TimelineKeys
  ) => {
    setSelectedFragment({
      fragment,
      timelineKey,
    })
  }

  return (
    <div className="TimelineExample">
      <div className="topBlock">
        <div className="menu">menu</div>
        <div className="preview">preview</div>
        <div className="activeBlock">
          <ActiveBlock {...selectedFragment} />
        </div>
      </div>
      <div className="timeline">
        <div className="row">
          {mockTimeine.animation.map((val) => (
            <div
              className="fragment"
              key={val.runtimeId}
              onClick={() => selectFragment(val, 'animation')}
            >
              {val.value.name}
            </div>
          ))}
        </div>
        <div className="row">
          {mockTimeine.picture.map((val) => (
            <div
              className="fragment"
              key={val.runtimeId}
              onClick={() => selectFragment(val, 'picture')}
            >
              {val.value.src}
            </div>
          ))}
        </div>
        <div className="row">
          {mockTimeine.subtitle.map((val) => (
            <div
              className="fragment"
              key={val.runtimeId}
              onClick={() => selectFragment(val, 'subtitle')}
            >
              {val.value.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // return (
  //   <div>
  //     <h3>timeline example</h3>
  //     <ProjectData timeline={mockProjectData.timelines[0]} />
  //     <ActiveBlock
  //       block={mockProjectData.timelines[0].animation}
  //       name={'animation'}
  //     />
  //   </div>
  // )
}
