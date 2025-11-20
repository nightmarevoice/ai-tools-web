import { ProcessedProduct } from '@/types';

/**
 * 标签组合数据
 */
export interface TagCombination {
  tags: string[];
  tagKey: string; // 标签组合的唯一标识
  productCount: number;
  products: ProcessedProduct[];
  totalVisits: number;
  avgVisits: number;
  avgGrowthRate: number;
  avgDuration: number;
  avgBounceRate: number;
  trendData: { period: string; totalVisits: number; avgVisits: number }[];
}

/**
 * 标签共现统计
 */
export interface TagCooccurrence {
  tag1: string;
  tag2: string;
  count: number;
  products: ProcessedProduct[];
}

/**
 * 生成标签组合
 */
function getCombinations<T>(array: T[], size: number): T[][] {
  if (size === 1) return array.map(item => [item]);
  
  const result: T[][] = [];
  
  for (let i = 0; i <= array.length - size; i++) {
    const head = array[i];
    const tailCombinations = getCombinations(array.slice(i + 1), size - 1);
    
    for (const tail of tailCombinations) {
      result.push([head, ...tail]);
    }
  }
  
  return result;
}

/**
 * 分析标签组合
 * 
 * 逻辑说明：
 * - 遍历所有可能的标签组合
 * - 对每个组合，查找"同时包含这些标签"的所有产品（交集逻辑）
 * - 产品可以有额外的标签，只要包含组合中的所有标签即可
 * 
 * 例如：组合 ["AI 代码助手", "AI 写作助手"]
 * - 产品A: ["AI 代码助手", "AI 写作助手"] ✅ 包含
 * - 产品B: ["AI 代码助手", "AI 写作助手", "AI SEO"] ✅ 包含（有额外标签也算）
 * - 产品C: ["AI 代码助手"] ❌ 不包含（缺少"AI 写作助手"）
 */
export function analyzeTagCombinations(
  products: ProcessedProduct[],
  minProducts: number = 3, // 至少要有N个产品
  combinationSize: number = 2 // 标签组合大小（2-4）
): TagCombination[] {
  // 收集所有唯一标签
  const allTags = new Set<string>();
  products.forEach(p => p.categoryList.forEach(tag => allTags.add(tag)));
  const uniqueTags = Array.from(allTags);
  
  // 生成所有可能的标签组合
  const allPossibleCombinations = getCombinations(uniqueTags, combinationSize);
  
  // 限制组合数量，避免性能问题
  const maxCombinations = 1000; // 最多分析1000个组合
  const selectedCombinations = allPossibleCombinations.length > maxCombinations
    ? allPossibleCombinations.slice(0, maxCombinations)
    : allPossibleCombinations;
  
  const combinations: TagCombination[] = [];
  
  // 对每个组合，查找包含所有这些标签的产品
  selectedCombinations.forEach(combo => {
    const sortedCombo = [...combo].sort();
    const tagKey = sortedCombo.join(' + ');
    
    // 查找同时包含这些标签的所有产品（交集）
    const matchingProducts = products.filter(product => {
      // 检查产品是否包含组合中的所有标签
      return sortedCombo.every(tag => product.categoryList.includes(tag));
    });
    
    // 过滤掉产品数量不足的组合
    if (matchingProducts.length < minProducts) return;
    
    const totalVisits = matchingProducts.reduce((sum, p) => sum + p.visitNumber, 0);
    const avgVisits = totalVisits / matchingProducts.length;
    const avgGrowthRate = matchingProducts.reduce((sum, p) => sum + p.avgGrowthRate, 0) / matchingProducts.length;
    const avgDuration = matchingProducts.reduce((sum, p) => sum + p.durationSeconds, 0) / matchingProducts.length;
    const avgBounceRate = matchingProducts.reduce((sum, p) => sum + p.bounceNumber, 0) / matchingProducts.length;
    
    // 计算趋势数据
    const trendData = calculateCombinationTrend(matchingProducts);
    
    combinations.push({
      tags: sortedCombo,
      tagKey,
      productCount: matchingProducts.length,
      products: matchingProducts,
      totalVisits,
      avgVisits,
      avgGrowthRate,
      avgDuration,
      avgBounceRate,
      trendData
    });
  });
  
  // 按产品数量降序排序
  return combinations.sort((a, b) => b.productCount - a.productCount);
}

/**
 * 计算标签组合的趋势数据
 */
function calculateCombinationTrend(products: ProcessedProduct[]): 
  { period: string; totalVisits: number; avgVisits: number }[] {
  
  // 收集所有时间点
  const periodMap = new Map<string, number[]>();
  
  products.forEach(product => {
    product.trendDataParsed.forEach(point => {
      if (!periodMap.has(point.period)) {
        periodMap.set(point.period, []);
      }
      periodMap.get(point.period)!.push(point.value);
    });
  });
  
  // 计算每个时间点的统计数据
  const trendData: { period: string; totalVisits: number; avgVisits: number }[] = [];
  
  periodMap.forEach((values, period) => {
    const totalVisits = values.reduce((sum, v) => sum + v, 0);
    const avgVisits = totalVisits / values.length;
    
    trendData.push({
      period,
      totalVisits,
      avgVisits
    });
  });
  
  // 按时间排序
  return trendData.sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * 分析标签共现（两两关系）
 */
export function analyzeTagCooccurrence(products: ProcessedProduct[]): TagCooccurrence[] {
  const cooccurrenceMap = new Map<string, ProcessedProduct[]>();
  
  products.forEach(product => {
    if (product.categoryList.length < 2) return;
    
    // 生成所有两两组合
    for (let i = 0; i < product.categoryList.length; i++) {
      for (let j = i + 1; j < product.categoryList.length; j++) {
        const tag1 = product.categoryList[i];
        const tag2 = product.categoryList[j];
        
        // 按字母顺序排序保证一致性
        const [first, second] = tag1 < tag2 ? [tag1, tag2] : [tag2, tag1];
        const key = `${first}|${second}`;
        
        if (!cooccurrenceMap.has(key)) {
          cooccurrenceMap.set(key, []);
        }
        cooccurrenceMap.get(key)!.push(product);
      }
    }
  });
  
  // 转换为数组并去重
  const cooccurrences: TagCooccurrence[] = [];
  
  cooccurrenceMap.forEach((products, key) => {
    const [tag1, tag2] = key.split('|');
    
    // 去重
    const uniqueProducts = Array.from(
      new Map(products.map(p => [p.app_name, p])).values()
    );
    
    cooccurrences.push({
      tag1,
      tag2,
      count: uniqueProducts.length,
      products: uniqueProducts
    });
  });
  
  // 按共现次数降序排序
  return cooccurrences.sort((a, b) => b.count - a.count);
}

/**
 * 获取热门标签组合（按不同维度）
 */
export function getTopTagCombinations(
  combinations: TagCombination[],
  sortBy: 'products' | 'traffic' | 'growth' = 'products',
  limit: number = 10
): TagCombination[] {
  const sorted = [...combinations];
  
  switch (sortBy) {
    case 'traffic':
      sorted.sort((a, b) => b.totalVisits - a.totalVisits);
      break;
    case 'growth':
      sorted.sort((a, b) => b.avgGrowthRate - a.avgGrowthRate);
      break;
    case 'products':
    default:
      sorted.sort((a, b) => b.productCount - a.productCount);
      break;
  }
  
  return sorted.slice(0, limit);
}

/**
 * 查找包含特定标签的所有组合
 */
export function findCombinationsWithTag(
  combinations: TagCombination[],
  tag: string
): TagCombination[] {
  return combinations.filter(combo => combo.tags.includes(tag));
}

