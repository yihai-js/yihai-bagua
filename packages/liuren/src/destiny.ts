import type { Zhi } from '@yhjs/bagua'
import type { DestinyResult } from './types'

/**
 * 计算时运命（时/运/命三要素）
 *
 * @param hourZhi    - 时支
 * @param yuejiangZhi - 月将地支
 * @param shengXiao  - 生肖地支（可选，默认取时支）
 * @returns 时运命结果
 */
export function computeDestiny(
  hourZhi: Zhi,
  yuejiangZhi: Zhi,
  shengXiao?: Zhi,
): DestinyResult {
  return {
    time: hourZhi,
    destiny: yuejiangZhi,
    live: shengXiao ?? hourZhi,
  }
}
