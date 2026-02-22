/**
 * 排盘纯函数管道 - Board Pipeline Functions
 *
 * 实现奇门遁甲排盘的核心算法，采用纯函数管道架构：
 * resolveMeta -> initGroundGan -> initSkyGan -> initGods -> initStars -> initDoors -> initOutGan
 *
 * 每个函数接受 (palaces, meta) 参数并返回新的 palaces 数组（不可变）。
 */

import type { BoardMeta, BoardType, Palace, TimeBoardOptions } from '../types'
import {
  calculateLunarYear,
  ganZhiToIndex,
  getDayGanZhi,
  getHourGanZhi,
  getMonthGanZhi,
  getYearGanZhi,
  gregorianToJD,
  J2000,
  SOLAR_TERM_NAMES,
  TIAN_GAN,
} from '@yhjs/lunar'
import {
  CENTER_PALACE,
  EXTRA_PALACE,
  fixedIndex,
  getIndexByAfterNum,
  getOffsetPalaceNum,
  PALACE_AFTER_NUMS,
  PALACE_BAGUA_NAMES,
  traverseByAfterNum,
  traverseByClock,
} from '../base/nine-palace'
import { getXunFromGanZhiIndex, LIUYI_LIST } from '../base/xun'
import { doorIndexFromAfterNum, DOORS, GODS, nextStarDoorIndex, starIndexFromAfterNum, STARS } from '../model'

/* ------------------------------------------------------------------ */
/*  辅助函数                                                           */
/* ------------------------------------------------------------------ */

/**
 * 深拷贝宫位数组（浅拷贝每个 Palace 对象）
 */
function clonePalaces(palaces: readonly Palace[]): Palace[] {
  return palaces.map(p => ({ ...p }))
}

/**
 * Date -> J2000 儒略日
 */
function dateToJd(date: Date): number {
  // gregorianToJD returns absolute JD, we need J2000-relative
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600
  const dayFraction = hour / 24
  return gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate() + dayFraction) - J2000
}

/* ------------------------------------------------------------------ */
/*  createEmptyPalaceData                                              */
/* ------------------------------------------------------------------ */

/**
 * 创建 9 个空宫位数据
 */
export function createEmptyPalaceData(): Palace[] {
  const palaces: Palace[] = []
  for (let i = 0; i < 9; i++) {
    palaces.push({
      index: i,
      position: PALACE_AFTER_NUMS[i],
      name: PALACE_BAGUA_NAMES[i] ?? '中',
      groundGan: '',
      groundExtraGan: null,
      skyGan: '',
      skyExtraGan: null,
      star: null,
      door: null,
      god: null,
      outGan: null,
      outExtraGan: null,
      outerGods: [],
    })
  }
  return palaces
}

/* ------------------------------------------------------------------ */
/*  resolveMeta                                                        */
/* ------------------------------------------------------------------ */

/**
 * 根据节气索引判断阴阳遁
 * SOLAR_TERM_NAMES 从冬至(0)到大雪(23)，共24项
 * 冬至(0)~芒种(11) = 阳遁，夏至(12)~大雪(23) = 阴遁
 */
function determineYinYang(prevTermIndex: number): '阴' | '阳' {
  return prevTermIndex >= 12 ? '阴' : '阳'
}

/**
 * 获取当前日期所处的上一个节气索引（在 SOLAR_TERM_NAMES 中的位置）
 */
function getPrevTermIndex(jd: number): { index: number, name: string } {
  const yearData = calculateLunarYear(jd)
  // zhongQi[0..24] 是从冬至开始的 25 个节气时刻
  // 找到 jd 之前最近的节气
  let prevIndex = 0
  for (let i = 0; i < 24; i++) {
    if (jd >= yearData.zhongQi[i]) {
      prevIndex = i
    }
    else {
      break
    }
  }
  return {
    index: prevIndex,
    name: SOLAR_TERM_NAMES[prevIndex],
  }
}

/**
 * 计算时家奇门局数
 *
 * 时局计数规则（来自 timeDunjia.js initNum）:
 * - year 柱: 加年支序数+1
 * - month 柱: 加月柱的农历月建
 * - day 柱: 加农历日数
 * - hour 柱: 加时支序数+1
 * - minute 柱: 加分钟支序数+1 (暂不实现)
 *
 * 简化：对于标准 hour 时局，局数 = (年支+1) + 月建 + 农历日 + (时支+1)
 * 然后 mod 9，0 则取 9
 */
function calculateJuNumber(
  jd: number,
  type: BoardType,
  ganZhiPillars: { yearZhiIndex: number, monthZhiIndex: number, dayZhiIndex: number, hourZhiIndex: number },
): number {
  const len = 9 // PALACE_BAGUA_NAMES.length

  // 确定使用几柱
  const typeIndexMap: Record<BoardType, number> = {
    year: 0,
    month: 1,
    day: 2,
    hour: 3,
    minute: 4,
  }
  const keyIndex = typeIndexMap[type] ?? 3

  let count = 0
  const yearData = calculateLunarYear(jd)

  for (let i = 0; i <= keyIndex; i++) {
    let num: number
    if (i === 1) {
      // 月柱加农历月月建
      // 月建 = 月干支中的地支索引 + 1（原代码用 Lmyj -> lunarMonthSign）
      // 简化：使用月干支中的地支索引 + 1
      num = ganZhiPillars.monthZhiIndex + 1
    }
    else if (i === 2) {
      // 日柱加农历日数
      // 找到 jd 所在的农历月，计算农历日
      let monthIdx = Math.floor((jd - yearData.heSuo[0]) / 30)
      if (monthIdx < 13 && yearData.heSuo[monthIdx + 1] <= jd) {
        monthIdx++
      }
      if (monthIdx < 0)
        monthIdx = 0
      if (monthIdx > 13)
        monthIdx = 13
      num = Math.floor(jd - yearData.heSuo[monthIdx]) + 1
    }
    else if (i === 0) {
      num = ganZhiPillars.yearZhiIndex + 1
    }
    else if (i === 3) {
      num = ganZhiPillars.hourZhiIndex + 1
    }
    else {
      // minute (i === 4) - 暂用 0
      num = 0
    }
    count += num
  }

  return count % len === 0 ? len : count % len
}

/**
 * 从选项中解析盘面元数据
 */
export function resolveMeta(options: TimeBoardOptions): BoardMeta {
  const dt = options.datetime
  const type: BoardType = options.type ?? 'hour'
  const jd = dateToJd(dt)

  // 四柱干支
  const yearGZ = getYearGanZhi(jd)
  const monthGZ = getMonthGanZhi(jd)
  const dayGZ = getDayGanZhi(jd)
  const hourGZ = getHourGanZhi(jd)

  // 关键干支（根据局类型）
  const typeKeyMap: Record<BoardType, typeof yearGZ> = {
    year: yearGZ,
    month: monthGZ,
    day: dayGZ,
    hour: hourGZ,
    minute: hourGZ,
  }
  const keyGZ = typeKeyMap[type]

  // 阴阳遁
  const prevTerm = getPrevTermIndex(jd)
  const yinyang = determineYinYang(prevTerm.index)

  // 局数
  const juNumber = calculateJuNumber(jd, type, {
    yearZhiIndex: yearGZ.zhiIndex,
    monthZhiIndex: monthGZ.zhiIndex,
    dayZhiIndex: dayGZ.zhiIndex,
    hourZhiIndex: hourGZ.zhiIndex,
  })

  // 旬首
  const ganZhiIndex = ganZhiToIndex(keyGZ.ganZhi)
  const xunInfo = getXunFromGanZhiIndex(ganZhiIndex)

  return {
    type,
    datetime: dt,
    yinyang,
    juNumber,
    xunHead: xunInfo.name,
    xunHeadGan: xunInfo.head,
    ganZhi: keyGZ.ganZhi,
    solarTerm: prevTerm.name,
    moveStarOffset: 0,
  }
}

/* ------------------------------------------------------------------ */
/*  initGroundGan - 排地盘三奇六仪                                      */
/* ------------------------------------------------------------------ */

/**
 * 排地盘三奇六仪
 *
 * 从局数对应的宫位开始，阳遁顺排、阴遁逆排九宫
 * 在每个宫位填入六仪三奇（戊己庚辛壬癸丁丙乙）
 *
 * 返回值还附带临时属性用于后续步骤:
 * - _headStarIndex: 值符落宫索引
 * - _xunHeadGroundIndex: 地盘旬首落宫索引
 * - _headStarDoor: { starIndex, doorIndex }
 * - _isSpecialStar: 值符是否为天禽星
 */
export interface GroundGanResult {
  palaces: Palace[]
  headStarIndex: number
  xunHeadGroundIndex: number
  headStarDoorStarIndex: number
  headStarDoorDoorIndex: number
  isSpecialStar: boolean
}

export function initGroundGan(palaces: readonly Palace[], meta: BoardMeta): GroundGanResult {
  const result = clonePalaces(palaces)
  const isSolar = meta.yinyang === '阳'
  const len = PALACE_BAGUA_NAMES.length // 9
  const offset = isSolar ? len : -len

  const start = getIndexByAfterNum(meta.juNumber)

  let headStarIndex = 0
  let xunHeadGroundIndex = 0
  let headStarDoorStarIndex = 0
  let headStarDoorDoorIndex = 0
  let isSpecialStar = false

  // 关键干支的天干名
  const keyGanName = meta.ganZhi[0]
  const keyGanIndex = TIAN_GAN.indexOf(keyGanName as typeof TIAN_GAN[number])

  traverseByAfterNum(start, offset, (palaceIndex, step) => {
    const gan = LIUYI_LIST[step]
    result[palaceIndex].groundGan = gan
    result[palaceIndex].groundExtraGan = null

    // 地盘天干与旬首六仪相同时，确定值符值使门
    if (meta.xunHeadGan === gan) {
      const afterNum = PALACE_AFTER_NUMS[palaceIndex]
      headStarDoorStarIndex = starIndexFromAfterNum(afterNum)
      headStarDoorDoorIndex = doorIndexFromAfterNum(afterNum)
      isSpecialStar = headStarDoorStarIndex === STARS.length - 1

      xunHeadGroundIndex = palaceIndex

      // 定局天干(时干)为甲时，值符落宫=旬首落宫
      if (keyGanIndex === 0) {
        headStarIndex = palaceIndex
      }
    }

    // 当时干不为甲时，地盘天干与时干相同时，保存值符落宫
    if (keyGanName === gan) {
      headStarIndex = palaceIndex
    }
  })

  // 中五宫寄于坤二宫
  if (result[CENTER_PALACE].groundGan) {
    result[EXTRA_PALACE].groundExtraGan = result[CENTER_PALACE].groundGan
  }
  // 清空中宫地盘（中宫不参与排盘）
  result[CENTER_PALACE].groundGan = ''

  return {
    palaces: result,
    headStarIndex,
    xunHeadGroundIndex,
    headStarDoorStarIndex,
    headStarDoorDoorIndex,
    isSpecialStar,
  }
}

/* ------------------------------------------------------------------ */
/*  initSkyGan - 排天盘三奇六仪                                        */
/* ------------------------------------------------------------------ */

/**
 * 排天盘三奇六仪
 *
 * 从天盘旬首位置开始顺时针遍历，将地盘旬首落宫位置的地盘干
 * 依次赋予天盘干
 */
export function initSkyGan(
  palaces: readonly Palace[],
  headStarIndex: number,
  xunHeadGroundIndex: number,
): Palace[] {
  const result = clonePalaces(palaces)
  const skyStart = fixedIndex(headStarIndex)
  const groundStart = fixedIndex(xunHeadGroundIndex)

  const len = PALACE_BAGUA_NAMES.length - 1 // 8 (outer palaces)

  let groundStep = 0
  const groundOrder = buildClockOrder(groundStart, len)

  traverseByClock(skyStart, len, (palaceIndex) => {
    // 地盘干赋予天盘干
    const groundIdx = groundOrder[groundStep]
    result[palaceIndex].skyGan = result[groundIdx].groundGan
    result[palaceIndex].skyExtraGan = null

    // 地盘寄宫干赋予天盘寄宫
    if (result[groundIdx].groundExtraGan) {
      result[palaceIndex].skyExtraGan = result[groundIdx].groundExtraGan
    }

    groundStep++
  })

  return result
}

/**
 * 构建从 start 开始顺时针遍历的索引序列
 */
function buildClockOrder(start: number, count: number): number[] {
  const order: number[] = []
  traverseByClock(start, count, (idx) => {
    order.push(idx)
  })
  return order
}

/* ------------------------------------------------------------------ */
/*  initGods - 排八神                                                  */
/* ------------------------------------------------------------------ */

/**
 * 排八神
 *
 * 从天盘旬首位置开始，阳遁顺排、阴遁逆排
 */
export function initGods(
  palaces: readonly Palace[],
  meta: BoardMeta,
  headStarIndex: number,
): Palace[] {
  const result = clonePalaces(palaces)
  const isSolar = meta.yinyang === '阳'
  const skyStart = fixedIndex(headStarIndex)
  const len = PALACE_BAGUA_NAMES.length - 1 // 8
  const offset = isSolar ? len : -len

  traverseByClock(skyStart, offset, (palaceIndex, step) => {
    result[palaceIndex].god = { ...GODS[step] }
  })

  return result
}

/* ------------------------------------------------------------------ */
/*  initStars - 排九星                                                 */
/* ------------------------------------------------------------------ */

/**
 * 排九星
 *
 * 从天盘旬首位置开始，永远顺排
 * 值符星的索引从 headStarDoor 获取
 */
export function initStars(
  palaces: readonly Palace[],
  headStarIndex: number,
  headStarDoorStarIndex: number,
  isSpecialStar: boolean,
): Palace[] {
  const result = clonePalaces(palaces)
  const skyStart = fixedIndex(headStarIndex)
  let starIndex = headStarDoorStarIndex
  const len = PALACE_BAGUA_NAMES.length - 1 // 8

  traverseByClock(skyStart, len, (palaceIndex, _step) => {
    result[palaceIndex].star = { ...STARS[starIndex] }
    starIndex = nextStarDoorIndex(starIndex, isSpecialStar)
  })

  return result
}

/* ------------------------------------------------------------------ */
/*  initDoors - 排八门                                                 */
/* ------------------------------------------------------------------ */

/**
 * 排八门
 *
 * 计算值使门起始宫位（通过后天宫位数偏移），再顺排
 */
export function initDoors(
  palaces: readonly Palace[],
  meta: BoardMeta,
  headStarDoorDoorIndex: number,
  isSpecialStar: boolean,
): { palaces: Palace[], headDoorIndex: number } {
  const result = clonePalaces(palaces)
  const isSolar = meta.yinyang === '阳'
  const keyGanIndex = TIAN_GAN.indexOf(meta.ganZhi[0] as typeof TIAN_GAN[number])

  // 计算值使门所在的后天宫位数
  const doorOriginPalace = DOORS[headStarDoorDoorIndex].originPalace
  const offset = isSolar ? keyGanIndex : -keyGanIndex
  const doorStartNum = getOffsetPalaceNum(doorOriginPalace, offset)
  let doorStartIndex = getIndexByAfterNum(doorStartNum)
  const headDoorIndex = doorStartIndex

  // 处理中5宫寄坤2宫的情况
  doorStartIndex = fixedIndex(doorStartIndex)

  let doorIndex = headStarDoorDoorIndex
  const len = PALACE_BAGUA_NAMES.length - 1 // 8

  traverseByClock(doorStartIndex, len, (palaceIndex, _step) => {
    result[palaceIndex].door = { ...DOORS[doorIndex] }
    doorIndex = nextStarDoorIndex(doorIndex, isSpecialStar)
  })

  return { palaces: result, headDoorIndex }
}

/* ------------------------------------------------------------------ */
/*  initOutGan - 排隐干                                                */
/* ------------------------------------------------------------------ */

/**
 * 排隐干
 *
 * 两种情况:
 * 1. 地盘时干落宫与值使门落宫的天盘/地盘不相等 -> 绕一圈
 * 2. 相等 -> 隐干逢同求变，入中宫排布
 */
export function initOutGan(
  palaces: readonly Palace[],
  meta: BoardMeta,
  headStarIndex: number,
  headDoorIndex: number,
): Palace[] {
  const result = clonePalaces(palaces)
  const isSolar = meta.yinyang === '阳'

  // 获取地盘时干落宫的完整地盘文本
  const ganStartIndex = fixedIndex(headStarIndex)
  let checkText = result[ganStartIndex].groundGan
  if (result[ganStartIndex].groundExtraGan) {
    checkText = checkText + result[ganStartIndex].groundExtraGan
  }

  // 获取值使门落宫的天地盘文本
  const headDoorFixedIndex = fixedIndex(headDoorIndex)
  let doorSkyText = result[headDoorFixedIndex].skyGan
  if (result[headDoorFixedIndex].skyExtraGan) {
    doorSkyText = doorSkyText + result[headDoorFixedIndex].skyExtraGan
  }
  let doorGroundText = result[headDoorFixedIndex].groundGan
  if (result[headDoorFixedIndex].groundExtraGan) {
    doorGroundText = doorGroundText + result[headDoorFixedIndex].groundExtraGan
  }

  if (checkText !== doorSkyText && checkText !== doorGroundText) {
    // 第一种情况：不同，绕一圈
    const len = PALACE_BAGUA_NAMES.length - 1
    const groundOrder = buildClockOrder(ganStartIndex, len)
    let groundStep = 0

    traverseByClock(headDoorFixedIndex, len, (palaceIndex, _step) => {
      const gIdx = groundOrder[groundStep]
      result[palaceIndex].outGan = result[gIdx].groundGan
      result[palaceIndex].outExtraGan = null

      if (result[gIdx].groundExtraGan) {
        result[palaceIndex].outExtraGan = result[gIdx].groundExtraGan
      }

      groundStep++
    })
  }
  else {
    // 第二种情况：隐干逢同求变，入中宫
    const keyGanName = meta.ganZhi[0]
    const keyGanIndex = TIAN_GAN.indexOf(keyGanName as typeof TIAN_GAN[number])
    const liuyiArr = LIUYI_LIST as readonly string[]

    let liuyiIndex = liuyiArr.indexOf(keyGanName)

    // 定局天干为甲时，用旬首干起始
    if (keyGanIndex === 0) {
      liuyiIndex = liuyiArr.indexOf(meta.xunHeadGan)
    }

    // 特殊情况：隐干逢同且时干落中宫，则改为坤宫地盘入中
    if (headStarIndex === CENTER_PALACE) {
      liuyiIndex = liuyiArr.indexOf(result[EXTRA_PALACE].groundGan)
    }

    const liuyiLen = liuyiArr.length // 9
    const afterNumOffset = isSolar ? liuyiLen : -liuyiLen

    traverseByAfterNum(CENTER_PALACE, afterNumOffset, (palaceIndex, step) => {
      const idx = (liuyiIndex + step) % liuyiLen
      result[palaceIndex].outGan = liuyiArr[idx >= 0 ? idx : idx + liuyiLen]
      result[palaceIndex].outExtraGan = null
    })

    // 中五宫寄于坤二宫
    if (result[CENTER_PALACE].outGan) {
      result[EXTRA_PALACE].outExtraGan = result[CENTER_PALACE].outGan
    }
    result[CENTER_PALACE].outGan = null
  }

  return result
}

/* ------------------------------------------------------------------ */
/*  buildBoard - 链式排盘                                              */
/* ------------------------------------------------------------------ */

/**
 * 构建完整盘面
 *
 * 将所有 init 函数串联，返回最终的宫位数组和元数据
 */
export function buildBoard(options: TimeBoardOptions): { palaces: Palace[], meta: BoardMeta } {
  const meta = resolveMeta(options)
  const emptyPalaces = createEmptyPalaceData()

  // 1. 排地盘
  const groundResult = initGroundGan(emptyPalaces, meta)

  // 2. 排天盘
  const skyPalaces = initSkyGan(
    groundResult.palaces,
    groundResult.headStarIndex,
    groundResult.xunHeadGroundIndex,
  )

  // 3. 排八神
  const godPalaces = initGods(
    skyPalaces,
    meta,
    groundResult.headStarIndex,
  )

  // 4. 排九星
  const starPalaces = initStars(
    godPalaces,
    groundResult.headStarIndex,
    groundResult.headStarDoorStarIndex,
    groundResult.isSpecialStar,
  )

  // 5. 排八门
  const doorResult = initDoors(
    starPalaces,
    meta,
    groundResult.headStarDoorDoorIndex,
    groundResult.isSpecialStar,
  )

  // 6. 排隐干
  const finalPalaces = initOutGan(
    doorResult.palaces,
    meta,
    groundResult.headStarIndex,
    doorResult.headDoorIndex,
  )

  // 7. 清理中宫
  finalPalaces[CENTER_PALACE] = {
    ...finalPalaces[CENTER_PALACE],
    groundGan: '',
    groundExtraGan: null,
    skyGan: '',
    skyExtraGan: null,
    star: null,
    door: null,
    god: null,
    outGan: null,
    outExtraGan: null,
  }

  return { palaces: finalPalaces, meta }
}
