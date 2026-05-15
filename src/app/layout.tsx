import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CP PROG | Elite Training Simulator",
  description: "The ultimate competitive programming progression platform. Track your grind, build consistency, and become dangerous.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#060b14] text-[#e2e8f0] font-sans relative">
        {/* Noise Texture Overlay */}
        <div className="noise-overlay" aria-hidden="true" />
        
        {/* Scanlines */}
        <div className="scanlines" aria-hidden="true" />
        
        {children}
      </body>
    </html>
  );
}
