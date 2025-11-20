import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from './Card';
import { ProcessedProduct } from '../../../../types';
import { 
  analyzeTagCombinations, 
  getTopTagCombinations,
  TagCombination 
} from '../../../../utils/tagAnalytics';
import { formatNumber, formatGrowthRate } from '../../../../utils/dataProcessor';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { TrendingUp, Users, BarChart3, ArrowLeft } from 'lucide-react';

interface TagCombinationAnalysisProps {
  products: ProcessedProduct[];
  onProductClick?: (product: ProcessedProduct) => void;
  onCombinationClick?: (combination: TagCombination) => void;
}

export const TagCombinationAnalysis: React.FC<TagCombinationAnalysisProps> = ({
  products,
  onCombinationClick
}) => {
  const t = useTranslations('dataanalysis.tagCombinationAnalysis');
  const [combinationSize, setCombinationSize] = useState<2 | 3 | 4>(2);
  const [sortBy, setSortBy] = useState<'products' | 'traffic' | 'growth'>('products');
  const [minProducts, setMinProducts] = useState(3);
  
  // 分析标签组合
  const allCombinations = useMemo(() => {
    return analyzeTagCombinations(products, minProducts, combinationSize);
  }, [products, minProducts, combinationSize]);
  
  // 获取Top组合
  const topCombinations = useMemo(() => {
    return getTopTagCombinations(allCombinations, sortBy, 10);
  }, [allCombinations, sortBy]);
  
  const COLORS = [
    '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#84cc16',
    '#eab308', '#f59e0b', '#f97316', '#ef4444', '#ec4899'
  ];

  return (
    <Card 
      title={t('title')} 
      subtitle={t('subtitle', { count: allCombinations.length })}
    >
      <div className="space-y-6">
        
        
        {/* Top 10 标签组合柱状图 */}
        {topCombinations.length > 0 && (
          <div>
            <h4 className="font-semibold text-foreground mb-3">{t('top10Combinations')}</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={topCombinations.map((combo, idx) => ({
                  name: combo.tags.join(' + '),
                  shortName: combo.tags.map(t => t.length > 10 ? t.substring(0, 10) + '...' : t).join('\n+ '),
                  value: sortBy === 'products' ? combo.productCount :
                         sortBy === 'traffic' ? combo.totalVisits :
                         combo.avgGrowthRate,
                  combo
                }))}
                layout="vertical"
                margin={{ left: 150 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="shortName" 
                  type="category" 
                  width={140}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const combo: TagCombination = data.combo;
                      
                      return (
                        <div className="bg-card text-card-foreground p-4 rounded-lg shadow-lg border max-w-xs">
                          <div className="space-y-1 mb-2">
                            {combo.tags.map((tag, idx) => (
                              <div key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded inline-block mr-1">
                                {tag}
                              </div>
                            ))}
                          </div>
                          <div className="space-y-1 text-sm">
                            <p><strong>{t('productCount')}:</strong> {combo.productCount}</p>
                            <p><strong>{t('totalTraffic')}:</strong> {formatNumber(combo.totalVisits)}</p>
                            <p><strong>{t('growthRate')}:</strong> {formatGrowthRate(combo.avgGrowthRate)}</p>
                          </div>
                          <button
                            onClick={() => onCombinationClick?.(combo)}
                            className="mt-2 text-xs text-primary hover:underline"
                          >
                            {t('viewDetails')} →
                          </button>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {topCombinations.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      onClick={() => onCombinationClick?.(entry)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 标签组合卡片列表 */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">{t('popularCombinations')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topCombinations.slice(0, 6).map((combo, idx) => (
              <div
                key={combo.tagKey}
                className="bg-primary/5 rounded-xl p-4 border-2 border-primary/20 hover:border-primary/40 transition-all cursor-pointer hover:shadow-lg"
                onClick={() => onCombinationClick?.(combo)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {combo.tags.map((tag, tagIdx) => (
                        <span
                          key={tagIdx}
                          className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold ml-2">
                    #{idx + 1}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-card rounded p-2 border">
                    <p className="text-xs text-muted-foreground">{t('productCount')}</p>
                    <p className="font-bold text-foreground">{combo.productCount}</p>
                  </div>
                  <div className="bg-card rounded p-2 border">
                    <p className="text-xs text-muted-foreground">{t('totalTraffic')}</p>
                    <p className="font-bold text-foreground">{formatNumber(combo.totalVisits)}</p>
                  </div>
                  <div className="bg-card rounded p-2 border">
                    <p className="text-xs text-muted-foreground">{t('growthRate')}</p>
                    <p className={`font-bold ${combo.avgGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatGrowthRate(combo.avgGrowthRate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

// 组合详情弹窗组件 - 导出供 App.tsx 使用
export interface CombinationDetailModalProps {
  combination: TagCombination;
  onClose: () => void;
  onProductClick?: (product: ProcessedProduct) => void;
  canGoBack?: boolean;
  onGoBack?: () => void;
}

export const CombinationDetailModal: React.FC<CombinationDetailModalProps> = ({
  combination,
  onClose,
  onProductClick,
  canGoBack = false,
  onGoBack
}) => {
  const t = useTranslations('dataanalysis.tagCombinationAnalysis');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border">
        {/* Header */}
        <div className="sticky top-0 bg-primary text-primary-foreground p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3">{t('combinationDetail')}</h3>
              <div className="flex flex-wrap gap-2">
                {combination.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-white bg-opacity-20 px-3 py-1 rounded-lg text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canGoBack && onGoBack && (
                <button
                  onClick={onGoBack}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  title={t('goBack')}
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              )}
              <button
                onClick={onClose}
                className="ml-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                title={t('close')}
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 标签统计分析 */}
          <div className="bg-primary/10 border-l-4 border-primary p-4 rounded">
            <h4 className="font-semibold text-foreground mb-2">{t('whySoManyProducts')}</h4>
            <div className="text-sm text-foreground/80 space-y-2">
              <p>
                {t('combinationExplanation', { count: combination.productCount })}
              </p>
              <div className="bg-card rounded p-3 mt-2 border">
                <p className="font-medium mb-1">{t('productTagDistribution')}</p>
                <ul className="space-y-1 text-xs">
                  {(() => {
                    // 统计产品的平均标签数
                    const avgTagCount = combination.products.reduce((sum, p) => 
                      sum + p.categoryList.length, 0) / combination.products.length;
                    const minTagCount = Math.min(...combination.products.map(p => p.categoryList.length));
                    const maxTagCount = Math.max(...combination.products.map(p => p.categoryList.length));
                    
                    return (
                      <>
                        <li>• {t('avgTagCount', { count: avgTagCount.toFixed(1) })}</li>
                        <li>• {t('minMaxTagCount', { min: minTagCount, max: maxTagCount })}</li>
                        <li>• {t('atLeastTags', { count: combination.tags.length })}</li>
                      </>
                    );
                  })()}
                </ul>
              </div>
              <p className="text-xs text-foreground/70 mt-2">
                {t('commonTagsHint')}
              </p>
            </div>
          </div>

          {/* 统计摘要 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-primary/10 rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground mb-1">{t('productCount')}</p>
              <p className="text-2xl font-bold text-foreground">{combination.productCount}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground mb-1">{t('totalTrafficLabel')}</p>
              <p className="text-2xl font-bold text-foreground">{formatNumber(combination.totalVisits)}</p>
            </div>
            <div className="bg-secondary rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground mb-1">{t('avgGrowthRate')}</p>
              <p className={`text-2xl font-bold ${combination.avgGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatGrowthRate(combination.avgGrowthRate)}
              </p>
            </div>
            <div className="bg-accent rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground mb-1">{t('avgVisits')}</p>
              <p className="text-2xl font-bold text-foreground">{formatNumber(combination.avgVisits)}</p>
            </div>
          </div>

          {/* 趋势图 */}
          {combination.trendData.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">{t('trafficTrend')}</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={combination.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => formatNumber(value)}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="totalVisits" 
                    name={t('totalTrafficLabel')}
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgVisits" 
                    name={t('avgTrafficLabel')}
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 产品列表 */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">{t('includedProducts', { count: combination.productCount })}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {combination.products
                .sort((a, b) => b.avgGrowthRate - a.avgGrowthRate)
                .map(product => (
                  <div
                    key={product.app_name}
                    className="bg-muted/50 rounded-lg p-3 hover:bg-muted transition-colors cursor-pointer border"
                    onClick={() => {
                      onProductClick?.(product);
                    }}
                  >
                    <h5 className="font-medium text-foreground mb-2">{product.app_name}</h5>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">{t('avgVisits')}:</span>
                        <p className="font-medium">{formatNumber(product.visitNumber)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('growthRate')}:</span>
                        <p className={`font-medium ${product.avgGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatGrowthRate(product.avgGrowthRate)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('bounceRate')}:</span>
                        <p className="font-medium">{product.bounceNumber.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

