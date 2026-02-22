import type { GodInfo } from '../types'
import { Wuxing } from '../base/wuxing'

export const GODS: readonly GodInfo[] = [
  { name: '值符', shortName: '符', wuxing: Wuxing.木 },
  { name: '腾蛇', shortName: '蛇', wuxing: Wuxing.火 },
  { name: '太阴', shortName: '阴', wuxing: Wuxing.金 },
  { name: '六合', shortName: '六', wuxing: Wuxing.木 },
  { name: '白虎', shortName: '白', wuxing: Wuxing.金 },
  { name: '玄武', shortName: '玄', wuxing: Wuxing.水 },
  { name: '九地', shortName: '地', wuxing: Wuxing.土 },
  { name: '九天', shortName: '天', wuxing: Wuxing.火 },
]
