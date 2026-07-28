import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "B7 Suplementos | Evolução é método",
  description: "Suplementos selecionados, orientação profissional e acompanhamento real para sua evolução.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "B7 Suplementos | Evolução é método",
    description: "Suplementos selecionados, orientação profissional e acompanhamento real para sua evolução.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "B7 Suplementos — Evolução não é sorte. É método." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "B7 Suplementos | Evolução é método",
    description: "Performance, ciência e acompanhamento para a sua melhor versão.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
