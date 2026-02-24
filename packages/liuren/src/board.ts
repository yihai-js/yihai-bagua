import type { LiurenBoard, LiurenOptions } from './types'
import { computeDestiny } from './destiny'
import { resolveGuiGodType, setGuiGods } from './guigod'
import { computeLegend, isFuyin } from './legend'
import { setJianChu, setOuterGan, setTaiyin, setTwelvePalaces } from './outer'
import { computeFourPillars } from './pillar'
import { dateToJd, initPalaces, resolveIsSolar, resolveTaiyinZhi, resolveYuejiang, setTianpan } from './yuejiang'

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
 * 9. 十二建排布
 * 10. 十二宫排布
 * 11. 太阴标记
 * 12. 三传计算
 * 13. 时运命计算
 */
export function buildLiurenBoard(options: LiurenOptions): LiurenBoard {
  const { datetime, keyGanZhi, shengXiao, guiGodType: rawGuiGodType } = options

  // 1. Date → JD
  const jd = dateToJd(datetime)

  // 2. 四柱干支
  const fourPillars = computeFourPillars(jd)
  const hourZhi = fourPillars.hour.zhi

  // 3. 月将地支
  const yuejiangZhi = resolveYuejiang(jd)

  // 4. 贵人阴阳类型
  const resolvedGuiGodType = rawGuiGodType === 'yang' || rawGuiGodType === 'yin'
    ? rawGuiGodType
    : resolveGuiGodType(hourZhi)

  // 5. 地盘初始化
  let palaces = initPalaces()

  // 6. 天盘排布
  palaces = setTianpan(palaces, yuejiangZhi, hourZhi)

  // 7. 十二神将排布
  palaces = setGuiGods(palaces, keyGanZhi.gan, yuejiangZhi, hourZhi, resolvedGuiGodType)

  // 8. 外天干排布
  palaces = setOuterGan(palaces, keyGanZhi, yuejiangZhi, hourZhi)

  // 9. 十二建排布
  palaces = setJianChu(palaces, keyGanZhi.zhi)

  // 10. 十二宫排布
  const isSolar = resolveIsSolar(jd)
  palaces = setTwelvePalaces(palaces, yuejiangZhi, keyGanZhi.zhi, isSolar)

  // 11. 太阴标记
  const taiyinZhi = resolveTaiyinZhi(jd)
  palaces = setTaiyin(palaces, taiyinZhi)

  // 12. 三传计算
  const fuyin = isFuyin(palaces)
  const legend = computeLegend(palaces, keyGanZhi)

  // 13. 时运命计算
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
