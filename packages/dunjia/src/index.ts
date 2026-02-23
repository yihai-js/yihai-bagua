// 排盘函数导出
export { applyMoveStar, buildBoard, buildBoardFromMeta } from './board'

// 盘面类导出
export { PosDunjia, TimeDunjia } from './board'

export type {
  PosBoardOptions,
  PosDunjiaTrans,
  PosDunjiaType,
} from './board'

// 模型数据导出
export { DOORS } from './model/door'
export { GODS } from './model/god'
export { STARS } from './model/star'

// 山向模块导出
export {
  getMountainDetailFromAngle,
  getMountainIndexFromAngle,
  getMountainInfo,
  getNumData,
  getOppositeAngle,
  getOppositeMountain,
  getZhiMountain,
  MOUNTAIN_NAMES,
  MOUNTAIN_WUXING,
  MOUNTAIN_YINYANG,
} from './mountain'

export type {
  MountainDetail,
  MountainInfo,
  NumData,
  PanType,
} from './mountain'

// 外圈神煞插件导出
export { jianShen } from './outer-gods'

// 类型导出
export type {
  BoardMeta,
  BoardType,
  DoorInfo,
  DunjiaBoardData,
  GodInfo,
  OuterGodEntry,
  OuterGodLayer,
  OuterGodPlugin,
  Palace,
  StarInfo,
  TimeBoardOptions,
  YinYang,
} from './types'

export { Wuxing } from './types'
