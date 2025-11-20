export type ToolItem = {
  id:string;
  name:string;
  icon:string;
  url:string;
  description:string;
}

export type CategorySection = {
  id?:string;
  title: string
  key: string
  svg?: string
  items: ToolItem[]
}

export const CATEGORY_SECTIONS: CategorySection[] = []

export type ToolRecord = {
  slug: string
  name: string
  description?: string
  icon?: string
  categoryKey: string
  categoryTitle: string
  rating?: number
  pricingModel?: string
  website?: string
  previewImage?: string
  links?: {
    twitter?: string
    github?: string
    producthunt?: string
  }
}

export function slugifyToolName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
}

export function getAllTools(): ToolRecord[] {
  const tools: ToolRecord[] = []
  CATEGORY_SECTIONS.forEach((section) => {
    section.items.forEach((item) => {
      tools.push({
        slug: slugifyToolName(item.name),
        name: item.name,
        description: item.description,
        icon: item.icon,
        categoryKey: section.key,
        categoryTitle: section.title,
        
      })
    })
  })
  return tools
}

export function getToolBySlug(slug: string): ToolRecord | undefined {
  return getAllTools().find((t) => t.slug === slug)
}


