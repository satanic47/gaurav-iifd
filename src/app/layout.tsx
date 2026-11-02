import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniPost AI - Multi-Client Social Media Automation",
  description: "Automate and schedule social media updates across Facebook, Instagram, YouTube, Pinterest, LinkedIn, and Google Business Profile with AI captions and creatives.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
