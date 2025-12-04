import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

/**
 * 检查截图并下载到本地
 */
export async function POST(request: NextRequest) {
  try {
    const { url, appId } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: '缺少图片 URL' },
        { status: 400 }
      )
    }

    // 确保 public/image 目录存在
    const imageDir = path.join(process.cwd(), 'public', 'image')
    try {
      await fs.access(imageDir)
    } catch {
      // 目录不存在，创建它
      await fs.mkdir(imageDir, { recursive: true })
    }

    // 生成文件名（使用 appId 或 URL 的哈希值）
    const urlObj = new URL(url)
    const ext = path.extname(urlObj.pathname) || '.jpg'
    const filename = appId
      ? `app-${appId}${ext}`
      : `screenshot-${Date.now()}${ext}`
    const filePath = path.join(imageDir, filename)

    // 下载图片
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // 检查 Content-Type 是否为图片
      const contentType = response.headers.get('content-type')
      if (contentType && !contentType.startsWith('image/')) {
        throw new Error(`不是图片类型: ${contentType}`)
      }

      // 读取响应数据
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // 保存到本地
      await fs.writeFile(filePath, buffer)

      // 获取文件大小
      const stats = await fs.stat(filePath)
      const sizeKB = stats.size / 1024

      // 返回结果
      return NextResponse.json({
        success: true,
        size: stats.size,
        sizeKB: sizeKB,
        filePath: `/image/${filename}`,
        localPath: filePath,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          throw new Error('下载超时')
        }
        throw fetchError
      }
      throw new Error('下载失败')
    }
  } catch (error) {
    console.error('检查截图失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}

