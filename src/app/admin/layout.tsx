import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "../globals.css";

const openSans = Open_Sans({ subsets: ["latin", "latin-ext"], weight: ["400", "600", "700"], variable: "--font-open-sans" });

export const metadata: Metadata = {
  title: { default: "Admin | Tickets 2000", template: "%s | Tickets 2000 admin" },
  robots: { index: false, follow: false },
  icons: { icon: "/assets/front/favicon.ico" },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu" className={openSans.variable}>
      <body className="min-h-screen bg-[#f3f4f6] text-ink">{children}</body>
    </html>
  );
}
