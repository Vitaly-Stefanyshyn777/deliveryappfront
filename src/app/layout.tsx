import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/QueryProvider";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Delivery App",
  description: "Web application where users can order food delivery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body
        className={`${poppins.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
