/**
 * 排盘 fixture 数据 — 已知日期的预期属性
 *
 * 每个 fixture 包含:
 * - datetime: 起局时间
 * - description: 场景描述
 * - expectedMeta: 预期的元数据属性（精确值）
 * - expectedPalaces: 预期的 9 宫精确快照
 */

/**
 * 宫位精确快照
 */
export interface ExpectedPalace {
  groundGan: string
  groundExtraGan: string | null
  skyGan: string
  skyExtraGan: string | null
  /** 九星全名，中宫为 null */
  star: string | null
  /** 八门全名，中宫为 null */
  door: string | null
  /** 八神全名，中宫为 null */
  god: string | null
  outGan: string | null
  outExtraGan: string | null
}

export interface FixtureCase {
  /** 场景描述 */
  description: string
  /** 起局时间 */
  datetime: Date
  /** 预期元数据（精确值） */
  expectedMeta: {
    type: string
    yinyang: '阴' | '阳'
    juNumber: number
    xunHead: string
    xunHeadGan: string
    ganZhi: string
    solarTerm: string
  }
  /** 预期 9 宫精确快照（按 index 0-8 排列） */
  expectedPalaces: ExpectedPalace[]
}

/**
 * 测试日期 fixture 集合
 */
export const FIXTURE_CASES: FixtureCase[] = [
  {
    description: '常规排盘 - 2026年2月22日 14:00',
    datetime: new Date(2026, 1, 22, 14, 0, 0),
    expectedMeta: {
      type: 'hour',
      yinyang: '阳',
      juNumber: 8,
      xunHead: '甲戌',
      xunHeadGan: '己',
      ganZhi: '癸未',
      solarTerm: '雨水',
    },
    expectedPalaces: [
      { groundGan: '癸', groundExtraGan: null, skyGan: '己', skyExtraGan: null, star: '天英星', door: '杜门', god: '值符', outGan: '壬', outExtraGan: null },
      { groundGan: '己', groundExtraGan: null, skyGan: '辛', skyExtraGan: '丁', star: '天芮星', door: '景门', god: '腾蛇', outGan: '癸', outExtraGan: null },
      { groundGan: '辛', groundExtraGan: '丁', skyGan: '乙', skyExtraGan: null, star: '天柱星', door: '死门', god: '太阴', outGan: '己', outExtraGan: null },
      { groundGan: '壬', groundExtraGan: null, skyGan: '癸', skyExtraGan: null, star: '天辅星', door: '伤门', god: '九天', outGan: '戊', outExtraGan: null },
      { groundGan: '', groundExtraGan: null, skyGan: '', skyExtraGan: null, star: null, door: null, god: null, outGan: null, outExtraGan: null },
      { groundGan: '乙', groundExtraGan: null, skyGan: '丙', skyExtraGan: null, star: '天心星', door: '惊门', god: '六合', outGan: '辛', outExtraGan: '丁' },
      { groundGan: '戊', groundExtraGan: null, skyGan: '壬', skyExtraGan: null, star: '天冲星', door: '生门', god: '九地', outGan: '庚', outExtraGan: null },
      { groundGan: '庚', groundExtraGan: null, skyGan: '戊', skyExtraGan: null, star: '天任星', door: '休门', god: '玄武', outGan: '丙', outExtraGan: null },
      { groundGan: '丙', groundExtraGan: null, skyGan: '庚', skyExtraGan: null, star: '天蓬星', door: '开门', god: '白虎', outGan: '乙', outExtraGan: null },
    ],
  },
  {
    description: '夏至附近 - 2026年6月21日 12:00（阴遁）',
    datetime: new Date(2026, 5, 21, 12, 0, 0),
    expectedMeta: {
      type: 'hour',
      yinyang: '阴',
      juNumber: 3,
      xunHead: '甲寅',
      xunHeadGan: '癸',
      ganZhi: '戊午',
      solarTerm: '夏至',
    },
    expectedPalaces: [
      { groundGan: '乙', groundExtraGan: null, skyGan: '丁', skyExtraGan: null, star: '天心星', door: '开门', god: '九天', outGan: '己', outExtraGan: null },
      { groundGan: '辛', groundExtraGan: null, skyGan: '庚', skyExtraGan: null, star: '天蓬星', door: '休门', god: '九地', outGan: '癸', outExtraGan: null },
      { groundGan: '己', groundExtraGan: '丙', skyGan: '壬', skyExtraGan: null, star: '天任星', door: '生门', god: '玄武', outGan: '辛', outExtraGan: '戊' },
      { groundGan: '戊', groundExtraGan: null, skyGan: '癸', skyExtraGan: null, star: '天柱星', door: '惊门', god: '值符', outGan: '庚', outExtraGan: null },
      { groundGan: '', groundExtraGan: null, skyGan: '', skyExtraGan: null, star: null, door: null, god: null, outGan: null, outExtraGan: null },
      { groundGan: '癸', groundExtraGan: null, skyGan: '戊', skyExtraGan: null, star: '天冲星', door: '伤门', god: '白虎', outGan: '丙', outExtraGan: null },
      { groundGan: '壬', groundExtraGan: null, skyGan: '己', skyExtraGan: '丙', star: '天芮星', door: '死门', god: '腾蛇', outGan: '丁', outExtraGan: null },
      { groundGan: '庚', groundExtraGan: null, skyGan: '辛', skyExtraGan: null, star: '天英星', door: '景门', god: '太阴', outGan: '壬', outExtraGan: null },
      { groundGan: '丁', groundExtraGan: null, skyGan: '乙', skyExtraGan: null, star: '天辅星', door: '杜门', god: '六合', outGan: '乙', outExtraGan: null },
    ],
  },
  {
    description: '子时边界 - 2026年1月1日 00:00（阳遁）',
    datetime: new Date(2026, 0, 1, 0, 0, 0),
    expectedMeta: {
      type: 'hour',
      yinyang: '阳',
      juNumber: 4,
      xunHead: '甲子',
      xunHeadGan: '戊',
      ganZhi: '甲子',
      solarTerm: '冬至',
    },
    expectedPalaces: [
      { groundGan: '戊', groundExtraGan: null, skyGan: '戊', skyExtraGan: null, star: '天辅星', door: '杜门', god: '值符', outGan: '乙', outExtraGan: null },
      { groundGan: '癸', groundExtraGan: null, skyGan: '癸', skyExtraGan: null, star: '天英星', door: '景门', god: '腾蛇', outGan: '壬', outExtraGan: null },
      { groundGan: '丙', groundExtraGan: '己', skyGan: '丙', skyExtraGan: '己', star: '天芮星', door: '死门', god: '太阴', outGan: '丁', outExtraGan: '戊' },
      { groundGan: '乙', groundExtraGan: null, skyGan: '乙', skyExtraGan: null, star: '天冲星', door: '伤门', god: '九天', outGan: '丙', outExtraGan: null },
      { groundGan: '', groundExtraGan: null, skyGan: '', skyExtraGan: null, star: null, door: null, god: null, outGan: null, outExtraGan: null },
      { groundGan: '辛', groundExtraGan: null, skyGan: '辛', skyExtraGan: null, star: '天柱星', door: '惊门', god: '六合', outGan: '庚', outExtraGan: null },
      { groundGan: '壬', groundExtraGan: null, skyGan: '壬', skyExtraGan: null, star: '天任星', door: '生门', god: '九地', outGan: '辛', outExtraGan: null },
      { groundGan: '丁', groundExtraGan: null, skyGan: '丁', skyExtraGan: null, star: '天蓬星', door: '休门', god: '玄武', outGan: '癸', outExtraGan: null },
      { groundGan: '庚', groundExtraGan: null, skyGan: '庚', skyExtraGan: null, star: '天心星', door: '开门', god: '白虎', outGan: '己', outExtraGan: null },
    ],
  },
]
