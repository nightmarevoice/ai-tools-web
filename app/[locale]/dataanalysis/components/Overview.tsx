import React from 'react';
import { useTranslations } from 'next-intl';
import { StatsCard } from './Card';
import { ProcessedProduct } from '../../../../types';
import { calculateOverallStats } from '../../../../utils/analytics';
import { formatNumber, formatDuration, formatGrowthRate } from '../../../../utils/dataProcessor';
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react';

interface OverviewProps {
  products: ProcessedProduct[];
}

export const Overview: React.FC<OverviewProps> = ({ products }) => {
  const t = useTranslations('dataanalysis.overview');
  const stats = calculateOverallStats(products);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title={t('totalProducts')}
        value={stats.totalProducts}
        icon={<BarChart3 className="w-8 h-8 text-primary" />}
      />
      
      <StatsCard
        title={t('totalVisits')}
        value={formatNumber(stats.totalVisits)}
        icon={<Users className="w-8 h-8 text-primary" />}
        trend={{
          value: stats.avgGrowthRate,
          isPositive: stats.avgGrowthRate >= 0
        }}
      />
      
      <StatsCard
        title={t('avgGrowthRate')}
        value={formatGrowthRate(stats.avgGrowthRate)}
        icon={<TrendingUp className="w-8 h-8 text-primary" />}
        trend={{
          value: stats.avgGrowthRate,
          isPositive: stats.avgGrowthRate >= 0
        }}
      />
      
      <StatsCard
        title={t('totalCategories')}
        value={stats.totalCategories}
        icon={<Target className="w-8 h-8 text-primary" />}
      />
    </div>
  );
};

