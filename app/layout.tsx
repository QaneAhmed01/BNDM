import "./globals.css";
import type { Metadata } from "next";
import ConvexClientProvider from "@/components/ConvexClientProvider";

export const metadata: Metadata = {
  title: "Preglife · Baby Name Tournament",
  description:
    "Let friends and family cheer on your favourite baby names in a playful tournament-style reveal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full font-display bg-gradient-to-b from-preg-peach/60 via-white to-preg-peach/80">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
