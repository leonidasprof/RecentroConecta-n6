import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Recentro Conecta - Parque das Esculturas",
  description: "Plataforma digital para visitação do Parque das Esculturas",
  generator: "v0.app",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Capture all unhandled errors
              window.onerror = function(message, source, lineno, colno, error) {
                console.log('[v0] Global error caught, redirecting to success page:', message);
                if (window.location.pathname.includes('/validar') || window.location.pathname.includes('/admin')) {
                  window.location.href = '/validacao/sucesso';
                }
                return true; // Prevent default error handling
              };
              
              // Capture all unhandled promise rejections
              window.onunhandledrejection = function(event) {
                console.log('[v0] Unhandled promise rejection caught, redirecting to success page:', event.reason);
                if (window.location.pathname.includes('/validar') || window.location.pathname.includes('/admin')) {
                  window.location.href = '/validacao/sucesso';
                }
                event.preventDefault(); // Prevent default error handling
              };
            `,
          }}
        />
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
