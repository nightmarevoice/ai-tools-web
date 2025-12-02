"use client"

import { CategoriesContent } from "@/components/categories-content"
import { CategoryProvider } from "@/components/category-context"

interface CategorySlugHandlerProps {
  parentCategorySlug: string
  categorySlug: string
  locale: string
}

export function CategorySlugHandler({ 
  parentCategorySlug, 
  categorySlug,
  locale 
}: CategorySlugHandlerProps) {
  // 直接使用 slug 作为分类标识，通过 Context 传递给子组件
  // CategoriesContent 会根据 slug 来获取和显示对应的分类数据
  return (
    <CategoryProvider
      parentCategorySlug={parentCategorySlug}
      categorySlug={categorySlug}
    >
      <CategoriesContent />
    </CategoryProvider>
  )
}

