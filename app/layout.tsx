import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BE FABULOUS | Ателье в Antalya",
  description: "Ателье BE FABULOUS: ремонт, подгонка одежды и индивидуальный пошив в Antalya.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
