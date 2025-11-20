'use client'

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useData } from '../../../hooks/useData';
import { useNavigationStack } from '../../../hooks/useNavigationStack';
import { ProcessedProduct } from '../../../types';
import { Overview } from './components/Overview';
import { CategoryAnalysis } from './components/CategoryAnalysis';
import { OpportunityMatrix } from './components/OpportunityMatrix';
import { ProductDetails } from './components/ProductDetails';
import { CategoryDetails } from './components/CategoryDetails';
import { DataDiagnostics } from './components/DataDiagnostics';
import { TagCombinationAnalysis, CombinationDetailModal } from './components/TagCombinationAnalysis';
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
  
            {/* 数据过滤 */}
            <section>
              <DataFilter
                minVisits={minVisits}
                onMinVisitsChange={setMinVisits}
                totalProducts={rawProducts.length}
                filteredProducts={products.length}
                isExpanded={filterExpanded}
                onToggle={() => setFilterExpanded(!filterExpanded)}
              />
            </section>

            {/* 类目分析 */}
            <section>
              <CategoryAnalysis
                products={products}
                onCategoryClick={(category) => openModal('category', category)}
              />
            </section>
  
            {/* 机会发现 */}
            <section>
              <OpportunityMatrix
                products={products}
                onCategoryClick={(category) => openModal('category', category)}
                onProductClick={(product) => openModal('product', product)}
              />
            </section>
  
            {/* 标签组合分析 */}
            <section>
              <TagCombinationAnalysis
                products={products}
                onProductClick={(product) => openModal('product', product)}
                onCombinationClick={(combination) => openModal('tagCombination', combination)}
              />
            </section>
  
            {/* 数据诊断 */}
            <section>
              <DataDiagnostics products={products} />
            </section>
          </div>
  
          {/* 弹窗 - 使用导航历史栈管理 */}
          {currentModal && currentModal.type === 'product' && (
            <ProductDetails
              product={currentModal.data as ProcessedProduct}
              allProducts={products}
              onClose={closeModal}
              onProductClick={(product) => openModal('product', product)}
              canGoBack={canGoBack}
              onGoBack={goBack}
            />
          )}
  
          {currentModal && currentModal.type === 'category' && (
            <CategoryDetails
              category={currentModal.data as string}
              products={products}
              onClose={closeModal}
              onProductClick={(product) => openModal('product', product)}
              canGoBack={canGoBack}
              onGoBack={goBack}
            />
          )}
  
          {currentModal && currentModal.type === 'tagCombination' && (
            <CombinationDetailModal
              combination={currentModal.data as TagCombination}
              onClose={closeModal}
              onProductClick={(product) => openModal('product', product)}
              canGoBack={canGoBack}
              onGoBack={goBack}
            />
          )}

        </div>
      </div>
      <Footer />
    </div>  
    )
}

