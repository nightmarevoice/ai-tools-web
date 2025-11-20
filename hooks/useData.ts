import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Product, ProcessedProduct } from '@/types';
import { processAllProducts } from '@/utils/dataProcessor';

export function useData() {
  const [products, setProducts] = useState<ProcessedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 读取CSV文件
      const response = await fetch('/moge_products_cleaned.csv');
      const csvText = await response.text();

      // 解析CSV
      const parsed = Papa.parse<Product>(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false
      });

      if (parsed.errors.length > 0) {
        console.warn('CSV解析警告:', parsed.errors);
      }

      // 处理数据
      const processed = processAllProducts(parsed.data);
      setProducts(processed);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败');
      console.error('数据加载错误:', err);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, reload: loadData };
}

