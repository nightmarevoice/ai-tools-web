# 埋点追踪系统文档

## 概述

本项目已集成完整的埋点追踪系统，支持：
- **Vercel Analytics**: 自动追踪页面访问和自定义事件
- **自定义事件追踪**: 支持发送到自定义分析端点
- **用户行为追踪**: 追踪搜索、点击、导航等用户行为

## 核心文件

### 1. 埋点工具库 (`lib/analytics/tracking.ts`)

提供核心追踪函数：

```typescript
// 追踪页面访问
trackPageView({ path: '/dashboard', locale: 'zh' })

// 追踪用户操作
trackUserAction('click', { element: 'button', elementId: 'search-btn' })

// 追踪搜索
trackSearch('AI tools', { mode: 'chat', resultsCount: 10 })

// 追踪工具交互
trackToolInteraction(123, 'ChatGPT', 'view', { category: 'AI Assistant' })

// 追踪导航
trackNavigation('/dashboard', '/home')

// 追踪认证
trackAuth('login', 'google')
trackAuth('logout')

// 追踪错误
trackError(new Error('API Error'), { context: 'search' })

// 追踪下载
trackDownload('report.pdf', 'pdf')

// 追踪分享
trackShare('twitter', 'Check out this AI tool!')
```

### 2. React Hooks (`hooks/useTracking.ts`)

提供便捷的 React Hook：

```typescript
import { useTracking, usePageTracking } from '@/hooks/useTracking'

function MyComponent() {
  // 自动追踪页面访问
  usePageTracking()
  
  // 获取追踪方法
  const { track, trackSearch, trackTool, trackNav, trackAuth } = useTracking()
  
  const handleClick = () => {
    track({
      category: 'user_action',
      action: 'click',
      label: 'Submit Button',
    })
  }
  
  return <button onClick={handleClick}>Submit</button>
}
```

### 3. Analytics Provider (`components/analytics-provider.tsx`)

已在 `app/[locale]/layout.tsx` 中集成，自动初始化埋点系统。

## 已集成的追踪点

### 页面访问追踪
- ✅ 所有页面自动追踪（通过 Vercel Analytics）
- ✅ 工具详情页查看追踪 (`ToolPageTracker`)

### 搜索追踪
- ✅ 首页搜索栏搜索 (`DemoSearchBar`)
- ✅ 热门搜索点击
- ✅ 搜索模式切换（Chat/Agent）

### 工具交互追踪
- ✅ 工具卡片点击 (`ToolCard`)
- ✅ 工具详情页查看 (`ToolPageTracker`)
- ✅ 访问工具官网

### 导航追踪
- ✅ 导航栏链接点击 (`Navbar`)
- ✅ 语言切换 (`Navbar`)

### 认证追踪
- ✅ 登录（密码/Google OAuth）(`useAuth`, `LoginPage`)
- ✅ 登出 (`useAuth`)

## 环境变量配置

可选：配置自定义分析端点

```env
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://your-analytics-api.com/events
```

## 事件类型

### EventCategory
- `page_view`: 页面访问
- `user_action`: 用户操作
- `search`: 搜索
- `tool_interaction`: 工具交互
- `navigation`: 导航
- `authentication`: 认证
- `download`: 下载
- `share`: 分享
- `error`: 错误

### EventAction
- `view`: 查看
- `click`: 点击
- `search`: 搜索
- `filter`: 筛选
- `sort`: 排序
- `download`: 下载
- `share`: 分享
- `login`: 登录
- `logout`: 登出
- `signup`: 注册
- `view_tool`: 查看工具
- `visit_website`: 访问网站
- `view_alternatives`: 查看替代方案
- `change_language`: 切换语言
- `change_theme`: 切换主题
- `upload_file`: 上传文件
- `submit_form`: 提交表单
- `error_occurred`: 发生错误

## 使用示例

### 在组件中添加追踪

```typescript
'use client'

import { useTracking } from '@/hooks/useTracking'

export function MyComponent() {
  const { track, trackAction } = useTracking()
  
  const handleButtonClick = () => {
    trackAction('click', {
      element: 'button',
      elementId: 'my-button',
      elementText: 'Submit',
    })
  }
  
  return <button onClick={handleButtonClick}>Submit</button>
}
```

### 追踪表单提交

```typescript
const handleSubmit = async (data: FormData) => {
  try {
    await submitForm(data)
    track({
      category: 'user_action',
      action: 'submit_form',
      label: 'Contact Form',
      value: 1,
    })
  } catch (error) {
    trackError(error, { context: 'form_submit' })
  }
}
```

### 追踪文件上传

```typescript
const handleFileUpload = (file: File) => {
  track({
    category: 'user_action',
    action: 'upload_file',
    label: file.name,
    fileType: file.type,
    fileSize: file.size,
  })
}
```

## Vercel Analytics 查看

1. 登录 Vercel Dashboard
2. 选择项目
3. 进入 Analytics 标签页
4. 查看页面访问和自定义事件数据

## 注意事项

1. **隐私保护**: 所有追踪都遵循隐私保护原则，不收集敏感信息
2. **性能影响**: 追踪代码经过优化，对性能影响最小
3. **错误处理**: 追踪失败不会影响用户体验，错误会被静默处理
4. **浏览器兼容**: 支持所有现代浏览器，旧版浏览器会优雅降级

## 扩展追踪

如需添加新的追踪点，请：

1. 在 `lib/analytics/tracking.ts` 中添加新的追踪函数（如需要）
2. 在组件中使用 `useTracking` Hook
3. 更新本文档说明新的追踪点

