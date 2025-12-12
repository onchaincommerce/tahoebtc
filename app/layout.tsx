import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tahoe Bitcoin Strategy | Bitcoin Consulting & Self-Custody Solutions",
    template: "%s | Tahoe Bitcoin Strategy"
  },
  description: "Reno/Tahoe based Bitcoin consulting specializing in self-custody, multi-sig security, UTXO management, and node setup. Own your keys, own your Bitcoin.",
  keywords: [
    "Bitcoin consulting",
    "Bitcoin self-custody",
    "multi-sig Bitcoin",
    "Bitcoin node setup",
    "UTXO management",
    "seed phrase recovery",
    "Bitcoin DCA",
    "Reno Bitcoin",
    "Tahoe Bitcoin",
    "cryptocurrency consulting"
  ],
  authors: [{ name: "Tahoe Bitcoin Strategy" }],
  creator: "Tahoe Bitcoin Strategy",
  publisher: "Tahoe Bitcoin Strategy",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.tahoebtcstrategy.com",
    title: "Tahoe Bitcoin Strategy | Bitcoin Consulting & Self-Custody Solutions",
    description: "Reno/Tahoe based Bitcoin consulting specializing in self-custody, multi-sig security, UTXO management, and node setup. Own your keys, own your Bitcoin.",
    siteName: "Tahoe Bitcoin Strategy",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tahoe Bitcoin Strategy - Bitcoin Consulting Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tahoe Bitcoin Strategy | Bitcoin Consulting & Self-Custody Solutions",
    description: "Reno/Tahoe based Bitcoin consulting specializing in self-custody, multi-sig security, UTXO management, and node setup.",
    images: ["/og-image.jpg"],
    creator: "@tahoebtc",
  },
  alternates: {
    canonical: "https://www.tahoebtcstrategy.com",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="canonical" href="https://www.tahoebtcstrategy.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "Tahoe Bitcoin Strategy",
              description: "Bitcoin consulting specializing in self-custody, multi-sig security, and strategic Bitcoin management",
              url: "https://www.tahoebtcstrategy.com",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Reno",
                addressRegion: "Nevada",
                addressCountry: "US"
              },
              areaServed: ["Nevada", "California", "United States"],
              serviceType: ["Bitcoin Consulting", "Cryptocurrency Education", "Self-Custody Solutions"],
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Bitcoin Consulting Services",
                itemListElement: [
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Bitcoin Self-Custody Setup",
                      description: "Secure your Bitcoin in cold storage with zero counter-party risk"
                    }
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Multi-Signature Security",
                      description: "Collaborative custody providing the ultimate form of security"
                    }
                  }
                ]
              }
            })
          }}
        />
      </head>
      <body className={`${inter.variable} ${jetBrainsMono.variable} antialiased font-sans bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
