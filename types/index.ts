/**
 * 产品数据类型定义
 */
export interface Product {
  app_name: string;
  url: string;
  scrape_time: string;
  official_website: string;
  categories: string;
  product_description: string;
  main_features: string;
  monthly_visits: string;
  avg_duration: string;
  category_rank: string;
  bounce_rate: string;
  trend_data: string;
  geographic_distribution: string;
  error: string;
}

/**
 * 处理后的产品数据
 */
export interface ProcessedProduct extends Product {
  visitNumber: number;
  durationSeconds: number;
  rankNumber: number;
  bounceNumber: number;
  categoryList: string[];
  trendDataParsed: TrendPoint[];
  geoParsed: GeoDistribution[];
  growthRate: number; // 增长率
  avgGrowthRate: number; // 平均增长率
}

/**
 * 趋势数据点
 */
export interface TrendPoint {
  period: string;
  value: number;
  formattedValue: string;
}

/**
 * 地理分布数据
 */
export interface GeoDistribution {
  code: string;
  percentage: number;
}

/**
 * 类目统计数据
 */
export interface CategoryStats {
  category: string;
  productCount: number;
  totalVisits: number;
  avgVisits: number;
  avgGrowthRate: number;
  topProducts: ProcessedProduct[];
  growthRate: number;
  avgBounceRate: number;
  avgDuration: number;
}

/**
 * 机会发现数据
 */
export interface OpportunityCategory {
  category: string;
  productCount: number;
  avgGrowthRate: number;
  topGrowthProducts: ProcessedProduct[];
  score: number; // 机会分数
}

/**
 * 地理市场数据
 */
export interface GeoMarket {
  code: string;
  name: string;
  totalProducts: number;
  avgMarketShare: number;
  topProducts: ProcessedProduct[];
}

// 数据类型定义

export interface DataAnalysisProduct {
  app_name: string;
  url: string;
  scrape_time: string;
  official_website: string;
  categories: string[];
  product_description: string;
  main_features: string[];
  monthly_visits: number;
  avg_duration: string;
  category_rank: number;
  bounce_rate: number;
  trend_data: TrendPoint[];
  geographic_distribution: GeoDistribution[];
  error: string;
}

export interface TrendPoint {
  month: string;
  value: number;
}

export interface GeoDistribution {
  code: string;
  percentage: number;
}

export interface CategoryStats {
  name: string;
  productCount: number;
  totalVisits: number;
  avgVisits: number;
  growthRate: number;
  products: DataAnalysisProduct[];
}

export interface GrowthAnalysis {
  app_name: string;
  category: string;
  growthRate: number;
  currentVisits: number;
  previousVisits: number;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface OpportunityData {
  category: string;
  productCount: number;
  avgGrowthRate: number;
  topGrowthProducts: Product[];
  isLongTail: boolean;
}

export interface FilterOptions {
  categories: string[];
  minVisits: number;
  maxVisits: number;
  growthRate: 'all' | 'positive' | 'negative';
  searchTerm: string;
}

