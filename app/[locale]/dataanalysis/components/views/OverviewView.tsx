import { useMemo } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { CategoryDistributionChart } from '../charts/CategoryDistributionChart';
import { ProductTrendChart } from '../charts/ProductTrendChart';
import { getTopProducts, getTopGrowingProducts } from '@/utils/analytics';
import { formatVisits, calculateGrowthRate } from '@/utils/dataParser';
import { TrendingUp, TrendingDown, Users, BarChart3 } from 'lucide-react';

export const OverviewView: React.FC = () => {
  const { products, categoryStats, setSelectedCategory, setSelectedProduct } = useDataStore();

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalVisits = products.reduce((sum, p) => sum + p.monthly_visits, 0);
    const avgGrowth = products.reduce((sum, p) => sum + calculateGrowthRate(p.trend_data), 0) / products.length;
    const totalCategories = categoryStats.length;

    return {
      totalProducts,
      totalVisits,
      avgGrowth,
      totalCategories,
    };
  }, [products, categoryStats]);

  const topProducts = useMemo(() => getTopProducts(products, 10), [products]);
  const topGrowingProducts = useMemo(() => getTopGrowingProducts(products, 10), [products]);

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BarChart3 className="w-6 h-6" />}
          title="总产品数"
          value={stats.totalProducts.toString()}
          color="bg-blue-500"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          title="总访问量"
          value={formatVisits(stats.totalVisits)}
          color="bg-green-500"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="平均增长率"
          value={`${stats.avgGrowth.toFixed(2)}%`}
          color="bg-purple-500"
        />
        <StatCard
          icon={<BarChart3 className="w-6 h-6" />}
          title="类目数量"
          value={stats.totalCategories.toString()}
          color="bg-orange-500"
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <CategoryDistributionChart
            data={categoryStats}
            onCategoryClick={setSelectedCategory}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <ProductTrendChart products={topProducts.slice(0, 5)} />
        </div>
      </div>

      {/* Top 产品列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">🏆 Top 10 访问量产品</h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div
                key={product.app_name}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-400">{index + 1}</span>
                  <div>
                    <p className="font-medium">{product.app_name}</p>
                    <p className="text-sm text-gray-500">{product.categories[0]}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">{formatVisits(product.monthly_visits)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">🚀 Top 10 增长产品</h3>
          <div className="space-y-3">
            {topGrowingProducts.map((item, index) => (
              <div
                key={item.app_name}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-400">{index + 1}</span>
                  <div>
                    <p className="font-medium">{item.app_name}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.trendDirection === 'up' ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <span
                    className={`font-semibold ${
                      item.growthRate > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {item.growthRate.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
};

