import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "b7-suplementos.raul-soliveiraa.chatgpt.site";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;
  return {
    title: "B7 Suplementos | Resultado não é acaso",
    description: "Suplementação, avaliação corporal e acompanhamento personalizado em uma única experiência.",
    icons: { icon: "/favicon.svg" },
    openGraph: {
      title: "B7 Suplementos | Resultado não é acaso",
      description: "Loja, avaliação corporal, alimentação e treino personalizado.",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: "B7 Suplementos — Resultado não é acaso." }],
    },
    twitter: {
      card: "summary_large_image",
      title: "B7 Suplementos | Resultado não é acaso",
      description: "Performance, método e evolução.",
      images: [image],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
