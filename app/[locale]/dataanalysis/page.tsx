'use client'

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useData } from '../../../hooks/useData';
import { useNavigationStack } from '../../../hooks/useNavigationStack';
import { Overview } from './components/Overview';
import { CategoryAnalysis } from './components/CategoryAnalysis';
import { DataFilter } from './components/DataFilter';
import { BarChart3, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { TagCombination } from '../../../utils/tagAnalytics';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
/**
 * 数据分析页面
 */
export default function DataAnalysisPage() {
  const t = useTranslations('dataanalysis');
  
  const { products: rawProducts, loading, error, reload } = useData();
  const { currentModal, canGoBack, openModal, closeModal, goBack } = useNavigationStack();
  const [minVisits, setMinVisits] = useState<number>(0); // 最小访问量过滤
  const [filterExpanded, setFilterExpanded] = useState<boolean>(false);

  // 应用数据过滤
  const products = useMemo(() => {
    if (minVisits === 0) return rawProducts;
    return rawProducts.filter(p => p.visitNumber >= minVisits);
  }, [rawProducts, minVisits]);


  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="p-4 md:p-8">
        
        <div className="max-w-[1800px] mx-auto">
          
          <div className="space-y-8">
          
            <section>
              <Overview products={products} />
            </section>
            {/* 类目分析 */}
            <section>
              <CategoryAnalysis
                products={products}
                onCategoryClick={(category) => openModal('category', category)}
              />
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>  
    )
}

