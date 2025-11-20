import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from './Card';
import { ProcessedProduct } from '../../../../types';
import { calculateCategoryStats } from '../../../../utils/analytics';
import { formatGrowthRate, formatNumber } from '../../../../utils/dataProcessor';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

interface DataDiagnosticsProps {
  products: ProcessedProduct[];
}

export const DataDiagnostics: React.FC<DataDiagnosticsProps> = ({ products }) => {
  const t = useTranslations('dataanalysis.dataDiagnostics');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const categoryStats = calculateCategoryStats(products);
  
  // 统计分析
  const totalCategories = categoryStats.length;
  const smallCategories = categoryStats.filter(c => c.productCount <= 50).length;
  const mediumCategories = categoryStats.filter(c => c.productCount > 50 && c.productCount <= 100).length;
  const largeCategories = categoryStats.filter(c => c.productCount > 100).length;
  
  const highGrowthCategories = categoryStats.filter(c => c.avgGrowthRate >= 10).length;
  const mediumGrowthCategories = categoryStats.filter(c => c.avgGrowthRate >= 5 && c.avgGrowthRate < 10).length;
  const lowGrowthCategories = categoryStats.filter(c => c.avgGrowthRate >= 0 && c.avgGrowthRate < 5).length;
  const negativeGrowthCategories = categoryStats.filter(c => c.avgGrowthRate < 0).length;
  
  // 机会类目（小规模 + 高增长）
  const opportunityCount = categoryStats.filter(
    c => c.productCount <= 50 && c.avgGrowthRate >= 10
  ).length;
  
  // Top 5 增长最快的小类目
  const topOpportunities = categoryStats
    .filter(c => c.productCount <= 100)
    .sort((a, b) => b.avgGrowthRate - a.avgGrowthRate)
    .slice(0, 5);

  return (
    <Card 
      title={t('title')} 
      subtitle={t('subtitle')}
      action={
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-sm text-primary hover:text-primary/80"
        >
          {isExpanded ? (
            <>
              <span>{t('collapse')}</span>
              <ChevronUp className="w-4 h-4 ml-1" />
            </>
          ) : (
            <>
              <span>{t('expand')}</span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      }
    >
      {/* 简要概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-primary/10 p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground mb-1">{t('totalCategories')}</p>
          <p className="text-2xl font-bold text-foreground">{totalCategories}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground mb-1">{t('highGrowthCategories')}</p>
          <p className="text-2xl font-bold text-green-600">{highGrowthCategories}</p>
          <p className="text-xs text-muted-foreground">{t('growthRateGreaterThan10')}</p>
        </div>
        <div className="bg-secondary p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground mb-1">{t('smallCategories')}</p>
          <p className="text-2xl font-bold text-primary">{smallCategories}</p>
          <p className="text-xs text-muted-foreground">{t('productCountLessThan50')}</p>
        </div>
        <div className="bg-accent p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground mb-1">{t('opportunityCategories')}</p>
          <p className="text-2xl font-bold text-primary">{opportunityCount}</p>
          <p className="text-xs text-muted-foreground">{t('smallAndHighGrowth')}</p>
        </div>
      </div>

      {/* 详细分析 */}
      {isExpanded && (
        <div className="space-y-6 mt-6 pt-6 border-t">
          {/* 规模分布 */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center">
              <Info className="w-4 h-4 mr-2 text-primary" />
              {t('categorySizeDistribution')}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground w-32">{t('small')}</span>
                <div className="flex-1 bg-muted rounded-full h-6 relative">
                  <div 
                    className="bg-primary h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(smallCategories / totalCategories * 100)}%` }}
                  >
                    <span className="text-xs text-primary-foreground font-medium">{smallCategories}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground w-32">{t('medium')}</span>
                <div className="flex-1 bg-muted rounded-full h-6 relative">
                  <div 
                    className="bg-primary/80 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(mediumCategories / totalCategories * 100)}%` }}
                  >
                    <span className="text-xs text-primary-foreground font-medium">{mediumCategories}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground w-32">{t('large')}</span>
                <div className="flex-1 bg-muted rounded-full h-6 relative">
                  <div 
                    className="bg-muted-foreground h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(largeCategories / totalCategories * 100)}%` }}
                  >
                    <span className="text-xs text-foreground font-medium">{largeCategories}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 增长率分布 */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center">
              <Info className="w-4 h-4 mr-2 text-green-600" />
              {t('growthRateDistribution')}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground w-32">{t('highGrowth')}</span>
                <div className="flex-1 bg-muted rounded-full h-6 relative">
                  <div 
                    className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(highGrowthCategories / totalCategories * 100)}%` }}
                  >
                    <span className="text-xs text-white font-medium">{highGrowthCategories}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground w-32">{t('mediumGrowth')}</span>
                <div className="flex-1 bg-muted rounded-full h-6 relative">
                  <div 
                    className="bg-yellow-500 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(mediumGrowthCategories / totalCategories * 100)}%` }}
                  >
                    <span className="text-xs text-white font-medium">{mediumGrowthCategories}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground w-32">{t('lowGrowth')}</span>
                <div className="flex-1 bg-muted rounded-full h-6 relative">
                  <div 
                    className="bg-orange-500 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(lowGrowthCategories / totalCategories * 100)}%` }}
                  >
                    <span className="text-xs text-white font-medium">{lowGrowthCategories}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground w-32">{t('negativeGrowth')}</span>
                <div className="flex-1 bg-muted rounded-full h-6 relative">
                  <div 
                    className="bg-red-500 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(negativeGrowthCategories / totalCategories * 100)}%` }}
                  >
                    <span className="text-xs text-white font-medium">{negativeGrowthCategories}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top机会类目 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Info className="w-4 h-4 mr-2 text-purple-600" />
              {t('top5Potential')}
            </h4>
            <div className="space-y-2">
              {topOpportunities.map((cat, idx) => (
                <div key={cat.category} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                  <div className="flex items-center flex-1">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center mr-3 font-bold">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{cat.category}</p>
                      <p className="text-xs text-muted-foreground">{t('productCount')}: {cat.productCount}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${cat.avgGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatGrowthRate(cat.avgGrowthRate)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatNumber(cat.totalVisits)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 诊断建议 */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2">{t('diagnosticSuggestions')}</h4>
            <ul className="space-y-1 text-sm text-foreground/80">
              {opportunityCount === 0 && (
                <li>• {t('noOpportunities')}</li>
              )}
              {highGrowthCategories === 0 && (
                <li>• {t('noHighGrowth')}</li>
              )}
              {smallCategories === 0 && (
                <li>• {t('noSmallCategories')}</li>
              )}
              {topOpportunities.length > 0 && (
                <li>• {t('topOpportunitiesHint')}</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
};

