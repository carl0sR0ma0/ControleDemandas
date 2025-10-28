import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout-wrapper";
import Providers from "@/app/providers"; // ⬅️ adiciona o provider

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Controle de Demandas",
  description: "Sistema de Gestão de Solicitações",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${inter.variable} antialiased`}>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
