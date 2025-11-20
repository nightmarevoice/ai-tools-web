import { create } from 'zustand';
import { Product, CategoryStats, FilterOptions } from '@/types';
import { parseCSVData } from '@/utils/dataParser';
import { aggregateByCategory, filterProducts } from '@/utils/analytics';

interface DataState {
  // 原始数据
  products: Product[];
  categoryStats: CategoryStats[];
  
  // 筛选器
  filters: FilterOptions;
  filteredProducts: Product[];
  
  // UI 状态
  isLoading: boolean;
  error: string | null;
  selectedCategory: string | null;
  selectedProduct: Product | null;
  
  // Actions
  loadData: (csvText: string) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedProduct: (product: Product | null) => void;
  resetFilters: () => void;
}

const defaultFilters: FilterOptions = {
  categories: [],
  minVisits: 0,
  maxVisits: Infinity,
  growthRate: 'all',
  searchTerm: '',
};

export const useDataStore = create<DataState>((set, get) => ({
  products: [],
  categoryStats: [],
  filters: defaultFilters,
  filteredProducts: [],
  isLoading: false,
  error: null,
  selectedCategory: null,
  selectedProduct: null,

  loadData: (csvText: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const products = parseCSVData(csvText);
      const categoryStats = aggregateByCategory(products);
      
      set({
        products,
        categoryStats,
        filteredProducts: products,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '数据加载失败',
        isLoading: false,
      });
    }
  },

  setFilters: (newFilters: Partial<FilterOptions>) => {
    const { products } = get();
    const filters = { ...get().filters, ...newFilters };
    const filteredProducts = filterProducts(products, filters);
    
    set({ filters, filteredProducts });
  },

  setSelectedCategory: (category: string | null) => {
    set({ selectedCategory: category });
  },

  setSelectedProduct: (product: Product | null) => {
    set({ selectedProduct: product });
  },

  resetFilters: () => {
    const { products } = get();
    set({
      filters: defaultFilters,
      filteredProducts: products,
      selectedCategory: null,
    });
  },
}));

