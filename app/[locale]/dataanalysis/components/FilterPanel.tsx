import { useState, useMemo } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { Search, X, Filter, Download } from 'lucide-react';

export const FilterPanel: React.FC = () => {
  const { categoryStats, filters, setFilters, resetFilters } = useDataStore();
  const [searchInput, setSearchInput] = useState(filters.searchTerm);
  const [showFilters, setShowFilters] = useState(false);

  const allCategories = useMemo(
    () => categoryStats.map((cat) => cat.name).slice(0, 30),
    [categoryStats]
  );

  const handleSearch = () => {
    setFilters({ searchTerm: searchInput });
  };

  const handleCategoryToggle = (category: string) => {
    const current = filters.categories;
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    setFilters({ categories: updated });
  };

  const handleExport = () => {
    // 导出功能
    alert('导出功能开发中...');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
        {/* 搜索框 */}
        <div className="flex-1 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索产品名称、描述、类目..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  setFilters({ searchTerm: '' });
                }}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* 按钮组 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Filter className="w-5 h-5" />
            <span>筛选</span>
            {filters.categories.length > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                {filters.categories.length}
              </span>
            )}
          </button>

          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download className="w-5 h-5" />
            <span>导出</span>
          </button>

          {(filters.categories.length > 0 || filters.searchTerm) && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              重置
            </button>
          )}
        </div>
      </div>

      {/* 展开的筛选面板 */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="mb-4">
            <h4 className="font-semibold mb-2">类目筛选</h4>
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    filters.categories.includes(category)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最小访问量
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.minVisits || ''}
                onChange={(e) =>
                  setFilters({ minVisits: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大访问量
              </label>
              <input
                type="number"
                placeholder="无限制"
                value={filters.maxVisits === Infinity ? '' : filters.maxVisits}
                onChange={(e) =>
                  setFilters({
                    maxVisits: e.target.value ? Number(e.target.value) : Infinity,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                增长趋势
              </label>
              <select
                value={filters.growthRate}
                onChange={(e) =>
                  setFilters({
                    growthRate: e.target.value as 'all' | 'positive' | 'negative',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部</option>
                <option value="positive">增长</option>
                <option value="negative">下降</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

