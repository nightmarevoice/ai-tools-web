# AI应用管理平台 API 文档

**版本**: 1.2.0
**最后更新**: 2025-01-17
**基础URL**: `http://localhost:8000`

---

## 📋 目录

- [概述](#概述)
- [认证](#认证)
- [全局参数](#全局参数)
- [多语言支持](#多语言支持)
- [用户认证 API](#用户认证-api)
- [API密钥管理 API](#api密钥管理-api)
- [应用管理 API](#应用管理-api)
- [类别管理 API](#类别管理-api)
- [统计分析 API](#统计分析-api)
- [智能搜索 API](#智能搜索-api)
- [查询历史与分析 API](#查询历史与分析-api)
- [错误处理](#错误处理)
- [数据模型](#数据模型)

---

## 概述

AI应用管理平台提供完整的RESTful API,支持AI应用的CRUD操作、统计分析和智能搜索功能。

### 核心特性

- ✅ **完整CRUD**: 应用的创建、查询、更新、删除
- ✅ **多语言支持**: 5种语言的自动本地化 (en, zh, zh-TW, ja, ko)
- ✅ **高级搜索**: 支持多条件组合查询和全文搜索
- ✅ **统计分析**: 总体统计、分类统计、地区统计、趋势分析
- ✅ **智能搜索**: 基于向量的语义搜索
- ✅ **分页查询**: 所有列表接口支持分页

### API风格

- **REST风格**: 使用标准HTTP方法 (GET, POST, PUT, DELETE)
- **JSON格式**: 请求和响应均使用JSON格式
- **统一响应**: 所有响应遵循统一的数据结构

---

## 认证

平台提供两种认证方式:

### 1. 用户认证 (Bearer Token)

适用于前端应用,用户通过邮箱密码或OTP登录后获得JWT令牌。

**认证流程**:
1. 用户注册/登录获取access_token
2. 在请求头中携带: `Authorization: Bearer <access_token>`
3. 系统验证令牌并识别用户身份

**适用接口**: 需要用户身份的接口(如个人信息、查询历史等)

### 2. API密钥认证 (API Key)

适用于服务端对服务端调用,通过API密钥进行认证。

**认证流程**:
1. 用户登录后创建API密钥(获得key_id和secret_key)
2. 在请求头中携带: `X-API-Key: <key_id>` 和 `X-API-Secret: <secret_key>`
3. 系统验证密钥并检查权限作用域

**适用接口**: 所有受保护的API接口,基于scopes控制访问权限

**权限作用域**:
- `apps:read` - 查看应用信息
- `apps:write` - 创建/修改应用
- `stats:read` - 查看统计数据
- `query_history:read` - 查看查询历史
- `api_keys:read` - 查看API密钥
- `api_keys:write` - 管理API密钥

---

## 全局参数

### 分页参数

所有列表类接口支持以下分页参数:

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | integer | 1 | 页码,从1开始 |
| `limit` | integer | 20 | 每页记录数,最大100 |

### 排序参数

| 参数 | 类型 | 可选值 | 说明 |
|------|------|--------|------|
| `sort` | string | `created_at`, `monthly_visits`, `app_name` | 排序字段 |
| `order` | string | `asc`, `desc` | 排序方向 |

---

## 多语言支持

### 🌍 语言检测机制

所有 `/apps` 和 `/categories` 接口默认支持多语言,语言检测优先级:

1. **Query 参数** (最高优先级): `?lang=zh`
2. **Accept-Language Header**: 浏览器自动发送的语言偏好
3. **默认语言**: `en` (英文)

### 支持的语言

| 代码 | 语言 | 原生名称 |
|------|------|----------|
| `en` | English | English |
| `zh` | Chinese Simplified | 简体中文 |
| `zh-TW` | Chinese Traditional | 繁體中文 |
| `ja` | Japanese | 日本語 |
| `ko` | Korean | 한국어 |

### 语言回退机制

当请求的语言翻译不存在时,自动按以下链回退:

```
zh-CN → zh → en
zh-TW → zh → en
ja-JP → ja → en
ko-KR → ko → en
```

### 使用示例

```bash
# 方式1: 使用 Query 参数
curl "http://localhost:8000/apps?lang=zh"

# 方式2: 使用 Accept-Language Header
curl -H "Accept-Language: zh-CN,zh;q=0.9,en;q=0.8" \
  "http://localhost:8000/apps"

# 方式3: 默认英文
curl "http://localhost:8000/apps"
```

---

## 用户认证 API

### 1. 用户注册

使用邮箱和密码注册新用户。

**接口**: `POST /auth/signup`

**请求体**:

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "user_metadata": {
    "company": "Example Corp"
  }
}
```

**参数说明**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `email` | string | 是 | 用户邮箱地址 |
| `password` | string | 是 | 密码,至少6个字符 |
| `name` | string | 否 | 用户显示名称 |
| `user_metadata` | object | 否 | 额外的用户元数据 |

**响应示例**:

```json
{
  "user": {
    "id": 1,
    "supabase_id": "uuid-string",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "status": "active",
    "created_at": "2025-01-16T10:00:00",
    "last_login_at": null
  },
  "session": {
    "access_token": "eyJhbGc...",
    "token_type": "bearer",
    "expires_in": 3600,
    "refresh_token": "refresh_token_string"
  },
  "message": "User registered successfully"
}
```

---

### 2. 用户登录（密码）

使用邮箱和密码登录。

**接口**: `POST /auth/signin`

**请求体**:

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**响应**: 与注册接口相同,返回用户信息和会话令牌

**示例请求**:

```bash
curl -X POST "http://localhost:8000/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

---

### 3. 用户登录（魔法链接/OTP）

发送魔法链接或OTP到用户邮箱进行免密登录。

**接口**: `POST /auth/signin/otp`

**请求体**:

```json
{
  "email": "user@example.com"
}
```

**响应示例**:

```json
{
  "message": "OTP sent successfully. Please check your email."
}
```

---

### 4. 用户登出

登出当前用户会话。

**接口**: `POST /auth/signout`

**请求头**:
- `Authorization: Bearer <access_token>`

**响应示例**:

```json
{
  "message": "Signed out successfully"
}
```

---

### 5. 获取当前用户信息

获取当前登录用户的详细信息。

**接口**: `GET /auth/me`

**请求头**:
- `Authorization: Bearer <access_token>`

**响应示例**:

```json
{
  "id": 1,
  "supabase_id": "uuid-string",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "status": "active",
  "created_at": "2025-01-16T10:00:00",
  "last_login_at": "2025-01-16T15:30:00"
}
```

---

### 6. 更新当前用户信息

更新当前登录用户的个人信息。

**接口**: `PUT /auth/me`

**请求头**:
- `Authorization: Bearer <access_token>`

**请求体**:

```json
{
  "name": "John Smith",
  "status": "active"
}
```

**响应**: 返回更新后的用户信息

---

### 7. 删除当前用户

软删除当前登录用户的账号。

**接口**: `DELETE /auth/me`

**请求头**:
- `Authorization: Bearer <access_token>`

**响应示例**:

```json
{
  "message": "User account deleted successfully"
}
```

---

### 8. 获取用户信息（管理员）

根据用户ID获取用户信息(需要管理员权限)。

**接口**: `GET /auth/users/{user_id}`

**Path参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `user_id` | integer | 是 | 用户ID |

**请求头**:
- `Authorization: Bearer <access_token>`

**响应**: 返回指定用户的详细信息

---

## API密钥管理 API

### 1. 创建API密钥

为当前用户创建新的API密钥。

**接口**: `POST /auth/api-keys`

**请求头**:
- `Authorization: Bearer <access_token>`

**请求体**:

```json
{
  "scopes": ["apps:read", "stats:read"],
  "description": "生产环境API密钥",
  "expires_days": 365
}
```

**参数说明**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `scopes` | array | 是 | 权限作用域列表 |
| `description` | string | 否 | 密钥描述 |
| `expires_days` | integer | 否 | 过期天数(1-3650) |

**响应示例**:

```json
{
  "id": 1,
  "user_id": 1,
  "key_id": "ak_1234567890abcdef",
  "secret_key": "sk_abcdef1234567890abcdef1234567890",
  "scopes": ["apps:read", "stats:read"],
  "status": "active",
  "description": "生产环境API密钥",
  "created_at": "2025-01-16T10:00:00",
  "last_used_at": null,
  "expires_at": "2026-01-16T10:00:00",
  "is_active": true
}
```

**⚠️ 重要**: `secret_key` 仅在创建时返回一次,请妥善保管!

---

### 2. 列出API密钥

列出当前用户的所有API密钥。

**接口**: `GET /auth/api-keys`

**请求头**:
- `Authorization: Bearer <access_token>`

**Query参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `include_deleted` | boolean | 否 | 是否包含已删除的密钥,默认false |

**响应示例**:

```json
[
  {
    "id": 1,
    "user_id": 1,
    "key_id": "ak_1234567890abcdef",
    "scopes": ["apps:read", "stats:read"],
    "status": "active",
    "description": "生产环境API密钥",
    "created_at": "2025-01-16T10:00:00",
    "last_used_at": "2025-01-16T15:30:00",
    "expires_at": "2026-01-16T10:00:00",
    "is_active": true
  }
]
```

---

### 3. 获取API密钥详情

获取指定API密钥的详细信息。

**接口**: `GET /auth/api-keys/{key_id}`

**Path参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `key_id` | string | 是 | API密钥ID |

**请求头**:
- `Authorization: Bearer <access_token>`

**响应**: 返回API密钥详细信息(不包含secret_key)

---

### 4. 更新API密钥

更新API密钥的描述、作用域或状态。

**接口**: `PUT /auth/api-keys/{key_id}`

**Path参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `key_id` | string | 是 | API密钥ID |

**请求头**:
- `Authorization: Bearer <access_token>`

**请求体**:

```json
{
  "description": "更新后的描述",
  "scopes": ["apps:read", "apps:write"],
  "status": "active"
}
```

**响应**: 返回更新后的API密钥信息

---

### 5. 撤销API密钥

立即撤销API密钥,使其无法再使用。

**接口**: `POST /auth/api-keys/{key_id}/revoke`

**Path参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `key_id` | string | 是 | API密钥ID |

**请求头**:
- `Authorization: Bearer <access_token>`

**响应示例**:

```json
{
  "message": "API key revoked successfully: ak_1234567890abcdef"
}
```

---

### 6. 轮换API密钥

创建新密钥并撤销旧密钥(用于密钥更新)。

**接口**: `POST /auth/api-keys/{key_id}/rotate`

**Path参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `key_id` | string | 是 | 旧的API密钥ID |

**请求头**:
- `Authorization: Bearer <access_token>`

**响应**: 返回新的API密钥信息(包含secret_key,仅返回一次)

**说明**: 新密钥继承旧密钥的配置,旧密钥自动撤销

---

### 7. 删除API密钥

软删除API密钥。

**接口**: `DELETE /auth/api-keys/{key_id}`

**Path参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `key_id` | string | 是 | API密钥ID |

**请求头**:
- `Authorization: Bearer <access_token>`

**响应示例**:

```json
{
  "message": "API key deleted successfully: ak_1234567890abcdef"
}
```

---

## 应用管理 API

### 1. 查询应用列表

获取应用列表,支持多条件查询和多语言。

**接口**: `GET /apps`

**Query 参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `lang` | string | 否 | 语言代码: en, zh, zh-TW, ja, ko |
| `category` | string | 否 | 分类过滤,例如: ai_assistant |
| `region` | string | 否 | 地区过滤,例如: US, CN |
| `search` | string | 否 | 名称模糊搜索(支持多语言) |
| `sort` | string | 否 | 排序字段: created_at, monthly_visits, app_name |
| `order` | string | 否 | 排序方向: asc, desc |
| `page` | integer | 否 | 页码,默认1 |
| `limit` | integer | 否 | 每页数量,默认20 |

**响应示例**:

```json
{
  "items": [
    {
      "id": 1,
      "app_name": "ChatGPT",
      "url": "https://chat.openai.com",
      "region": "US",
      "categories": ["AI助手"],
      "product_description": "AI对话助手,能够回答问题、编写代码、创作内容等",
      "main_features": "自然语言对话、代码生成、内容创作",
      "monthly_visits": 1500000000,
      "avg_duration_seconds": 420,
      "category_rank": 1,
      "bounce_rate": 0.3245,
      "screenshot_url": "https://example.com/chatgpt.png",
      "icon_url": "https://example.com/icon.png",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00",
      "language": "zh"
    }
  ],
  "total": 6933,
  "page": 1,
  "limit": 20,
  "pages": 347
}
```

**示例请求**:

```bash
# 查询中文的AI助手应用
curl "http://localhost:8000/apps?lang=zh&category=ai_assistant&page=1&limit=10"

# 查询美国地区的应用,按访问量排序
curl "http://localhost:8000/apps?region=US&sort=monthly_visits&order=desc"

# 模糊搜索"ChatGPT"相关应用
curl "http://localhost:8000/apps?search=ChatGPT&lang=en"
```

---

### 2. 获取应用详情

获取单个应用的详细信息,支持多语言。

**接口**: `GET /apps/{app_id}`

**Path 参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `app_id` | integer | 是 | 应用ID |

**Query 参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `lang` | string | 否 | 语言代码: en, zh, zh-TW, ja, ko |

**响应示例**:

```json
{
  "id": 1,
  "app_name": "ChatGPT",
  "url": "https://chat.openai.com",
  "official_website": "https://openai.com",
  "region": "US",
  "categories": ["AI助手"],
  "product_description": "AI对话助手,能够回答问题、编写代码、创作内容等",
  "main_features": "自然语言对话、代码生成、内容创作、多轮对话",
  "monthly_visits": 1500000000,
  "avg_duration_seconds": 420,
  "category_rank": 1,
  "bounce_rate": 0.3245,
  "trend_data": {
    "2024-01": 1200000000,
    "2024-02": 1350000000,
    "2024-03": 1500000000
  },
  "geographic_distribution": {
    "US": 0.35,
    "UK": 0.15,
    "CN": 0.10
  },
  "screenshot_url": "https://example.com/chatgpt.png",
  "icon_url": "https://example.com/icon.png",
  "developer_name": "OpenAI",
  "rating": 4.8,
  "downloads": 50000000,
  "price": 20.0,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-15T10:30:00",
  "language": "zh"
}
```

**示例请求**:

```bash
# 获取中文详情
curl "http://localhost:8000/apps/1?lang=zh"

# 获取日文详情
curl "http://localhost:8000/apps/1?lang=ja"

# 使用 Accept-Language Header
curl -H "Accept-Language: zh-CN,zh;q=0.9" \
  "http://localhost:8000/apps/1"
```

---

### 3. 按分类查询应用

获取指定分类下的所有应用,支持多语言。

**接口**: `GET /apps/category/{category}`

**Path 参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `category` | string | 是 | 分类ID,例如: ai_assistant |

**Query 参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `lang` | string | 否 | 语言代码 |
| `page` | integer | 否 | 页码 |
| `limit` | integer | 否 | 每页数量 |

**响应**: 与查询应用列表相同

**示例请求**:

```bash
# 查询AI助手分类的应用(中文)
curl "http://localhost:8000/apps/category/ai_assistant?lang=zh&page=1&limit=10"

# 查询生产力工具(英文)
curl "http://localhost:8000/apps/category/productivity?lang=en"
```

---

### 4. 创建应用

创建新的AI应用记录。

**接口**: `POST /apps`

**请求体**:

```json
{
  "app_name": "New AI App",
  "url": "https://example.com",
  "official_website": "https://example.com",
  "region": "US",
  "categories": ["ai_assistant", "productivity"],
  "product_description": "A revolutionary AI application",
  "main_features": "Feature 1, Feature 2, Feature 3",
  "monthly_visits": 1000000,
  "avg_duration_seconds": 300,
  "category_rank": 10,
  "bounce_rate": 0.25,
  "screenshot_url": "https://example.com/screenshot.png",
  "icon_url": "https://example.com/icon.png",
  "developer_name": "Example Corp",
  "rating": 4.5,
  "downloads": 100000,
  "price": 9.99
}
```

**响应**: 创建成功返回应用详情

**示例请求**:

```bash
curl -X POST "http://localhost:8000/apps" \
  -H "Content-Type: application/json" \
  -d '{
    "app_name": "New AI App",
    "url": "https://example.com",
    "region": "US",
    "categories": ["ai_assistant"],
    "product_description": "A revolutionary AI application",
    "monthly_visits": 1000000
  }'
```

---

### 5. 更新应用

更新现有应用的信息。

**接口**: `PUT /apps/{app_id}`

**Path 参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `app_id` | integer | 是 | 应用ID |

**请求体**: 与创建应用相同,所有字段都是可选的

**响应**: 更新成功返回应用详情

**示例请求**:

```bash
curl -X PUT "http://localhost:8000/apps/1" \
  -H "Content-Type: application/json" \
  -d '{
    "monthly_visits": 2000000000,
    "rating": 4.9
  }'
```

---

### 6. 删除应用

删除指定的应用(软删除)。

**接口**: `DELETE /apps/{app_id}`

**Path 参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `app_id` | integer | 是 | 应用ID |

**响应**:

```json
{
  "message": "Application deleted successfully"
}
```

**示例请求**:

```bash
curl -X DELETE "http://localhost:8000/apps/1"
```

---

### 7. 获取相似应用

基于分类标签和热度获取与指定应用相似的应用列表。

**接口**: `GET /apps/{app_id}/similar`

**Path 参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `app_id` | integer | 是 | 目标应用ID |

**Query 参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `lang` | string | 否 | 语言代码: en, zh, zh-TW, ja, ko |
| `limit` | integer | 否 | 返回数量,默认10,范围1-50 |

**相似度算法**:

使用 Jaccard 相似系数计算分类标签的重叠度:

```
相似度 = (共同分类数) / (所有分类总数)
similarity_score = |A ∩ B| / |A ∪ B|
```

**排序规则**:
1. 首先按相似度分数降序排序
2. 其次按月访问量降序排序

**响应示例**:

```json
{
  "total": 10,
  "items": [
    {
      "id": 456,
      "app_name": "类似应用名称",
      "product_description": "应用描述(已本地化)",
      "icon_url": "https://example.com/icon.png",
      "categories": ["AI助手", "生产力", "写作"],
      "monthly_visits": 1500000,
      "similarity_score": 0.85
    },
    {
      "id": 789,
      "app_name": "另一个相似应用",
      "product_description": "另一个应用描述",
      "icon_url": "https://example.com/icon2.png",
      "categories": ["AI助手", "生产力"],
      "monthly_visits": 1200000,
      "similarity_score": 0.67
    }
  ]
}
```

**字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `total` | integer | 找到的相似应用总数 |
| `items` | array | 相似应用列表 |
| `id` | integer | 应用ID |
| `app_name` | string | 应用名称(已本地化) |
| `product_description` | string | 产品描述(已本地化) |
| `icon_url` | string | 应用图标URL |
| `categories` | array | 分类标签列表 |
| `monthly_visits` | integer | 月访问量 |
| `similarity_score` | float | 相似度分数(0-1之间) |

**示例请求**:

```bash
# 获取相似应用(中文,前10个)
curl "http://localhost:8000/apps/123/similar?lang=zh&limit=10"

# 获取相似应用(英文,前5个)
curl "http://localhost:8000/apps/123/similar?lang=en&limit=5"

# 使用 Accept-Language Header
curl -H "Accept-Language: ja-JP,ja;q=0.9" \
  "http://localhost:8000/apps/123/similar?limit=10"
```

**错误响应**:

404 - 应用不存在:
```json
{
  "detail": "Application with ID 123 not found"
}
```

400 - 参数错误:
```json
{
  "detail": "Limit must be between 1 and 50"
}
```

**使用场景**:
- 应用详情页的"相似应用推荐"功能
- "你可能也喜欢"推荐列表
- 应用探索和发现功能
- 替代应用推荐

**性能指标**:
- 平均响应时间: ~20ms
- P95响应时间: ~40ms
- 查询优化: PostgreSQL数组运算符 + GIN索引

---

## 类别管理 API

### 1. 获取所有类别

获取所有应用分类,支持多语言本地化。

**接口**: `GET /categories`

**Query 参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `lang` | string | 否 | 语言代码: en, zh, zh-TW, ja, ko |

**响应示例**:

```json
{
  "categories": [
    {
      "id": "ai_assistant",
      "name": "AI助手",
      "description": "AI对话和辅助工具"
    },
    {
      "id": "productivity",
      "name": "生产力",
      "description": "提高工作效率的工具"
    },
    {
      "id": "design",
      "name": "设计",
      "description": "UI/UX设计和创意工具"
    }
  ],
  "total": 30,
  "language": "zh"
}
```

**示例请求**:

```bash
# 获取中文类别列表
curl "http://localhost:8000/categories?lang=zh"

# 获取日文类别列表
curl "http://localhost:8000/categories?lang=ja"

# 使用 Accept-Language Header
curl -H "Accept-Language: ko-KR,ko;q=0.9" \
  "http://localhost:8000/categories"
```

---

### 2. 获取单个类别

获取指定类别的详细信息,支持多语言。

**接口**: `GET /categories/{category_id}`

**Path 参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `category_id` | string | 是 | 分类ID |

**Query 参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `lang` | string | 否 | 语言代码 |

**响应示例**:

```json
{
  "id": "ai_assistant",
  "name": "AI助手",
  "description": "AI对话和辅助工具",
  "language": "zh"
}
```

**示例请求**:

```bash
curl "http://localhost:8000/categories/ai_assistant?lang=zh"
```

---

### 3. 获取类别的所有翻译

获取指定类别在所有支持语言中的翻译。

**接口**: `GET /categories/{category_id}/translations`

**Path 参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `category_id` | string | 是 | 分类ID |

**响应示例**:

```json
{
  "id": "ai_assistant",
  "translations": {
    "en": "AI Assistant",
    "zh": "AI助手",
    "zh-TW": "AI助手",
    "ja": "AIアシスタント",
    "ko": "AI 어시스턴트"
  }
}
```

**示例请求**:

```bash
curl "http://localhost:8000/categories/ai_assistant/translations"
```

---

## 统计分析 API

### 1. 总体统计

获取平台的总体统计数据。

**接口**: `GET /stats/overview`

**响应示例**:

```json
{
  "total_apps": 6933,
  "total_visits": 125000000000,
  "avg_visits_per_app": 18000000,
  "total_categories": 30,
  "active_regions": 150,
  "last_updated": "2024-01-15T10:00:00"
}
```

**示例请求**:

```bash
curl "http://localhost:8000/stats/overview"
```

---

### 2. 分类统计

获取各分类的应用数量和访问统计。

**接口**: `GET /stats/by-category`

**Query 参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `top` | integer | 否 | 返回TOP N分类,默认10 |

**响应示例**:

```json
{
  "categories": [
    {
      "category": "AI助手",
      "app_count": 1250,
      "total_visits": 45000000000,
      "avg_visits": 36000000
    },
    {
      "category": "生产力",
      "app_count": 890,
      "total_visits": 28000000000,
      "avg_visits": 31500000
    }
  ],
  "total_categories": 30
}
```

**示例请求**:

```bash
# 获取TOP 10分类
curl "http://localhost:8000/stats/by-category?top=10"

# 获取所有分类统计
curl "http://localhost:8000/stats/by-category"
```

---

### 3. 地区统计

获取各地区的应用数量和访问统计。

**接口**: `GET /stats/by-region`

**响应示例**:

```json
{
  "regions": [
    {
      "region": "US",
      "app_count": 2450,
      "total_visits": 55000000000,
      "avg_visits": 22500000
    },
    {
      "region": "CN",
      "app_count": 1830,
      "total_visits": 38000000000,
      "avg_visits": 20800000
    }
  ],
  "total_regions": 150
}
```

**示例请求**:

```bash
curl "http://localhost:8000/stats/by-region"
```

---

### 4. 趋势分析

获取平台的时间趋势数据。

**接口**: `GET /stats/trends`

**Query 参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `period` | string | 否 | 时间粒度: day, week, month (默认month) |
| `limit` | integer | 否 | 返回最近N个周期,默认12 |

**响应示例**:

```json
{
  "trends": [
    {
      "period": "2024-01",
      "total_apps": 6500,
      "new_apps": 120,
      "total_visits": 110000000000,
      "avg_visits_per_app": 16900000
    },
    {
      "period": "2024-02",
      "total_apps": 6620,
      "new_apps": 135,
      "total_visits": 115000000000,
      "avg_visits_per_app": 17400000
    }
  ],
  "period": "month",
  "count": 12
}
```

**示例请求**:

```bash
# 获取最近12个月的趋势
curl "http://localhost:8000/stats/trends?period=month&limit=12"

# 获取最近30天的趋势
curl "http://localhost:8000/stats/trends?period=day&limit=30"
```

---

### 5. 热门应用排行

获取访问量最高的应用排行榜。

**接口**: `GET /stats/top-apps`

**Query 参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `metric` | string | 否 | 排序指标: visits, duration, rating (默认visits) |
| `limit` | integer | 否 | 返回TOP N应用,默认10 |

**响应示例**:

```json
{
  "top_apps": [
    {
      "id": 1,
      "app_name": "ChatGPT",
      "monthly_visits": 1500000000,
      "avg_duration_seconds": 420,
      "rating": 4.8,
      "rank": 1
    },
    {
      "id": 2,
      "app_name": "Midjourney",
      "monthly_visits": 850000000,
      "avg_duration_seconds": 380,
      "rating": 4.7,
      "rank": 2
    }
  ],
  "metric": "visits",
  "total": 10
}
```

**示例请求**:

```bash
# 获取访问量TOP 10
curl "http://localhost:8000/stats/top-apps?metric=visits&limit=10"

# 获取评分TOP 20
curl "http://localhost:8000/stats/top-apps?metric=rating&limit=20"
```

---

## 智能搜索 API

### 1. 语义搜索

使用自然语言进行AI应用的语义搜索。

**接口**: `POST /app-search/query`

**请求体**:

```json
{
  "user_query": "能够生成图像的AI工具",
  "region": "中国",
  "enable_llm_summary": true,
  "top_k": 10
}
```

**参数说明**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `user_query` | string | 是 | 用户搜索查询 |
| `region` | string | 否 | 地区过滤 |
| `enable_llm_summary` | boolean | 否 | 是否启用LLM总结,默认false |
| `top_k` | integer | 否 | 返回结果数量,默认10 |

**响应示例**:

```json
{
  "results": [
    {
      "id": 5,
      "app_name": "Midjourney",
      "product_description": "AI图像生成工具,通过文本描述创建高质量图像",
      "relevance_score": 0.95,
      "url": "https://midjourney.com"
    },
    {
      "id": 12,
      "app_name": "DALL-E 3",
      "product_description": "OpenAI的AI图像生成模型",
      "relevance_score": 0.92,
      "url": "https://openai.com/dall-e-3"
    }
  ],
  "total": 15,
  "query": "能够生成图像的AI工具",
  "llm_summary": "基于您的搜索,以下是几款优秀的AI图像生成工具..."
}
```

**示例请求**:

```bash
curl -X POST "http://localhost:8000/app-search/query" \
  -H "Content-Type: application/json" \
  -d '{
    "user_query": "AI图像识别工具",
    "region": "中国",
    "enable_llm_summary": true,
    "top_k": 10
  }'
```

---

### 2. 健康检查

检查搜索服务的健康状态。

**接口**: `GET /app-search/health`

**响应示例**:

```json
{
  "status": "healthy",
  "vespa_connected": true,
  "embedding_service": "available",
  "timestamp": "2024-01-15T10:30:00"
}
```

**示例请求**:

```bash
curl "http://localhost:8000/app-search/health"
```

---

## 查询历史与分析 API

### 1. 获取我的查询历史

获取当前用户的查询历史记录。

**接口**: `GET /query-history/my-history`

**Query参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `page` | integer | 否 | 页码,默认1 |
| `limit` | integer | 否 | 每页数量,默认20,最大100 |

**请求头**:
- `Authorization: Bearer <access_token>` (需要认证)

**响应示例**:

```json
{
  "items": [
    {
      "id": 1,
      "user_id": 1,
      "session_id": "sess_abc123",
      "user_query": "AI图像生成工具",
      "parsed_query": "image generation AI tools",
      "result_count": 10,
      "top_result_id": 5,
      "latency_ms": 150,
      "status": "success",
      "llm_summary_enabled": true,
      "llm_summary_tokens": 250,
      "created_at": "2025-01-16T10:00:00"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

---

### 2. 获取会话历史

获取指定会话的所有查询记录。

**接口**: `GET /query-history/session/{session_id}`

**Path参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `session_id` | string | 是 | 会话ID |

**响应**: 返回该会话的查询列表,按时间顺序排列

**说明**: 适用于多轮对话跟踪

---

### 3. 获取最近查询

获取系统最近的查询记录。

**接口**: `GET /query-history/recent`

**Query参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `page` | integer | 否 | 页码,默认1 |
| `limit` | integer | 否 | 每页数量,默认100,最大500 |
| `status` | string | 否 | 状态过滤: success, error, degraded |

**响应**: 返回最近查询列表

**说明**: 管理员接口,用于系统监控和调试

---

### 4. 查询分析统计

获取最近N天的查询分析数据。

**接口**: `GET /query-history/analytics`

**Query参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `days` | integer | 否 | 分析天数,默认7,最大365 |
| `user_id` | integer | 否 | 按用户ID过滤 |

**响应示例**:

```json
{
  "total_queries": 1250,
  "successful_queries": 1180,
  "failed_queries": 70,
  "avg_latency_ms": 145.5,
  "avg_result_count": 8.2,
  "total_llm_tokens": 125000,
  "success_rate": 0.944,
  "period_days": 7
}
```

**说明**:
- 总查询数
- 平均延迟
- 成功率
- Token消耗统计

---

### 5. 热门查询

获取最常见的查询内容。

**接口**: `GET /query-history/popular-queries`

**Query参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `days` | integer | 否 | 分析天数,默认7,最大365 |
| `limit` | integer | 否 | 返回数量,默认20,最大100 |

**响应示例**:

```json
[
  {
    "user_query": "AI图像生成工具",
    "query_count": 85,
    "avg_result_count": 10.2,
    "avg_latency_ms": 135.5
  },
  {
    "user_query": "视频编辑软件",
    "query_count": 67,
    "avg_result_count": 9.8,
    "avg_latency_ms": 142.0
  }
]
```

**说明**: 用于理解用户搜索模式和热门话题

---

### 6. 状态分布

获取查询状态的分布情况。

**接口**: `GET /query-history/status-distribution`

**Query参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `days` | integer | 否 | 分析天数,默认7,最大365 |

**响应示例**:

```json
[
  {
    "status": "success",
    "count": 1180,
    "percentage": 94.4
  },
  {
    "status": "error",
    "count": 50,
    "percentage": 4.0
  },
  {
    "status": "degraded",
    "count": 20,
    "percentage": 1.6
  }
]
```

**说明**: 用于系统健康监控和故障率分析

---

### 7. 性能趋势

获取每日性能趋势数据。

**接口**: `GET /query-history/performance-trends`

**Query参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `days` | integer | 否 | 分析天数,默认7,最大365 |

**响应示例**:

```json
[
  {
    "date": "2025-01-16",
    "query_count": 250,
    "avg_latency_ms": 142.5,
    "avg_result_count": 9.2
  },
  {
    "date": "2025-01-15",
    "query_count": 230,
    "avg_latency_ms": 138.0,
    "avg_result_count": 8.8
  }
]
```

**说明**: 时间序列数据,用于:
- 查询量趋势
- 延迟变化
- 结果数量变化
- 性能监控和容量规划

---

### 8. 获取单个查询详情

根据ID获取查询的详细信息。

**接口**: `GET /query-history/{query_id}`

**Path参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `query_id` | integer | 是 | 查询历史ID |

**响应**: 返回单个查询的完整详细信息

**示例请求**:

```bash
curl "http://localhost:8000/query-history/12345"
```

---

## 错误处理

### 错误响应格式

所有错误响应遵循统一格式:

```json
{
  "detail": "错误描述信息"
}
```

### 常见错误码

| 状态码 | 说明 | 示例 |
|--------|------|------|
| 400 | 请求参数错误 | 无效的语言代码 |
| 404 | 资源不存在 | 应用ID不存在 |
| 422 | 请求验证失败 | 必需字段缺失 |
| 500 | 服务器内部错误 | 数据库连接失败 |

### 错误示例

**404 Not Found**:
```json
{
  "detail": "Application with id 99999 not found"
}
```

**400 Bad Request**:
```json
{
  "detail": "Invalid language code: 'fr'. Supported languages: en, zh, zh-TW, ja, ko"
}
```

**422 Validation Error**:
```json
{
  "detail": [
    {
      "loc": ["body", "app_name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## 数据模型

### Application (应用)

完整的应用数据模型:

```typescript
interface Application {
  // 基础信息
  id: number;                    // 应用ID
  app_name: string;              // 应用名称(当前语言)
  url: string;                   // 应用URL(唯一)
  official_website?: string;     // 官方网站
  region: string;                // 地区代码

  // 描述信息
  categories: string[];          // 分类列表(本地化)
  product_description?: string;  // 产品描述(当前语言)
  main_features?: string;        // 主要特性(当前语言)

  // 统计数据
  monthly_visits?: number;       // 月访问量
  avg_duration_seconds?: number; // 平均停留时间(秒)
  category_rank?: number;        // 分类排名
  bounce_rate?: number;          // 跳出率(0-1)

  // 趋势和分布
  trend_data?: Record<string, number>;         // 趋势数据
  geographic_distribution?: Record<string, number>; // 地理分布

  // 媒体资源
  screenshot_url?: string;       // 截图URL
  icon_url?: string;             // 图标URL

  // 开发者信息
  developer_name?: string;       // 开发者名称
  rating?: number;               // 评分(0-5)
  downloads?: number;            // 下载量
  price?: number;                // 价格

  // 元数据
  scrape_time?: string;          // 抓取时间(ISO 8601)
  created_at: string;            // 创建时间(ISO 8601)
  updated_at: string;            // 更新时间(ISO 8601)
  is_deleted: boolean;           // 是否已删除

  // 多语言支持
  language: string;              // 当前响应语言
}
```

### Category (类别)

分类数据模型:

```typescript
interface Category {
  id: string;              // 分类ID(唯一标识符)
  name: string;            // 分类名称(本地化)
  description?: string;    // 分类描述(本地化)
  language?: string;       // 当前语言
}
```

### CategoryTranslations (类别翻译)

类别的所有语言翻译:

```typescript
interface CategoryTranslations {
  id: string;                          // 分类ID
  translations: Record<string, string>; // 语言代码 → 翻译名称
}
```

### ListResponse (列表响应)

标准分页列表响应:

```typescript
interface ListResponse<T> {
  items: T[];          // 数据项数组
  total: number;       // 总记录数
  page: number;        // 当前页码
  limit: number;       // 每页数量
  pages: number;       // 总页数
}
```

---

## 附录

### A. 完整类别列表

平台支持30+个应用分类,以下是主要分类的ID和多语言名称:

| ID | 英文 | 中文 | 日文 | 韩文 |
|----|------|------|------|------|
| `ai_assistant` | AI Assistant | AI助手 | AIアシスタント | AI 어시스턴트 |
| `productivity` | Productivity | 生产力 | 生産性 | 생산성 |
| `design` | Design | 设计 | デザイン | 디자인 |
| `image_generation` | Image Generation | 图像生成 | 画像生成 | 이미지 생성 |
| `video_editing` | Video Editing | 视频编辑 | 動画編集 | 비디오 편집 |
| `code_assistant` | Code Assistant | 代码助手 | コードアシスタント | 코드 어시스턴트 |
| `writing` | Writing | 写作 | ライティング | 글쓰기 |
| `education` | Education | 教育 | 教育 | 교육 |
| `marketing` | Marketing | 营销 | マーケティング | 마케팅 |
| `data_analysis` | Data Analysis | 数据分析 | データ分析 | 데이터 분석 |

完整列表请访问: `GET /categories?lang=zh`

### B. 地区代码

常用地区代码(ISO 3166-1 alpha-2):

- `US` - United States (美国)
- `CN` - China (中国)
- `UK` - United Kingdom (英国)
- `JP` - Japan (日本)
- `KR` - Korea (韩国)
- `DE` - Germany (德国)
- `FR` - France (法国)
- `CA` - Canada (加拿大)
- `AU` - Australia (澳大利亚)
- `global` - Global (全球)

### C. 性能指标

API性能参考指标:

| 接口类型 | 平均响应时间 | P95响应时间 |
|----------|--------------|-------------|
| 列表查询(无搜索) | ~15ms | ~30ms |
| 列表查询(有搜索) | ~25ms | ~50ms |
| 详情查询 | ~8ms | ~15ms |
| 多语言查询 | ~20ms | ~40ms |
| 统计查询 | ~30ms | ~60ms |
| 语义搜索 | ~100ms | ~200ms |

### D. 限流策略

当前版本暂无限流,未来版本将实施:

- 匿名用户: 100 请求/分钟
- 认证用户: 1000 请求/分钟
- 高级用户: 10000 请求/分钟

---

## 联系方式

如有问题或建议,请联系:

- **GitHub Issues**: [AIapp_collection/issues](https://github.com/yourusername/AIapp_collection/issues)
- **Email**: support@example.com
- **API文档更新**: 2025-01-15

---

**文档版本**: 1.2.0
**API版本**: v1
**最后更新**: 2025-01-17

## 更新日志

### v1.2.0 (2025-01-17)
- ✅ 新增相似应用推荐 API (`GET /apps/{app_id}/similar`)
- ✅ Jaccard相似度算法实现
- ✅ 基于分类标签的智能推荐
- ✅ 支持多语言本地化
- ✅ 性能优化(PostgreSQL数组运算符 + GIN索引)

### v1.1.0 (2025-01-16)
- ✅ 新增用户认证 API (8个端点)
- ✅ 新增API密钥管理 API (7个端点)
- ✅ 新增查询历史与分析 API (8个端点)
- ✅ 更新认证机制说明(Bearer Token + API Key)
- ✅ 完善权限作用域说明

### v1.0.0 (2025-01-15)
- 初始版本
- 应用管理 API
- 类别管理 API
- 统计分析 API
- 智能搜索 API
- 多语言支持
