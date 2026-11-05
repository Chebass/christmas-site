import type { Metadata, Viewport } from "next";
import { Fraunces, Kalam, Inter, Playfair_Display } from "next/font/google";
import Snow from "@/components/Snow";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
const caveat = Kalam({ variable: "--font-caveat", subsets: ["latin"], weight: ["300", "400", "700"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], style: ["italic"] });
const inter = Inter({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nuestra Navidad",
  description: "Nuestras listas de deseos y cartas para esta Navidad.",
};

export const viewport: Viewport = {
  themeColor: "#0b1a1c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${caveat.variable} ${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col">
        <Snow />
        <div className="relative z-10 flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
