import type { LiurenBoard, LiurenOptions } from './types'
import { computeDestiny } from './destiny'
import { resolveGuiGodType, setGuiGods } from './guigod'
import { computeLegend, isFuyin } from './legend'
import { setOuterGan } from './outer'
import { computeFourPillars } from './pillar'
import { dateToJd, initPalaces, resolveYuejiang, setTianpan } from './yuejiang'

/**
 * 大六壬排盘流水线
 *
 * 流程：
 * 1. Date → J2000 儒略日
 * 2. 四柱干支
 * 3. 月将地支
 * 4. 贵人阴阳类型
 * 5. 地盘初始化
 * 6. 天盘排布
 * 7. 十二神将排布
 * 8. 外天干排布
 * 9. 三传计算
 * 10. 时运命计算
 */
export function buildLiurenBoard(options: LiurenOptions): LiurenBoard {
  const { datetime, keyGanZhi, shengXiao, guiGodType: rawGuiGodType } = options

  // 1. Date → JD
  const jd = dateToJd(datetime)

  // 2. Four pillars
  const fourPillars = computeFourPillars(jd)
  const hourZhi = fourPillars.hour.zhi

  // 3. Yuejiang
  const yuejiangZhi = resolveYuejiang(jd)

  // 4. GuiGod type
  const resolvedGuiGodType = rawGuiGodType === 'yang' || rawGuiGodType === 'yin'
    ? rawGuiGodType
    : resolveGuiGodType(hourZhi)

  // 5. Ground disk
  let palaces = initPalaces()

  // 6. Tianpan
  palaces = setTianpan(palaces, yuejiangZhi, hourZhi)

  // 7. GuiGods (use keyGanZhi's gan for lookup)
  palaces = setGuiGods(palaces, keyGanZhi.gan, yuejiangZhi, hourZhi, resolvedGuiGodType)

  // 8. Outer gan
  palaces = setOuterGan(palaces, keyGanZhi, yuejiangZhi, hourZhi)

  // 9. Legend
  const fuyin = isFuyin(palaces)
  const legend = computeLegend(palaces, keyGanZhi)

  // 10. Destiny
  const destiny = computeDestiny(hourZhi, yuejiangZhi, shengXiao)

  return {
    meta: {
      datetime,
      fourPillars: {
        year: fourPillars.year,
        month: fourPillars.month,
        day: fourPillars.day,
        hour: fourPillars.hour,
      },
      yuejiangZhi,
      keyGanZhi,
      guiGodType: resolvedGuiGodType,
      isFuyin: fuyin,
    },
    palaces,
    legend,
    destiny,
  }
}
