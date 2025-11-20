"use client"

import { useState, useTransition } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"

export function DashboardFilters() {
  const router = useRouter()
  const [isSearching, startTransition] = useTransition()
  const [userQuery, setUserQuery] = useState("")
  
  const [openSections, setOpenSections] = useState({
    sources: true,
    date: true,
    type: true,
  })

  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userQuery.trim()) return

    // 将查询写入 URL，PaperResults 会自动响应并调用 API
    startTransition(() => {
      router.replace(`/dashboard?q=${encodeURIComponent(userQuery.trim())}`)
    })
  }

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 1, width: "auto" }}
        animate={{
          opacity: isCollapsed ? 0 : 1,
          width: isCollapsed ? 0 : "auto",
        }}
        transition={{ duration: 0.3 }}
        style={{ display: isCollapsed ? "none" : "block" }}
      >
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle>Filters</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsCollapsed(true)}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Collapse filters</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6 px-4 pb-6">
            {/* 搜索输入框 */}
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="search-query">搜索查询</Label>
                <div className="relative">
                  <Input
                    id="search-query"
                    type="text"
                    placeholder="例如：能够生成图像的AI工具"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSearching || !userQuery.trim()}
              >
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>查询中...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <span>查询</span>
                  </div>
                )}
              </Button>
            </form>

            <Separator />
            <Collapsible open={openSections.sources} onOpenChange={() => toggleSection("sources")}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex w-full justify-between p-0 font-medium">
                  工具种类
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.sources ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <Separator className="my-2" />
              <CollapsibleContent className="space-y-2 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="source-arxiv" />
                  <Label htmlFor="source-arxiv">AI writing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="source-pubmed" />
                  <Label htmlFor="source-pubmed">Image generation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="source-ieee" />
                  <Label htmlFor="source-ieee">AI video</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="source-acm" />
                  <Label htmlFor="source-acm">Code generation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="source-springer" />
                  <Label htmlFor="source-springer">AI assistant</Label>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={openSections.date} onOpenChange={() => toggleSection("date")}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex w-full justify-between p-0 font-medium">
                  Date
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.date ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <Separator className="my-2" />
              <CollapsibleContent className="space-y-2 pt-2">
                <RadioGroup defaultValue="all">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="date-all" />
                    <Label htmlFor="date-all">All time</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="year" id="date-year" />
                    <Label htmlFor="date-year">Past year</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="month" id="date-month" />
                    <Label htmlFor="date-month">Past month</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="week" id="date-week" />
                    <Label htmlFor="date-week">Past week</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="date-custom" />
                    <Label htmlFor="date-custom">Custom range</Label>
                  </div>
                </RadioGroup>
              </CollapsibleContent>
            </Collapsible>

           
            <div className="pt-4">
              <Button variant="outline" className="w-full">
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute left-0 top-0"
        >
          <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setIsCollapsed(false)}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Expand filters</span>
          </Button>
        </motion.div>
      )}
    </div>
  )
}
