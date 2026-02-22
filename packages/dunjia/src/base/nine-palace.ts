export const PALACE_BAGUA_NAMES = ['巽', '离', '坤', '震', null, '兑', '艮', '坎', '乾'] as const
export const PALACE_AFTER_NUMS = [4, 9, 2, 3, 5, 7, 8, 1, 6] as const

const CLOCK_POINTERS: readonly [number, number][] = [
  [1, 3],
  [2, 0],
  [5, 1],
  [0, 6],
  [5, 1],
  [8, 2],
  [3, 7],
  [6, 8],
  [7, 5],
]

export const CENTER_PALACE = 4
export const EXTRA_PALACE = 2

let afterNumPointers: { prev: number, next: number }[] | null = null

function ensureAfterNumPointers(): { prev: number, next: number }[] {
  if (afterNumPointers)
    return afterNumPointers
  const len = PALACE_BAGUA_NAMES.length
  afterNumPointers = PALACE_AFTER_NUMS.map((num) => {
    const prevNum = ((num - 1 + len - 1) % len) + 1
    const nextNum = (num % len) + 1
    return {
      prev: PALACE_AFTER_NUMS.indexOf(prevNum),
      next: PALACE_AFTER_NUMS.indexOf(nextNum),
    }
  })
  return afterNumPointers
}

export function getIndexByAfterNum(num: number): number {
  const index = PALACE_AFTER_NUMS.indexOf(num)
  return index >= 0 ? index : 0
}

export function fixedIndex(index: number): number {
  return index === CENTER_PALACE ? EXTRA_PALACE : index
}

export function getOffsetPalaceNum(num: number, offset: number): number {
  const len = PALACE_BAGUA_NAMES.length
  return ((num - 1 + ((offset % len) + len)) % len) + 1
}

export function traverseByClock(
  start: number,
  count: number,
  callback: (palaceIndex: number, step: number) => void | false,
): void {
  const isForward = count > 0
  const len = Math.abs(count)
  let current = start
  for (let i = 0; i < len; i++) {
    if (callback(current, i) === false)
      break
    const [go, anti] = CLOCK_POINTERS[current]
    current = isForward ? go : anti
  }
}

export function traverseByAfterNum(
  start: number,
  count: number,
  callback: (palaceIndex: number, step: number) => void | false,
): void {
  const pointers = ensureAfterNumPointers()
  const isForward = count > 0
  const len = Math.abs(count)
  let current = start
  for (let i = 0; i < len; i++) {
    if (callback(current, i) === false)
      break
    const ptr = pointers[current]
    current = isForward ? ptr.next : ptr.prev
  }
}
