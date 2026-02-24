/**
 * Lunar module - 农历模块
 *
 * 包含农历日期类、节气计算、干支计算等功能
 */

// 日历计算 - 类型导出
export type { LunarDateInfo, LunarYearData } from './calendar'

// 日历计算
export {
  calculateLunarYear,
  clearLunarYearCache,
  getLunarDateInfo,
} from './calendar'

// 节日数据 - 类型导出
export type { DateFestivals, FestivalInfo } from './festival'

// 节日数据
export {
  FestivalType,
  getAllFestivals,
  getLunarFestivals,
  getSolarFestivals,
  getWeekFestivals,
  LUNAR_FESTIVALS,
  SOLAR_FESTIVALS,
  WEEK_FESTIVALS,
} from './festival'

// 干支计算 - 类型导出
export type { FullGanZhiInfo, GanZhiInfo } from './gan-zhi'
export type { GanZhi } from '@yhjs/bagua'

// 干支计算
export {
  DI_ZHI,
  ganZhiToIndex,
  getDayGanZhi,
  getFullGanZhi,
  getGanZhi,
  getHourGanZhi,
  getMonthGanZhi,
  getShengXiao,
  getXingZuo,
  getYearGanZhi,
  getYearGanZhiBySpring,
  JIA_ZI_TABLE,
  SHENG_XIAO,
  TIAN_GAN,
  XING_ZUO,
} from './gan-zhi'

// 核心类
export { lunar, LunarDate } from './lunar-date'

// 实朔实气计算
export {
  calculateQiHigh,
  calculateQiLow,
  calculateShuoHigh,
  calculateShuoLow,
  calculateShuoQi,
  LUNAR_DAY_NAMES,
  LUNAR_MONTH_NAMES,
  MOON_PHASE_NAMES,
  QI_KB,
  SHUO_KB,
  SOLAR_TERM_NAMES,
} from './solar-term'
