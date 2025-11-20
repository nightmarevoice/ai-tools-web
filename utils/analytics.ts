import { ProcessedProduct, CategoryStats, OpportunityCategory, GeoMarket } from '@/types';
import { formatNumber } from './dataProcessor';

/**
 * 计算类目统计数据
 */
export function calculateCategoryStats(products: ProcessedProduct[]): CategoryStats[] {
  const categoryMap = new Map<string, ProcessedProduct[]>();
  
  // 按类目分组
  products.forEach(product => {
    product.categoryList.forEach(category => {
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(product);
    });
  });
  
  // 计算每个类目的统计数据
  const stats: CategoryStats[] = [];
  
  categoryMap.forEach((categoryProducts, category) => {
    const totalVisits = categoryProducts.reduce((sum, p) => sum + p.visitNumber, 0);
    const avgVisits = totalVisits / categoryProducts.length;
    const avgGrowthRate = categoryProducts.reduce((sum, p) => sum + p.avgGrowthRate, 0) / categoryProducts.length;
    const avgBounceRate = categoryProducts.reduce((sum, p) => sum + p.bounceNumber, 0) / categoryProducts.length;
    const avgDuration = categoryProducts.reduce((sum, p) => sum + p.durationSeconds, 0) / categoryProducts.length;
    
    // 按增长率排序获取Top产品
    const topProducts = [...categoryProducts]
      .sort((a, b) => b.avgGrowthRate - a.avgGrowthRate)
      .slice(0, 3);
    
    // 计算类目整体增长率（基于所有产品的平均）
    const growthRate = categoryProducts.reduce((sum, p) => sum + p.growthRate, 0) / categoryProducts.length;
    
    stats.push({
      category,
      productCount: categoryProducts.length,
      totalVisits,
      avgVisits,
      avgGrowthRate,
      topProducts,
      growthRate,
      avgBounceRate,
      avgDuration
    });
  });
  
  return stats;
}

/**
 * 获取增长最快的类目
 */
export function getTopGrowthCategories(
  categoryStats: CategoryStats[],
  limit: number = 10
): CategoryStats[] {
  return [...categoryStats]
    .sort((a, b) => b.avgGrowthRate - a.avgGrowthRate)
    .slice(0, limit);
}

/**
 * 获取流量最高的类目
 */
export function getTopTrafficCategories(
  categoryStats: CategoryStats[],
  limit: number = 10
): CategoryStats[] {
  return [...categoryStats]
    .sort((a, b) => b.totalVisits - a.totalVisits)
    .slice(0, limit);
}

/**
 * 发现机会类目（小规模高增长）
 */
export function findOpportunityCategories(
  categoryStats: CategoryStats[],
  maxProductCount: number = 50,
  minGrowthRate: number = 10
): OpportunityCategory[] {
  const opportunities: OpportunityCategory[] = [];
  
  categoryStats
    .filter(cat => cat.productCount <= maxProductCount && cat.avgGrowthRate >= minGrowthRate)
    .forEach(cat => {
      // 计算机会分数：增长率权重0.7，规模反向权重0.3
      const growthScore = Math.min(cat.avgGrowthRate / 100, 1) * 70;
      const scaleScore = (1 - cat.productCount / maxProductCount) * 30;
      const score = growthScore + scaleScore;
      
      const topGrowthProducts = cat.topProducts
        .sort((a, b) => b.avgGrowthRate - a.avgGrowthRate)
        .slice(0, 3);
      
      opportunities.push({
        category: cat.category,
        productCount: cat.productCount,
        avgGrowthRate: cat.avgGrowthRate,
        topGrowthProducts,
        score
      });
    });
  
  return opportunities.sort((a, b) => b.score - a.score);
}

/**
 * 分析地理市场
 */
export function analyzeGeoMarkets(products: ProcessedProduct[]): GeoMarket[] {
  const geoMap = new Map<string, ProcessedProduct[]>();
  
  // 按地区代码分组
  products.forEach(product => {
    product.geoParsed.forEach(geo => {
      if (!geoMap.has(geo.code)) {
        geoMap.set(geo.code, []);
      }
      geoMap.get(geo.code)!.push(product);
    });
  });
  
  // 计算每个地区的统计数据
  const markets: GeoMarket[] = [];
  
  geoMap.forEach((geoProducts, code) => {
    const totalProducts = geoProducts.length;
    const avgMarketShare = geoProducts.reduce((sum, p) => {
      const geo = p.geoParsed.find(g => g.code === code);
      return sum + (geo?.percentage || 0);
    }, 0) / totalProducts;
    
    // 获取该地区市场份额最高的产品
    const topProducts = [...geoProducts]
      .sort((a, b) => {
        const aShare = a.geoParsed.find(g => g.code === code)?.percentage || 0;
        const bShare = b.geoParsed.find(g => g.code === code)?.percentage || 0;
        return bShare - aShare;
      })
      .slice(0, 5);
    
    markets.push({
      code,
      name: getCountryName(code),
      totalProducts,
      avgMarketShare,
      topProducts
    });
  });
  
  return markets.sort((a, b) => b.totalProducts - a.totalProducts);
}

/**
 * 查找相似产品
 */
export function findSimilarProducts(
  targetProduct: ProcessedProduct,
  allProducts: ProcessedProduct[],
  limit: number = 5
): ProcessedProduct[] {
  const similarities: { product: ProcessedProduct; score: number }[] = [];
  
  allProducts.forEach(product => {
    if (product.app_name === targetProduct.app_name) return;
    
    let score = 0;
    
    // 类目相似度（权重40%）
    const commonCategories = product.categoryList.filter(c => 
      targetProduct.categoryList.includes(c)
    ).length;
    const categoryScore = (commonCategories / Math.max(product.categoryList.length, targetProduct.categoryList.length)) * 40;
    score += categoryScore;
    
    // 流量规模相似度（权重30%）
    const visitRatio = Math.min(product.visitNumber, targetProduct.visitNumber) / 
                       Math.max(product.visitNumber, targetProduct.visitNumber);
    score += visitRatio * 30;
    
    // 增长率相似度（权重30%）
    const growthDiff = Math.abs(product.avgGrowthRate - targetProduct.avgGrowthRate);
    const growthScore = Math.max(0, 1 - growthDiff / 100) * 30;
    score += growthScore;
    
    similarities.push({ product, score });
  });
  
  return similarities
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.product);
}

/**
 * 获取国家/地区名称
 */
function getCountryName(code: string): string {
  const countryNames: Record<string, string> = {
    'US': '美国', 'CN': '中国', 'JP': '日本', 'KR': '韩国', 'GB': '英国',
    'DE': '德国', 'FR': '法国', 'IN': '印度', 'BR': '巴西', 'CA': '加拿大',
    'AU': '澳大利亚', 'IT': '意大利', 'ES': '西班牙', 'MX': '墨西哥', 'RU': '俄罗斯',
    'ID': '印度尼西亚', 'NL': '荷兰', 'SA': '沙特阿拉伯', 'TR': '土耳其', 'CH': '瑞士',
    'PL': '波兰', 'BE': '比利时', 'SE': '瑞典', 'AT': '奥地利', 'NO': '挪威',
    'SG': '新加坡', 'HK': '香港', 'TW': '台湾', 'TH': '泰国', 'VN': '越南',
    'PH': '菲律宾', 'MY': '马来西亚', 'UA': '乌克兰', 'PK': '巴基斯坦', 'NG': '尼日利亚',
    'Others': '其他'
  };
  
  return countryNames[code] || code;
}

/**
 * 计算总体统计数据
 */
export function calculateOverallStats(products: ProcessedProduct[]) {
  const totalProducts = products.length;
  const totalVisits = products.reduce((sum, p) => sum + p.visitNumber, 0);
  const avgVisits = totalVisits / totalProducts;
  const avgGrowthRate = products.reduce((sum, p) => sum + p.avgGrowthRate, 0) / totalProducts;
  const avgBounceRate = products.reduce((sum, p) => sum + p.bounceNumber, 0) / totalProducts;
  const avgDuration = products.reduce((sum, p) => sum + p.durationSeconds, 0) / totalProducts;
  
  // 获取独特类目数
  const uniqueCategories = new Set<string>();
  products.forEach(p => p.categoryList.forEach(c => uniqueCategories.add(c)));
  
  return {
    totalProducts,
    totalVisits,
    avgVisits,
    avgGrowthRate,
    avgBounceRate,
    avgDuration,
    totalCategories: uniqueCategories.size
  };
}
