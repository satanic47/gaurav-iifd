import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gaurav IIFD - Social Media Automation & AI Creative Suite",
  description: "Automate and schedule social media updates across Facebook, Instagram, YouTube, Pinterest, LinkedIn, and Google Business Profile with AI generative creatives, images, and videos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
