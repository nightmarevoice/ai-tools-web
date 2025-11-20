import { useMemo } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { CategoryGrowthChart } from '../charts/CategoryGrowthChart';
import { getTopGrowingCategories, getTopGrowingProducts } from '@/utils/analytics';
import { formatVisits } from '@/utils/dataParser';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const GrowthView: React.FC = () => {
  const { categoryStats, products, setSelectedCategory } = useDataStore();

  const topGrowingCategories = useMemo(
    () => getTopGrowingCategories(categoryStats, 15),
    [categoryStats]
  );

  const topGrowingProducts = useMemo(
    () => getTopGrowingProducts(products, 20),
    [products]
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">📈 增长趋势分析</h2>
        <CategoryGrowthChart
          data={topGrowingCategories}
          onCategoryClick={setSelectedCategory}
        />
      </div>

      {/* 增长产品详细列表 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">🚀 高速增长产品详情</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  排名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  产品名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类目
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  当前访问量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  增长率
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  趋势
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topGrowingProducts.map((item, index) => (
                <tr key={item.app_name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.app_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatVisits(item.currentVisits)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-semibold ${
                        item.growthRate > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {item.growthRate > 0 ? '+' : ''}
                      {item.growthRate.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.trendDirection === 'up' && (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    )}
                    {item.trendDirection === 'down' && (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                    {item.trendDirection === 'stable' && (
                      <Minus className="w-5 h-5 text-gray-500" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

