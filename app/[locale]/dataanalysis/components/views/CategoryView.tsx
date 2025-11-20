import { useMemo } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { getTopGrowingProductsInCategory } from '../../../../../utils/analytics';
import { formatVisits, calculateGrowthRate } from '../../../../../utils/dataParser';
import { Product } from '../../../../../types';
import { X, TrendingUp, Users, BarChart3, ExternalLink } from 'lucide-react';

export const CategoryView: React.FC = () => {
  const { selectedCategory, categoryStats, setSelectedCategory, setSelectedProduct } =
    useDataStore();

  const categoryData = useMemo(() => {
    if (!selectedCategory) return null;
    return categoryStats.find((cat) => cat.name === selectedCategory);
  }, [selectedCategory, categoryStats]);

  const topProducts = useMemo(() => {
    if (!categoryData) return [];
    return getTopGrowingProductsInCategory(
      categoryData.products,
      selectedCategory!,
      10
    );
  }, [categoryData, selectedCategory]);

  if (!selectedCategory || !categoryData) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">请从其他视图选择一个类目以查看详情</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 类目头部 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{selectedCategory}</h2>
          <button
            onClick={() => setSelectedCategory(null)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 类目统计 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatItem
            icon={<BarChart3 className="w-5 h-5" />}
            label="产品数量"
            value={categoryData.productCount.toString()}
            color="text-blue-600"
          />
          <StatItem
            icon={<Users className="w-5 h-5" />}
            label="总访问量"
            value={formatVisits(categoryData.totalVisits)}
            color="text-green-600"
          />
          <StatItem
            icon={<Users className="w-5 h-5" />}
            label="平均访问量"
            value={formatVisits(categoryData.avgVisits)}
            color="text-purple-600"
          />
          <StatItem
            icon={<TrendingUp className="w-5 h-5" />}
            label="平均增长率"
            value={`${categoryData.growthRate.toFixed(2)}%`}
            color={categoryData.growthRate > 0 ? 'text-green-600' : 'text-red-600'}
          />
        </div>
      </div>

      {/* 产品列表 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">🚀 类目内高增长产品</h3>
        <div className="space-y-4">
          {topProducts.map((item, index) => {
            const product = categoryData.products.find(
              (p) => p.app_name === item.app_name
            );
            if (!product) return null;

            return (
              <ProductCard
                key={product.app_name}
                product={product}
                rank={index + 1}
                growthRate={item.growthRate}
                onClick={() => setSelectedProduct(product)}
              />
            );
          })}
        </div>
      </div>

      {/* 所有产品表格 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">📊 所有产品列表</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  产品名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  访问量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  增长率
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  排名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  跳出率
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryData.products
                .sort((a, b) => b.monthly_visits - a.monthly_visits)
                .map((product) => (
                  <tr
                    key={product.app_name}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.app_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatVisits(product.monthly_visits)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-semibold ${
                          calculateGrowthRate(product.trend_data) > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {calculateGrowthRate(product.trend_data).toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{product.category_rank || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.bounce_rate}%
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

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, color }) => {
  return (
    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
      <div className={color}>{icon}</div>
      <div>
        <p className="text-xs text-gray-600">{label}</p>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
      </div>
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  rank: number;
  growthRate: number;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, rank, growthRate, onClick }) => {
  return (
    <div
      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-3">
          <span className="text-2xl font-bold text-gray-300">#{rank}</span>
          <div>
            <h4 className="font-semibold text-lg">{product.app_name}</h4>
            <a
              href={product.official_website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center space-x-1"
              onClick={(e) => e.stopPropagation()}
            >
              <span>访问官网</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">增长率</p>
          <p
            className={`text-xl font-bold ${
              growthRate > 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {growthRate > 0 ? '+' : ''}
            {growthRate.toFixed(2)}%
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
        {product.product_description}
      </p>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>访问量: {formatVisits(product.monthly_visits)}</span>
        <span>排名: #{product.category_rank || 'N/A'}</span>
      </div>
    </div>
  );
};

