import { Product, ProcessedProduct, TrendPoint, GeoDistribution } from '../types';

/**
 * 解析访问量字符串为数字
 */
export function parseVisits(visits: string): number {
  if (!visits || visits === '0') return 0;
  
  const value = parseFloat(visits);
  if (visits.includes('M')) return value * 1000000;
  if (visits.includes('K')) return value * 1000;
  return value;
}

/**
 * 解析时长字符串为秒数
 */
export function parseDuration(duration: string): number {
  if (!duration || duration === '0') return 0;
  
  const parts = duration.split(':').map(p => parseInt(p));
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

/**
 * 解析跳出率
 */
export function parseBounceRate(bounce: string): number {
  if (!bounce) return 0;
  return parseFloat(bounce.replace('%', ''));
}

/**
 * 解析趋势数据
 */
export function parseTrendData(trendData: string): TrendPoint[] {
  if (!trendData) return [];
  
  const points: TrendPoint[] = [];
  const segments = trendData.split('|').map(s => s.trim());
  
  for (const segment of segments) {
    const match = segment.match(/(.+?):\s*([\d.]+[KM]?)/);
    if (match) {
      const period = match[1].trim();
      const valueStr = match[2];
      const value = parseVisits(valueStr);
      
      points.push({
        period,
        value,
        formattedValue: valueStr
      });
    }
  }
  
  return points;
}

/**
 * 解析地理分布数据
 */
export function parseGeoDistribution(geo: string): GeoDistribution[] {
  if (!geo) return [];
  
  const distributions: GeoDistribution[] = [];
  const segments = geo.split('|').map(s => s.trim());
  
  for (const segment of segments) {
    const match = segment.match(/([A-Z]{2}|Others):\s*([\d.]+)%/);
    if (match) {
      distributions.push({
        code: match[1],
        percentage: parseFloat(match[2])
      });
    }
  }
  
  return distributions;
}

/**
 * 计算增长率（最近一个月相对于第一个月）
 */
export function calculateGrowthRate(trendPoints: TrendPoint[]): number {
  if (trendPoints.length < 2) return 0;
  
  const first = trendPoints[0].value;
  const last = trendPoints[trendPoints.length - 1].value;
  
  if (first === 0) return 0;
  
  return ((last - first) / first) * 100;
}

/**
 * 计算平均增长率
 */
export function calculateAvgGrowthRate(trendPoints: TrendPoint[]): number {
  if (trendPoints.length < 2) return 0;
  
  let totalGrowth = 0;
  let validPairs = 0;
  
  for (let i = 1; i < trendPoints.length; i++) {
    const prev = trendPoints[i - 1].value;
    const curr = trendPoints[i].value;
    
    if (prev !== 0) {
      totalGrowth += ((curr - prev) / prev) * 100;
      validPairs++;
    }
  }
  
  return validPairs > 0 ? totalGrowth / validPairs : 0;
}

/**
 * 处理单个产品数据
 */
export function processProduct(product: Product): ProcessedProduct {
  const visitNumber = parseVisits(product.monthly_visits);
  const trendDataParsed = parseTrendData(product.trend_data);
  const growthRate = calculateGrowthRate(trendDataParsed);
  const avgGrowthRate = calculateAvgGrowthRate(trendDataParsed);
  
  return {
    ...product,
    visitNumber,
    durationSeconds: parseDuration(product.avg_duration),
    rankNumber: parseInt(product.category_rank) || 0,
    bounceNumber: parseBounceRate(product.bounce_rate),
    categoryList: product.categories
      .split('|')
      .map(c => c.trim())
      .filter(c => c !== ''),
    trendDataParsed,
    geoParsed: parseGeoDistribution(product.geographic_distribution),
    growthRate,
    avgGrowthRate
  };
}

/**
 * 处理所有产品数据
 */
export function processAllProducts(products: Product[]): ProcessedProduct[] {
  return products
    .filter(p => !p.error) // 过滤掉有错误的数据
    .map(processProduct);
}

/**
 * 格式化数字
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toFixed(0);
}

/**
 * 格式化时长
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 格式化增长率
 */
export function formatGrowthRate(rate: number): string {
  const sign = rate >= 0 ? '+' : '';
  return `${sign}${rate.toFixed(1)}%`;
}

