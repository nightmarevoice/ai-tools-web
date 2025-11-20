import React from 'react';
import { useTranslations } from 'next-intl';
import { Card } from './Card';
import { ProcessedProduct } from '../../../../types';
import { findOpportunityCategories, calculateCategoryStats } from '../../../../utils/analytics';
import { formatGrowthRate } from '../../../../utils/dataProcessor';
import { Target, TrendingUp, Package } from 'lucide-react';

interface OpportunityMatrixProps {
  products: ProcessedProduct[];
  onCategoryClick?: (category: string) => void;
  onProductClick?: (product: ProcessedProduct) => void;
}

export const OpportunityMatrix: React.FC<OpportunityMatrixProps> = ({ 
  products, 
  onCategoryClick,
  onProductClick 
}) => {
  const t = useTranslations('dataanalysis.opportunityMatrix');
  // 先计算类目统计数据
  const categoryStats = React.useMemo(() => calculateCategoryStats(products), [products]);
  
  // 尝试多个筛选条件，找到合适的机会
  let opportunities = findOpportunityCategories(categoryStats, 100, 5).slice(0, 8);
  
  // 如果没有结果，放宽到增长率 ≥ 0%
  if (opportunities.length === 0) {
    opportunities = findOpportunityCategories(categoryStats, 100, 0).slice(0, 8);
  }
  
  // 如果还是没有结果，显示产品数最少的类目（不考虑增长率）
  if (opportunities.length === 0) {
    opportunities = findOpportunityCategories(categoryStats, 100, -100).slice(0, 8);
  }

  return (
    <Card 
      title={t('title')} 
      subtitle={opportunities.length > 0 
        ? t('subtitle') 
        : t('analyzedCategories', { count: categoryStats.length })}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities.map((opp, index) => (
          <div
            key={opp.category}
            className="relative p-5 bg-primary/5 rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all cursor-pointer hover:shadow-lg"
            onClick={() => onCategoryClick?.(opp.category)}
          >
            {/* 机会分数徽章 */}
            <div className="absolute top-3 right-3">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                {t('score')}: {opp.score.toFixed(0)}
              </div>
            </div>

            <div className="mb-3">
              <h4 className="font-bold text-foreground text-lg mb-2 pr-20">
                {opp.category}
              </h4>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Package className="w-4 h-4 text-primary mr-2" />
                  <span className="text-muted-foreground">{t('productCount')}:</span>
                  <span className="ml-auto font-semibold text-foreground">{opp.productCount}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-muted-foreground">{t('growthRate')}:</span>
                  <span className="ml-auto font-semibold text-green-600">
                    {formatGrowthRate(opp.avgGrowthRate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Top 3 增长产品 */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center">
                <Target className="w-3 h-3 mr-1" />
                {t('highGrowthProducts')}
              </p>
              <div className="space-y-1">
                {opp.topGrowthProducts.slice(0, 3).map((product, idx) => (
                  <div 
                    key={product.app_name} 
                    className="flex items-center text-xs cursor-pointer hover:bg-accent p-1 rounded transition-colors"
                    onClick={(e) => {
                      e.stopPropagation(); // 阻止事件冒泡到父级的类目点击
                      onProductClick?.(product);
                    }}
                  >
                    <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold mr-2">
                      {idx + 1}
                    </span>
                    <span className="text-foreground truncate flex-1 hover:text-primary">
                      {product.app_name}
                    </span>
                    <span className="text-green-600 font-medium ml-2">
                      {formatGrowthRate(product.avgGrowthRate)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {opportunities.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">{t('noOpportunities')}</p>
          <div className="text-sm space-y-1 mt-4">
            <p>{t('analyzedCategories', { count: categoryStats.length })}</p>
            <p>{t('currentFilters')}:</p>
            <ul className="list-disc list-inside mt-2">
              <li>{t('filter1')}</li>
              <li>{t('filter2')}</li>
            </ul>
            <p className="mt-4 text-xs opacity-70">
              {t('hint')}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

