/**
 * Data module - 数据模块
 *
 * 来源：寿星万年历
 * 包含城市经纬度、历史纪年等数据
 */

// 城市数据 - 类型导出
export type { CityInfo } from './cities'

// 城市数据
export {
  decodeCoordinates,
  encodeCoordinates,
  findCityByName,
  getAllCities,
  getCitiesByProvince,
  getProvincialCapital,
  MAJOR_CITIES,
  PROVINCES,
} from './cities'

// 历史纪年数据 - 类型导出
export type { DynastyInfo, EraInfo } from './eras'

// 历史纪年数据
export {
  DYNASTIES,
  findEraByName,
  findEraByYear,
  findErasByDynasty,
  getDynastyByYear,
  getEraData,
  yearToEraString,
} from './eras'

// VSOP87 行星数据
export * from './vsop87'
