import { Barlow, Syne, Syne_Mono } from "next/font/google";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const syneMono = Syne_Mono({
  variable: "--font-syne-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata = {
  title: "STARTMEDIA",
  description: "Soluções integradas em marketing, automação e inteligência artificial.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${barlow.variable} ${syne.variable} ${syneMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}

