import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LocalMap - Social Travel Circles",
  description: "Curated travel recommendations from your trusted circles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased dark`}>
        <main className="min-h-screen relative overflow-hidden bg-black text-white selection:bg-blue-500/30">
          {/* Background Grid/Gradient for texture */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,112,243,0.15),transparent_70%)]" />
          </div>

          <div className="relative z-10">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
