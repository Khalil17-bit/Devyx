import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ChatWidget } from "@/components/chat/chat-widget";
import { getCachedSiteSettings } from "@/lib/data/cached-queries";
import {
  spaceGrotesk,
  plusJakartaSans,
  ibmPlexSansArabic,
  jetbrainsMono,
} from "@/lib/fonts";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const [messages, siteSettings] = await Promise.all([
    getMessages(),
    getCachedSiteSettings(),
  ]);
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning
      className={`
        ${spaceGrotesk.variable}
        ${plusJakartaSans.variable}
        ${ibmPlexSansArabic.variable}
        ${jetbrainsMono.variable}
      `}
    >
      <body className="min-h-screen bg-bg-primary text-text-primary antialiased selection:bg-accent-primary selection:text-bg-primary flex flex-col justify-between">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages} locale={locale}>
            <Navbar />
            <div className="flex-1 w-full">
              {children}
            </div>
            <Footer locale={locale} />
            {siteSettings.chatbot_enabled && <ChatWidget />}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
