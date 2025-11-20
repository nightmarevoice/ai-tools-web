import Papa from 'papaparse';
import { Product, TrendPoint, GeoDistribution } from '@/types';

/**
 * 解析 CSV 数据
 */
export const parseCSVData = (csvText: string): Product[] => {
  const { data } = Papa.parse<any>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return data.map((row: any) => parseProductRow(row)).filter(Boolean);
};

/**
 * 解析单个产品行数据
 */
const parseProductRow = (row: any): Product | null => {
  try {
    return {
      app_name: row.app_name || '',
      url: row.url || '',
      scrape_time: row.scrape_time || '',
      official_website: row.official_website || '',
      categories: parseCategories(row.categories),
      product_description: row.product_description || '',
      main_features: parseFeatures(row.main_features),
      monthly_visits: parseVisits(row.monthly_visits),
      avg_duration: row.avg_duration || '00:00:00',
      category_rank: parseInt(row.category_rank) || 0,
      bounce_rate: parseFloat(row.bounce_rate) || 0,
      trend_data: parseTrendData(row.trend_data),
      geographic_distribution: parseGeoDist(row.geographic_distribution),
      error: row.error || '',
    };
  } catch (error) {
    console.error('解析产品数据失败:', row, error);
    return null;
  }
};

/**
 * 解析分类字符串
 */
const parseCategories = (categories: string): string[] => {
  if (!categories) return [];
  return categories.split('|').map((c) => c.trim()).filter(Boolean);
};

/**
 * 解析功能列表
 */
const parseFeatures = (features: string): string[] => {
  if (!features) return [];
  return features.split('||').map((f) => f.trim()).filter(Boolean);
};

/**
 * 解析访问量 (支持 K, M, B 后缀)
 */
export const parseVisits = (visits: string): number => {
  if (!visits || visits === '0') return 0;

  const value = parseFloat(visits.replace(/[KMB]/g, ''));
  const unit = visits.match(/[KMB]/)?.[0];

  switch (unit) {
    case 'K':
      return value * 1000;
    case 'M':
      return value * 1000000;
    case 'B':
      return value * 1000000000;
    default:
      return value;
  }
};

/**
 * 格式化访问量显示
 */
export const formatVisits = (visits: number): string => {
  if (visits === 0) return '0';
  if (visits >= 1000000000) return `${(visits / 1000000000).toFixed(1)}B`;
  if (visits >= 1000000) return `${(visits / 1000000).toFixed(1)}M`;
  if (visits >= 1000) return `${(visits / 1000).toFixed(1)}K`;
  return visits.toString();
};

/**
 * 解析趋势数据
 * 格式: "Aug 2025: 219.9K | Sep 2025: 192.8K | Oct 2025: 146.8K"
 */
const parseTrendData = (trend: string): TrendPoint[] => {
  if (!trend) return [];

  try {
    return trend.split('|').map((item) => {
      const [month, valueStr] = item.split(':').map((s) => s.trim());
      return {
        month,
        value: parseVisits(valueStr),
      };
    });
  } catch (error) {
    console.error('解析趋势数据失败:', trend);
    return [];
  }
};

/**
 * 解析地理分布
 * 格式: "RU: 24% | US: 10.31% | BR: 9.45%"
 */
const parseGeoDist = (geo: string): GeoDistribution[] => {
  if (!geo) return [];

  try {
    return geo.split('|').map((item) => {
      const [code, percentStr] = item.split(':').map((s) => s.trim());
      return {
        code,
        percentage: parseFloat(percentStr.replace('%', '')),
      };
    });
  } catch (error) {
    console.error('解析地理分布失败:', geo);
    return [];
  }
};

/**
 * 计算增长率 (最新月份相对于最早月份)
 */
export const calculateGrowthRate = (trendData: TrendPoint[]): number => {
  if (trendData.length < 2) return 0;

  const firstValue = trendData[0].value;
  const lastValue = trendData[trendData.length - 1].value;

  if (firstValue === 0) return lastValue > 0 ? 100 : 0;

  return ((lastValue - firstValue) / firstValue) * 100;
};

/**
 * 计算月度环比增长率
 */
export const calculateMonthlyGrowthRate = (trendData: TrendPoint[]): number => {
  if (trendData.length < 2) return 0;

  const previousValue = trendData[trendData.length - 2].value;
  const currentValue = trendData[trendData.length - 1].value;

  if (previousValue === 0) return currentValue > 0 ? 100 : 0;

  return ((currentValue - previousValue) / previousValue) * 100;
};

/**
 * 获取趋势方向
 */
export const getTrendDirection = (growthRate: number): 'up' | 'down' | 'stable' => {
  if (growthRate > 5) return 'up';
  if (growthRate < -5) return 'down';
  return 'stable';
};

