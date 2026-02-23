// 排盘函数导出
export { applyMoveStar, buildBoard, buildBoardFromMeta } from './board'

// 盘面类导出
export { PosDunjia, TimeDunjia } from './board'

export type {
  PosBoardOptions,
  PosDunjiaTrans,
  PosDunjiaType,
} from './board'

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
