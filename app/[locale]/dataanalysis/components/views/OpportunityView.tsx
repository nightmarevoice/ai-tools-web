import { useMemo } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { OpportunityMatrix } from '../charts/OpportunityMatrix';
import { identifyLongTailOpportunities } from '@/utils/analytics';
import { formatVisits, calculateGrowthRate } from '@/utils/dataParser';
import { Target, TrendingUp, Package } from 'lucide-react';

export const OpportunityView: React.FC = () => {
  const { categoryStats, setSelectedCategory } = useDataStore();

  const opportunities = useMemo(
    () => identifyLongTailOpportunities(categoryStats, 20, 10),
    [categoryStats]
  );

  return (
    <div className="space-y-6">
      {/* 机会矩阵 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">🎯 长尾机会矩阵</h2>
          <p className="text-sm text-gray-600">
            识别产品数量少但增长快速的类目,发现潜在市场机会
          </p>
        </div>
        <OpportunityMatrix data={opportunities} onCategoryClick={setSelectedCategory} />
      </div>

      {/* 机会详情列表 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">💡 长尾机会详情</h3>
        <div className="space-y-4">
          {opportunities.map((opp, index) => (
            <OpportunityCard
              key={opp.category}
              opportunity={opp}
              rank={index + 1}
              onCategoryClick={setSelectedCategory}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface OpportunityCardProps {
  opportunity: any;
  rank: number;
  onCategoryClick: (category: string) => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  rank,
  onCategoryClick,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl font-bold text-gray-300">#{rank}</span>
          <div>
            <h4
              className="font-semibold text-lg text-blue-600 hover:underline cursor-pointer"
              onClick={() => onCategoryClick(opportunity.category)}
            >
              {opportunity.category}
            </h4>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <Package className="w-4 h-4" />
                <span>{opportunity.productCount} 个产品</span>
              </span>
              <span className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-green-600 font-semibold">
                  +{opportunity.avgGrowthRate.toFixed(2)}% 平均增长
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
          <Target className="w-4 h-4" />
          <span>机会</span>
        </div>
      </div>

      {/* Top 产品 */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">🚀 高增长产品:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {opportunity.topGrowthProducts.map((product: any) => (
            <div
              key={product.app_name}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <p className="font-medium text-sm mb-1">{product.app_name}</p>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{formatVisits(product.monthly_visits)}</span>
                <span
                  className={`font-semibold ${
                    calculateGrowthRate(product.trend_data) > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {calculateGrowthRate(product.trend_data).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

