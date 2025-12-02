"use client"

import { createContext, useContext, ReactNode } from "react"

interface CategoryContextValue {
  parentCategoryId?: string | number
  categoryId?: string | number
  parentCategorySlug?: string
  categorySlug?: string
}

const CategoryContext = createContext<CategoryContextValue | undefined>(undefined)

export function CategoryProvider({
  parentCategoryId,
  categoryId,
  parentCategorySlug,
  categorySlug,
  children,
}: {
  parentCategoryId?: string | number
  categoryId?: string | number
  parentCategorySlug?: string
  categorySlug?: string
  children: ReactNode
}) {
  return (
    <CategoryContext.Provider value={{ 
      parentCategoryId, 
      categoryId,
      parentCategorySlug,
      categorySlug
    }}>
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategoryContext() {
  return useContext(CategoryContext)
}

