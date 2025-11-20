import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "privacy.metadata" })

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default function PrivacyPage() {
  const t = useTranslations("privacy")
  const date = new Date().toISOString().slice(0, 10)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-8 md:py-12">
          <div className="mx-auto w-full sm:max-w-3xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t("title")}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("effectiveDate", { date })}
              </p>
              <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground">
                <p>{t("intro")}</p>

                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {t("section1.title")}
                  </h2>
                  <ul className="mt-2 list-disc pl-6 space-y-1">
                    <li>{t("section1.item1")}</li>
                    <li>{t("section1.item2")}</li>
                    <li>{t("section1.item3")}</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {t("section2.title")}
                  </h2>
                  <ul className="mt-2 list-disc pl-6 space-y-1">
                    <li>{t("section2.item1")}</li>
                    <li>{t("section2.item2")}</li>
                    <li>{t("section2.item3")}</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {t("section3.title")}
                  </h2>
                  <p className="mt-2">{t("section3.content")}</p>
                </div>

                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {t("section4.title")}
                  </h2>
                  <p className="mt-2">{t("section4.content")}</p>
                </div>

                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {t("section5.title")}
                  </h2>
                  <p className="mt-2">{t("section5.content")}</p>
                </div>

                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {t("section6.title")}
                  </h2>
                  <p className="mt-2">{t("section6.content")}</p>
                </div>

                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {t("contact.title")}
                  </h2>
                  <p className="mt-2">
                    {t("contact.description")}{" "}
                    <span className="text-foreground font-medium">
                      {t("contact.email")}
                    </span>
                  </p>
                </div>

                <p className="text-xs">{t("disclaimer")}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

