import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Espaço Ane - Agenda de Atendimento",
  description: "Sistema de agendamento mensal do Espaço Ane - Especialista em alisamentos e Método Liso Espelhado em Pelotas, RS.",
  keywords: ["Espaço Ane", "agenda", "cabeleireira", "alisamento", "liso espelhado", "Pelotas"],
  authors: [{ name: "Espaço Ane" }],
  icons: {
    icon: "https://via.placeholder.com/32?text=AH",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
