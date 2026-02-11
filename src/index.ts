/**
 * @yhjs/lunar - Chinese lunar calendar and astronomical calculations library
 *
 * 寿星万年历算法 TypeScript 实现
 *
 * 模块说明：
 * - core: 核心数学函数和常量
 * - lunar: 农历计算（日期转换、干支、节气等）
 * - ephemeris: 天文历表（日月行星位置计算）
 * - eclipse: 日月食计算
 * - astronomy: 简化天文API（用户友好接口）
 * - data: 数据模块（城市坐标、历史纪年等）
 */

// 简化天文API - 类型导出
export type {
  CelestialPosition,
  MoonPhaseInfo,
  MoonTimes,
  ObserverLocation,
  SunTimes,
} from './astronomy'

// 简化天文API (用户友好的高级接口)
export {
  getMoonPhase,
  getMoonPosition,
  getMoonTimes,
  getPlanetPosition,
  getSolarTerms,
  getSunPosition,
  getSunTimes,
} from './astronomy'

// 核心模块
export * from './core'

// 数据模块 - 类型导出
export type { CityInfo, DynastyInfo, EraInfo } from './data'

// 数据模块
export {
  // 城市数据
  decodeCoordinates,
  // 历史纪年
  DYNASTIES,
  encodeCoordinates,
  findCityByName,
  findEraByName,
  findEraByYear,
  findErasByDynasty,
  getAllCities,
  getCitiesByProvince,
  getDynastyByYear,
  getEraData,
  getProvincialCapital,
  MAJOR_CITIES,
  PROVINCES,
  yearToEraString,
} from './data'

// 日月食模块
export * from './eclipse'

// 天文历表模块 - 类型导出
export type { RiseTransitSetResult, TwilightTimes } from './ephemeris'

// 天文历表模块 (选择性导出避免与 astronomy 冲突)
export {
  AU_TO_KM,
  calculateAstronomicalTwilight,
  calculateCivilTwilight,
  calculateDayLength,
  calculateEarthHeliocentricCoord,
  calculateEarthLatitude,
  // 太阳计算
  calculateEarthLongitude,
  calculateEarthSunDistance,
  calculateGST,
  calculateHourAngle,
  calculateLightTime,
  calculateMoonAngularRadius,
  calculateMoonApparentCoord,
  calculateMoonApparentLongitude,
  calculateMoonDistance,
  calculateMoonGeocentricCoord,
  calculateMoonLatitude,
  calculateMoonLatitudeAberration,
  // 月球计算
  calculateMoonLongitude,
  calculateMoonLongitudeAberration,
  calculateMoonRiseTransitSet,
  calculateMoonSunLongitudeDiff,
  calculateMoonVelocity,
  calculateNauticalTwilight,
  calculatePlanetGeocentricCoord,
  // 行星计算
  calculatePlanetHeliocentricCoord,
  calculatePlanetMagnitude,
  calculatePlanetPhaseAngle,
  calculateRefraction,
  calculateSolarAberration,
  calculateSolarTerms,
  calculateSunApparentLongitude,
  calculateSunGeocentricCoord,
  calculateSunRiseTransitSet,
  calculateSunTrueLongitude,
  calculateSunVelocity,
  calculateTimeFromMoonLongitude,
  calculateTimeFromMoonSunDiff,
  calculateTimeFromMoonSunDiffFast,
  calculateTimeFromSunLongitude,
  calculateTwilight,
  degreesToRadians,
  eclipticToEquatorial,
  equatorialToHorizontal,
  HORIZON_CORRECTIONS,
  // 升中天落计算
  HorizonType,
  isPlanetDirect,
  jdToTimeString,
  MOON_MEAN_ANGULAR_RADIUS,
  MOON_MEAN_DISTANCE,
  MOON_PHASE_NAMES_CN,
  MOON_PHASE_NAMES_EN,
  Planet,
  radiansToDegrees,
  SOLAR_TERM_NAMES_CN,
  SOLAR_TERM_NAMES_EN,
  SPEED_OF_LIGHT,
  // 晨昏光计算
  TwilightType,
} from './ephemeris'

// 农历模块
export * from './lunar'
