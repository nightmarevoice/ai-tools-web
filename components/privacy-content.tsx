'use client'

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export function PrivacyContent() {
  const date = new Date().toISOString().slice(0, 10)
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-8 md:py-12">
          <div className="mx-auto w-full sm:max-w-3xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
              <p className="mt-2 text-sm text-muted-foreground">Effective Date: {date}</p>
              <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground">
                <p>
                  我们重视您的隐私并致力于保护您的个人信息。本政策说明我们如何在您使用本网站时收集、使用与保护信息。
                </p>
                <div>
                  <h2 className="text-base font-semibold text-foreground">1. 我们收集的信息</h2>
                  <ul className="mt-2 list-disc pl-6 space-y-1">
                    <li>您在站内填写的内容（如搜索词）</li>
                    <li>站点使用数据（例如浏览器、语言偏好、页面访问等）</li>
                    <li>为分析与防滥用可能生成的匿名访问标识</li>
                  </ul>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">2. 信息的使用方式</h2>
                  <ul className="mt-2 list-disc pl-6 space-y-1">
                    <li>提供与改进站点功能与搜索结果</li>
                    <li>进行安全性与性能监测</li>
                    <li>在征得同意或法律允许范围内进行统计分析</li>
                  </ul>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">3. Cookie 与本地存储</h2>
                  <p className="mt-2">
                    我们可能使用 Cookie 与本地存储以保存语言偏好、会话信息与匿名标识。您可在浏览器中管理或禁用 Cookie，但某些功能可能受限。
                  </p>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">4. 数据共享</h2>
                  <p className="mt-2">
                    我们不会出售您的个人信息。仅在提供服务所必需、履行法律义务或获得您的同意时，才会与受信任的第三方服务提供商共享必要信息。
                  </p>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">5. 数据安全与保留</h2>
                  <p className="mt-2">
                    我们采取合理措施保护数据安全，并在达成收集目的所需的期限内保留数据，除非法律要求更长的保存期限。
                  </p>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">6. 您的权利</h2>
                  <p className="mt-2">
                    依据适用法律，您可能拥有访问、更正、删除或限制处理您的个人信息等权利。请通过下方联系方式与我们沟通您的请求。
                  </p>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">7. 联系我们</h2>
                  <p className="mt-2">
                    如对本政策或隐私实践有任何问题与建议，请通过邮箱与我们联系：<span className="text-foreground font-medium">support@example.com</span>
                  </p>
                </div>
                <p className="text-xs">
                  本页面为通用示例文本，具体细则请根据您的实际业务、所在法域与法律顾问建议进行完善。
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

