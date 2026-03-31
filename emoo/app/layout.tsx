import type { Metadata } from "next";
import { K2D } from "next/font/google";
import "./globals.css";
import CartProvider from "./components/CartProvider";

import GlobalPopupProvider from "./components/GlobalPopupProvider";

const k2d = K2D({
  subsets: ["latin", "thai"],
  weight: ["100","200","300","400","500","600","700","800"],
});

export const metadata: Metadata = {
  title: "EMOO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={k2d.className}>
        <CartProvider>
          <GlobalPopupProvider>
            {children}
          </GlobalPopupProvider>
        </CartProvider>
      </body>
    </html>
  );
}