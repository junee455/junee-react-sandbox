export type Point = [number, number]

export function findElCener(el: HTMLElement) {
  const rect = el.getBoundingClientRect()

  return {
    x: rect.x + ((el.clientWidth / 2) | 0),
    y: rect.y + ((el.clientHeight / 2) | 0),
  }
}

export function drawLine(
  a: Point,
  b: Point,
  context2D: CanvasRenderingContext2D
) {
  context2D.beginPath()
  context2D.moveTo(...a)
  context2D.lineTo(...b)
  context2D.stroke()
}

export function flatObj(a: any, ...keys: (keyof Partial<typeof a>)[]) {
  return keys.map((key) => a[key])
}

export function getRandomWordPair() {
  const randomWordFirst = [
    'sister',
    'mint',
    'disapprove',
    'force',
    'legal',
    'title',
    'highfalutin',
    'mass',
    'receptive',
    'airport',
  ]

  const randomWordSecond = [
    'consist',
    'sheep',
    'matter',
    'lonely',
    'wholesale',
    'harbor',
    'horn',
    'furniture',
    'moon',
    'pet',
  ]

  return `${
    randomWordFirst[Math.floor(Math.random() * randomWordFirst.length)]
  } ${randomWordSecond[Math.floor(Math.random() * randomWordSecond.length)]}`
}

export function downloadFile(file: Blob) {
  const inputEl = document.createElement('a')
  const url = URL.createObjectURL(file)
  inputEl.download = 'graph.json'
  inputEl.href = url
  inputEl.click()
  inputEl.remove()
  URL.revokeObjectURL(url)
}

export function uploadJson<T>(onLoad: (jsonData: T) => void) {
  const input = document.createElement('input') as HTMLInputElement
  input.type = 'file'
  input.click()
  input.addEventListener('change', (ev) => {
    console.log((ev.target as HTMLInputElement).files)
    const file = (ev.target as HTMLInputElement).files?.item(0) as File
    const reader = new FileReader()
    reader.readAsText(file)
    reader.addEventListener('loadend', (ev) => {
      const jsonData = JSON.parse(ev.target!.result as string) as T
      onLoad(jsonData)
    })
  })
  input.remove()
}

export function downloadJson(jsonObj: any) {
  const blob = new Blob([JSON.stringify(jsonObj, null, ' ')], {
    type: 'application/json',
  })

  downloadFile(blob)
}
