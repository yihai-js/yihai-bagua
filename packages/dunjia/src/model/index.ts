export { doorIndexFromAfterNum, DOORS } from './door'
export { GODS } from './god'
export { starIndexFromAfterNum, STARS } from './star'

/**
 * 九星/八门的下一个索引
 * 特殊处理: 天禽星(8)/中门(8) 在排盘遍历中的跳转
 * - 当前为 8 (天禽/中门) → 下一个是 6 (天柱/惊门)
 * - 当前为 4 (天英/景门) → 下一个是 8 (天禽/中门)
 */
export function nextStarDoorIndex(index: number, isSpecial: boolean): number {
  if (!isSpecial)
    return (index + 1) % 8
  if (index === 8)
    return 6
  if (index === 4)
    return 8
  return (index + 1) % 8
}

export function prevStarDoorIndex(index: number, isSpecial: boolean): number {
  if (!isSpecial)
    return (index + 7) % 8
  if (index === 8)
    return 4
  if (index === 6)
    return 8
  return (index + 7) % 8
}
