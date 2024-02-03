export interface ITimelineFragment<DataType> {
  id?: string | number
  start: number
  end: number
  data: DataType
}

export type TemplateFragmentData = {
  label: string
  key: string
}

export const timelineRows = [
  'audio',
  'gesture',
  'cameraZoom',
  'clothes',
  'background',
  'unknown',
  'text',
] as const

export type TimelineKeys = (typeof timelineRows)[number]

export type TestTimelineData = {
  [key in TimelineKeys]: ITimelineFragment<TemplateFragmentData>[]
}

export type SnapPoints = {
  [key in TimelineKeys]: number[]
}
