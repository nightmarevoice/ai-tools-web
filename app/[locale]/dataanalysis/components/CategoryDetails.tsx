import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from './Card';
import { DataTable, Column } from './DataTable';
import { ProcessedProduct } from '../../../../types';
import { formatNumber, formatGrowthRate, formatDuration } from '../../../../utils/dataProcessor';
import { X, TrendingUp, Users, Clock, ExternalLink, Tag, ArrowUp, ArrowDown, ArrowLeft } from 'lucide-react';

interface CategoryDetailsProps {
  category: string;
  products: ProcessedProduct[];
  onClose: () => void;
  onProductClick?: (product: ProcessedProduct) => void;
  canGoBack?: boolean;
  onGoBack?: () => void;
}

interface TagCount {
  tag: string;
  count: number;
  percentage: number;
}

export const CategoryDetails: React.FC<CategoryDetailsProps> = ({
  category,
  products,
  onClose,
  onProductClick,
  canGoBack = false,
  onGoBack
}) => {
  const t = useTranslations('dataanalysis.categoryDetails');
  const categoryProducts = products.filter(p => 
    p.categoryList.includes(category)
  );

  // 计算类目统计
  const totalVisits = categoryProducts.reduce((sum, p) => sum + p.visitNumber, 0);
  const avgGrowthRate = categoryProducts.reduce((sum, p) => sum + p.avgGrowthRate, 0) / categoryProducts.length;
  const avgDuration = categoryProducts.reduce((sum, p) => sum + p.durationSeconds, 0) / categoryProducts.length;

  // 分析关联标签
  const { positiveGrowthTags, negativeGrowthTags } = useMemo(() => {
    // 增长率为正的产品
    const positiveProducts = categoryProducts.filter(p => p.avgGrowthRate > 0);
    // 增长率为负的产品
    const negativeProducts = categoryProducts.filter(p => p.avgGrowthRate < 0);

    const analyzeOtherTags = (productList: ProcessedProduct[]): TagCount[] => {
      const tagCountMap = new Map<string, number>();
      
      productList.forEach(product => {
        // 获取除了当前类目标签外的其他标签
        const otherTags = product.categoryList.filter(tag => tag !== category);
        otherTags.forEach(tag => {
          tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1);
        });
      });

      // 转换为数组并排序
      const tagCounts: TagCount[] = Array.from(tagCountMap.entries())
        .map(([tag, count]) => ({
          tag,
          count,
          percentage: (count / productList.length) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3); // 取前3

      return tagCounts;
    };

    return {
      positiveGrowthTags: analyzeOtherTags(positiveProducts),
      negativeGrowthTags: analyzeOtherTags(negativeProducts)
    };
  }, [categoryProducts, category]);

  const columns: Column<ProcessedProduct>[] = [
    {
      key: 'app_name',
      title: t('productName'),
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center">
          <span className="font-medium text-primary hover:underline cursor-pointer">
            {value}
          </span>
          <a 
            href={row.official_website}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-muted-foreground hover:text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )
    },
    {
      key: 'visitNumber',
      title: t('monthlyVisits'),
      sortable: true,
      render: (value) => (
        <span className="font-medium">{formatNumber(value)}</span>
      )
    },
    {
      key: 'avgGrowthRate',
      title: t('avgGrowthRate'),
      sortable: true,
      render: (value) => (
        <span className={`font-medium ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatGrowthRate(value)}
        </span>
      )
    },
    {
      key: 'durationSeconds',
      title: t('visitDuration'),
      sortable: true,
      render: (value) => formatDuration(value)
    },
    {
      key: 'bounceNumber',
      title: t('bounceRate'),
      sortable: true,
      render: (value) => `${value.toFixed(2)}%`
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto border">
        {/* Header */}
        <div className="sticky top-0 bg-primary text-primary-foreground p-6 rounded-t-2xl z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4">{category}</h2>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm">{t('productCount')}</span>
                  </div>
                  <p className="text-2xl font-bold">{categoryProducts.length}</p>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    <span className="text-sm">{t('avgGrowthRate')}</span>
                  </div>
                  <p className="text-2xl font-bold">{formatGrowthRate(avgGrowthRate)}</p>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">{t('avgDuration')}</span>
                  </div>
                  <p className="text-2xl font-bold">{formatDuration(avgDuration)}</p>
                </div>
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
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 关联标签分析 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 增长率为正的产品的关联标签 */}
            <Card 
              title={t('growingProductsTags')} 
              subtitle={t('top3RelatedCategories', { category })}
            >
              <div className="space-y-4">
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <div className="flex items-center mb-2">
                    <ArrowUp className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-green-900">
                      {t('positiveGrowthTagsDesc')}
                    </h4>
                  </div>
                  <p className="text-sm text-green-800">
                    {t('positiveGrowthTagsHint', { category })}
                  </p>
                </div>

                {positiveGrowthTags.length > 0 ? (
                  <div className="space-y-3">
                    {positiveGrowthTags.map((tagCount, idx) => (
                      <div 
                        key={tagCount.tag}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200 hover:border-green-400 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold mr-3">
                              #{idx + 1}
                            </span>
                            <div className="flex items-center">
                              <Tag className="w-4 h-4 text-green-600 mr-2" />
                              <span className="font-semibold text-foreground">
                                {tagCount.tag}
                              </span>
                            </div>
                          </div>
                          <span className="text-2xl font-bold text-green-600">
                            {tagCount.count}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(tagCount.percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground min-w-[60px] text-right">
                            {tagCount.percentage.toFixed(1)}%
                          </span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          {t('inGrowingProducts', { 
                            count: categoryProducts.filter(p => p.avgGrowthRate > 0).length,
                            tagCount: tagCount.count 
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('noGrowingProducts')}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* 增长率为负的产品的关联标签 */}
            <Card 
              title={t('decliningProductsTags')} 
              subtitle={t('top3RelatedCategories', { category })}
            >
              <div className="space-y-4">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-center mb-2">
                    <ArrowDown className="w-5 h-5 text-red-600 mr-2" />
                    <h4 className="font-semibold text-red-900">
                      {t('negativeGrowthTagsDesc')}
                    </h4>
                  </div>
                  <p className="text-sm text-red-800">
                    {t('negativeGrowthTagsHint', { category })}
                  </p>
                </div>

                {negativeGrowthTags.length > 0 ? (
                  <div className="space-y-3">
                    {negativeGrowthTags.map((tagCount, idx) => (
                      <div 
                        key={tagCount.tag}
                        className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border-2 border-red-200 hover:border-red-400 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold mr-3">
                              #{idx + 1}
                            </span>
                            <div className="flex items-center">
                              <Tag className="w-4 h-4 text-red-600 mr-2" />
                              <span className="font-semibold text-foreground">
                                {tagCount.tag}
                              </span>
                            </div>
                          </div>
                          <span className="text-2xl font-bold text-red-600">
                            {tagCount.count}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(tagCount.percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground min-w-[60px] text-right">
                            {tagCount.percentage.toFixed(1)}%
                          </span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          {t('inDecliningProducts', { 
                            count: categoryProducts.filter(p => p.avgGrowthRate < 0).length,
                            tagCount: tagCount.count 
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('noDecliningProducts')}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* 产品列表 */}
          <Card title={t('allProducts')} subtitle={t('totalProducts', { count: categoryProducts.length })}>
            <DataTable
              data={categoryProducts}
              columns={columns}
              onRowClick={onProductClick}
              keyExtractor={(row) => row.app_name}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

