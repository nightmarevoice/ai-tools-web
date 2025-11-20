import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from './Card';
import { ProcessedProduct, CategoryStats } from '../../../../types';
import { 
  calculateCategoryStats, 
  getTopGrowthCategories, 
  getTopTrafficCategories 
} from '../../../../utils/analytics';
import { formatNumber, formatGrowthRate } from '../../../../utils/dataProcessor';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users } from 'lucide-react';

interface CategoryAnalysisProps {
  products: ProcessedProduct[];
  onCategoryClick?: (category: string) => void;
}

export const CategoryAnalysis: React.FC<CategoryAnalysisProps> = ({ 
  products, 
  onCategoryClick 
}) => {
  const t = useTranslations('dataanalysis.categoryAnalysis');
  const [view, setView] = useState<'growth' | 'traffic'>('growth');
  
  const categoryStats = calculateCategoryStats(products);
  const topGrowth = getTopGrowthCategories(categoryStats, 10);
  const topTraffic = getTopTrafficCategories(categoryStats, 10);
  
  const displayData = view === 'growth' ? topGrowth : topTraffic;
  
  const chartData = displayData.map(cat => ({
    name: cat.category.length > 15 ? cat.category.substring(0, 15) + '...' : cat.category,
    fullName: cat.category,
    value: view === 'growth' ? cat.avgGrowthRate : cat.totalVisits,
    productCount: cat.productCount
  }));

  const COLORS = [
    '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#84cc16',
    '#eab308', '#f59e0b', '#f97316', '#ef4444', '#ec4899'
  ];

  return (
    <Card 
      title={t('title')} 
      subtitle={view === 'growth' ? t('sortByGrowth') : t('sortByTraffic')}
      action={
        <div className="flex space-x-2">
          <button
            onClick={() => setView('growth')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'growth'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-1" />
            {t('growthRate')}
          </button>
          <button
            onClick={() => setView('traffic')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'traffic'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Users className="w-4 h-4 inline mr-1" />
            {t('traffic')}
          </button>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={120}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-card text-card-foreground p-4 rounded-lg shadow-lg border">
                    <p className="font-bold text-foreground mb-2">{data.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {view === 'growth' 
                        ? `${t('growthRate')}: ${formatGrowthRate(data.value)}`
                        : `${t('totalTraffic')}: ${formatNumber(data.value)}`
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('productCount')}: {data.productCount}
                    </p>
                    <button
                      onClick={() => onCategoryClick?.(data.fullName)}
                      className="mt-2 text-primary text-sm hover:underline"
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
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* 类目列表 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayData.slice(0, 6).map((cat, index) => (
          <div
            key={cat.category}
            className="p-4 bg-muted/50 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onCategoryClick?.(cat.category)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-foreground flex items-center">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center mr-2">
                  {index + 1}
                </span>
                {cat.category}
              </h4>
              <span className={`text-sm font-semibold ${
                cat.avgGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatGrowthRate(cat.avgGrowthRate)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>{t('productCount')}:</span>
                <span className="font-medium">{cat.productCount}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('totalTraffic')}:</span>
                <span className="font-medium">{formatNumber(cat.totalVisits)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

