import React from 'react';
import { useTranslations } from 'next-intl';
import { Card } from './Card';
import { ProcessedProduct } from '../../../../types';
import { formatNumber, formatDuration, formatGrowthRate } from '../../../../utils/dataProcessor';
import { findSimilarProducts } from '../../../../utils/analytics';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { ExternalLink, TrendingUp, Clock, Target, X, ArrowLeft } from 'lucide-react';

interface ProductDetailsProps {
  product: ProcessedProduct;
  allProducts: ProcessedProduct[];
  onClose: () => void;
  onProductClick?: (product: ProcessedProduct) => void;
  canGoBack?: boolean;
  onGoBack?: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  allProducts,
  onClose,
  onProductClick,
  canGoBack = false,
  onGoBack
}) => {
  const t = useTranslations('dataanalysis.productDetails');
  const similarProducts = findSimilarProducts(product, allProducts, 5);

  // 趋势图数据
  const trendChartData = product.trendDataParsed.map(point => ({
    period: point.period,
    visits: point.value
  }));

  // 地理分布饼图数据
  const geoChartData = product.geoParsed.map(geo => ({
    name: geo.code,
    value: geo.percentage
  }));

  const COLORS = ['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#84cc16', '#eab308'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-card text-card-foreground rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border">
        {/* Header */}
        <div className="sticky top-0 bg-primary text-primary-foreground p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{product.app_name}</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {product.categoryList.slice(0, 5).map(cat => (
                  <span key={cat} className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    {cat}
                  </span>
                ))}
              </div>
              <a 
                href={product.official_website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-white hover:text-gray-200 text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                {t('visitWebsite')}
              </a>
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
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                title={t('close')}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 关键指标 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary/10 p-4 rounded-lg border">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-5 h-5 text-primary mr-2" />
                <span className="text-sm text-muted-foreground">{t('monthlyVisits')}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatNumber(product.visitNumber)}</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-muted-foreground">{t('growthRate')}</span>
              </div>
              <p className={`text-2xl font-bold ${product.avgGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatGrowthRate(product.avgGrowthRate)}
              </p>
            </div>
            
            <div className="bg-secondary p-4 rounded-lg border">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-primary mr-2" />
                <span className="text-sm text-muted-foreground">{t('visitDuration')}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatDuration(product.durationSeconds)}</p>
            </div>
            
            <div className="bg-accent p-4 rounded-lg border">
              <div className="flex items-center mb-2">
                <Target className="w-5 h-5 text-primary mr-2" />
                <span className="text-sm text-muted-foreground">{t('bounceRate')}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{product.bounceNumber.toFixed(2)}%</p>
            </div>
          </div>

          {/* 产品描述 */}
          {product.product_description && (
            <Card title={t('productDescription')}>
              <p className="text-foreground leading-relaxed">{product.product_description}</p>
            </Card>
          )}

          {/* 趋势图和地理分布 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 访问量趋势 */}
            {trendChartData.length > 0 && (
              <Card title={t('visitTrend')}>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => formatNumber(value)}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="visits" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* 地理分布 */}
            {geoChartData.length > 0 && (
              <Card title={t('geographicDistribution')}>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={geoChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {geoChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>

          {/* 相似产品推荐 */}
          {similarProducts.length > 0 && (
            <Card title={t('similarProducts')} subtitle={t('similarProductsSubtitle')}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {similarProducts.map(similar => (
                  <div
                    key={similar.app_name}
                    className="p-4 bg-muted/50 rounded-lg border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => onProductClick?.(similar)}
                  >
                    <h4 className="font-bold text-foreground mb-2">{similar.app_name}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('visits')}:</span>
                        <span className="font-medium">{formatNumber(similar.visitNumber)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('growthRate')}:</span>
                        <span className={`font-medium ${similar.avgGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatGrowthRate(similar.avgGrowthRate)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

